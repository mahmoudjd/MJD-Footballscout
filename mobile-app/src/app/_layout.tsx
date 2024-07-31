import FontAwesome from "@expo/vector-icons/FontAwesome";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect, useState, useMemo } from "react";
import { AppContext } from "../context/AppContext";
import Colors from "../constants/Colors";
import { StatusBar } from "expo-status-bar";
import { useColorScheme } from "react-native";

export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary,
} from "expo-router";

export const unstable_settings = {
  // Ensure that reloading on `/modal` keeps a back button present.
  initialRouteName: "(tabs)",
};

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    SpaceMono: require("../../assets/fonts/SpaceMono-Regular.ttf"),
    ...FontAwesome.font,
  });

  // Expo Router uses Error Boundaries to catch errors in the navigation tree.
  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return <RootLayoutNav />;
}

function RootLayoutNav() {
  const theme = useColorScheme();

  const [isDark, setIsDark] = useState<boolean>(
    theme === "dark" ? true : false,
  );

  const appContext = useMemo(() => ({ isDark, setIsDark }), [isDark]);

  return (
    <AppContext.Provider value={appContext}>
      <Stack>
        <Stack.Screen
          name="(tabs)"
          options={{ title: "Back", headerShown: false }}
        />
        <Stack.Screen
          name="settings"
          options={{
            headerTintColor: Colors[isDark ? "dark" : "light"].text,
            headerStyle: {
              backgroundColor: isDark ? Colors.dark.primary : "#fff",
            },

            title: "Settings",
            presentation: "modal",
          }}
        />
        <Stack.Screen
          name="[_id]"
          options={{
            headerShown: true,
            headerTintColor: Colors[isDark ? "dark" : "light"].text,
            headerStyle: {
              backgroundColor: isDark ? Colors.dark.primary : "#fff",
            },
            title: "Profile",
          }}
        />
      </Stack>
      <StatusBar style={isDark ? "light" : "dark"} />
    </AppContext.Provider>
  );
}
