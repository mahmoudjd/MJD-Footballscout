import { Suspense } from "react"
import { LoginPageView } from "@/features/auth/components/LoginPageView"

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="px-4 py-10 text-center text-slate-600">Loading login...</div>}>
      <LoginPageView />
    </Suspense>
  )
}
