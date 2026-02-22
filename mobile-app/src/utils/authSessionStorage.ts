import { Platform } from "react-native";
import * as FileSystem from "expo-file-system/legacy";
import { AuthSession } from "@/src/data/Types";

const STORAGE_KEY = "mjd.auth.session";
const FILE_NAME = "mjd-auth-session.json";

function getFileUri() {
  if (!FileSystem.documentDirectory) {
    return null;
  }
  return `${FileSystem.documentDirectory}${FILE_NAME}`;
}

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

export async function saveAuthSession(session: AuthSession | null) {
  const payload = session ? JSON.stringify(session) : "";
  if (Platform.OS === "web") {
    if (typeof window === "undefined") return;
    if (!session) {
      window.localStorage.removeItem(STORAGE_KEY);
    } else {
      window.localStorage.setItem(STORAGE_KEY, payload);
    }
    return;
  }

  const uri = getFileUri();
  if (!uri) return;

  if (!session) {
    try {
      await FileSystem.deleteAsync(uri, { idempotent: true });
    } catch {
      // ignore deletion errors for storage cleanup
    }
    return;
  }

  await FileSystem.writeAsStringAsync(uri, payload);
}

export async function loadAuthSession() {
  try {
    let raw: string | null = null;

    if (Platform.OS === "web") {
      if (typeof window === "undefined") return null;
      raw = window.localStorage.getItem(STORAGE_KEY);
    } else {
      const uri = getFileUri();
      if (!uri) return null;
      raw = await FileSystem.readAsStringAsync(uri);
    }

    if (!raw) return null;
    const parsed: unknown = JSON.parse(raw);
    if (!isValidSession(parsed)) return null;
    return parsed;
  } catch {
    return null;
  }
}
