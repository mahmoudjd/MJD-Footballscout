import React from "react";
import ScreenContainer from "@/src/components/ui/ScreenContainer";
import HomeInsights from "@/src/components/home/HomeInsights";

export default function HomeScreen() {
  return (
    <ScreenContainer edgeToEdge>
      <HomeInsights />
    </ScreenContainer>
  );
}
