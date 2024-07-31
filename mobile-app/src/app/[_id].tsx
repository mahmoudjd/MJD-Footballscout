import { useLocalSearchParams } from "expo-router";
import { View, Text } from "react-native";
import { useContext, useEffect, useState } from "react";
import { PlayerType } from "@/src/data/Types";
import PlayerProfile from "@/src/components/PlayerProfile";
import Colors from "@/src/constants/Colors";
import { AppContext } from "@/src/context/AppContext";
import { Stack } from "expo-router";
import { fetchPlayer } from "../apiServices";

const ProfileScreen = () => {
  const { _id } = useLocalSearchParams();
  const { isDark } = useContext(AppContext);

  const [player, setPlayer] = useState<PlayerType | null>(null);

  useEffect(() => {
    fetchPlayer(`${_id}`)
      .then((data) => setPlayer(data))
      .catch((error) => console.error(error));
  }, [_id]);

  return !player ? (
    <View
      style={{
        backgroundColor: Colors[isDark ? "dark" : "light"].background,
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Text style={{ color: "red" }}>Error: not found player</Text>
    </View>
  ) : (
    <>
      <Stack.Screen options={{ title: player.name }} />
      <PlayerProfile person={player} />
    </>
  );
};

export default ProfileScreen;
