import type { Metadata } from "next"
import { LegalLayout } from "@/components/layout/legal-layout"
import { IMPRESSUM, LEGAL } from "@/lib/legal"

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: `How ${LEGAL.appName} collects, uses and protects your data across web, iOS and Android.`,
}

export default function PrivacyPolicyPage() {
  return (
    <LegalLayout
      title="Privacy Policy"
      intro={`This policy (Datenschutzerklärung) explains what personal data ${LEGAL.appName} ("we", "us") processes on our website and in our iOS/Android apps, why, for how long, and which rights you have under the GDPR.`}
    >
      <section>
        <h2>1. Data controller</h2>
        <p>
          {IMPRESSUM.name}
          <br />
          {IMPRESSUM.street}, {IMPRESSUM.postalCity}, {IMPRESSUM.country}
          <br />
          E-mail: <a href={`mailto:${IMPRESSUM.email}`}>{IMPRESSUM.email}</a>
        </p>
        <p>
          We are not required to appoint a data protection officer. For all privacy questions and requests, contact
          us at the address above.
        </p>
      </section>

      <section>
        <h2>2. Visiting the website without an account</h2>
        <p>
          When you open our website, your browser automatically sends technical data to our hosting provider:
          IP address, date and time, requested page, referrer, browser and operating system. This is necessary to
          deliver the site, keep it secure and defend against attacks.
        </p>
        <ul>
          <li>
            <strong>Legal basis:</strong> Art. 6(1)(f) GDPR (legitimate interest in a secure, working service).
          </li>
          <li>
            <strong>Retention:</strong> hosting logs are kept by the provider for a short period (typically a few
            days to 30 days) and then deleted. IP addresses used for rate limiting are held in memory only for the
            duration of the limit window.
          </li>
        </ul>
        <p>
          Player photos and club images are delivered through our own server (image optimisation), so your browser
          does not connect directly to the original image sources.
        </p>
      </section>

      <section>
        <h2>3. Your account</h2>
        <h3>Account data</h3>
        <ul>
          <li>Name and email address.</li>
          <li>A password hash (bcrypt). We never store your password in plain text.</li>
          <li>If you sign in with Google: your Google account email, name and Google user ID.</li>
          <li>Email verification status and your notification preferences.</li>
        </ul>
        <h3>Content you create</h3>
        <ul>
          <li>Watchlists, recruitment pipelines, shadow-team boards, scouting reports and notes.</li>
        </ul>
        <ul>
          <li>
            <strong>Legal basis:</strong> Art. 6(1)(b) GDPR (performance of the contract: providing the account and
            the features you use).
          </li>
          <li>
            <strong>Retention:</strong> until you delete your account.
          </li>
        </ul>
        <p>
          Providing this data is voluntary, but without an email address and password (or Google login) we cannot
          create an account for you.
        </p>
      </section>

      <section>
        <h2>4. Sign-in security</h2>
        <ul>
          <li>
            <strong>Sessions:</strong> after sign-in we issue an access token (valid for 1 hour) and a refresh token
            (valid for 7 days). Expired sessions are deleted automatically.
          </li>
          <li>
            <strong>Device recognition:</strong> to detect logins from new devices, we store for each of your last
            10 devices: a hashed device fingerprint, a device label (e.g. &quot;Chrome on macOS&quot;), the IP
            address, an approximate location (city/country derived from the IP address) and the first/last sign-in
            time. If we see a new device or location, we send you a security email.
          </li>
          <li>
            <strong>Two-factor authentication (optional):</strong> an encrypted authenticator secret and hashed
            recovery codes.
          </li>
          <li>
            <strong>On mobile:</strong> tokens are stored in the device&apos;s secure keychain/keystore. Face&nbsp;ID
            / fingerprint unlock is handled entirely by your device; we never receive biometric data.
          </li>
        </ul>
        <ul>
          <li>
            <strong>Legal basis:</strong> Art. 6(1)(b) GDPR (secure provision of your account) and Art. 6(1)(f) GDPR
            (legitimate interest in preventing account takeover and abuse).
          </li>
          <li>
            <strong>Retention:</strong> device entries are replaced as new devices are added (max. 10) and are
            deleted together with your account.
          </li>
        </ul>
        <p>
          You can disable security emails in your account settings. We recommend keeping them on.
        </p>
      </section>

      <section>
        <h2>5. Emails</h2>
        <ul>
          <li>
            <strong>Account &amp; security emails</strong> — verification, password reset, password/MFA changes,
            account deactivation and new sign-in alerts. Legal basis: Art. 6(1)(b) and (f) GDPR.
          </li>
          <li>
            <strong>Onboarding tips</strong> — a few emails after sign-up with tips on using {LEGAL.appName}&apos;s
            features. Legal basis: Art. 6(1)(f) GDPR (legitimate interest in helping you use the service). You can
            turn these off at any time in your account settings or by replying to the email.
          </li>
        </ul>
        <p>We do not send newsletters or third-party advertising.</p>
      </section>

      <section>
        <h2>6. Performance measurement</h2>
        <p>
          On the website we use <strong>Vercel Speed Insights</strong> to measure loading performance (Core Web
          Vitals such as page load time). It sets no cookies, stores nothing on your device and does not create
          cross-site profiles. Data is collected in aggregated form together with the page URL, device type and
          browser.
        </p>
        <ul>
          <li>
            <strong>Legal basis:</strong> Art. 6(1)(f) GDPR (legitimate interest in a fast, stable website).
          </li>
        </ul>
        <p>
          We do <strong>not</strong> use advertising, tracking or social-media pixels, and we do not sell your data.
        </p>
      </section>

      <section>
        <h2>7. Contacting us</h2>
        <p>
          If you email us, we process your email address and message to answer your request (Art. 6(1)(b) or (f)
          GDPR) and delete it once the matter is resolved, unless statutory retention periods apply.
        </p>
      </section>

      <section>
        <h2>8. Service providers (processors)</h2>
        <p>
          We use the following providers, bound by data processing agreements under Art. 28 GDPR:
        </p>
        <ul>
          <li>
            <strong>Vercel Inc.</strong> (USA) — website hosting, image optimisation, Speed Insights.
          </li>
          <li>
            <strong>Render Services, Inc.</strong> (USA) — API/backend hosting.
          </li>
          <li>
            <strong>MongoDB, Inc.</strong> (MongoDB Atlas, USA) — database hosting for your account and content.
          </li>
          <li>
            <strong>Resend</strong> (Plus Five Five, Inc., USA) — delivery of transactional emails.
          </li>
          <li>
            <strong>Google Ireland Ltd. / Google LLC</strong> — Google Sign-In, only if you choose to sign in with
            Google. Google&apos;s own privacy policy applies:{" "}
            <a href="https://policies.google.com/privacy" target="_blank" rel="noreferrer">
              policies.google.com/privacy
            </a>
            .
          </li>
        </ul>
      </section>

      <section>
        <h2>9. Transfers outside the EU</h2>
        <p>
          Some providers above are based in the USA or may process data there. Transfers are based on the EU
          Commission&apos;s adequacy decision for the EU–US Data Privacy Framework (Art. 45 GDPR) where the provider
          is certified, and otherwise on the EU Standard Contractual Clauses (Art. 46(2)(c) GDPR).
        </p>
      </section>

      <section>
        <h2>10. Cookies and local storage</h2>
        <p>
          We only use strictly necessary cookies and storage (sign-in, security, remembering dismissed guides). No
          consent banner is required for these (§ 25(2) TDDDG). Details are in our{" "}
          <a href="/cookies">Cookie Policy</a>.
        </p>
      </section>

      <section>
        <h2>11. Your rights</h2>
        <p>Under the GDPR you have the right to:</p>
        <ul>
          <li>access your data (Art. 15),</li>
          <li>rectification (Art. 16),</li>
          <li>erasure (Art. 17),</li>
          <li>restriction of processing (Art. 18),</li>
          <li>data portability (Art. 20),</li>
          <li>
            <strong>object</strong> at any time, on grounds relating to your particular situation, to processing
            based on Art. 6(1)(f) GDPR (Art. 21),
          </li>
          <li>withdraw any consent you have given, with effect for the future (Art. 7(3)).</li>
        </ul>
        <p>
          Many of these you can exercise directly in the app (edit profile, notification settings, delete account).
          For everything else, email <a href={`mailto:${LEGAL.contactEmail}`}>{LEGAL.contactEmail}</a>.
        </p>
        <p>
          <strong>Deleting your account:</strong> open <em>My Account → Danger zone</em> in the app, or follow the
          steps at <a href="/delete-account">{LEGAL.webUrl}/delete-account</a>. Your profile, content and device
          entries are then deleted. Backups held by our database provider are overwritten on a rolling basis.
        </p>
        <p>
          <strong>Right to lodge a complaint:</strong> you may complain to any data protection supervisory
          authority. The authority responsible for us is the{" "}
          <a href="https://www.datenschutz.saarland.de" target="_blank" rel="noreferrer">
            Unabhängiges Datenschutzzentrum Saarland
          </a>
          , Fritz-Dobisch-Straße 12, 66111 Saarbrücken.
        </p>
      </section>

      <section>
        <h2>12. No automated decision-making</h2>
        <p>
          We do not use automated decision-making or profiling within the meaning of Art. 22 GDPR. Player ratings
          and scores in the app relate to football players, not to you.
        </p>
      </section>

      <section>
        <h2>13. Children</h2>
        <p>
          {LEGAL.appName} is not directed to children under 16, and we do not knowingly collect their data. If you
          believe a child has given us personal data, please contact us and we will delete it.
        </p>
      </section>

      <section>
        <h2>14. Security</h2>
        <p>
          We use TLS encryption in transit, hashed passwords, encrypted 2FA secrets, rate limiting and secure
          on-device token storage. No system is perfectly secure, but we work to protect your data and respond
          promptly to incidents.
        </p>
      </section>

      <section>
        <h2>15. Changes to this policy</h2>
        <p>
          We update this policy when our service or the law changes. The current version always shows the
          &quot;Last updated&quot; date above; material changes are also announced in the app.
        </p>
      </section>
    </LegalLayout>
  )
}
