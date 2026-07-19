import { useMutation, useQuery } from "@tanstack/react-query"
import {
  createCheckoutSession,
  createPortalSession,
  fetchBillingStatus,
} from "@/features/billing/api/billing-api"
import { queryKeys } from "@/lib/react-query/query-keys"

export function useBillingStatus(enabled = true, refetchWhilePending = false) {
  return useQuery({
    queryKey: queryKeys.billing.status,
    queryFn: fetchBillingStatus,
    enabled,
    staleTime: 30_000,
    refetchInterval: (query) =>
      refetchWhilePending && !query.state.data?.isPremium ? 2_000 : false,
  })
}

export function useBillingActions() {
  return {
    checkout: useMutation({ mutationFn: createCheckoutSession }),
    portal: useMutation({ mutationFn: createPortalSession }),
  }
}
