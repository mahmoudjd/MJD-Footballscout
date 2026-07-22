// Mirrors web-app/src/lib/legal.ts — keep the URLs in sync.
export const WEB_URL = "https://mjd-football-scout.vercel.app";

export const LEGAL_URLS = {
  privacy: `${WEB_URL}/privacy`,
  terms: `${WEB_URL}/terms`,
  cookies: `${WEB_URL}/cookies`,
  impressum: `${WEB_URL}/impressum`,
  deleteAccount: `${WEB_URL}/delete-account`,
} as const;
