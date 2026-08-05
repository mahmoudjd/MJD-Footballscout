import { Stack } from "expo-router";
import { useContext } from "react";
import { AppContext } from "@/src/context/AppContext";
import { headerOptions } from "@/src/utils/navHeader";

/**
 * The "More" tab. Settings is the tab root (its own in-content header, so no
 * native header); the tools it links to are pushed within this stack and keep
 * the native bottom tab bar, using the native header for their back button.
 */
export default function AccountLayout() {
  const { isDark } = useContext(AppContext);
  return (
    <Stack screenOptions={headerOptions(isDark)}>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="compare" options={{ title: "Compare" }} />
      <Stack.Screen name="recruitment" options={{ title: "Recruitment" }} />
      <Stack.Screen name="watchlists" options={{ title: "Watchlists" }} />
      <Stack.Screen name="help" options={{ title: "Help center" }} />
      <Stack.Screen
        name="profile"
        options={{ title: "My Account", headerTitleAlign: "center" }}
      />
    </Stack>
  );
}
