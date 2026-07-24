import { createHash, randomBytes } from "crypto";
import type { AppContext } from "../../context/types";

export const REFRESH_TOKEN_TTL_MS = 7 * 24 * 60 * 60 * 1000;

/**
 * Overlap after a rotation during which the just-superseded refresh token is
 * still honoured — and answered with the same freshly minted token. This keeps
 * concurrent client refreshes (common with next-auth: several requests refresh
 * at once near expiry) from racing each other into a forced sign-out, while a
 * genuinely stale/stolen token is rejected once the window passes.
 */
export const REFRESH_GRACE_MS = 60 * 1000;

export interface AuthSession {
  userId: string;
  jtiHash: string;
  device?: string;
  createdAt: Date;
  lastUsedAt: Date;
  expiresAt: Date;
  // Set on rotation so concurrent refreshes of the previous id are idempotent.
  graceForJtiHash?: string;
  graceSessionId?: string;
  graceExpiresAt?: Date;
}

function hashSessionId(sessionId: string) {
  return createHash("sha256").update(sessionId).digest("hex");
}

/**
 * Creates a server-side refresh session and returns the opaque session id that
 * gets embedded (as `sid`) in the refresh token. Only the hash is stored, so a
 * DB read alone cannot mint valid refresh tokens.
 */
export async function createAuthSession(
  context: AppContext,
  userId: string,
  device?: string,
): Promise<{ sessionId: string }> {
  const sessionId = randomBytes(32).toString("hex");
  const now = new Date();
  await context.authSessions.insertOne({
    userId,
    jtiHash: hashSessionId(sessionId),
    device,
    createdAt: now,
    lastUsedAt: now,
    expiresAt: new Date(now.getTime() + REFRESH_TOKEN_TTL_MS),
  });
  return { sessionId };
}

/**
 * Rotates a session. The presented id is valid only if it is the session's
 * current id (normal rotation) or the id it just replaced within the grace
 * window (idempotent replay for concurrent refreshes). Any other id — already
 * rotated past the grace window, or revoked — returns null and must be rejected.
 *
 * ponytail: `graceSessionId` holds the current id in plaintext for the grace
 * window. Only weakens the store against an attacker who already holds
 * JWT_SECRET, who could forge stateless access tokens regardless — so no real
 * loss. Drop it (and reject stale ids outright) if clients gain single-flight refresh.
 */
export async function rotateAuthSession(
  context: AppContext,
  userId: string,
  sessionId: string,
  device?: string,
): Promise<{ sessionId: string } | null> {
  const presentedHash = hashSessionId(sessionId);
  const newSessionId = randomBytes(32).toString("hex");
  const now = new Date();

  // Normal path: the presented id is the session's current id. Atomic per-doc,
  // so of two concurrent holders of the same current id only one matches here.
  const rotated = await context.authSessions.findOneAndUpdate(
    { userId, jtiHash: presentedHash },
    {
      $set: {
        jtiHash: hashSessionId(newSessionId),
        graceForJtiHash: presentedHash,
        graceSessionId: newSessionId,
        graceExpiresAt: new Date(now.getTime() + REFRESH_GRACE_MS),
        lastUsedAt: now,
        expiresAt: new Date(now.getTime() + REFRESH_TOKEN_TTL_MS),
        ...(device ? { device } : {}),
      },
    },
    { returnDocument: "after" },
  );
  if (rotated) return { sessionId: newSessionId };

  // Grace path: the presented id was just superseded — hand back the same new id.
  const grace = await context.authSessions.findOne({
    userId,
    graceForJtiHash: presentedHash,
    graceExpiresAt: { $gt: now },
  });
  if (grace?.graceSessionId) return { sessionId: grace.graceSessionId };

  return null;
}

/** Revokes every refresh session for a user (password change/reset/deactivation). */
export async function revokeAllUserSessions(context: AppContext, userId: string) {
  await context.authSessions.deleteMany({ userId });
}
