import axios from "axios"
import { env } from "@/env"
import { apiClient } from "@/lib/hooks/apiClient"

export interface AccountProfile {
  id: string
  name: string
  email: string
  role: "admin" | "user"
  authProvider: "credentials" | "google"
  isActive: boolean
  createdAt: string
  updatedAt?: string
  emailVerified: boolean
  securityEmailsEnabled: boolean
  mfaEnabled: boolean
}

interface ApiMessage {
  message: string
}

interface ForgotPasswordResponse extends ApiMessage {
  resetUrl?: string
}

function resolveApiError(error: unknown, fallback: string) {
  if (axios.isAxiosError<{ error?: string }>(error)) {
    return error.response?.data?.error || fallback
  }
  return fallback
}

export async function getAccountProfile() {
  const response = await apiClient.get<AccountProfile>("/auth/me")
  return response.data
}

export async function updateAccountProfile(name: string) {
  const response = await apiClient.patch<Pick<AccountProfile, "name" | "email" | "updatedAt">>(
    "/auth/me",
    { name },
  )
  return response.data
}

export async function changeAccountPassword(input: {
  currentPassword: string
  newPassword: string
}) {
  try {
    const response = await apiClient.post<ApiMessage>("/auth/change-password", input)
    return response.data
  } catch (error) {
    throw new Error(resolveApiError(error, "Password could not be changed."), { cause: error })
  }
}

export async function deactivateAccount(input: { password?: string; reason?: string }) {
  try {
    const response = await apiClient.delete<ApiMessage>("/auth/me", { data: input })
    return response.data
  } catch (error) {
    throw new Error(resolveApiError(error, "Account could not be deactivated."), { cause: error })
  }
}

export async function requestPasswordReset(email: string) {
  try {
    const response = await axios.post<ForgotPasswordResponse>(
      `${env.NEXT_PUBLIC_API_HOST}/auth/forgot-password`,
      { email },
    )
    return response.data
  } catch (error) {
    throw new Error(resolveApiError(error, "Password reset request failed."), { cause: error })
  }
}

export async function resetAccountPassword(input: { token: string; newPassword: string }) {
  try {
    const response = await axios.post<ApiMessage>(
      `${env.NEXT_PUBLIC_API_HOST}/auth/reset-password`,
      input,
    )
    return response.data
  } catch (error) {
    throw new Error(resolveApiError(error, "Password could not be reset."), { cause: error })
  }
}

export async function verifyAccountEmail(token: string) {
  const response = await axios.post<ApiMessage>(`${env.NEXT_PUBLIC_API_HOST}/auth/verify-email`, {
    token,
  })
  return response.data
}

export async function resendVerificationEmail(email: string) {
  const response = await axios.post<ApiMessage & { verificationUrl?: string }>(
    `${env.NEXT_PUBLIC_API_HOST}/auth/resend-verification`,
    { email },
  )
  return response.data
}

export async function updateNotificationPreferences(securityEmailsEnabled: boolean) {
  const response = await apiClient.patch<ApiMessage & { securityEmailsEnabled: boolean }>(
    "/auth/notification-preferences",
    { securityEmailsEnabled },
  )
  return response.data
}

export interface MfaSetupResponse {
  secret: string
  otpAuthUrl: string
}

export async function startMfaSetup(password?: string) {
  try {
    const response = await apiClient.post<MfaSetupResponse>("/auth/mfa/setup", { password })
    return response.data
  } catch (error) {
    throw new Error(resolveApiError(error, "MFA setup could not be started."), { cause: error })
  }
}

export async function enableMfa(code: string) {
  try {
    const response = await apiClient.post<ApiMessage & { recoveryCodes: string[] }>(
      "/auth/mfa/enable",
      { code },
    )
    return response.data
  } catch (error) {
    throw new Error(resolveApiError(error, "MFA could not be enabled."), { cause: error })
  }
}

export async function disableMfa(input: { code: string; password?: string }) {
  try {
    const response = await apiClient.post<ApiMessage>("/auth/mfa/disable", input)
    return response.data
  } catch (error) {
    throw new Error(resolveApiError(error, "MFA could not be disabled."), { cause: error })
  }
}
