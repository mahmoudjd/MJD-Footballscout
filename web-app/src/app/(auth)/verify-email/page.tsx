import type { Metadata } from "next"
import { Suspense } from "react"
import { VerifyEmailPageView } from "@/features/account/components/VerifyEmailPageView"
import { PageLoading } from "@/components/ui/page-loading"

export const metadata: Metadata = {
  title: "Verify Email",
  description: "Activate your MJD Football Scout account.",
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<PageLoading label="Loading Verification…" />}>
      <VerifyEmailPageView />
    </Suspense>
  )
}
