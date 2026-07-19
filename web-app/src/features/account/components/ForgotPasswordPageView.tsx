"use client"

import { type FormEvent, useState } from "react"
import Link from "next/link"
import { AuthCard } from "@/features/auth/components/AuthCard"
import { FormField } from "@/components/ui/form-field"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/common/spinner"
import { requestPasswordReset } from "@/features/account/accountApi"

export function ForgotPasswordPageView() {
  const [email, setEmail] = useState("")
  const [message, setMessage] = useState("")
  const [error, setError] = useState("")
  const [resetUrl, setResetUrl] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError("")
    setMessage("")
    setResetUrl("")
    setIsSubmitting(true)
    try {
      const response = await requestPasswordReset(email)
      setMessage(response.message)
      setResetUrl(response.resetUrl || "")
    } catch (requestError) {
      setError(
        requestError instanceof Error ? requestError.message : "Password reset request failed.",
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <AuthCard
      title="Forgot Password"
      description="Enter your email to receive a secure password reset link."
    >
      <form className="space-y-4" onSubmit={handleSubmit} noValidate>
        <FormField label="Email Address" htmlFor="forgot-email" required>
          <Input
            id="forgot-email"
            name="email"
            type="email"
            autoComplete="email"
            spellCheck={false}
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="name@example.com…"
            required
            aria-invalid={Boolean(error)}
            aria-describedby={error ? "forgot-password-error" : undefined}
          />
        </FormField>
        {error ? (
          <p
            id="forgot-password-error"
            role="alert"
            className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-800"
          >
            {error}
          </p>
        ) : null}
        {message ? (
          <div
            role="status"
            aria-live="polite"
            className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900"
          >
            <p className="font-semibold">{message}</p>
            {resetUrl ? (
              <a
                href={resetUrl}
                className="mt-2 inline-flex font-bold text-emerald-800 underline underline-offset-4"
              >
                Open Local Reset Link
              </a>
            ) : null}
          </div>
        ) : null}
        <Button type="submit" fullWidth disabled={isSubmitting || !email.trim()}>
          {isSubmitting ? (
            <>
              <Spinner size="sm" tone="light" /> Sending…
            </>
          ) : (
            "Send Reset Link"
          )}
        </Button>
      </form>
      <p className="mt-5 text-center text-sm text-emerald-950/65">
        Remember your password?{" "}
        <Link
          href="/login"
          className="font-bold text-emerald-800 underline-offset-4 hover:underline"
        >
          Back to Sign In
        </Link>
      </p>
    </AuthCard>
  )
}
