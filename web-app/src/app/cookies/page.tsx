import type { Metadata } from "next"
import { LegalLayout } from "@/components/layout/legal-layout"
import { LEGAL } from "@/lib/legal"

export const metadata: Metadata = {
  title: "Cookie Policy",
  description: `Which cookies and local storage ${LEGAL.appName} uses and why.`,
}

// Keep in sync with: next-auth defaults (src/auth.ts), src/lib/cookies.ts and the
// device-ID key in src/features/auth/components/LoginPageView.tsx.
const ENTRIES = [
  {
    name: "next-auth.session-token",
    type: "Cookie (HttpOnly)",
    purpose: "Keeps you signed in (encrypted session).",
    duration: "Up to 30 days, or until sign-out",
  },
  {
    name: "next-auth.csrf-token",
    type: "Cookie (HttpOnly)",
    purpose: "Protects sign-in forms against cross-site request forgery.",
    duration: "Browser session",
  },
  {
    name: "next-auth.callback-url",
    type: "Cookie",
    purpose: "Returns you to the right page after sign-in.",
    duration: "Browser session",
  },
  {
    name: "mjd_help_seen_*",
    type: "Cookie",
    purpose: "Remembers which in-app guides you have already seen.",
    duration: "180 days",
  },
  {
    name: "mjd-login-device-id-v1",
    type: "Local storage",
    purpose: "Random device ID used to recognise this browser and detect sign-ins from new devices.",
    duration: "Until you clear site data",
  },
] as const

export default function CookiePolicyPage() {
  return (
    <LegalLayout
      title="Cookie Policy"
      intro={`${LEGAL.appName} uses only what is strictly necessary to run the service. We do not use advertising, analytics or tracking cookies, so you won't see a consent banner.`}
    >
      <section>
        <h2>1. What we store in your browser</h2>
        <p>
          All entries below are strictly necessary and therefore exempt from consent under § 25(2) No. 2 TDDDG /
          Art. 5(3) ePrivacy Directive. The legal basis for the related processing is Art. 6(1)(b) and (f) GDPR.
          On HTTPS the session cookies carry a <code>__Secure-</code> or <code>__Host-</code> prefix.
        </p>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[34rem] border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-emerald-950/15 text-emerald-950">
                <th className="py-2 pr-4 font-semibold">Name</th>
                <th className="py-2 pr-4 font-semibold">Type</th>
                <th className="py-2 pr-4 font-semibold">Purpose</th>
                <th className="py-2 font-semibold">Duration</th>
              </tr>
            </thead>
            <tbody>
              {ENTRIES.map((entry) => (
                <tr key={entry.name} className="border-b border-emerald-950/10 align-top">
                  <td className="py-2 pr-4 font-mono text-xs">{entry.name}</td>
                  <td className="py-2 pr-4">{entry.type}</td>
                  <td className="py-2 pr-4">{entry.purpose}</td>
                  <td className="py-2">{entry.duration}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p>All entries are first-party. None are shared with third parties.</p>
      </section>

      <section>
        <h2>2. Performance measurement</h2>
        <p>
          Vercel Speed Insights measures page load performance without setting cookies or storing anything on your
          device. See section 6 of our <a href="/privacy">Privacy Policy</a>.
        </p>
      </section>

      <section>
        <h2>3. Mobile apps</h2>
        <p>
          The iOS and Android apps use no cookies. Sign-in tokens are stored in the device&apos;s secure
          keychain/keystore and are removed when you sign out or uninstall the app.
        </p>
      </section>

      <section>
        <h2>4. Managing cookies</h2>
        <p>
          You can view, delete or block cookies and site data in your browser settings at any time. If you block
          the strictly necessary entries, you will not be able to sign in. More on how we handle your data:{" "}
          <a href="/privacy">Privacy Policy</a>.
        </p>
      </section>
    </LegalLayout>
  )
}
