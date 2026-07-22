// Single source of truth for legal / store metadata.
// Referenced by the Privacy, Terms and Account-deletion pages, the footer,
// and mirrored by mobile-app/src/constants/legal.ts.
export const LEGAL = {
  appName: "MJD Football Scout",
  // Production web origin — also the Universal Link / App Link domain.
  webUrl: "https://mjd-football-scout.vercel.app",
  // Data-protection / support contact shown in the policies (store requirement).
  contactEmail: "info@mjd-apps.com",
  // Legal entity or operator name. TODO: replace with your registered name/company if applicable.
  operator: "MJD Football Scout",
  // Last substantive update to the policies (YYYY-MM-DD).
  effectiveDate: "2026-07-22",
} as const

// Impressum / legal-notice details (§ 5 DDG, § 18 MStV — mandatory in Germany).
// A "ladungsfähige Anschrift" (real physical address, no P.O. box) is legally required.
// TODO: replace every placeholder below with your real details before publishing.
export const IMPRESSUM = {
  name: "[DEIN VOLLSTÄNDIGER NAME]",
  street: "[STRASSE HAUSNUMMER]",
  postalCity: "[PLZ ORT]",
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
