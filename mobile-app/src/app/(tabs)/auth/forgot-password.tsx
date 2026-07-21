import React from "react";
import { Link, router } from "expo-router";
import { ActivityIndicator, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Colors from "@/src/constants/Colors";
import { AppContext } from "@/src/context/AppContext";
import { requestPasswordReset } from "@/src/apiServices";
import AuthScreenCard from "@/src/components/auth/AuthScreenCard";

export default function ForgotPasswordScreen() {
  const { isDark } = React.useContext(AppContext);
  const colors = Colors[isDark ? "dark" : "light"];
  const [email, setEmail] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState("");
  const [sent, setSent] = React.useState(false);

  const handleSubmit = async () => {
    if (!email.trim()) {
      setErrorMessage("Enter the email address linked to your account.");
      return;
    }
    try {
      setErrorMessage("");
      setLoading(true);
      await requestPasswordReset(email.trim());
      setSent(true);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "We could not send the reset link. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <AuthScreenCard
        icon="mail-outline"
        eyebrow="Check your inbox"
        title="Reset link sent"
        subtitle={`If an account exists for ${email.trim()}, a password reset link is on its way. It expires in 60 minutes.`}
        footer={
          <Text style={[styles.footerText, { color: colors.notification }]}>
            Back to{" "}
            <Link href="/login" style={styles.footerLink}>
              Sign in
            </Link>
          </Text>
        }
      >
        <View style={[styles.noticeCard, { borderColor: colors.border, backgroundColor: isDark ? "rgba(215,255,69,0.06)" : "rgba(215,255,69,0.16)" }]}>
          <Ionicons name="information-circle-outline" size={19} color={colors.tint} />
          <Text style={[styles.noticeText, { color: colors.text }]}>
            Did not get an email? Check your spam folder or try again in a few minutes.
          </Text>
        </View>
        <Pressable
          onPress={() => { setSent(false); setEmail(""); }}
          style={({ pressed }) => [styles.secondaryButton, { borderColor: colors.border, opacity: pressed ? 0.66 : 1 }]}
        >
          <Ionicons name="refresh-outline" size={18} color={colors.text} />
          <Text style={[styles.secondaryButtonText, { color: colors.text }]}>Use a different email</Text>
        </Pressable>
      </AuthScreenCard>
    );
  }

  return (
    <AuthScreenCard
      icon="key-outline"
      eyebrow="Account recovery"
      title="Forgot password?"
      subtitle="Enter your email and we'll send you a secure link to reset your password."
      footer={
        <Text style={[styles.footerText, { color: colors.notification }]}>
          Remembered it?{" "}
          <Link href="/login" style={styles.footerLink}>
            Sign in
          </Link>
        </Text>
      }
    >
      <View style={styles.field}>
        <Text style={[styles.label, { color: colors.text }]}>Email</Text>
        <TextInput
          accessibilityLabel="Email address"
          value={email}
          onChangeText={(value) => { setEmail(value); setErrorMessage(""); }}
          placeholder="name@club.com"
          autoCapitalize="none"
          autoComplete="email"
          textContentType="emailAddress"
          keyboardType="email-address"
          onSubmitEditing={handleSubmit}
          returnKeyType="send"
          placeholderTextColor={colors.notification}
          style={[styles.input, { color: colors.text, borderColor: colors.border, backgroundColor: isDark ? "rgba(255,255,255,0.04)" : "rgba(255,255,255,0.58)" }]}
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
        {loading ? <ActivityIndicator size="small" color={colors.accentText} /> : <Ionicons name="arrow-forward" size={18} color={colors.accentText} />}
        <Text style={[styles.primaryButtonText, { color: colors.accentText }]}>{loading ? "Sending link…" : "Send reset link"}</Text>
      </Pressable>
      <Pressable
        onPress={() => router.push("/reset-password")}
        style={({ pressed }) => [styles.tertiaryButton, { opacity: pressed ? 0.6 : 1 }]}
      >
        <Text style={[styles.tertiaryButtonText, { color: colors.notification }]}>Already have a reset code?</Text>
      </Pressable>
    </AuthScreenCard>
  );
}

const styles = StyleSheet.create({
  field: { gap: 7 },
  label: { fontSize: 13, fontWeight: "800" },
  input: { minHeight: 50, borderWidth: 1, borderRadius: 15, paddingHorizontal: 14, fontSize: 15 },
  errorRow: { flexDirection: "row", alignItems: "flex-start", gap: 7 },
  errorText: { flex: 1, color: "#ef4444", fontSize: 12, lineHeight: 17, fontWeight: "600" },
  primaryButton: { minHeight: 50, borderRadius: 16, alignItems: "center", justifyContent: "center", flexDirection: "row", gap: 8 },
  primaryButtonText: { fontWeight: "900", fontSize: 14 },
  secondaryButton: { minHeight: 50, borderWidth: 1, borderRadius: 16, alignItems: "center", justifyContent: "center", flexDirection: "row", gap: 9 },
  secondaryButtonText: { fontWeight: "800", fontSize: 14 },
  tertiaryButton: { alignItems: "center", paddingVertical: 6 },
  tertiaryButtonText: { fontSize: 13, fontWeight: "700", textDecorationLine: "underline" },
  noticeCard: { flexDirection: "row", gap: 10, alignItems: "flex-start", borderWidth: 1, borderRadius: 16, padding: 14 },
  noticeText: { flex: 1, fontSize: 13, lineHeight: 19 },
  footerText: { textAlign: "center", fontSize: 14 },
  footerLink: { color: "#76a800", fontWeight: "900" },
});
