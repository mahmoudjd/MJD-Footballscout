"use client"

import { useEffect } from "react"
import Link from "next/link"
import Script from "next/script"
import { usePathname } from "next/navigation"
import { useSession } from "next-auth/react"
import { OutlineIcons } from "@/components/icons/outline-icons"
import { appShellWidthClassName } from "@/components/ui/page-container"
import { Text } from "@/components/ui/text"
import { env } from "@/env"
import { cn } from "@/lib/cn"

const adFreeRoutes = [
  "/login",
  "/signup",
  "/forgot-password",
  "/reset-password",
  "/verify-email",
  "/profile",
  "/shadow-team",
  "/recruitment",
]

function isAdFreeRoute(pathname: string) {
  return adFreeRoutes.some((route) => pathname === route || pathname.startsWith(`${route}/`))
}

function HouseAd() {
  return (
    <div className="grid gap-4 rounded-3xl border border-emerald-950/10 bg-linear-to-r from-emerald-950 via-emerald-900 to-emerald-800 p-4 text-white shadow-[0_22px_44px_-30px_rgba(6,78,59,0.68)] sm:grid-cols-[auto_minmax(0,1fr)_auto] sm:items-center sm:p-5">
      <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-lime-300 text-emerald-950">
        <OutlineIcons.SparklesIcon className="h-5 w-5" aria-hidden="true" />
      </span>
      <div>
        <Text
          as="p"
          variant="caption"
          tone="inherit"
          className="font-bold tracking-widest text-lime-200 uppercase"
        >
          MJD Scout promotion
        </Text>
        <Text as="p" variant="body" weight="bold" tone="inherit" className="mt-1">
          Plan your next transfer window like a pro.
        </Text>
        <Text as="p" variant="caption" tone="inherit" className="mt-1 text-emerald-100/80">
          Squad Builder and the Recruitment Workspace are free for every scout.
        </Text>
      </div>
      <Link
        href="/recruitment"
        className="inline-flex min-h-10 items-center justify-center rounded-xl bg-lime-300 px-4 py-2 text-sm font-bold text-emerald-950 transition-colors hover:bg-lime-200 focus-visible:ring-2 focus-visible:ring-lime-200 focus-visible:ring-offset-2 focus-visible:ring-offset-emerald-900 focus-visible:outline-none"
      >
        Explore the tools
      </Link>
    </div>
  )
}

function AdSenseUnit({ clientId, slotId }: { clientId: string; slotId: string }) {
  useEffect(() => {
    const adWindow = window as typeof window & { adsbygoogle?: Record<string, never>[] }
    adWindow.adsbygoogle = adWindow.adsbygoogle ?? []
    adWindow.adsbygoogle.push({})
  }, [])

  return (
    <div className="overflow-hidden rounded-3xl border border-emerald-950/8 bg-white px-3 py-2 shadow-[0_18px_38px_-30px_rgba(15,50,36,0.38)]">
      <Text
        as="p"
        variant="caption"
        tone="muted"
        className="mb-1 text-center text-[10px] tracking-widest uppercase"
      >
        Advertisement
      </Text>
      <ins
        className="adsbygoogle block min-h-[90px] w-full"
        data-ad-client={clientId}
        data-ad-slot={slotId}
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
    </div>
  )
}

export function FreeTierAdPlacement() {
  const pathname = usePathname()
  const { status: sessionStatus } = useSession()
  const shouldShow = !isAdFreeRoute(pathname) && sessionStatus !== "loading"

  if (!shouldShow) return null

  const clientId = env.NEXT_PUBLIC_ADSENSE_CLIENT_ID
  const slotId = env.NEXT_PUBLIC_ADSENSE_FOOTER_SLOT_ID
  const externalAdsReady =
    env.NEXT_PUBLIC_ADSENSE_ENABLED &&
    env.NEXT_PUBLIC_ADSENSE_CONSENT_READY &&
    Boolean(clientId && slotId)

  return (
    <aside
      aria-label="Free plan advertising"
      className={cn("mx-auto w-full px-4 pb-8 sm:px-6 lg:px-8", appShellWidthClassName)}
    >
      {externalAdsReady && clientId && slotId ? (
        <>
          <Script
            id="google-adsense"
            src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${clientId}`}
            strategy="afterInteractive"
            crossOrigin="anonymous"
          />
          <AdSenseUnit clientId={clientId} slotId={slotId} />
        </>
      ) : (
        <HouseAd />
      )}
    </aside>
  )
}
