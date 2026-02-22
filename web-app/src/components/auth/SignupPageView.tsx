"use client"

import { type ChangeEvent, type FormEvent, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { signIn } from "next-auth/react"
import axios from "axios"
import { AuthCard } from "@/components/auth/AuthCard"
import { AuthDivider } from "@/components/auth/AuthDivider"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Text } from "@/components/ui/text"
import { registerUser } from "@/lib/hooks/registerUser"

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
    return (error as ErrorWithResponseData).response?.data?.error || "Signup failed. Please try again."
  }
  return "Signup failed. Please try again."
}

export function SignupPageView() {
  const [form, setForm] = useState<SignupFormState>({ name: "", email: "", password: "" })
  const [error, setError] = useState("")

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

    if (form.password.length < 6) {
      setError("Password must be at least 6 characters long")
      return
    }

    try {
      const registerData = await registerUser(form)
      if (!registerData) {
        setError("Signup failed. Please try again.")
        return
      }

      await signIn("credentials", {
        redirect: true,
        callbackUrl: "/",
        email: form.email,
        password: form.password,
      })
    } catch (signupError) {
      setError(resolveSignupError(signupError))
    }
  }

  return (
    <AuthCard
      title="Create new account"
      description="Join the app and build your own scouting workflow."
    >
      <form onSubmit={handleSignupSubmit} className="space-y-4">
        <Input
          name="name"
          type="text"
          placeholder="Name"
          required
          value={form.name}
          onChange={handleInputChange}
          inputSize="md"
        />
        <Input
          name="email"
          type="email"
          placeholder="Email"
          required
          value={form.email}
          onChange={handleInputChange}
          inputSize="md"
        />
        <Input
          name="password"
          type="password"
          placeholder="Password"
          required
          value={form.password}
          onChange={handleInputChange}
          inputSize="md"
        />
        <Button type="submit" variant="primary" size="md" fullWidth className="p-2.5">
          Signup
        </Button>
        {error && <Text tone="danger">{error}</Text>}
      </form>

      <AuthDivider />

      <Button
        type="button"
        onClick={() => signIn("google", { callbackUrl: "/" })}
        variant="outline"
        size="md"
        fullWidth
        className="space-x-2 border-slate-300 p-2.5 transition-colors duration-200 hover:border-slate-400 hover:bg-slate-50"
      >
        <Image
          src="/google-logo.png"
          width={20}
          height={20}
          className="mr-2 h-5 w-5"
          alt="Google logo"
        />
        <Text as="span" tone="muted" weight="medium">
          Register with Google
        </Text>
      </Button>

      <footer className="mt-5 flex w-full">
        <Text as="p" variant="body" tone="muted">
          Already have an account,{" "}
          <Link href="/login" className="font-semibold text-cyan-700 hover:underline">
            login
          </Link>
        </Text>
      </footer>
    </AuthCard>
  )
}
