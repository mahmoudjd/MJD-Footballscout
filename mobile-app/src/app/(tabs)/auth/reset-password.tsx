import React from "react";
import { Link, router, useLocalSearchParams } from "expo-router";
import { ActivityIndicator, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Colors from "@/src/constants/Colors";
import { AppContext } from "@/src/context/AppContext";
import { resetPassword } from "@/src/apiServices";
import AuthScreenCard from "@/src/components/auth/AuthScreenCard";

function resolveToken(rawValue: unknown) {
  const value = Array.isArray(rawValue) ? rawValue[0] : rawValue;
  return typeof value === "string" ? value.trim() : "";
}

export default function ResetPasswordScreen() {
  const { isDark } = React.useContext(AppContext);
  const colors = Colors[isDark ? "dark" : "light"];
  const params = useLocalSearchParams<{ token?: string | string[] }>();
  const [token, setToken] = React.useState(() => resolveToken(params.token));
  const [password, setPassword] = React.useState("");
  const [confirm, setConfirm] = React.useState("");
  const [showPassword, setShowPassword] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState("");
  const [done, setDone] = React.useState(false);

  const inputColors = { color: colors.text, borderColor: colors.border, backgroundColor: isDark ? "rgba(255,255,255,0.04)" : "rgba(255,255,255,0.58)" };

  const handleSubmit = async () => {
    if (!token.trim()) {
      setErrorMessage("Paste the reset code from your email to continue.");
      return;
    }
    if (password.length < 8) {
      setErrorMessage("Use at least 8 characters for your new password.");
      return;
    }
    if (password !== confirm) {
      setErrorMessage("Both passwords must match.");
      return;
    }
    try {
      setErrorMessage("");
      setLoading(true);
      await resetPassword({ token: token.trim(), newPassword: password });
      setDone(true);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "This reset link is invalid or has expired.");
    } finally {
      setLoading(false);
    }
  };

  if (done) {
    return (
      <AuthScreenCard
        icon="checkmark-circle-outline"
        eyebrow="All set"
        title="Password updated"
        subtitle="Your password has been changed. Sign in with your new credentials to continue."
        footer={
          <Text style={[styles.footerText, { color: colors.notification }]}>
            Need help?{" "}
            <Link href="/forgot-password" style={styles.footerLink}>
              Request a new link
            </Link>
          </Text>
        }
      >
        <Pressable
          onPress={() => router.replace("/login")}
          style={({ pressed }) => [styles.primaryButton, { backgroundColor: colors.accent, opacity: pressed ? 0.72 : 1 }]}
        >
          <Ionicons name="log-in-outline" size={18} color={colors.accentText} />
          <Text style={[styles.primaryButtonText, { color: colors.accentText }]}>Go to sign in</Text>
        </Pressable>
      </AuthScreenCard>
    );
  }

  return (
    <AuthScreenCard
      icon="lock-closed-outline"
      eyebrow="Account recovery"
      title="Set a new password"
      subtitle="Choose a strong password. Your reset code was emailed to you and expires after 60 minutes."
      footer={
        <Text style={[styles.footerText, { color: colors.notification }]}>
          Back to{" "}
          <Link href="/login" style={styles.footerLink}>
            Sign in
          </Link>
        </Text>
      }
    >
      {!resolveToken(params.token) ? (
        <View style={styles.field}>
          <Text style={[styles.label, { color: colors.text }]}>Reset code</Text>
          <TextInput
            accessibilityLabel="Reset code"
            value={token}
            onChangeText={(value) => { setToken(value); setErrorMessage(""); }}
            placeholder="Paste the code from your email"
            autoCapitalize="none"
            autoCorrect={false}
            placeholderTextColor={colors.notification}
            style={[styles.input, inputColors]}
          />
        </View>
      ) : null}
      <View style={styles.field}>
        <Text style={[styles.label, { color: colors.text }]}>New password</Text>
        <View style={[styles.passwordWrap, inputColors]}>
          <TextInput
            accessibilityLabel="New password"
            value={password}
            onChangeText={(value) => { setPassword(value); setErrorMessage(""); }}
            placeholder="At least 8 characters"
            autoCapitalize="none"
            autoComplete="new-password"
            textContentType="newPassword"
            secureTextEntry={!showPassword}
            placeholderTextColor={colors.notification}
            style={[styles.passwordInput, { color: colors.text }]}
          />
          <Pressable accessibilityRole="button" accessibilityLabel={showPassword ? "Hide password" : "Show password"} hitSlop={8} onPress={() => setShowPassword((current) => !current)}>
            <Ionicons name={showPassword ? "eye-off-outline" : "eye-outline"} size={20} color={colors.notification} />
          </Pressable>
        </View>
      </View>
      <View style={styles.field}>
        <Text style={[styles.label, { color: colors.text }]}>Confirm password</Text>
        <TextInput
          accessibilityLabel="Confirm password"
          value={confirm}
          onChangeText={(value) => { setConfirm(value); setErrorMessage(""); }}
          placeholder="Re-enter your new password"
          autoCapitalize="none"
          autoComplete="new-password"
          textContentType="newPassword"
          secureTextEntry={!showPassword}
          onSubmitEditing={handleSubmit}
          returnKeyType="done"
          placeholderTextColor={colors.notification}
          style={[styles.input, inputColors]}
        />
      </View>
      {errorMessage ? (
        <View accessibilityLiveRegion="polite" style={styles.errorRow}>
          <Ionicons name="alert-circle-outline" size={17} color="#ef4444" />
          <Text style={styles.errorText}>{errorMessage}</Text>
        </View>
      ) : null}
      <Pressable
        disabled={loading}
        onPress={handleSubmit}
        style={({ pressed }) => [styles.primaryButton, { backgroundColor: colors.accent, opacity: pressed || loading ? 0.72 : 1 }]}
      >
        {loading ? <ActivityIndicator size="small" color={colors.accentText} /> : <Ionicons name="checkmark" size={18} color={colors.accentText} />}
        <Text style={[styles.primaryButtonText, { color: colors.accentText }]}>{loading ? "Updating…" : "Update password"}</Text>
      </Pressable>
    </AuthScreenCard>
  );
}

const styles = StyleSheet.create({
  field: { gap: 7 },
  label: { fontSize: 13, fontWeight: "800" },
  input: { minHeight: 50, borderWidth: 1, borderRadius: 15, paddingHorizontal: 14, fontSize: 15 },
  passwordWrap: { minHeight: 50, borderWidth: 1, borderRadius: 15, paddingHorizontal: 14, flexDirection: "row", alignItems: "center", gap: 10 },
  passwordInput: { flex: 1, minWidth: 0, fontSize: 15, paddingVertical: 12 },
  errorRow: { flexDirection: "row", alignItems: "flex-start", gap: 7 },
  errorText: { flex: 1, color: "#ef4444", fontSize: 12, lineHeight: 17, fontWeight: "600" },
  primaryButton: { minHeight: 50, borderRadius: 16, alignItems: "center", justifyContent: "center", flexDirection: "row", gap: 8 },
  primaryButtonText: { fontWeight: "900", fontSize: 14 },
  footerText: { textAlign: "center", fontSize: 14 },
  footerLink: { color: "#76a800", fontWeight: "900" },
});
