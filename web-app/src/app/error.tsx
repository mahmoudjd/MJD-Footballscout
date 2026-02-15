"use client"

import { useEffect, useState } from "react"
import { signOut } from "next-auth/react"
import { Spinner } from "@/components/spinner"

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  const [isResetting, setIsResetting] = useState(false)

  useEffect(() => {
    console.error("Global Error:", error)

    // Automatisches Signout bei 401
    if (error.message.includes("401")) {
      signOut({ callbackUrl: "/login" }) // Leitet nach Logout zur Login-Seite
    }
  }, [error])

  const handleReset = () => {
    setIsResetting(true)
    reset()
  }

  if (error.message === "RefreshTokenError") {
    return (
      <div className="flex w-full items-center justify-center p-8">
        <Spinner size="lg" label="Refreshing session..." />
      </div>
    )
  }
  return (
    <div className="flex w-full items-center justify-center p-8">
      <div className="w-full max-w-md rounded-lg border border-red-300 bg-white p-6 text-center shadow-lg">
        <h2 className="mb-4 text-3xl font-bold">💥 Oops! Something went wrong</h2>
        <p className="mb-4 text-base">{error.message}</p>
        {error.digest && <p className="mb-4 text-xs text-red-500">Error Code: {error.digest}</p>}
        <button
          onClick={handleReset}
          disabled={isResetting}
          className={`cursor-pointer rounded-lg px-5 py-2.5 font-semibold transition-colors ${
            isResetting ? "cursor-not-allowed bg-red-300" : "bg-red-600 text-white hover:bg-red-700"
          } `}
        >
          {isResetting ? "Retrying..." : "Try Again"}
        </button>
      </div>
    </div>
  )
}
