import React, { useCallback, useContext, useEffect, useMemo, useState } from "react";
import { useFocusEffect } from "expo-router";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";
import Colors from "@/src/constants/Colors";
import { AppContext } from "@/src/context/AppContext";
import { useAuth } from "@/src/context/AuthContext";
import {
  addPlayerToWatchlist,
  createWatchlist,
  deleteWatchlist,
  getAllPlayers,
  getWatchlistById,
  getWatchlists,
  reorderWatchlistPlayers,
  removePlayerFromWatchlist,
} from "@/src/apiServices";
import { PlayerType, WatchlistDetails, WatchlistSummary } from "@/src/data/Types";
import ScreenContainer from "@/src/components/ui/ScreenContainer";
import AuthRequiredState from "@/src/components/ui/AuthRequiredState";
import { runAuthorizedRequest } from "@/src/utils/runAuthorizedRequest";
import LoadingState from "@/src/components/ui/LoadingState";
import AppSelect from "@/src/components/ui/AppSelect";
import { getPlayerDisplayName } from "@/src/utils/playerDisplay";
import FeatureGuide, { GuideSection } from "@/src/components/ui/FeatureGuide";
import PageHeaderCard from "@/src/components/ui/PageHeaderCard";
import AppButton from "@/src/components/ui/AppButton";
import PressableScale from "@/src/components/ui/PressableScale";
import AnimatedEntrance from "@/src/components/ui/AnimatedEntrance";
import { numeric, onTint, radius, shadow, spacing } from "@/src/constants/Theme";

function formatBoardDate(value?: string) {
  if (!value) return "n/a";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return "n/a";
  return parsed.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

// Position-colour ring for player avatars — matches the PlayerItem tones.
function positionColor(position?: string) {
  const p = position || "";
  if (p.includes("Forward")) return "#f43f5e";
  if (p.includes("Midfielder")) return "#10b981";
  if (p.includes("Defender")) return "#0ea5e9";
  if (p.includes("Goalkeeper")) return "#f59e0b";
  return "#94a3b8";
}

const watchlistGuideSections: GuideSection[] = [
  {
    id: "boards",
    title: "Create boards",
    description: "Boards help you organize scouting targets by theme or transfer window.",
    steps: [
      "Create a clear board name, then optional description.",
      "Use multiple boards for different age groups or positions.",
      "Tap a board in list to make it active.",
    ],
  },
  {
    id: "players",
    title: "Manage players",
    description: "Add, remove, and reorder players inside active board.",
    steps: [
      "Choose a player from dropdown then tap Add to watchlist.",
      "Use arrow buttons to change tracking order.",
      "Remove players when priorities change.",
    ],
  },
  {
    id: "maintenance",
    title: "Maintenance",
    description: "Keep boards clean and focused for decision making.",
    steps: [
      "Delete old boards that are no longer needed.",
      "Review updated dates to track recent activity.",
      "Keep board count concise for faster workflows.",
    ],
  },
];

export default function WatchlistsScreen() {
  const { isDark } = useContext(AppContext);
  const { session, isAuthenticated, isAuthReady, refreshSession } = useAuth();
  const colorKey = isDark ? "dark" : "light";

  const [watchlists, setWatchlists] = useState<WatchlistSummary[]>([]);
  const [selectedWatchlistId, setSelectedWatchlistId] = useState("");
  const [selectedWatchlist, setSelectedWatchlist] = useState<WatchlistDetails | null>(null);
  const [allPlayers, setAllPlayers] = useState<PlayerType[]>([]);
  const [selectedPlayerId, setSelectedPlayerId] = useState("");
  const [newName, setNewName] = useState("");
  const [newDescription, setNewDescription] = useState("");

  const [isLoadingWatchlists, setIsLoadingWatchlists] = useState(true);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);
  const [isLoadingPlayers, setIsLoadingPlayers] = useState(false);
  const [playersLoadError, setPlayersLoadError] = useState<string | null>(null);
  const [isMutating, setIsMutating] = useState(false);

  const loadWatchlists = useCallback(async () => {
    if (!session) return;
    try {
      setIsLoadingWatchlists(true);
      const data = await runAuthorizedRequest({
        session,
        refreshSession,
        request: (token) => getWatchlists(token),
      });
      setWatchlists(data);
      setSelectedWatchlistId((current) => {
        if (!current && data.length > 0) return data[0]._id;
        if (current && data.some((item) => item._id === current)) return current;
        return data[0]?._id || "";
      });
    } catch (error) {
      console.error(error);
      Alert.alert("Error", "Failed to load watchlists.");
    } finally {
      setIsLoadingWatchlists(false);
    }
  }, [session, refreshSession]);

  const loadPlayers = useCallback(async () => {
    if (!session) {
      setAllPlayers([]);
      return;
    }

    try {
      setIsLoadingPlayers(true);
      setPlayersLoadError(null);
      const data = await runAuthorizedRequest({
        session,
        refreshSession,
        request: (token) => getAllPlayers(token),
      });
      setAllPlayers(data);
    } catch (error) {
      console.error(error);
      setAllPlayers([]);
      setPlayersLoadError(error instanceof Error ? error.message : "Failed to load players.");
    } finally {
      setIsLoadingPlayers(false);
    }
  }, [session, refreshSession]);

  const loadWatchlistDetails = useCallback(async () => {
    if (!session || !selectedWatchlistId) {
      setSelectedWatchlist(null);
      return;
    }
    try {
      setIsLoadingDetails(true);
      const details = await runAuthorizedRequest({
        session,
        refreshSession,
        request: (token) => getWatchlistById(token, selectedWatchlistId),
      });
      setSelectedWatchlist(details);
    } catch (error) {
      console.error(error);
      setSelectedWatchlist(null);
    } finally {
      setIsLoadingDetails(false);
    }
  }, [session, refreshSession, selectedWatchlistId]);

  useFocusEffect(
    useCallback(() => {
      loadPlayers();
      loadWatchlists();
    }, [loadPlayers, loadWatchlists]),
  );

  useEffect(() => {
    loadWatchlistDetails();
  }, [loadWatchlistDetails]);

  const availablePlayers = useMemo(() => {
    const selectedIds = new Set(selectedWatchlist?.playerIds || []);
    return allPlayers.filter((player) => !selectedIds.has(player._id));
  }, [allPlayers, selectedWatchlist?.playerIds]);

  const availablePlayerOptions = useMemo(
    () =>
      availablePlayers.map((player) => ({
        label: `${getPlayerDisplayName(player)} (${player.currentClub || player.country || "Unknown"})`,
        value: player._id,
      })),
    [availablePlayers],
  );

  useEffect(() => {
    if (!selectedPlayerId) return;
    if (availablePlayers.some((player) => player._id === selectedPlayerId)) return;
    setSelectedPlayerId("");
  }, [availablePlayers, selectedPlayerId]);

  const refreshData = useCallback(async () => {
    await loadWatchlists();
  }, [loadWatchlists]);

  const handleCreateWatchlist = useCallback(async () => {
    if (!session) return;
    const normalizedName = newName.trim();
    if (!normalizedName) {
      Alert.alert("Validation", "Watchlist name is required.");
      return;
    }

    try {
      setIsMutating(true);
      const created = await runAuthorizedRequest({
        session,
        refreshSession,
        request: (token) =>
          createWatchlist(token, {
            name: normalizedName,
            description: newDescription.trim(),
          }),
      });
      setNewName("");
      setNewDescription("");
      await refreshData();
      setSelectedWatchlistId(created._id);
      Alert.alert("Success", "Watchlist created.");
    } catch (error) {
      console.error(error);
      const message = error instanceof Error ? error.message : "Failed to create watchlist";
      Alert.alert("Error", message);
    } finally {
      setIsMutating(false);
    }
  }, [session, refreshSession, newName, newDescription, refreshData]);

  const handleDeleteWatchlist = useCallback(async () => {
    if (!session || !selectedWatchlistId) return;

    Alert.alert("Delete watchlist", "Are you sure you want to delete this watchlist?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            setIsMutating(true);
            await runAuthorizedRequest({
              session,
              refreshSession,
              request: (token) => deleteWatchlist(token, selectedWatchlistId),
            });
            setSelectedWatchlistId("");
            await refreshData();
          } catch (error) {
            console.error(error);
            const message = error instanceof Error ? error.message : "Failed to delete watchlist";
            Alert.alert("Error", message);
          } finally {
            setIsMutating(false);
          }
        },
      },
    ]);
  }, [session, refreshSession, selectedWatchlistId, refreshData]);

  const handleAddPlayer = useCallback(async () => {
    if (!session || !selectedWatchlistId || !selectedPlayerId) return;
    try {
      setIsMutating(true);
      await runAuthorizedRequest({
        session,
        refreshSession,
        request: (token) => addPlayerToWatchlist(token, selectedWatchlistId, selectedPlayerId),
      });
      setSelectedPlayerId("");
      await loadWatchlistDetails();
      await loadWatchlists();
    } catch (error) {
      console.error(error);
      const message = error instanceof Error ? error.message : "Failed to add player";
      Alert.alert("Error", message);
    } finally {
      setIsMutating(false);
    }
  }, [
    session,
    refreshSession,
    selectedWatchlistId,
    selectedPlayerId,
    loadWatchlistDetails,
    loadWatchlists,
  ]);

  const handleRemovePlayer = useCallback(
    async (playerId: string) => {
      if (!session || !selectedWatchlistId) return;
      try {
        setIsMutating(true);
        await runAuthorizedRequest({
          session,
          refreshSession,
          request: (token) =>
            removePlayerFromWatchlist(token, selectedWatchlistId, playerId),
        });
        await loadWatchlistDetails();
        await loadWatchlists();
      } catch (error) {
        console.error(error);
        const message = error instanceof Error ? error.message : "Failed to remove player";
        Alert.alert("Error", message);
      } finally {
        setIsMutating(false);
      }
    },
    [session, refreshSession, selectedWatchlistId, loadWatchlistDetails, loadWatchlists],
  );

  const handleMovePlayer = useCallback(
    async (index: number, direction: -1 | 1) => {
      if (!session || !selectedWatchlistId || !selectedWatchlist?.playerIds?.length) return;

      const targetIndex = index + direction;
      if (targetIndex < 0 || targetIndex >= selectedWatchlist.playerIds.length) return;

      const reordered = [...selectedWatchlist.playerIds];
      const [moved] = reordered.splice(index, 1);
      reordered.splice(targetIndex, 0, moved);

      try {
        setIsMutating(true);
        await runAuthorizedRequest({
          session,
          refreshSession,
          request: (token) => reorderWatchlistPlayers(token, selectedWatchlistId, reordered),
        });
        await loadWatchlistDetails();
        await loadWatchlists();
      } catch (error) {
        console.error(error);
        const message = error instanceof Error ? error.message : "Failed to reorder players";
        Alert.alert("Error", message);
      } finally {
        setIsMutating(false);
      }
    },
    [session, refreshSession, selectedWatchlistId, selectedWatchlist?.playerIds, loadWatchlistDetails, loadWatchlists],
  );

  if (!isAuthReady) {
    return <LoadingState />;
  }

  if (!isAuthenticated) {
    return (
      <AuthRequiredState
        message="Watchlists are available only for logged-in users."
      />
    );
  }

  return (
    <ScreenContainer edgeToEdge style={styles.container}>
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        style={styles.pageScroll}
        contentContainerStyle={styles.pageContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <PageHeaderCard
          icon="heart-outline"
          title="Watchlists"
          subtitle="Create personal watchlists and track your target players."
          style={styles.pageHeader}
        >
          <View style={styles.guideRow}>
            <FeatureGuide
              guideId="watchlists"
              title="Watchlists Guide"
              description="Use watchlists to organize player targets and maintain scouting priorities."
              sections={watchlistGuideSections}
              triggerLabel="Watchlists help"
            />
          </View>
        </PageHeaderCard>

        <View
          style={[
            styles.createBox,
            { backgroundColor: Colors[colorKey].card, borderColor: Colors[colorKey].border },
          ]}
        >
          <TextInput
            value={newName}
            onChangeText={setNewName}
            placeholder="Watchlist name"
            placeholderTextColor={Colors[colorKey].notification}
            style={[
              styles.input,
              {
                color: Colors[colorKey].text,
                borderColor: Colors[colorKey].border,
                backgroundColor: Colors[colorKey].background,
              },
            ]}
          />
          <TextInput
            value={newDescription}
            onChangeText={setNewDescription}
            placeholder="Description (optional)"
            placeholderTextColor={Colors[colorKey].notification}
            style={[
              styles.input,
              {
                color: Colors[colorKey].text,
                borderColor: Colors[colorKey].border,
                backgroundColor: Colors[colorKey].background,
              },
            ]}
          />
          <AppButton
            label="Create watchlist"
            icon="add"
            size="md"
            loading={isMutating}
            disabled={isMutating}
            onPress={handleCreateWatchlist}
          />
        </View>

        <View style={styles.boardsSection}>
          <View style={styles.boardsHeaderRow}>
            <View style={styles.sectionTitleRow}>
              <Ionicons name="albums-outline" size={16} color={Colors[colorKey].tint} />
              <Text style={[styles.sectionTitle, { color: Colors[colorKey].text }]}>Your boards</Text>
            </View>
            <View
              style={[
                styles.boardsCountPill,
                {
                  borderColor: Colors[colorKey].border,
                  backgroundColor: Colors[colorKey].card,
                },
              ]}
            >
              <Text style={[styles.boardsCountText, numeric, { color: Colors[colorKey].text }]}>{watchlists.length}</Text>
            </View>
          </View>

          {isLoadingWatchlists ? (
            <View style={styles.center}>
              <ActivityIndicator animating size="small" color={Colors[colorKey].tint} />
            </View>
          ) : watchlists.length === 0 ? (
            <View
              style={[
                styles.emptyBoardsBox,
                {
                  borderColor: Colors[colorKey].border,
                  backgroundColor: Colors[colorKey].card,
                },
              ]}
            >
              <Text style={{ color: Colors[colorKey].notification }}>
                No watchlists available. Create your first board above.
              </Text>
            </View>
          ) : (
            <ScrollView
              style={styles.boardsListScroll}
              contentContainerStyle={styles.boardsList}
              showsVerticalScrollIndicator
              nestedScrollEnabled
            >
              {watchlists.map((item, boardIndex) => {
                const selected = item._id === selectedWatchlistId;
                return (
                  <AnimatedEntrance key={item._id} delay={boardIndex * 55}>
                  <PressableScale
                    scaleTo={0.98}
                    accessibilityRole="button"
                    accessibilityState={{ selected }}
                    accessibilityLabel={item.name}
                    onPress={() => setSelectedWatchlistId(item._id)}
                    style={[
                      styles.boardListItem,
                      {
                        borderColor: selected ? Colors[colorKey].tint : Colors[colorKey].border,
                        backgroundColor: selected
                          ? (isDark ? "rgba(201,226,101,0.10)" : "rgba(215,255,69,0.20)")
                          : Colors[colorKey].card,
                      },
                    ]}
                  >
                    <View style={styles.boardListMain}>
                      <Text style={[styles.boardListTitle, { color: Colors[colorKey].text }]} numberOfLines={1}>
                        {item.name}
                      </Text>
                      <Text
                        style={[styles.boardListDescription, { color: Colors[colorKey].notification }]}
                        numberOfLines={1}
                      >
                        {item.description?.trim() || "No description yet."}
                      </Text>
                    </View>

                    <View style={styles.boardListRight}>
                      <Text style={[styles.boardListUpdatedText, { color: Colors[colorKey].notification }]}>
                        {formatBoardDate(item.updatedAt)}
                      </Text>
                      <View style={styles.boardListActions}>
                        <View
                          style={[
                            styles.boardListCountBadge,
                            {
                              borderColor: Colors[colorKey].border,
                              backgroundColor: Colors[colorKey].background,
                            },
                          ]}
                        >
                          <Ionicons name="people-outline" size={11} color={Colors[colorKey].notification} />
                          <Text style={[styles.boardListCountText, numeric, { color: Colors[colorKey].text }]}>
                            {item.playerCount || 0}
                          </Text>
                        </View>
                        <View
                          style={[
                            styles.boardSelectedIconWrap,
                            {
                              borderColor: selected ? Colors[colorKey].tint : Colors[colorKey].border,
                              backgroundColor: selected ? Colors[colorKey].tint : Colors[colorKey].background,
                            },
                          ]}
                        >
                          <Ionicons
                            name={selected ? "checkmark" : "ellipse-outline"}
                            size={12}
                            color={selected ? onTint(isDark) : Colors[colorKey].notification}
                          />
                        </View>
                      </View>
                    </View>
                  </PressableScale>
                  </AnimatedEntrance>
                );
              })}
            </ScrollView>
          )}
        </View>

        <View
          style={[
            styles.detailsBox,
            { backgroundColor: Colors[colorKey].card, borderColor: Colors[colorKey].border },
          ]}
        >
          {isLoadingDetails ? (
            <View style={styles.center}>
              <ActivityIndicator animating size="small" color={Colors[colorKey].tint} />
            </View>
          ) : !selectedWatchlist ? (
            <Text style={{ color: Colors[colorKey].notification }}>Select a watchlist.</Text>
          ) : (
            <>
              <View style={styles.detailsHeader}>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.watchlistName, { color: Colors[colorKey].text }]}>
                    {selectedWatchlist.name}
                  </Text>
                  {selectedWatchlist.description ? (
                    <Text style={{ color: Colors[colorKey].notification, fontSize: 12 }}>
                      {selectedWatchlist.description}
                    </Text>
                  ) : null}
                  <View style={styles.activeBadgeRow}>
                    <View
                      style={[
                        styles.activeBadge,
                        {
                          borderColor: Colors[colorKey].border,
                          backgroundColor: Colors[colorKey].background,
                        },
                      ]}
                    >
                      <Ionicons name="radio-button-on-outline" size={11} color={Colors[colorKey].tint} />
                      <Text style={[styles.activeBadgeText, { color: Colors[colorKey].notification }]}>
                        Active board
                      </Text>
                    </View>
                  </View>
                </View>
                <PressableScale
                  scaleTo={0.92}
                  accessibilityRole="button"
                  accessibilityLabel="Delete watchlist"
                  onPress={handleDeleteWatchlist}
                  style={[
                    styles.deleteButton,
                    {
                      backgroundColor: Colors[colorKey].card,
                    },
                    isMutating ? styles.disabled : undefined,
                  ]}
                  disabled={isMutating}
                >
                  <Ionicons name="trash-outline" size={16} color="#ef4444" />
                </PressableScale>
              </View>

              <View style={styles.sectionTitleRow}>
                <Ionicons name="person-add-outline" size={16} color={Colors[colorKey].tint} />
                <Text style={[styles.sectionTitle, { color: Colors[colorKey].text }]}>
                  Add player
                </Text>
              </View>
              <View style={styles.selectOverlayLayer}>
                <AppSelect
                  icon="person-outline"
                  placeholder="Choose a player"
                  style={styles.playerSelect}
                  options={availablePlayerOptions}
                  onChange={(value) => setSelectedPlayerId(value || "")}
                  value={selectedPlayerId}
                  disabled={isMutating || isLoadingPlayers}
                />
              </View>
              {isLoadingPlayers ? (
                <Text style={[styles.helperText, { color: Colors[colorKey].notification }]}>
                  Loading players...
                </Text>
              ) : null}
              {!isLoadingPlayers && playersLoadError ? (
                <Text style={[styles.helperText, { color: "#ef4444" }]}>
                  Failed to load players. Check API URL/session and try again.
                </Text>
              ) : null}
              {!isLoadingPlayers && !playersLoadError && availablePlayers.length === 0 ? (
                <Text style={[styles.helperText, { color: Colors[colorKey].notification }]}>
                  No available players to add.
                </Text>
              ) : null}
              <AppButton
                label="Add to watchlist"
                icon="person-add"
                size="md"
                style={styles.addPlayerButton}
                loading={isMutating}
                disabled={
                  !selectedPlayerId || isMutating || isLoadingPlayers || availablePlayers.length === 0
                }
                onPress={handleAddPlayer}
              />

              <View style={[styles.detailsDivider, { backgroundColor: Colors[colorKey].border }]} />

              <View style={[styles.sectionTitleRow, { marginTop: 10 }]}>
                <Ionicons name="people-outline" size={16} color={Colors[colorKey].tint} />
                <Text style={[styles.sectionTitle, { color: Colors[colorKey].text }]}>
                  Players ({selectedWatchlist.players.length})
                </Text>
              </View>
              {selectedWatchlist.players.length === 0 ? (
                <Text style={{ color: Colors[colorKey].notification }}>
                  No players in this watchlist.
                </Text>
              ) : (
                <ScrollView
                  style={styles.playersListScroll}
                  contentContainerStyle={styles.playersListContent}
                  showsVerticalScrollIndicator
                  nestedScrollEnabled
                >
                  {selectedWatchlist.players.map((item, index) => (
                    <AnimatedEntrance key={item._id} delay={index * 55}>
                    <View
                      style={[
                        styles.playerRow,
                        {
                          borderColor: Colors[colorKey].border,
                          backgroundColor: Colors[colorKey].background,
                        },
                      ]}
                    >
                      <View style={styles.playerIdentity}>
                        <Image
                          source={item.image || undefined}
                          style={[styles.playerAvatar, { borderColor: positionColor(item.position) }]}
                          contentFit="cover"
                          cachePolicy="memory-disk"
                          transition={160}
                        />
                        <View style={{ flex: 1 }}>
                          <Text style={{ color: Colors[colorKey].text, fontWeight: "700" }} numberOfLines={1}>
                            {getPlayerDisplayName(item)}
                          </Text>
                          <Text style={{ color: Colors[colorKey].notification, fontSize: 12 }} numberOfLines={1}>
                            {item.currentClub || item.country}
                          </Text>
                        </View>
                      </View>
                      <PressableScale
                        scaleTo={0.9}
                        accessibilityRole="button"
                        accessibilityLabel="Remove player"
                        onPress={() => handleRemovePlayer(item._id)}
                        disabled={isMutating}
                        style={[
                          styles.removeButton,
                          {
                            backgroundColor: Colors[colorKey].card,
                          },
                          isMutating ? styles.disabled : undefined,
                        ]}
                      >
                        <Ionicons name="trash-outline" size={14} color="#ef4444" />
                      </PressableScale>
                      <View style={styles.reorderActions}>
                        <PressableScale
                          scaleTo={0.9}
                          accessibilityRole="button"
                          accessibilityLabel="Move up"
                          disabled={isMutating || index === 0}
                          onPress={() => handleMovePlayer(index, -1)}
                          style={[
                            styles.reorderButton,
                            (isMutating || index === 0) ? styles.disabled : undefined,
                            { borderColor: Colors[colorKey].border, backgroundColor: Colors[colorKey].card },
                          ]}
                        >
                          <Ionicons name="arrow-up" size={14} color={Colors[colorKey].notification} />
                        </PressableScale>
                        <PressableScale
                          scaleTo={0.9}
                          accessibilityRole="button"
                          accessibilityLabel="Move down"
                          disabled={isMutating || index === selectedWatchlist.players.length - 1}
                          onPress={() => handleMovePlayer(index, 1)}
                          style={[
                            styles.reorderButton,
                            (isMutating || index === selectedWatchlist.players.length - 1)
                              ? styles.disabled
                              : undefined,
                            { borderColor: Colors[colorKey].border, backgroundColor: Colors[colorKey].card },
                          ]}
                        >
                          <Ionicons name="arrow-down" size={14} color={Colors[colorKey].notification} />
                        </PressableScale>
                      </View>
                    </View>
                    </AnimatedEntrance>
                  ))}
                </ScrollView>
              )}
            </>
          )}
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 14,
  },
  pageScroll: {
    flex: 1,
    marginTop: 0,
  },
  pageContent: {
    paddingBottom: 10,
  },
  pageHeader: {
    marginBottom: 8,
  },
  guideRow: {
    alignSelf: "flex-start",
  },
  sectionTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 8,
  },
  createBox: {
    borderWidth: 1,
    borderRadius: 14,
    padding: 10,
    marginBottom: 10,
    gap: 7,
  },
  input: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 10,
    fontSize: 14,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: "700",
  },
  boardsSection: {
    marginBottom: 12,
  },
  boardsHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  boardsCountPill: {
    borderWidth: 1,
    borderRadius: 999,
    minWidth: 30,
    height: 24,
    paddingHorizontal: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  boardsCountText: {
    fontSize: 12,
    fontWeight: "700",
  },
  boardsList: {
    gap: 8,
    paddingBottom: 2,
  },
  boardsListScroll: {
    maxHeight: 262,
  },
  boardListItem: {
    borderWidth: 1,
    borderRadius: 11,
    paddingHorizontal: 10,
    paddingVertical: 8,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },
  boardListMain: {
    flex: 1,
    minWidth: 0,
    gap: 2,
  },
  boardListTitle: {
    fontSize: 14,
    fontWeight: "800",
  },
  boardListDescription: {
    fontSize: 12,
    lineHeight: 15,
  },
  boardListRight: {
    alignItems: "flex-end",
    justifyContent: "center",
    gap: 6,
  },
  boardListUpdatedText: {
    fontSize: 10,
    fontWeight: "500",
  },
  boardListActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  boardListCountBadge: {
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 7,
    paddingVertical: 3,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  boardListCountText: {
    fontSize: 11,
    fontWeight: "700",
  },
  boardSelectedIconWrap: {
    width: 20,
    height: 20,
    borderWidth: 1,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyBoardsBox: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  detailsBox: {
    borderWidth: 1,
    borderRadius: 14,
    padding: 12,
    marginBottom: 12,
  },
  detailsHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    marginBottom: 10,
    gap: 10,
  },
  watchlistName: {
    fontSize: 18,
    fontWeight: "800",
  },
  activeBadgeRow: {
    marginTop: 8,
  },
  activeBadge: {
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 4,
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  activeBadgeText: {
    fontSize: 11,
    fontWeight: "600",
  },
  selectOverlayLayer: {
    zIndex: 1,
    elevation: 0,
  },
  playerSelect: {
    flex: 0,
    width: "100%",
  },
  helperText: {
    marginTop: 6,
    fontSize: 12,
  },
  addPlayerButton: {
    marginTop: 8,
  },
  deleteButton: {
    borderWidth: 1,
    borderColor: "#ef4444",
    borderRadius: 10,
    width: 40,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
  },
  detailsDivider: {
    width: "100%",
    height: 1,
    marginTop: 10,
    marginBottom: 2,
    opacity: 0.6,
  },
  playerRow: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 9,
    flexDirection: "row",
    alignItems: "center",
  },
  playersListScroll: {
    maxHeight: 296,
  },
  playersListContent: {
    gap: 8,
    paddingBottom: 2,
  },
  playerIdentity: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  playerAvatar: {
    width: 34,
    height: 34,
    borderRadius: 17,
    borderWidth: 2,
    backgroundColor: "#dbe4ec",
  },
  removeButton: {
    borderWidth: 1,
    borderColor: "#ef4444",
    borderRadius: 10,
    width: 34,
    height: 30,
    alignItems: "center",
    justifyContent: "center",
  },
  reorderActions: {
    marginLeft: 8,
    gap: 6,
  },
  reorderButton: {
    borderWidth: 1,
    borderRadius: 8,
    width: 28,
    height: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  center: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 18,
  },
  disabled: {
    opacity: 0.6,
  },
});
