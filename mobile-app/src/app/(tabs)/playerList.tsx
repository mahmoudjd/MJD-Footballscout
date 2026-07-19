import PlayerList from "@/src/components/PlayerList";
import ScreenContainer from "@/src/components/ui/ScreenContainer";
import { Platform } from "react-native";

export default function PlayerListScreen() {
  return (
    <ScreenContainer withTopInset={Platform.OS === "ios"}>
      <PlayerList />
    </ScreenContainer>
  );
}
