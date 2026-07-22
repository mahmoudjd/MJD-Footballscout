import { ReactNode } from "react"
import Link from "next/link"
import { LEGAL } from "@/lib/legal"

// Shared wrapper for the static legal pages (privacy / terms / delete-account).
// Plain semantic HTML styled to the app's stone/emerald palette — no prose plugin needed.
export function LegalLayout({
  title,
  intro,
  children,
}: {
  title: string
  intro?: string
  children: ReactNode
}) {
  const updated = new Date(LEGAL.effectiveDate).toLocaleDateString("en-GB", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
      <nav className="mb-8 text-sm">
        <Link
          href="/"
          className="font-semibold text-emerald-800 hover:text-emerald-900 focus-visible:ring-2 focus-visible:ring-lime-500 focus-visible:outline-none"
        >
          ← {LEGAL.appName}
        </Link>
      </nav>

      <header className="mb-8 border-b border-emerald-950/10 pb-6">
        <h1 className="text-3xl font-black tracking-tight text-emerald-950">{title}</h1>
        <p className="mt-2 text-sm text-stone-500">Last updated: {updated}</p>
        {intro ? <p className="mt-4 text-base leading-relaxed text-stone-700">{intro}</p> : null}
      </header>

      <div
        className={[
          "space-y-6 text-[15px] leading-relaxed text-stone-700",
          "[&_h2]:mt-8 [&_h2]:text-xl [&_h2]:font-bold [&_h2]:text-emerald-950",
          "[&_h3]:mt-4 [&_h3]:text-base [&_h3]:font-semibold [&_h3]:text-emerald-900",
          "[&_a]:font-semibold [&_a]:text-emerald-800 [&_a]:underline hover:[&_a]:text-emerald-900",
          "[&_ul]:list-disc [&_ul]:space-y-1.5 [&_ul]:pl-6",
          "[&_strong]:font-semibold [&_strong]:text-emerald-950",
        ].join(" ")}
      >
        {children}
      </div>

      <footer className="mt-12 border-t border-emerald-950/10 pt-6 text-sm text-stone-500">
        <p>
          Questions? Contact{" "}
          <a href={`mailto:${LEGAL.contactEmail}`} className="font-semibold text-emerald-800 underline">
            {LEGAL.contactEmail}
          </a>
          .
        </p>
        <nav className="mt-3 flex flex-wrap gap-4">
          <Link href="/privacy" className="hover:text-emerald-900">
            Privacy
          </Link>
          <Link href="/terms" className="hover:text-emerald-900">
            Terms
          </Link>
          <Link href="/cookies" className="hover:text-emerald-900">
            Cookies
          </Link>
          <Link href="/impressum" className="hover:text-emerald-900">
            Impressum
          </Link>
          <Link href="/delete-account" className="hover:text-emerald-900">
            Delete account
          </Link>
        </nav>
      </footer>
    </main>
  )
}
