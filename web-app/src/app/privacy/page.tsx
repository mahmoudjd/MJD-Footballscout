import type { Metadata } from "next"
import { LegalLayout } from "@/components/layout/legal-layout"
import { LEGAL } from "@/lib/legal"

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: `How ${LEGAL.appName} collects, uses and protects your data across web, iOS and Android.`,
}

export default function PrivacyPolicyPage() {
  return (
    <LegalLayout
      title="Privacy Policy"
      intro={`This policy explains what data ${LEGAL.appName} ("we", "us") collects across our website and iOS/Android apps, why we collect it, and the choices you have.`}
    >
      <section>
        <h2>1. Data we collect</h2>
        <h3>Account information</h3>
        <ul>
          <li>Your name and email address.</li>
          <li>A securely hashed password (we never store your password in plain text).</li>
          <li>If you sign in with Google: your Google account email, name and Google user ID.</li>
        </ul>
        <h3>Authentication &amp; security</h3>
        <ul>
          <li>Session tokens used to keep you signed in. On mobile these are stored in the device&apos;s secure keychain/keystore and can be protected by Face&nbsp;ID / fingerprint.</li>
          <li>If you enable two-factor authentication (2FA): an encrypted authenticator secret and hashed recovery codes.</li>
          <li>Sign-in context (such as approximate device/browser and time) used to detect new-device logins and send you security alerts.</li>
        </ul>
        <h3>Content you create</h3>
        <ul>
          <li>Watchlists, recruitment pipelines, squad/shadow-team boards and scouting reports you add within the app.</li>
          <li>Notification and account preferences.</li>
        </ul>
        <h3>Technical data</h3>
        <ul>
          <li>A random device identifier generated at sign-in to help secure your account.</li>
          <li>Standard server logs (e.g. request metadata) for reliability and abuse prevention.</li>
        </ul>
      </section>

      <section>
        <h2>2. How we use your data</h2>
        <ul>
          <li>To create and secure your account and keep you signed in.</li>
          <li>To provide the scouting features you use and store the content you create.</li>
          <li>To send transactional and security emails (e.g. verification, password reset, new-device alerts). You can disable non-essential emails in your account settings.</li>
          <li>To detect, prevent and investigate abuse, fraud and security incidents.</li>
        </ul>
        <p>
          We do <strong>not</strong> sell your personal data.
        </p>
      </section>

      <section>
        <h2>3. Legal bases (EU/EEA &amp; UK — GDPR)</h2>
        <p>We process your personal data on the following legal bases under Art. 6(1) GDPR:</p>
        <ul>
          <li>
            <strong>Contract (Art. 6(1)(b))</strong> — to create your account and provide the features you use.
          </li>
          <li>
            <strong>Legitimate interests (Art. 6(1)(f))</strong> — to secure accounts, prevent abuse and keep the
            service reliable.
          </li>
          <li>
            <strong>Consent (Art. 6(1)(a))</strong> — for optional advertising cookies (see section&nbsp;4). You can
            withdraw consent at any time.
          </li>
          <li>
            <strong>Legal obligation (Art. 6(1)(c))</strong> — where we must retain limited records.
          </li>
        </ul>
      </section>

      <section>
        <h2>4. Advertising</h2>
        <p>
          Our <strong>website</strong> may display ads via Google AdSense. Google may use cookies and device
          identifiers to serve and measure ads. Where required, we ask for your consent first, and you can manage ad
          personalisation through your Google account and your browser settings. Our mobile apps do not use
          third-party advertising SDKs to track you.
        </p>
      </section>

      <section>
        <h2>5. Third-party services (processors)</h2>
        <p>We share data only with providers that help us operate the service:</p>
        <ul>
          <li>
            <strong>Google Sign-In</strong> — authentication (only if you choose Google login).
          </li>
          <li>
            <strong>MongoDB Atlas</strong> — database hosting for your account and content.
          </li>
          <li>
            <strong>Render</strong> and <strong>Vercel</strong> — application and website hosting.
          </li>
          <li>
            <strong>Resend</strong> — delivery of transactional and security emails.
          </li>
          <li>
            <strong>Google AdSense</strong> — website advertising (see section&nbsp;3).
          </li>
        </ul>
      </section>

      <section>
        <h2>6. Data retention</h2>
        <p>
          We keep your account data while your account is active. When you delete your account, we remove your
          personal profile data and the content associated with it, except where we must retain limited records to
          comply with legal obligations or resolve disputes. Backups are rotated on a rolling basis.
        </p>
      </section>

      <section>
        <h2>7. Your rights</h2>
        <p>
          Depending on your location (e.g. under the GDPR or CCPA), you may have the right to access, correct, export
          or delete your personal data, and to object to or restrict certain processing. You can exercise most of
          these directly in the app (edit your profile, manage preferences, delete your account) or by contacting us.
        </p>
        <p>
          <strong>Deleting your account:</strong> open <em>My Account → Danger zone</em> in the app, or follow the
          steps at{" "}
          <a href={`${LEGAL.webUrl}/delete-account`}>{LEGAL.webUrl}/delete-account</a>.
        </p>
        <p>
          <strong>Right to complain:</strong> if you are in the EU/EEA or UK, you have the right to lodge a complaint
          with your local data protection supervisory authority.
        </p>
      </section>

      <section>
        <h2>8. Children</h2>
        <p>
          {LEGAL.appName} is not directed to children under 13 (or the minimum age required in your country), and we
          do not knowingly collect their data.
        </p>
      </section>

      <section>
        <h2>9. Security</h2>
        <p>
          We use encryption in transit, hashed passwords, encrypted 2FA secrets and secure on-device token storage.
          No system is perfectly secure, but we work to protect your data and to respond promptly to incidents.
        </p>
      </section>

      <section>
        <h2>10. Changes to this policy</h2>
        <p>
          We may update this policy from time to time. Material changes will be reflected by the &quot;Last
          updated&quot; date above and, where appropriate, communicated in the app.
        </p>
      </section>

      <section>
        <h2>11. Data controller &amp; contact</h2>
        <p>
          The data controller responsible for processing is identified in our{" "}
          <a href="/impressum">Impressum</a>. For privacy questions or requests, contact us at{" "}
          <a href={`mailto:${LEGAL.contactEmail}`}>{LEGAL.contactEmail}</a>.
        </p>
      </section>
    </LegalLayout>
  )
}
