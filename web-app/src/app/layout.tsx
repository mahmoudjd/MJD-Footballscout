import type { Metadata } from "next"
import "./globals.css"

import Header from "@/components/layout/header/header"
import { MobileTabBar } from "@/components/layout/header/mobile-tab-bar"
import { Footer } from "@/components/layout/footer"
import { Providers } from "./providers"
import { SpeedInsights } from "@vercel/speed-insights/next"
import { FreeTierAdPlacement } from "@/features/advertising/components/FreeTierAdPlacement"

export const metadata: Metadata = {
  title: {
    default: "MJD Football Scout",
    template: "%s | MJD Football Scout",
  },
  description: "Scout, compare, and organize football talent with live player intelligence.",
  icons: {
    icon: "/favicon.ico",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen font-sans antialiased">
        <a
          href="#main-content"
          className="fixed top-3 left-3 z-[100] -translate-y-20 rounded-xl bg-emerald-950 px-4 py-2.5 text-sm font-bold text-white shadow-xl transition-transform focus:translate-y-0"
        >
          Skip to Content
        </a>
        <Providers>
          <Header />
          <main id="main-content" className="min-h-[calc(100vh-7.5rem)] pb-28 md:pb-0">
            {children}
          </main>
          <FreeTierAdPlacement />
          <MobileTabBar />
          <Footer />
        </Providers>
        <SpeedInsights />
      </body>
    </html>
  )
}
