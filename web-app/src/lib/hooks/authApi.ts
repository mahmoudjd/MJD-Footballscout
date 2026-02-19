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

export class AuthApiError extends Error {
  code: string
  status?: number

  constructor(message: string, code: string, status?: number) {
    super(message)
    this.code = code
    this.status = status
  }
}

export async function loginUser({ email, password }: { email: string; password: string }) {
  try {
    const response = await axios.post<AuthLoginResponse>(`${env.NEXT_PUBLIC_API_HOST}/auth/login`, {
      email,
      password,
    })
    return response.data
  } catch (error) {
    console.error("Login failed:", error)
    return null
  }
}

function toAuthApiError(error: unknown) {
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError<{ error?: string }>
    const status = axiosError.response?.status
    const apiMessage = axiosError.response?.data?.error
    if (status === 409) {
      return new AuthApiError(
        apiMessage || "Account already exists with credentials",
        "GOOGLE_ACCOUNT_CONFLICT",
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
