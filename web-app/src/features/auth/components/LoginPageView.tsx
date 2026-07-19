"use client"

import { type ChangeEvent, type FormEvent, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { signIn } from "next-auth/react"
import { AuthCard } from "@/features/auth/components/AuthCard"
import { AuthDivider } from "@/features/auth/components/AuthDivider"
import { Button } from "@/components/ui/button"
import { FormField } from "@/components/ui/form-field"
import { Input } from "@/components/ui/input"
import { Spinner } from "@/components/common/spinner"
import { useToast } from "@/lib/hooks/useToast"
import { getLoginAuthErrorMessage } from "@/features/auth/auth-errors"
import { beginCredentialsLogin } from "@/features/auth/authApi"
import axios from "axios"
import { resendVerificationEmail } from "@/features/account/accountApi"

interface LoginFormState {
  email: string
  password: string
}

export function LoginPageView() {
  const router = useRouter()
  const toast = useToast()
  const searchParams = useSearchParams()
  const [form, setForm] = useState<LoginFormState>({
    email: searchParams.get("email") || "",
    password: "",
  })
  const [error, setError] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [mfaChallengeToken, setMfaChallengeToken] = useState("")
  const [mfaCode, setMfaCode] = useState("")
  const [isResendingVerification, setIsResendingVerification] = useState(false)

  const callbackUrl = searchParams.get("callbackUrl") || "/"
  const providerError = getLoginAuthErrorMessage(searchParams.get("error"))
  const accountNotice = searchParams.get("verified")
    ? "Your email is verified. You can now sign in."
    : searchParams.get("passwordChanged")
      ? "Your password was changed. Sign in with your new password."
      : searchParams.get("accountDeactivated")
        ? "Your account has been deactivated and can no longer be used to sign in."
        : ""

  const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target
    setForm((current) => ({ ...current, [name]: value }))
  }

  const handleCredentialsSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError("")

    if (!form.email || !form.password) {
      setError("Enter your email address and password.")
      return
    }

    setIsSubmitting(true)

    try {
      if (!mfaChallengeToken) {
        const loginCheck = await beginCredentialsLogin(form)
        if ("mfaRequired" in loginCheck) {
          setMfaChallengeToken(loginCheck.mfaChallengeToken)
          return
        }
      }
      const result = await signIn("credentials", {
        redirect: false,
        email: form.email,
        password: form.password,
        mfaCode: mfaCode || undefined,
        mfaChallengeToken: mfaChallengeToken || undefined,
      })

      if (result?.ok) {
        toast.success("Login successful")
        router.push(callbackUrl)
        return
      }

      setError(
        mfaChallengeToken
          ? "The authentication or recovery code is invalid."
          : "The email or password is incorrect.",
      )
    } catch (loginError) {
      if (axios.isAxiosError<{ error?: string }>(loginError)) {
        setError(loginError.response?.data?.error || "Login is temporarily unavailable.")
      } else {
        setError("Login is temporarily unavailable. Please try again.")
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleGoogleLogin = async () => {
    await signIn("google", { callbackUrl })
  }

  const handleResendVerification = async () => {
    if (!form.email) return
    setIsResendingVerification(true)
    try {
      const response = await resendVerificationEmail(form.email)
      toast.success(response.message)
    } catch {
      toast.error("Verification email could not be sent.")
    } finally {
      setIsResendingVerification(false)
    }
  }

  return (
    <AuthCard
      title="Login"
      description="Sign in to use compare, watchlists and full player profiles."
    >
      {accountNotice ? (
        <div
          role="status"
          aria-live="polite"
          className="mb-4 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-900"
        >
          {accountNotice}
        </div>
      ) : null}
      <form onSubmit={handleCredentialsSubmit} className="w-full space-y-4" noValidate>
        {mfaChallengeToken ? (
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-950">
            <p className="font-bold">Multi-factor authentication</p>
            <p className="mt-1 text-emerald-950/65">
              Enter the 6-digit code from your authenticator app or one recovery code.
            </p>
          </div>
        ) : null}
        <FormField label="Email address" htmlFor="login-email" required>
          <Input
            id="login-email"
            name="email"
            type="email"
            placeholder="name@example.com…"
            autoComplete="email"
            spellCheck={false}
            required
            value={form.email}
            onChange={handleInputChange}
            inputSize="md"
            disabled={Boolean(mfaChallengeToken)}
            aria-invalid={Boolean(error || providerError)}
            aria-describedby={error || providerError ? "login-form-error" : undefined}
          />
        </FormField>
        <FormField label="Password" htmlFor="login-password" required>
          <Input
            id="login-password"
            name="password"
            type="password"
            placeholder="Enter your password…"
            autoComplete="current-password"
            required
            value={form.password}
            onChange={handleInputChange}
            inputSize="md"
            disabled={Boolean(mfaChallengeToken)}
            aria-invalid={Boolean(error || providerError)}
            aria-describedby={error || providerError ? "login-form-error" : undefined}
          />
        </FormField>
        {mfaChallengeToken ? (
          <FormField label="Authentication or recovery code" htmlFor="login-mfa-code" required>
            <Input
              id="login-mfa-code"
              name="mfaCode"
              autoComplete="one-time-code"
              value={mfaCode}
              onChange={(event) => setMfaCode(event.target.value)}
              placeholder="123456 or ABCDE-FGHIJ…"
              required
              autoFocus
            />
          </FormField>
        ) : null}
        <div className="flex justify-end">
          <Link
            href="/forgot-password"
            className="rounded-sm text-sm font-bold text-emerald-800 underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-700"
          >
            Forgot Password?
          </Link>
        </div>
        {error || providerError ? (
          <p
            id="login-form-error"
            role="alert"
            className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-800"
          >
            {error || providerError}
          </p>
        ) : null}
        {error.toLowerCase().includes("verify your email") ? (
          <Button
            type="button"
            variant="outline"
            size="sm"
            fullWidth
            disabled={isResendingVerification}
            onClick={handleResendVerification}
          >
            {isResendingVerification ? "Sending…" : "Resend Verification Email"}
          </Button>
        ) : null}
        <Button type="submit" variant="primary" size="md" fullWidth disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <Spinner size="sm" tone="light" /> Signing in…
            </>
          ) : mfaChallengeToken ? (
            "Verify & sign in"
          ) : (
            "Sign in"
          )}
        </Button>
        {mfaChallengeToken ? (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            fullWidth
            onClick={() => {
              setMfaChallengeToken("")
              setMfaCode("")
              setError("")
            }}
          >
            Use another account
          </Button>
        ) : null}
      </form>

      <AuthDivider />

      <Button
        type="button"
        onClick={handleGoogleLogin}
        variant="outline"
        size="md"
        fullWidth
        className="border-emerald-950/15 bg-white"
      >
        <Image
          src="/google-logo.png"
          width={20}
          height={20}
          className="mr-2 h-5 w-5"
          alt="Google logo"
        />
        <span className="font-semibold text-emerald-950/75">Continue with Google</span>
      </Button>

      <footer className="mt-5 flex w-full justify-center">
        <p className="text-sm text-emerald-950/65">
          Don&apos;t have an account?{" "}
          <Link
            href="/signup"
            className="rounded-sm font-bold text-emerald-800 underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-700"
          >
            Sign up
          </Link>
        </p>
      </footer>
    </AuthCard>
  )
}
