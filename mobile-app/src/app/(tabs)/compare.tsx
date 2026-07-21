import React, { useCallback, useContext, useMemo, useState } from "react";
import { useFocusEffect } from "expo-router";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Colors from "@/src/constants/Colors";
import { AppContext } from "@/src/context/AppContext";
import { useAuth } from "@/src/context/AuthContext";
import {
  comparePlayers,
  getAllPlayers,
} from "@/src/apiServices";
import {
  ComparePlayersResponse,
  PlayerType,
} from "@/src/data/Types";
import ScreenContainer from "@/src/components/ui/ScreenContainer";
import AuthRequiredState from "@/src/components/ui/AuthRequiredState";
import { runAuthorizedRequest } from "@/src/utils/runAuthorizedRequest";
import LoadingState from "@/src/components/ui/LoadingState";
import { getPlayerDisplayName } from "@/src/utils/playerDisplay";
import FeatureGuide, { GuideSection } from "@/src/components/ui/FeatureGuide";
import PageHeaderCard from "@/src/components/ui/PageHeaderCard";
import AppButton from "@/src/components/ui/AppButton";
import { accentSoft, accentSoftText, onTint, radius, spacing } from "@/src/constants/Theme";

type CompareTab = "selection" | "results";
type AppliedScope = "selection" | "all";

const INITIAL_CANDIDATE_LIMIT = 40;
const INITIAL_RESULT_LIMIT = 25;
const compareGuideSections: GuideSection[] = [
  {
    id: "select",
    title: "Select players",
    description: "Pick at least two players before running a comparison.",
    steps: [
      "Use search to find names, clubs, countries, or positions.",
      "Tap rows to add or remove players from selection.",
      "Use Compare all for a global ranking across all players.",
    ],
  },
  {
    id: "run",
    title: "Run and refresh",
    description: "Results are generated from your latest selection.",
    steps: [
      "Tap Compare selected players to generate metrics.",
      "If selection changes, run comparison again to refresh output.",
      "Use Clear to reset the whole compare state.",
    ],
  },
  {
    id: "read",
    title: "Read results",
    description: "Use leaders and ranking table to decide quickly.",
    steps: [
      "Leaders highlight top ELO, value, age, and recent activity.",
      "Results table includes rank, profile columns, and final score.",
      "Use Show more results to expand long rankings.",
    ],
  },
];

function selectionsEqual(a: string[], b: string[]) {
  if (a.length !== b.length) return false;
  for (let index = 0; index < a.length; index += 1) {
    if (a[index] !== b[index]) return false;
  }
  return true;
}

function formatMarketValue(player?: PlayerType) {
  if (!player) return "-";
  const value = typeof player.value === "string" ? player.value.trim() : "";
  const currency = typeof player.currency === "string" ? player.currency.trim() : "";
  if (!value && !currency) return "-";
  return `${value}${currency ? ` ${currency}` : ""}`.trim();
}

export default function CompareScreen() {
  const { isDark } = useContext(AppContext);
  const { session, isAuthenticated, isAuthReady, refreshSession } = useAuth();
  const colorKey = isDark ? "dark" : "light";
  const colors = Colors[colorKey];
  const onTintColor = onTint(isDark);

  const [players, setPlayers] = useState<PlayerType[]>([]);
  const [search, setSearch] = useState("");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [appliedIds, setAppliedIds] = useState<string[]>([]);
  const [appliedScope, setAppliedScope] = useState<AppliedScope>("selection");
  const [comparison, setComparison] = useState<ComparePlayersResponse | null>(null);
  const [isLoadingPlayers, setIsLoadingPlayers] = useState(true);
  const [isComparing, setIsComparing] = useState(false);
  const [candidateLimit, setCandidateLimit] = useState(INITIAL_CANDIDATE_LIMIT);
  const [resultLimit, setResultLimit] = useState(INITIAL_RESULT_LIMIT);
  const [activeTab, setActiveTab] = useState<CompareTab>("selection");

  const loadPlayers = useCallback(async () => {
    try {
      setIsLoadingPlayers(true);
      const data = await getAllPlayers();
      setPlayers(data);
    } catch (error) {
      console.error(error);
      Alert.alert("Error", "Failed to load players.");
    } finally {
      setIsLoadingPlayers(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadPlayers();
    }, [loadPlayers]),
  );

  const byId = useMemo(
    () => new Map(players.map((player) => [player._id, player])),
    [players],
  );

  const filteredPlayers = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return players;
    return players.filter((player) =>
      `${getPlayerDisplayName(player)} ${player.name} ${player.fullName} ${player.currentClub} ${player.country} ${player.position}`
        .toLowerCase()
        .includes(term),
    );
  }, [players, search]);

  const visibleCandidates = useMemo(
    () => filteredPlayers.slice(0, candidateLimit),
    [filteredPlayers, candidateLimit],
  );
  const hasMoreCandidates = filteredPlayers.length > candidateLimit;

  const ranking = useMemo(() => comparison?.ranking || [], [comparison?.ranking]);
  const visibleRanking = useMemo(
    () => ranking.slice(0, resultLimit),
    [ranking, resultLimit],
  );
  const hasMoreResults = ranking.length > resultLimit;

  const selectedPlayersPreview = useMemo(
    () =>
      selectedIds
        .slice(0, 8)
        .map((id) => byId.get(id))
        .filter(Boolean) as PlayerType[],
    [selectedIds, byId],
  );

  const selectedOverflow = Math.max(0, selectedIds.length - selectedPlayersPreview.length);
  const selectionRepresentsAll = players.length > 0 && selectedIds.length === players.length;
  const selectionDirty =
    appliedScope === "all"
      ? !selectionRepresentsAll
      : !selectionsEqual(selectedIds, appliedIds);
  const hasActiveComparison = appliedScope === "all" || appliedIds.length >= 2;

  const formatWinners = useCallback(
    (ids: string[] = []) => {
      if (ids.length === 0) return "-";
      return ids.map((id) => getPlayerDisplayName(byId.get(id)) || id).join(", ");
    },
    [byId],
  );

  const toggleSelection = useCallback((playerId: string) => {
    setSelectedIds((current) =>
      current.includes(playerId)
        ? current.filter((id) => id !== playerId)
        : [...current, playerId],
    );
  }, []);

  const handleCompareSelection = useCallback(async () => {
    if (selectedIds.length < 2) return;
    if (!session) return;

    try {
      setIsComparing(true);
      const result = await runAuthorizedRequest({
        session,
        refreshSession,
        request: (token) =>
          comparePlayers({
            accessToken: token,
            ids: selectedIds,
          }),
      });
      setComparison(result);
      setAppliedIds(selectedIds);
      setAppliedScope("selection");
      setActiveTab("results");
      setResultLimit(INITIAL_RESULT_LIMIT);
    } catch (error) {
      console.error(error);
      const message = error instanceof Error ? error.message : "Compare failed";
      Alert.alert("Error", message);
    } finally {
      setIsComparing(false);
    }
  }, [selectedIds, session, refreshSession]);

  const handleCompareAll = useCallback(async () => {
    if (!session) return;
    try {
      setIsComparing(true);
      const result = await runAuthorizedRequest({
        session,
        refreshSession,
        request: (token) =>
          comparePlayers({
            accessToken: token,
            all: true,
          }),
      });
      setSelectedIds(players.map((player) => player._id));
      setAppliedIds([]);
      setAppliedScope("all");
      setComparison(result);
      setActiveTab("results");
      setResultLimit(INITIAL_RESULT_LIMIT);
    } catch (error) {
      console.error(error);
      const message = error instanceof Error ? error.message : "Compare failed";
      Alert.alert("Error", message);
    } finally {
      setIsComparing(false);
    }
  }, [session, refreshSession, players]);

  if (!isAuthReady) {
    return <LoadingState />;
  }

  if (!isAuthenticated) {
    return (
      <AuthRequiredState
        message="Compare is available only for logged-in users."
      />
    );
  }

  if (isLoadingPlayers) {
    return (
      <ScreenContainer edgeToEdge withTopInset style={styles.center}>
        <ActivityIndicator animating size="large" color={colors.tint} />
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer edgeToEdge withTopInset style={styles.container}>
      <PageHeaderCard
        icon="git-compare-outline"
        title="Compare Players"
        subtitle="Compare selected players or run a full ranking for all players."
        style={styles.pageHeader}
      >
        <View style={styles.guideRow}>
          <FeatureGuide
            guideId="compare"
            title="Compare Guide"
            description="This guide helps you select players, run comparisons, and read ranking output."
            sections={compareGuideSections}
            triggerLabel="Compare help"
          />
        </View>
      </PageHeaderCard>

      <View style={styles.tabRow}>
        {(["selection", "results"] as CompareTab[]).map((tab) => {
          const active = activeTab === tab;
          return (
            <Pressable
              key={tab}
              accessibilityRole="tab"
              accessibilityState={{ selected: active }}
              style={[
                styles.tabButton,
                {
                  backgroundColor: active ? colors.tint : colors.card,
                  borderColor: active ? colors.tint : colors.border,
                },
              ]}
              onPress={() => setActiveTab(tab)}
            >
              <Text
                style={[
                  styles.tabButtonText,
                  { color: active ? onTintColor : colors.notification },
                ]}
              >
                {tab === "selection" ? "Selection" : "Results"}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {activeTab === "selection" ? (
        <>
          <View style={styles.actionRow}>
            <AppButton
              label="Compare selected"
              icon="git-compare"
              size="md"
              fullWidth={false}
              style={styles.actionPrimary}
              loading={isComparing}
              disabled={selectedIds.length < 2 || isComparing || !selectionDirty}
              onPress={handleCompareSelection}
            />
            <AppButton
              label={`Compare all (${players.length})`}
              variant="ghost"
              size="md"
              fullWidth={false}
              disabled={isComparing}
              onPress={handleCompareAll}
            />
            <AppButton
              label="Clear"
              variant="ghost"
              size="md"
              fullWidth={false}
              disabled={selectedIds.length === 0 && appliedIds.length === 0 && !comparison}
              onPress={() => {
                setSelectedIds([]);
                setAppliedIds([]);
                setAppliedScope("selection");
                setComparison(null);
              }}
            />
          </View>

          <TextInput
            value={search}
            onChangeText={(value) => {
              setSearch(value);
              setCandidateLimit(INITIAL_CANDIDATE_LIMIT);
            }}
            placeholder="Search by name, club, country, position"
            placeholderTextColor={Colors[colorKey].notification}
            style={[
              styles.searchInput,
              {
                color: Colors[colorKey].text,
                borderColor: Colors[colorKey].border,
                backgroundColor: Colors[colorKey].card,
              },
            ]}
          />

          <View
            style={[
              styles.selectedPreview,
              {
                borderColor: Colors[colorKey].border,
                backgroundColor: Colors[colorKey].card,
              },
            ]}
          >
            <Text style={{ color: Colors[colorKey].text, fontWeight: "700" }}>
              {selectedIds.length} selected
            </Text>
            {selectedPlayersPreview.length > 0 ? (
              <View style={styles.selectedChipsRow}>
                {selectedPlayersPreview.map((player) => (
                  <View
                    key={player._id}
                    style={[styles.selectedChip, { backgroundColor: accentSoft(isDark) }]}
                  >
                    <Text style={[styles.selectedChipText, { color: accentSoftText(isDark) }]}>
                      {getPlayerDisplayName(player)}
                    </Text>
                  </View>
                ))}
                {selectedOverflow > 0 ? (
                  <View style={[styles.selectedChip, { backgroundColor: colors.surfaceSoft }]}>
                    <Text style={[styles.selectedChipText, { color: colors.notification }]}>
                      +{selectedOverflow} more
                    </Text>
                  </View>
                ) : null}
              </View>
            ) : (
              <Text style={{ color: Colors[colorKey].notification, marginTop: 4 }}>
                No players selected
              </Text>
            )}
          </View>

          <FlatList
            contentInsetAdjustmentBehavior="automatic"
            data={visibleCandidates}
            keyExtractor={(item) => item._id}
            contentContainerStyle={{ paddingBottom: 24 }}
            renderItem={({ item }) => {
              const selected = selectedIds.includes(item._id);
              return (
                <Pressable
                  onPress={() => toggleSelection(item._id)}
                  style={[
                    styles.playerRow,
                      {
                        borderColor: selected ? Colors[colorKey].tint : Colors[colorKey].border,
                        backgroundColor: selected
                          ? isDark
                            ? "rgba(215,255,69,0.10)"
                            : "rgba(215,255,69,0.24)"
                          : Colors[colorKey].card,
                      },
                  ]}
                >
                  <View style={{ flex: 1 }}>
                    <Text style={{ color: colors.text, fontWeight: "800", fontSize: 15 }}>
                      {getPlayerDisplayName(item)}
                    </Text>
                    <Text style={{ color: colors.notification, fontSize: 12 }}>
                      {item.currentClub || item.country} • {item.position}
                    </Text>
                  </View>
                  <View
                    style={[
                      styles.selectPill,
                      selected
                        ? { backgroundColor: colors.tint, borderColor: colors.tint }
                        : { backgroundColor: "transparent", borderColor: colors.tint },
                    ]}
                  >
                    {selected ? <Ionicons name="checkmark" size={13} color={onTintColor} /> : null}
                    <Text style={{ color: selected ? onTintColor : colors.tint, fontWeight: "800", fontSize: 12 }}>
                      {selected ? "Added" : "Add"}
                    </Text>
                  </View>
                </Pressable>
              );
            }}
            ListFooterComponent={
              hasMoreCandidates ? (
                <Pressable
                  onPress={() => setCandidateLimit((current) => current + INITIAL_CANDIDATE_LIMIT)}
                  style={styles.loadMore}
                >
                  <Text style={{ color: Colors[colorKey].tint, fontWeight: "700" }}>Show more players</Text>
                </Pressable>
              ) : null
            }
          />
        </>
      ) : (
        <View style={styles.resultsContainer}>
          {isComparing ? (
            <View style={styles.center}>
              <ActivityIndicator animating size="large" color={Colors[colorKey].tint} />
            </View>
          ) : !comparison ? (
            <View style={styles.center}>
              <Text style={{ color: Colors[colorKey].notification }}>
                Run comparison to see metrics and ranking.
              </Text>
            </View>
          ) : (
            <>
              <View
                style={[
                  styles.statusCard,
                  {
                    backgroundColor: Colors[colorKey].card,
                    borderColor: Colors[colorKey].border,
                  },
                ]}
              >
                <Text style={[styles.cardTitle, { color: Colors[colorKey].text }]}>Comparison status</Text>
                <Text style={[styles.metricText, { color: Colors[colorKey].notification }]}>
                  Applied players: {appliedScope === "all" ? players.length : appliedIds.length}
                </Text>
                {selectionDirty && selectedIds.length >= 2 ? (
                  <Text style={[styles.metricText, { color: Colors[colorKey].tint }]}>
                    Selection changed. Run comparison again to apply updates.
                  </Text>
                ) : null}
                {!hasActiveComparison ? (
                  <Text style={[styles.metricText, { color: Colors[colorKey].notification }]}>
                    No active comparison.
                  </Text>
                ) : null}
              </View>

              <View
                style={[
                  styles.metricsCard,
                  {
                    backgroundColor: Colors[colorKey].card,
                    borderColor: Colors[colorKey].border,
                  },
                ]}
              >
                <Text style={[styles.cardTitle, { color: Colors[colorKey].text }]}>Leaders</Text>
                <Text style={[styles.metricText, { color: Colors[colorKey].notification }]}>
                  Highest ELO: {formatWinners(comparison.metrics.highestElo)}
                </Text>
                <Text style={[styles.metricText, { color: Colors[colorKey].notification }]}>
                  Highest value: {formatWinners(comparison.metrics.highestMarketValue)}
                </Text>
                <Text style={[styles.metricText, { color: Colors[colorKey].notification }]}>
                  Youngest: {formatWinners(comparison.metrics.youngest)}
                </Text>
                <Text style={[styles.metricText, { color: Colors[colorKey].notification }]}>
                  Recently updated: {formatWinners(comparison.metrics.recentlyUpdated)}
                </Text>
              </View>

              <View
                style={[
                  styles.tableCard,
                  {
                    backgroundColor: Colors[colorKey].card,
                    borderColor: Colors[colorKey].border,
                  },
                ]}
              >
                <Text style={[styles.cardTitle, { color: Colors[colorKey].text }]}>Results table</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  <View>
                    <View
                      style={[
                        styles.compareTableRow,
                        styles.compareTableHeaderRow,
                        { borderBottomColor: Colors[colorKey].border },
                      ]}
                    >
                      <Text style={[styles.compareTableHeaderCell, styles.colRank, { color: Colors[colorKey].text }]}>#</Text>
                      <Text style={[styles.compareTableHeaderCell, styles.colPlayer, { color: Colors[colorKey].text }]}>Player</Text>
                      <Text style={[styles.compareTableHeaderCell, styles.colClub, { color: Colors[colorKey].text }]}>Club</Text>
                      <Text style={[styles.compareTableHeaderCell, styles.colPosition, { color: Colors[colorKey].text }]}>Position</Text>
                      <Text style={[styles.compareTableHeaderCell, styles.colAge, { color: Colors[colorKey].text }]}>Age</Text>
                      <Text style={[styles.compareTableHeaderCell, styles.colElo, { color: Colors[colorKey].text }]}>ELO</Text>
                      <Text style={[styles.compareTableHeaderCell, styles.colValue, { color: Colors[colorKey].text }]}>Value</Text>
                      <Text style={[styles.compareTableHeaderCell, styles.colScore, { color: Colors[colorKey].text }]}>Score</Text>
                    </View>
                    {visibleRanking.map((item, index) => {
                      const player =
                        comparison.players.find((entry) => entry._id === item.playerId) ||
                        byId.get(item.playerId);
                      return (
                        <View
                          key={item.playerId}
                          style={[
                            styles.compareTableRow,
                            {
                              borderBottomColor: Colors[colorKey].border,
                              backgroundColor: index % 2 === 0 ? colors.card : colors.surfaceSoft,
                            },
                          ]}
                        >
                          <Text style={[styles.compareTableCell, styles.colRank, { color: Colors[colorKey].tint }]}>
                            {index + 1}
                          </Text>
                          <Text style={[styles.compareTableCell, styles.colPlayer, { color: Colors[colorKey].text }]}>
                            {player ? getPlayerDisplayName(player) : item.playerId}
                          </Text>
                          <Text
                            style={[
                              styles.compareTableCell,
                              styles.colClub,
                              { color: Colors[colorKey].notification },
                            ]}
                          >
                            {player?.currentClub || "-"}
                          </Text>
                          <Text
                            style={[
                              styles.compareTableCell,
                              styles.colPosition,
                              { color: Colors[colorKey].notification },
                            ]}
                          >
                            {player?.position || "-"}
                          </Text>
                          <Text style={[styles.compareTableCell, styles.colAge, { color: Colors[colorKey].text }]}>
                            {typeof player?.age === "number" ? player.age : "-"}
                          </Text>
                          <Text style={[styles.compareTableCell, styles.colElo, { color: Colors[colorKey].text }]}>
                            {typeof player?.elo === "number" ? player.elo : "-"}
                          </Text>
                          <Text style={[styles.compareTableCell, styles.colValue, { color: Colors[colorKey].text }]}>
                            {formatMarketValue(player)}
                          </Text>
                          <Text style={[styles.compareTableCell, styles.colScore, { color: Colors[colorKey].text }]}>
                            {Number.isFinite(item.score) ? item.score.toFixed(2) : "-"}
                          </Text>
                        </View>
                      );
                    })}
                  </View>
                </ScrollView>
                {hasMoreResults ? (
                  <Pressable
                    onPress={() => setResultLimit((current) => current + INITIAL_RESULT_LIMIT)}
                    style={styles.loadMore}
                  >
                    <Text style={{ color: Colors[colorKey].tint, fontWeight: "700" }}>Show more results</Text>
                  </Pressable>
                ) : null}
              </View>
            </>
          )}
        </View>
      )}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 14,
  },
  pageHeader: {
    marginBottom: 12,
  },
  guideRow: {
    alignSelf: "flex-start",
  },
  tabRow: {
    flexDirection: "row",
    marginBottom: 12,
    gap: 8,
  },
  tabButton: {
    flex: 1,
    borderWidth: 1.5,
    borderRadius: radius.md,
    paddingVertical: 11,
    alignItems: "center",
  },
  tabButtonText: {
    fontWeight: "800",
    letterSpacing: -0.2,
  },
  actionRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
    marginBottom: 10,
  },
  actionPrimary: {
    flexGrow: 1,
  },
  selectPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    borderWidth: 1.5,
    borderRadius: radius.pill,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  searchInput: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 10,
  },
  selectedPreview: {
    borderWidth: 1,
    borderRadius: 10,
    padding: 10,
    marginBottom: 10,
  },
  selectedChipsRow: {
    marginTop: 6,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
  },
  selectedChip: {
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  selectedChipText: {
    fontSize: 12,
    fontWeight: "700",
  },
  playerRow: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 8,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  resultsContainer: {
    flex: 1,
  },
  metricsCard: {
    borderWidth: 1,
    borderRadius: 10,
    padding: 12,
    marginBottom: 10,
  },
  statusCard: {
    borderWidth: 1,
    borderRadius: 10,
    padding: 12,
    marginBottom: 10,
  },
  tableCard: {
    borderWidth: 1,
    borderRadius: 10,
    padding: 10,
    marginBottom: 10,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "800",
    marginBottom: 8,
  },
  metricText: {
    fontSize: 13,
    marginBottom: 4,
  },
  rankRow: {
    borderWidth: 1,
    borderRadius: 10,
    marginBottom: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  rankNumber: {
    fontSize: 18,
    fontWeight: "800",
    width: 36,
  },
  compareTableHeaderRow: {
    borderBottomWidth: 1,
  },
  compareTableRow: {
    flexDirection: "row",
    alignItems: "center",
    minHeight: 42,
    borderBottomWidth: 1,
  },
  compareTableHeaderCell: {
    fontSize: 12,
    fontWeight: "800",
    paddingVertical: 9,
    paddingHorizontal: 8,
  },
  compareTableCell: {
    fontSize: 12,
    paddingVertical: 9,
    paddingHorizontal: 8,
  },
  colRank: {
    width: 50,
    textAlign: "center",
  },
  colPlayer: {
    width: 180,
  },
  colClub: {
    width: 150,
  },
  colPosition: {
    width: 120,
  },
  colAge: {
    width: 65,
    textAlign: "center",
  },
  colElo: {
    width: 75,
    textAlign: "center",
  },
  colValue: {
    width: 120,
  },
  colScore: {
    width: 80,
    textAlign: "center",
  },
  loadMore: {
    alignItems: "center",
    paddingVertical: 10,
  },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
});
