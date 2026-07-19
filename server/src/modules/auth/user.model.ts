import { ObjectId } from "mongodb";
import { z } from "zod";

const PasswordSchema = z
  .string()
  .min(8, { message: "Password must be at least 8 characters" })
  .max(128, { message: "Password must not exceed 128 characters" });

export const UserRegisterInputSchema = z.object({
  email: z
    .string()
    .trim()
    .email({ message: "Invalid email address" })
    .transform((value) => value.toLowerCase()),
  password: PasswordSchema,
  name: z
    .string()
    .trim()
    .min(2, { message: "Name must be at least 2 characters" })
    .max(80),
});

export const UserGoogleLoginInputSchema = z.object({
  idToken: z.string().min(1),
});

export const UserLoginInputSchema = z.object({
  email: z
    .string()
    .trim()
    .email()
    .transform((value) => value.toLowerCase()),
  password: z.string().min(6).max(128),
  mfaCode: z.string().trim().min(6).max(32).optional(),
  mfaChallengeToken: z.string().min(32).max(2048).optional(),
});

export const VerifyEmailInputSchema = z.object({
  token: z.string().min(32).max(256),
});

export const ResendVerificationInputSchema = z.object({
  email: z
    .string()
    .trim()
    .email()
    .transform((value) => value.toLowerCase()),
});

export const MfaCodeInputSchema = z.object({
  code: z.string().trim().min(6).max(32),
});

export const MfaSetupInputSchema = z.object({
  password: z.string().min(6).max(128),
});

export const MfaDisableInputSchema = z.object({
  code: z.string().trim().min(6).max(32),
  password: z.string().max(128).optional(),
});

export const NotificationPreferencesInputSchema = z.object({
  securityEmailsEnabled: z.boolean(),
});

export const UpdateProfileInputSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, { message: "Name must be at least 2 characters" })
    .max(80),
});

export const ChangePasswordInputSchema = z.object({
  currentPassword: z.string().min(6).max(128),
  newPassword: PasswordSchema,
});

export const ForgotPasswordInputSchema = z.object({
  email: z
    .string()
    .trim()
    .email()
    .transform((value) => value.toLowerCase()),
});

export const ResetPasswordInputSchema = z.object({
  token: z.string().min(32).max(256),
  newPassword: PasswordSchema,
});

export const DeactivateAccountInputSchema = z.object({
  password: z.string().max(128).optional(),
  reason: z.string().trim().max(300).optional(),
});

export const UserSchema = z.object({
  _id: z.custom<ObjectId>(),
  email: z.string().email(),
  name: z.string(),
  role: z.enum(["admin", "user"]).default("user"),
  password: z.string().optional(),
  authProvider: z.enum(["credentials", "google"]).optional(),
  googleId: z.string().optional(),
  isActive: z.boolean().optional(),
  authVersion: z.number().int().nonnegative().default(0),
  deactivatedAt: z.date().optional(),
  deactivationReason: z.string().optional(),
  passwordChangedAt: z.date().optional(),
  passwordResetTokenHash: z.string().optional(),
  passwordResetExpiresAt: z.date().optional(),
  emailVerifiedAt: z.date().optional(),
  emailVerificationRequired: z.boolean().optional(),
  emailVerificationTokenHash: z.string().optional(),
  emailVerificationExpiresAt: z.date().optional(),
  securityEmailsEnabled: z.boolean().optional(),
  mfaEnabled: z.boolean().optional(),
  mfaSecretEncrypted: z.string().optional(),
  mfaPendingSecretEncrypted: z.string().optional(),
  mfaRecoveryCodeHashes: z.array(z.string()).optional(),
  mfaEnabledAt: z.date().optional(),
  billingPlan: z.enum(["free", "premium"]).optional(),
  subscriptionStatus: z
    .enum([
      "inactive",
      "trialing",
      "active",
      "past_due",
      "canceled",
      "unpaid",
      "incomplete",
      "incomplete_expired",
      "paused",
    ])
    .optional(),
  stripeCustomerId: z.string().optional(),
  stripeSubscriptionId: z.string().optional(),
  stripeProductId: z.string().optional(),
  subscriptionCurrentPeriodEnd: z.date().optional(),
  subscriptionCancelAtPeriodEnd: z.boolean().optional(),
  createdAt: z.date(),
  updatedAt: z.date().optional(),
});

export type User = z.infer<typeof UserSchema>;
export type UserRegisterInput = z.infer<typeof UserRegisterInputSchema>;
export type UserLoginInput = z.infer<typeof UserLoginInputSchema>;
export type UserGoogleLoginInput = z.infer<typeof UserGoogleLoginInputSchema>;
