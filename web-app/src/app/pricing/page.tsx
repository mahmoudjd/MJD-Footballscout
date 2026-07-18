import type { Metadata } from "next"
import { PricingPageView } from "@/features/billing/components/PricingPageView"

export const metadata: Metadata = {
  title: "Premium | MJD Football Scout",
  description: "Unlock Shadow Team and the Recruitment Workspace with MJD Scout Premium.",
}

type PricingPageProps = {
  searchParams: Promise<{ checkout?: string | string[] }>
}

export default async function PricingPage({ searchParams }: PricingPageProps) {
  const rawCheckout = (await searchParams).checkout
  const checkout = Array.isArray(rawCheckout) ? rawCheckout[0] : rawCheckout
  const checkoutResult = checkout === "success" || checkout === "cancelled" ? checkout : undefined
  return <PricingPageView checkoutResult={checkoutResult} />
}
