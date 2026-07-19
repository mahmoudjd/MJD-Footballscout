# Email, Password Reset and MFA Setup

The authentication system uses Resend for transactional email and TOTP for multi-factor authentication.

## Server environment

Add these values to `server/.env.development.local` for local development and to the production secret store for deployment:

```env
CLIENT_URL=http://localhost:3002
RESEND_API_KEY=re_replace_me
EMAIL_FROM=MJD Football Scout <noreply@your-verified-domain.example>
MFA_ENCRYPTION_KEY=replace-with-base64-key
```

Generate the MFA encryption key once with:

```bash
openssl rand -base64 32
```

Never rotate `MFA_ENCRYPTION_KEY` without a migration: existing encrypted authenticator secrets depend on it.

## Local testing without email delivery

Leave `RESEND_API_KEY` empty. Registration and password-reset responses expose their local verification/reset URL only outside production, so the complete flow can still be tested in a browser.

## Production checklist

- Verify the sender domain with Resend.
- Configure `EMAIL_FROM` on that verified domain.
- Store the Resend and MFA keys as deployment secrets.
- Use an HTTPS `CLIENT_URL`.
- Test registration verification, resend, password reset, MFA setup, recovery-code login, and MFA removal.
- Keep security emails enabled by default; users can change the preference in Profile.

## Implemented messages

- Registration email verification
- Password reset link
- Password changed/reset alert
- MFA enabled/disabled alert
- Account deactivation alert
