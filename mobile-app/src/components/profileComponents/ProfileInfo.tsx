import * as React from "react";
import { Linking, StyleSheet, useWindowDimensions, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import ProfileInfoItem from "./ProfileInfoItem";
import { PlayerType } from "../../data/Types";
import { getPlayerDisplayName, safeDecodeURIComponent } from "@/src/utils/playerDisplay";

interface Props {
  player: PlayerType;
}

// Category colour tones for the detail icon chips — readable on light & dark.
const TONE = {
  identity: { fg: "#10b981", soft: "rgba(16,185,129,0.14)" },
  origin: { fg: "#0ea5e9", soft: "rgba(14,165,233,0.14)" },
  physical: { fg: "#8b5cf6", soft: "rgba(139,92,246,0.14)" },
  market: { fg: "#f59e0b", soft: "rgba(245,158,11,0.16)" },
  performance: { fg: "#f43f5e", soft: "rgba(244,63,94,0.14)" },
  club: { fg: "#6366f1", soft: "rgba(99,102,241,0.14)" },
} as const;

const ProfileInfo = ({ player }: Props) => {
  const displayName = getPlayerDisplayName(player);
  const { width } = useWindowDimensions();
  const twoColumns = width >= 430;

  const openWebsite = React.useCallback(async () => {
    if (!player.website) return;
    const canOpen = await Linking.canOpenURL(player.website);
    if (canOpen) {
      await Linking.openURL(player.website);
    }
  }, [player.website]);

  const currentValue = `${player.value || "-"} ${player.currency || ""}`.trim();
  const ageValue = typeof player.age === "number" ? `${player.age} years` : "-";
  const weightValue = typeof player.weight === "number" ? `${player.weight} kg` : "-";
  const heightValue = typeof player.height === "number" ? `${player.height} cm` : "-";
  const bornValue = [player.born, player.birthCountry].filter(Boolean).join(" / ") || "-";
  const capsValue =
    !player.caps || player.caps === "played  /  Goals"
      ? "-"
      : player.position.includes("Goal")
        ? `${player.caps} conceded`
        : player.caps;

  const items: Array<{
    icon: React.ComponentProps<typeof Ionicons>["name"];
    label: string;
    value: string | number;
    tone: { fg: string; soft: string };
    onPress?: () => void;
  }> = [
    { icon: "person-outline", label: "Name", value: displayName, tone: TONE.identity },
    { icon: "sparkles-outline", label: "Title", value: safeDecodeURIComponent(player.title) || "-", tone: TONE.identity },
    { icon: "id-card-outline", label: "Full Name", value: safeDecodeURIComponent(player.fullName) || "-", tone: TONE.identity },
    { icon: "hourglass-outline", label: "Age", value: ageValue, tone: TONE.physical },
    { icon: "calendar-outline", label: "Born", value: bornValue, tone: TONE.origin },
    { icon: "flag-outline", label: "Country", value: player.country || "-", tone: TONE.origin },
    { icon: "globe-outline", label: "Other Nationality", value: player.otherNation || "-", tone: TONE.origin },
    { icon: "trending-up-outline", label: "Highest Market Value", value: player.highstValue || "-", tone: TONE.market },
    { icon: "cash-outline", label: "Current Market Value", value: currentValue || "-", tone: TONE.market },
    { icon: "stats-chart-outline", label: "ELO Rating", value: player.elo || "-", tone: TONE.performance },
    { icon: "shield-outline", label: "Current Club", value: player.currentClub || "-", tone: TONE.club },
    { icon: "navigate-outline", label: "Position", value: player.position || "-", tone: TONE.club },
    { icon: "walk-outline", label: "Preferred Foot", value: player.preferredFoot || "-", tone: TONE.physical },
    { icon: "pricetag-outline", label: "Jersey Number", value: player.number || "-", tone: TONE.club },
    { icon: "swap-horizontal-outline", label: "Caps", value: capsValue, tone: TONE.performance },
    { icon: "barbell-outline", label: "Weight", value: weightValue, tone: TONE.physical },
    { icon: "resize-outline", label: "Height", value: heightValue, tone: TONE.physical },
    { icon: "link-outline", label: "Website", value: player.website || "-", tone: TONE.identity, onPress: openWebsite },
    { icon: "pulse-outline", label: "Status", value: player.status || "-", tone: TONE.identity },
  ];

  const visibleItems = items.filter((item) => {
    const normalized = String(item.value ?? "").trim();
    return normalized !== "" && normalized !== "-" && normalized !== "null" && normalized !== "undefined";
  });

  return (
    <View style={styles.profileInfo}>
      <View style={styles.grid}>
        {visibleItems.map((item) => (
          <View key={item.label} style={[styles.gridItem, !twoColumns ? styles.gridItemFull : null]}>
            <ProfileInfoItem
              icon={item.icon}
              label={item.label}
              value={item.value}
              tone={item.tone}
              onPress={item.onPress}
            />
          </View>
        ))}
      </View>
    </View>
  );
};

export default ProfileInfo;

const styles = StyleSheet.create({
  profileInfo: {
    marginBottom: 4,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    rowGap: 11,
  },
  gridItem: {
    width: "48.5%",
  },
  gridItemFull: {
    width: "100%",
  },
});
