import React from "react";
import { Link, Tabs } from "expo-router";
import { Icon, Label, NativeTabs } from "expo-router/unstable-native-tabs";
import { Pressable, Platform } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Colors from "@/src/constants/Colors";
import { useClientOnlyValue } from "@/src/components/useClientOnlyValue";
import { AppContext } from "@/src/context/AppContext";

type TabIconProps = {
  color: string;
  focused: boolean;
  outline: keyof typeof Ionicons.glyphMap;
  filled: keyof typeof Ionicons.glyphMap;
};

type HeaderColors = {
  text: string;
  card: string;
  notification: string;
  tint: string;
  tabIconDefault: string;
  background: string;
  border: string;
};

function TabBarIcon({ color, focused, outline, filled }: TabIconProps) {
  return <Ionicons size={22} color={color} name={focused ? filled : outline} style={{ marginBottom: -1 }} />;
}

function HeaderSettingsButton({ color }: { color: string }) {
  return (
    <Link href="/settings" asChild>
      <Pressable>
        {({ pressed }) => (
          <Ionicons
            name="settings-outline"
            size={22}
            color={color}
            style={{ opacity: pressed ? 0.55 : 1 }}
          />
        )}
      </Pressable>
    </Link>
  );
}

function getHeaderOptions(colors: HeaderColors) {
  return {
    headerShown: true,
    headerTintColor: colors.text,
    headerTitleStyle: {
      fontWeight: "700" as const,
      fontSize: 16,
    },
    headerStyle: {
      backgroundColor: colors.card,
    },
    headerShadowVisible: false,
    headerRightContainerStyle: {
      paddingRight: 8,
    },
  };
}

function IosNativeTabLayout({
  colors,
  isDark,
}: {
  colors: HeaderColors;
  isDark: boolean;
}) {
  const commonHeaderOptions = getHeaderOptions(colors);
  const parsedVersion =
    typeof Platform.Version === "string"
      ? Number.parseInt(Platform.Version.split(".")[0] || "0", 10)
      : Number(Platform.Version || 0);
  const iosMajorVersion = Number.isFinite(parsedVersion) ? parsedVersion : 0;
  const minimizeBehavior = iosMajorVersion >= 26 ? "onScrollDown" : undefined;

  return (
    <NativeTabs
      tintColor={colors.tint}
      backgroundColor={colors.card}
      iconColor={{ default: colors.tabIconDefault, selected: colors.tint }}
      labelStyle={{
        default: { color: colors.tabIconDefault, fontSize: 11, fontWeight: "600" },
        selected: { color: colors.tint, fontSize: 11, fontWeight: "700" },
      }}
      blurEffect={isDark ? "systemChromeMaterialDark" : "systemChromeMaterialLight"}
      disableTransparentOnScrollEdge
      {...(minimizeBehavior ? { minimizeBehavior } : {})}
    >
      <NativeTabs.Trigger
        name="index"
        options={{
          ...commonHeaderOptions,
          title: "Home",
        }}
      >
        <Icon sf={{ default: "house", selected: "house.fill" }} />
        <Label>Home</Label>
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="playerList" options={{ ...commonHeaderOptions, title: "Players" }}>
        <Icon sf={{ default: "person.2", selected: "person.2.fill" }} />
        <Label>Players</Label>
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="search" options={{ ...commonHeaderOptions, title: "Search" }}>
        <Icon sf="magnifyingglass" />
        <Label>Search</Label>
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="compare" options={{ ...commonHeaderOptions, title: "Compare" }}>
        <Icon sf={{ default: "arrow.left.arrow.right.circle", selected: "arrow.left.arrow.right.circle.fill" }} />
        <Label>Compare</Label>
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="account" options={{ ...commonHeaderOptions, title: "More" }}>
        <Icon sf={{ default: "ellipsis.circle", selected: "ellipsis.circle.fill" }} />
        <Label>More</Label>
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="watchlists" hidden options={{ ...commonHeaderOptions, title: "Watchlists" }} />
      <NativeTabs.Trigger name="auth/login" hidden options={{ ...commonHeaderOptions, title: "Login" }} />
      <NativeTabs.Trigger name="auth/signup" hidden options={{ ...commonHeaderOptions, title: "Sign up" }} />
      <NativeTabs.Trigger name="player/[id]" hidden options={{ ...commonHeaderOptions, title: "Profile" }} />
    </NativeTabs>
  );
}

function DefaultTabLayout({
  colors,
  tabActiveBackground,
}: {
  colors: HeaderColors;
  tabActiveBackground: string;
}) {
  return (
    <Tabs
      screenOptions={{
        headerShown: useClientOnlyValue(false, true),
        headerTitle: "MJD-FootballScout",
        headerTintColor: colors.text,
        headerTitleStyle: {
          fontWeight: "700",
          fontSize: 16,
        },
        headerStyle: {
          backgroundColor: colors.card,
        },
        headerShadowVisible: false,
        headerRightContainerStyle: {
          paddingRight: 8,
        },
        sceneStyle: {
          backgroundColor: colors.background,
        },
        tabBarHideOnKeyboard: true,
        tabBarActiveTintColor: colors.tint,
        tabBarInactiveTintColor: colors.tabIconDefault,
        tabBarActiveBackgroundColor: tabActiveBackground,
        tabBarStyle: {
          backgroundColor: colors.card,
          borderTopColor: colors.border,
          borderTopWidth: 1,
          height: 68,
          paddingTop: 8,
          paddingBottom: 8,
        },
        tabBarItemStyle: {
          marginHorizontal: 4,
          borderRadius: 12,
        },
        tabBarLabelStyle: {
          fontWeight: "700",
          fontSize: 11,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon color={color} focused={focused} outline="home-outline" filled="home" />
          ),
          headerRight: () => <HeaderSettingsButton color={colors.notification} />,
        }}
      />

      <Tabs.Screen
        name="playerList"
        options={{
          title: "Players",
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon color={color} focused={focused} outline="people-outline" filled="people" />
          ),
        }}
      />

      <Tabs.Screen
        name="search"
        options={{
          title: "Search",
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon color={color} focused={focused} outline="search-outline" filled="search" />
          ),
        }}
      />

      <Tabs.Screen
        name="compare"
        options={{
          title: "Compare",
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon color={color} focused={focused} outline="git-compare-outline" filled="git-compare" />
          ),
        }}
      />

      <Tabs.Screen
        name="watchlists"
        options={{
          title: "Watchlists",
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon color={color} focused={focused} outline="heart-outline" filled="heart" />
          ),
        }}
      />

      <Tabs.Screen
        name="account"
        options={{
          title: "More",
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon
              color={color}
              focused={focused}
              outline="ellipsis-horizontal-circle-outline"
              filled="ellipsis-horizontal-circle"
            />
          ),
        }}
      />

      <Tabs.Screen
        name="auth/login"
        options={{
          href: null,
          title: "Login",
        }}
      />

      <Tabs.Screen
        name="auth/signup"
        options={{
          href: null,
          title: "Sign up",
        }}
      />

      <Tabs.Screen
        name="player/[id]"
        options={{
          href: null,
          title: "Profile",
        }}
      />
    </Tabs>
  );
}

export default function TabLayout() {
  const { isDark } = React.useContext(AppContext);
  const colorKey = isDark ? "dark" : "light";
  const colors = Colors[colorKey];
  const tabActiveBackground = isDark ? "rgba(34,211,238,0.16)" : "rgba(14,165,165,0.13)";

  if (Platform.OS === "ios") {
    return <IosNativeTabLayout colors={colors} isDark={isDark} />;
  }

  return <DefaultTabLayout colors={colors} tabActiveBackground={tabActiveBackground} />;
}
