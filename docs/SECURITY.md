# Security Hardening

This document records the authentication and abuse-protection controls added
during the July 2026 security pass. It complements — not replaces — the
existing controls (bcrypt password hashing, zod input validation,
`ObjectId.isValid` guards, per-user ownership checks, admin role gates, MFA with
AES-256-GCM encrypted secrets and `timingSafeEqual` TOTP verification).

## Rate limiting

Unauthenticated auth endpoints are protected by an in-memory sliding-window
limiter ([`server/src/middleware/rate-limit.ts`](../server/src/middleware/rate-limit.ts)),
keyed on the real client IP (`cf-connecting-ip` / `x-forwarded-for`, falling
back to `req.ip`).

| Endpoint | Limit |
| --- | --- |
| `POST /auth/login`, `/auth/google-login`, `/auth/reset-password` | 10 / 15 min per IP |
| `POST /auth/forgot-password`, `/auth/resend-verification` | 5 / hour per IP |
| `POST /auth/register` | 10 / hour per IP |

This blocks password brute-force, second-factor (TOTP) brute-force via the login
route, and password-reset / verification email bombing. Exceeding a limit
returns `429` with a `Retry-After` header.

> **Limitation:** buckets live per process. On a multi-instance deployment the
> limit is enforced per replica — move to a shared store (Redis /
> `express-rate-limit` with a store) if you scale out.

## JWT algorithm pinning

Every `jwt.verify` call pins `algorithms: ["HS256"]`
([`auth-middleware.ts`](../server/src/middleware/auth-middleware.ts),
`/auth/refresh` and the MFA challenge in
[`auth.router.ts`](../server/src/modules/auth/auth.router.ts)). Defense-in-depth
against algorithm-confusion attacks.

## Refresh-token rotation & revocation

Refresh tokens are backed by server-side sessions
([`auth-sessions.ts`](../server/src/modules/auth/auth-sessions.ts)), stored in
the `authSessions` collection. Only a SHA-256 hash of the session id is
persisted, and an `expiresAt` TTL index prunes expired sessions automatically.

- **One session per login (multi-device).** Each login/Google-login creates a
  session; the opaque session id is embedded as the `sid` claim of the refresh
  token. Devices are tracked independently and can be revoked individually.
- **Rotation on every refresh.** `POST /auth/refresh` issues a **new** refresh
  token and invalidates the old one. Re-using an already-rotated token is
  rejected (`401`) — this detects refresh-token theft/replay.
- **Revocation.** Password change, password reset and account deactivation call
  `revokeAllUserSessions`, logging the user out of every device (in addition to
  the existing `authVersion` bump).
- **Grace window (60 s).** After a rotation the superseded token is briefly
  honoured and answered with the *same* freshly minted token. This prevents
  concurrent client refreshes (common with next-auth, which can fire several
  refreshes at once near expiry) from racing into a forced sign-out, while a
  genuinely stale or stolen token is still rejected once the window passes.

**Migration:** refresh tokens issued before this change carry no `sid` and are
rejected on their next refresh, forcing a one-time re-login. Clients already
handle this by redirecting to sign-in.

## Web client: refresh token not exposed to the browser

`web-app` (next-auth) no longer places the `refreshToken` on the client-readable
session ([`web-app/src/auth.ts`](../web-app/src/auth.ts)). It remains only in the
encrypted next-auth JWT cookie and is used for server-side refresh in the `jwt`
callback; `useSession()` / `/api/auth/session` no longer return it. The
`accessToken` stays on the session because the browser needs it as a bearer
token. This reduces the blast radius of a hypothetical XSS.

## Tests

- [`rate-limit.test.ts`](../server/src/middleware/rate-limit.test.ts) — limit,
  per-IP bucketing, sliding window.
- [`auth-sessions.test.ts`](../server/src/modules/auth/auth-sessions.test.ts) —
  rotation, concurrent-replay grace, post-grace rejection, user scoping, revocation.

## Open follow-ups

- Shared-store rate limiting for multi-instance deployments.
- Optional: a server-side logout endpoint that revokes the current session
  (today logout is client-side; the session is cleaned up by TTL/rotation).
