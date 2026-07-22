import { Platform } from "react-native";
import * as SecureStore from "expo-secure-store";
import * as FileSystem from "expo-file-system/legacy";
import { AuthSession } from "@/src/data/Types";

// Native: session lives in the Keychain (iOS) / Keystore (Android) via SecureStore,
// never in plaintext. Web: localStorage (no secure store in the browser).
const STORAGE_KEY = "mjd.auth.session";
const BIOMETRIC_KEY = "mjd.auth.biometric"; // "1"/"0", stored WITHOUT auth so we can read the pref before unlocking
const KEYCHAIN_SERVICE = "mjd.football.auth";
const LEGACY_FILE_NAME = "mjd-auth-session.json"; // pre-2.0 plaintext file, migrated then deleted

const AUTH_PROMPT = "Unlock MJD FootballScout";

function isValidSession(value: unknown): value is AuthSession {
  if (!value || typeof value !== "object") return false;
  const candidate = value as Partial<AuthSession>;
  return (
    typeof candidate.id === "string" &&
    typeof candidate.name === "string" &&
    typeof candidate.email === "string" &&
    (candidate.role === "admin" || candidate.role === "user") &&
    typeof candidate.accessToken === "string" &&
    typeof candidate.refreshToken === "string" &&
    typeof candidate.expiresAt === "number"
  );
}

function legacyFileUri() {
  return FileSystem.documentDirectory ? `${FileSystem.documentDirectory}${LEGACY_FILE_NAME}` : null;
}

/** Reads (without prompting) whether biometric unlock is enabled. */
export async function isBiometricEnabled(): Promise<boolean> {
  if (Platform.OS === "web") return false;
  try {
    return (await SecureStore.getItemAsync(BIOMETRIC_KEY)) === "1";
  } catch {
    return false;
  }
}

/** True only when the device has usable biometrics (Face ID / Touch ID / fingerprint) enrolled. */
export function canUseBiometrics(): boolean {
  if (Platform.OS === "web") return false;
  try {
    return SecureStore.canUseBiometricAuthentication();
  } catch {
    return false;
  }
}

function sessionOptions(biometric: boolean): SecureStore.SecureStoreOptions {
  return {
    keychainService: KEYCHAIN_SERVICE,
    requireAuthentication: biometric,
    authenticationPrompt: AUTH_PROMPT,
  };
}

export async function saveAuthSession(session: AuthSession | null) {
  if (Platform.OS === "web") {
    if (typeof window === "undefined") return;
    if (session) window.localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
    else window.localStorage.removeItem(STORAGE_KEY);
    return;
  }

  if (!session) {
    await SecureStore.deleteItemAsync(STORAGE_KEY, { keychainService: KEYCHAIN_SERVICE }).catch(() => {});
    return;
  }
  const biometric = await isBiometricEnabled();
  await SecureStore.setItemAsync(STORAGE_KEY, JSON.stringify(session), sessionOptions(biometric));
}

export async function loadAuthSession(): Promise<AuthSession | null> {
  try {
    if (Platform.OS === "web") {
      if (typeof window === "undefined") return null;
      const raw = window.localStorage.getItem(STORAGE_KEY);
      const parsed: unknown = raw ? JSON.parse(raw) : null;
      return isValidSession(parsed) ? parsed : null;
    }

    const biometric = await isBiometricEnabled();
    // Reading a biometric-protected item triggers the OS Face ID / fingerprint prompt.
    let raw = await SecureStore.getItemAsync(STORAGE_KEY, sessionOptions(biometric));

    // One-time migration from the old plaintext file (pre-secure-store builds).
    if (!raw) {
      raw = await migrateLegacyFile();
    }

    if (!raw) return null;
    const parsed: unknown = JSON.parse(raw);
    return isValidSession(parsed) ? parsed : null;
  } catch {
    // Prompt cancelled / no biometrics / read failure → treat as signed out.
    return null;
  }
}

async function migrateLegacyFile(): Promise<string | null> {
  const uri = legacyFileUri();
  if (!uri) return null;
  try {
    const raw = await FileSystem.readAsStringAsync(uri);
    if (raw && isValidSession(JSON.parse(raw))) {
      // Migrate into SecureStore (unprotected — biometric opt-in happens later) and drop the plaintext copy.
      await SecureStore.setItemAsync(STORAGE_KEY, raw, sessionOptions(false));
      await FileSystem.deleteAsync(uri, { idempotent: true }).catch(() => {});
      return raw;
    }
  } catch {
    // no legacy file / unreadable — nothing to migrate
  }
  return null;
}

/**
 * Turn biometric unlock on/off. Re-writes the stored session so the Keychain/Keystore
 * access control matches. Enabling prompts once to confirm biometrics work.
 * Returns false if the re-write (e.g. the confirmation prompt) fails.
 */
export async function setBiometricEnabled(enabled: boolean, session: AuthSession | null): Promise<boolean> {
  if (Platform.OS === "web") return false;
  try {
    if (session) {
      await SecureStore.setItemAsync(STORAGE_KEY, JSON.stringify(session), sessionOptions(enabled));
    }
    await SecureStore.setItemAsync(BIOMETRIC_KEY, enabled ? "1" : "0", { keychainService: KEYCHAIN_SERVICE });
    return true;
  } catch {
    return false;
  }
}
