"use client"

import { ReactNode, useState } from "react"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { Toaster } from "react-hot-toast"
import { SessionProvider } from "next-auth/react"
import SessionGuard from "@/features/auth/components/session-guard"

function shouldRetryQuery(failureCount: number, error: unknown) {
  const status =
    typeof error === "object" &&
    error !== null &&
    "response" in error &&
    typeof (error as { response?: { status?: number } }).response?.status === "number"
      ? (error as { response?: { status?: number } }).response?.status
      : undefined

  if (status && status >= 400 && status < 500 && status !== 429) {
    return false
  }

  return failureCount < 2
}

function createQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60_000,
        gcTime: 10 * 60_000,
        refetchOnWindowFocus: false,
        retry: shouldRetryQuery,
      },
      mutations: {
        retry: false,
      },
    },
  })
}

export function Providers({ children }: { children: ReactNode }) {
  // Per-instance, not module scope: on the server the module is shared by every
  // concurrent request, so a module-level client leaks cache between users.
  const [queryClient] = useState(createQueryClient)

  return (
    <SessionProvider>
      <QueryClientProvider client={queryClient}>
        <Toaster />
        <SessionGuard>{children}</SessionGuard>
      </QueryClientProvider>
    </SessionProvider>
  )
}
