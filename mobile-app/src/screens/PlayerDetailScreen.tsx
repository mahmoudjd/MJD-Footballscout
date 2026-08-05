import { Stack, router, useLocalSearchParams, useNavigation, useSegments } from "expo-router";
import { View, Text, Pressable } from "react-native";
import { useCallback, useContext, useEffect, useMemo, useState } from "react";
import { PlayerType } from "@/src/data/Types";
import PlayerProfile from "@/src/components/PlayerProfile";
import Colors from "@/src/constants/Colors";
import { AppContext } from "@/src/context/AppContext";
import { fetchPlayer } from "@/src/apiServices";
import { useAuth } from "@/src/context/AuthContext";
import LoadingState from "@/src/components/ui/LoadingState";
import AuthRequiredState from "@/src/components/ui/AuthRequiredState";
import { runAuthorizedRequest } from "@/src/utils/runAuthorizedRequest";
import { SafeAreaView } from "react-native-safe-area-context";
import AppBackground from "@/src/components/ui/AppBackground";
import { getPlayerDisplayName } from "@/src/utils/playerDisplay";
import { Ionicons } from "@expo/vector-icons";

const ProfileScreen = () => {
  const { _id, id } = useLocalSearchParams<{ _id?: string | string[]; id?: string | string[] }>();
  const { isDark } = useContext(AppContext);
  const navigation = useNavigation();
  const segments = useSegments();
  // The tab this profile was opened in ("(home)" | "search" | "playerList").
  // Everything that returns from this screen must stay in that tab.
  const tab = segments[1] ?? "(home)";
  const tabRoot = `/${tab}`;
  const { session, isAuthenticated, isAuthReady, refreshSession } = useAuth();
  const resolvedPlayerId = useMemo(() => {
    const rawId = Array.isArray(id) ? id[0] : id;
    const rawFallback = Array.isArray(_id) ? _id[0] : _id;
    const raw = rawId || rawFallback;
    return typeof raw === "string" ? raw : "";
  }, [_id, id]);
  // Return to THIS tab's copy of the player after login (not the root /:id route,
  // which always resolves to the Home tab and would drop the user out of context).
  const loginCallback = useMemo(
    () => (resolvedPlayerId ? `${tabRoot}/${resolvedPlayerId}` : tabRoot),
    [resolvedPlayerId, tabRoot],
  );

  const [player, setPlayer] = useState<PlayerType | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const colorKey = isDark ? "dark" : "light";

  const handleBack = useCallback(() => {
    // Normal case: pop within this tab's stack (profile -> list, or similar
    // player -> previous player). When there is no back entry — e.g. login
    // replaced this screen in via loginCallback — fall back to THIS tab's list,
    // never a hardcoded other tab.
    if (navigation.canGoBack()) {
      navigation.goBack();
      return;
    }
    router.replace(tabRoot as never);
  }, [navigation, tabRoot]);

  useEffect(() => {
    if (isAuthReady && !isAuthenticated) {
      router.replace({ pathname: "/login", params: { callbackUrl: loginCallback } } as never);
    }
  }, [isAuthReady, isAuthenticated, loginCallback]);

  useEffect(() => {
    if (!isAuthReady || !isAuthenticated) {
      setIsLoading(false);
      return;
    }
    if (!resolvedPlayerId) {
      setErrorMessage("Missing player id");
      setIsLoading(false);
      return;
    }

    let isMounted = true;
    const loadPlayer = async () => {
      try {
        setIsLoading(true);
        setErrorMessage(null);
        const data = await runAuthorizedRequest({
          session,
          refreshSession,
          request: (accessToken) => fetchPlayer(resolvedPlayerId, accessToken),
        });
        if (isMounted) {
          setPlayer(data);
        }
      } catch (error) {
        console.error(error);
        const message = error instanceof Error ? error.message : "Failed to load player";
        if (isMounted) {
          setErrorMessage(message);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadPlayer();
    return () => {
      isMounted = false;
    };
  }, [resolvedPlayerId, isAuthReady, isAuthenticated, session, refreshSession]);

  if (!isAuthReady) {
    return <LoadingState />;
  }

  if (!isAuthenticated) {
    return (
      <AuthRequiredState
        withTopInset
        title="Profile requires login"
        message="Player profile is only available for logged-in users."
        callbackUrl={loginCallback}
      />
    );
  }

  if (isLoading) {
    return (
      <>
        <Stack.Screen
          options={{
            title: "Profile",
            headerLeft: () => (
              <Pressable onPress={handleBack} style={{ paddingHorizontal: 4 }}>
                <Ionicons name="chevron-back" size={24} color={Colors[colorKey].text} />
              </Pressable>
            ),
          }}
        />
        <LoadingState />
      </>
    );
  }

  return !player ? (
    <>
      <Stack.Screen
        options={{
          title: "Profile",
          headerLeft: () => (
            <Pressable onPress={handleBack} style={{ paddingHorizontal: 4 }}>
              <Ionicons name="chevron-back" size={24} color={Colors[colorKey].text} />
            </Pressable>
          ),
        }}
      />
      <SafeAreaView
        edges={["left", "right", "bottom"]}
        style={{
          backgroundColor: Colors[colorKey].background,
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <AppBackground />
        <Text style={{ color: "red" }}>{errorMessage || "Error: not found player"}</Text>
      </SafeAreaView>
    </>
  ) : (
    <>
      <Stack.Screen
        options={{
          title: getPlayerDisplayName(player),
          headerLeft: () => (
            <Pressable onPress={handleBack} style={{ paddingHorizontal: 4 }}>
              <Ionicons name="chevron-back" size={24} color={Colors[colorKey].text} />
            </Pressable>
          ),
        }}
      />
      <PlayerProfile person={player} />
    </>
  );
};

export default ProfileScreen;
