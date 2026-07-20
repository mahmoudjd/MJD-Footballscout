import logger from "../logger/logger";
import type { AppContext } from "../context/types";
import { createEmailService } from "../modules/notifications/email.service";

const HOUR = 60 * 60 * 1000;
const STEPS = [
  { key: "watchlists", delayMs: 24 * HOUR },
  { key: "recruitment", delayMs: 4 * 24 * HOUR },
] as const;

function parseBoolean(value: string | undefined, fallback: boolean) {
  if (value === undefined) return fallback;
  return ["1", "true", "yes", "on"].includes(value.trim().toLowerCase());
}

export function startOnboardingEmailScheduler(context: AppContext) {
  if (!parseBoolean(process.env.ONBOARDING_EMAILS_ENABLED, true)) {
    logger.info("[scheduler] Onboarding emails disabled.");
    return () => undefined;
  }
  const emailService = createEmailService(context.config.env);
  const clientUrl = (process.env.CLIENT_URL || "http://localhost:3002").replace(/\/$/, "");
  let running = false;

  const run = async () => {
    if (running) return;
    running = true;
    try {
      for (const step of STEPS) {
        const eligibleBefore = new Date(Date.now() - step.delayMs);
        while (true) {
          const staleClaim = new Date(Date.now() - 2 * HOUR);
          const user = await context.users.findOneAndUpdate(
            {
              isActive: { $ne: false },
              onboardingEmailsEnabled: { $ne: false },
              emailVerifiedAt: { $exists: true },
              onboardingStartedAt: { $exists: true, $lte: eligibleBefore },
              onboardingEmailStepsSent: { $ne: step.key },
              $or: [
                { onboardingEmailClaim: { $exists: false } },
                { "onboardingEmailClaim.claimedAt": { $lt: staleClaim } },
              ],
            },
            { $set: { onboardingEmailClaim: { step: step.key, claimedAt: new Date() } } },
            { returnDocument: "after" },
          );
          if (!user) break;
          try {
            const delivered = step.key === "watchlists"
              ? await emailService.sendOnboardingWatchlists(user.email, user.name, `${clientUrl}/watchlists`)
              : await emailService.sendOnboardingRecruitment(user.email, user.name, `${clientUrl}/recruitment`);
            await context.users.updateOne(
              { _id: user._id, "onboardingEmailClaim.step": step.key },
              delivered
                ? { $addToSet: { onboardingEmailStepsSent: step.key }, $unset: { onboardingEmailClaim: "" } }
                : { $unset: { onboardingEmailClaim: "" } },
            );
            if (!delivered) break;
          } catch (error) {
            await context.users.updateOne(
              { _id: user._id, "onboardingEmailClaim.step": step.key },
              { $unset: { onboardingEmailClaim: "" } },
            );
            logger.error(`[scheduler] Onboarding email failed (${step.key})`, error);
            break;
          }
        }
      }
    } finally {
      running = false;
    }
  };

  const handle = setInterval(() => void run(), HOUR);
  void run();
  logger.info("[scheduler] Onboarding email scheduler started.");
  return () => clearInterval(handle);
}
