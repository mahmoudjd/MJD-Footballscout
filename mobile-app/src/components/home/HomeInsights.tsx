import React, { useCallback, useContext, useEffect, useMemo, useState } from "react";
import {
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Colors from "@/src/constants/Colors";
import { AppContext } from "@/src/context/AppContext";
import { getPlayersHighlights, getPlayersStats } from "@/src/apiServices";
import {
  PlayerHighlightsResponse,
  PlayerStatsResponse,
} from "@/src/data/Types";
import HomeInsightsSkeleton from "@/src/components/home/HomeInsightsSkeleton";
import StatTile from "@/src/components/home/StatTile";
import RankedList from "@/src/components/home/RankedList";
import PlayerSpotlightList from "@/src/components/home/PlayerSpotlightList";
import PageHeaderCard from "@/src/components/ui/PageHeaderCard";

export default function HomeInsights() {
  const { isDark } = useContext(AppContext);
  const colorKey = isDark ? "dark" : "light";
  const { width } = useWindowDimensions();
  const isCompact = width < 420;

  const [stats, setStats] = useState<PlayerStatsResponse | null>(null);
  const [highlights, setHighlights] = useState<PlayerHighlightsResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const loadInsights = useCallback(async () => {
    try {
      setErrorMessage(null);
      const [statsResult, highlightsResult] = await Promise.all([
        getPlayersStats(),
        getPlayersHighlights(),
      ]);
      setStats(statsResult);
      setHighlights(highlightsResult);
    } catch (error) {
      console.error(error);
      setErrorMessage("Insights konnten nicht geladen werden.");
    }
  }, []);

  useEffect(() => {
    const bootstrap = async () => {
      setIsLoading(true);
      await loadInsights();
      setIsLoading(false);
    };
    bootstrap();
  }, [loadInsights]);

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    await loadInsights();
    setIsRefreshing(false);
  }, [loadInsights]);

  const latestUpdate = useMemo(() => {
    if (!stats?.latestUpdate) return "Not available";
    return new Date(stats.latestUpdate).toLocaleString();
  }, [stats?.latestUpdate]);

  if (isLoading) {
    return <HomeInsightsSkeleton />;
  }

  if (!stats || !highlights || errorMessage) {
    return (
      <View style={styles.center}>
        <Text style={[styles.errorTitle, { color: Colors[colorKey].text }]}>
          Insights unavailable
        </Text>
        <Text style={[styles.errorText, { color: Colors[colorKey].notification }]}>
          {errorMessage || "The backend data feed is currently not reachable."}
        </Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} tintColor="#008fb3" />
      }
      contentContainerStyle={styles.contentContainer}
    >
      <PageHeaderCard
        icon="flash-outline"
        title="Live Player Insights"
        subtitle="Combined stats and highlights from your current database."
        style={styles.pageHeader}
      >
        <View
          style={[
            styles.syncBadge,
            {
              borderColor: Colors[colorKey].border,
              backgroundColor: isDark ? "rgba(34,211,238,0.14)" : "rgba(14,165,165,0.1)",
            },
          ]}
        >
          <Ionicons name="time-outline" size={13} color={Colors[colorKey].tint} />
          <Text style={[styles.syncText, { color: Colors[colorKey].notification }]}>Last sync: {latestUpdate}</Text>
        </View>
      </PageHeaderCard>

      <View style={[styles.statsRow, isCompact ? styles.columnLayout : null]}>
        <StatTile label="Total Players" value={stats.totalPlayers} />
        <StatTile label="Average Age" value={stats.averageAge} />
        <StatTile label="Average ELO" value={stats.averageElo} />
      </View>

      <View style={[styles.doubleCardRow, isCompact ? styles.columnLayout : null]}>
        <RankedList
          title="Top Positions"
          emptyText="No position data available."
          items={stats.positions.slice(0, 4).map((entry) => ({
            key: entry.position,
            label: entry.position,
            value: entry.count,
          }))}
        />
        <RankedList
          title="Top Countries"
          emptyText="No country data available."
          items={stats.topCountries.map((entry) => ({
            key: entry.country,
            label: entry.country,
            value: entry.count,
          }))}
        />
      </View>

      <View style={styles.spotlights}>
        <PlayerSpotlightList
          title="Top ELO Players"
          players={highlights.topEloPlayers}
          emptyText="No player rankings available."
        />
        <PlayerSpotlightList
          title="Young Talents"
          players={highlights.youngTalents}
          emptyText="No young talents found."
        />
        <PlayerSpotlightList
          title="Market Leaders"
          players={highlights.marketLeaders}
          emptyText="No market value data available."
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: "100%",
  },
  contentContainer: {
    paddingHorizontal: 14,
    paddingTop: 0,
    paddingBottom: 16,
    gap: 12,
  },
  pageHeader: {},
  center: {
    width: "100%",
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
  },
  statsRow: {
    flexDirection: "row",
    gap: 10,
  },
  doubleCardRow: {
    flexDirection: "row",
    gap: 10,
  },
  spotlights: {
    gap: 10,
  },
  columnLayout: {
    flexDirection: "column",
  },
  syncText: {
    fontSize: 12,
    fontWeight: "600",
  },
  syncBadge: {
    borderWidth: 1,
    borderRadius: 999,
    alignSelf: "flex-start",
    paddingHorizontal: 8,
    paddingVertical: 4,
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: "800",
  },
  errorText: {
    textAlign: "center",
    fontSize: 14,
    marginTop: 6,
  },
});
