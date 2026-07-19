import { createHash, randomBytes } from "crypto";

export function createOneTimeToken() {
  const token = randomBytes(32).toString("hex");
  return { token, hash: hashOneTimeToken(token) };
}

export function hashOneTimeToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}
