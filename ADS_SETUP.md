# Free-tier advertising setup

Guests and Free-plan users see advertising on content pages. Premium subscribers and administrators are ad-free, and the Google advertising script is not loaded for their sessions.

When AdSense is not enabled, the placement shows an internal MJD Scout Premium promotion. This keeps the layout testable without contacting an external advertising provider.

## Google AdSense

Configure these public web-app variables:

- `NEXT_PUBLIC_ADSENSE_ENABLED=true`
- `NEXT_PUBLIC_ADSENSE_CLIENT_ID=ca-pub-...`
- `NEXT_PUBLIC_ADSENSE_FOOTER_SLOT_ID=...`
- `NEXT_PUBLIC_ADSENSE_CONSENT_READY=true`

`NEXT_PUBLIC_ADSENSE_CONSENT_READY` is a deliberate safety switch. Set it to `true` only after a Google-certified, IAB TCF-compatible consent management platform is configured for all relevant traffic. Until then, the app shows only the internal promotion and does not load the AdSense script.

For EEA, UK and Swiss users, configure a certified CMP through Google AdSense **Privacy & messaging** or another Google-certified provider. The application does not implement or pretend to replace that certification process.

Create a responsive Display ad unit in AdSense and place its numeric slot ID in `NEXT_PUBLIC_ADSENSE_FOOTER_SLOT_ID`. The ad placement is excluded from authentication, profile, pricing and Premium-feature pages to keep sensitive workflows focused.

After changing any `NEXT_PUBLIC_*` value, rebuild and redeploy the Next.js application because public variables are embedded during the build.
