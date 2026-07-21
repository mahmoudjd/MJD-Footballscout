import React, { useCallback, useContext, useMemo, useState } from "react";
import {
  Alert,
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";
import { router, useFocusEffect } from "expo-router";
import { PlayerType, SearchPlayerType } from "@/src/data/Types";
import PlayerItem from "@/src/components/PlayerItem";
import { AppContext } from "@/src/context/AppContext";
import Colors from "@/src/constants/Colors";
import SearchField from "@/src/components/SearchField";
import { convert } from "@/src/convert";
import { getAllPlayers, saveSearchedPlayer, searchPlayers } from "@/src/apiServices";
import ScreenContainer from "@/src/components/ui/ScreenContainer";
import { useAuth } from "@/src/context/AuthContext";
import { runAuthorizedRequest } from "@/src/utils/runAuthorizedRequest";
import { getPlayerDisplayName } from "@/src/utils/playerDisplay";
import FeatureGuide, { GuideSection } from "@/src/components/ui/FeatureGuide";
import PageHeaderCard from "@/src/components/ui/PageHeaderCard";

// Session-scoped recent server queries (kept in module memory so they survive
// tab switches without persisting to storage).
const recentSearches: string[] = [];
const MAX_RECENT = 5;

function hasPlayerId(player: SearchPlayerType): player is PlayerType {
  return typeof player._id === "string" && player._id.trim().length > 0;
}

function resultKey(player: SearchPlayerType, index: number) {
  if (hasPlayerId(player)) return player._id;
  return `${player.fullName || player.name}-${player.country || "n/a"}-${index}`;
}

const searchGuideSections: GuideSection[] = [
  {
    id: "lookup",
    title: "Search modes",
    description: "Search combines fast local filtering with remote backend lookup.",
    steps: [
      "Typing filters local players instantly.",
      "Server search requires at least 3 characters.",
      "Use clear names for better remote matching.",
    ],
  },
  {
    id: "save",
    title: "Save results",
    description: "New remote players can be saved into your main list.",
    steps: [
      "Tap Add to list on unsaved results.",
      "You must be logged in to save new players.",
      "Saved players become available across app pages.",
    ],
  },
  {
    id: "next",
    title: "Next actions",
    description: "After saving, continue with deeper scouting.",
    steps: [
      "Open player profile for details and reports.",
      "Add players to watchlists for tracking.",
      "Use compare to rank top candidates.",
    ],
  },
];

export default function SearchScreen() {
  const { isDark } = useContext(AppContext);
  const colors = Colors[isDark ? "dark" : "light"];
  const { session, isAuthenticated, refreshSession } = useAuth();
  const [players, setPlayers] = useState<PlayerType[]>([]);
  const [serverResults, setServerResults] = useState<SearchPlayerType[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [validationMessage, setValidationMessage] = useState("");
  const [hasSearched, setHasSearched] = useState(false);
  const [showServerResults, setShowServerResults] = useState(false);
  const [savingByKey, setSavingByKey] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState<boolean>(true);
  const [isRemoteSearching, setIsRemoteSearching] = useState(false);
  const [recent, setRecent] = useState<string[]>(recentSearches);

  const localResults = useMemo<SearchPlayerType[]>(() => {
    const term = convert(searchTerm.trim()).toLowerCase();
    if (!term) return [];
    // Search by name only (player name variants), not club/country/position.
    return players.filter(
      (player: PlayerType) =>
        convert(player.name).toLowerCase().includes(term) ||
        convert(player.fullName).toLowerCase().includes(term),
    );
  }, [players, searchTerm]);

  const results = useMemo(() => {
    return showServerResults ? serverResults : localResults;
  }, [showServerResults, serverResults, localResults]);

  const fetchPlayers = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getAllPlayers();
      setPlayers(data);
    } catch (error) {
      console.error(error);
      Alert.alert("Error", "Players could not be loaded.");
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchPlayers();
    }, [fetchPlayers]),
  );

  const rememberSearch = useCallback((query: string) => {
    const normalized = query.trim();
    if (!normalized) return;
    const next = [normalized, ...recentSearches.filter((item) => item.toLowerCase() !== normalized.toLowerCase())].slice(0, MAX_RECENT);
    recentSearches.length = 0;
    recentSearches.push(...next);
    setRecent(next);
  }, []);

  function handleChange(text: string) {
    setSearchTerm(text);
    setShowServerResults(false);
    setHasSearched(false);
    setValidationMessage("");
  }

  const handleSearch = async () => {
    const query = convert(searchTerm.trim());
    if (query.length < 3) {
      const message = "Please enter at least 3 characters.";
      setValidationMessage(message);
      Alert.alert("Info", message);
      return;
    }

    try {
      setValidationMessage("");
      setHasSearched(true);
      setShowServerResults(true);
      setIsRemoteSearching(true);
      const data = await searchPlayers(query);
      setServerResults(data);
      rememberSearch(searchTerm.trim());
    } catch (error) {
      console.error(error);
      Alert.alert("Error", "Search failed.");
    } finally {
      setIsRemoteSearching(false);
    }
  };

  const handleSaveToList = async (player: SearchPlayerType, index: number) => {
    if (hasPlayerId(player)) return;
    if (!isAuthenticated) {
      router.push({ pathname: "/login", params: { callbackUrl: "/search" } });
      return;
    }
    if (!session) return;

    const key = resultKey(player, index);

    try {
      setSavingByKey((current) => ({ ...current, [key]: true }));
      const saved = await runAuthorizedRequest({
        session,
        refreshSession,
        request: (token) => saveSearchedPlayer(token, player),
      });

      setServerResults((current) => current.map((item, i) => (i === index ? saved : item)));
      setPlayers((current) =>
        current.some((entry) => entry._id === saved._id) ? current : [saved, ...current],
      );

      Alert.alert("Success", `${getPlayerDisplayName(saved)} was added to your list.`);
    } catch (error) {
      console.error(error);
      const message = error instanceof Error ? error.message : "Could not save player.";
      Alert.alert("Error", message);
    } finally {
      setSavingByKey((current) => ({ ...current, [key]: false }));
    }
  };

  const resultCount = results.length;
  const showSuggestions = !searchTerm.trim() && !loading;

  return (
    <ScreenContainer edgeToEdge withTopInset style={styles.screen}>
      {router.canGoBack() ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Go back"
          hitSlop={8}
          onPress={() => router.back()}
          style={({ pressed }) => [styles.backRow, { opacity: pressed ? 0.6 : 1 }]}
        >
          <Ionicons name="chevron-back" size={20} color={colors.text} />
          <Text style={[styles.backText, { color: colors.text }]}>Back</Text>
        </Pressable>
      ) : null}

      <PageHeaderCard
        icon="search-outline"
        title="Search Players"
        subtitle="Your fastest path to any player — filter your database or pull new profiles from the backend."
        style={styles.pageHeader}
      >
        <View style={styles.helpWrap}>
          <FeatureGuide
            guideId="search"
            title="Search Guide"
            description="Use this guide to run effective search and save new players to your scouting list."
            sections={searchGuideSections}
            triggerLabel="Search help"
          />
        </View>
      </PageHeaderCard>

      <SearchField
        value={searchTerm}
        loading={isRemoteSearching}
        autoFocus
        handleChange={handleChange}
        handleSearch={handleSearch}
      />

      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        keyboardShouldPersistTaps="handled"
        style={styles.resultsContainer}
        contentContainerStyle={styles.resultsContent}
        showsVerticalScrollIndicator={false}
      >
        {validationMessage ? (
          <View style={[styles.noticeBox, { borderColor: "#ef4444", backgroundColor: colors.card }]}>
            <Ionicons name="alert-circle-outline" size={16} color="#ef4444" />
            <Text style={{ color: "#ef4444", fontWeight: "700", flex: 1 }}>{validationMessage}</Text>
          </View>
        ) : null}

        {loading ? (
          <View style={styles.center}>
            <ActivityIndicator animating size="large" color={colors.tint} />
          </View>
        ) : isRemoteSearching ? (
          <View style={styles.center}>
            <ActivityIndicator animating size="small" color={colors.tint} />
            <Text style={{ color: colors.notification, marginTop: 8 }}>Searching backend…</Text>
          </View>
        ) : hasSearched && resultCount === 0 ? (
          <View style={styles.emptyResult}>
            <View style={[styles.emptyIcon, { backgroundColor: colors.surfaceSoft }]}>
              <Ionicons name="person-remove-outline" size={26} color={colors.notification} />
            </View>
            <Text style={[styles.emptyTitle, { color: colors.text }]}>No players found</Text>
            <Text style={[styles.emptyBody, { color: colors.notification }]}>
              Try a different spelling or a shorter name, then run the search again.
            </Text>
          </View>
        ) : showSuggestions ? (
          <View style={styles.suggestions}>
            {recent.length > 0 ? (
              <>
                <Text style={[styles.sectionLabel, { color: colors.notification }]}>RECENT SEARCHES</Text>
                <View style={styles.chipRow}>
                  {recent.map((term) => (
                    <Pressable
                      key={term}
                      accessibilityRole="button"
                      accessibilityLabel={`Search ${term} again`}
                      onPress={() => handleChange(term)}
                      style={({ pressed }) => [
                        styles.chip,
                        {
                          borderColor: colors.border,
                          backgroundColor: colors.card,
                          opacity: pressed ? 0.7 : 1,
                        },
                      ]}
                    >
                      <Ionicons name="time-outline" size={14} color={colors.notification} />
                      <Text style={[styles.chipText, { color: colors.text }]}>{term}</Text>
                    </Pressable>
                  ))}
                </View>
              </>
            ) : null}

            <View style={[styles.tipCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <View style={[styles.tipIcon, { backgroundColor: colors.surfaceSoft }]}>
                <Ionicons name="bulb-outline" size={16} color={colors.tint} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.tipTitle, { color: colors.text }]}>Search by player name</Text>
                <Text style={[styles.tipBody, { color: colors.notification }]}>
                  Type a name to filter players already in your database instantly. Enter a full name and run the
                  backend search to pull in profiles you have not saved yet.
                </Text>
              </View>
            </View>
          </View>
        ) : (
          <>
            {resultCount > 0 ? (
              <View style={styles.resultsHeader}>
                <Text style={[styles.resultsCount, { color: colors.text }]}>
                  {resultCount} {showServerResults ? "backend" : "local"} result{resultCount === 1 ? "" : "s"}
                </Text>
                {!showServerResults ? (
                  <Text style={[styles.resultsHint, { color: colors.notification }]}>
                    Press search for backend
                  </Text>
                ) : null}
              </View>
            ) : null}

            {results.map((player, index) => {
              if (hasPlayerId(player)) {
                return <PlayerItem key={resultKey(player, index)} player={player} />;
              }

              const key = resultKey(player, index);
              const isSaving = Boolean(savingByKey[key]);

              return (
                <View
                  key={key}
                  style={[
                    styles.unsavedCard,
                    {
                      backgroundColor: colors.card,
                      borderColor: colors.border,
                    },
                  ]}
                >
                  <View style={styles.unsavedHeader}>
                    <Image
                      source={player.image || undefined}
                      style={styles.unsavedImage}
                      contentFit="cover"
                      cachePolicy="memory-disk"
                      transition={160}
                    />
                    <View style={{ flex: 1 }}>
                      <View style={styles.newBadgeRow}>
                        <Text style={[styles.unsavedName, { color: colors.text }]} numberOfLines={1}>
                          {getPlayerDisplayName(player)}
                        </Text>
                        <View style={[styles.newBadge, { backgroundColor: colors.surfaceSoft }]}>
                          <Text style={[styles.newBadgeText, { color: colors.tint }]}>NEW</Text>
                        </View>
                      </View>
                      <Text style={{ color: colors.notification, fontSize: 12 }} numberOfLines={1}>
                        {player.currentClub || player.country || "Unknown club"}
                      </Text>
                      <View style={styles.unsavedPills}>
                        {player.country ? (
                          <View style={[styles.unsavedPill, { backgroundColor: isDark ? "rgba(215,255,69,0.12)" : "rgba(10,33,24,0.06)" }]}>
                            <Text style={[styles.unsavedPillText, { color: isDark ? colors.accent : colors.tint }]}>{player.country}</Text>
                          </View>
                        ) : null}
                        {player.position ? (
                          <View style={[styles.unsavedPill, { backgroundColor: isDark ? "rgba(215,255,69,0.12)" : "rgba(10,33,24,0.06)" }]}>
                            <Text style={[styles.unsavedPillText, { color: isDark ? colors.accent : colors.tint }]}>{player.position}</Text>
                          </View>
                        ) : null}
                      </View>
                    </View>
                  </View>
                  <Pressable
                    disabled={isSaving}
                    onPress={() => handleSaveToList(player, index)}
                    style={[styles.addButton, { backgroundColor: colors.tint }, isSaving ? styles.addButtonDisabled : undefined]}
                  >
                    <Ionicons name={isSaving ? "hourglass-outline" : "add"} size={16} color={isDark ? colors.accentText : "#fff"} />
                    <Text style={[styles.addButtonText, { color: isDark ? colors.accentText : "#fff" }]}>
                      {isSaving ? "Adding…" : "Add to list"}
                    </Text>
                  </Pressable>
                </View>
              );
            })}
          </>
        )}
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  screen: {
    alignItems: "center",
  },
  backRow: {
    width: "92%",
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
    marginBottom: 6,
    marginLeft: -4,
  },
  backText: {
    fontSize: 15,
    fontWeight: "700",
  },
  resultsContainer: {
    flex: 1,
    width: "92%",
  },
  resultsContent: {
    paddingBottom: 12,
  },
  pageHeader: {
    width: "92%",
    marginBottom: 10,
  },
  helpWrap: {
    alignSelf: "flex-start",
  },
  center: {
    width: "100%",
    paddingVertical: 32,
    alignItems: "center",
    justifyContent: "center",
  },
  noticeBox: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  suggestions: {
    paddingTop: 4,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 0.8,
    marginBottom: 10,
  },
  chipRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  chip: {
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 13,
    paddingVertical: 9,
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
  },
  chipText: {
    fontSize: 13,
    fontWeight: "700",
  },
  tipCard: {
    marginTop: 20,
    borderWidth: 1,
    borderRadius: 16,
    padding: 14,
    flexDirection: "row",
    gap: 12,
    alignItems: "flex-start",
  },
  tipIcon: {
    width: 34,
    height: 34,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  tipTitle: {
    fontSize: 14,
    fontWeight: "800",
  },
  tipBody: {
    fontSize: 12,
    lineHeight: 18,
    marginTop: 3,
  },
  emptyResult: {
    width: "100%",
    paddingVertical: 30,
    alignItems: "center",
  },
  emptyIcon: {
    width: 58,
    height: 58,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14,
  },
  emptyTitle: {
    fontSize: 17,
    fontWeight: "800",
  },
  emptyBody: {
    fontSize: 13,
    lineHeight: 19,
    textAlign: "center",
    marginTop: 6,
    maxWidth: 280,
  },
  resultsHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
    paddingHorizontal: 2,
  },
  resultsCount: {
    fontSize: 14,
    fontWeight: "800",
  },
  resultsHint: {
    fontSize: 11,
    fontWeight: "600",
  },
  unsavedCard: {
    borderWidth: 1,
    borderRadius: 16,
    padding: 12,
    marginBottom: 10,
    gap: 10,
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 1,
  },
  unsavedHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  unsavedImage: {
    width: 56,
    height: 56,
    borderRadius: 18,
    backgroundColor: "#e2e8f0",
  },
  newBadgeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  unsavedName: {
    fontSize: 16,
    fontWeight: "800",
    flexShrink: 1,
  },
  newBadge: {
    borderRadius: 999,
    paddingHorizontal: 7,
    paddingVertical: 2,
  },
  newBadgeText: {
    fontSize: 9,
    fontWeight: "900",
    letterSpacing: 0.5,
  },
  unsavedPills: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    marginTop: 6,
  },
  unsavedPill: {
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  unsavedPillText: {
    fontSize: 10,
    fontWeight: "700",
  },
  addButton: {
    borderRadius: 10,
    paddingVertical: 11,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 6,
  },
  addButtonDisabled: {
    opacity: 0.65,
  },
  addButtonText: {
    fontWeight: "800",
  },
});
