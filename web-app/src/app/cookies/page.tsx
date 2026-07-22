import type { Metadata } from "next"
import { LegalLayout } from "@/components/layout/legal-layout"
import { LEGAL } from "@/lib/legal"

export const metadata: Metadata = {
  title: "Cookie Policy",
  description: `Which cookies and local storage ${LEGAL.appName} uses and why.`,
}

export default function CookiePolicyPage() {
  return (
    <LegalLayout
      title="Cookie Policy"
      intro={`${LEGAL.appName} keeps cookies to a minimum. This page explains what we store in your browser and why.`}
    >
      <section>
        <h2>1. Strictly necessary (no consent required)</h2>
        <p>
          These are required for the service to work and are exempt from consent under Art. 5(3) ePrivacy / § 25(2)
          TDDDG:
        </p>
        <ul>
          <li>
            <strong>Session cookie</strong> — keeps you signed in (set by our authentication layer, HttpOnly).
          </li>
          <li>
            <strong>Device identifier</strong> (browser local storage) — a random ID that helps secure your account
            and detect new-device logins.
          </li>
          <li>
            <strong>Help/onboarding flags</strong> — remember which in-app guides you have already seen.
          </li>
        </ul>
      </section>

      <section>
        <h2>2. Advertising (consent required, only if enabled)</h2>
        <p>
          Our website can optionally show ads via <strong>Google AdSense</strong>. When advertising is active in your
          region, Google may set cookies or read device identifiers to serve and measure ads. In the EU/EEA and the
          UK these are only set <strong>after you consent</strong> via our consent banner, which you can change or
          withdraw at any time. If you do not consent, no advertising cookies are stored.
        </p>
      </section>

      <section>
        <h2>3. Managing cookies</h2>
        <p>
          You can delete or block cookies in your browser settings. Blocking strictly necessary cookies may prevent
          you from signing in. For details on the data we process, see our <a href="/privacy">Privacy Policy</a>.
        </p>
      </section>
    </LegalLayout>
  )
}
