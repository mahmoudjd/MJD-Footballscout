import {
  createCipheriv,
  createDecipheriv,
  createHmac,
  randomBytes,
  timingSafeEqual,
} from "crypto";

const BASE32_ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
const TOTP_PERIOD_SECONDS = 30;
const TOTP_DIGITS = 6;

function resolveEncryptionKey() {
  const configuredKey = process.env.MFA_ENCRYPTION_KEY;
  if (!configuredKey) {
    throw new Error("MFA_ENCRYPTION_KEY is missing in environment");
  }
  const key = Buffer.from(configuredKey, "base64");
  if (key.length !== 32) {
    throw new Error("MFA_ENCRYPTION_KEY must be a base64-encoded 32-byte key");
  }
  return key;
}

export function encodeBase32(input: Buffer) {
  let bits = "";
  for (const byte of input) bits += byte.toString(2).padStart(8, "0");
  let result = "";
  for (let index = 0; index < bits.length; index += 5) {
    result +=
      BASE32_ALPHABET[
        Number.parseInt(bits.slice(index, index + 5).padEnd(5, "0"), 2)
      ];
  }
  return result;
}

function decodeBase32(value: string) {
  const normalized = value
    .toUpperCase()
    .replace(/=+$/g, "")
    .replace(/\s+/g, "");
  let bits = "";
  for (const character of normalized) {
    const position = BASE32_ALPHABET.indexOf(character);
    if (position < 0) throw new Error("Invalid base32 secret");
    bits += position.toString(2).padStart(5, "0");
  }
  const bytes: number[] = [];
  for (let index = 0; index + 8 <= bits.length; index += 8) {
    bytes.push(Number.parseInt(bits.slice(index, index + 8), 2));
  }
  return Buffer.from(bytes);
}

export function createMfaSecret() {
  return encodeBase32(randomBytes(20));
}

export function encryptMfaSecret(secret: string) {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", resolveEncryptionKey(), iv);
  const encrypted = Buffer.concat([
    cipher.update(secret, "utf8"),
    cipher.final(),
  ]);
  return [
    "v1",
    iv.toString("base64url"),
    cipher.getAuthTag().toString("base64url"),
    encrypted.toString("base64url"),
  ].join(".");
}

export function decryptMfaSecret(payload: string) {
  const [version, iv, authTag, encrypted] = payload.split(".");
  if (version !== "v1" || !iv || !authTag || !encrypted)
    throw new Error("Invalid encrypted MFA secret");
  const decipher = createDecipheriv(
    "aes-256-gcm",
    resolveEncryptionKey(),
    Buffer.from(iv, "base64url"),
  );
  decipher.setAuthTag(Buffer.from(authTag, "base64url"));
  return Buffer.concat([
    decipher.update(Buffer.from(encrypted, "base64url")),
    decipher.final(),
  ]).toString("utf8");
}

export function generateTotp(secret: string, timestamp = Date.now()) {
  const counter = Math.floor(timestamp / 1000 / TOTP_PERIOD_SECONDS);
  const counterBuffer = Buffer.alloc(8);
  counterBuffer.writeBigUInt64BE(BigInt(counter));
  const digest = createHmac("sha1", decodeBase32(secret))
    .update(counterBuffer)
    .digest();
  const offset = digest[digest.length - 1] & 0x0f;
  const binary = (digest.readUInt32BE(offset) & 0x7fffffff) % 10 ** TOTP_DIGITS;
  return binary.toString().padStart(TOTP_DIGITS, "0");
}

export function verifyTotp(
  secret: string,
  code: string,
  timestamp = Date.now(),
) {
  const normalized = code.replace(/\s+/g, "");
  if (!/^\d{6}$/.test(normalized)) return false;
  const submitted = Buffer.from(normalized);
  return [-1, 0, 1].some((window) => {
    const expected = Buffer.from(
      generateTotp(secret, timestamp + window * TOTP_PERIOD_SECONDS * 1000),
    );
    return (
      submitted.length === expected.length &&
      timingSafeEqual(submitted, expected)
    );
  });
}

export function createRecoveryCodes(count = 8) {
  return Array.from({ length: count }, () => {
    const value = randomBytes(5).toString("hex").toUpperCase();
    return `${value.slice(0, 5)}-${value.slice(5)}`;
  });
}

export function createOtpAuthUrl(email: string, secret: string) {
  const issuer = "MJD Football Scout";
  return `otpauth://totp/${encodeURIComponent(`${issuer}:${email}`)}?secret=${secret}&issuer=${encodeURIComponent(issuer)}&algorithm=SHA1&digits=6&period=30`;
}
