import { createHash } from "crypto";
import type { Request } from "express";
import type { AppContext } from "../../context/types";
import type { User } from "./user.model";

const firstHeader = (value: string | string[] | undefined) =>
  Array.isArray(value) ? value[0] : value?.split(",")[0]?.trim();

export function describeLoginContext(req: Request) {
  const userAgent = req.get("user-agent") || "Unknown device";
  const bodyDeviceId = typeof req.body?.deviceId === "string" ? req.body.deviceId : undefined;
  const clientDeviceId = (req.get("x-client-device-id") || bodyDeviceId)?.trim().slice(0, 200);
  const ip =
    firstHeader(req.headers["cf-connecting-ip"] as string | string[] | undefined) ||
    firstHeader(req.headers["x-forwarded-for"] as string | string[] | undefined) ||
    req.ip ||
    undefined;
  const country =
    firstHeader(req.headers["cf-ipcountry"] as string | string[] | undefined) ||
    firstHeader(req.headers["x-vercel-ip-country"] as string | string[] | undefined) ||
    firstHeader(req.headers["x-country-code"] as string | string[] | undefined);
  const city = firstHeader(req.headers["x-vercel-ip-city"] as string | string[] | undefined);
  const location = [city, country].filter(Boolean).join(", ") || "Unknown location";
  const device = userAgent.length > 180 ? `${userAgent.slice(0, 177)}...` : userAgent;
  const identity = clientDeviceId ? `client:${clientDeviceId}` : `agent:${userAgent}`;
  const fingerprint = createHash("sha256").update(identity).digest("hex");

  return { fingerprint, device, location, ip };
}

export async function registerSuccessfulLogin(
  context: AppContext,
  user: User,
  req: Request,
  notify: (details: { device: string; location: string; ip?: string; occurredAt: Date }) => Promise<boolean>,
) {
  const details = describeLoginContext(req);
  const now = new Date();
  const known = (user.trustedLoginContexts || []).some(
    (entry) => entry.fingerprint === details.fingerprint,
  );
  const knownContext = (user.trustedLoginContexts || []).find(
    (entry) => entry.fingerprint === details.fingerprint,
  );
  const locationChanged = Boolean(
    knownContext &&
      knownContext.location !== "Unknown location" &&
      details.location !== "Unknown location" &&
      knownContext.location !== details.location,
  );

  if (known) {
    await context.users.updateOne(
      { _id: user._id, "trustedLoginContexts.fingerprint": details.fingerprint },
      {
        $set: {
          "trustedLoginContexts.$.lastSeenAt": now,
          "trustedLoginContexts.$.lastIp": details.ip,
          "trustedLoginContexts.$.location": details.location,
        },
      },
    );
    if (locationChanged && user.securityEmailsEnabled !== false) {
      await notify({ device: details.device, location: details.location, ip: details.ip, occurredAt: now });
      return true;
    }
    return false;
  }

  await context.users.updateOne(
    { _id: user._id },
    {
      $push: {
        trustedLoginContexts: {
          $each: [{ ...details, lastIp: details.ip, firstSeenAt: now, lastSeenAt: now }],
          $slice: -10,
        },
      },
    },
  );

  // The first successful login establishes the initial trusted device silently.
  if ((user.trustedLoginContexts || []).length === 0 || user.securityEmailsEnabled === false) {
    return false;
  }
  await notify({ device: details.device, location: details.location, ip: details.ip, occurredAt: now });
  return true;
}
