import React from "react";
import { View, Text, Image, StyleSheet } from "react-native";
import { PlayerType } from "../data/Types";
import Colors from "../constants/Colors";
import { AppContext } from "../context/AppContext";
import { Link } from "expo-router";

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

  return (
    <View
      style={[
        styles.playerContainer,
        {
          backgroundColor: Colors[isDark ? "dark" : "light"].card,
          borderTopColor: Colors[isDark ? "dark" : "light"].border,
          borderTopWidth: 1,
        },
      ]}
    >
      <Link href={`/${player._id}`} style={{ flex: 1, width: "100%" }}>
        <View style={styles.playerInfo}>
          <Image
            source={{ uri: player.image }}
            style={{
              width: 65,
              height: 65,
              borderRadius: 50,
              objectFit: "fill",
            }}
          />
          <View style={{ marginLeft: 10 }}>
            <View style={{ flexDirection: "row", columnGap: 5 }}>
              <Text style={styles.playerNumber}>
                {player.number ? player.number : "-"}
              </Text>

              <Text
                style={[
                  styles.playerName,
                  { color: Colors[isDark ? "dark" : "light"].text },
                ]}
              >
                {player.title}
              </Text>
            </View>
            <Text
              style={{
                fontSize: 13,
                color: Colors[isDark ? "dark" : "light"].notification,
              }}
            >
              {player.country}
            </Text>
            <Text
              style={{
                fontSize: 13,
                color: Colors[isDark ? "dark" : "light"].notification,
              }}
            >
              {getPosition(player.position)}
            </Text>
          </View>
        </View>
      </Link>
    </View>
  );
};

const styles = StyleSheet.create({
  playerContainer: {
    width: "100%",
    height: 90,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 8,
    paddingHorizontal: 8,
  },
  playerInfo: {
    width: "100%",
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-start",
    columnGap: 20,
    paddingLeft: 20,
  },
  playerName: {
    fontSize: 16,
    fontWeight: "bold",
  },
  playerNumber: {
    color: "#008fb3",
    fontSize: 18,
    marginRight: 5,
  },
  show: {
    padding: 5,
    borderColor: "#008fb3",
    borderWidth: 1,
    borderRadius: 50,
    alignItems: "center",
  },
  navItem: {
    alignItems: "center",
  },
});
export default PlayerItem;
