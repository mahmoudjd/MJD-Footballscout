import React, { useContext } from "react";
import { StyleSheet, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import Colors from "@/src/constants/Colors";
import { AppContext } from "@/src/context/AppContext";

export default function AppBackground() {
  const { isDark } = useContext(AppContext);
  const gradientColors: [string, string, string] = isDark
    ? ["#070d14", Colors.dark.background, "#0c1624"]
    : ["#f4fafb", Colors.light.background, "#e9f2f6"];

  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      <LinearGradient colors={gradientColors} style={StyleSheet.absoluteFill} />
      <View
        style={[
          styles.glow,
          styles.glowTopLeft,
          { backgroundColor: isDark ? "rgba(34,211,238,0.14)" : "rgba(20,184,166,0.12)" },
        ]}
      />
      <View
        style={[
          styles.glow,
          styles.glowTopRight,
          { backgroundColor: isDark ? "rgba(59,130,246,0.10)" : "rgba(14,116,144,0.08)" },
        ]}
      />
      <View
        style={[
          styles.glow,
          styles.glowBottom,
          { backgroundColor: isDark ? "rgba(45,212,191,0.07)" : "rgba(34,197,94,0.06)" },
        ]}
      />
      <View
        style={[
          styles.noise,
          { backgroundColor: isDark ? "rgba(255,255,255,0.008)" : "rgba(255,255,255,0.1)" },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  glow: {
    position: "absolute",
    borderRadius: 999,
  },
  glowTopLeft: {
    width: 260,
    height: 260,
    top: -110,
    left: -90,
  },
  glowTopRight: {
    width: 240,
    height: 240,
    top: -80,
    right: -95,
  },
  glowBottom: {
    width: 290,
    height: 290,
    bottom: -170,
    left: 10,
  },
  noise: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.3,
  },
});
