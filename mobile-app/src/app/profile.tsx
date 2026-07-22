import React, { useCallback, useContext, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Linking,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import Colors from "@/src/constants/Colors";
import { AppContext } from "@/src/context/AppContext";
import { useAuth } from "@/src/context/AuthContext";
import ScreenContainer from "@/src/components/ui/ScreenContainer";
import AuthRequiredState from "@/src/components/ui/AuthRequiredState";
import LoadingState from "@/src/components/ui/LoadingState";
import AppButton from "@/src/components/ui/AppButton";
import CardSurface from "@/src/components/ui/CardSurface";
import QrCode from "@/src/components/ui/QrCode";
import { runAuthorizedRequest } from "@/src/utils/runAuthorizedRequest";
import {
  changeAccountPassword,
  deactivateAccount,
  disableMfa,
  enableMfa,
  getAccountProfile,
  startMfaSetup,
  updateAccountProfile,
  updateNotificationPreferences,
} from "@/src/apiServices";
import { AccountProfile, MfaSetupResponse } from "@/src/data/Types";
import { BRAND, accentSoft, accentSoftText, onTint, radius, shadow, spacing } from "@/src/constants/Theme";

type AccountTab = "overview" | "security" | "danger";

const ACCOUNT_TABS: Array<{
  key: AccountTab;
  label: string;
  icon: React.ComponentProps<typeof Ionicons>["name"];
}> = [
  { key: "overview", label: "Overview", icon: "person-circle-outline" },
  { key: "security", label: "Security", icon: "shield-checkmark-outline" },
  { key: "danger", label: "Account", icon: "trash-outline" },
];

function formatMemberSince(value?: string) {
  if (!value) return "—";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return "—";
  return parsed.toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" });
}

function getPasswordScore(password: string) {
  return (
    Number(password.length >= 8) +
    Number(/[a-z]/.test(password) && /[A-Z]/.test(password)) +
    Number(/[0-9!@#$%^&*(),.?":{}|<>]/.test(password))
  );
}

export default function AccountProfileScreen() {
  const { isDark } = useContext(AppContext);
  const colors = Colors[isDark ? "dark" : "light"];
  const { session, isAuthenticated, isAuthReady, refreshSession, updateSession, logout } = useAuth();

  const [activeTab, setActiveTab] = useState<AccountTab>("overview");
  const [profile, setProfile] = useState<AccountProfile | null>(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [profileLoadError, setProfileLoadError] = useState("");

  // Overview state
  const [nameDraft, setNameDraft] = useState<string | null>(null);
  const [isSavingName, setIsSavingName] = useState(false);
  const [isSavingPrefs, setIsSavingPrefs] = useState(false);

  // Security state
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  // MFA state
  const [mfaPassword, setMfaPassword] = useState("");
  const [mfaCode, setMfaCode] = useState("");
  const [mfaSetup, setMfaSetup] = useState<MfaSetupResponse | null>(null);
  const [mfaRecoveryCodes, setMfaRecoveryCodes] = useState<string[]>([]);
  const [mfaError, setMfaError] = useState("");
  const [isMfaBusy, setIsMfaBusy] = useState(false);

  // Danger state
  const [deactivationPassword, setDeactivationPassword] = useState("");
  const [deactivationReason, setDeactivationReason] = useState("");
  const [deactivationError, setDeactivationError] = useState("");
  const [isDeactivating, setIsDeactivating] = useState(false);

  const savedName = profile?.name ?? session?.name ?? "";
  const resolvedName = nameDraft ?? savedName;
  const displayName = resolvedName.trim() || "Account";
  const nameIsDirty = resolvedName.trim() !== savedName.trim();
  const provider = profile?.authProvider || "credentials";
  const providerLabel = provider === "google" ? "Google" : "Email & Password";
  const isGoogle = provider === "google";

  const loadProfile = useCallback(async () => {
    if (!session) return;
    try {
      setIsLoadingProfile(true);
      setProfileLoadError("");
      const data = await runAuthorizedRequest({
        session,
        refreshSession,
        request: (token) => getAccountProfile(token),
      });
      setProfile(data);
    } catch (error) {
      console.error(error);
      setProfileLoadError(error instanceof Error ? error.message : "Profile could not be loaded.");
    } finally {
      setIsLoadingProfile(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session?.accessToken, refreshSession]);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  const handleSaveName = useCallback(async () => {
    if (!session) return;
    const normalized = resolvedName.trim();
    if (!normalized) {
      Alert.alert("Validation", "Enter the display name you want to use.");
      return;
    }
    if (!nameIsDirty) return;
    try {
      setIsSavingName(true);
      const updated = await runAuthorizedRequest({
        session,
        refreshSession,
        request: (token) => updateAccountProfile(token, normalized),
      });
      setProfile((current) => (current ? { ...current, name: updated.name } : current));
      updateSession({ ...session, name: updated.name });
      setNameDraft(null);
      Alert.alert("Success", "Profile updated successfully.");
    } catch (error) {
      console.error(error);
      Alert.alert("Error", error instanceof Error ? error.message : "Profile could not be updated.");
    } finally {
      setIsSavingName(false);
    }
  }, [session, refreshSession, resolvedName, nameIsDirty, updateSession]);

  const handleTogglePreference = useCallback(
    async (key: "securityEmailsEnabled" | "onboardingEmailsEnabled", value: boolean) => {
      if (!session || !profile) return;
      const previous = profile[key];
      setProfile({ ...profile, [key]: value });
      try {
        setIsSavingPrefs(true);
        await runAuthorizedRequest({
          session,
          refreshSession,
          request: (token) => updateNotificationPreferences(token, { [key]: value }),
        });
      } catch (error) {
        console.error(error);
        setProfile((current) => (current ? { ...current, [key]: previous } : current));
        Alert.alert("Error", "Email preferences could not be updated.");
      } finally {
        setIsSavingPrefs(false);
      }
    },
    [session, refreshSession, profile],
  );

  const handleChangePassword = useCallback(async () => {
    if (!session) return;
    setPasswordError("");
    if (!currentPassword) {
      setPasswordError("Enter your current password to continue.");
      return;
    }
    if (newPassword.length < 8) {
      setPasswordError("Use at least 8 characters for your new password.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError("New passwords do not match.");
      return;
    }
    try {
      setIsChangingPassword(true);
      await runAuthorizedRequest({
        session,
        refreshSession,
        request: (token) => changeAccountPassword(token, { currentPassword, newPassword }),
      });
      Alert.alert("Password changed", "Please sign in again with your new password.", [
        { text: "OK", onPress: logout },
      ]);
    } catch (error) {
      console.error(error);
      setPasswordError(error instanceof Error ? error.message : "Password could not be changed.");
    } finally {
      setIsChangingPassword(false);
    }
  }, [session, refreshSession, currentPassword, newPassword, confirmPassword, logout]);

  const handleStartMfaSetup = useCallback(async () => {
    if (!session) return;
    setMfaError("");
    try {
      setIsMfaBusy(true);
      const setup = await runAuthorizedRequest({
        session,
        refreshSession,
        request: (token) => startMfaSetup(token, mfaPassword || undefined),
      });
      setMfaSetup(setup);
      setMfaCode("");
    } catch (error) {
      console.error(error);
      setMfaError(error instanceof Error ? error.message : "MFA setup could not be started.");
    } finally {
      setIsMfaBusy(false);
    }
  }, [session, refreshSession, mfaPassword]);

  const handleEnableMfa = useCallback(async () => {
    if (!session) return;
    setMfaError("");
    try {
      setIsMfaBusy(true);
      const result = await runAuthorizedRequest({
        session,
        refreshSession,
        request: (token) => enableMfa(token, mfaCode),
      });
      setMfaRecoveryCodes(result.recoveryCodes);
      setMfaSetup(null);
      setMfaCode("");
      setMfaPassword("");
      setProfile((current) => (current ? { ...current, mfaEnabled: true } : current));
      Alert.alert("Success", "Multi-factor authentication enabled.");
    } catch (error) {
      console.error(error);
      setMfaError(error instanceof Error ? error.message : "MFA could not be enabled.");
    } finally {
      setIsMfaBusy(false);
    }
  }, [session, refreshSession, mfaCode]);

  const handleDisableMfa = useCallback(async () => {
    if (!session) return;
    setMfaError("");
    try {
      setIsMfaBusy(true);
      await runAuthorizedRequest({
        session,
        refreshSession,
        request: (token) => disableMfa(token, { code: mfaCode, password: mfaPassword || undefined }),
      });
      setMfaCode("");
      setMfaPassword("");
      setProfile((current) => (current ? { ...current, mfaEnabled: false } : current));
      Alert.alert("Success", "Multi-factor authentication disabled.");
    } catch (error) {
      console.error(error);
      setMfaError(error instanceof Error ? error.message : "MFA could not be disabled.");
    } finally {
      setIsMfaBusy(false);
    }
  }, [session, refreshSession, mfaCode, mfaPassword]);

  const handleDeactivate = useCallback(() => {
    if (!session) return;
    setDeactivationError("");
    if (!isGoogle && !deactivationPassword) {
      setDeactivationError("Enter your current password before deactivating your account.");
      return;
    }
    Alert.alert(
      "Deactivate your account?",
      "You will be signed out immediately. Your account remains stored but cannot be used to sign in.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Deactivate",
          style: "destructive",
          onPress: async () => {
            try {
              setIsDeactivating(true);
              await runAuthorizedRequest({
                session,
                refreshSession,
                request: (token) =>
                  deactivateAccount(token, {
                    password: deactivationPassword || undefined,
                    reason: deactivationReason.trim() || undefined,
                  }),
              });
              logout();
            } catch (error) {
              console.error(error);
              setDeactivationError(
                error instanceof Error ? error.message : "Account could not be deactivated.",
              );
            } finally {
              setIsDeactivating(false);
            }
          },
        },
      ],
    );
  }, [session, refreshSession, isGoogle, deactivationPassword, deactivationReason, logout]);

  const passwordScore = useMemo(() => getPasswordScore(newPassword), [newPassword]);
  const passwordStrengthLabel =
    newPassword.length === 0
      ? "Enter a new password"
      : passwordScore === 3
        ? "Strong"
        : passwordScore === 2
          ? "Good"
          : "Needs more strength";

  const inputStyle = [
    styles.input,
    { color: colors.text, borderColor: colors.border, backgroundColor: colors.card },
  ];

  if (!isAuthReady) {
    return <LoadingState />;
  }

  if (!isAuthenticated) {
    return <AuthRequiredState message="Sign in to manage your profile and security settings." />;
  }

  const facts: Array<{
    icon: React.ComponentProps<typeof Ionicons>["name"];
    label: string;
    value: string;
  }> = [
    { icon: "id-card-outline", label: "Role", value: profile?.role || session?.role || "user" },
    { icon: "lock-closed-outline", label: "Sign-in", value: providerLabel },
    { icon: "calendar-outline", label: "Member since", value: formatMemberSince(profile?.createdAt) },
    {
      icon: "mail-outline",
      label: "Email status",
      value: profile ? (profile.emailVerified ? "Verified" : "Verification required") : "—",
    },
  ];

  return (
    <ScreenContainer style={styles.screen}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Hero header — mirrors the web Account Center hero */}
        <CardSurface style={styles.heroShell} padding={0} radius={26}>
          <LinearGradient colors={["#022c22", "#064e3b", "#047857"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.hero}>
            <View style={styles.heroTopRow}>
              <View style={styles.heroAvatarWrap}>
                <Text style={styles.heroAvatarText}>{displayName.charAt(0).toUpperCase() || "A"}</Text>
                <View style={styles.heroActiveDot} />
              </View>
              <View style={styles.heroIdentity}>
                <Text style={styles.heroEyebrow}>YOUR ACCOUNT CENTER</Text>
                <Text style={styles.heroName} numberOfLines={1}>
                  {displayName}
                </Text>
                <Text style={styles.heroEmail} numberOfLines={1}>
                  {profile?.email || session?.email || ""}
                </Text>
              </View>
            </View>
            <View style={styles.heroBadges}>
              <View style={styles.heroBadge}>
                <Ionicons name="checkmark-circle" size={13} color={BRAND.lime} />
                <Text style={[styles.heroBadgeText, { color: BRAND.lime }]}>Active</Text>
              </View>
              <View style={styles.heroBadge}>
                <Ionicons name="shield-checkmark-outline" size={13} color="rgba(255,255,255,0.85)" />
                <Text style={styles.heroBadgeText}>{providerLabel}</Text>
              </View>
              <View style={styles.heroBadge}>
                <Ionicons name="id-card-outline" size={13} color="rgba(255,255,255,0.85)" />
                <Text style={[styles.heroBadgeText, styles.heroBadgeCapitalize]}>
                  {profile?.role || session?.role || "user"}
                </Text>
              </View>
              {profile?.mfaEnabled ? (
                <View style={styles.heroBadge}>
                  <Ionicons name="key-outline" size={13} color={BRAND.lime} />
                  <Text style={[styles.heroBadgeText, { color: BRAND.lime }]}>MFA</Text>
                </View>
              ) : null}
            </View>
          </LinearGradient>
        </CardSurface>

        {/* Segmented section control */}
        <View
          style={[
            styles.segmentBar,
            {
              backgroundColor: isDark ? "rgba(255,255,255,0.05)" : "rgba(10,33,24,0.045)",
              borderColor: colors.border,
            },
          ]}
        >
          {ACCOUNT_TABS.map((tab) => {
            const selected = activeTab === tab.key;
            const danger = tab.key === "danger";
            const activeBg = danger ? "#dc2626" : colors.tint;
            const activeFg = danger ? "#ffffff" : onTint(isDark);
            return (
              <Pressable
                key={tab.key}
                accessibilityRole="tab"
                accessibilityState={{ selected }}
                onPress={() => setActiveTab(tab.key)}
                style={[
                  styles.segment,
                  selected ? { backgroundColor: activeBg } : null,
                  selected ? shadow(isDark).sm : null,
                ]}
              >
                <Ionicons name={tab.icon} size={15} color={selected ? activeFg : colors.notification} />
                <Text style={[styles.segmentText, { color: selected ? activeFg : colors.notification }]}>
                  {tab.label}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {isLoadingProfile && !profile ? (
          <View style={styles.centerBox}>
            <ActivityIndicator size="large" color={colors.tint} />
          </View>
        ) : profileLoadError && !profile ? (
          <CardSurface style={styles.sectionCard}>
            <Text style={[styles.errorText, { color: "#ef4444" }]}>{profileLoadError}</Text>
            <AppButton label="Try again" variant="ghost" size="md" onPress={loadProfile} />
          </CardSurface>
        ) : activeTab === "overview" ? (
          <>
            {/* Personal information */}
            <CardSurface style={styles.sectionCard}>
              <View style={styles.sectionIntro}>
                <View style={[styles.sectionIcon, { backgroundColor: accentSoft(isDark) }]}>
                  <Ionicons name="person-circle-outline" size={19} color={accentSoftText(isDark)} />
                </View>
                <View style={styles.sectionIntroText}>
                  <Text style={[styles.sectionTitle, { color: colors.text }]}>Personal Information</Text>
                  <Text style={[styles.sectionSubtitle, { color: colors.notification }]}>
                    Control the identity displayed throughout your scouting workspace.
                  </Text>
                </View>
              </View>

              <Text style={[styles.fieldLabel, { color: colors.text }]}>Display name</Text>
              <TextInput
                value={resolvedName}
                onChangeText={(value) => setNameDraft(value)}
                placeholder="Example: Alex Morgan"
                placeholderTextColor={colors.notification}
                maxLength={80}
                autoCapitalize="words"
                style={inputStyle}
              />
              <Text style={[styles.fieldLabel, { color: colors.text, marginTop: 12 }]}>Email address</Text>
              <TextInput
                value={profile?.email || session?.email || ""}
                editable={false}
                style={[
                  styles.input,
                  styles.inputDisabled,
                  { color: colors.notification, borderColor: colors.border, backgroundColor: colors.surfaceSoft },
                ]}
              />
              <Text style={[styles.fieldHint, { color: colors.notification }]}>
                Your sign-in provider manages this email address.
              </Text>
              <View style={styles.buttonRow}>
                <AppButton
                  label="Save changes"
                  icon="save-outline"
                  size="md"
                  fullWidth={false}
                  style={styles.buttonGrow}
                  loading={isSavingName}
                  disabled={!nameIsDirty || isSavingName}
                  onPress={handleSaveName}
                />
                {nameIsDirty ? (
                  <AppButton
                    label="Discard"
                    variant="ghost"
                    size="md"
                    fullWidth={false}
                    onPress={() => setNameDraft(null)}
                  />
                ) : null}
              </View>
            </CardSurface>

            {/* Account snapshot */}
            <CardSurface style={styles.sectionCard}>
              <View style={styles.sectionIntro}>
                <View style={[styles.sectionIcon, { backgroundColor: accentSoft(isDark) }]}>
                  <Ionicons name="sparkles-outline" size={18} color={accentSoftText(isDark)} />
                </View>
                <View style={styles.sectionIntroText}>
                  <Text style={[styles.sectionTitle, { color: colors.text }]}>Account Snapshot</Text>
                  <Text style={[styles.sectionSubtitle, { color: colors.notification }]}>
                    Your membership and sign-in details.
                  </Text>
                </View>
              </View>
              <View style={styles.factList}>
                {facts.map((fact) => (
                  <View
                    key={fact.label}
                    style={[styles.factRow, { borderColor: colors.border, backgroundColor: colors.background }]}
                  >
                    <View style={[styles.factIcon, { backgroundColor: accentSoft(isDark) }]}>
                      <Ionicons name={fact.icon} size={15} color={accentSoftText(isDark)} />
                    </View>
                    <View style={styles.factText}>
                      <Text style={[styles.factLabel, { color: colors.notification }]}>{fact.label}</Text>
                      <Text style={[styles.factValue, { color: colors.text }]} numberOfLines={1}>
                        {fact.value}
                      </Text>
                    </View>
                  </View>
                ))}
              </View>
            </CardSurface>

            {/* Email notifications */}
            <CardSurface style={styles.sectionCard}>
              <View style={styles.sectionIntro}>
                <View style={[styles.sectionIcon, { backgroundColor: accentSoft(isDark) }]}>
                  <Ionicons name="notifications-outline" size={18} color={accentSoftText(isDark)} />
                </View>
                <View style={styles.sectionIntroText}>
                  <Text style={[styles.sectionTitle, { color: colors.text }]}>Email Notifications</Text>
                  <Text style={[styles.sectionSubtitle, { color: colors.notification }]}>
                    Control important account and security alerts.
                  </Text>
                </View>
              </View>
              <View style={[styles.toggleRow, { borderColor: colors.border, backgroundColor: colors.background }]}>
                <View style={styles.toggleText}>
                  <Text style={[styles.toggleTitle, { color: colors.text }]}>Account & security emails</Text>
                  <Text style={[styles.toggleSubtitle, { color: colors.notification }]}>
                    Alerts for password changes, MFA changes and other sensitive actions.
                  </Text>
                </View>
                <Switch
                  value={profile?.securityEmailsEnabled ?? true}
                  disabled={isSavingPrefs}
                  onValueChange={(value) => handleTogglePreference("securityEmailsEnabled", value)}
                  trackColor={{ false: "#94a3b8", true: colors.tint }}
                  thumbColor="#f8fafc"
                />
              </View>
              <View style={[styles.toggleRow, { borderColor: colors.border, backgroundColor: colors.background }]}>
                <View style={styles.toggleText}>
                  <Text style={[styles.toggleTitle, { color: colors.text }]}>Getting-started emails</Text>
                  <Text style={[styles.toggleSubtitle, { color: colors.notification }]}>
                    Two short guides about watchlists and recruitment planning.
                  </Text>
                </View>
                <Switch
                  value={profile?.onboardingEmailsEnabled ?? true}
                  disabled={isSavingPrefs}
                  onValueChange={(value) => handleTogglePreference("onboardingEmailsEnabled", value)}
                  trackColor={{ false: "#94a3b8", true: colors.tint }}
                  thumbColor="#f8fafc"
                />
              </View>
            </CardSurface>

            {/* MFA */}
            <CardSurface style={styles.sectionCard}>
              <View style={styles.sectionIntro}>
                <View style={[styles.sectionIcon, { backgroundColor: accentSoft(isDark) }]}>
                  <Ionicons name="phone-portrait-outline" size={18} color={accentSoftText(isDark)} />
                </View>
                <View style={styles.sectionIntroText}>
                  <Text style={[styles.sectionTitle, { color: colors.text }]}>Multi-Factor Authentication</Text>
                  <Text style={[styles.sectionSubtitle, { color: colors.notification }]}>
                    Add an authenticator app as a second sign-in step.
                  </Text>
                </View>
              </View>

              {isGoogle ? (
                <Text style={[styles.mutedBox, { color: colors.notification, backgroundColor: colors.surfaceSoft }]}>
                  Two-step verification is managed in your Google Account. Your MJD sign-in inherits that
                  protection.
                </Text>
              ) : mfaRecoveryCodes.length > 0 ? (
                <View style={[styles.recoveryBox, { borderColor: colors.tint }]}>
                  <Text style={[styles.toggleTitle, { color: colors.text }]}>Save your recovery codes now</Text>
                  <Text style={[styles.toggleSubtitle, { color: colors.notification }]}>
                    Each code works once. They will not be shown again — copy them somewhere safe.
                  </Text>
                  <View style={styles.recoveryGrid}>
                    {mfaRecoveryCodes.map((code) => (
                      <Text
                        key={code}
                        selectable
                        style={[styles.recoveryCode, { color: colors.text, backgroundColor: colors.surfaceSoft }]}
                      >
                        {code}
                      </Text>
                    ))}
                  </View>
                  <AppButton
                    label="Done — codes saved"
                    variant="ghost"
                    size="md"
                    onPress={() => setMfaRecoveryCodes([])}
                  />
                </View>
              ) : profile?.mfaEnabled ? (
                <>
                  <Text style={[styles.mutedBox, { color: colors.notification, backgroundColor: colors.surfaceSoft }]}>
                    MFA is active. Your authenticator app or a recovery code is required at sign-in.
                  </Text>
                  <Text style={[styles.fieldLabel, { color: colors.text }]}>Authentication or recovery code</Text>
                  <TextInput
                    value={mfaCode}
                    onChangeText={(value) => {
                      setMfaError("");
                      setMfaCode(value);
                    }}
                    placeholder="123456 or ABCDE-FGHIJ"
                    placeholderTextColor={colors.notification}
                    autoCapitalize="none"
                    autoCorrect={false}
                    style={inputStyle}
                  />
                  <Text style={[styles.fieldLabel, { color: colors.text, marginTop: 12 }]}>Current password</Text>
                  <TextInput
                    value={mfaPassword}
                    onChangeText={setMfaPassword}
                    placeholder="Confirm your password"
                    placeholderTextColor={colors.notification}
                    secureTextEntry
                    style={inputStyle}
                  />
                  <AppButton
                    label="Disable MFA"
                    variant="danger"
                    icon="close-circle-outline"
                    size="md"
                    style={styles.sectionButton}
                    loading={isMfaBusy}
                    disabled={isMfaBusy || !mfaCode}
                    onPress={handleDisableMfa}
                  />
                </>
              ) : mfaSetup ? (
                <>
                  <View style={[styles.recoveryBox, { borderColor: colors.border }]}>
                    <Text style={[styles.toggleTitle, { color: colors.text }]}>
                      Scan this QR code with your authenticator app
                    </Text>
                    <QrCode value={mfaSetup.otpAuthUrl} size={190} />
                    <AppButton
                      label="Open in authenticator app"
                      variant="ghost"
                      icon="open-outline"
                      size="sm"
                      onPress={() => {
                        Linking.openURL(mfaSetup.otpAuthUrl).catch(() => {
                          Alert.alert(
                            "No authenticator found",
                            "Install a TOTP app such as Google Authenticator, then scan the QR code or enter the setup key manually.",
                          );
                        });
                      }}
                    />
                    <Text style={[styles.toggleSubtitle, { color: colors.notification }]}>
                      On this device? Tap the button above — or enter the setup key manually:
                    </Text>
                    <Text
                      selectable
                      style={[styles.secretCode, { color: colors.text, backgroundColor: colors.surfaceSoft }]}
                    >
                      {mfaSetup.secret}
                    </Text>
                    <Text style={[styles.toggleSubtitle, { color: colors.notification }]}>
                      Works with Google Authenticator, 1Password, Authy and other TOTP apps.
                    </Text>
                  </View>
                  <Text style={[styles.fieldLabel, { color: colors.text, marginTop: 12 }]}>
                    6-digit authentication code
                  </Text>
                  <TextInput
                    value={mfaCode}
                    onChangeText={(value) => {
                      setMfaError("");
                      setMfaCode(value.replace(/[^0-9]/g, ""));
                    }}
                    placeholder="123456"
                    placeholderTextColor={colors.notification}
                    keyboardType="number-pad"
                    maxLength={6}
                    style={inputStyle}
                  />
                  <AppButton
                    label="Verify & enable MFA"
                    icon="checkmark-circle-outline"
                    size="md"
                    style={styles.sectionButton}
                    loading={isMfaBusy}
                    disabled={isMfaBusy || mfaCode.length !== 6}
                    onPress={handleEnableMfa}
                  />
                </>
              ) : (
                <>
                  <Text style={[styles.mutedBox, { color: colors.notification, backgroundColor: colors.surfaceSoft }]}>
                    MFA is not enabled. Use any TOTP-compatible app such as Google Authenticator, 1Password or
                    Authy.
                  </Text>
                  <Text style={[styles.fieldLabel, { color: colors.text }]}>Current password</Text>
                  <TextInput
                    value={mfaPassword}
                    onChangeText={(value) => {
                      setMfaError("");
                      setMfaPassword(value);
                    }}
                    placeholder="Confirm your password"
                    placeholderTextColor={colors.notification}
                    secureTextEntry
                    style={inputStyle}
                  />
                  <AppButton
                    label="Set up authenticator"
                    icon="qr-code-outline"
                    size="md"
                    style={styles.sectionButton}
                    loading={isMfaBusy}
                    disabled={isMfaBusy || !mfaPassword}
                    onPress={handleStartMfaSetup}
                  />
                </>
              )}
              {mfaError ? <Text style={[styles.errorText, { color: "#ef4444" }]}>{mfaError}</Text> : null}
            </CardSurface>
          </>
        ) : activeTab === "security" ? (
          <>
            <CardSurface style={styles.sectionCard}>
              <View style={styles.sectionIntro}>
                <View style={[styles.sectionIcon, { backgroundColor: accentSoft(isDark) }]}>
                  <Ionicons name="shield-checkmark-outline" size={18} color={accentSoftText(isDark)} />
                </View>
                <View style={styles.sectionIntroText}>
                  <Text style={[styles.sectionTitle, { color: colors.text }]}>Password & Security</Text>
                  <Text style={[styles.sectionSubtitle, { color: colors.notification }]}>
                    A password change signs out every active session.
                  </Text>
                </View>
              </View>

              {isGoogle ? (
                <Text style={[styles.mutedBox, { color: colors.notification, backgroundColor: colors.surfaceSoft }]}>
                  Your password is managed by Google. Open your Google Account settings to update it — your MJD
                  profile stays connected automatically.
                </Text>
              ) : (
                <>
                  <Text style={[styles.fieldLabel, { color: colors.text }]}>Current password</Text>
                  <TextInput
                    value={currentPassword}
                    onChangeText={(value) => {
                      setPasswordError("");
                      setCurrentPassword(value);
                    }}
                    placeholder="Enter your current password"
                    placeholderTextColor={colors.notification}
                    secureTextEntry
                    autoComplete="current-password"
                    style={inputStyle}
                  />
                  <Text style={[styles.fieldLabel, { color: colors.text, marginTop: 12 }]}>New password</Text>
                  <TextInput
                    value={newPassword}
                    onChangeText={(value) => {
                      setPasswordError("");
                      setNewPassword(value);
                    }}
                    placeholder="Create a strong password"
                    placeholderTextColor={colors.notification}
                    secureTextEntry
                    autoComplete="new-password"
                    style={inputStyle}
                  />
                  <View style={styles.strengthRow}>
                    {[1, 2, 3].map((step) => (
                      <View
                        key={step}
                        style={[
                          styles.strengthBar,
                          {
                            backgroundColor:
                              passwordScore >= step
                                ? passwordScore === 3
                                  ? "#16a34a"
                                  : "#84cc16"
                                : colors.surfaceSoft,
                          },
                        ]}
                      />
                    ))}
                  </View>
                  <Text style={[styles.fieldHint, { color: colors.notification }]}>
                    Password strength: <Text style={{ fontWeight: "800", color: colors.text }}>{passwordStrengthLabel}</Text>
                  </Text>
                  <Text style={[styles.fieldLabel, { color: colors.text, marginTop: 12 }]}>Confirm new password</Text>
                  <TextInput
                    value={confirmPassword}
                    onChangeText={(value) => {
                      setPasswordError("");
                      setConfirmPassword(value);
                    }}
                    placeholder="Repeat your new password"
                    placeholderTextColor={colors.notification}
                    secureTextEntry
                    autoComplete="new-password"
                    style={inputStyle}
                  />
                  {passwordError ? (
                    <Text style={[styles.errorText, { color: "#ef4444" }]}>{passwordError}</Text>
                  ) : null}
                  <AppButton
                    label="Change password & sign out"
                    icon="key-outline"
                    size="md"
                    style={styles.sectionButton}
                    loading={isChangingPassword}
                    disabled={isChangingPassword}
                    onPress={handleChangePassword}
                  />
                </>
              )}
            </CardSurface>

            <CardSurface style={styles.sectionCard}>
              <View style={styles.sectionIntro}>
                <View style={[styles.sectionIcon, { backgroundColor: accentSoft(isDark) }]}>
                  <Ionicons name="checkmark-done-outline" size={18} color={accentSoftText(isDark)} />
                </View>
                <View style={styles.sectionIntroText}>
                  <Text style={[styles.sectionTitle, { color: colors.text }]}>Security Checklist</Text>
                </View>
              </View>
              {[
                { title: "Unique password", body: "Do not reuse a password from another account." },
                { title: "Sessions reset", body: "A password change signs out every active session." },
                { title: "Private credentials", body: "MJD Football Scout never asks for your password by email." },
              ].map((point) => (
                <View
                  key={point.title}
                  style={[styles.checkRow, { borderColor: colors.border, backgroundColor: colors.background }]}
                >
                  <Ionicons name="checkmark-circle" size={17} color={isDark ? "#34d399" : "#047857"} />
                  <View style={styles.factText}>
                    <Text style={[styles.toggleTitle, { color: colors.text }]}>{point.title}</Text>
                    <Text style={[styles.toggleSubtitle, { color: colors.notification }]}>{point.body}</Text>
                  </View>
                </View>
              ))}
            </CardSurface>
          </>
        ) : (
          <>
            <CardSurface style={styles.sectionCard}>
              <View style={styles.sectionIntro}>
                <View style={[styles.sectionIcon, styles.dangerIcon]}>
                  <Ionicons name="trash-outline" size={18} color="#dc2626" />
                </View>
                <View style={styles.sectionIntroText}>
                  <Text style={[styles.sectionTitle, { color: colors.text }]}>Deactivate Account</Text>
                  <Text style={[styles.sectionSubtitle, { color: colors.notification }]}>
                    Disable access without deleting your database record.
                  </Text>
                </View>
              </View>

              {!isGoogle ? (
                <>
                  <Text style={[styles.fieldLabel, { color: colors.text }]}>Current password</Text>
                  <TextInput
                    value={deactivationPassword}
                    onChangeText={(value) => {
                      setDeactivationError("");
                      setDeactivationPassword(value);
                    }}
                    placeholder="Confirm with your password"
                    placeholderTextColor={colors.notification}
                    secureTextEntry
                    style={inputStyle}
                  />
                </>
              ) : null}
              <Text style={[styles.fieldLabel, { color: colors.text, marginTop: isGoogle ? 0 : 12 }]}>
                Reason (optional)
              </Text>
              <TextInput
                value={deactivationReason}
                onChangeText={setDeactivationReason}
                placeholder="Tell us why you are leaving"
                placeholderTextColor={colors.notification}
                maxLength={300}
                multiline
                numberOfLines={3}
                style={[...inputStyle, styles.textArea]}
              />
              {deactivationError ? (
                <Text style={[styles.errorText, { color: "#ef4444" }]}>{deactivationError}</Text>
              ) : null}
              <AppButton
                label="Deactivate my account"
                variant="danger"
                icon="trash-outline"
                size="md"
                style={styles.sectionButton}
                loading={isDeactivating}
                disabled={isDeactivating}
                onPress={handleDeactivate}
              />
            </CardSurface>

            <CardSurface style={styles.sectionCard}>
              <View style={styles.sectionIntro}>
                <View style={[styles.sectionIcon, styles.dangerIcon]}>
                  <Ionicons name="alert-circle-outline" size={18} color="#dc2626" />
                </View>
                <View style={styles.sectionIntroText}>
                  <Text style={[styles.sectionTitle, { color: colors.text }]}>What happens next?</Text>
                </View>
              </View>
              {[
                "You are signed out immediately.",
                "Future sign-in attempts are blocked.",
                "Your account remains marked as deactivated in the database.",
              ].map((line) => (
                <View key={line} style={styles.dangerLine}>
                  <Ionicons name="information-circle-outline" size={15} color={colors.notification} />
                  <Text style={[styles.toggleSubtitle, styles.dangerLineText, { color: colors.notification }]}>
                    {line}
                  </Text>
                </View>
              ))}
            </CardSurface>
          </>
        )}
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
    flexGrow: 1,
    paddingBottom: 24,
    gap: 12,
  },
  heroShell: {
    overflow: "hidden",
  },
  hero: {
    padding: 20,
  },
  heroTopRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },
  heroAvatarWrap: {
    width: 66,
    height: 66,
    borderRadius: 20,
    backgroundColor: "rgba(215,255,69,0.16)",
    borderWidth: 1,
    borderColor: "rgba(215,255,69,0.30)",
    alignItems: "center",
    justifyContent: "center",
  },
  heroAvatarText: {
    fontSize: 28,
    fontWeight: "900",
    color: "#ecfccb",
  },
  heroActiveDot: {
    position: "absolute",
    right: -3,
    bottom: -3,
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 3,
    borderColor: "#064e3b",
    backgroundColor: BRAND.lime,
  },
  heroIdentity: {
    flex: 1,
    minWidth: 0,
  },
  heroEyebrow: {
    fontSize: 9,
    fontWeight: "900",
    letterSpacing: 1.2,
    color: "rgba(215,255,69,0.85)",
  },
  heroName: {
    marginTop: 4,
    fontSize: 23,
    fontWeight: "900",
    letterSpacing: -0.5,
    color: "#ffffff",
  },
  heroEmail: {
    marginTop: 3,
    fontSize: 13,
    color: "rgba(255,255,255,0.72)",
  },
  heroBadges: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 7,
    marginTop: 15,
  },
  heroBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.16)",
    backgroundColor: "rgba(255,255,255,0.10)",
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  heroBadgeText: {
    fontSize: 11,
    fontWeight: "800",
    color: "rgba(255,255,255,0.85)",
  },
  heroBadgeCapitalize: {
    textTransform: "capitalize",
  },
  segmentBar: {
    flexDirection: "row",
    borderWidth: 1,
    borderRadius: radius.md,
    padding: 4,
    gap: 4,
  },
  segment: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    borderRadius: radius.sm,
    paddingVertical: 9,
  },
  segmentText: {
    fontSize: 12.5,
    fontWeight: "800",
  },
  centerBox: {
    paddingVertical: 40,
    alignItems: "center",
  },
  sectionCard: {
    gap: 10,
  },
  sectionIntro: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 11,
    marginBottom: 2,
  },
  sectionIcon: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  dangerIcon: {
    backgroundColor: "rgba(220,38,38,0.10)",
  },
  sectionIntroText: {
    flex: 1,
    minWidth: 0,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: "900",
    letterSpacing: -0.3,
  },
  sectionSubtitle: {
    marginTop: 2,
    fontSize: 12.5,
    lineHeight: 17,
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: "800",
    marginBottom: 6,
  },
  fieldHint: {
    marginTop: 6,
    fontSize: 12,
    lineHeight: 16,
  },
  input: {
    minHeight: 48,
    borderWidth: 1,
    borderRadius: radius.md,
    paddingHorizontal: 13,
    paddingVertical: 11,
    fontSize: 14,
  },
  inputDisabled: {
    opacity: 0.85,
  },
  textArea: {
    minHeight: 84,
    textAlignVertical: "top",
  },
  buttonRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
    marginTop: 14,
  },
  buttonGrow: {
    flexGrow: 1,
  },
  sectionButton: {
    marginTop: 14,
  },
  factList: {
    gap: 8,
  },
  factRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    borderWidth: 1,
    borderRadius: radius.md,
    paddingHorizontal: 11,
    paddingVertical: 10,
  },
  factIcon: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  factText: {
    flex: 1,
    minWidth: 0,
  },
  factLabel: {
    fontSize: 10,
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: 0.6,
  },
  factValue: {
    marginTop: 2,
    fontSize: 14,
    fontWeight: "800",
    textTransform: "capitalize",
  },
  toggleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderWidth: 1,
    borderRadius: radius.md,
    paddingHorizontal: 12,
    paddingVertical: 11,
  },
  toggleText: {
    flex: 1,
    minWidth: 0,
  },
  toggleTitle: {
    fontSize: 14,
    fontWeight: "800",
  },
  toggleSubtitle: {
    marginTop: 2,
    fontSize: 12,
    lineHeight: 16,
  },
  mutedBox: {
    borderRadius: radius.md,
    paddingHorizontal: 12,
    paddingVertical: 11,
    fontSize: 12.5,
    lineHeight: 18,
  },
  recoveryBox: {
    borderWidth: 1.5,
    borderRadius: radius.md,
    padding: 12,
    gap: 8,
  },
  recoveryGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
  },
  recoveryCode: {
    borderRadius: radius.sm,
    paddingHorizontal: 10,
    paddingVertical: 6,
    fontSize: 13,
    fontWeight: "800",
    fontVariant: ["tabular-nums"],
  },
  secretCode: {
    borderRadius: radius.sm,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    fontWeight: "800",
    letterSpacing: 1,
  },
  strengthRow: {
    flexDirection: "row",
    gap: 6,
    marginTop: 10,
  },
  strengthBar: {
    flex: 1,
    height: 6,
    borderRadius: radius.pill,
  },
  checkRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    borderWidth: 1,
    borderRadius: radius.md,
    paddingHorizontal: 12,
    paddingVertical: 11,
  },
  dangerLine: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
  },
  dangerLineText: {
    flex: 1,
  },
  errorText: {
    marginTop: 8,
    fontSize: 12.5,
    fontWeight: "700",
    lineHeight: 17,
  },
});
