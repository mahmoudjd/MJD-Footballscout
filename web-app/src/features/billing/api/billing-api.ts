import { apiClient } from "@/lib/hooks/apiClient"

export type BillingStatus = {
  premiumEnabled: boolean
  plan: "free" | "premium"
  status:
    | "inactive"
    | "trialing"
    | "active"
    | "past_due"
    | "canceled"
    | "unpaid"
    | "incomplete"
    | "incomplete_expired"
    | "paused"
  isPremium: boolean
  currentPeriodEnd: string | null
  cancelAtPeriodEnd: boolean
  canManageSubscription: boolean
}

export async function fetchBillingStatus() {
  const response = await apiClient.get<BillingStatus>("/billing/status")
  return response.data
}

export async function createCheckoutSession() {
  const response = await apiClient.post<{ url: string }>("/billing/checkout")
  return response.data.url
}

export async function createPortalSession() {
  const response = await apiClient.post<{ url: string }>("/billing/portal")
  return response.data.url
}
