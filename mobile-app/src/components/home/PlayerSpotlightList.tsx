import React, { useContext } from "react";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import { Link } from "expo-router";
import Colors from "@/src/constants/Colors";
import { AppContext } from "@/src/context/AppContext";
import { PlayerHighlightItem } from "@/src/data/Types";

type Props = {
  title: string;
  players: PlayerHighlightItem[];
  emptyText: string;
};

export default function PlayerSpotlightList({ title, players, emptyText }: Props) {
  const { isDark } = useContext(AppContext);
  const colorKey = isDark ? "dark" : "light";

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: Colors[colorKey].card,
          borderColor: Colors[colorKey].border,
          shadowColor: isDark ? "#000" : "#0f172a",
        },
      ]}
    >
      <Text style={[styles.title, { color: Colors[colorKey].text }]}>{title}</Text>

      {players.length === 0 ? (
        <Text style={[styles.emptyText, { color: Colors[colorKey].notification }]}>
          {emptyText}
        </Text>
      ) : (
        players.slice(0, 4).map((player) => (
          <Link key={player._id} href={`/${player._id}`} asChild>
            <Pressable style={styles.row}>
              <Image
                source={{ uri: player.image }}
                style={styles.avatar}
              />
              <View style={{ flex: 1 }}>
                <Text
                  style={[styles.name, { color: Colors[colorKey].text }]}
                  numberOfLines={1}
                >
                  {player.name}
                </Text>
                <Text
                  style={[styles.meta, { color: Colors[colorKey].notification }]}
                  numberOfLines={1}
                >
                  {player.currentClub || player.country}
                </Text>
              </View>
              <View style={styles.rightMetrics}>
                <Text style={styles.eloBadge}>ELO {player.elo}</Text>
                <Text style={styles.valueText}>
                  {player.value} {player.currency}
                </Text>
              </View>
            </Pressable>
          </Link>
        ))
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderWidth: 1,
    borderRadius: 14,
    padding: 12,
    flex: 1,
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: "800",
    marginBottom: 10,
  },
  emptyText: {
    fontSize: 13,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 10,
    paddingVertical: 2,
  },
  avatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "#f1f5f9",
  },
  name: {
    fontSize: 13,
    fontWeight: "700",
  },
  meta: {
    fontSize: 11,
    marginTop: 2,
  },
  rightMetrics: {
    alignItems: "flex-end",
  },
  eloBadge: {
    backgroundColor: "#0ea5a5",
    color: "#fff",
    borderRadius: 999,
    overflow: "hidden",
    paddingHorizontal: 8,
    paddingVertical: 3,
    fontSize: 11,
    fontWeight: "700",
  },
  valueText: {
    marginTop: 3,
    color: "#0ea5a5",
    fontSize: 11,
    fontWeight: "700",
  },
});
