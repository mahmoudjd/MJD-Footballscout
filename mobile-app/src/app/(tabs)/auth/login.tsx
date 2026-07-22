import React from "react";
import { Link, router, useLocalSearchParams } from "expo-router";
import { ActivityIndicator, Alert, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Colors from "@/src/constants/Colors";
import { AppContext } from "@/src/context/AppContext";
import { useAuth } from "@/src/context/AuthContext";
import { getGoogleLoginConfigurationError, isGoogleLoginConfigured, requestGoogleIdToken } from "@/src/utils/googleAuth";
import { ApiError } from "@/src/apiServices";
import AuthScreenCard from "@/src/components/auth/AuthScreenCard";

function resolveCallbackUrl(rawValue: unknown) {
  const value = Array.isArray(rawValue) ? rawValue[0] : rawValue;
  return typeof value === "string" && value.trim().startsWith("/") ? value.trim() : "/";
}

export default function LoginScreen() {
  const { isDark } = React.useContext(AppContext);
  const { isAuthLoading, isAuthReady, isAuthenticated, login, loginWithGoogleIdToken } = useAuth();
  const { callbackUrl } = useLocalSearchParams<{ callbackUrl?: string | string[] }>();
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [showPassword, setShowPassword] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState("");
  const colors = Colors[isDark ? "dark" : "light"];
  const callback = React.useMemo(() => resolveCallbackUrl(callbackUrl), [callbackUrl]);

  React.useEffect(() => {
    if (isAuthenticated) router.replace(callback as never);
  }, [isAuthenticated, callback]);

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      setErrorMessage("Enter your email address and password.");
      return;
    }
    try {
      setErrorMessage("");
      await login({ email: email.trim(), password: password.trim() });
      router.replace(callback as never);
    } catch (error) {
      if (error instanceof ApiError && (error.details as { code?: string })?.code === "EMAIL_NOT_VERIFIED") {
        router.replace({ pathname: "/verify-email", params: { email: email.trim() } } as never);
        return;
      }
      setErrorMessage(error instanceof Error ? error.message : "Sign-in failed. Please try again.");
    }
  };

  const handleGoogleLogin = async () => {
    if (!isGoogleLoginConfigured()) {
      Alert.alert("Google login not configured", getGoogleLoginConfigurationError() || "Add the Google client IDs to mobile-app/.env and restart Expo.");
      return;
    }
    try {
      setErrorMessage("");
      const idToken = await requestGoogleIdToken();
      await loginWithGoogleIdToken(idToken);
      router.replace(callback as never);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Google sign-in failed. Please try again.");
    }
  };

  if (!isAuthReady) {
    return <View style={[styles.center, { backgroundColor: colors.background }]}><ActivityIndicator size="large" color={colors.tint} /></View>;
  }

  return (
    <AuthScreenCard
      icon="log-in-outline"
      eyebrow="Scout workspace"
      title="Welcome back"
      subtitle="Sign in to access profiles, comparisons, watchlists & recruitment tools."
      footer={<Text style={[styles.footerText, { color: colors.notification }]}>No account?{" "}<Link href={{ pathname: "/signup", params: { callbackUrl: callback } }} style={styles.footerLink}>Create one</Link></Text>}
    >
      <View style={styles.field}>
        <Text style={[styles.label, { color: colors.text }]}>Email</Text>
        <TextInput accessibilityLabel="Email address" value={email} onChangeText={(value) => { setEmail(value); setErrorMessage(""); }} placeholder="name@club.com" autoCapitalize="none" autoComplete="email" textContentType="emailAddress" keyboardType="email-address" placeholderTextColor={colors.notification} style={[styles.input, { color: colors.text, borderColor: colors.border, backgroundColor: isDark ? "rgba(255,255,255,0.04)" : "rgba(255,255,255,0.58)" }]} />
      </View>
      <View style={styles.field}>
        <Text style={[styles.label, { color: colors.text }]}>Password</Text>
        <View style={[styles.passwordWrap, { borderColor: colors.border, backgroundColor: isDark ? "rgba(255,255,255,0.04)" : "rgba(255,255,255,0.58)" }]}>
          <TextInput accessibilityLabel="Password" value={password} onChangeText={(value) => { setPassword(value); setErrorMessage(""); }} placeholder="Enter your password" autoCapitalize="none" autoComplete="current-password" textContentType="password" secureTextEntry={!showPassword} placeholderTextColor={colors.notification} style={[styles.passwordInput, { color: colors.text }]} />
          <Pressable accessibilityRole="button" accessibilityLabel={showPassword ? "Hide password" : "Show password"} hitSlop={8} onPress={() => setShowPassword((current) => !current)}><Ionicons name={showPassword ? "eye-off-outline" : "eye-outline"} size={20} color={colors.notification} /></Pressable>
        </View>
        <Link href="/forgot-password" style={[styles.forgotLink, { color: colors.tint }]}>Forgot password?</Link>
      </View>
      {errorMessage ? <View accessibilityLiveRegion="polite" style={styles.errorRow}><Ionicons name="alert-circle-outline" size={17} color="#ef4444" /><Text style={styles.errorText}>{errorMessage}</Text></View> : null}
      <Pressable disabled={isAuthLoading} onPress={handleLogin} style={({ pressed }) => [styles.primaryButton, { backgroundColor: colors.accent, opacity: pressed || isAuthLoading ? 0.72 : 1 }]}>
        {isAuthLoading ? <ActivityIndicator size="small" color={colors.accentText} /> : <Ionicons name="arrow-forward" size={18} color={colors.accentText} />}
        <Text style={[styles.primaryButtonText, { color: colors.accentText }]}>{isAuthLoading ? "Signing in…" : "Sign in"}</Text>
      </Pressable>
      <View style={styles.dividerRow}><View style={[styles.divider, { backgroundColor: colors.border }]} /><Text style={[styles.dividerText, { color: colors.notification }]}>OR</Text><View style={[styles.divider, { backgroundColor: colors.border }]} /></View>
      <Pressable disabled={isAuthLoading} onPress={handleGoogleLogin} style={({ pressed }) => [styles.secondaryButton, { borderColor: colors.border, opacity: pressed || isAuthLoading ? 0.66 : 1 }]}><Ionicons name="logo-google" size={18} color={colors.text} /><Text style={[styles.secondaryButtonText, { color: colors.text }]}>Continue with Google</Text></Pressable>
    </AuthScreenCard>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  field: { gap: 7 }, label: { fontSize: 13, fontWeight: "800" }, forgotLink: { alignSelf: "flex-end", fontSize: 12.5, fontWeight: "800", marginTop: 2 },
  input: { minHeight: 50, borderWidth: 1, borderRadius: 15, paddingHorizontal: 14, fontSize: 15 },
  passwordWrap: { minHeight: 50, borderWidth: 1, borderRadius: 15, paddingHorizontal: 14, flexDirection: "row", alignItems: "center", gap: 10 },
  passwordInput: { flex: 1, minWidth: 0, fontSize: 15, paddingVertical: 12 },
  errorRow: { flexDirection: "row", alignItems: "flex-start", gap: 7 }, errorText: { flex: 1, color: "#ef4444", fontSize: 12, lineHeight: 17, fontWeight: "600" },
  primaryButton: { minHeight: 50, borderRadius: 16, alignItems: "center", justifyContent: "center", flexDirection: "row", gap: 8 }, primaryButtonText: { fontWeight: "900", fontSize: 14 },
  secondaryButton: { minHeight: 50, borderWidth: 1, borderRadius: 16, alignItems: "center", justifyContent: "center", flexDirection: "row", gap: 9 }, secondaryButtonText: { fontWeight: "800", fontSize: 14 },
  dividerRow: { flexDirection: "row", alignItems: "center", gap: 10 }, divider: { flex: 1, height: StyleSheet.hairlineWidth }, dividerText: { fontSize: 9, fontWeight: "900", letterSpacing: 1 },
  footerText: { textAlign: "center", fontSize: 14 }, footerLink: { color: "#76a800", fontWeight: "900" },
});
