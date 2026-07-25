import * as React from "react";
import { StyleSheet, View, Text } from "react-native";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { PlayerType } from "../../data/Types";
import { getPlayerDisplayName, safeDecodeURIComponent } from "@/src/utils/playerDisplay";

type Props = {
  player: PlayerType;
};

// Brand hero gradient — mirrors the web profile header (emerald-950 → 900 → 700)
// so the profile reads the same on both platforms, independent of position.
const HERO_GRADIENT = ["#022c22", "#064e3b", "#047857"] as const;
const LIME = "#d9f99d"; // lime-200 accent, matches the web overline/hairline
const PILL_BG = "rgba(255,255,255,0.12)";
const PILL_BORDER = "rgba(255,255,255,0.16)";

function Pill({
  icon,
  label,
}: {
  icon: React.ComponentProps<typeof Ionicons>["name"];
  label: string;
}) {
  return (
    <View style={styles.pill}>
      <Ionicons name={icon} size={12} color="#fff" />
      <Text style={styles.pillText} numberOfLines={1}>
        {label}
      </Text>
    </View>
  );
}

const HeaderProfile = ({ player }: Props) => {
  const displayName = getPlayerDisplayName(player);
  const subtitle = player.title ? safeDecodeURIComponent(player.title) : "";

  return (
    <LinearGradient
      colors={HERO_GRADIENT}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.hero}
    >
      <View style={styles.topRow}>
        <Text style={styles.overline}>PLAYER PROFILE</Text>
        {player.number ? (
          <View style={styles.numberBadge}>
            <Text style={styles.numberLabel}>NUMBER</Text>
            <Text style={styles.numberValue}>{player.number}</Text>
          </View>
        ) : null}
      </View>

      <View style={styles.identityRow}>
        <View style={styles.avatarWrap}>
          {player.image ? (
            <Image
              source={player.image}
              style={styles.image}
              contentFit="cover"
              cachePolicy="memory-disk"
              transition={180}
            />
          ) : (
            <Text style={styles.avatarFallback}>?</Text>
          )}
        </View>

        <View style={styles.identityTextWrap}>
          <Text style={styles.name} numberOfLines={2}>
            {displayName}
          </Text>

          {subtitle && subtitle !== displayName ? (
            <Text style={styles.subtitle} numberOfLines={2}>
              {subtitle}
            </Text>
          ) : null}

          <View style={styles.pillRow}>
            {player.position ? (
              <Pill icon="shield-checkmark-outline" label={player.position} />
            ) : null}
            {player.currentClub ? <Pill icon="trophy-outline" label={player.currentClub} /> : null}
            {typeof player.age === "number" ? (
              <Text style={styles.ageText}>{player.age} years old</Text>
            ) : null}
          </View>
        </View>
      </View>

      {/* Lime accent hairline, mirroring the web header's bottom edge. */}
      <View style={styles.hairline} />
    </LinearGradient>
  );
};

export default HeaderProfile;

const styles = StyleSheet.create({
  hero: {
    borderRadius: 24,
    paddingHorizontal: 18,
    paddingVertical: 18,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
    overflow: "hidden",
  },
  topRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    marginBottom: 14,
  },
  overline: {
    color: LIME,
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 1.4,
    marginTop: 2,
  },
  numberBadge: {
    minWidth: 60,
    alignItems: "center",
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: "rgba(190,242,100,0.15)",
    borderWidth: 1,
    borderColor: "rgba(217,249,157,0.28)",
  },
  numberLabel: {
    color: LIME,
    fontSize: 9,
    fontWeight: "800",
    letterSpacing: 1.4,
    textTransform: "uppercase",
  },
  numberValue: {
    color: "#f7fee7",
    fontSize: 26,
    fontWeight: "800",
    fontVariant: ["tabular-nums"],
    lineHeight: 30,
  },
  identityRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },
  avatarWrap: {
    width: 96,
    height: 96,
    borderRadius: 22,
    padding: 5,
    backgroundColor: "rgba(255,255,255,0.15)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.25)",
    alignItems: "center",
    justifyContent: "center",
  },
  image: {
    width: "100%",
    height: "100%",
    borderRadius: 17,
  },
  avatarFallback: {
    color: "rgba(255,255,255,0.7)",
    fontSize: 34,
    fontWeight: "800",
  },
  identityTextWrap: {
    flex: 1,
    minWidth: 0,
  },
  name: {
    fontSize: 24,
    fontWeight: "900",
    color: "#fff",
    letterSpacing: -0.5,
    lineHeight: 28,
  },
  subtitle: {
    marginTop: 4,
    fontSize: 13,
    color: "rgba(255,255,255,0.72)",
    lineHeight: 18,
  },
  pillRow: {
    marginTop: 10,
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 6,
  },
  pill: {
    maxWidth: "100%",
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 5,
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: PILL_BG,
    borderWidth: 1,
    borderColor: PILL_BORDER,
  },
  pillText: {
    color: "#fff",
    fontSize: 11,
    fontWeight: "700",
    maxWidth: 170,
  },
  ageText: {
    color: "rgba(255,255,255,0.6)",
    fontSize: 11,
    fontWeight: "600",
    fontVariant: ["tabular-nums"],
  },
  hairline: {
    position: "absolute",
    left: 24,
    right: 24,
    bottom: 0,
    height: 1,
    backgroundColor: "rgba(217,249,157,0.5)",
  },
});
