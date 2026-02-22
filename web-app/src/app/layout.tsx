import type { Metadata } from "next"
import "./globals.css"

import Header from "@/components/header/header"
import { MobileTabBar } from "@/components/header/mobile-tab-bar"
import { Footer } from "@/components/footer"
import { Providers } from "./providers"
import { getServerSession } from "next-auth"
import { authOptions } from "@/auth"
import { SpeedInsights } from "@vercel/speed-insights/next"

export const metadata: Metadata = {
  title: "MJD-FootballScout",
  description: "Discover, search, and manage football players with live web-sourced data.",
  icons: {
    icon: "/favicon.ico",
  },
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const session = await getServerSession(authOptions)
  return (
    <html lang="en">
      <body className="min-h-screen font-sans antialiased">
        <Providers session={session}>
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
