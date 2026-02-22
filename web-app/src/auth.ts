import NextAuth, { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import GoogleProvider from "next-auth/providers/google"
import { env } from "@/env"
import { AuthApiError, googleLogin, loginUser } from "@/lib/hooks/authApi"
import { refreshAccessToken } from "@/lib/hooks/queries/refreshAccessToken"
import { AUTH_SESSION_ERRORS, type AuthSessionError } from "@/lib/auth-errors"

export type { Session } from "next-auth"

declare module "next-auth" {
  interface User {
    id: string
    expiresAt: number
    accessToken: string
    refreshToken: string
    role: "admin" | "user"
    name: string
    email?: string
  }

  export interface Session {
    user: User
    error?: AuthSessionError
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    userId?: string
    accessToken?: string
    refreshToken?: string
    expiresAt?: number
    role?: "admin" | "user"
    error?: AuthSessionError
  }
}

function mapGoogleAuthError(error: AuthApiError): AuthSessionError {
  if (error.code === "GOOGLE_ACCOUNT_LINK_CONFLICT" || error.code === "GOOGLE_LOGIN_CONFLICT") {
    return AUTH_SESSION_ERRORS.GOOGLE_LOGIN_CONFLICT
  }
  if (error.code === "GOOGLE_NOT_CONFIGURED") {
    return AUTH_SESSION_ERRORS.GOOGLE_NOT_CONFIGURED
  }
  if (error.code === "GOOGLE_TOKEN_INVALID") {
    return AUTH_SESSION_ERRORS.GOOGLE_TOKEN_INVALID
  }
  return AUTH_SESSION_ERRORS.GOOGLE_LOGIN_ERROR
}

function resolveUserRole(user: unknown): "admin" | "user" | undefined {
  if (typeof user === "object" && user !== null && "role" in user) {
    const role = (user as { role?: unknown }).role
    if (role === "admin" || role === "user") {
      return role
    }
  }
  return undefined
}

const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: env.GOOGLE_CLIENT_ID!,
      clientSecret: env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code",
        },
      },
    }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        try {
          const loginData = await loginUser({
            email: credentials?.email || "",
            password: credentials?.password || "",
          })

          if (loginData) {
            return {
              ...loginData,
              role: loginData.role || "user",
              expiresAt: Date.now() + 60 * 60 * 1000,
            }
          } else {
            throw new Error("Invalid email or password")
          }
        } catch {
          return null
        }
      },
    }),
  ],
  callbacks: {
    async signIn({ account, profile }) {
      if (account?.provider === "google") {
        if (!profile?.email) {
          return `/login?error=${AUTH_SESSION_ERRORS.GOOGLE_LOGIN_ERROR}`
        }
        if (!account.id_token) {
          return `/login?error=${AUTH_SESSION_ERRORS.GOOGLE_TOKEN_MISSING}`
        }
        return true
      }
      return true
    },
    async jwt({ token, user, account }) {
      if (account?.provider === "google") {
        const idToken = typeof account.id_token === "string" ? account.id_token : ""
        if (!idToken) {
          return {
            ...token,
            error: AUTH_SESSION_ERRORS.GOOGLE_TOKEN_MISSING,
          }
        }
        try {
          const googleUser = await googleLogin({ idToken })
          token.userId = googleUser.id
          token.name = googleUser.name
          token.email = googleUser.email
          token.accessToken = googleUser.accessToken
          token.refreshToken = googleUser.refreshToken
          token.role = googleUser.role || "user"
          token.expiresAt = Date.now() + 60 * 60 * 1000
          token.error = undefined
        } catch (error) {
          if (error instanceof AuthApiError) {
            token.error = mapGoogleAuthError(error)
            return token
          }
          token.error = AUTH_SESSION_ERRORS.GOOGLE_LOGIN_ERROR
          return token
        }
      } else if (user) {
        token.userId = user.id
        token.name = user.name
        token.email = user.email
        token.accessToken = user.accessToken
        token.refreshToken = user.refreshToken
        token.role = resolveUserRole(user) || token.role || "user"
        token.expiresAt = Date.now() + 60 * 60 * 1000
      }

      const fiveMinutesInMs = 5 * 60 * 1000

      if (token.refreshToken && Date.now() > (token.expiresAt || 0) - fiveMinutesInMs) {
        try {
          const refreshedTokens = await refreshAccessToken(String(token.refreshToken))

          token.accessToken = refreshedTokens?.accessToken
          token.refreshToken = refreshedTokens?.refreshToken || token.refreshToken
          token.expiresAt = refreshedTokens?.expiresAt
          token.role = refreshedTokens?.role || token.role
          token.error = undefined
        } catch (error) {
          console.error("Failed to refresh accessToken:", error)
          return {
            ...token,
            error: AUTH_SESSION_ERRORS.REFRESH_ACCESS_TOKEN_ERROR,
          }
        }
      }
      return token
    },
    async session({ session, token }) {
      session.user = {
        id: token.userId || "",
        name: token.name || "",
        email: token.email || "",
        accessToken: token.accessToken || "",
        refreshToken: token.refreshToken || "",
        expiresAt: token.expiresAt || Date.now(),
        role: token.role || "user",
      }
      session.error = token.error
      return session
    },
  },
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
  },
  jwt: {
    secret: env.NEXTAUTH_SECRET,
  },
}

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST, authOptions }
