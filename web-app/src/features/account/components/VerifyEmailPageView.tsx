"use client"

import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import { AuthCard } from "@/features/auth/components/AuthCard"
import { verifyAccountEmail } from "@/features/account/accountApi"
import { StatusState } from "@/components/ui/status-state"
import { ActionLink } from "@/components/ui/action-link"

export function VerifyEmailPageView() {
  const token = useSearchParams().get("token") || ""
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading")
  const [message, setMessage] = useState("")

  useEffect(() => {
    if (!token) {
      setStatus("error")
      setMessage("This verification link is incomplete.")
      return
    }
    let active = true
    verifyAccountEmail(token)
      .then((response) => {
        if (active) {
          setStatus("success")
          setMessage(response.message)
        }
      })
      .catch(() => {
        if (active) {
          setStatus("error")
          setMessage("This verification link is invalid or has expired.")
        }
      })
    return () => {
      active = false
    }
  }, [token])

  return (
    <AuthCard
      title="Verify your email"
      description="Securely activate your MJD Football Scout account."
    >
      {status === "loading" ? <StatusState tone="loading" title="Verifying Email…" /> : null}
      {status === "success" ? (
        <div className="space-y-4">
          <StatusState tone="empty" title="Email Verified" description={message} />
          <ActionLink href="/login?verified=1">Continue to Sign In</ActionLink>
        </div>
      ) : null}
      {status === "error" ? (
        <div className="space-y-4">
          <StatusState tone="error" title="Verification Failed" description={message} />
          <ActionLink href="/login" variant="outline">
            Back to Sign In
          </ActionLink>
        </div>
      ) : null}
    </AuthCard>
  )
}
