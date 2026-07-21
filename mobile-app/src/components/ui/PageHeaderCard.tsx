import React, { ReactNode, useContext } from "react";
import { StyleProp, StyleSheet, Text, View, ViewStyle } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { AppContext } from "@/src/context/AppContext";
import CardSurface from "@/src/components/ui/CardSurface";
import { LinearGradient } from "expo-linear-gradient";
import { BRAND, radius, typography } from "@/src/constants/Theme";

type Props = {
  icon: React.ComponentProps<typeof Ionicons>["name"];
  title: string;
  subtitle?: string;
  children?: ReactNode;
  style?: StyleProp<ViewStyle>;
};

export default function PageHeaderCard({ icon, title, subtitle, children, style }: Props) {
  const { isDark } = useContext(AppContext);

  return (
    <CardSurface style={[styles.shell, style]} padding={0} radius={26}>
      <LinearGradient colors={isDark ? ["#10271e", "#091610"] : ["#123c2c", "#071b13"]} style={styles.gradient}>
        <View style={styles.eyebrowRow}>
          <View style={styles.liveDot} />
          <Text style={styles.eyebrow}>MJD · SCOUTING INTELLIGENCE</Text>
        </View>
        <View style={styles.titleRow}>
          <View style={styles.iconWrap}>
            <Ionicons name={icon} size={22} color={BRAND.ink} />
          </View>
          <Text style={styles.title}>{title}</Text>
        </View>
        {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
        {children ? <View style={styles.children}>{children}</View> : null}
      </LinearGradient>
    </CardSurface>
  );
}

const styles = StyleSheet.create({
  shell: { overflow: "hidden" },
  gradient: { padding: 20, minHeight: 138 },
  eyebrowRow: { flexDirection: "row", alignItems: "center", gap: 7, marginBottom: 16 },
  liveDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: BRAND.lime },
  eyebrow: { color: "rgba(255,255,255,0.62)", fontSize: 9.5, fontWeight: "900", letterSpacing: 1.4 },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  iconWrap: {
    width: 46,
    height: 46,
    borderRadius: radius.md,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: BRAND.lime,
  },
  title: {
    ...typography.title,
    color: "#ffffff",
    flexShrink: 1,
  },
  subtitle: {
    color: "rgba(255,255,255,0.68)",
    marginTop: 10,
    fontSize: 13,
    lineHeight: 19,
    maxWidth: 320,
  },
  children: {
    marginTop: 9,
  },
});
