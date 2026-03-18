export const AUTH_SESSION_ERRORS = {
  GOOGLE_ACCOUNT_CONFLICT: "GoogleAccountConflict",
  GOOGLE_LOGIN_CONFLICT: "GoogleLoginConflict",
  GOOGLE_NOT_CONFIGURED: "GoogleNotConfigured",
  GOOGLE_TOKEN_MISSING: "GoogleTokenMissing",
  GOOGLE_TOKEN_INVALID: "GoogleTokenInvalid",
  GOOGLE_LOGIN_ERROR: "GoogleLoginError",
  REFRESH_ACCESS_TOKEN_ERROR: "RefreshAccessTokenError",
} as const

export type AuthSessionError = (typeof AUTH_SESSION_ERRORS)[keyof typeof AUTH_SESSION_ERRORS]

const AUTH_SESSION_ERROR_SET = new Set<string>(Object.values(AUTH_SESSION_ERRORS))

const FORCE_SIGN_OUT_ERRORS = new Set<AuthSessionError>([
  AUTH_SESSION_ERRORS.REFRESH_ACCESS_TOKEN_ERROR,
  AUTH_SESSION_ERRORS.GOOGLE_LOGIN_ERROR,
  AUTH_SESSION_ERRORS.GOOGLE_ACCOUNT_CONFLICT,
  AUTH_SESSION_ERRORS.GOOGLE_LOGIN_CONFLICT,
  AUTH_SESSION_ERRORS.GOOGLE_NOT_CONFIGURED,
  AUTH_SESSION_ERRORS.GOOGLE_TOKEN_MISSING,
  AUTH_SESSION_ERRORS.GOOGLE_TOKEN_INVALID,
])

const LOGIN_ERROR_MESSAGES: Record<string, string> = {
  [AUTH_SESSION_ERRORS.GOOGLE_ACCOUNT_CONFLICT]:
    "This Google account cannot be linked to this email. Please use the originally linked sign-in method.",
  [AUTH_SESSION_ERRORS.GOOGLE_LOGIN_CONFLICT]:
    "This Google account cannot be linked to this email. Please use the originally linked sign-in method.",
  [AUTH_SESSION_ERRORS.GOOGLE_NOT_CONFIGURED]: "Google login is currently not configured.",
  [AUTH_SESSION_ERRORS.GOOGLE_TOKEN_MISSING]:
    "Google authentication token is missing. Please try again.",
  [AUTH_SESSION_ERRORS.GOOGLE_TOKEN_INVALID]:
    "Google token is invalid or expired. Please try signing in again.",
  [AUTH_SESSION_ERRORS.GOOGLE_LOGIN_ERROR]: "Google login failed. Please try again.",
  OAuthSignin: "Google login failed. Please try again.",
  OAuthCallback: "Google login failed. Please try again.",
  OAuthCreateAccount: "Google login failed. Please try again.",
  AccessDenied: "Google login failed. Please try again.",
  [AUTH_SESSION_ERRORS.REFRESH_ACCESS_TOKEN_ERROR]: "Your session expired. Please sign in again.",
}

export function isAuthSessionError(value: unknown): value is AuthSessionError {
  return typeof value === "string" && AUTH_SESSION_ERROR_SET.has(value)
}

export function shouldForceSignOutForSessionError(value: unknown): value is AuthSessionError {
  return isAuthSessionError(value) && FORCE_SIGN_OUT_ERRORS.has(value)
}

export function getLoginAuthErrorMessage(errorCode: string | null): string {
  if (!errorCode) {
    return ""
  }

  return LOGIN_ERROR_MESSAGES[errorCode] || "Sign in failed. Please try again."
}
