"use client"

import { signIn } from "next-auth/react"
import { useRouter, useSearchParams } from "next/navigation"
import { useState } from "react"
import Link from "next/link"
import { useToast } from "@/lib/hooks/use-toast"
import Image from "next/image"

function mapAuthError(errorCode: string | null) {
  switch (errorCode) {
    case "GoogleAccountConflict":
      return "This email already exists with password login. Please sign in with email and password."
    case "GoogleNotConfigured":
      return "Google login is currently not configured."
    case "GoogleTokenMissing":
      return "Google authentication token is missing. Please try again."
    case "GoogleLoginError":
      return "Google login failed. Please try again."
    case "RefreshAccessTokenError":
      return "Your session expired. Please sign in again."
    default:
      return ""
  }
}

export default function LoginPage() {
  const router = useRouter()
  const toast = useToast()
  const [form, setForm] = useState({ email: "", password: "" })
  const [error, setError] = useState("")
  const searchParams = useSearchParams()
  const callbackUrl = searchParams.get("callbackUrl") || "/"
  const providerError = mapAuthError(searchParams.get("error"))

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const res = await signIn("credentials", {
      redirect: false,
      email: form.email,
      password: form.password,
    })

    if (res?.ok) {
      toast.success("Login successful")
      router.push(callbackUrl)
    } else {
      setError("Invalid credentials")
    }
  }

  const handleGoogleLogin = async () => {
    await signIn("google", { callbackUrl })
  }

  return (
    <div className="mx-auto mt-16 flex max-w-md flex-col items-center justify-center space-y-6 rounded-xl bg-white p-4 shadow-xl sm:p-8">
      <h2 className="mb-4 text-2xl font-semibold">Login</h2>

      <form onSubmit={handleSubmit} className="w-full space-y-4">
        <input
          name="email"
          type="email"
          placeholder="Email"
          value={form.email}
          onChange={handleChange}
          className="w-full rounded border border-gray-300 p-2 transition-colors duration-200 hover:border-gray-400"
        />
        <input
          name="password"
          type="password"
          placeholder="Password"
          value={form.password}
          onChange={handleChange}
          className="w-full rounded border border-gray-300 p-2 transition-colors duration-200 hover:border-gray-400"
        />
        <button
          type="submit"
          className="w-full cursor-pointer rounded bg-cyan-600 p-2 text-white transition hover:bg-cyan-500"
        >
          Login
        </button>
        {(error || providerError) && (
          <p className="text-sm text-red-500">{error || providerError}</p>
        )}
      </form>

      <div className="flex w-full items-center justify-between space-x-4">
        <hr className="flex-grow border-t border-gray-300" />
        <span className="text-sm text-gray-400">OR</span>
        <hr className="flex-grow border-t border-gray-300" />
      </div>

      <button
        type="button"
        onClick={handleGoogleLogin}
        className="flex w-full cursor-pointer items-center justify-center space-x-2 rounded border border-gray-300 bg-white p-2 transition-colors duration-200 hover:border-gray-400 hover:bg-gray-100"
      >
        <Image
          src="/google-logo.png"
          width={20}
          height={20}
          className="mr-2 h-5 w-5"
          alt="google-logo"
        />
        <span className="text-sm font-medium text-gray-700">Login with Google</span>
      </button>

      <div className="mt-4 flex w-full justify-center">
        <p>
          Don't have an account?{" "}
          <Link href="/signup" className="text-cyan-600 hover:underline">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  )
}
