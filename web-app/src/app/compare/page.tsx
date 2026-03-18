import { Suspense } from "react"
import { ComparePageView } from "@/features/compare/components/ComparePageView"

export default function ComparePage() {
  return (
    <Suspense
      fallback={<div className="px-4 py-10 text-center text-slate-600">Loading comparison...</div>}
    >
      <ComparePageView />
    </Suspense>
  )
}
