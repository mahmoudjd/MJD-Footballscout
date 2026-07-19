import React from "react";
import { View, Text, Image, StyleSheet, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { PlayerType } from "../data/Types";
import Colors from "../constants/Colors";
import { AppContext } from "../context/AppContext";
import { Link } from "expo-router";
import { getPlayerDisplayName, safeDecodeURIComponent } from "@/src/utils/playerDisplay";

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
          : "manager";
};

const PlayerItem = ({ player }: Props) => {
  const { isDark } = React.useContext(AppContext);
  const colorKey = isDark ? "dark" : "light";
  const colors = Colors[colorKey];
  const displayName = getPlayerDisplayName(player);
  const fallbackName = safeDecodeURIComponent(player.name) || displayName;
  const marketValue = `${player.value || "-"} ${player.currency || ""}`.trim() || "-";
  const badgeBackground = isDark ? "rgba(34,211,238,0.16)" : "rgba(14,165,165,0.11)";
  const badgeTextColor = isDark ? "#67e8f9" : "#0e7490";

  return (
    <View
      style={[
        styles.playerContainer,
        {
          backgroundColor: colors.card,
          borderColor: colors.border,
          shadowColor: isDark ? "#000" : "#0f172a",
        },
      ]}
    >
      <Link href={`/${player._id}`} asChild>
        <Pressable style={styles.playerInfo}>
          <Image
            source={{ uri: player.image }}
            style={styles.avatar}
          />
          <View style={styles.meta}>
            <View style={styles.nameRow}>
              <View style={[styles.playerNumberBadge, { backgroundColor: badgeBackground }]}>
                <Text style={[styles.playerNumber, { color: badgeTextColor }]}>
                  {player.number ? `#${player.number}` : "#-"}
                </Text>
              </View>
              <Text
                style={[
                  styles.playerName,
                  { color: colors.text },
                ]}
                numberOfLines={1}
              >
                {displayName}
              </Text>
            </View>
            <Text
              style={[styles.secondaryText, { color: colors.notification }]}
              numberOfLines={1}
            >
              {fallbackName !== displayName ? `${fallbackName} • ` : ""}
              {player.currentClub || player.country || "Unknown"}
            </Text>
            <View style={styles.metaPills}>
              <View style={[styles.metaPill, { backgroundColor: badgeBackground }]}>
                <Text style={[styles.metaPillText, { color: badgeTextColor }]} numberOfLines={1}>
                  {getPosition(player.position)}
                </Text>
              </View>
              <View style={[styles.metaPill, { backgroundColor: badgeBackground }]}>
                <Text style={[styles.metaPillText, { color: badgeTextColor }]} numberOfLines={1}>
                  {marketValue}
                </Text>
              </View>
            </View>
          </View>
          <Ionicons name="chevron-forward" size={18} color={colors.notification} />
        </Pressable>
      </Link>
    </View>
  );
};

const styles = StyleSheet.create({
  playerContainer: {
    width: "100%",
    minHeight: 96,
    paddingVertical: 9,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderRadius: 14,
    marginBottom: 8,
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  playerInfo: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  avatar: {
    width: 58,
    height: 58,
    borderRadius: 29,
    objectFit: "cover",
    backgroundColor: "#e2e8f0",
  },
  meta: {
    flex: 1,
    minWidth: 0,
  },
  nameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  playerNumberBadge: {
    borderRadius: 999,
    paddingHorizontal: 7,
    paddingVertical: 2,
  },
  playerName: {
    flex: 1,
    fontSize: 15,
    fontWeight: "800",
  },
  playerNumber: {
    fontSize: 10,
    fontWeight: "800",
  },
  secondaryText: {
    fontSize: 12,
    marginTop: 2,
  },
  metaPills: {
    marginTop: 5,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
  },
  metaPill: {
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 3,
    maxWidth: "100%",
  },
  metaPillText: {
    fontSize: 10,
    fontWeight: "700",
  },
  navItem: {
    alignItems: "center",
  },
});
export default PlayerItem;
