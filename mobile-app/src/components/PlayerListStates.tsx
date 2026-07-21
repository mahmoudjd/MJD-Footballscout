import React, { useEffect, useRef } from "react";
import { Animated, Pressable, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Colors from "@/src/constants/Colors";
import { AppContext } from "@/src/context/AppContext";

export function PlayerListSkeleton({ rows = 5 }: { rows?: number }) {
  const { isDark } = React.useContext(AppContext);
  const opacity = useRef(new Animated.Value(0.45)).current;
  const colors = Colors[isDark ? "dark" : "light"];

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 0.9, duration: 650, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0.45, duration: 650, useNativeDriver: true }),
      ]),
    );
    animation.start();
    return () => animation.stop();
  }, [opacity]);

  return (
    <View accessibilityLabel="Loading players" accessibilityRole="progressbar" style={styles.skeletonList}>
      {Array.from({ length: rows }, (_, index) => (
        <Animated.View
          key={index}
          style={[styles.skeletonCard, { backgroundColor: colors.card, borderColor: colors.border, opacity }]}
        >
          <View style={[styles.skeletonAvatar, { backgroundColor: colors.surfaceSoft }]} />
          <View style={styles.skeletonCopy}>
            <View style={[styles.skeletonLineWide, { backgroundColor: colors.surfaceSoft }]} />
            <View style={[styles.skeletonLine, { backgroundColor: colors.surfaceSoft }]} />
            <View style={styles.skeletonPills}>
              <View style={[styles.skeletonPill, { backgroundColor: colors.surfaceSoft }]} />
              <View style={[styles.skeletonPill, { backgroundColor: colors.surfaceSoft }]} />
            </View>
          </View>
        </Animated.View>
      ))}
    </View>
  );
}

type EmptyProps = {
  error?: string;
  onAction: () => void;
};

export function PlayerListEmptyState({ error, onAction }: EmptyProps) {
  const { isDark } = React.useContext(AppContext);
  const colors = Colors[isDark ? "dark" : "light"];

  return (
    <View style={[styles.emptyCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <View style={[styles.emptyIcon, { backgroundColor: colors.surfaceSoft }]}>
        <Ionicons name={error ? "cloud-offline-outline" : "search-outline"} size={30} color={colors.tint} />
      </View>
      <Text accessibilityRole="header" style={[styles.emptyTitle, { color: colors.text }]}>
        {error ? "Players unavailable" : "No matching players"}
      </Text>
      <Text style={[styles.emptyCopy, { color: colors.notification }]}>
        {error || "Try removing some filters to broaden your player search."}
      </Text>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={error ? "Retry loading players" : "Reset player filters"}
        onPress={onAction}
        style={({ pressed }) => [
          styles.emptyAction,
          { backgroundColor: colors.accent },
          pressed ? styles.actionPressed : undefined,
        ]}
      >
        <Ionicons name={error ? "refresh" : "funnel-outline"} size={16} color={colors.accentText} />
        <Text style={[styles.emptyActionText, { color: colors.accentText }]}>
          {error ? "Try again" : "Reset filters"}
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  skeletonList: { paddingTop: 8 },
  skeletonCard: {
    minHeight: 84,
    borderWidth: 1,
    borderRadius: 18,
    padding: 11,
    marginBottom: 9,
    flexDirection: "row",
    gap: 12,
  },
  skeletonAvatar: { width: 58, height: 62, borderRadius: 16 },
  skeletonCopy: { flex: 1, justifyContent: "center", gap: 7 },
  skeletonLineWide: { width: "74%", height: 12, borderRadius: 6 },
  skeletonLine: { width: "48%", height: 9, borderRadius: 5 },
  skeletonPills: { flexDirection: "row", gap: 6 },
  skeletonPill: { width: 62, height: 16, borderRadius: 999 },
  emptyCard: {
    minHeight: 270,
    marginTop: 10,
    borderWidth: 1,
    borderRadius: 22,
    padding: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyIcon: { width: 62, height: 62, borderRadius: 20, alignItems: "center", justifyContent: "center" },
  emptyTitle: { marginTop: 16, fontSize: 19, fontWeight: "900", textAlign: "center" },
  emptyCopy: { marginTop: 7, maxWidth: 290, fontSize: 13, lineHeight: 19, textAlign: "center" },
  emptyAction: {
    minHeight: 44,
    marginTop: 18,
    borderRadius: 14,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 7,
  },
  emptyActionText: { fontSize: 13, fontWeight: "800" },
  actionPressed: { opacity: 0.8 },
});
