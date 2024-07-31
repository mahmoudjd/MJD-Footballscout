import * as React from "react";
import { StyleSheet, View, Text } from "react-native";
import ProfileInfoItem from "./ProfileInfoItem";
import { PlayerType } from "../../data/Types";
import Colors from "@/src/constants/Colors";
import { AppContext } from "@/src/context/AppContext";
import { ExternalLink } from "../ExternalLink";

interface Props {
  player: PlayerType;
}

const ProfileInfo = ({ player }: Props) => {
  const { isDark } = React.useContext(AppContext);

  return (
    <View style={styles.profileInfo}>
      <ProfileInfoItem k="Name:" v={player.name} />
      <ProfileInfoItem k="Full Name:" v={decodeURIComponent(player.fullName)} />
      <ProfileInfoItem k="Age:" v={(player.age || "-") + " years"} />
      <ProfileInfoItem k="Country:" v={player.country} />
      <ProfileInfoItem k="Number:" v={player.number || "-"} />
      <ProfileInfoItem k="Weight:" v={(player.weight || "-") + " kg"} />
      <ProfileInfoItem k="Height:" v={(player.height || "-") + " cm"} />
      <ProfileInfoItem k="Position:" v={player.position} />

      {player.preferredFoot && (
        <ProfileInfoItem k="Preferred Foot:" v={player.preferredFoot} />
      )}

      <ProfileInfoItem k="Value:" v={player.value + player.currency} />
      {player.highstValue && (
        <ProfileInfoItem k="Highest value in career:" v={player.highstValue} />
      )}

      {player.currentClub && (
        <ProfileInfoItem k={"Current Club:"} v={player.currentClub} />
      )}

      <ProfileInfoItem k={"ELO:"} v={player.elo} />

      {player.caps !== "played  /  Goals" && (
        <ProfileInfoItem
          k={"GAPS:"}
          v={
            player.position === "Goalkeeper"
              ? player.caps + " conceded"
              : player.caps
          }
        />
      )}

      {player.otherNation && (
        <ProfileInfoItem k={"Other nationality:"} v={player.otherNation} />
      )}

      {player.website && (
        <View style={styles.infoItem}>
          <Text>
            <Text
              style={[
                styles.strong,
                { color: Colors[isDark ? "dark" : "light"].notification },
              ]}
            >
              Website:{" "}
            </Text>
            <ExternalLink href={player.website}>
              <Text style={styles.website}>{player.website}</Text>
            </ExternalLink>
          </Text>
        </View>
      )}

      {player.status && (
        <ProfileInfoItem k={"Current status: "} v={player.status} />
      )}

      <ProfileInfoItem k="Born:" v={player.born + "/" + player.birthCountry} />
    </View>
  );
};

export default ProfileInfo;

const styles = StyleSheet.create({
  profileInfo: {
    marginBottom: 10,
  },
  infoItem: {
    marginBottom: 5,
    paddingVertical: 5,
  },
  strong: {
    marginRight: 6,
    fontWeight: "bold",
  },
  website: {
    color: "#008fb3",
    textDecorationLine: "underline",
  },
});
