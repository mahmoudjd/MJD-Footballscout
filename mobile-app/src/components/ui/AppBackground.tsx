import React, { useContext } from "react";
import { StyleSheet, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import Colors from "@/src/constants/Colors";
import { AppContext } from "@/src/context/AppContext";

export default function AppBackground() {
  const { isDark } = useContext(AppContext);
  const gradientColors: [string, string, string] = isDark
    ? ["#080b1a", Colors.dark.background, "#121834"]
    : ["#f7f8fc", Colors.light.background, "#eceff7"];

  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      <LinearGradient colors={gradientColors} style={StyleSheet.absoluteFill} />
      <View
        style={[
          styles.glow,
          styles.glowTopLeft,
          { backgroundColor: isDark ? "rgba(201,226,101,0.05)" : "rgba(215,255,69,0.18)" },
        ]}
      />
      <View
        style={[
          styles.glow,
          styles.glowTopRight,
          { backgroundColor: isDark ? "rgba(69,88,173,0.22)" : "rgba(10,15,41,0.07)" },
        ]}
      />
      <View
        style={[
          styles.glow,
          styles.glowBottom,
          { backgroundColor: isDark ? "rgba(201,226,101,0.03)" : "rgba(69,88,173,0.08)" },
        ]}
      />
      <View style={[styles.pitchLine, styles.pitchLineOne, { borderColor: isDark ? "rgba(201,226,101,0.02)" : "rgba(10,15,41,0.025)" }]} />
      <View style={[styles.pitchLine, styles.pitchLineTwo, { borderColor: isDark ? "rgba(201,226,101,0.015)" : "rgba(10,15,41,0.02)" }]} />
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
  pitchLine: { position: "absolute", borderWidth: 1, borderRadius: 999 },
  pitchLineOne: { width: 330, height: 330, top: 180, right: -220 },
  pitchLineTwo: { width: 440, height: 440, bottom: 40, left: -330 },
});
