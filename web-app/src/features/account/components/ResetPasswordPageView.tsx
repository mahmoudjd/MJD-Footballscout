"use client"

import { type FormEvent, useState } from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { AuthCard } from "@/features/auth/components/AuthCard"
import { FormField } from "@/components/ui/form-field"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/common/spinner"
import { resetAccountPassword } from "@/features/account/accountApi"
import { ActionLink } from "@/components/ui/action-link"

export function ResetPasswordPageView() {
  const searchParams = useSearchParams()
  const token = searchParams.get("token") || ""
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [message, setMessage] = useState("")
  const [error, setError] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError("")
    if (!token) {
      setError("This reset link is incomplete. Request a new one.")
      return
    }
    if (password.length < 8) {
      setError("Use at least 8 characters for your new password.")
      return
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.")
      return
    }
    setIsSubmitting(true)
    try {
      const response = await resetAccountPassword({ token, newPassword: password })
      setMessage(response.message)
      setPassword("")
      setConfirmPassword("")
    } catch (resetError) {
      setError(resetError instanceof Error ? resetError.message : "Password could not be reset.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <AuthCard
      title="Create New Password"
      description="Choose a strong password you do not use elsewhere."
    >
      {message ? (
        <div className="space-y-4">
          <div
            role="status"
            aria-live="polite"
            className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-900"
          >
            {message}
          </div>
          <ActionLink href="/login" size="md">
            Sign In With New Password
          </ActionLink>
        </div>
      ) : (
        <form className="space-y-4" onSubmit={handleSubmit} noValidate>
          <FormField
            label="New Password"
            htmlFor="reset-password"
            hint="Use at least 8 characters."
            required
          >
            <Input
              id="reset-password"
              name="newPassword"
              type="password"
              autoComplete="new-password"
              minLength={8}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Create a strong password…"
              required
              aria-invalid={Boolean(error)}
              aria-describedby={error ? "reset-password-error" : "reset-password-hint"}
            />
          </FormField>
          <FormField label="Confirm Password" htmlFor="reset-confirm-password" required>
            <Input
              id="reset-confirm-password"
              name="confirmPassword"
              type="password"
              autoComplete="new-password"
              minLength={8}
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              placeholder="Repeat your new password…"
              required
              aria-invalid={Boolean(error)}
              aria-describedby={error ? "reset-password-error" : undefined}
            />
          </FormField>
          {error ? (
            <p
              id="reset-password-error"
              role="alert"
              className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-800"
            >
              {error}
            </p>
          ) : null}
          <Button type="submit" fullWidth disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Spinner size="sm" tone="light" /> Resetting…
              </>
            ) : (
              "Reset Password"
            )}
          </Button>
        </form>
      )}
      <p className="mt-5 text-center text-sm text-emerald-950/65">
        Need another link?{" "}
        <Link
          href="/forgot-password"
          className="font-bold text-emerald-800 underline-offset-4 hover:underline"
        >
          Request Password Reset
        </Link>
      </p>
    </AuthCard>
  )
}
