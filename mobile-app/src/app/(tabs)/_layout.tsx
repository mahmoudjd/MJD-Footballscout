import React from "react";
import { DynamicColorIOS, Platform } from "react-native";
import { NativeTabs } from "expo-router/unstable-native-tabs";
import Colors from "@/src/constants/Colors";
import { AppContext } from "@/src/context/AppContext";

/**
 * NativeTabs deliberately follows the platform instead of imitating it:
 * UIKit supplies Liquid Glass on iOS 26 and Material supplies the Android bar.
 * Android's native component supports a maximum of five destinations, so
 * secondary tools such as Compare live in the More screen.
 */
export default function TabLayout() {
  const { isDark } = React.useContext(AppContext);
  const colors = Colors[isDark ? "dark" : "light"];
  const adaptiveTint = Platform.OS === "ios"
    ? DynamicColorIOS({ light: Colors.light.primary, dark: Colors.dark.accent })
    : colors.tint;

  return (
    <NativeTabs
      backgroundColor={Platform.OS === "android" ? colors.card : undefined}
      iconColor={{ default: colors.tabIconDefault, selected: adaptiveTint }}
      labelStyle={{
        default: { color: colors.tabIconDefault },
        selected: { color: adaptiveTint, fontWeight: "700" },
      }}
      labelVisibilityMode="selected"
      minimizeBehavior="onScrollDown"
      rippleColor={Platform.OS === "android" ? "rgba(215,255,69,0.16)" : undefined}
      shadowColor={colors.border}
      tabBarRespectsIMEInsets
    >
      {/* Order follows priority: Search is the app's primary function, so it sits
          right after the Home overview. Then find (Players) → build (Squad Builder,
          i.e. the shadow-team route) → more. Analysis (Compare), Recruitment and
          Watchlists live in the More hub. */}
      <NativeTabs.Trigger name="index">
        <NativeTabs.Trigger.Label>Home</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon
          sf={{ default: "house", selected: "house.fill" }}
          md={{ default: "home", selected: "home" }}
        />
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="search">
        <NativeTabs.Trigger.Label>Search</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon
          sf={{ default: "magnifyingglass", selected: "magnifyingglass" }}
          md={{ default: "search", selected: "search" }}
        />
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="playerList">
        <NativeTabs.Trigger.Label>Players</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon
          sf={{ default: "person.2", selected: "person.2.fill" }}
          md={{ default: "group", selected: "group" }}
        />
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="shadow-team">
        <NativeTabs.Trigger.Label>Squad</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon
          sf={{ default: "sportscourt", selected: "sportscourt.fill" }}
          md={{ default: "stadium", selected: "stadium" }}
        />
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="account">
        <NativeTabs.Trigger.Label>More</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf="ellipsis.circle" md="more_horiz" />
      </NativeTabs.Trigger>

      {/* Compare, Recruitment and Watchlists are root-level stack screens
          pushed OVER the tabs (see src/app/_layout.tsx) and surfaced in the
          More hub. Hidden NativeTabs triggers were tried first, but pushing a
          route whose trigger is not part of the native bar fails silently. */}
    </NativeTabs>
  );
}
