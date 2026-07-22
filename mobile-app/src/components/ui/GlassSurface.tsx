import React, { PropsWithChildren, useContext } from "react";
import { Platform, StyleProp, StyleSheet, View, ViewStyle } from "react-native";
import { GlassView, isLiquidGlassAvailable } from "expo-glass-effect";
import Colors from "@/src/constants/Colors";
import { AppContext } from "@/src/context/AppContext";

type Props = PropsWithChildren<{
  style?: StyleProp<ViewStyle>;
  fallbackStyle?: StyleProp<ViewStyle>;
  interactive?: boolean;
}>;

export default function GlassSurface({ children, style, fallbackStyle, interactive = false }: Props) {
  const { isDark } = useContext(AppContext);
  const colors = Colors[isDark ? "dark" : "light"];

  if (Platform.OS === "ios" && isLiquidGlassAvailable()) {
    return (
      <GlassView
        glassEffectStyle="regular"
        colorScheme={isDark ? "dark" : "light"}
        tintColor={isDark ? "rgba(12,30,21,0.58)" : "rgba(255,255,255,0.52)"}
        isInteractive={interactive}
        style={[styles.glass, style]}
      >
        {children}
      </GlassView>
    );
  }

  return (
    <View style={[styles.fallback, { backgroundColor: colors.card, borderColor: colors.border }, fallbackStyle, style]}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  glass: {
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "rgba(255,255,255,0.26)",
    overflow: "hidden",
  },
  fallback: { borderWidth: 1 },
});
