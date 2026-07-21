import React, { useContext } from "react";
import { Link, usePathname } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import Colors from "@/src/constants/Colors";
import { AppContext } from "@/src/context/AppContext";
import AppBackground from "@/src/components/ui/AppBackground";

type Props = {
  message?: string;
  withTopInset?: boolean;
  title?: string;
  callbackUrl?: string;
  actionLabel?: string;
};

export default function AuthRequiredState({
  message = "Please login to access this feature.",
  withTopInset = false,
  title = "Login required",
  callbackUrl,
  actionLabel = "Open login",
}: Props) {
  const { isDark } = useContext(AppContext);
  const pathname = usePathname();
  const colorKey = isDark ? "dark" : "light";
  const normalizedCallback =
    typeof callbackUrl === "string" && callbackUrl.trim().startsWith("/")
      ? callbackUrl.trim()
      : pathname || "/";

  return (
    <SafeAreaView
      edges={withTopInset ? ["top", "left", "right", "bottom"] : ["left", "right", "bottom"]}
      style={styles.container}
    >
      <AppBackground />
      <View
        style={[
          styles.card,
          {
            backgroundColor: Colors[colorKey].card,
            borderColor: Colors[colorKey].border,
          },
        ]}
      >
        <View style={styles.iconWrap}>
          <Ionicons name="lock-closed-outline" size={22} color={Colors[colorKey].tint} />
        </View>
        <Text style={[styles.title, { color: Colors[colorKey].text }]}>{title}</Text>
        <Text style={[styles.message, { color: Colors[colorKey].notification }]}>{message}</Text>
        <Link href={{ pathname: "/login", params: { callbackUrl: normalizedCallback } }} asChild>
          <Pressable
            style={StyleSheet.flatten([
              styles.button,
              { backgroundColor: Colors[colorKey].tint },
            ])}
          >
            <Text style={styles.buttonText}>{actionLabel}</Text>
          </Pressable>
        </Link>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  card: {
    width: "100%",
    maxWidth: 420,
    borderWidth: 1,
    borderRadius: 24,
    paddingHorizontal: 22,
    paddingVertical: 22,
    alignItems: "center",
  },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(215,255,69,0.28)",
    marginBottom: 8,
  },
  title: {
    fontSize: 22,
    fontWeight: "800",
    marginBottom: 8,
  },
  message: {
    fontSize: 15,
    textAlign: "center",
    marginBottom: 16,
  },
  button: {
    borderRadius: 12,
    paddingHorizontal: 18,
    paddingVertical: 11,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "700",
  },
});
