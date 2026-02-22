"use client"

import { useEffect, useState } from "react"
import { signOut } from "next-auth/react"
import { Spinner } from "@/components/spinner"
import { Button } from "@/components/ui/button"
import { Text } from "@/components/ui/text"

function isUnauthorizedError(error: Error) {
  const normalized = error.message.toLowerCase()
  return normalized.includes("401") || normalized.includes("unauthorized")
}

function resolveUserFacingErrorMessage(error: Error) {
  if (isUnauthorizedError(error)) {
    return "Your session is no longer valid. Please sign in again."
  }

  if (process.env.NODE_ENV === "development") {
    return error.message
  }

  return "An unexpected error occurred. Please try again."
}

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  const [isResetting, setIsResetting] = useState(false)
  const shouldSignOut = isUnauthorizedError(error)
  const userFacingMessage = resolveUserFacingErrorMessage(error)

  useEffect(() => {
    console.error("Global Error:", error)

    if (shouldSignOut) {
      void signOut({ callbackUrl: "/login" })
    }
  }, [error, shouldSignOut])

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
        <Text as="h2" variant="h1" weight="bold" className="mb-4 text-slate-900">
          Something went wrong
        </Text>
        <Text as="p" variant="body-lg" className="mb-4 text-slate-700">
          {userFacingMessage}
        </Text>
        {error.digest && (
          <Text as="p" variant="caption" tone="danger" className="mb-4">
            Error Code: {error.digest}
          </Text>
        )}
        <Button
          onClick={handleReset}
          disabled={isResetting}
          variant="danger"
          size="md"
          className={isResetting ? "bg-red-300 hover:bg-red-300" : ""}
        >
          {isResetting ? "Retrying..." : "Try Again"}
        </Button>
      </div>
    </div>
  )
}
