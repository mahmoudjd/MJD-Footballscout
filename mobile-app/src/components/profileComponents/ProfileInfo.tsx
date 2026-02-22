import * as React from "react";
import { Linking, StyleSheet, useWindowDimensions, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import ProfileInfoItem from "./ProfileInfoItem";
import { PlayerType } from "../../data/Types";
import { getPlayerDisplayName, safeDecodeURIComponent } from "@/src/utils/playerDisplay";

interface Props {
  player: PlayerType;
  maxItems?: number;
}

const ProfileInfo = ({ player, maxItems }: Props) => {
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
    onPress?: () => void;
  }> = [
    { icon: "person-outline", label: "Name", value: displayName },
    { icon: "sparkles-outline", label: "Title", value: safeDecodeURIComponent(player.title) || "-" },
    { icon: "id-card-outline", label: "Full Name", value: safeDecodeURIComponent(player.fullName) || "-" },
    { icon: "hourglass-outline", label: "Age", value: ageValue },
    { icon: "calendar-outline", label: "Born", value: bornValue },
    { icon: "flag-outline", label: "Country", value: player.country || "-" },
    { icon: "globe-outline", label: "Other Nationality", value: player.otherNation || "-" },
    { icon: "trending-up-outline", label: "Highest Market Value", value: player.highstValue || "-" },
    { icon: "cash-outline", label: "Current Market Value", value: currentValue || "-" },
    { icon: "stats-chart-outline", label: "ELO Rating", value: player.elo || "-" },
    { icon: "shield-outline", label: "Current Club", value: player.currentClub || "-" },
    { icon: "navigate-outline", label: "Position", value: player.position || "-" },
    { icon: "walk-outline", label: "Preferred Foot", value: player.preferredFoot || "-" },
    { icon: "pricetag-outline", label: "Jersey Number", value: player.number || "-" },
    { icon: "swap-horizontal-outline", label: "Caps", value: capsValue },
    { icon: "barbell-outline", label: "Weight", value: weightValue },
    { icon: "resize-outline", label: "Height", value: heightValue },
    { icon: "link-outline", label: "Website", value: player.website || "-", onPress: openWebsite },
    { icon: "pulse-outline", label: "Status", value: player.status || "-" },
  ];

  const visibleItems = items.filter((item) => {
    const normalized = String(item.value ?? "").trim();
    return normalized !== "" && normalized !== "-" && normalized !== "null" && normalized !== "undefined";
  });
  const renderedItems = typeof maxItems === "number" ? visibleItems.slice(0, maxItems) : visibleItems;

  return (
    <View style={styles.profileInfo}>
      <View style={styles.grid}>
        {renderedItems.map((item) => (
          <View key={item.label} style={[styles.gridItem, !twoColumns ? styles.gridItemFull : null]}>
            <ProfileInfoItem
              icon={item.icon}
              label={item.label}
              value={item.value}
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
