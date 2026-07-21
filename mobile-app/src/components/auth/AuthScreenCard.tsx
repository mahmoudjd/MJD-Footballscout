import React, { PropsWithChildren, ReactNode, useContext } from "react";
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import Colors from "@/src/constants/Colors";
import { AppContext } from "@/src/context/AppContext";
import AppBackground from "@/src/components/ui/AppBackground";
import GlassSurface from "@/src/components/ui/GlassSurface";

type Props = PropsWithChildren<{
  icon: React.ComponentProps<typeof Ionicons>["name"];
  eyebrow: string;
  title: string;
  subtitle: string;
  footer: ReactNode;
}>;

export default function AuthScreenCard({ icon, eyebrow, title, subtitle, footer, children }: Props) {
  const { isDark } = useContext(AppContext);
  const colors = Colors[isDark ? "dark" : "light"];
  const canGoBack = router.canGoBack();

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]} edges={["top", "left", "right", "bottom"]}>
      <AppBackground />
      <KeyboardAvoidingView style={styles.keyboardView} behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {canGoBack ? (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Go back"
              hitSlop={10}
              onPress={() => router.back()}
              style={({ pressed }) => [
                styles.backButton,
                { borderColor: colors.border, backgroundColor: isDark ? "rgba(255,255,255,0.05)" : "rgba(255,255,255,0.6)", opacity: pressed ? 0.6 : 1 },
              ]}
            >
              <Ionicons name="chevron-back" size={20} color={colors.text} />
            </Pressable>
          ) : null}
          <View style={styles.brandRow}>
            <View style={[styles.brandMark, { backgroundColor: colors.accent }]}>
              <Ionicons name="analytics" size={18} color={colors.accentText} />
            </View>
            <Text style={[styles.brand, { color: colors.text }]}>MJD FootballScout</Text>
          </View>

          <GlassSurface style={styles.card} fallbackStyle={{ shadowColor: isDark ? "#000" : "#0f3224" }}>
            <View style={[styles.iconWrap, { backgroundColor: isDark ? "rgba(215,255,69,0.10)" : "rgba(215,255,69,0.24)" }]}>
              <Ionicons name={icon} size={23} color={colors.tint} />
            </View>
            <Text style={[styles.eyebrow, { color: colors.tint }]}>{eyebrow}</Text>
            <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
            <Text style={[styles.subtitle, { color: colors.notification }]}>{subtitle}</Text>
            <View style={styles.form}>{children}</View>
            <View style={styles.footer}>{footer}</View>
          </GlassSurface>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  keyboardView: { flex: 1 },
  scrollContent: {
    flexGrow: 1,
    width: "100%",
    maxWidth: 520,
    alignSelf: "center",
    justifyContent: "center",
    paddingHorizontal: 18,
    paddingVertical: 24,
  },
  backButton: {
    position: "absolute",
    top: 12,
    left: 18,
    width: 40,
    height: 40,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 2,
  },
  brandRow: { flexDirection: "row", alignItems: "center", gap: 9, marginBottom: 18, alignSelf: "center" },
  brandMark: { width: 34, height: 34, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  brand: { fontSize: 15, fontWeight: "900", letterSpacing: -0.2 },
  card: { width: "100%", borderRadius: 28, padding: 22, shadowOpacity: 0.10, shadowRadius: 24, shadowOffset: { width: 0, height: 12 }, elevation: 4 },
  iconWrap: { width: 48, height: 48, borderRadius: 17, alignItems: "center", justifyContent: "center", marginBottom: 16 },
  eyebrow: { fontSize: 10, fontWeight: "900", letterSpacing: 1.35, textTransform: "uppercase" },
  title: { fontSize: 29, fontWeight: "900", letterSpacing: -0.8, marginTop: 5 },
  subtitle: { fontSize: 14, lineHeight: 21, marginTop: 8 },
  form: { gap: 14, marginTop: 22 },
  footer: { marginTop: 18 },
});
