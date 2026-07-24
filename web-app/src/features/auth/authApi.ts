import axios, { AxiosError } from "axios"
import { env } from "@/env"

export interface AuthLoginResponse {
  id: string
  name: string
  email: string
  role: "admin" | "user"
  accessToken: string
  refreshToken: string
}

export interface MfaChallengeResponse {
  mfaRequired: true
  mfaChallengeToken: string
}

export type CredentialsLoginResponse = AuthLoginResponse | MfaChallengeResponse

export class AuthApiError extends Error {
  code: string
  status?: number

  constructor(message: string, code: string, status?: number) {
    super(message)
    this.code = code
    this.status = status
  }
}

/**
 * Real browser context forwarded from the Next.js server to the backend so the
 * security email shows the actual device/location instead of "axios".
 */
export interface ClientContext {
  userAgent?: string
  forwardedFor?: string
  country?: string
  city?: string
}

function clientContextHeaders(context?: ClientContext) {
  if (!context) return undefined
  const headers: Record<string, string> = {}
  if (context.userAgent) headers["User-Agent"] = context.userAgent
  if (context.forwardedFor) headers["x-forwarded-for"] = context.forwardedFor
  if (context.country) headers["x-country-code"] = context.country
  if (context.city) headers["x-vercel-ip-city"] = context.city
  return headers
}

export async function loginUser(
  input: {
    email: string
    password: string
    mfaCode?: string
    mfaChallengeToken?: string
    deviceId?: string
  },
  clientContext?: ClientContext,
) {
  try {
    const response = await axios.post<CredentialsLoginResponse>(
      `${env.NEXT_PUBLIC_API_HOST}/auth/login`,
      input,
      { headers: clientContextHeaders(clientContext) },
    )
    return response.data
  } catch (error) {
    console.error("Login failed:", error)
    return null
  }
}

/**
 * Side-effect-free pre-flight: validates credentials and reports whether MFA is
 * required, without issuing tokens/session/email. The real login happens via
 * next-auth signIn afterwards — so a non-MFA login only triggers its side
 * effects (security email, session) once.
 */
export async function beginCredentialsLogin(input: {
  email: string
  password: string
  deviceId?: string
}): Promise<MfaChallengeResponse | { mfaRequired: false }> {
  const response = await axios.post<MfaChallengeResponse | { mfaRequired: false }>(
    `${env.NEXT_PUBLIC_API_HOST}/auth/login`,
    { ...input, probe: true },
  )
  return response.data
}

function toAuthApiError(error: unknown) {
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError<{ error?: string }>
    const status = axiosError.response?.status
    const apiMessage = axiosError.response?.data?.error
    const normalizedApiMessage = apiMessage?.toLowerCase() || ""
    if (status === 409) {
      if (
        normalizedApiMessage.includes("linked to another google account") ||
        normalizedApiMessage.includes("already linked")
      ) {
        return new AuthApiError(apiMessage ?? "", "GOOGLE_ACCOUNT_LINK_CONFLICT", status)
      }
      return new AuthApiError(
        apiMessage || "Google login conflict",
        "GOOGLE_LOGIN_CONFLICT",
        status,
      )
    }
    if (status === 503) {
      return new AuthApiError(
        apiMessage || "Google login is not configured",
        "GOOGLE_NOT_CONFIGURED",
        status,
      )
    }
    if (status === 400 || status === 401) {
      return new AuthApiError(apiMessage || "Invalid Google token", "GOOGLE_TOKEN_INVALID", status)
    }
    return new AuthApiError(apiMessage || "Google login failed", "GOOGLE_LOGIN_FAILED", status)
  }
  return new AuthApiError("Google login failed", "GOOGLE_LOGIN_FAILED")
}

export async function googleLogin({ idToken }: { idToken: string }) {
  try {
    const response = await axios.post<AuthLoginResponse>(
      `${env.NEXT_PUBLIC_API_HOST}/auth/google-login`,
      {
        idToken,
      },
    )
    return response.data
  } catch (error) {
    throw toAuthApiError(error)
  }
}
