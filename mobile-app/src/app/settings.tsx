import React from "react";
import { router } from "expo-router";
import { Pressable, ScrollView, StyleSheet, Switch, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Colors from "@/src/constants/Colors";
import { AppContext } from "@/src/context/AppContext";
import { useAuth } from "@/src/context/AuthContext";
import LoadingState from "@/src/components/ui/LoadingState";
import ScreenContainer from "@/src/components/ui/ScreenContainer";
import PageHeaderCard from "@/src/components/ui/PageHeaderCard";
import CardSurface from "@/src/components/ui/CardSurface";
import AppButton from "@/src/components/ui/AppButton";
import { accentSoft, accentSoftText } from "@/src/constants/Theme";

type QuickLinkGroup = "Analysis" | "Scouting tools" | "Support";

type QuickLink = {
  title: string;
  subtitle: string;
  icon: keyof typeof Ionicons.glyphMap;
  group: QuickLinkGroup;
  href:
    | "/compare"
    | "/recruitment"
    | "/shadow-team"
    | "/help";
};

// Home, Search, Players and Watchlists already live in the tab bar, so the
// More hub only lists the destinations that are NOT one tap away there.
const quickLinks: QuickLink[] = [
  {
    title: "Compare",
    subtitle: "Rank candidates side by side across key metrics",
    icon: "git-compare-outline",
    group: "Analysis",
    href: "/compare",
  },
  {
    title: "Recruitment",
    subtitle: "Manage targets through your scouting pipeline",
    icon: "briefcase-outline",
    group: "Scouting tools",
    href: "/recruitment",
  },
  {
    title: "Shadow Team",
    subtitle: "Plan formations and assess squad gaps",
    icon: "football-outline",
    group: "Scouting tools",
    href: "/shadow-team",
  },
  {
    title: "Help center",
    subtitle: "Workflow guidance and answers to common questions",
    icon: "help-buoy-outline",
    group: "Support",
    href: "/help",
  },
];

const quickLinkGroups: QuickLinkGroup[] = ["Analysis", "Scouting tools", "Support"];

function resolveInitial(name: string, email: string) {
  const source = name.trim() || email.trim() || "S";
  return source.charAt(0).toUpperCase();
}

export default function SettingsScreen() {
  const { isDark, setIsDark } = React.useContext(AppContext);
  const { session, isAuthenticated, isAuthReady, logout } = useAuth();
  const colorKey = isDark ? "dark" : "light";
  const colors = Colors[colorKey];

  if (!isAuthReady) {
    return <LoadingState withTopInset />;
  }

  const displayName = session?.name?.trim() || "Scout User";
  const displayEmail = session?.email?.trim() || "No email";
  const initial = resolveInitial(displayName, displayEmail);

  return (
    <ScreenContainer withTopInset style={styles.screen}>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <PageHeaderCard
          icon="ellipsis-horizontal-circle-outline"
          title="Account & Settings"
          subtitle="Manage login, theme, and navigation from one place."
        >
          {!isAuthenticated ? (
            <AppButton
              label="Open Login"
              icon="log-in-outline"
              size="sm"
              fullWidth={false}
              onPress={() =>
                router.push({ pathname: "/login", params: { callbackUrl: "/(tabs)/account" } } as never)
              }
            />
          ) : null}
        </PageHeaderCard>

        <CardSurface style={styles.sectionCard} padding={14} radius={20}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleRow}>
              <Ionicons name="person-outline" size={16} color={colors.tint} />
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Account</Text>
            </View>
            {isAuthenticated ? (
              <View
                style={[
                  styles.roleBadge,
                  {
                    backgroundColor: session?.role === "admin" ? "rgba(239,68,68,0.14)" : "rgba(215,255,69,0.30)",
                    borderColor: session?.role === "admin" ? "rgba(239,68,68,0.35)" : "rgba(18,60,44,0.30)",
                  },
                ]}
              >
                <Text
                  style={[
                    styles.roleBadgeText,
                    { color: session?.role === "admin" ? "#ef4444" : colors.tint },
                  ]}
                >
                  {session?.role === "admin" ? "ADMIN" : "USER"}
                </Text>
              </View>
            ) : null}
          </View>

          <Pressable
            accessibilityRole={isAuthenticated ? "button" : undefined}
            accessibilityLabel={isAuthenticated ? "Manage your account" : undefined}
            disabled={!isAuthenticated}
            onPress={() => router.push("/profile" as never)}
            style={({ pressed }) => [styles.profileRow, pressed && isAuthenticated ? { opacity: 0.72 } : null]}
          >
            <View style={[styles.avatar, { backgroundColor: accentSoft(isDark) }]}>
              <Text style={[styles.avatarText, { color: accentSoftText(isDark) }]}>{initial}</Text>
            </View>
            <View style={styles.profileTextWrap}>
              <Text style={[styles.name, { color: colors.text }]}>
                {isAuthenticated ? displayName : "Not signed in"}
              </Text>
              <Text style={[styles.muted, { color: colors.notification }]}>
                {isAuthenticated
                  ? "Manage profile, security & MFA"
                  : "Login to unlock compare, profile and watchlists."}
              </Text>
            </View>
            {isAuthenticated ? (
              <Ionicons name="chevron-forward-outline" size={18} color={colors.notification} />
            ) : null}
          </Pressable>

          {isAuthenticated ? (
            <AppButton
              label="Logout"
              icon="log-out-outline"
              size="md"
              onPress={logout}
            />
          ) : (
            <AppButton
              label="Login"
              icon="log-in-outline"
              size="md"
              onPress={() =>
                router.push({ pathname: "/login", params: { callbackUrl: "/(tabs)/account" } } as never)
              }
            />
          )}
        </CardSurface>

        <CardSurface style={styles.sectionCard} padding={14} radius={20}>
          <View style={styles.sectionTitleRow}>
            <Ionicons name="color-palette-outline" size={16} color={colors.tint} />
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Appearance</Text>
          </View>

          <View
            style={[
              styles.settingRow,
              {
                borderColor: colors.border,
                backgroundColor: colors.background,
              },
            ]}
          >
            <View style={styles.settingTextBlock}>
              <Text style={[styles.settingTitle, { color: colors.text }]}>Dark mode</Text>
              <Text style={[styles.settingSubtitle, { color: colors.notification }]}>
                {isDark ? "Enabled for low-light viewing" : "Disabled for bright interface"}
              </Text>
            </View>
            <Switch
              value={isDark}
              onValueChange={() => setIsDark((prev: boolean) => !prev)}
              trackColor={{ false: "#94a3b8", true: colors.tint }}
              thumbColor="#f8fafc"
            />
          </View>
        </CardSurface>

        <CardSurface style={styles.sectionCard} padding={14} radius={20}>
          <View style={styles.sectionTitleRow}>
            <Ionicons name="compass-outline" size={16} color={colors.tint} />
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Tools & more</Text>
          </View>

          {quickLinkGroups.map((group) => (
            <View key={group} style={styles.linkGroup}>
              <Text style={[styles.linkGroupLabel, { color: colors.notification }]}>{group.toUpperCase()}</Text>
              <View style={styles.linksWrap}>
                {quickLinks
                  .filter((item) => item.group === group)
                  .map((item) => (
                    <Pressable
                      key={item.href}
                      style={[
                        styles.linkItem,
                        {
                          borderColor: colors.border,
                          backgroundColor: colors.background,
                        },
                      ]}
                      onPress={() => router.push(item.href as never)}
                    >
                      <View style={styles.linkMain}>
                        <View style={[styles.linkIconWrap, { backgroundColor: accentSoft(isDark) }]}>
                          <Ionicons name={item.icon} size={18} color={accentSoftText(isDark)} />
                        </View>
                        <View style={styles.linkTextWrap}>
                          <Text style={[styles.linkTitle, { color: colors.text }]}>{item.title}</Text>
                          <Text style={[styles.linkSubtitle, { color: colors.notification }]}>{item.subtitle}</Text>
                        </View>
                      </View>
                      <Ionicons name="chevron-forward-outline" size={18} color={colors.notification} />
                    </Pressable>
                  ))}
              </View>
            </View>
          ))}
        </CardSurface>
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  screen: {
    alignItems: "center",
  },
  scroll: {
    width: "92%",
    flex: 1,
  },
  content: {
    paddingTop: 0,
    paddingBottom: 20,
    gap: 12,
  },
  loginQuickAction: {
    marginTop: 2,
    borderRadius: 10,
    paddingVertical: 9,
    paddingHorizontal: 12,
    flexDirection: "row",
    alignSelf: "flex-start",
    alignItems: "center",
    gap: 6,
  },
  loginQuickActionText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 13,
  },
  sectionCard: {
    gap: 10,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },
  sectionTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: "800",
  },
  roleBadge: {
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  roleBadgeText: {
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 0.4,
  },
  profileRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 11,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    fontSize: 18,
    fontWeight: "800",
  },
  profileTextWrap: {
    flex: 1,
    gap: 2,
  },
  name: {
    fontSize: 16,
    fontWeight: "700",
  },
  muted: {
    fontSize: 13,
    lineHeight: 18,
  },
  authButtonWrap: {
    width: "100%",
  },
  authPrimaryButton: {
    width: "100%",
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: "center",
  },
  authPrimaryButtonText: {
    color: "#fff",
    fontWeight: "700",
  },
  logoutButton: {
    marginTop: 4,
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 8,
  },
  logoutButtonText: {
    color: "#fff",
    fontWeight: "700",
  },
  settingRow: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 9,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  settingTextBlock: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 14,
    fontWeight: "700",
  },
  settingSubtitle: {
    fontSize: 12,
    marginTop: 2,
  },
  linkGroup: {
    gap: 8,
  },
  linkGroupLabel: {
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 0.8,
    marginTop: 2,
  },
  linksWrap: {
    gap: 8,
  },
  linkItem: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
  },
  linkMain: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    gap: 10,
  },
  linkIconWrap: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
  },
  linkTextWrap: {
    flex: 1,
    gap: 2,
  },
  linkTitle: {
    fontSize: 14,
    fontWeight: "700",
  },
  linkSubtitle: {
    fontSize: 12,
  },
});
