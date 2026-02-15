"use client"

import { useState } from "react"
import Link from "next/link"
import { registerUser } from "@/lib/hooks/register-user"
import { signIn } from "next-auth/react"
import Image from "next/image"

export default function SignupPage() {
  const [form, setForm] = useState({ name: "", email: "", password: "" })
  const [error, setError] = useState("")

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
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
    } catch (err: any) {
      setError(err?.response?.data?.error || "Signup failed. Please try again.")
    }
  }

  return (
    <div className="mx-auto mt-16 flex max-w-md flex-col items-center justify-center space-y-6 rounded-xl bg-white p-4 shadow-xl sm:p-8">
      <h2 className="text-2xl font-semibold">Create new account</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          name="name"
          type="text"
          placeholder="Name"
          required
          value={form.name}
          onChange={handleChange}
          className="w-full rounded border border-gray-300 p-2 transition-colors duration-200 hover:border-gray-400"
        />
        <input
          name="email"
          type="email"
          placeholder="Email"
          required
          value={form.email}
          onChange={handleChange}
          className="w-full rounded border border-gray-300 p-2 transition-colors duration-200 hover:border-gray-400"
        />
        <input
          name="password"
          type="password"
          placeholder="Password"
          required
          value={form.password}
          onChange={handleChange}
          className="w-full rounded border border-gray-300 p-2 transition-colors duration-200 hover:border-gray-400"
        />
        <button
          type="submit"
          className="w-full cursor-pointer rounded bg-cyan-600 p-2 text-white transition hover:bg-cyan-500"
        >
          Signup
        </button>
        {error && <p className="text-sm text-red-500">{error}</p>}
      </form>
      <div className="flex w-full items-center justify-between space-x-4">
        <hr className="flex-grow border-t border-gray-300" />
        <span className="text-sm text-gray-400">OR</span>
        <hr className="flex-grow border-t border-gray-300" />
      </div>
      <button
        type="button"
        onClick={() => signIn("google", { callbackUrl: "/" })}
        className="flex w-full cursor-pointer items-center justify-center space-x-2 rounded border border-gray-300 bg-white p-2 transition-colors duration-200 hover:border-gray-400 hover:bg-gray-100"
      >
        <Image
          src="/google-logo.png"
          width={20}
          height={20}
          className="mr-2 h-5 w-5"
          alt="google-logo"
        />
        <span className="text-sm font-medium text-gray-700">Register with Google</span>
      </button>

      <div className="flex w-full">
        <p>
          Already have an account,{" "}
          <Link href="/login" className="text-cyan-600 hover:underline">
            login
          </Link>
        </p>
      </div>
    </div>
  )
}
