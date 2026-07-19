import type { Metadata } from "next"
import { Suspense } from "react"
import { AccountProfilePageView } from "@/features/account/components/AccountProfilePageView"
import { PageLoading } from "@/components/ui/page-loading"

export const metadata: Metadata = {
  title: "Profile & Security",
  description: "Manage your profile, password, and account security.",
}

export default function AccountProfilePage() {
  return (
    <Suspense fallback={<PageLoading label="Loading Profile…" />}>
      <AccountProfilePageView />
    </Suspense>
  )
}
