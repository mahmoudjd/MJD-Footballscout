"use client";

import { useEffect } from "react";
import { signOut, useSession } from "next-auth/react";

export default function SessionGuard({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession()

  useEffect(() => {
    if (status === "authenticated" && (session as any)?.error === "RefreshAccessTokenError") {
      signOut({
        callbackUrl: `/login?callbackUrl=${encodeURIComponent(window.location.pathname)}`
      })
    }
  })
  return <>{children}</>
}
