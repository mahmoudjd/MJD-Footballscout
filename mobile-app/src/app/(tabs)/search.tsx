import React, { useCallback, useContext, useMemo, useState } from "react";
import { useFocusEffect } from "@react-navigation/native";
import {
  Alert,
  ActivityIndicator,
  Image,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { router } from "expo-router";
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
      "Tap Zur Liste hinzufugen on unsaved results.",
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

  const localResults = useMemo<SearchPlayerType[]>(() => {
    const term = convert(searchTerm.trim()).toLowerCase();
    if (!term) return [];
    return players.filter(
      (player: PlayerType) =>
        convert(player.name).toLowerCase().includes(term) ||
        convert(player.title).toLowerCase().includes(term) ||
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
      Alert.alert("Error", "Players konnten nicht geladen werden.");
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchPlayers();
    }, [fetchPlayers]),
  );

  function handleChange(text: string) {
    setSearchTerm(text);
    setShowServerResults(false);
    setHasSearched(false);
    setValidationMessage("");
  }

  const handleSearch = async () => {
    const query = convert(searchTerm.trim());
    if (query.length < 3) {
      const message = "Bitte mindestens 3 Zeichen eingeben.";
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
    } catch (error) {
      console.error(error);
      Alert.alert("Error", "Suche fehlgeschlagen.");
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

      Alert.alert("Success", `${getPlayerDisplayName(saved)} wurde zur Liste hinzugefügt.`);
    } catch (error) {
      console.error(error);
      const message = error instanceof Error ? error.message : "Konnte Spieler nicht speichern.";
      Alert.alert("Error", message);
    } finally {
      setSavingByKey((current) => ({ ...current, [key]: false }));
    }
  };

  return (
    <ScreenContainer withTopInset={Platform.OS === "ios"} style={styles.screen}>
      <PageHeaderCard
        icon="search-outline"
        title="Search Players"
        subtitle="Find, review and add new players to your scouting database."
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
        handleChange={handleChange}
        handleSearch={handleSearch}
      />
      <ScrollView style={styles.resultsContainer}>
        {validationMessage ? (
          <View style={[styles.noticeBox, { borderColor: "#ef4444", backgroundColor: Colors[isDark ? "dark" : "light"].card }]}>
            <Text style={{ color: "#ef4444", fontWeight: "700" }}>{validationMessage}</Text>
          </View>
        ) : null}

        {loading ? (
          <View style={styles.center}>
            <ActivityIndicator animating={true} size="large" color="#008fb3" />
          </View>
        ) : isRemoteSearching ? (
          <View style={styles.center}>
            <ActivityIndicator animating={true} size="small" color="#008fb3" />
            <Text style={{ color: Colors[isDark ? "dark" : "light"].notification, marginTop: 8 }}>
              Suche läuft...
            </Text>
          </View>
        ) : hasSearched && results.length === 0 ? (
          <View style={styles.center}>
            <Text style={{ color: Colors[isDark ? "dark" : "light"].notification }}>
              Keine Spieler gefunden.
            </Text>
          </View>
        ) : !searchTerm.trim() ? (
          <View style={styles.center}>
            <Text style={{ color: Colors[isDark ? "dark" : "light"].notification, textAlign: "center" }}>
              Tippe einen Spielernamen für lokale Vorschläge oder starte eine Server-Suche.
            </Text>
          </View>
        ) : (
          results.map((player, index) => {
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
                  backgroundColor: Colors[isDark ? "dark" : "light"].card,
                    borderColor: Colors[isDark ? "dark" : "light"].border,
                  },
                ]}
              >
                <View style={styles.unsavedHeader}>
                  <Image
                    source={{ uri: player.image }}
                    style={styles.unsavedImage}
                  />
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.unsavedName, { color: Colors[isDark ? "dark" : "light"].text }]}>
                      {getPlayerDisplayName(player)}
                    </Text>
                    <Text style={{ color: Colors[isDark ? "dark" : "light"].notification, fontSize: 12 }} numberOfLines={1}>
                      {player.currentClub || player.country || "Unknown club"}
                    </Text>
                    <View style={styles.unsavedPills}>
                      {player.country ? (
                        <View
                          style={[
                            styles.unsavedPill,
                            {
                              backgroundColor: isDark ? "rgba(34,211,238,0.18)" : "rgba(14,165,165,0.14)",
                            },
                          ]}
                        >
                          <Text style={[styles.unsavedPillText, { color: isDark ? "#67e8f9" : "#0e7490" }]}>
                            {player.country}
                          </Text>
                        </View>
                      ) : null}
                      {player.position ? (
                        <View
                          style={[
                            styles.unsavedPill,
                            {
                              backgroundColor: isDark ? "rgba(34,211,238,0.18)" : "rgba(14,165,165,0.14)",
                            },
                          ]}
                        >
                          <Text style={[styles.unsavedPillText, { color: isDark ? "#67e8f9" : "#0e7490" }]}>
                            {player.position}
                          </Text>
                        </View>
                      ) : null}
                    </View>
                  </View>
                </View>
                <Pressable
                  disabled={isSaving}
                  onPress={() => handleSaveToList(player, index)}
                  style={[styles.addButton, isSaving ? styles.addButtonDisabled : undefined]}
                >
                  <Text style={styles.addButtonText}>
                    {isSaving ? "Adding..." : "Zur Liste hinzufügen"}
                  </Text>
                </Pressable>
              </View>
            );
          })
        )}
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  screen: {
    alignItems: "center",
  },
  resultsContainer: {
    flex: 1,
    width: "92%",
  },
  pageHeader: {
    width: "92%",
    marginBottom: 6,
  },
  helpWrap: {
    alignSelf: "flex-start",
  },
  center: {
    width: "100%",
    paddingVertical: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  noticeBox: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 8,
  },
  unsavedCard: {
    borderWidth: 1,
    borderRadius: 14,
    padding: 10,
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
    gap: 10,
  },
  unsavedImage: {
    width: 56,
    height: 56,
    borderRadius: 28,
  },
  unsavedName: {
    fontSize: 16,
    fontWeight: "700",
  },
  unsavedPills: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    marginTop: 6,
  },
  unsavedPill: {
    borderRadius: 999,
    backgroundColor: "rgba(14,165,165,0.14)",
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  unsavedPillText: {
    fontSize: 10,
    fontWeight: "700",
  },
  addButton: {
    backgroundColor: "#008fb3",
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: "center",
  },
  addButtonDisabled: {
    opacity: 0.65,
  },
  addButtonText: {
    color: "#fff",
    fontWeight: "700",
  },
});
