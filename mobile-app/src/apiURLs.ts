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

const DEFAULT_WEB_URL = "https://mjd-football-scout.vercel.app";

const envWebUrl = normalizeApiUrl(process.env.EXPO_PUBLIC_WEB_URL);

/** Base URL of the web app — used for flows deferred to web (e.g. billing upgrade). */
export const WEB_URL = envWebUrl || DEFAULT_WEB_URL;
