import React from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import HeaderProfile from "./profileComponents/HeaderProfile";
import ProfileInfo from "./profileComponents/ProfileInfo";
import Transfers from "./profileComponents/Transfers";
import Attributes from "./profileComponents/Attributes";
import Titles from "./profileComponents/Titles";
import Awards from "./profileComponents/Awards";
import Colors from "../constants/Colors";
import { useCallback, useContext, useEffect, useLayoutEffect, useMemo, useState } from "react";
import { AppContext } from "../context/AppContext";
import {
  Attribute,
  Award,
  PlayerHistoryResponse,
  PlayerReportsResponse,
  PlayerType,
  ScoutingDecision,
  Title,
  Transfer,
} from "../data/Types";
import { useNavigation } from "expo-router";
import {
  deletePlayer,
  deleteScoutingReport,
  getPlayerHistory,
  getPlayerReports,
  updatePlayer,
  upsertPlayerReport,
} from "../apiServices";
import { useAuth } from "../context/AuthContext";
import { runAuthorizedRequest } from "@/src/utils/runAuthorizedRequest";
import AppBackground from "@/src/components/ui/AppBackground";
import AppSelect from "@/src/components/ui/AppSelect";

type Props = {
  person: PlayerType;
};

type ReportFormState = {
  rating: string;
  decision: ScoutingDecision;
  strengths: string;
  weaknesses: string;
  notes: string;
};

type ProfileTabKey = "overview" | "attributes" | "career" | "scouting" | "history";

const PROFILE_TABS: Array<{
  key: ProfileTabKey;
  label: string;
  icon: React.ComponentProps<typeof Ionicons>["name"];
}> = [
  { key: "overview", label: "Overview", icon: "grid-outline" },
  { key: "attributes", label: "Attributes", icon: "speedometer-outline" },
  { key: "career", label: "Career", icon: "trail-sign-outline" },
  { key: "scouting", label: "Scouting", icon: "clipboard-outline" },
  { key: "history", label: "History", icon: "pulse-outline" },
];

function safeArray<T>(value: unknown): T[] {
  return Array.isArray(value) ? (value as T[]) : [];
}

function normalizePlayer(raw: PlayerType): PlayerType {
  return {
    ...raw,
    playerAttributes: safeArray<Attribute>(raw.playerAttributes),
    transfers: safeArray<Transfer>(raw.transfers),
    titles: safeArray<Title>(raw.titles),
    awards: safeArray<Award>(raw.awards),
  };
}

function formatTimestamp(value: string | undefined) {
  if (!value) return "-";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return "-";
  return parsed.toLocaleString();
}

function toTagList(raw: string) {
  return raw
    .split(",")
    .map((entry) => entry.trim())
    .filter(Boolean);
}

function formatEloDelta(value: number | null | undefined) {
  if (typeof value !== "number" || value === 0) return "0";
  return value > 0 ? `+${value}` : `${value}`;
}

function getDecisionColor(decision: string, isDark: boolean) {
  if (decision === "sign") return isDark ? "#22c55e" : "#15803d";
  if (decision === "reject") return isDark ? "#f87171" : "#dc2626";
  return isDark ? "#22d3ee" : "#0e7490";
}

function SectionSkeleton({ rows = 4, isDark }: { rows?: number; isDark: boolean }) {
  return (
    <View style={styles.skeletonWrap}>
      {Array.from({ length: rows }).map((_, index) => (
        <View
          key={`skeleton-${index}`}
          style={[
            styles.skeletonRow,
            {
              backgroundColor: isDark ? "rgba(140,160,185,0.12)" : "rgba(91,107,127,0.12)",
            },
          ]}
        />
      ))}
    </View>
  );
}

const defaultReportForm: ReportFormState = {
  rating: "7",
  decision: "watch",
  strengths: "",
  weaknesses: "",
  notes: "",
};

const PlayerProfile = ({ person }: Props) => {
  const navigation = useNavigation();
  const { isDark } = useContext(AppContext);
  const { session, isAuthenticated, isAdmin, refreshSession } = useAuth();
  const [isLoading, setLoading] = useState<boolean>(false);
  const [player, setPlayer] = useState<PlayerType>(normalizePlayer(person));
  const [activeTab, setActiveTab] = useState<ProfileTabKey>("overview");
  const [showAllDetails, setShowAllDetails] = useState(false);

  const [reportsData, setReportsData] = useState<PlayerReportsResponse | null>(null);
  const [historyData, setHistoryData] = useState<PlayerHistoryResponse | null>(null);
  const [isLoadingReports, setIsLoadingReports] = useState(false);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [reportForm, setReportForm] = useState<ReportFormState>(defaultReportForm);
  const [isSubmittingReport, setIsSubmittingReport] = useState(false);
  const [isDeletingReport, setIsDeletingReport] = useState(false);
  const playerId = person._id;
  const palette = Colors[isDark ? "dark" : "light"];

  const playerAttributes = safeArray<Attribute>(player.playerAttributes);
  const transfers = safeArray<Transfer>(player.transfers);
  const titles = safeArray<Title>(player.titles);
  const awards = safeArray<Award>(player.awards);

  const ownReport = useMemo(
    () => reportsData?.reports.find((report) => report.userId === session?.id),
    [reportsData?.reports, session?.id],
  );

  const quickStats = useMemo(
    () => [
      {
        icon: "hourglass-outline" as const,
        label: "Age",
        value: typeof player.age === "number" ? `${player.age}` : "-",
      },
      {
        icon: "stats-chart-outline" as const,
        label: "ELO",
        value: typeof player.elo === "number" ? `${player.elo}` : "-",
      },
      {
        icon: "cash-outline" as const,
        label: "Value",
        value: `${player.value || "-"} ${player.currency || ""}`.trim() || "-",
      },
      {
        icon: "navigate-outline" as const,
        label: "Position",
        value: player.position || "-",
      },
    ],
    [player.age, player.elo, player.value, player.currency, player.position],
  );

  const loadScoutingData = useCallback(async () => {
    if (!isAuthenticated || !session) return;

    try {
      setIsLoadingReports(true);
      setIsLoadingHistory(true);
      const [reportsResponse, historyResponse] = await Promise.all([
        runAuthorizedRequest({
          session,
          refreshSession,
          request: (token) => getPlayerReports(token, playerId),
        }),
        runAuthorizedRequest({
          session,
          refreshSession,
          request: (token) => getPlayerHistory(token, playerId, 40),
        }),
      ]);
      setReportsData(reportsResponse);
      setHistoryData(historyResponse);
    } catch (error) {
      console.error(error);
      setReportsData(null);
      setHistoryData(null);
    } finally {
      setIsLoadingReports(false);
      setIsLoadingHistory(false);
    }
  }, [isAuthenticated, session, refreshSession, playerId]);

  useEffect(() => {
    loadScoutingData();
  }, [loadScoutingData]);

  useEffect(() => {
    if (!ownReport) {
      setReportForm(defaultReportForm);
      return;
    }
    setReportForm({
      rating: String(ownReport.rating),
      decision: ownReport.decision,
      strengths: ownReport.strengths.join(", "),
      weaknesses: ownReport.weaknesses.join(", "),
      notes: ownReport.notes || "",
    });
  }, [ownReport]);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <View style={styles.headerActions}>
          {isAdmin ? (
            <Pressable onPress={confirmDelete} disabled={isLoading}>
              <Ionicons name="trash" size={23} color={isDark ? "#fff" : "#000"} />
            </Pressable>
          ) : null}
          {isAuthenticated ? (
            <Pressable onPress={handleUpdate} disabled={isLoading}>
              <Ionicons name="refresh" size={23} color={isDark ? "#fff" : "#000"} />
            </Pressable>
          ) : null}
        </View>
      ),
    });
  }, [navigation, isDark, isAdmin, isAuthenticated, isLoading]);

  const handleUpdate = async () => {
    if (!isAuthenticated || !session) {
      Alert.alert("Login required", "Please login to update a player.");
      return;
    }
    if (isLoading) return;

    try {
      setLoading(true);
      const updated = await runAuthorizedRequest({
        session,
        refreshSession,
        request: (accessToken) => updatePlayer(playerId, accessToken),
      });
      setPlayer(normalizePlayer(updated));
      await loadScoutingData();
    } catch (error) {
      console.error(error);
      const message = error instanceof Error ? error.message : "Update failed";
      Alert.alert("Error", message);
    } finally {
      setLoading(false);
    }
  };

  const confirmDelete = () => {
    Alert.alert("Confirm", "Are you sure you want to delete this player", [
      { text: "Cancel" },
      { text: "Delete", style: "destructive", onPress: handleDelete },
    ]);
  };

  const handleDelete = async () => {
    if (!isAdmin || !session) {
      Alert.alert("Forbidden", "Only admins can delete players.");
      return;
    }

    try {
      await runAuthorizedRequest({
        session,
        refreshSession,
        request: (accessToken) => deletePlayer(playerId, accessToken),
      });
      navigation.goBack();
    } catch (error) {
      console.error(error);
      const message = error instanceof Error ? error.message : "Delete failed";
      Alert.alert("Error", message);
    }
  };

  const handleSaveReport = async () => {
    if (!session) return;
    const rating = Number(reportForm.rating);
    if (!Number.isFinite(rating) || rating < 1 || rating > 10) {
      Alert.alert("Validation", "Rating must be between 1 and 10.");
      return;
    }

    try {
      setIsSubmittingReport(true);
      await runAuthorizedRequest({
        session,
        refreshSession,
        request: (token) =>
          upsertPlayerReport(token, playerId, {
            rating,
            decision: reportForm.decision,
            strengths: toTagList(reportForm.strengths),
            weaknesses: toTagList(reportForm.weaknesses),
            notes: reportForm.notes.trim(),
          }),
      });
      await loadScoutingData();
      Alert.alert("Success", "Scouting report saved.");
    } catch (error) {
      console.error(error);
      const message = error instanceof Error ? error.message : "Failed to save scouting report.";
      Alert.alert("Error", message);
    } finally {
      setIsSubmittingReport(false);
    }
  };

  const handleDeleteOwnReport = async () => {
    if (!session || !ownReport) return;

    Alert.alert("Delete report", "Are you sure you want to delete your scouting report?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            setIsDeletingReport(true);
            await runAuthorizedRequest({
              session,
              refreshSession,
              request: (token) => deleteScoutingReport(token, ownReport._id),
            });
            await loadScoutingData();
            Alert.alert("Success", "Scouting report deleted.");
          } catch (error) {
            console.error(error);
            const message = error instanceof Error ? error.message : "Failed to delete scouting report.";
            Alert.alert("Error", message);
          } finally {
            setIsDeletingReport(false);
          }
        },
      },
    ]);
  };

  const renderOverviewTab = () => (
    <>
      <View style={[styles.sectionCard, { backgroundColor: palette.card, borderColor: palette.border }]}>
        <View style={styles.sectionHeadingRow}>
          <Ionicons name="information-circle-outline" size={17} color={palette.tint} />
          <Text style={[styles.heading, { color: palette.text }]}>Details</Text>
        </View>
        <ProfileInfo player={player} maxItems={showAllDetails ? undefined : 8} />
        <Pressable
          onPress={() => setShowAllDetails((current) => !current)}
          style={[styles.inlineLink, { borderColor: palette.border, backgroundColor: palette.background }]}
        >
          <Ionicons
            name={showAllDetails ? "chevron-up-outline" : "chevron-down-outline"}
            size={14}
            color={palette.tint}
          />
          <Text style={[styles.inlineLinkText, { color: palette.tint }]}>
            {showAllDetails ? "Show fewer details" : "Show all details"}
          </Text>
        </Pressable>
      </View>

      <View style={[styles.overviewHintCard, { backgroundColor: palette.card, borderColor: palette.border }]}>
        <Text style={[styles.overviewHintTitle, { color: palette.text }]}>Player Analysis</Text>
        <Text style={[styles.overviewHintText, { color: palette.notification }]}>
          Use tabs to review attributes, transfer timeline, scouting reports, and full change history.
        </Text>
      </View>
    </>
  );

  const renderScoutingTab = () => (
    <View style={[styles.sectionCard, { backgroundColor: palette.card, borderColor: palette.border }]}>
      <View style={styles.sectionHeadingRow}>
        <Ionicons name="clipboard-outline" size={17} color={palette.tint} />
        <Text style={[styles.heading, { color: palette.text }]}>Scouting Reports</Text>
      </View>

      {isLoadingReports ? (
        <SectionSkeleton rows={5} isDark={isDark} />
      ) : !reportsData ? (
        <Text style={{ color: palette.notification }}>Reports unavailable.</Text>
      ) : (
        <>
          <View style={styles.summaryGrid}>
            <View style={[styles.summaryItem, { borderColor: palette.border, backgroundColor: palette.background }]}>
              <Text style={[styles.summaryLabel, { color: palette.notification }]}>Reports</Text>
              <Text style={[styles.summaryValue, { color: palette.text }]}>
                {reportsData.summary.totalReports || 0}
              </Text>
            </View>
            <View style={[styles.summaryItem, { borderColor: palette.border, backgroundColor: palette.background }]}>
              <Text style={[styles.summaryLabel, { color: palette.notification }]}>Avg rating</Text>
              <Text style={[styles.summaryValue, { color: palette.text }]}>
                {reportsData.summary.averageRating ?? "-"}
              </Text>
            </View>
            <View style={[styles.summaryItem, { borderColor: palette.border, backgroundColor: palette.background }]}>
              <Text style={[styles.summaryLabel, { color: palette.notification }]}>Sign</Text>
              <Text style={[styles.summaryValue, { color: palette.text }]}>
                {reportsData.summary.decisions.sign || 0}
              </Text>
            </View>
            <View style={[styles.summaryItem, { borderColor: palette.border, backgroundColor: palette.background }]}>
              <Text style={[styles.summaryLabel, { color: palette.notification }]}>Reject</Text>
              <Text style={[styles.summaryValue, { color: palette.text }]}>
                {reportsData.summary.decisions.reject || 0}
              </Text>
            </View>
          </View>

          <View style={[styles.formBox, { borderColor: palette.border, backgroundColor: palette.background }]}>
            <Text style={[styles.formTitle, { color: palette.text }]}>Your evaluation</Text>
            <View style={styles.formRow}>
              <TextInput
                value={reportForm.rating}
                onChangeText={(value) => setReportForm((current) => ({ ...current, rating: value }))}
                placeholder="Rating (1-10)"
                keyboardType="number-pad"
                style={[
                  styles.formInput,
                  {
                    color: palette.text,
                    borderColor: palette.border,
                    backgroundColor: palette.card,
                  },
                ]}
                placeholderTextColor={palette.notification}
              />
              <View style={{ flex: 1 }}>
                <AppSelect
                  placeholder="Decision"
                  options={[
                    { value: "watch", label: "Watch" },
                    { value: "sign", label: "Sign" },
                    { value: "reject", label: "Reject" },
                  ]}
                  value={reportForm.decision}
                  onChange={(value) =>
                    setReportForm((current) => ({
                      ...current,
                      decision: value as ScoutingDecision,
                    }))
                  }
                />
              </View>
            </View>
            <TextInput
              value={reportForm.strengths}
              onChangeText={(value) => setReportForm((current) => ({ ...current, strengths: value }))}
              placeholder="Strengths, comma separated"
              style={[
                styles.formInput,
                {
                  color: palette.text,
                  borderColor: palette.border,
                  backgroundColor: palette.card,
                },
              ]}
              placeholderTextColor={palette.notification}
            />
            <TextInput
              value={reportForm.weaknesses}
              onChangeText={(value) => setReportForm((current) => ({ ...current, weaknesses: value }))}
              placeholder="Weaknesses, comma separated"
              style={[
                styles.formInput,
                {
                  color: palette.text,
                  borderColor: palette.border,
                  backgroundColor: palette.card,
                },
              ]}
              placeholderTextColor={palette.notification}
            />
            <TextInput
              value={reportForm.notes}
              onChangeText={(value) => setReportForm((current) => ({ ...current, notes: value }))}
              placeholder="Notes"
              multiline
              numberOfLines={3}
              style={[
                styles.formInput,
                styles.notesInput,
                {
                  color: palette.text,
                  borderColor: palette.border,
                  backgroundColor: palette.card,
                },
              ]}
              placeholderTextColor={palette.notification}
            />
            <View style={styles.actionRow}>
              <Pressable
                disabled={isSubmittingReport}
                onPress={handleSaveReport}
                style={[styles.primaryAction, isSubmittingReport ? styles.disabled : undefined]}
              >
                <Text style={styles.primaryActionText}>
                  {isSubmittingReport ? "Saving..." : "Save report"}
                </Text>
              </Pressable>
              {ownReport ? (
                <Pressable
                  disabled={isDeletingReport}
                  onPress={handleDeleteOwnReport}
                  style={[styles.secondaryDangerAction, isDeletingReport ? styles.disabled : undefined]}
                >
                  <Text style={styles.secondaryDangerActionText}>Delete my report</Text>
                </Pressable>
              ) : null}
            </View>
          </View>

          <View style={styles.reportsList}>
            {reportsData.reports.length === 0 ? (
              <Text style={{ color: palette.notification }}>No scouting reports yet.</Text>
            ) : (
              reportsData.reports.map((report) => (
                <View
                  key={report._id}
                  style={[styles.reportItem, { borderColor: palette.border, backgroundColor: palette.background }]}
                >
                  <Text style={{ color: getDecisionColor(report.decision, isDark), fontWeight: "800" }}>
                    Rating {report.rating}/10 • {report.decision.toUpperCase()}
                  </Text>
                  <Text
                    style={{
                      color: palette.notification,
                      marginTop: 2,
                      fontSize: 12,
                    }}
                  >
                    Updated {formatTimestamp(report.updatedAt)}
                  </Text>
                  <Text
                    style={{
                      color: palette.notification,
                      marginTop: 6,
                    }}
                  >
                    {report.notes || "No notes provided."}
                  </Text>
                </View>
              ))
            )}
          </View>
        </>
      )}
    </View>
  );

  const renderHistoryTab = () => (
    <View style={[styles.sectionCard, { backgroundColor: palette.card, borderColor: palette.border }]}>
      <View style={styles.sectionHeadingRow}>
        <Ionicons name="pulse-outline" size={17} color={palette.tint} />
        <Text style={[styles.heading, { color: palette.text }]}>History & Alerts</Text>
      </View>

      {isLoadingHistory ? (
        <SectionSkeleton rows={6} isDark={isDark} />
      ) : !historyData ? (
        <Text style={{ color: palette.notification }}>Player history unavailable.</Text>
      ) : (
        <>
          <Text style={[styles.formTitle, { color: palette.text }]}>Recent alerts</Text>
          {historyData.alerts.length === 0 ? (
            <Text style={{ color: palette.notification }}>No notable alerts yet.</Text>
          ) : (
            historyData.alerts.map((alert, index) => (
              <View
                key={`${alert.type}-${alert.timestamp}-${index}`}
                style={[
                  styles.alertItem,
                  {
                    backgroundColor:
                      alert.severity === "high"
                        ? "rgba(239,68,68,0.12)"
                        : alert.severity === "medium"
                          ? "rgba(245,158,11,0.12)"
                          : "rgba(8,145,178,0.12)",
                    borderColor:
                      alert.severity === "high"
                        ? "#ef4444"
                        : alert.severity === "medium"
                          ? "#f59e0b"
                          : "#0891b2",
                  },
                ]}
              >
                <Text style={{ color: palette.text, fontWeight: "700" }}>{alert.message}</Text>
                <Text style={{ color: palette.notification, fontSize: 12 }}>
                  {formatTimestamp(alert.timestamp)}
                </Text>
              </View>
            ))
          )}

          <Text style={[styles.formTitle, { color: palette.text, marginTop: 10 }]}>Timeline</Text>
          {historyData.history.length === 0 ? (
            <Text style={{ color: palette.notification }}>No history available.</Text>
          ) : (
            historyData.history.map((entry) => (
              <View
                key={entry._id}
                style={[styles.historyRow, { borderColor: palette.border, backgroundColor: palette.background }]}
              >
                <Text style={{ color: palette.notification, fontSize: 12 }}>
                  {formatTimestamp(entry.timestamp)}
                </Text>
                <Text
                  style={{
                    marginTop: 3,
                    color:
                      (entry.eloDelta || 0) > 0
                        ? "#16a34a"
                        : (entry.eloDelta || 0) < 0
                          ? "#ef4444"
                          : palette.text,
                    fontWeight: "700",
                  }}
                >
                  ELO: {formatEloDelta(entry.eloDelta)}
                </Text>
                <Text style={{ color: palette.notification, marginTop: 2 }}>
                  Value: {entry.valueChanged ? `${entry.oldValue || "-"} -> ${entry.newValue || "-"}` : "-"}
                </Text>
                <Text style={{ color: palette.notification }}>
                  Club: {entry.clubChanged ? `${entry.oldClub || "-"} -> ${entry.newClub || "-"}` : "-"}
                </Text>
              </View>
            ))
          )}
        </>
      )}
    </View>
  );

  const renderContentByTab = () => {
    if (activeTab === "overview") return renderOverviewTab();
    if (activeTab === "attributes") {
      return playerAttributes.length > 0 ? (
        <Attributes attributes={playerAttributes} />
      ) : (
        <View style={[styles.sectionCard, { backgroundColor: palette.card, borderColor: palette.border }]}>
          <Text style={{ color: palette.notification }}>No attributes available.</Text>
        </View>
      );
    }
    if (activeTab === "career") {
      const hasCareerData = transfers.length > 0 || titles.length > 0 || awards.length > 0;
      if (!hasCareerData) {
        return (
          <View style={[styles.sectionCard, { backgroundColor: palette.card, borderColor: palette.border }]}>
            <Text style={{ color: palette.notification }}>No career data available.</Text>
          </View>
        );
      }
      return (
        <>
          {transfers.length > 0 ? <Transfers transfers={transfers} /> : null}
          {titles.length > 0 ? <Titles titles={titles} /> : null}
          {awards.length > 0 ? <Awards awards={awards} /> : null}
        </>
      );
    }
    if (activeTab === "scouting") return renderScoutingTab();
    return renderHistoryTab();
  };

  useEffect(() => {
    if (!isAuthenticated && (activeTab === "scouting" || activeTab === "history")) {
      setActiveTab("overview");
    }
  }, [isAuthenticated, activeTab]);

  if (!player) {
    return (
      <View style={styles.errorBox}>
        <Text style={styles.errorText}>Player not found.</Text>
      </View>
    );
  }

  return (
    <SafeAreaView edges={["left", "right", "bottom"]} style={{ flex: 1, backgroundColor: palette.background }}>
      <AppBackground />
      <ScrollView style={[styles.profilePage, { backgroundColor: palette.background }]}>
        <HeaderProfile player={player} />

        {isLoading ? (
          <View style={[styles.updatingBanner, { borderColor: palette.border, backgroundColor: palette.card }]}>
            <ActivityIndicator size="small" color={palette.tint} />
            <Text style={{ color: palette.notification }}>Updating player data...</Text>
          </View>
        ) : null}

        <View style={styles.quickStatsRow}>
          {quickStats.map((stat) => (
            <View
              key={stat.label}
              style={[styles.quickStatCard, { borderColor: palette.border, backgroundColor: palette.card }]}
            >
              <Ionicons name={stat.icon} size={15} color={palette.tint} />
              <Text style={[styles.quickStatValue, { color: palette.text }]} numberOfLines={1}>
                {stat.value}
              </Text>
              <Text style={[styles.quickStatLabel, { color: palette.notification }]}>{stat.label}</Text>
            </View>
          ))}
        </View>

        <View style={[styles.metaCard, { borderColor: palette.border, backgroundColor: palette.card }]}>
          <View style={styles.metaLabelRow}>
            <Ionicons name="time-outline" size={14} color={palette.tint} />
            <Text style={[styles.metaLabel, { color: palette.notification }]}>Last updated</Text>
          </View>
          <Text style={[styles.metaValue, { color: palette.text }]}>{formatTimestamp(player.timestamp)}</Text>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tabsContainer}
          style={styles.tabsScroll}
        >
          {PROFILE_TABS.map((tab) => {
            const selected = activeTab === tab.key;
            return (
              <Pressable
                key={tab.key}
                onPress={() => setActiveTab(tab.key)}
                style={[
                  styles.tabPill,
                  {
                    borderColor: selected ? palette.tint : palette.border,
                    backgroundColor: selected ? (isDark ? "rgba(34,211,238,0.16)" : "rgba(14,165,165,0.12)") : palette.card,
                  },
                ]}
              >
                <Ionicons
                  name={tab.icon}
                  size={14}
                  color={selected ? palette.tint : palette.notification}
                />
                <Text style={[styles.tabText, { color: selected ? palette.tint : palette.notification }]}>
                  {tab.label}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>

        {renderContentByTab()}
        <View style={{ height: 8 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  profilePage: {
    flex: 1,
    width: "100%",
    paddingTop: 16,
    paddingBottom: 16,
    paddingHorizontal: 15,
  },
  headerActions: {
    flexDirection: "row",
    alignItems: "center",
    columnGap: 8,
  },
  updatingBanner: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 11,
    paddingVertical: 8,
    marginBottom: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  quickStatsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    rowGap: 8,
    marginBottom: 12,
  },
  quickStatCard: {
    width: "48.5%",
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 10,
    gap: 2,
  },
  quickStatValue: {
    fontSize: 15,
    fontWeight: "800",
  },
  quickStatLabel: {
    fontSize: 11,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.3,
  },
  metaCard: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 12,
  },
  metaLabelRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  metaLabel: {
    fontSize: 12,
    fontWeight: "600",
  },
  metaValue: {
    marginTop: 4,
    fontSize: 13,
    fontWeight: "700",
  },
  tabsScroll: {
    marginBottom: 12,
  },
  tabsContainer: {
    gap: 8,
    paddingRight: 6,
  },
  tabPill: {
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 11,
    paddingVertical: 7,
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  tabText: {
    fontSize: 12,
    fontWeight: "700",
  },
  sectionCard: {
    borderWidth: 1,
    borderRadius: 14,
    padding: 12,
    marginBottom: 12,
  },
  sectionHeadingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    marginBottom: 12,
  },
  heading: {
    fontSize: 17,
    fontWeight: "800",
  },
  inlineLink: {
    marginTop: 6,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  inlineLinkText: {
    fontWeight: "700",
    fontSize: 12,
  },
  overviewHintCard: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 12,
  },
  overviewHintTitle: {
    fontSize: 14,
    fontWeight: "800",
  },
  overviewHintText: {
    marginTop: 4,
    fontSize: 13,
    lineHeight: 18,
  },
  summaryGrid: {
    marginTop: 2,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  summaryItem: {
    minWidth: "47%",
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  summaryLabel: {
    fontSize: 11,
  },
  summaryValue: {
    marginTop: 2,
    fontSize: 17,
    fontWeight: "700",
  },
  formBox: {
    marginTop: 10,
    borderWidth: 1,
    borderRadius: 10,
    padding: 10,
    gap: 8,
  },
  formTitle: {
    fontSize: 14,
    fontWeight: "700",
  },
  formRow: {
    flexDirection: "row",
    gap: 8,
  },
  formInput: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 10,
    fontSize: 14,
  },
  notesInput: {
    minHeight: 90,
    textAlignVertical: "top",
  },
  actionRow: {
    marginTop: 2,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  primaryAction: {
    backgroundColor: "#008fb3",
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  primaryActionText: {
    color: "#fff",
    fontWeight: "700",
  },
  secondaryDangerAction: {
    borderWidth: 1,
    borderColor: "#ef4444",
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: "#fff",
  },
  secondaryDangerActionText: {
    color: "#ef4444",
    fontWeight: "700",
  },
  disabled: {
    opacity: 0.6,
  },
  reportsList: {
    marginTop: 10,
    gap: 8,
  },
  reportItem: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
  },
  alertItem: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    marginTop: 6,
  },
  historyRow: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    marginTop: 8,
  },
  skeletonWrap: {
    gap: 8,
  },
  skeletonRow: {
    width: "100%",
    height: 42,
    borderRadius: 9,
  },
  errorBox: {
    width: "100%",
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  errorText: {
    fontSize: 18,
    color: "red",
  },
});

export default PlayerProfile;
