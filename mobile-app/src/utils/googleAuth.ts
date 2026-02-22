import * as WebBrowser from "expo-web-browser";
import { Platform } from "react-native";

WebBrowser.maybeCompleteAuthSession();

const CLIENT_ID_SUFFIX = ".apps.googleusercontent.com";
const PLACEHOLDER_VALUES = new Set([
  "your-google-oauth-client-id",
  "your-google-client-id",
  "changeme",
]);

type GoogleConfig = {
  clientId: string;
  redirectUri: string;
  configError: string | null;
};

function normalizeGoogleErrorMessage(error: string, description: string) {
  const decodedDescription = decodeURIComponent(description || "");
  const lower = decodedDescription.toLowerCase();

  if (lower.includes("custom scheme uris are not allowed for 'web' client type")) {
    return (
      "Google OAuth client mismatch: You are using a WEB client ID with a custom mobile redirect URI. " +
      "Use EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID / EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID from native OAuth clients."
    );
  }

  return decodedDescription ? `${error}: ${decodedDescription}` : error;
}

function normalizeClientId(rawValue: string | undefined) {
  const value = rawValue?.trim() || "";
  if (!value) return "";
  if (PLACEHOLDER_VALUES.has(value.toLowerCase())) return "";
  return value;
}

function isLikelyClientSecret(value: string) {
  return value.toLowerCase().startsWith("gocspx-");
}

function isLikelyClientId(value: string) {
  return value.toLowerCase().endsWith(CLIENT_ID_SUFFIX);
}

function buildDefaultRedirectUri(clientId: string) {
  const prefix = clientId.replace(CLIENT_ID_SUFFIX, "");
  return `com.googleusercontent.apps.${prefix}:/oauthredirect`;
}

function normalizeRedirectUri(rawValue: string | undefined) {
  const value = rawValue?.trim() || "";
  if (!value) return "";
  const isUrl = value.includes("://");
  const isGoogleStyleScheme = value.includes(":/");
  return isUrl || isGoogleStyleScheme ? value : "";
}

function getConfig() {
  const platformClientId =
    Platform.select({
      ios: normalizeClientId(process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID),
      android: normalizeClientId(process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID),
      default: "",
    }) || "";
  const genericClientId =
    normalizeClientId(process.env.EXPO_PUBLIC_GOOGLE_OAUTH_CLIENT_ID) ||
    normalizeClientId(process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID);
  const isNativePlatform = Platform.OS === "ios" || Platform.OS === "android";
  if (isNativePlatform && !platformClientId) {
    return {
      clientId: "",
      redirectUri: "",
      configError:
        Platform.OS === "ios"
          ? "Missing EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID. " +
            "Create an iOS OAuth client in Google Cloud and set it in mobile-app/.env."
          : "Missing EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID. " +
            "Create an Android OAuth client in Google Cloud and set it in mobile-app/.env.",
    } satisfies GoogleConfig;
  }
  const rawClientId =
    platformClientId ||
    genericClientId;
  const fallbackConfigValue = normalizeClientId(process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID);

  if (!rawClientId && fallbackConfigValue && isLikelyClientSecret(fallbackConfigValue)) {
    return {
      clientId: "",
      redirectUri: "",
      configError:
        "EXPO_PUBLIC_GOOGLE_CLIENT_ID looks like a client secret (starts with GOCSPX-). " +
        "Use EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID / EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID instead.",
    } satisfies GoogleConfig;
  }

  if (!rawClientId) {
    return {
      clientId: "",
      redirectUri: "",
      configError:
        "Missing Google OAuth client ID. Set EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID " +
        "or EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID (or EXPO_PUBLIC_GOOGLE_OAUTH_CLIENT_ID).",
    } satisfies GoogleConfig;
  }

  if (!isLikelyClientId(rawClientId)) {
    return {
      clientId: "",
      redirectUri: "",
      configError:
        "Google OAuth client ID format is invalid. It must end with .apps.googleusercontent.com.",
    } satisfies GoogleConfig;
  }

  const configuredRedirectUri = normalizeRedirectUri(process.env.EXPO_PUBLIC_GOOGLE_REDIRECT_URI);
  const expectedRedirectPrefix = buildDefaultRedirectUri(rawClientId).replace(":/oauthredirect", "");
  if (
    configuredRedirectUri &&
    platformClientId &&
    !configuredRedirectUri.startsWith(`${expectedRedirectPrefix}:/`)
  ) {
    return {
      clientId: "",
      redirectUri: "",
      configError:
        "EXPO_PUBLIC_GOOGLE_REDIRECT_URI does not match selected platform client ID. " +
        `Use ${buildDefaultRedirectUri(rawClientId)} or remove EXPO_PUBLIC_GOOGLE_REDIRECT_URI.`,
    } satisfies GoogleConfig;
  }

  const redirectUri = configuredRedirectUri || buildDefaultRedirectUri(rawClientId);

  return {
    clientId: rawClientId,
    redirectUri,
    configError: null,
  } satisfies GoogleConfig;
}

function randomString(length = 24) {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  for (let i = 0; i < length; i += 1) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

function getUrlParam(url: string, key: string) {
  try {
    const parsed = new URL(url);
    const queryValue = parsed.searchParams.get(key);
    if (queryValue) return queryValue;
  } catch {
    // fall back to hash parsing for custom deep links
  }

  const hashIndex = url.indexOf("#");
  if (hashIndex < 0) return null;
  const hashPart = url.slice(hashIndex + 1);
  const params = new URLSearchParams(hashPart);
  return params.get(key);
}

export function isGoogleLoginConfigured() {
  const { clientId, configError } = getConfig();
  return Boolean(clientId) && !configError;
}

export function getGoogleLoginConfigurationError() {
  const { configError } = getConfig();
  return configError;
}

export async function requestGoogleIdToken() {
  const { clientId, redirectUri, configError } = getConfig();

  if (!clientId || configError) {
    throw new Error(configError || "Google login is not configured for mobile app.");
  }

  const state = randomString(20);

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: "code",
    scope: "openid profile email",
    prompt: "select_account",
    state,
    access_type: "offline",
  });

  const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
  const result = await WebBrowser.openAuthSessionAsync(authUrl, redirectUri);

  if (result.type !== "success" || !result.url) {
    throw new Error("Google login was cancelled.");
  }

  const returnedState = getUrlParam(result.url, "state");
  if (!returnedState || returnedState !== state) {
    throw new Error("Invalid Google login state.");
  }

  const authCode = getUrlParam(result.url, "code");
  if (!authCode) {
    const error = getUrlParam(result.url, "error") || "Google token missing";
    const errorDescription = getUrlParam(result.url, "error_description");
    if (errorDescription) {
      throw new Error(normalizeGoogleErrorMessage(error, errorDescription));
    }
    throw new Error(error);
  }

  const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      code: authCode,
      client_id: clientId,
      redirect_uri: redirectUri,
      grant_type: "authorization_code",
    }).toString(),
  });

  const tokenBodyText = await tokenResponse.text();
  let tokenPayload: Record<string, unknown> = {};
  if (tokenBodyText) {
    try {
      tokenPayload = JSON.parse(tokenBodyText) as Record<string, unknown>;
    } catch {
      tokenPayload = {};
    }
  }

  if (!tokenResponse.ok) {
    const error = typeof tokenPayload.error === "string" ? tokenPayload.error : "token_exchange_failed";
    const errorDescription =
      typeof tokenPayload.error_description === "string" ? tokenPayload.error_description : "";
    const detailedMessage = errorDescription ? `${error}: ${errorDescription}` : error;
    throw new Error(`Google token exchange failed (${tokenResponse.status}): ${detailedMessage}`);
  }

  const idToken =
    typeof tokenPayload.id_token === "string" ? tokenPayload.id_token.trim() : "";

  if (!idToken) {
    throw new Error("Google token response is missing id_token.");
  }

  return idToken;
}
