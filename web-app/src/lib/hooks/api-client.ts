import axios from "axios"
import { env } from "@/env"
import { getSession } from "next-auth/react"

const apiClient = axios.create({
  baseURL: env.NEXT_PUBLIC_API_HOST,
})

let cachedAccessToken: string | null = null
let tokenCacheExpiresAt = 0
let pendingSessionRequest: Promise<string | null> | null = null

function resetTokenCache() {
  cachedAccessToken = null
  tokenCacheExpiresAt = 0
  pendingSessionRequest = null
}

async function getCachedAccessToken() {
  const now = Date.now()
  if (now < tokenCacheExpiresAt) {
    return cachedAccessToken
  }

  if (!pendingSessionRequest) {
    pendingSessionRequest = getSession()
      .then((session) => {
        const resolvedNow = Date.now()
        cachedAccessToken = session?.user.accessToken || null
        const expiresAt = session?.user.expiresAt
        const safeExpiry =
          typeof expiresAt === "number"
            ? Math.max(resolvedNow, expiresAt - 30_000)
            : resolvedNow + 15_000
        tokenCacheExpiresAt = safeExpiry
        return cachedAccessToken
      })
      .finally(() => {
        pendingSessionRequest = null
      })
  }

  return pendingSessionRequest
}

apiClient.interceptors.request.use(async (config) => {
  if (config.headers?.Authorization) {
    return config
  }

  const accessToken = await getCachedAccessToken()

  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`
  }

  return config
})

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error?.response?.status === 401) {
      resetTokenCache()
    }
    return Promise.reject(error)
  },
)

export { apiClient }
