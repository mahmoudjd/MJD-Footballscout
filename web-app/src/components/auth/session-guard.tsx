"use client"

import { useEffect } from "react"
import { signOut, useSession } from "next-auth/react"

export default function SessionGuard({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession()
  const sessionError = (session as { error?: string } | null)?.error
  const shouldForceSignOut =
    sessionError === "RefreshAccessTokenError" ||
    sessionError === "GoogleLoginError" ||
    sessionError === "GoogleAccountConflict" ||
    sessionError === "GoogleNotConfigured" ||
    sessionError === "GoogleTokenMissing"

  useEffect(() => {
    if (status === "authenticated" && shouldForceSignOut) {
      void signOut({
        callbackUrl: `/login?error=${encodeURIComponent(sessionError || "AuthError")}&callbackUrl=${encodeURIComponent(
          `${window.location.pathname}${window.location.search}`,
        )}`,
      })
    }
  }, [status, sessionError, shouldForceSignOut])

  return <>{children}</>
}
