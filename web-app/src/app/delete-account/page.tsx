import type { Metadata } from "next"
import { LegalLayout } from "@/components/layout/legal-layout"
import { LEGAL } from "@/lib/legal"

export const metadata: Metadata = {
  title: "Delete your account",
  description: `How to delete your ${LEGAL.appName} account and what data is removed.`,
}

// Public account-deletion instructions. Google Play requires a reachable
// deletion URL (even for signed-out visitors); Apple requires in-app deletion,
// which lives under My Account → Danger zone.
export default function DeleteAccountPage() {
  return (
    <LegalLayout
      title="Delete your account"
      intro={`You can permanently delete your ${LEGAL.appName} account and associated data at any time.`}
    >
      <section>
        <h2>Delete from within the app (fastest)</h2>
        <ul>
          <li>Open the app (iOS, Android or web) and sign in.</li>
          <li>
            Go to <strong>More → My Account → Danger zone</strong>.
          </li>
          <li>
            Choose <strong>Deactivate / delete account</strong> and confirm.
          </li>
        </ul>
      </section>

      <section>
        <h2>Delete by email</h2>
        <p>
          If you can no longer sign in, email{" "}
          <a href={`mailto:${LEGAL.contactEmail}?subject=Account%20deletion%20request`}>{LEGAL.contactEmail}</a> from
          the address on your account and request deletion. We may ask you to verify ownership before proceeding.
        </p>
      </section>

      <section>
        <h2>What gets deleted</h2>
        <ul>
          <li>Your profile (name, email, authentication and 2FA data).</li>
          <li>Your watchlists, recruitment pipelines, squad boards and scouting reports.</li>
          <li>Your notification and account preferences.</li>
        </ul>
        <p>
          Limited records may be retained only where required to comply with legal obligations or to prevent abuse.
          Backups are purged on a rolling schedule. See our <a href="/privacy">Privacy Policy</a> for details.
        </p>
      </section>
    </LegalLayout>
  )
}
