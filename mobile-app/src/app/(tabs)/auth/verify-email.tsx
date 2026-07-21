import React from "react";
import { Link, router, useLocalSearchParams } from "expo-router";
import { ActivityIndicator, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Colors from "@/src/constants/Colors";
import { AppContext } from "@/src/context/AppContext";
import { resendVerificationEmail, verifyEmail } from "@/src/apiServices";
import AuthScreenCard from "@/src/components/auth/AuthScreenCard";

function resolveParam(rawValue: unknown) {
  const value = Array.isArray(rawValue) ? rawValue[0] : rawValue;
  return typeof value === "string" ? value.trim() : "";
}

type Status = "idle" | "verifying" | "success" | "error";

export default function VerifyEmailScreen() {
  const { isDark } = React.useContext(AppContext);
  const colors = Colors[isDark ? "dark" : "light"];
  const params = useLocalSearchParams<{ token?: string | string[]; email?: string | string[] }>();
  const initialToken = resolveParam(params.token);
  const [status, setStatus] = React.useState<Status>(initialToken ? "verifying" : "idle");
  const [message, setMessage] = React.useState("");
  const [email, setEmail] = React.useState(() => resolveParam(params.email));
  const [resending, setResending] = React.useState(false);
  const [resent, setResent] = React.useState(false);
  const inputColors = { color: colors.text, borderColor: colors.border, backgroundColor: isDark ? "rgba(255,255,255,0.04)" : "rgba(255,255,255,0.58)" };

  React.useEffect(() => {
    if (!initialToken) return;
    let active = true;
    (async () => {
      try {
        const response = await verifyEmail(initialToken);
        if (!active) return;
        setStatus("success");
        setMessage(response.message || "Your email address has been verified.");
      } catch (error) {
        if (!active) return;
        setStatus("error");
        setMessage(error instanceof Error ? error.message : "This verification link is invalid or has expired.");
      }
    })();
    return () => { active = false; };
  }, [initialToken]);

  const handleResend = async () => {
    if (!email.trim()) {
      setMessage("Enter your email address to receive a new verification link.");
      return;
    }
    try {
      setResending(true);
      setMessage("");
      await resendVerificationEmail(email.trim());
      setResent(true);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "We could not send the verification email. Please try again.");
    } finally {
      setResending(false);
    }
  };

  if (status === "verifying") {
    return (
      <AuthScreenCard
        icon="mail-unread-outline"
        eyebrow="Email verification"
        title="Verifying your email"
        subtitle="Hang tight while we confirm your verification link."
        footer={<Text style={[styles.footerText, { color: colors.notification }]}>This only takes a moment.</Text>}
      >
        <View style={styles.centerBlock}>
          <ActivityIndicator size="large" color={colors.tint} />
        </View>
      </AuthScreenCard>
    );
  }

  if (status === "success") {
    return (
      <AuthScreenCard
        icon="checkmark-circle-outline"
        eyebrow="Email verified"
        title="You're verified"
        subtitle={message}
        footer={
          <Text style={[styles.footerText, { color: colors.notification }]}>
            Ready to scout?{" "}
            <Link href="/login" style={styles.footerLink}>
              Sign in
            </Link>
          </Text>
        }
      >
        <Pressable
          onPress={() => router.replace("/login")}
          style={({ pressed }) => [styles.primaryButton, { backgroundColor: colors.accent, opacity: pressed ? 0.72 : 1 }]}
        >
          <Ionicons name="log-in-outline" size={18} color={colors.accentText} />
          <Text style={[styles.primaryButtonText, { color: colors.accentText }]}>Continue to sign in</Text>
        </Pressable>
      </AuthScreenCard>
    );
  }

  // idle (no token) or error → offer resend
  return (
    <AuthScreenCard
      icon={status === "error" ? "alert-circle-outline" : "mail-open-outline"}
      eyebrow="Email verification"
      title={status === "error" ? "Link expired" : "Verify your email"}
      subtitle={
        status === "error"
          ? "This verification link is no longer valid. Request a fresh one below and we'll email it right over."
          : "Enter your email address and we'll send you a new verification link."
      }
      footer={
        <Text style={[styles.footerText, { color: colors.notification }]}>
          Back to{" "}
          <Link href="/login" style={styles.footerLink}>
            Sign in
          </Link>
        </Text>
      }
    >
      {resent ? (
        <View style={[styles.noticeCard, { borderColor: colors.border, backgroundColor: isDark ? "rgba(215,255,69,0.06)" : "rgba(215,255,69,0.16)" }]}>
          <Ionicons name="checkmark-circle-outline" size={19} color={colors.tint} />
          <Text style={[styles.noticeText, { color: colors.text }]}>
            A fresh verification link is on its way to {email.trim()}. Check your inbox and spam folder.
          </Text>
        </View>
      ) : (
        <>
          <View style={styles.field}>
            <Text style={[styles.label, { color: colors.text }]}>Email</Text>
            <TextInput
              accessibilityLabel="Email address"
              value={email}
              onChangeText={(value) => { setEmail(value); setMessage(""); }}
              placeholder="name@club.com"
              autoCapitalize="none"
              autoComplete="email"
              textContentType="emailAddress"
              keyboardType="email-address"
              onSubmitEditing={handleResend}
              returnKeyType="send"
              placeholderTextColor={colors.notification}
              style={[styles.input, inputColors]}
            />
          </View>
          {message ? (
            <View accessibilityLiveRegion="polite" style={styles.errorRow}>
              <Ionicons name="alert-circle-outline" size={17} color="#ef4444" />
              <Text style={styles.errorText}>{message}</Text>
            </View>
          ) : null}
          <Pressable
            disabled={resending}
            onPress={handleResend}
            style={({ pressed }) => [styles.primaryButton, { backgroundColor: colors.accent, opacity: pressed || resending ? 0.72 : 1 }]}
          >
            {resending ? <ActivityIndicator size="small" color={colors.accentText} /> : <Ionicons name="paper-plane-outline" size={18} color={colors.accentText} />}
            <Text style={[styles.primaryButtonText, { color: colors.accentText }]}>{resending ? "Sending…" : "Resend verification email"}</Text>
          </Pressable>
        </>
      )}
    </AuthScreenCard>
  );
}

const styles = StyleSheet.create({
  field: { gap: 7 },
  label: { fontSize: 13, fontWeight: "800" },
  input: { minHeight: 50, borderWidth: 1, borderRadius: 15, paddingHorizontal: 14, fontSize: 15 },
  centerBlock: { alignItems: "center", justifyContent: "center", paddingVertical: 12 },
  errorRow: { flexDirection: "row", alignItems: "flex-start", gap: 7 },
  errorText: { flex: 1, color: "#ef4444", fontSize: 12, lineHeight: 17, fontWeight: "600" },
  primaryButton: { minHeight: 50, borderRadius: 16, alignItems: "center", justifyContent: "center", flexDirection: "row", gap: 8 },
  primaryButtonText: { fontWeight: "900", fontSize: 14 },
  noticeCard: { flexDirection: "row", gap: 10, alignItems: "flex-start", borderWidth: 1, borderRadius: 16, padding: 14 },
  noticeText: { flex: 1, fontSize: 13, lineHeight: 19 },
  footerText: { textAlign: "center", fontSize: 14 },
  footerLink: { color: "#76a800", fontWeight: "900" },
});
