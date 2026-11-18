// Single source of truth for legal / store metadata.
// Referenced by the Privacy, Terms and Account-deletion pages, the footer,
// and mirrored by mobile-app/src/constants/legal.ts.
export const LEGAL = {
  appName: "MJD Football Scout",
  // Production web origin — also the Universal Link / App Link domain.
  webUrl: "https://mjd-football-scout.vercel.app",
  // Data-protection / support contact shown in the policies (store requirement).
  contactEmail: "info@mjd-apps.com",
  // Last substantive update to the policies (YYYY-MM-DD).
  effectiveDate: "2026-10-08",
} as const

// Impressum / legal-notice details (§ 5 DDG, § 18 MStV — mandatory in Germany).
// Also the data controller named in the privacy policy (Art. 13(1)(a) GDPR).
// A "ladungsfähige Anschrift" (real physical address, no P.O. box) is legally required.
export const IMPRESSUM = {
  name: "Mahmoud Al Jarad",
  street: "Heuduckstr. 43",
  postalCity: "66117 Saarbrücken",
  country: "Deutschland",
  email: LEGAL.contactEmail,
  phone: "", // optional, e.g. "+49 ..." — leave "" to hide
  vatId: "", // optional USt-IdNr (§ 27a UStG) — leave "" to hide
} as const

export const LEGAL_URLS = {
  privacy: `${LEGAL.webUrl}/privacy`,
  terms: `${LEGAL.webUrl}/terms`,
  deleteAccount: `${LEGAL.webUrl}/delete-account`,
} as const
