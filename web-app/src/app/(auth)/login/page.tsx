import type { Metadata } from "next"
import { Suspense } from "react"
import { LoginPageView } from "@/features/auth/components/LoginPageView"
import { PageLoading } from "@/components/ui/page-loading"

export const metadata: Metadata = {
  title: "Sign In",
  description: "Sign in to access comparisons, watchlists, and account tools.",
}

export default function LoginPage() {
  return (
    <Suspense fallback={<PageLoading label="Loading Sign In…" />}>
      <LoginPageView />
    </Suspense>
  )
}
