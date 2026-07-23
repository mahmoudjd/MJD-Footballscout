"use client"

import { useEffect } from "react"
import { signOut } from "next-auth/react"
import { Spinner } from "@/components/common/spinner"
import { Button } from "@/components/ui/button"
import { Text } from "@/components/ui/text"
import { PageContainer } from "@/components/ui/page-container"
import { Panel } from "@/components/ui/panel"
import { StatusState } from "@/components/ui/status-state"

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
  const shouldSignOut = isUnauthorizedError(error)
  const userFacingMessage = resolveUserFacingErrorMessage(error)

  useEffect(() => {
    console.error("Global Error:", error)

    if (shouldSignOut) {
      void signOut({ callbackUrl: "/login" })
    }
  }, [error, shouldSignOut])

  if (error.message === "RefreshTokenError") {
    return (
      <PageContainer size="narrow" spacing="relaxed">
        <Panel tone="soft">
          <Spinner size="lg" label="Refreshing Session…" />
        </Panel>
      </PageContainer>
    )
  }
  return (
    <PageContainer size="narrow" spacing="relaxed">
      <Panel className="space-y-5 border-red-200 bg-linear-to-br from-white to-red-50/55">
        <Text as="h1" variant="h1" weight="bold" className="text-emerald-950">
          Something Went Wrong
        </Text>
        <StatusState
          tone="error"
          title={userFacingMessage}
          description="Retry the page. If the problem continues, return to the home page."
        />
        {error.digest ? (
          <Text as="p" variant="caption" tone="danger" className="mb-4">
            Error Code: {error.digest}
          </Text>
        ) : null}
        <Button onClick={reset} variant="danger" size="md">
          Try Again
        </Button>
      </Panel>
    </PageContainer>
  )
}
