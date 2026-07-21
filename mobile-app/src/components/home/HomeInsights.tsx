import React, { useCallback, useContext, useEffect, useMemo, useState } from "react";
import {
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
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
import { onTint, radius, shadow, spacing } from "@/src/constants/Theme";

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
      setErrorMessage("Insights could not be loaded.");
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
      <ScrollView contentInsetAdjustmentBehavior="automatic" contentContainerStyle={styles.errorContent}>
        <PageHeaderCard
          icon="pulse-outline"
          title="Player Intelligence"
          subtitle="Live scouting signals from your player database."
        />
        <View style={[styles.errorCard, { backgroundColor: Colors[colorKey].card, borderColor: Colors[colorKey].border }]}>
          <View style={[styles.errorIcon, { backgroundColor: Colors[colorKey].surfaceSoft }]}>
            <Ionicons name="cloud-offline-outline" size={28} color={Colors[colorKey].tint} />
          </View>
          <Text style={[styles.errorTitle, { color: Colors[colorKey].text }]}>Insights unavailable</Text>
          <Text style={[styles.errorText, { color: Colors[colorKey].notification }]}> 
            {errorMessage || "The backend data feed is currently not reachable."}
          </Text>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Retry loading insights"
            onPress={async () => {
              setIsLoading(true);
              await loadInsights();
              setIsLoading(false);
            }}
            style={({ pressed }) => [styles.retryButton, { backgroundColor: Colors[colorKey].accent, opacity: pressed ? 0.76 : 1 }]}
          >
            <Ionicons name="refresh" size={18} color={Colors[colorKey].accentText} />
            <Text style={[styles.retryText, { color: Colors[colorKey].accentText }]}>Try again</Text>
          </Pressable>
        </View>
      </ScrollView>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentInsetAdjustmentBehavior="automatic"
      refreshControl={
        <RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} tintColor={Colors[colorKey].tint} />
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
              backgroundColor: isDark ? "rgba(215,255,69,0.10)" : "rgba(215,255,69,0.28)",
            },
          ]}
        >
          <Ionicons name="time-outline" size={13} color={Colors[colorKey].tint} />
          <Text style={[styles.syncText, { color: Colors[colorKey].notification }]}>Last sync: {latestUpdate}</Text>
        </View>
      </PageHeaderCard>

      <Pressable
        accessibilityRole="search"
        accessibilityLabel="Search players"
        accessibilityHint="Opens the search screen"
        onPress={() => router.push("/search")}
        style={({ pressed }) => [
          styles.heroSearch,
          shadow(isDark).md,
          {
            backgroundColor: Colors[colorKey].tint,
            opacity: pressed ? 0.9 : 1,
          },
        ]}
      >
        <View style={[styles.heroSearchIcon, { backgroundColor: isDark ? "rgba(10,33,24,0.14)" : "rgba(255,255,255,0.16)" }]}>
          <Ionicons name="search" size={20} color={onTint(isDark)} />
        </View>
        <View style={styles.heroSearchText}>
          <Text style={[styles.heroSearchTitle, { color: onTint(isDark) }]}>Search any player</Text>
          <Text style={[styles.heroSearchSub, { color: onTint(isDark), opacity: 0.72 }]} numberOfLines={1}>
            By name, club, country or position
          </Text>
        </View>
        <View style={[styles.heroSearchCta, { backgroundColor: isDark ? "rgba(10,33,24,0.16)" : "rgba(255,255,255,0.18)" }]}>
          <Ionicons name="arrow-forward" size={18} color={onTint(isDark)} />
        </View>
      </Pressable>

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
    paddingHorizontal: 16,
    paddingTop: 0,
    paddingBottom: 16,
    gap: 16,
  },
  pageHeader: {},
  heroSearch: {
    borderRadius: radius.lg,
    paddingVertical: 14,
    paddingLeft: 14,
    paddingRight: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },
  heroSearchIcon: {
    width: 44,
    height: 44,
    borderRadius: radius.md,
    alignItems: "center",
    justifyContent: "center",
  },
  heroSearchText: {
    flex: 1,
  },
  heroSearchTitle: {
    fontSize: 16,
    fontWeight: "900",
    letterSpacing: -0.3,
  },
  heroSearchSub: {
    fontSize: 12,
    marginTop: 2,
    fontWeight: "600",
  },
  heroSearchCta: {
    width: 38,
    height: 38,
    borderRadius: radius.md,
    alignItems: "center",
    justifyContent: "center",
  },
  errorContent: {
    flexGrow: 1,
    paddingHorizontal: 16,
    paddingBottom: 24,
    gap: 16,
  },
  errorCard: {
    flex: 1,
    minHeight: 320,
    borderWidth: 1,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 28,
    paddingVertical: 36,
  },
  errorIcon: {
    width: 64,
    height: 64,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 18,
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
    lineHeight: 21,
    marginTop: 6,
    maxWidth: 300,
  },
  retryButton: {
    minHeight: 48,
    borderRadius: 16,
    marginTop: 22,
    paddingHorizontal: 22,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  retryText: {
    fontSize: 14,
    fontWeight: "800",
  },
});
