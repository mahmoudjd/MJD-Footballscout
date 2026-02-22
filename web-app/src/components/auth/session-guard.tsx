"use client"

import { useEffect } from "react"
import { signOut, useSession } from "next-auth/react"
import { shouldForceSignOutForSessionError } from "@/lib/auth-errors"

export default function SessionGuard({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession()
  const sessionError = session?.error
  const shouldForceSignOut = shouldForceSignOutForSessionError(sessionError)

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
