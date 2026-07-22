import type { Metadata } from "next"
import { LegalLayout } from "@/components/layout/legal-layout"
import { LEGAL } from "@/lib/legal"

export const metadata: Metadata = {
  title: "Terms of Service",
  description: `The terms that govern your use of ${LEGAL.appName}.`,
}

export default function TermsPage() {
  return (
    <LegalLayout
      title="Terms of Service"
      intro={`By creating an account or using ${LEGAL.appName}, you agree to these terms.`}
    >
      <section>
        <h2>1. The service</h2>
        <p>
          {LEGAL.appName} provides football player intelligence, comparison and recruitment tools via our website and
          mobile apps. Features may change, and we may add, modify or discontinue parts of the service over time.
        </p>
      </section>

      <section>
        <h2>2. Your account</h2>
        <ul>
          <li>You are responsible for keeping your login credentials secure.</li>
          <li>You must provide accurate information and be old enough to use the service in your country.</li>
          <li>You are responsible for activity that happens under your account.</li>
        </ul>
      </section>

      <section>
        <h2>3. Acceptable use</h2>
        <p>You agree not to:</p>
        <ul>
          <li>Break the law or infringe others&apos; rights while using the service.</li>
          <li>Attempt to disrupt, reverse-engineer, scrape at scale, or gain unauthorised access to the service.</li>
          <li>Misuse other users&apos; data or the content available in the app.</li>
        </ul>
      </section>

      <section>
        <h2>4. Content &amp; data</h2>
        <p>
          Player statistics and related information are aggregated from public sources and provided for informational
          purposes. We do not guarantee its accuracy or completeness. Content you create remains yours; you grant us
          the permissions needed to store and display it back to you as part of the service.
        </p>
      </section>

      <section>
        <h2>5. Disclaimer &amp; liability</h2>
        <p>
          The service is provided &quot;as is&quot; without warranties of any kind. To the maximum extent permitted by
          law, we are not liable for indirect or consequential damages arising from your use of the service.
        </p>
      </section>

      <section>
        <h2>6. Termination</h2>
        <p>
          You may stop using the service and delete your account at any time. We may suspend or terminate accounts
          that violate these terms or that we reasonably believe pose a security or legal risk.
        </p>
      </section>

      <section>
        <h2>7. Changes</h2>
        <p>
          We may update these terms; the &quot;Last updated&quot; date above reflects the latest version. Continued
          use after changes take effect constitutes acceptance.
        </p>
      </section>

      <section>
        <h2>8. Contact</h2>
        <p>
          Questions about these terms? Contact{" "}
          <a href={`mailto:${LEGAL.contactEmail}`}>{LEGAL.contactEmail}</a>.
        </p>
      </section>
    </LegalLayout>
  )
}
