const DEFAULT_REMOTE_API_URL = "https://mjd-football-server.onrender.com";

function normalizeApiUrl(value?: string) {
  if (!value) return null;
  const trimmed = value.trim().replace(/^["']|["']$/g, "");
  try {
    const url = new URL(trimmed);
    return url.toString().replace(/\/$/, "");
  } catch {
    return null;
  }
}

const envApiUrl = normalizeApiUrl(process.env.EXPO_PUBLIC_API_URL);

if (!envApiUrl && process.env.EXPO_PUBLIC_API_URL) {
  console.warn(
    `[API] Invalid EXPO_PUBLIC_API_URL="${process.env.EXPO_PUBLIC_API_URL}". Falling back to defaults.`,
  );
}

export const API_URL = envApiUrl || DEFAULT_REMOTE_API_URL;
