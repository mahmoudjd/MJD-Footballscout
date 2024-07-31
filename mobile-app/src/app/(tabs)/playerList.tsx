import { View } from "react-native";
import PlayerList from "@/src/components/PlayerList";
import Colors from "@/src/constants/Colors";
import { useContext } from "react";
import { AppContext } from "@/src/context/AppContext";

export default function PlayerListScreen() {
  const { isDark } = useContext(AppContext);
  return (
    <View
      style={{
        backgroundColor: Colors[isDark ? "dark" : "light"].background,
        flex: 1,
      }}
    >
      <PlayerList />
    </View>
  );
}
