import NextAuth, { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import GoogleProvider from "next-auth/providers/google"
import { env } from "@/env"
import { AuthApiError, googleLogin, loginUser } from "@/lib/hooks/login-user"
import { refreshAccessToken } from "@/lib/hooks/queries/refresh-token"

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
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    userId?: string
    accessToken?: string
    refreshToken?: string
    expiresAt?: number
    role?: "admin" | "user"
    error?: string
  }
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
          return "/login?error=GoogleLoginError"
        }
        if (!account.id_token) {
          return "/login?error=GoogleTokenMissing"
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
            error: "GoogleTokenMissing",
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
            if (error.code === "GOOGLE_ACCOUNT_CONFLICT") {
              token.error = "GoogleAccountConflict"
              return token
            }
            if (error.code === "GOOGLE_NOT_CONFIGURED") {
              token.error = "GoogleNotConfigured"
              return token
            }
          }
          token.error = "GoogleLoginError"
          return token
        }
      } else if (user) {
        token.userId = user.id
        token.name = user.name
        token.email = user.email
        token.accessToken = user.accessToken
        token.refreshToken = user.refreshToken
        token.role = (user as any).role || token.role || "user"
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
            error: "RefreshAccessTokenError",
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
      ;(session as any).error = (token as any)?.error
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
