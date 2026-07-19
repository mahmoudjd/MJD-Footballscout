import type { Metadata } from "next"
import { Suspense } from "react"
import { ResetPasswordPageView } from "@/features/account/components/ResetPasswordPageView"
import { PageLoading } from "@/components/ui/page-loading"

export const metadata: Metadata = {
  title: "Reset Password",
  description: "Choose a new secure account password.",
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<PageLoading label="Loading Password Reset…" />}>
      <ResetPasswordPageView />
    </Suspense>
  )
}
