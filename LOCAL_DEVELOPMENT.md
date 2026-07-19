# Local development

The local configuration uses an isolated MongoDB database and does not overwrite deployment credentials.

## Addresses

- Web app: `http://localhost:3002`
- Backend: `http://localhost:8080`
- MongoDB: `mongodb://127.0.0.1:27017/MJD_FootballScout_Local`

## Start

Open two terminals from the repository root.

Terminal 1:

```bash
cd server
npm run dev:local
```

Terminal 2:

```bash
cd web-app
npm run dev:local
```

Then open `http://localhost:3002`.

## Login

Google OAuth is intentionally disabled in the local test configuration. A local test account is available:

- Email: `scout@mjd.local`
- Password: `Scout123!`

## Password Reset

In local development, the forgot-password response includes a local reset link so the complete flow can be tested without an email provider.

For production email delivery, configure these backend variables:

- `RESEND_API_KEY`
- `PASSWORD_RESET_FROM_EMAIL`, for example `MJD Football Scout <noreply@example.com>`
- `CLIENT_URL`, used to create the reset link

Reset links expire after 30 minutes and can be used only once.

## Account Deactivation

Account deletion is implemented as a soft deactivation. The user document remains in MongoDB with `isActive: false`, `deactivatedAt`, and `deactivationReason`. Existing access and refresh tokens become invalid immediately.
- Role: `user`

You can also create additional accounts on `/signup`.

Automatic player updates are disabled locally to prevent unintended scraper traffic. Manual player search still uses the configured scraper endpoints.
# Email and MFA

See [EMAIL_AUTH_SETUP.md](./EMAIL_AUTH_SETUP.md) for local email previews, Resend configuration and MFA encryption keys.
