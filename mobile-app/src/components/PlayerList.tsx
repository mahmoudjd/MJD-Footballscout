import React, { useCallback, useContext, useMemo, useState } from "react";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  Pressable,
  FlatList,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Filter from "../components/Filter";
import { AdvancedSortBy, AdvancedSortOrder, PlayerType } from "../data/Types";
import Colors from "../constants/Colors";
import { AppContext } from "../context/AppContext";
import Pagination from "../components/Pagination";
import { getAdvancedPlayers, getAllPlayers, updateAllPlayers } from "../apiServices";
import { useAuth } from "../context/AuthContext";
import { runAuthorizedRequest } from "@/src/utils/runAuthorizedRequest";
import PlayerItem from "@/src/components/PlayerItem";
import AppSelect from "@/src/components/ui/AppSelect";
import FeatureGuide, { GuideSection } from "@/src/components/ui/FeatureGuide";
import PageHeaderCard from "@/src/components/ui/PageHeaderCard";

type SortByOption = AdvancedSortBy | "";
type SortOrderOption = AdvancedSortOrder | "";
type AgeGroup = "" | "<20" | "20-30" | "30-40" | ">40";

const playerFiltersGuideSections: GuideSection[] = [
  {
    id: "filters",
    title: "Filter and sort",
    description: "Use quick filters to narrow down long player lists.",
    steps: [
      "Combine position, age, country, and market value filters.",
      "Switch sort by ELO, age, value, or name.",
      "Use Reset to return to full list.",
    ],
  },
  {
    id: "pagination",
    title: "Pagination",
    description: "Adjust visible rows for faster scanning.",
    steps: [
      "Change items per page from select dropdown.",
      "Use Prev and Next to navigate result pages.",
      "Wait for Updating page indicator before next action.",
    ],
  },
  {
    id: "roles",
    title: "Role-based actions",
    description: "Admin and user roles have different capabilities.",
    steps: [
      "All users can search, filter, and open profiles.",
      "Only admins can run update-all action from top bar.",
      "Delete action remains admin-only on player profile.",
    ],
  },
];

function parseNumberInput(value: string) {
  const normalized = value.trim();
  if (!normalized) return undefined;
  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : undefined;
}

function normalizeAgeRange(selectedAgeGroup: AgeGroup, minAgeInput: string, maxAgeInput: string) {
  let ageGroupMin: number | undefined;
  let ageGroupMax: number | undefined;

  if (selectedAgeGroup === "<20") ageGroupMax = 19;
  if (selectedAgeGroup === "20-30") {
    ageGroupMin = 20;
    ageGroupMax = 30;
  }
  if (selectedAgeGroup === "30-40") {
    ageGroupMin = 31;
    ageGroupMax = 40;
  }
  if (selectedAgeGroup === ">40") ageGroupMin = 41;

  const customMin = parseNumberInput(minAgeInput);
  const customMax = parseNumberInput(maxAgeInput);

  const minCandidates = [ageGroupMin, customMin].filter((value): value is number => typeof value === "number");
  const maxCandidates = [ageGroupMax, customMax].filter((value): value is number => typeof value === "number");

  const minAge = minCandidates.length > 0 ? Math.max(...minCandidates) : undefined;
  const maxAge = maxCandidates.length > 0 ? Math.min(...maxCandidates) : undefined;

  return { minAge, maxAge };
}

export default function PlayerList() {
  const navigation = useNavigation();
  const { isDark } = useContext(AppContext);
  const { session, isAdmin, refreshSession } = useAuth();

  const [players, setPlayers] = useState<PlayerType[]>([]);
  const [nationalities, setNationalities] = useState<{ label: string; value: string }[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isPageLoading, setIsPageLoading] = useState(false);
  const [showPageLoadingIndicator, setShowPageLoadingIndicator] = useState(false);
  const [hasLoadedOnce, setHasLoadedOnce] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [isUpdatingAll, setIsUpdatingAll] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [elemsPerPage, setElemsPerPage] = useState(10);
  const [totalPlayers, setTotalPlayers] = useState(0);

  const [selectedPosition, setSelectedPosition] = useState("");
  const [selectedAgeGroup, setSelectedAgeGroup] = useState<AgeGroup>("");
  const [selectedNationality, setSelectedNationality] = useState("");
  const [clubQuery, setClubQuery] = useState("");
  const [minAge, setMinAge] = useState("");
  const [maxAge, setMaxAge] = useState("");
  const [minValue, setMinValue] = useState("");
  const [maxValue, setMaxValue] = useState("");
  const [sortBy, setSortBy] = useState<SortByOption>("");
  const [sortOrder, setSortOrder] = useState<SortOrderOption>("");
  const playersPageCacheRef = React.useRef<Map<string, { items: PlayerType[]; total: number }>>(new Map());

  const totalPages = Math.max(1, Math.ceil(totalPlayers / elemsPerPage));

  const fetchNationalities = useCallback(async () => {
    try {
      const data = await getAllPlayers();
      const countries = Array.from(
        new Set(
          data
            .map((player) => (player.country || "").trim())
            .filter(Boolean),
        ),
      ).sort((a, b) => a.localeCompare(b));

      setNationalities(
        countries.map((country) => ({
          label: country,
          value: country,
        })),
      );
    } catch (error) {
      console.error(error);
    }
  }, []);

  const fetchFilteredData = useCallback(async (options?: { force?: boolean }) => {
    const { minAge: normalizedMinAge, maxAge: normalizedMaxAge } = normalizeAgeRange(
      selectedAgeGroup,
      minAge,
      maxAge,
    );
    const minValueAmount = parseNumberInput(minValue);
    const maxValueAmount = parseNumberInput(maxValue);

    if (
      (normalizedMinAge !== undefined && normalizedMaxAge !== undefined && normalizedMinAge > normalizedMaxAge) ||
      (minValueAmount !== undefined && maxValueAmount !== undefined && minValueAmount > maxValueAmount)
    ) {
      setPlayers([]);
      setTotalPlayers(0);
      setErrorMessage("Filter range is invalid.");
      setLoading(false);
      setIsPageLoading(false);
      return;
    }

    const requestParams = {
      position: selectedPosition || undefined,
      country: selectedNationality || undefined,
      club: clubQuery || undefined,
      minAge: normalizedMinAge,
      maxAge: normalizedMaxAge,
      minValue: minValueAmount,
      maxValue: maxValueAmount,
      sortBy: sortBy || undefined,
      order: sortOrder || undefined,
      limit: elemsPerPage,
      offset: (currentPage - 1) * elemsPerPage,
    } as const;

    const cacheKey = JSON.stringify({
      ...requestParams,
      position: requestParams.position ?? null,
      country: requestParams.country ?? null,
      club: requestParams.club ?? null,
      minAge: requestParams.minAge ?? null,
      maxAge: requestParams.maxAge ?? null,
      minValue: requestParams.minValue ?? null,
      maxValue: requestParams.maxValue ?? null,
      sortBy: requestParams.sortBy ?? null,
      order: requestParams.order ?? null,
    });

    if (!options?.force) {
      const cachedPage = playersPageCacheRef.current.get(cacheKey);
      if (cachedPage) {
        setPlayers(cachedPage.items);
        setTotalPlayers(cachedPage.total);
        setErrorMessage("");
        setLoading(false);
        setIsPageLoading(false);
        if (!hasLoadedOnce) {
          setHasLoadedOnce(true);
        }
        return;
      }
    }

    try {
      if (!hasLoadedOnce) {
        setLoading(true);
      } else {
        setIsPageLoading(true);
      }
      setErrorMessage("");

      const response = await getAdvancedPlayers(requestParams);

      setPlayers(response.items);
      setTotalPlayers(response.total);
      playersPageCacheRef.current.set(cacheKey, {
        items: response.items,
        total: response.total,
      });
      if (!hasLoadedOnce) {
        setHasLoadedOnce(true);
      }
    } catch (error) {
      console.error(error);
      if (!hasLoadedOnce) {
        setPlayers([]);
        setTotalPlayers(0);
      }
      setErrorMessage("Error: failed to fetch players.");
    } finally {
      setLoading(false);
      setIsPageLoading(false);
    }
  }, [
    hasLoadedOnce,
    selectedPosition,
    selectedAgeGroup,
    selectedNationality,
    clubQuery,
    minAge,
    maxAge,
    minValue,
    maxValue,
    sortBy,
    sortOrder,
    elemsPerPage,
    currentPage,
  ]);

  React.useEffect(() => {
    if (!isPageLoading) {
      setShowPageLoadingIndicator(false);
      return;
    }

    const timeout = setTimeout(() => {
      setShowPageLoadingIndicator(true);
    }, 180);

    return () => {
      clearTimeout(timeout);
    };
  }, [isPageLoading]);

  useFocusEffect(
    useCallback(() => {
      fetchFilteredData();
    }, [fetchFilteredData]),
  );

  useFocusEffect(
    useCallback(() => {
      fetchNationalities();
    }, [fetchNationalities]),
  );

  const handleUpdateAllPlayers = useCallback(async () => {
    if (!isAdmin) {
      Alert.alert("Forbidden", "Only admins can update all players.");
      return;
    }

    if (!session?.accessToken) {
      Alert.alert("Login required", "Bitte zuerst einloggen.");
      return;
    }

    try {
      setIsUpdatingAll(true);
      const response = await runAuthorizedRequest({
        session,
        refreshSession,
        request: (token) => updateAllPlayers(token),
      });
      Alert.alert("Success", response.message || "Alle Spieler wurden aktualisiert.");
      playersPageCacheRef.current.clear();
      await fetchNationalities();
      await fetchFilteredData({ force: true });
    } catch (error) {
      console.error(error);
      const message = error instanceof Error ? error.message : "Update failed";
      Alert.alert("Error", message);
    } finally {
      setIsUpdatingAll(false);
    }
  }, [isAdmin, session, refreshSession, fetchNationalities, fetchFilteredData]);

  const confirmUpdateAll = useCallback(() => {
    if (!isAdmin) {
      Alert.alert("Forbidden", "Only admins can update all players.");
      return;
    }

    Alert.alert(
      "Alle Spieler aktualisieren",
      "Möchtest du wirklich alle Spieler neu laden?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Update",
          style: "default",
          onPress: handleUpdateAllPlayers,
        },
      ],
    );
  }, [isAdmin, handleUpdateAllPlayers]);

  const resetFilters = useCallback(() => {
    setSelectedPosition("");
    setSelectedAgeGroup("");
    setSelectedNationality("");
    setClubQuery("");
    setMinAge("");
    setMaxAge("");
    setMinValue("");
    setMaxValue("");
    setSortBy("");
    setSortOrder("");
    setCurrentPage(1);
  }, []);

  const renderPlayerOfPage = (page: number) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
  };

  const pageSizeOptions = useMemo(
    () => [
      { label: "5", value: "5" },
      { label: "10", value: "10" },
      { label: "25", value: "25" },
    ],
    [],
  );

  React.useEffect(() => {
    const headerIconColor = Colors[isDark ? "dark" : "light"].text;

    navigation.setOptions({
      headerRight: () => (
        <View style={{ flexDirection: "row", alignItems: "center", gap: 10, marginRight: 8 }}>
          {isAdmin ? (
            <Pressable disabled={isUpdatingAll} onPress={confirmUpdateAll}>
              <Ionicons name="cloud-download-outline" size={24} color={headerIconColor} />
            </Pressable>
          ) : null}
          <Pressable
            onPress={async () => {
              playersPageCacheRef.current.clear();
              await fetchNationalities();
              await fetchFilteredData({ force: true });
            }}
          >
            <Text>
              <Ionicons name="refresh" size={24} color={headerIconColor} />
            </Text>
          </Pressable>
        </View>
      ),
    });
  }, [navigation, fetchFilteredData, fetchNationalities, confirmUpdateAll, isAdmin, isUpdatingAll, isDark]);

  return (
    <View
      style={[
        { backgroundColor: Colors[isDark ? "dark" : "light"].background },
        styles.container,
      ]}
    >
      <PageHeaderCard
        icon="people-outline"
        title="Player Directory"
        subtitle={`${
          totalPlayers
        } result${totalPlayers === 1 ? "" : "s"} in the current filtered dataset.`}
        style={styles.pageHeader}
      >
        <View style={styles.headerActionsRow}>
          <View
            style={[
              styles.countBadge,
              {
                borderColor: Colors[isDark ? "dark" : "light"].border,
                backgroundColor: isDark ? "rgba(34,211,238,0.15)" : "rgba(14,165,165,0.1)",
              },
            ]}
          >
            <Ionicons name="funnel-outline" size={12} color={Colors[isDark ? "dark" : "light"].tint} />
            <Text style={[styles.countBadgeText, { color: Colors[isDark ? "dark" : "light"].text }]}>
              Active filters supported
            </Text>
          </View>
        </View>
        <FeatureGuide
          guideId="players-filters"
          title="Players Guide"
          description="Learn how to filter, sort, and manage players efficiently."
          sections={playerFiltersGuideSections}
          triggerLabel="Filter help"
        />
      </PageHeaderCard>

      <Filter
        nationalities={nationalities}
        selectedPosition={selectedPosition}
        selectedAgeGroup={selectedAgeGroup}
        selectedNationality={selectedNationality}
        clubQuery={clubQuery}
        minAge={minAge}
        maxAge={maxAge}
        minValue={minValue}
        maxValue={maxValue}
        sortBy={sortBy}
        sortOrder={sortOrder}
        onPositionChange={(value) => {
          setSelectedPosition(value);
          setCurrentPage(1);
        }}
        onAgeGroupChange={(value) => {
          setSelectedAgeGroup(value);
          setCurrentPage(1);
        }}
        onNationalityChange={(value) => {
          setSelectedNationality(value);
          setCurrentPage(1);
        }}
        onClubQueryChange={(value) => {
          setClubQuery(value);
          setCurrentPage(1);
        }}
        onMinAgeChange={(value) => {
          setMinAge(value);
          setCurrentPage(1);
        }}
        onMaxAgeChange={(value) => {
          setMaxAge(value);
          setCurrentPage(1);
        }}
        onMinValueChange={(value) => {
          setMinValue(value);
          setCurrentPage(1);
        }}
        onMaxValueChange={(value) => {
          setMaxValue(value);
          setCurrentPage(1);
        }}
        onSortByChange={(value) => {
          setSortBy(value);
          setCurrentPage(1);
        }}
        onSortOrderChange={(value) => {
          setSortOrder(value as SortOrderOption);
          setCurrentPage(1);
        }}
        onReset={resetFilters}
      />

      <View
        style={[
          styles.pageSizeRow,
          {
            borderColor: Colors[isDark ? "dark" : "light"].border,
            backgroundColor: Colors[isDark ? "dark" : "light"].card,
          },
        ]}
      >
        <Text style={{ color: Colors[isDark ? "dark" : "light"].notification, fontSize: 12, fontWeight: "600" }}>
          Items per page
        </Text>
        <AppSelect
          icon="list-outline"
          compact
          style={styles.pageSizeSelect}
          placeholder="Items"
          options={pageSizeOptions}
          value={String(elemsPerPage)}
          disabled={loading || isPageLoading}
          onChange={(value) => {
            const parsed = Number(value);
            if (parsed === 5 || parsed === 10 || parsed === 25) {
              setElemsPerPage(parsed);
              setCurrentPage(1);
            }
          }}
        />
      </View>

      {loading && !hasLoadedOnce ? (
        <View style={styles.center}>
          <ActivityIndicator animating={true} size="large" color="#008fb3" />
        </View>
      ) : errorMessage ? (
        <View style={styles.errorBox}>
          <Text style={styles.errorText}>{errorMessage}</Text>
        </View>
      ) : players.length === 0 ? (
        <View style={styles.errorBox}>
          <Text style={{ color: Colors[isDark ? "dark" : "light"].notification }}>
            No players found for current filters.
          </Text>
        </View>
      ) : (
        <>
          {showPageLoadingIndicator ? (
            <View style={styles.pageLoadingRow}>
              <ActivityIndicator size="small" color="#008fb3" />
              <Text style={{ color: Colors[isDark ? "dark" : "light"].notification }}>
                Updating page...
              </Text>
            </View>
          ) : null}

          <Pagination
            renderPlayerOfPage={renderPlayerOfPage}
            totalPages={totalPages}
            currentPage={currentPage}
            isLoading={isPageLoading}
          />

          <FlatList
            data={players}
            renderItem={({ item }) => <PlayerItem player={item} />}
            numColumns={1}
            keyExtractor={(item) => item._id}
            contentContainerStyle={{ gap: 0, padding: 5, paddingBottom: 20 }}
          />
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  errorBox: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  errorText: {
    fontSize: 16,
    color: "red",
    textAlign: "center",
  },
  container: {
    width: "100%",
    flex: 1,
    marginBottom: 5,
    paddingHorizontal: 15,
  },
  pageHeader: {
    marginBottom: 8,
  },
  headerActionsRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  countBadge: {
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 9,
    paddingVertical: 4,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 5,
  },
  countBadgeText: {
    fontSize: 11,
    fontWeight: "700",
  },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  pageSizeRow: {
    marginTop: 7,
    marginBottom: 7,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 8,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  pageSizeSelect: {
    maxWidth: 120,
    minWidth: 96,
    flex: 0,
  },
  pageLoadingRow: {
    marginTop: 6,
    marginBottom: 4,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
});
