import type { Metadata } from "next"
import "./globals.css"

import Header from "@/components/layout/header/header"
import { MobileTabBar } from "@/components/layout/header/mobile-tab-bar"
import { Footer } from "@/components/layout/footer"
import { Providers } from "./providers"
import { SpeedInsights } from "@vercel/speed-insights/next"

export const metadata: Metadata = {
  title: "MJD-FootballScout",
  description: "Discover, search, and manage football players with live web-sourced data.",
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
        <Providers>
          <Header />
          <main className="min-h-[calc(100vh-7.5rem)] pb-28 md:pb-0">{children}</main>
          <MobileTabBar />
          <Footer />
        </Providers>
        <SpeedInsights />
      </body>
    </html>
  )
}
