import type { Metadata } from "next"
import { SignupPageView } from "@/features/auth/components/SignupPageView"

export const metadata: Metadata = {
  title: "Create Account",
  description: "Create your MJD Football Scout account.",
}

export default function SignupPage() {
  return <SignupPageView />
}
