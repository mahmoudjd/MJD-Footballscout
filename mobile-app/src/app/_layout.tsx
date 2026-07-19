import FontAwesome from "@expo/vector-icons/FontAwesome";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect, useState, useMemo } from "react";
import { AppContext } from "../context/AppContext";
import { AuthProvider } from "../context/AuthContext";
import Colors from "../constants/Colors";
import { StatusBar } from "expo-status-bar";
import { useColorScheme } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { MD3DarkTheme, MD3LightTheme, PaperProvider } from "react-native-paper";

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
    theme === "dark",
  );

  const appContext = useMemo(() => ({ isDark, setIsDark }), [isDark]);
  const paperTheme = useMemo(() => {
    const colorKey = isDark ? "dark" : "light";
    const baseTheme = isDark ? MD3DarkTheme : MD3LightTheme;

    return {
      ...baseTheme,
      colors: {
        ...baseTheme.colors,
        primary: Colors[colorKey].tint,
        secondary: "#0f766e",
        background: Colors[colorKey].background,
        surface: Colors[colorKey].card,
        surfaceVariant: isDark ? "#263445" : "#e7eef2",
        onSurface: Colors[colorKey].text,
        outline: Colors[colorKey].border,
      },
    };
  }, [isDark]);

  return (
    <SafeAreaProvider>
      <PaperProvider theme={paperTheme}>
        <AuthProvider>
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
                name="login"
                options={{
                  headerShown: true,
                  headerTintColor: Colors[isDark ? "dark" : "light"].text,
                  headerStyle: {
                    backgroundColor: isDark ? Colors.dark.primary : "#fff",
                  },
                  title: "Login",
                }}
              />
              <Stack.Screen
                name="signup"
                options={{
                  headerShown: true,
                  headerTintColor: Colors[isDark ? "dark" : "light"].text,
                  headerStyle: {
                    backgroundColor: isDark ? Colors.dark.primary : "#fff",
                  },
                  title: "Sign up",
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
              <Stack.Screen
                name="watchlists-screen"
                options={{
                  headerShown: true,
                  headerTintColor: Colors[isDark ? "dark" : "light"].text,
                  headerStyle: {
                    backgroundColor: isDark ? Colors.dark.primary : "#fff",
                  },
                  title: "Watchlists",
                }}
              />
            </Stack>
            <StatusBar style={isDark ? "light" : "dark"} />
          </AppContext.Provider>
        </AuthProvider>
      </PaperProvider>
    </SafeAreaProvider>
  );
}
