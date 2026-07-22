import assert from "node:assert/strict";
import test from "node:test";
import { ObjectId } from "mongodb";
import { createGoogleUser, createUser } from "./auth.controller";
import { AppContext } from "../../context/types";

// Minimal context: createUser/createGoogleUser only touch context.users.insertOne.
const stubContext = () =>
  ({
    users: { insertOne: async () => ({ insertedId: new ObjectId() }) },
  }) as unknown as AppContext;

test("credentials signups require email verification and are not pre-verified", async () => {
  const user = await createUser(stubContext(), {
    name: "Test Scout",
    email: "scout@example.com",
    password: "Secure123!",
  });
  // These two drive the /login gate — flipping either reopens unverified sign-in.
  assert.equal(user.emailVerificationRequired, true);
  assert.equal(user.emailVerifiedAt, undefined);
});

test("google signups are pre-verified by Google", async () => {
  const user = await createGoogleUser(stubContext(), {
    email: "scout@example.com",
    name: "Test Scout",
    googleId: "google-sub-123",
  });
  assert.ok(user.emailVerifiedAt instanceof Date);
  assert.equal(user.password, undefined);
});
