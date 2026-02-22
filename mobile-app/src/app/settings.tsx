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

type QuickLink = {
  title: string;
  subtitle: string;
  icon: keyof typeof Ionicons.glyphMap;
  href:
    | "/(tabs)/playerList"
    | "/(tabs)/search"
    | "/(tabs)/compare"
    | "/watchlists-screen";
};

const quickLinks: QuickLink[] = [
  {
    title: "Players",
    subtitle: "Browse players with filters and paging",
    icon: "people-outline",
    href: "/(tabs)/playerList",
  },
  {
    title: "Search",
    subtitle: "Find and add external players",
    icon: "search-outline",
    href: "/(tabs)/search",
  },
  {
    title: "Compare",
    subtitle: "Run player comparison and ranking",
    icon: "git-compare-outline",
    href: "/(tabs)/compare",
  },
  {
    title: "Watchlists",
    subtitle: "Track selected players in your own lists",
    icon: "heart-outline",
    href: "/watchlists-screen",
  },
];

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
            <Pressable
              style={[styles.loginQuickAction, { backgroundColor: colors.tint }]}
              onPress={() =>
                router.push({ pathname: "/login", params: { callbackUrl: "/(tabs)/account" } } as never)
              }
            >
              <Ionicons name="log-in-outline" size={16} color="#fff" />
              <Text style={styles.loginQuickActionText}>Open Login</Text>
            </Pressable>
          ) : null}
        </PageHeaderCard>

        <View
          style={[
            styles.sectionCard,
            {
              backgroundColor: colors.card,
              borderColor: colors.border,
            },
          ]}
        >
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
                    backgroundColor: session?.role === "admin" ? "rgba(239,68,68,0.14)" : "rgba(14,165,165,0.14)",
                    borderColor: session?.role === "admin" ? "rgba(239,68,68,0.35)" : "rgba(14,165,165,0.35)",
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

          <View style={styles.profileRow}>
            <View
              style={[
                styles.avatar,
                {
                  backgroundColor: isDark ? "rgba(34,211,238,0.15)" : "rgba(14,165,165,0.14)",
                },
              ]}
            >
              <Text style={[styles.avatarText, { color: colors.tint }]}>{initial}</Text>
            </View>
            <View style={styles.profileTextWrap}>
              <Text style={[styles.name, { color: colors.text }]}>
                {isAuthenticated ? displayName : "Not signed in"}
              </Text>
              <Text style={[styles.muted, { color: colors.notification }]}>
                {isAuthenticated ? displayEmail : "Login to unlock compare, profile and watchlists."}
              </Text>
            </View>
          </View>

          {isAuthenticated ? (
            <Pressable
              style={[
                styles.logoutButton,
                {
                  backgroundColor: colors.tint,
                },
              ]}
              onPress={logout}
            >
              <Ionicons name="log-out-outline" size={17} color="#fff" />
              <Text style={styles.logoutButtonText}>Logout</Text>
            </Pressable>
          ) : (
            <View style={styles.authButtonWrap}>
              <Pressable
                style={[styles.authPrimaryButton, { backgroundColor: colors.tint }]}
                onPress={() =>
                  router.push({ pathname: "/login", params: { callbackUrl: "/(tabs)/account" } } as never)
                }
              >
                <Text style={styles.authPrimaryButtonText}>Login</Text>
              </Pressable>
            </View>
          )}
        </View>

        <View
          style={[
            styles.sectionCard,
            {
              backgroundColor: colors.card,
              borderColor: colors.border,
            },
          ]}
        >
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
        </View>

        <View
          style={[
            styles.sectionCard,
            {
              backgroundColor: colors.card,
              borderColor: colors.border,
            },
          ]}
        >
          <View style={styles.sectionTitleRow}>
            <Ionicons name="grid-outline" size={16} color={colors.tint} />
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Quick Links</Text>
          </View>

          <View style={styles.linksWrap}>
            {quickLinks.map((item) => (
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
                  <View
                    style={[
                      styles.linkIconWrap,
                      { backgroundColor: isDark ? "rgba(34,211,238,0.14)" : "rgba(14,165,165,0.14)" },
                    ]}
                  >
                    <Ionicons name={item.icon} size={17} color={colors.tint} />
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
    borderWidth: 1,
    borderRadius: 14,
    padding: 12,
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
