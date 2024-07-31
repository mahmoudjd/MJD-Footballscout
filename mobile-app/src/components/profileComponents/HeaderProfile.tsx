import * as React from "react";
import { StyleSheet, View, Image, Text } from "react-native";
import { PlayerType } from "../../data/Types";

type Props = {
  player: PlayerType;
};

const setHeaderClass = (position: string) => {
  return position.includes("Forward")
    ? "forward"
    : position.includes("Midfielder")
      ? "midfielder"
      : position.includes("Defender")
        ? "defender"
        : "goalkeeper";
};

const HeaderProfile = ({ player }: Props) => {
  return (
    <View
      style={[
        styles.headerProfile,
        styles[`${setHeaderClass(player.position)}`],
      ]}
    >
      <View style={styles.playerImage}>
        <Image source={{ uri: player.image }} style={styles.image} />
      </View>
      <Text style={styles.titleProfile}>
        {player.number ? player.number + ". " : ""}
        {decodeURIComponent(player.title)}
      </Text>
    </View>
  );
};

export default HeaderProfile;

const styles = StyleSheet.create({
  headerProfile: {
    borderRadius: 5,
    padding: 10,
    alignItems: "center",
    marginBottom: 10,
  },
  playerImage: {
    backgroundColor: "rgba(0,0,0,0.1)",
    padding: 10,
    borderRadius: 75,
    marginBottom: 10,
  },
  image: {
    width: 125,
    height: 125,
    objectFit: "fill",
    borderRadius: 75,
  },
  titleProfile: {
    fontSize: 20,
    color: "#fff",
    fontWeight: "bold",
  },
  forward: {
    backgroundColor: "#ab0612",
  },
  midfielder: {
    backgroundColor: "#279766",
  },
  defender: {
    backgroundColor: "#044c98",
  },
  goalkeeper: {
    backgroundColor: "rgba(201,154, 32, 0.7)",
  },
});
