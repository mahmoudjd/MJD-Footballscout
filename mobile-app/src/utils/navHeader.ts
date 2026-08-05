import Colors from "@/src/constants/Colors";

/**
 * Shared native-header + content styling for the per-tab nested stacks, so
 * every pushed screen matches instead of repeating the same headerStyle block.
 * Leaves `headerShown` at its Stack default (true) — screens opt out per-route.
 */
export function headerOptions(isDark: boolean) {
  const colors = Colors[isDark ? "dark" : "light"];
  return {
    headerShadowVisible: false,
    headerTintColor: colors.text,
    headerStyle: { backgroundColor: isDark ? Colors.dark.primary : "#fff" },
    contentStyle: { backgroundColor: colors.background },
  } as const;
}
