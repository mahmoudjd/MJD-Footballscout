import type { Metadata } from "next"
import { ForgotPasswordPageView } from "@/features/account/components/ForgotPasswordPageView"

export const metadata: Metadata = {
  title: "Forgot Password",
  description: "Request a secure password reset link.",
}

export default function ForgotPasswordPage() {
  return <ForgotPasswordPageView />
}
