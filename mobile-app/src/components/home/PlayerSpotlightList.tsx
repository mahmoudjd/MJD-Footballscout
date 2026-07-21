import React, { useContext } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Image } from "expo-image";
import { Link } from "expo-router";
import Colors from "@/src/constants/Colors";
import { AppContext } from "@/src/context/AppContext";
import { PlayerHighlightItem } from "@/src/data/Types";
import { radius, shadow, spacing, typography } from "@/src/constants/Theme";

type Props = {
  title: string;
  players: PlayerHighlightItem[];
  emptyText: string;
};

export default function PlayerSpotlightList({ title, players, emptyText }: Props) {
  const { isDark } = useContext(AppContext);
  const colorKey = isDark ? "dark" : "light";
  const colors = Colors[colorKey];
  const valueColor = isDark ? colors.accent : "#4d7c0f";
  // Amber ELO badge, matching the web PlayerSpotlightList.
  const eloBadgeBg = isDark ? "rgba(245,158,11,0.18)" : "rgba(245,158,11,0.12)";
  const eloBadgeText = isDark ? "#fbbf24" : "#b45309";

  return (
    <View
      style={[
        styles.container,
        shadow(isDark).sm,
        {
          backgroundColor: colors.card,
          borderColor: colors.border,
        },
      ]}
    >
      <Text style={[styles.title, { color: colors.text }]}>{title}</Text>

      {players.length === 0 ? (
        <Text style={[styles.emptyText, { color: colors.notification }]}>
          {emptyText}
        </Text>
      ) : (
        <View style={styles.list}>
          {players.slice(0, 4).map((player) => (
            <Link key={player._id} href={`/${player._id}`} asChild>
              <Pressable
                style={({ pressed }) => [
                  styles.rowCard,
                  { backgroundColor: colors.surfaceSoft, borderColor: colors.border },
                  pressed ? styles.rowPressed : null,
                ]}
              >
                <View style={styles.rowInner}>
                  <Image
                    source={player.image || undefined}
                    style={[styles.avatar, { backgroundColor: colors.card }]}
                    contentFit="cover"
                    cachePolicy="memory-disk"
                    transition={160}
                  />
                  <View style={styles.identity}>
                    <Text style={[styles.name, { color: colors.text }]} numberOfLines={1}>
                      {player.name}
                    </Text>
                    <Text style={[styles.meta, { color: colors.notification }]} numberOfLines={1}>
                      {player.currentClub || player.country}
                    </Text>
                  </View>
                  <View style={styles.rightMetrics}>
                    <View style={[styles.eloBadge, { backgroundColor: eloBadgeBg }]}>
                      <Text style={[styles.eloText, { color: eloBadgeText }]}>ELO {player.elo}</Text>
                    </View>
                    <Text style={[styles.valueText, { color: valueColor }]} numberOfLines={1}>
                      {player.value} {player.currency}
                    </Text>
                  </View>
                </View>
              </Pressable>
            </Link>
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderWidth: 1,
    borderRadius: radius.lg,
    padding: spacing.md,
    flex: 1,
  },
  title: {
    ...typography.subheading,
    marginBottom: spacing.md,
  },
  emptyText: {
    fontSize: 13,
  },
  list: {
    gap: 7,
  },
  rowCard: {
    borderWidth: 1,
    borderRadius: radius.md,
    paddingVertical: 8,
    paddingHorizontal: 10,
  },
  rowInner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  rowPressed: {
    opacity: 0.7,
  },
  avatar: {
    width: 42,
    height: 42,
    borderRadius: radius.pill,
  },
  identity: {
    flex: 1,
    minWidth: 0,
  },
  name: {
    fontSize: 13.5,
    fontWeight: "800",
  },
  meta: {
    fontSize: 11,
    marginTop: 2,
    fontWeight: "500",
  },
  rightMetrics: {
    alignItems: "flex-end",
    gap: 3,
  },
  eloBadge: {
    borderRadius: radius.pill,
    paddingHorizontal: 9,
    paddingVertical: 3,
    minWidth: 34,
    alignItems: "center",
  },
  eloText: {
    fontSize: 11,
    fontWeight: "900",
  },
  valueText: {
    fontSize: 11,
    fontWeight: "800",
  },
});
