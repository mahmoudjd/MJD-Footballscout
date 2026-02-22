import React from "react";
import { Platform } from "react-native";
import ScreenContainer from "@/src/components/ui/ScreenContainer";
import HomeInsights from "@/src/components/home/HomeInsights";

export default function HomeScreen() {
  return (
    <ScreenContainer withTopInset={Platform.OS === "ios"}>
      <HomeInsights />
    </ScreenContainer>
  );
}
