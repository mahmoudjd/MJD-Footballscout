import axios from "axios"
import { env } from "@/env"

export async function refreshAccessToken(refreshToken: string) {
  try {
    const response = await axios.post(`${env.NEXT_PUBLIC_API_HOST}/auth/refresh`, { refreshToken })

    const refreshedTokens = response.data

    if (response.status === 401 || !refreshedTokens?.accessToken) {
      throw new Error("RefreshTokenError")
    }

    return {
      accessToken: refreshedTokens.accessToken,
      refreshToken: refreshedTokens.refreshToken ?? refreshToken,
      expiresAt: Date.now() + (refreshedTokens.expiresIn || 3600) * 1000,
      role: refreshedTokens.role,
    }
  } catch (error: any) {
    console.error("Token refresh failed:", error)
    if (error?.response?.status === 401) {
      throw new Error("RefreshTokenError")
    }

    throw error
  }
}
