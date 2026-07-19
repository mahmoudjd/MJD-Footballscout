import type { User } from "../auth/user.model";

const ACCESS_STATUSES = new Set(["active", "trialing"]);

export function hasPremiumAccess(
  user: Pick<User, "role" | "billingPlan" | "subscriptionStatus">,
) {
  if (user.role === "admin") return true;
  return (
    user.billingPlan === "premium" &&
    ACCESS_STATUSES.has(user.subscriptionStatus ?? "inactive")
  );
}
