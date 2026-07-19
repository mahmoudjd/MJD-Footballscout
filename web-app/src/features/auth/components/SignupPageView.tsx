"use client"

import { type ChangeEvent, type FormEvent, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { signIn } from "next-auth/react"
import axios from "axios"
import { AuthCard } from "@/features/auth/components/AuthCard"
import { AuthDivider } from "@/features/auth/components/AuthDivider"
import { Button } from "@/components/ui/button"
import { FormField } from "@/components/ui/form-field"
import { Input } from "@/components/ui/input"
import { Spinner } from "@/components/common/spinner"
import { registerUser, type RegistrationResponse } from "@/features/auth/registerUser"
import { ActionLink } from "@/components/ui/action-link"

interface SignupFormState {
  name: string
  email: string
  password: string
}

interface ErrorWithResponseData {
  response?: {
    status?: number
    data?: {
      error?: string
    }
  }
}

function resolveSignupError(error: unknown) {
  if (axios.isAxiosError(error)) {
    const status = error.response?.status
    const apiMessage = error.response?.data?.error || error.response?.data?.message || ""
    const normalizedMessage = apiMessage.toLowerCase()

    if (
      status === 409 ||
      normalizedMessage.includes("already exists") ||
      normalizedMessage.includes("already has an account") ||
      normalizedMessage.includes("duplicate key") ||
      normalizedMessage.includes("e11000")
    ) {
      return "This email already has an account. Please log in."
    }

    if (apiMessage) {
      return apiMessage
    }
  }

  if (
    typeof error === "object" &&
    error !== null &&
    "response" in error &&
    typeof (error as ErrorWithResponseData).response?.data?.error === "string"
  ) {
    return (
      (error as ErrorWithResponseData).response?.data?.error || "Signup failed. Please try again."
    )
  }
  return "Signup failed. Please try again."
}

export function SignupPageView() {
  const [form, setForm] = useState<SignupFormState>({ name: "", email: "", password: "" })
  const [error, setError] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [registration, setRegistration] = useState<RegistrationResponse | null>(null)

  const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target
    setForm((current) => ({ ...current, [name]: value }))
  }

  const handleSignupSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError("")

    if (!form.name || !form.password || !form.email) {
      setError("Please fill in all fields")
      return
    }

    if (form.password.length < 8) {
      setError("Password must be at least 8 characters long")
      return
    }

    setIsSubmitting(true)
    try {
      const registerData = await registerUser(form)
      if (!registerData) {
        setError("Signup failed. Please try again.")
        return
      }

      setRegistration(registerData)
    } catch (signupError) {
      setError(resolveSignupError(signupError))
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <AuthCard
      title="Create new account"
      description="Join the app and build your own scouting workflow."
    >
      {registration ? (
        <div className="space-y-4">
          <div
            role="status"
            className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-950"
          >
            <p className="font-bold">Check your inbox</p>
            <p className="mt-1 text-emerald-950/70">{registration.message}</p>
          </div>
          {registration.verificationUrl ? (
            <a
              className="inline-flex font-bold text-emerald-800 underline underline-offset-4"
              href={registration.verificationUrl}
            >
              Open local verification link
            </a>
          ) : null}
          <ActionLink href={`/login?email=${encodeURIComponent(form.email)}`} size="md">
            Continue to sign in
          </ActionLink>
        </div>
      ) : (
        <form onSubmit={handleSignupSubmit} className="space-y-4" noValidate>
          <FormField label="Full name" htmlFor="signup-name" required>
            <Input
              id="signup-name"
              name="name"
              type="text"
              placeholder="Alex Morgan…"
              autoComplete="name"
              required
              value={form.name}
              onChange={handleInputChange}
              inputSize="md"
            />
          </FormField>
          <FormField label="Email address" htmlFor="signup-email" required>
            <Input
              id="signup-email"
              name="email"
              type="email"
              placeholder="name@example.com…"
              autoComplete="email"
              spellCheck={false}
              required
              value={form.email}
              onChange={handleInputChange}
              inputSize="md"
            />
          </FormField>
          <FormField
            label="Password"
            htmlFor="signup-password"
            hint="Use at least 8 characters."
            required
          >
            <Input
              id="signup-password"
              name="password"
              type="password"
              placeholder="Create a password…"
              autoComplete="new-password"
              minLength={8}
              required
              value={form.password}
              onChange={handleInputChange}
              inputSize="md"
              aria-describedby={error ? "signup-form-error" : "signup-password-hint"}
              aria-invalid={Boolean(error)}
            />
          </FormField>
          {error ? (
            <p
              id="signup-form-error"
              role="alert"
              className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-800"
            >
              {error}
            </p>
          ) : null}
          <Button type="submit" variant="primary" size="md" fullWidth disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Spinner size="sm" tone="light" /> Creating account…
              </>
            ) : (
              "Create account"
            )}
          </Button>
        </form>
      )}

      {registration ? null : <AuthDivider />}

      {registration ? null : (
        <Button
          type="button"
          onClick={() => signIn("google", { callbackUrl: "/" })}
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
      )}

      <footer className="mt-5 flex w-full justify-center">
        <p className="text-sm text-emerald-950/65">
          Already have an account?{" "}
          <Link
            href="/login"
            className="rounded-sm font-bold text-emerald-800 underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-700"
          >
            Sign in
          </Link>
        </p>
      </footer>
    </AuthCard>
  )
}
