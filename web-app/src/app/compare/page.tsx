import type { Metadata } from "next"
import { Suspense } from "react"
import { ComparePageView } from "@/features/compare/components/ComparePageView"
import { PageLoading } from "@/components/ui/page-loading"

export const metadata: Metadata = {
  title: "Compare Players",
  description: "Compare football players across key scouting metrics.",
}

export default function ComparePage() {
  return (
    <Suspense fallback={<PageLoading label="Loading Comparison…" />}>
      <ComparePageView />
    </Suspense>
  )
}
