import React from "react";
import { Link, router, useLocalSearchParams } from "expo-router";
import { ActivityIndicator, Alert, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import Colors from "@/src/constants/Colors";
import { AppContext } from "@/src/context/AppContext";
import { useAuth } from "@/src/context/AuthContext";
import {
  getGoogleLoginConfigurationError,
  isGoogleLoginConfigured,
  requestGoogleIdToken,
} from "@/src/utils/googleAuth";
import AppBackground from "@/src/components/ui/AppBackground";

function resolveCallbackUrl(rawValue: unknown) {
  const value = Array.isArray(rawValue) ? rawValue[0] : rawValue;
  if (typeof value === "string" && value.trim().startsWith("/")) {
    return value.trim();
  }
  return "/";
}

export default function SignupScreen() {
  const { isDark } = React.useContext(AppContext);
  const { isAuthLoading, isAuthReady, isAuthenticated, register, loginWithGoogleIdToken } = useAuth();
  const { callbackUrl } = useLocalSearchParams<{ callbackUrl?: string | string[] }>();

  const [name, setName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");

  const colorKey = isDark ? "dark" : "light";
  const callback = React.useMemo(() => resolveCallbackUrl(callbackUrl), [callbackUrl]);

  React.useEffect(() => {
    if (isAuthenticated) {
      router.replace(callback as never);
    }
  }, [isAuthenticated, callback]);

  const handleSignup = async () => {
    if (!name.trim() || !email.trim() || !password.trim()) {
      Alert.alert("Validation", "Name, email and password are required.");
      return;
    }

    try {
      await register({
        name: name.trim(),
        email: email.trim(),
        password: password.trim(),
      });
      router.replace(callback as never);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Signup failed";
      Alert.alert("Error", message);
    }
  };

  const handleGoogleSignup = async () => {
    if (!isGoogleLoginConfigured()) {
      const configMessage =
        getGoogleLoginConfigurationError() ||
        "Set EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID / EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID in mobile-app/.env and restart Expo.";
      Alert.alert(
        "Google login not configured",
        configMessage,
      );
      return;
    }

    try {
      const idToken = await requestGoogleIdToken();
      await loginWithGoogleIdToken(idToken);
      router.replace(callback as never);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Google signup failed";
      Alert.alert("Error", message);
    }
  };

  if (!isAuthReady) {
    return (
      <SafeAreaView style={[styles.center, { backgroundColor: Colors[colorKey].background }]}>
        <AppBackground />
        <ActivityIndicator animating size="large" color="#008fb3" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView edges={["top", "left", "right", "bottom"]} style={[styles.container, { backgroundColor: Colors[colorKey].background }]}>
      <AppBackground />
      <View
        style={[
          styles.card,
          {
            backgroundColor: Colors[colorKey].card,
            borderColor: Colors[colorKey].border,
            shadowColor: isDark ? "#000" : "#0f172a",
          },
        ]}
      >
        <View style={styles.titleRow}>
          <Ionicons name="person-add-outline" size={22} color={Colors[colorKey].tint} />
          <Text style={[styles.title, { color: Colors[colorKey].text }]}>Sign up</Text>
        </View>
        <Text style={[styles.subtitle, { color: Colors[colorKey].notification }]}>
          Create your account for personalized watchlists and comparisons.
        </Text>

        <TextInput
          value={name}
          onChangeText={setName}
          placeholder="Name"
          autoCapitalize="words"
          placeholderTextColor={Colors[colorKey].notification}
          style={[styles.input, { color: Colors[colorKey].text, borderColor: Colors[colorKey].border }]}
        />

        <TextInput
          value={email}
          onChangeText={setEmail}
          placeholder="Email"
          autoCapitalize="none"
          keyboardType="email-address"
          placeholderTextColor={Colors[colorKey].notification}
          style={[styles.input, { color: Colors[colorKey].text, borderColor: Colors[colorKey].border }]}
        />

        <TextInput
          value={password}
          onChangeText={setPassword}
          placeholder="Password"
          autoCapitalize="none"
          secureTextEntry
          placeholderTextColor={Colors[colorKey].notification}
          style={[styles.input, { color: Colors[colorKey].text, borderColor: Colors[colorKey].border }]}
        />

        <Pressable
          disabled={isAuthLoading}
          onPress={handleSignup}
          style={[styles.primaryButton, { backgroundColor: Colors[colorKey].tint }, isAuthLoading && styles.disabled]}
        >
          <Text style={styles.primaryButtonText}>{isAuthLoading ? "Please wait..." : "Create account"}</Text>
        </Pressable>

        <Pressable
          disabled={isAuthLoading}
          onPress={handleGoogleSignup}
          style={[
            styles.secondaryButton,
            {
              borderColor: Colors[colorKey].border,
              backgroundColor: Colors[colorKey].background,
            },
            isAuthLoading && styles.disabled,
          ]}
        >
          <Text style={[styles.secondaryButtonText, { color: Colors[colorKey].text }]}>Continue with Google</Text>
        </Pressable>

        <Text style={[styles.footerText, { color: Colors[colorKey].notification }]}>
          Already have an account?{" "}
          <Link href={{ pathname: "/login", params: { callbackUrl: callback } }} style={styles.footerLink}>
            Login
          </Link>
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  card: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 18,
    gap: 12,
    shadowOpacity: 0.08,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 5 },
    elevation: 2,
  },
  title: {
    fontSize: 24,
    fontWeight: "800",
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  subtitle: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
  },
  primaryButton: {
    borderRadius: 10,
    paddingVertical: 11,
    alignItems: "center",
  },
  primaryButtonText: {
    color: "#fff",
    fontWeight: "700",
  },
  secondaryButton: {
    borderWidth: 1,
    borderRadius: 10,
    paddingVertical: 11,
    alignItems: "center",
  },
  secondaryButtonText: {
    fontWeight: "700",
  },
  disabled: {
    opacity: 0.7,
  },
  footerText: {
    marginTop: 4,
    textAlign: "center",
    fontSize: 14,
  },
  footerLink: {
    color: "#0ea5a5",
    fontWeight: "700",
  },
});
