"use client"

import { type ChangeEvent, type FormEvent, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { signIn } from "next-auth/react"
import { AuthCard } from "@/features/auth/components/AuthCard"
import { AuthDivider } from "@/features/auth/components/AuthDivider"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Text } from "@/components/ui/text"
import { useToast } from "@/lib/hooks/useToast"
import { getLoginAuthErrorMessage } from "@/features/auth/auth-errors"

interface LoginFormState {
  email: string
  password: string
}

export function LoginPageView() {
  const router = useRouter()
  const toast = useToast()
  const searchParams = useSearchParams()
  const [form, setForm] = useState<LoginFormState>({ email: "", password: "" })
  const [error, setError] = useState("")

  const callbackUrl = searchParams.get("callbackUrl") || "/"
  const providerError = getLoginAuthErrorMessage(searchParams.get("error"))

  const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target
    setForm((current) => ({ ...current, [name]: value }))
  }

  const handleCredentialsSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError("")

    const result = await signIn("credentials", {
      redirect: false,
      email: form.email,
      password: form.password,
    })

    if (result?.ok) {
      toast.success("Login successful")
      router.push(callbackUrl)
      return
    }

    setError("Invalid credentials")
  }

  const handleGoogleLogin = async () => {
    await signIn("google", { callbackUrl })
  }

  return (
    <AuthCard
      title="Login"
      description="Sign in to use compare, watchlists and full player profiles."
    >
      <form onSubmit={handleCredentialsSubmit} className="w-full space-y-4">
        <Input
          name="email"
          type="email"
          placeholder="Email"
          value={form.email}
          onChange={handleInputChange}
          inputSize="md"
        />
        <Input
          name="password"
          type="password"
          placeholder="Password"
          value={form.password}
          onChange={handleInputChange}
          inputSize="md"
        />
        <Button type="submit" variant="primary" size="md" fullWidth className="p-2.5">
          Login
        </Button>
        {(error || providerError) && <Text tone="danger">{error || providerError}</Text>}
      </form>

      <AuthDivider />

      <Button
        type="button"
        onClick={handleGoogleLogin}
        variant="outline"
        size="md"
        fullWidth
        className="space-x-2 border-stone-300 p-2.5 transition-colors duration-200 hover:border-stone-400 hover:bg-stone-50"
      >
        <Image
          src="/google-logo.png"
          width={20}
          height={20}
          className="mr-2 h-5 w-5"
          alt="Google logo"
        />
        <Text as="span" tone="muted" weight="medium">
          Login with Google
        </Text>
      </Button>

      <footer className="mt-5 flex w-full justify-center">
        <Text as="p" variant="body" tone="muted">
          Don&apos;t have an account?{" "}
          <Link href="/signup" className="font-semibold text-amber-700 hover:underline">
            Sign up
          </Link>
        </Text>
      </footer>
    </AuthCard>
  )
}
