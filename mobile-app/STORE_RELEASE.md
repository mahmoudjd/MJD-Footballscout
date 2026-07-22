# Store Release — MJD Football Scout

What is wired up in the repo, and the few values only you can provide.

## ✅ Done in code

- **Legal pages** (web-app): `/privacy`, `/terms`, `/cookies`, `/impressum`, `/delete-account`.
  Central config: `web-app/src/lib/legal.ts` (mirrored by `mobile-app/src/constants/legal.ts`).
  Privacy policy includes GDPR legal bases (Art. 6), the right to complain to a supervisory authority,
  and references the Impressum as data controller. Linked in web footer + mobile More → Legal.
- **Deep linking**
  - Custom scheme: `mjd-football-scout://`
  - iOS Universal Links: `app.json → ios.associatedDomains = applinks:mjd-football-scout.vercel.app`
  - Android App Links: `app.json → android.intentFilters` (https, `autoVerify: true`)
  - Verification files served by the web app: `web-app/public/.well-known/apple-app-site-association` + `assetlinks.json`
- **Secure auth storage** (Keychain/Keystore) + **opt-in biometric unlock** (Face ID / fingerprint).
- Store config: `ios.buildNumber`, `android.versionCode`, `NSFaceIDUsageDescription`, `eas.json`.

## 🔧 You must fill these placeholders

1. **Apple Team ID** → `web-app/public/.well-known/apple-app-site-association`
   replace `REPLACE_WITH_APPLE_TEAM_ID`. Find it in the Apple Developer portal (Membership) or via `eas credentials`.

2. **Android app-signing SHA-256** → `web-app/public/.well-known/assetlinks.json`
   replace `REPLACE_WITH_YOUR_APP_SIGNING_SHA256_FINGERPRINT`.
   Get it from Play Console → *App integrity → App signing*, or `eas credentials` (Android → keystore).

3. Deploy the **web app to `mjd-football-scout.vercel.app`** so the two `.well-known` files are live over HTTPS.
   (If the domain changes, update `legal.ts`, `constants/legal.ts`, `app.json` associatedDomains + intentFilter host.)

4. **Impressum details (mandatory in Germany, § 5 DDG)** → `web-app/src/lib/legal.ts` `IMPRESSUM`:
   replace `[DEIN VOLLSTÄNDIGER NAME]`, `[STRASSE HAUSNUMMER]`, `[PLZ ORT]` with your real
   **ladungsfähige Anschrift** (physical address — no P.O. box). Optional: `phone`, `vatId`.

## ⚠️ EU/Germany — before enabling ads

Ads are currently OFF (`NEXT_PUBLIC_ADSENSE_ENABLED`/`_CONSENT_READY` default `false`), so no consent banner is
required yet. **Before you set `ADSENSE_CONSENT_READY=true` in the EU/EEA/UK**, you must add a Google-certified
Consent Management Platform (CMP) that collects consent for ad cookies (Google's EU user-consent policy / TDDDG § 25).
The `/cookies` page already documents this. This CMP is not built (YAGNI while ads are off).

## 📋 Store console (account-side, not code)

- **Privacy policy URL:** `https://mjd-football-scout.vercel.app/privacy` (both stores)
- **Account deletion URL (Google Play requires this):** `https://mjd-football-scout.vercel.app/delete-account`
- **Apple App Privacy** "nutrition label" + **Google Play Data safety** form — declare: name, email, user IDs,
  app activity (content you create). Ads: website only (Google AdSense); apps use no tracking SDK.
- Screenshots (iPhone 6.7"/6.5" + Android phone), app description, category *Sports*, age rating, support URL.
- Apple Developer + Google Play Developer accounts.

## 🚀 Build & submit

```bash
cd mobile-app && eas build --platform all --profile production
```

```bash
cd mobile-app && eas submit --platform ios && eas submit --platform android
```

After the first Android build exists, get its SHA-256 and put it in `assetlinks.json` (step 2), then redeploy the web app.
