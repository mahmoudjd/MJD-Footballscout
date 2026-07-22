import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";
import { PlayerType } from "../data/Types";
import Colors from "../constants/Colors";
import { AppContext } from "../context/AppContext";
import { Link } from "expo-router";
import PressableScale from "@/src/components/ui/PressableScale";
import { getPlayerDisplayName, safeDecodeURIComponent } from "@/src/utils/playerDisplay";
import { numeric, radius, shadow, spacing } from "@/src/constants/Theme";

interface Props {
  player: PlayerType;
}

const getPosition = (position: string) => {
  return position.includes("Forward")
    ? "Forward"
    : position.includes("Defender")
      ? "Defender"
      : position.includes("Midfielder")
        ? "Midfielder"
        : position.includes("Goalkeeper")
          ? "Goalkeeper"
          : "Manager";
};

// Position colour-coding mirrors the web PlayerTableRow (rose / emerald / sky / amber).
function getPositionTone(position: string, isDark: boolean) {
  const p = position || "";
  if (p.includes("Forward"))
    return { fg: isDark ? "#fb7185" : "#e11d48", bg: isDark ? "rgba(244,63,94,0.15)" : "rgba(244,63,94,0.10)", dot: "#f43f5e" };
  if (p.includes("Midfielder"))
    return { fg: isDark ? "#34d399" : "#047857", bg: isDark ? "rgba(16,185,129,0.15)" : "rgba(16,185,129,0.10)", dot: "#10b981" };
  if (p.includes("Defender"))
    return { fg: isDark ? "#38bdf8" : "#0369a1", bg: isDark ? "rgba(14,165,233,0.15)" : "rgba(14,165,233,0.10)", dot: "#0ea5e9" };
  if (p.includes("Goalkeeper"))
    return { fg: isDark ? "#fbbf24" : "#b45309", bg: isDark ? "rgba(245,158,11,0.15)" : "rgba(245,158,11,0.10)", dot: "#f59e0b" };
  return { fg: isDark ? "#a8a29e" : "#57534e", bg: isDark ? "rgba(168,162,158,0.15)" : "rgba(120,113,108,0.10)", dot: "#a8a29e" };
}

function getEloProgress(elo: number | undefined) {
  return typeof elo === "number" && Number.isFinite(elo) ? Math.min(100, Math.max(0, elo)) : 0;
}
function getEloBarColor(progress: number) {
  if (progress >= 80) return "#16a34a";
  if (progress >= 60) return "#84cc16";
  return "#f59e0b";
}

const PlayerItem = ({ player }: Props) => {
  const { isDark } = React.useContext(AppContext);
  const colorKey = isDark ? "dark" : "light";
  const colors = Colors[colorKey];
  const displayName = getPlayerDisplayName(player);
  const fallbackName = safeDecodeURIComponent(player.name) || displayName;
  const marketValue = `${player.value || "-"} ${player.currency || ""}`.trim() || "-";
  const positionLabel = getPosition(player.position);
  const tone = getPositionTone(player.position, isDark);
  const eloProgress = getEloProgress(player.elo);
  const eloBarColor = getEloBarColor(eloProgress);
  const eloTextColor = isDark ? "#34d399" : "#047857";
  const secondary = player.currentClub || player.country || "Unknown";

  return (
    <Link href={`/${player._id}`} asChild>
      {/* Style must be flattened, not an array: <Link asChild> renders through a
          Slot that rejects array `style` props on its child. */}
      <PressableScale
        accessibilityRole="button"
        accessibilityLabel={`${displayName}, ${positionLabel}, ${secondary}, ELO ${player.elo || "not available"}`}
        accessibilityHint="Opens the player profile"
        containerStyle={styles.cardOuter}
        style={StyleSheet.flatten([
          styles.card,
          shadow(isDark).sm,
          { backgroundColor: colors.card, borderColor: colors.border },
        ])}
      >
        <View style={styles.body}>
          <View style={styles.topRow}>
            <View style={styles.avatarWrap}>
              <Image
                source={player.image || undefined}
                style={[styles.avatar, { backgroundColor: tone.bg, borderColor: tone.dot }]}
                contentFit="cover"
                cachePolicy="memory-disk"
                transition={180}
                accessibilityLabel={`Photo of ${displayName}`}
              />
              {player.number ? (
                <View style={[styles.numberChip, { backgroundColor: tone.dot, borderColor: colors.card }]}>
                  <Text style={styles.numberText}>{player.number}</Text>
                </View>
              ) : null}
            </View>

            <View style={styles.middle}>
              <Text style={[styles.playerName, { color: colors.text }]} numberOfLines={1}>
                {displayName}
              </Text>
              <Text style={[styles.secondaryText, { color: colors.notification }]} numberOfLines={1}>
                {fallbackName !== displayName ? `${fallbackName} • ` : ""}
                {secondary}
              </Text>
            </View>

            <View style={styles.eloRight}>
              <View style={styles.eloValueRow}>
                <Text style={[styles.eloValue, numeric, { color: eloTextColor }]}>{player.elo || "–"}</Text>
                <Ionicons name="trending-up" size={13} color={eloTextColor} />
              </View>
              <Text style={[styles.eloLabel, { color: colors.notification }]}>ELO</Text>
            </View>
          </View>

          <View style={styles.bottomRow}>
            <View style={[styles.positionPill, { backgroundColor: tone.bg }]}>
              <View style={[styles.positionDot, { backgroundColor: tone.fg }]} />
              <Text style={[styles.positionText, { color: tone.fg }]} numberOfLines={1}>
                {positionLabel}
              </Text>
            </View>
            <View style={[styles.valuePill, { backgroundColor: colors.surfaceSoft, borderColor: colors.border }]}>
              <Ionicons name="pricetag" size={10} color={colors.notification} />
              <Text style={[styles.valueText, numeric, { color: colors.text }]} numberOfLines={1}>
                {marketValue}
              </Text>
            </View>
          </View>
        </View>

        {/* ELO progress as a full-width accent at the card's bottom edge */}
        <View style={[styles.progressTrack, { backgroundColor: colors.surfaceSoft }]}>
          <View style={[styles.progressFill, { width: `${eloProgress}%`, backgroundColor: eloBarColor }]} />
        </View>
      </PressableScale>
    </Link>
  );
};

const styles = StyleSheet.create({
  cardOuter: {
    width: "100%",
    marginBottom: 10,
  },
  card: {
    width: "100%",
    borderWidth: 1,
    borderRadius: radius.lg,
    overflow: "hidden",
  },
  body: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
    paddingBottom: spacing.md,
  },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },
  avatarWrap: {
    width: 54,
    height: 54,
  },
  avatar: {
    width: 54,
    height: 54,
    borderRadius: radius.pill,
    borderWidth: 2,
  },
  numberChip: {
    position: "absolute",
    bottom: -2,
    right: -2,
    minWidth: 21,
    height: 21,
    borderRadius: 11,
    borderWidth: 2,
    paddingHorizontal: 4,
    alignItems: "center",
    justifyContent: "center",
  },
  numberText: {
    fontSize: 10.5,
    fontWeight: "900",
    color: "#ffffff",
  },
  middle: {
    flex: 1,
    minWidth: 0,
  },
  playerName: {
    fontSize: 16,
    fontWeight: "900",
    letterSpacing: -0.3,
  },
  secondaryText: {
    fontSize: 12.5,
    marginTop: 3,
    fontWeight: "500",
  },
  eloRight: {
    alignItems: "flex-end",
    minWidth: 46,
  },
  eloValueRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
  },
  eloValue: {
    fontSize: 19,
    fontWeight: "900",
    letterSpacing: -0.4,
  },
  eloLabel: {
    fontSize: 8,
    fontWeight: "900",
    letterSpacing: 1,
    marginTop: 1,
    opacity: 0.9,
  },
  bottomRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    gap: 6,
    marginTop: 11,
  },
  positionPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    borderRadius: radius.pill,
    paddingHorizontal: 9,
    paddingVertical: 4,
  },
  positionDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  positionText: {
    fontSize: 11,
    fontWeight: "800",
  },
  valuePill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    borderWidth: 1,
    borderRadius: radius.pill,
    paddingHorizontal: 9,
    paddingVertical: 4,
  },
  valueText: {
    fontSize: 11,
    fontWeight: "800",
  },
  progressTrack: {
    width: "100%",
    height: 3,
  },
  progressFill: {
    height: "100%",
  },
});
export default React.memo(PlayerItem);
