import { Stack } from "expo-router";
import { useContext } from "react";
import { AppContext } from "@/src/context/AppContext";
import { headerOptions } from "@/src/utils/navHeader";

/**
 * Nested stack shared by the Home / Search / Players tabs. Keeping the player
 * detail inside the tab's own stack is what preserves the native bottom tab bar
 * when a profile is opened. The list (`index`) is the tab root with no header;
 * the `[id]` detail supplies its own title + back button (see PlayerDetailScreen).
 */
export default function ContentTabStack() {
  const { isDark } = useContext(AppContext);
  return (
    <Stack screenOptions={headerOptions(isDark)}>
      <Stack.Screen name="index" options={{ headerShown: false }} />
    </Stack>
  );
}
