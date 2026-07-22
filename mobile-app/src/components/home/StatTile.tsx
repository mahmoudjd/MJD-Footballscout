import React, { useContext } from "react";
import { StyleSheet, Text, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import Colors from "@/src/constants/Colors";
import { AppContext } from "@/src/context/AppContext";
import { numeric, radius, shadow, spacing, typography } from "@/src/constants/Theme";

type Props = {
  label: string;
  value: number | string;
};

export default function StatTile({ label, value }: Props) {
  const { isDark } = useContext(AppContext);
  const colorKey = isDark ? "dark" : "light";
  const colors = Colors[colorKey];
  // Web StatTile: subtle white -> emerald-50 gradient in light mode.
  const gradient: [string, string] = isDark
    ? [colors.card, colors.surfaceSoft]
    : ["#ffffff", "#ecfdf5"];
  const valueColor = isDark ? "#ecfdf5" : "#022c22";

  return (
    <View style={[styles.wrap, shadow(isDark).sm, { borderColor: colors.border }]}>
      <LinearGradient colors={gradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.inner}>
        <Text style={[styles.label, { color: colors.notification }]} numberOfLines={1}>
          {label}
        </Text>
        <Text style={[styles.value, numeric, { color: valueColor }]}>{value}</Text>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flex: 1,
    minWidth: 100,
    borderWidth: 1,
    borderRadius: radius.lg,
    overflow: "hidden",
  },
  inner: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
  },
  label: {
    ...typography.micro,
  },
  value: {
    marginTop: 8,
    fontSize: 28,
    fontWeight: "900",
    letterSpacing: -0.8,
  },
});
