import assert from "node:assert/strict";
import test from "node:test";
import type { AppContext } from "../../context/types";
import {
  createAuthSession,
  rotateAuthSession,
  revokeAllUserSessions,
  type AuthSession,
} from "./auth-sessions";

/** Minimal in-memory stand-in for the authSessions collection. */
function fakeContext() {
  const docs: AuthSession[] = [];
  const authSessions = {
    async insertOne(doc: AuthSession) {
      docs.push({ ...doc });
      return { insertedId: docs.length };
    },
    async findOneAndUpdate(
      filter: { userId: string; jtiHash: string },
      update: { $set: Partial<AuthSession> },
    ) {
      const match = docs.find(
        (d) => d.userId === filter.userId && d.jtiHash === filter.jtiHash,
      );
      if (!match) return null;
      Object.assign(match, update.$set);
      return match;
    },
    async findOne(filter: {
      userId: string;
      graceForJtiHash: string;
      graceExpiresAt: { $gt: Date };
    }) {
      return (
        docs.find(
          (d) =>
            d.userId === filter.userId &&
            d.graceForJtiHash === filter.graceForJtiHash &&
            d.graceExpiresAt !== undefined &&
            d.graceExpiresAt > filter.graceExpiresAt.$gt,
        ) || null
      );
    },
    async deleteMany(filter: { userId: string }) {
      for (let i = docs.length - 1; i >= 0; i--) {
        if (docs[i].userId === filter.userId) docs.splice(i, 1);
      }
      return { deletedCount: 0 };
    },
  };
  return { context: { authSessions } as unknown as AppContext, docs };
}

test("rotation issues a new session id and supersedes the old one", async () => {
  const { context } = fakeContext();
  const { sessionId } = await createAuthSession(context, "user-1", "agent");

  const rotated = await rotateAuthSession(context, "user-1", sessionId);
  assert.ok(rotated, "valid session should rotate");
  assert.notEqual(rotated!.sessionId, sessionId, "id must change on rotation");

  // The new id still works.
  const again = await rotateAuthSession(context, "user-1", rotated!.sessionId);
  assert.ok(again, "the fresh session id remains valid");
});

test("concurrent replay within grace returns the same rotated id (no logout)", async () => {
  const { context } = fakeContext();
  const { sessionId } = await createAuthSession(context, "user-1");

  const winner = await rotateAuthSession(context, "user-1", sessionId);
  // A second, near-simultaneous refresh with the same old id gets the winner's id.
  const loser = await rotateAuthSession(context, "user-1", sessionId);
  assert.ok(loser, "concurrent refresh must not be rejected");
  assert.equal(loser!.sessionId, winner!.sessionId, "both get the same new id");
});

test("a superseded id is rejected once the grace window has passed", async () => {
  const { context, docs } = fakeContext();
  const { sessionId } = await createAuthSession(context, "user-1");
  await rotateAuthSession(context, "user-1", sessionId);
  // Simulate the grace window having expired.
  docs[0].graceExpiresAt = new Date(Date.now() - 1);

  assert.equal(
    await rotateAuthSession(context, "user-1", sessionId),
    null,
    "stale/stolen refresh token must be rejected after grace",
  );
});

test("rotation is scoped to the owning user", async () => {
  const { context } = fakeContext();
  const { sessionId } = await createAuthSession(context, "user-1");
  assert.equal(
    await rotateAuthSession(context, "attacker", sessionId),
    null,
    "another user cannot rotate someone else's session",
  );
});

test("revokeAllUserSessions drops every session for the user", async () => {
  const { context, docs } = fakeContext();
  const a = await createAuthSession(context, "user-1");
  await createAuthSession(context, "user-1");
  await createAuthSession(context, "user-2");

  await revokeAllUserSessions(context, "user-1");

  assert.equal(docs.length, 1, "only user-2's session remains");
  assert.equal(
    await rotateAuthSession(context, "user-1", a.sessionId),
    null,
    "revoked session cannot refresh",
  );
});
