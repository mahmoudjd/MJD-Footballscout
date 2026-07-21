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
import { Image } from "expo-image";
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
import { Link, useNavigation } from "expo-router";
import {
  deletePlayer,
  deleteScoutingReport,
  getAllPlayers,
  getPlayerHistory,
  getPlayerReports,
  updatePlayer,
  upsertPlayerReport,
} from "../apiServices";
import { useAuth } from "../context/AuthContext";
import { runAuthorizedRequest } from "@/src/utils/runAuthorizedRequest";
import AppBackground from "@/src/components/ui/AppBackground";
import AppSelect from "@/src/components/ui/AppSelect";
import AppButton from "@/src/components/ui/AppButton";
import { accentSoft, accentSoftText, onTint, radius, shadow, spacing } from "@/src/constants/Theme";
import { getPlayerDisplayName as displayNameOf } from "@/src/utils/playerDisplay";

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

type ProfileTabKey = "overview" | "attributes" | "career" | "scouting" | "history" | "similar";

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
  { key: "similar", label: "Similar", icon: "people-outline" },
];

function getPositionGroup(position: string | undefined) {
  const p = position || "";
  if (p.includes("Forward")) return "Forward";
  if (p.includes("Midfielder")) return "Midfielder";
  if (p.includes("Defender")) return "Defender";
  if (p.includes("Goalkeeper")) return "Goalkeeper";
  return "Other";
}

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
  return isDark ? "#c9e265" : "#0e7490";
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

  const [allPlayers, setAllPlayers] = useState<PlayerType[]>([]);
  const [isLoadingSimilar, setIsLoadingSimilar] = useState(false);
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

  const loadSimilarPool = useCallback(async () => {
    try {
      setIsLoadingSimilar(true);
      const data = await getAllPlayers();
      setAllPlayers(data);
    } catch (error) {
      console.error(error);
      setAllPlayers([]);
    } finally {
      setIsLoadingSimilar(false);
    }
  }, []);

  useEffect(() => {
    loadSimilarPool();
  }, [loadSimilarPool]);

  // Similar players: same position group, ranked by closest ELO, then value.
  const similarPlayers = useMemo(() => {
    const group = getPositionGroup(player.position);
    const baseElo = typeof player.elo === "number" ? player.elo : 0;
    return allPlayers
      .filter((entry) => entry._id !== player._id && getPositionGroup(entry.position) === group)
      .map((entry) => ({
        entry,
        diff: Math.abs((typeof entry.elo === "number" ? entry.elo : 0) - baseElo),
      }))
      .sort((a, b) => a.diff - b.diff)
      .slice(0, 6)
      .map((item) => item.entry);
  }, [allPlayers, player._id, player.position, player.elo]);

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
              <AppButton
                label="Save report"
                icon="save-outline"
                size="md"
                fullWidth={false}
                style={styles.actionPrimary}
                loading={isSubmittingReport}
                disabled={isSubmittingReport}
                onPress={handleSaveReport}
              />
              {ownReport ? (
                <AppButton
                  label="Delete my report"
                  icon="trash-outline"
                  variant="danger"
                  size="md"
                  fullWidth={false}
                  loading={isDeletingReport}
                  disabled={isDeletingReport}
                  onPress={handleDeleteOwnReport}
                />
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

  const renderSimilarTab = () => (
    <View style={[styles.sectionCard, { backgroundColor: palette.card, borderColor: palette.border }]}>
      <View style={styles.sectionHeadingRow}>
        <Ionicons name="people-outline" size={17} color={palette.tint} />
        <Text style={[styles.heading, { color: palette.text }]}>Similar Players</Text>
      </View>
      <Text style={[styles.similarSubtitle, { color: palette.notification }]}>
        Same position ({getPositionGroup(player.position)}), ranked by closest ELO rating.
      </Text>

      {isLoadingSimilar ? (
        <SectionSkeleton rows={5} isDark={isDark} />
      ) : similarPlayers.length === 0 ? (
        <Text style={{ color: palette.notification }}>No similar players found.</Text>
      ) : (
        <View style={styles.similarList}>
          {similarPlayers.map((sp) => (
            <Link key={sp._id} href={`/${sp._id}`} asChild>
              <Pressable
                style={({ pressed }) => [
                  styles.similarRow,
                  { borderColor: palette.border, backgroundColor: palette.background },
                  pressed ? styles.disabled : undefined,
                ]}
              >
                <View style={styles.similarRowInner}>
                  <Image
                    source={sp.image || undefined}
                    style={[styles.similarAvatar, { backgroundColor: palette.surfaceSoft }]}
                    contentFit="cover"
                    cachePolicy="memory-disk"
                    transition={160}
                  />
                  <View style={{ flex: 1, minWidth: 0 }}>
                    <Text style={[styles.similarName, { color: palette.text }]} numberOfLines={1}>
                      {displayNameOf(sp)}
                    </Text>
                    <Text style={[styles.similarMeta, { color: palette.notification }]} numberOfLines={1}>
                      {sp.currentClub || sp.country || "Unknown"} · {sp.position}
                    </Text>
                  </View>
                  <View style={[styles.similarElo, { backgroundColor: palette.tint }]}>
                    <Text style={[styles.similarEloText, { color: onTint(isDark) }]}>
                      {typeof sp.elo === "number" ? sp.elo : "–"}
                    </Text>
                  </View>
                  <Ionicons name="chevron-forward" size={16} color={palette.notification} />
                </View>
              </Pressable>
            </Link>
          ))}
        </View>
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
    if (activeTab === "history") return renderHistoryTab();
    return renderSimilarTab();
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

      <ScrollView
        style={[styles.profilePage, { backgroundColor: palette.background }]}
        contentContainerStyle={styles.profileContent}
        showsVerticalScrollIndicator={false}
      >
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
              <View style={styles.quickStatTop}>
                <View style={[styles.quickStatIcon, { backgroundColor: accentSoft(isDark) }]}>
                  <Ionicons name={stat.icon} size={13} color={accentSoftText(isDark)} />
                </View>
                <Text style={[styles.quickStatLabel, { color: palette.notification }]} numberOfLines={1}>
                  {stat.label}
                </Text>
              </View>
              <Text style={[styles.quickStatValue, { color: palette.text }]} numberOfLines={1}>
                {stat.value}
              </Text>
            </View>
          ))}
        </View>

        <View style={styles.metaRow}>
          <Ionicons name="time-outline" size={13} color={palette.notification} />
          <Text style={[styles.metaLabel, { color: palette.notification }]}>Last updated</Text>
          <Text style={[styles.metaValue, { color: palette.text }]} numberOfLines={1}>
            {formatTimestamp(player.timestamp)}
          </Text>
        </View>

        {/* Segmented section control — sits inline in the middle of the page. */}
        <View style={[styles.segmentBar, { backgroundColor: isDark ? "rgba(255,255,255,0.05)" : "rgba(10,33,24,0.045)", borderColor: palette.border }]}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.segmentContent}
          >
            {PROFILE_TABS.map((tab) => {
              const selected = activeTab === tab.key;
              return (
                <Pressable
                  key={tab.key}
                  accessibilityRole="tab"
                  accessibilityState={{ selected }}
                  onPress={() => setActiveTab(tab.key)}
                  style={[
                    styles.segment,
                    selected ? { backgroundColor: palette.tint } : null,
                    selected ? shadow(isDark).sm : null,
                  ]}
                >
                  <Ionicons
                    name={tab.icon}
                    size={15}
                    color={selected ? onTint(isDark) : palette.notification}
                  />
                  <Text
                    style={[styles.segmentText, { color: selected ? onTint(isDark) : palette.notification }]}
                  >
                    {tab.label}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>
        </View>

        {renderContentByTab()}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  profilePage: {
    flex: 1,
    width: "100%",
  },
  profileContent: {
    paddingTop: 16,
    paddingBottom: 20,
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
    borderRadius: radius.md,
    paddingHorizontal: 13,
    paddingVertical: 12,
  },
  quickStatTop: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    marginBottom: 8,
  },
  quickStatIcon: {
    width: 24,
    height: 24,
    borderRadius: 7,
    alignItems: "center",
    justifyContent: "center",
  },
  quickStatValue: {
    fontSize: 22,
    fontWeight: "900",
    letterSpacing: -0.5,
  },
  quickStatLabel: {
    flex: 1,
    fontSize: 10,
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: 0.6,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 4,
    marginBottom: 14,
  },
  metaLabel: {
    fontSize: 12,
    fontWeight: "700",
  },
  metaValue: {
    flex: 1,
    textAlign: "right",
    fontSize: 12.5,
    fontWeight: "800",
  },
  segmentBar: {
    borderWidth: 1,
    borderRadius: radius.md,
    padding: 4,
    marginBottom: 12,
  },
  segmentContent: {
    gap: 4,
  },
  segment: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    borderRadius: radius.sm,
    paddingHorizontal: 13,
    paddingVertical: 9,
  },
  segmentText: {
    fontSize: 13,
    fontWeight: "800",
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
    gap: spacing.sm,
  },
  actionPrimary: {
    flexGrow: 1,
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
  similarSubtitle: {
    fontSize: 12.5,
    lineHeight: 17,
    marginTop: -4,
    marginBottom: 10,
  },
  similarList: {
    gap: 8,
  },
  similarRow: {
    borderWidth: 1,
    borderRadius: radius.md,
    padding: 8,
  },
  similarRowInner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  similarAvatar: {
    width: 44,
    height: 44,
    borderRadius: radius.sm,
  },
  similarName: {
    fontSize: 14,
    fontWeight: "800",
  },
  similarMeta: {
    fontSize: 11.5,
    marginTop: 2,
    fontWeight: "500",
  },
  similarElo: {
    borderRadius: radius.pill,
    paddingHorizontal: 10,
    paddingVertical: 4,
    minWidth: 40,
    alignItems: "center",
  },
  similarEloText: {
    fontSize: 12,
    fontWeight: "900",
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
