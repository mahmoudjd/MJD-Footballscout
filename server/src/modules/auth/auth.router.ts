import express, { Request, Response } from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import axios from "axios";
import { z } from "zod";
import { MongoServerError, ObjectId } from "mongodb";

import {
  createGoogleUser,
  createUser,
  findUserByEmail,
} from "./auth.controller";
import logger from "../../logger/logger";
import { AppContext } from "../../context/types";
import {
  UserLoginInput,
  UserLoginInputSchema,
  UserRegisterInput,
  UserRegisterInputSchema,
  UserGoogleLoginInput,
  UserGoogleLoginInputSchema,
  ChangePasswordInputSchema,
  DeactivateAccountInputSchema,
  ForgotPasswordInputSchema,
  ResetPasswordInputSchema,
  UpdateProfileInputSchema,
  VerifyEmailInputSchema,
  ResendVerificationInputSchema,
  MfaCodeInputSchema,
  MfaSetupInputSchema,
  MfaDisableInputSchema,
  NotificationPreferencesInputSchema,
} from "./user.model";
import { UserRole } from "../../shared/auth";
import { AuthenticatedRequest } from "../../shared/auth";
import { createActiveAuthMiddleware } from "../../middleware/auth-middleware";
import { createOneTimeToken, hashOneTimeToken } from "./auth-tokens";
import {
  createMfaSecret,
  createOtpAuthUrl,
  createRecoveryCodes,
  decryptMfaSecret,
  encryptMfaSecret,
  verifyTotp,
} from "./mfa";
import { createEmailService } from "../notifications/email.service";

export default function createAuthRouter(context: AppContext) {
  const router = express.Router();
  const JWT_SECRET = process.env.JWT_SECRET;
  if (!JWT_SECRET) {
    throw new Error("JWT_SECRET is missing in environment");
  }
  const GOOGLE_CLIENT_IDS = (process.env.GOOGLE_CLIENT_ID || "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);

  const GoogleTokenInfoSchema = z.object({
    aud: z.string().min(1),
    sub: z.string().min(1),
    email: z.string().email(),
    email_verified: z.union([z.boolean(), z.string()]),
    name: z.string().optional(),
  });

  const isEmailVerified = (value: boolean | string) =>
    value === true || value === "true";

  const isDuplicateKeyError = (error: unknown) => {
    if (error instanceof MongoServerError && error.code === 11000) {
      return true;
    }

    if (typeof error === "object" && error !== null) {
      const maybeError = error as { code?: unknown; message?: unknown };
      if (maybeError.code === 11000) {
        return true;
      }
      if (
        typeof maybeError.message === "string" &&
        maybeError.message.includes("E11000")
      ) {
        return true;
      }
    }

    return false;
  };

  const verifyGoogleIdToken = async (idToken: string) => {
    const response = await axios.get(
      "https://oauth2.googleapis.com/tokeninfo",
      {
        params: { id_token: idToken },
        timeout: 5000,
      },
    );
    const payload = GoogleTokenInfoSchema.parse(response.data);
    if (!isEmailVerified(payload.email_verified)) {
      throw new Error("Google token email is not verified");
    }
    if (
      GOOGLE_CLIENT_IDS.length > 0 &&
      !GOOGLE_CLIENT_IDS.includes(payload.aud)
    ) {
      throw new Error("Google token audience mismatch");
    }
    return {
      email: payload.email,
      name: payload.name?.trim() || payload.email.split("@")[0],
      googleId: payload.sub,
    };
  };

  const generateTokens = (user: {
    _id: string;
    email: string;
    role: UserRole;
    authVersion?: number;
  }) => {
    const authVersion = user.authVersion ?? 0;
    const accessToken = jwt.sign(
      {
        userId: user._id,
        email: user.email,
        role: user.role,
        tokenType: "access",
        authVersion,
      },
      JWT_SECRET,
      { expiresIn: "1h" },
    );
    const refreshToken = jwt.sign(
      { userId: user._id, role: user.role, tokenType: "refresh", authVersion },
      JWT_SECRET,
      { expiresIn: "7d" },
    );
    return { accessToken, refreshToken };
  };

  const activeAuthMiddleware = createActiveAuthMiddleware(context);
  const emailService = createEmailService(context.config.env);
  const passwordResetResponse = {
    message:
      "If an active account exists for this email, a password reset link has been sent.",
  };

  const clientUrl = (process.env.CLIENT_URL || "http://localhost:3002").replace(
    /\/$/,
    "",
  );

  const issueEmailVerification = async (user: {
    _id: ObjectId;
    email: string;
  }) => {
    const verification = createOneTimeToken();
    await context.users.updateOne(
      { _id: user._id },
      {
        $set: {
          emailVerificationTokenHash: verification.hash,
          emailVerificationExpiresAt: new Date(
            Date.now() + 24 * 60 * 60 * 1000,
          ),
          updatedAt: new Date(),
        },
      },
    );
    const verificationUrl = `${clientUrl}/verify-email?token=${encodeURIComponent(verification.token)}`;
    await emailService.sendSignupVerification(user.email, verificationUrl);
    return verificationUrl;
  };

  const sendSecurityEmail = async (
    user: { email: string; securityEmailsEnabled?: boolean },
    description: string,
    deliver: () => Promise<boolean>,
  ) => {
    if (user.securityEmailsEnabled !== false) {
      try {
        await deliver();
      } catch (error) {
        logger.error(
          `Failed to send security notification: ${description}`,
          error,
        );
      }
    }
  };

  const verifyMfaCode = async (
    user: {
      _id: ObjectId;
      mfaSecretEncrypted?: string;
      mfaRecoveryCodeHashes?: string[];
    },
    code: string,
  ) => {
    if (!user.mfaSecretEncrypted) return false;
    if (verifyTotp(decryptMfaSecret(user.mfaSecretEncrypted), code))
      return true;
    const normalizedRecoveryCode = code.trim().toUpperCase();
    for (const hash of user.mfaRecoveryCodeHashes || []) {
      if (await bcrypt.compare(normalizedRecoveryCode, hash)) {
        await context.users.updateOne(
          { _id: user._id },
          { $pull: { mfaRecoveryCodeHashes: hash } },
        );
        return true;
      }
    }
    return false;
  };

  router.post(
    "/register",
    async (req: Request, res: Response): Promise<any> => {
      try {
        const input: UserRegisterInput = UserRegisterInputSchema.parse(
          req.body,
        );
        const user = await createUser(context, input);
        let verificationUrl: string | undefined;
        try {
          verificationUrl = await issueEmailVerification(user);
        } catch (error) {
          logger.error("Failed to send registration verification email", error);
        }

        return res.status(201).json({
          message: "Account created. Check your email to verify your account.",
          verificationRequired: true,
          ...(context.config.env !== "production" ? { verificationUrl } : {}),
        });
      } catch (err) {
        if (err instanceof z.ZodError) {
          return res
            .status(400)
            .json({ error: "Invalid input", details: err.issues });
        }
        if (
          (err instanceof Error && err.message === "User already exists") ||
          isDuplicateKeyError(err)
        ) {
          return res.status(409).json({
            error: "This email already has an account. Please log in.",
          });
        }
        logger.error("Registration failed", err);
        return res.status(500).json({ error: "Registration failed" });
      }
    },
  );

  router.post("/login", async (req: Request, res: Response): Promise<any> => {
    try {
      const input: UserLoginInput = UserLoginInputSchema.parse(req.body);
      const user = await findUserByEmail(context, input.email);

      if (!user) {
        return res.status(401).json({ error: "Invalid credentials" });
      }

      if (user.isActive === false) {
        return res.status(403).json({ error: "This account is deactivated" });
      }

      if (!user.password) {
        return res.status(401).json({ error: "Invalid credentials" });
      }

      const validPassword = await bcrypt.compare(input.password, user.password);
      if (!validPassword) {
        return res.status(401).json({ error: "Invalid credentials" });
      }

      if (user.emailVerificationRequired === true && !user.emailVerifiedAt) {
        return res.status(403).json({
          error: "Verify your email before signing in",
          code: "EMAIL_NOT_VERIFIED",
        });
      }

      if (user.mfaEnabled) {
        if (!input.mfaCode || !input.mfaChallengeToken) {
          const mfaChallengeToken = jwt.sign(
            {
              userId: user._id.toString(),
              tokenType: "mfa",
              authVersion: user.authVersion ?? 0,
            },
            JWT_SECRET,
            { expiresIn: "5m" },
          );
          return res.status(202).json({ mfaRequired: true, mfaChallengeToken });
        }
        try {
          const challenge = jwt.verify(input.mfaChallengeToken, JWT_SECRET) as {
            userId?: string;
            tokenType?: string;
            authVersion?: number;
          };
          if (
            challenge.tokenType !== "mfa" ||
            challenge.userId !== user._id.toString() ||
            (challenge.authVersion ?? 0) !== (user.authVersion ?? 0)
          ) {
            return res.status(401).json({
              error: "MFA challenge is invalid or expired",
              code: "MFA_CHALLENGE_INVALID",
            });
          }
        } catch {
          return res.status(401).json({
            error: "MFA challenge is invalid or expired",
            code: "MFA_CHALLENGE_INVALID",
          });
        }
        if (!(await verifyMfaCode(user, input.mfaCode))) {
          return res.status(401).json({
            error: "The authentication code is invalid",
            code: "MFA_CODE_INVALID",
          });
        }
      }

      const userRole = user.role || "user";
      const tokens = generateTokens({
        _id: user._id!.toString(),
        email: user.email,
        role: userRole,
        authVersion: user.authVersion,
      });

      return res.status(200).json({
        ...tokens,
        name: user.name,
        email: user.email,
        id: user._id,
        role: userRole,
      });
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res
          .status(400)
          .json({ error: "Invalid input", details: err.issues });
      }
      logger.error("Login failed", err);
      return res.status(500).json({ error: "Login failed" });
    }
  });

  router.post(
    "/google-login",
    async (req: Request, res: Response): Promise<any> => {
      try {
        if (GOOGLE_CLIENT_IDS.length === 0) {
          logger.error(
            "GOOGLE_CLIENT_ID is missing. Google login is disabled.",
          );
          return res
            .status(503)
            .json({ error: "Google login is not configured" });
        }

        const input: UserGoogleLoginInput = UserGoogleLoginInputSchema.parse(
          req.body,
        );
        const verifiedGoogleUser = await verifyGoogleIdToken(input.idToken);

        let user = await context.users.findOne({
          googleId: verifiedGoogleUser.googleId,
        });
        if (!user) {
          const userByEmail = await context.users.findOne({
            email: verifiedGoogleUser.email,
          });
          if (userByEmail) {
            if (userByEmail.isActive === false) {
              return res
                .status(403)
                .json({ error: "This account is deactivated" });
            }
            if (
              userByEmail.googleId &&
              userByEmail.googleId !== verifiedGoogleUser.googleId
            ) {
              return res.status(409).json({
                error:
                  "This email is already linked to another Google account.",
              });
            }

            const shouldBackfillName = !userByEmail.name?.trim();
            const shouldSetGoogleProvider =
              !userByEmail.password && userByEmail.authProvider !== "google";
            const updateSet: Record<string, string | Date | boolean> = {
              googleId: verifiedGoogleUser.googleId,
              emailVerifiedAt: new Date(),
              emailVerificationRequired: false,
            };
            if (shouldBackfillName) {
              updateSet.name = verifiedGoogleUser.name;
            }
            if (shouldSetGoogleProvider) {
              updateSet.authProvider = "google";
            }

            user = await context.users.findOneAndUpdate(
              { _id: userByEmail._id },
              {
                $set: updateSet,
              },
              { returnDocument: "after" },
            );
          } else {
            user = await createGoogleUser(context, verifiedGoogleUser);
          }
        }

        if (user?.isActive === false) {
          return res.status(403).json({ error: "This account is deactivated" });
        }

        if (!user) {
          return res
            .status(500)
            .json({ error: "Unable to complete Google login" });
        }

        const userRole = user.role || "user";
        const tokens = generateTokens({
          _id: user._id!.toString(),
          email: user.email,
          role: userRole,
          authVersion: user.authVersion,
        });

        return res.status(200).json({
          ...tokens,
          name: user.name,
          email: user.email,
          id: user._id,
          role: userRole,
        });
      } catch (err) {
        if (err instanceof z.ZodError) {
          return res
            .status(400)
            .json({ error: "Invalid input", details: err.issues });
        }
        if (err instanceof Error && err.message === "User already exists") {
          return res.status(409).json({ error: err.message });
        }
        if (err instanceof Error && err.message.includes("Google token")) {
          return res.status(401).json({ error: err.message });
        }
        if (axios.isAxiosError(err)) {
          return res.status(401).json({ error: "Invalid Google token" });
        }

        logger.error("Google login failed", err);
        return res.status(500).json({ error: "Google login failed" });
      }
    },
  );

  router.post(
    "/verify-email",
    async (req: Request, res: Response): Promise<any> => {
      try {
        const { token } = VerifyEmailInputSchema.parse(req.body);
        const user = await context.users.findOneAndUpdate(
          {
            emailVerificationTokenHash: hashOneTimeToken(token),
            emailVerificationExpiresAt: { $gt: new Date() },
            isActive: { $ne: false },
          },
          {
            $set: {
              emailVerifiedAt: new Date(),
              emailVerificationRequired: false,
              updatedAt: new Date(),
            },
            $unset: {
              emailVerificationTokenHash: "",
              emailVerificationExpiresAt: "",
            },
          },
          { returnDocument: "after" },
        );
        if (!user)
          return res.status(400).json({
            error: "This verification link is invalid or has expired",
          });
        await sendSecurityEmail(
          user,
          "email verified",
          () => emailService.sendEmailVerified(user.email),
        );
        return res.status(200).json({
          message: "Email verified successfully. You can now sign in.",
        });
      } catch (error) {
        if (error instanceof z.ZodError)
          return res.status(400).json({ error: "Invalid verification link" });
        logger.error("Email verification failed", error);
        return res.status(500).json({ error: "Email could not be verified" });
      }
    },
  );

  router.post(
    "/resend-verification",
    async (req: Request, res: Response): Promise<any> => {
      const genericResponse = {
        message:
          "If an unverified account exists, a new verification email has been sent.",
      };
      try {
        const { email } = ResendVerificationInputSchema.parse(req.body);
        const user = await findUserByEmail(context, email);
        if (
          user &&
          user.isActive !== false &&
          user.emailVerificationRequired === true &&
          !user.emailVerifiedAt
        ) {
          const verificationUrl = await issueEmailVerification(user);
          return res.status(200).json({
            ...genericResponse,
            ...(context.config.env !== "production" ? { verificationUrl } : {}),
          });
        }
        return res.status(200).json(genericResponse);
      } catch (error) {
        if (!(error instanceof z.ZodError))
          logger.error("Resend verification failed", error);
        return res.status(200).json(genericResponse);
      }
    },
  );

  router.post(
    "/forgot-password",
    async (req: Request, res: Response): Promise<any> => {
      try {
        const { email } = ForgotPasswordInputSchema.parse(req.body);
        const user = await findUserByEmail(context, email);
        if (!user || user.isActive === false || !user.password) {
          return res.status(200).json(passwordResetResponse);
        }

        const reset = createOneTimeToken();
        const passwordResetExpiresAt = new Date(Date.now() + 30 * 60 * 1000);
        await context.users.updateOne(
          { _id: user._id },
          {
            $set: {
              passwordResetTokenHash: reset.hash,
              passwordResetExpiresAt,
              updatedAt: new Date(),
            },
          },
        );

        const resetUrl = `${clientUrl}/reset-password?token=${encodeURIComponent(reset.token)}`;
        try {
          await emailService.sendPasswordResetRequest(email, resetUrl);
        } catch (error) {
          logger.error("Failed to send password reset email", error);
        }

        return res.status(200).json({
          ...passwordResetResponse,
          ...(context.config.env !== "production" ? { resetUrl } : {}),
        });
      } catch (err) {
        if (err instanceof z.ZodError) {
          return res.status(400).json({
            error: "Enter a valid email address",
            details: err.issues,
          });
        }
        logger.error("Forgot password failed", err);
        return res.status(200).json(passwordResetResponse);
      }
    },
  );

  router.post(
    "/reset-password",
    async (req: Request, res: Response): Promise<any> => {
      try {
        const { token, newPassword } = ResetPasswordInputSchema.parse(req.body);
        const passwordResetTokenHash = hashOneTimeToken(token);
        const user = await context.users.findOne({
          passwordResetTokenHash,
          passwordResetExpiresAt: { $gt: new Date() },
          isActive: { $ne: false },
        });
        if (!user) {
          return res
            .status(400)
            .json({ error: "This reset link is invalid or has expired" });
        }

        const password = await bcrypt.hash(newPassword, 10);
        await context.users.updateOne(
          { _id: user._id },
          {
            $set: {
              password,
              passwordChangedAt: new Date(),
              updatedAt: new Date(),
            },
            $unset: { passwordResetTokenHash: "", passwordResetExpiresAt: "" },
            $inc: { authVersion: 1 },
          },
        );
        await sendSecurityEmail(
          user,
          "password reset",
          () => emailService.sendPasswordResetComplete(user.email),
        );
        return res.status(200).json({
          message: "Password reset successfully. You can now sign in.",
        });
      } catch (err) {
        if (err instanceof z.ZodError) {
          return res
            .status(400)
            .json({ error: err.issues[0]?.message || "Invalid reset request" });
        }
        logger.error("Password reset failed", err);
        return res.status(500).json({ error: "Password could not be reset" });
      }
    },
  );

  router.get(
    "/me",
    activeAuthMiddleware,
    async (req: Request, res: Response): Promise<any> => {
      const userId = (req as AuthenticatedRequest).user?.userId;
      if (!userId || !ObjectId.isValid(userId)) {
        return res.status(401).json({ error: "Unauthorized" });
      }
      const user = await context.users.findOne({ _id: new ObjectId(userId) });
      if (!user) return res.status(404).json({ error: "Profile not found" });

      return res.status(200).json({
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role || "user",
        authProvider:
          user.authProvider || (user.password ? "credentials" : "google"),
        isActive: user.isActive !== false,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
        emailVerified:
          Boolean(user.emailVerifiedAt) ||
          user.emailVerificationRequired !== true,
        securityEmailsEnabled: user.securityEmailsEnabled !== false,
        mfaEnabled: user.mfaEnabled === true,
      });
    },
  );

  router.patch(
    "/me",
    activeAuthMiddleware,
    async (req: Request, res: Response): Promise<any> => {
      try {
        const userId = (req as AuthenticatedRequest).user?.userId;
        if (!userId || !ObjectId.isValid(userId))
          return res.status(401).json({ error: "Unauthorized" });
        const { name } = UpdateProfileInputSchema.parse(req.body);
        const user = await context.users.findOneAndUpdate(
          { _id: new ObjectId(userId), isActive: { $ne: false } },
          { $set: { name, updatedAt: new Date() } },
          { returnDocument: "after" },
        );
        if (!user) return res.status(404).json({ error: "Profile not found" });
        return res.status(200).json({
          name: user.name,
          email: user.email,
          updatedAt: user.updatedAt,
        });
      } catch (err) {
        if (err instanceof z.ZodError) {
          return res
            .status(400)
            .json({ error: err.issues[0]?.message || "Invalid profile data" });
        }
        logger.error("Profile update failed", err);
        return res.status(500).json({ error: "Profile could not be updated" });
      }
    },
  );

  router.patch(
    "/notification-preferences",
    activeAuthMiddleware,
    async (req: Request, res: Response): Promise<any> => {
      try {
        const userId = (req as AuthenticatedRequest).user?.userId;
        if (!userId || !ObjectId.isValid(userId))
          return res.status(401).json({ error: "Unauthorized" });
        const { securityEmailsEnabled } =
          NotificationPreferencesInputSchema.parse(req.body);
        await context.users.updateOne(
          { _id: new ObjectId(userId), isActive: { $ne: false } },
          { $set: { securityEmailsEnabled, updatedAt: new Date() } },
        );
        return res.status(200).json({
          securityEmailsEnabled,
          message: "Email preferences updated.",
        });
      } catch (error) {
        if (error instanceof z.ZodError)
          return res
            .status(400)
            .json({ error: "Invalid notification preferences" });
        logger.error("Notification preferences update failed", error);
        return res
          .status(500)
          .json({ error: "Notification preferences could not be updated" });
      }
    },
  );

  router.post(
    "/mfa/setup",
    activeAuthMiddleware,
    async (req: Request, res: Response): Promise<any> => {
      try {
        const userId = (req as AuthenticatedRequest).user?.userId;
        if (!userId || !ObjectId.isValid(userId))
          return res.status(401).json({ error: "Unauthorized" });
        const user = await context.users.findOne({
          _id: new ObjectId(userId),
          isActive: { $ne: false },
        });
        if (!user) return res.status(404).json({ error: "Profile not found" });
        if (user.mfaEnabled)
          return res.status(409).json({ error: "MFA is already enabled" });
        if (!user.password) {
          return res.status(400).json({
            error: "MFA is managed by your external sign-in provider",
          });
        }
        const { password } = MfaSetupInputSchema.parse(req.body);
        if (!(await bcrypt.compare(password, user.password))) {
          return res
            .status(400)
            .json({ error: "Enter your current password to set up MFA" });
        }
        const secret = createMfaSecret();
        await context.users.updateOne(
          { _id: user._id },
          {
            $set: {
              mfaPendingSecretEncrypted: encryptMfaSecret(secret),
              updatedAt: new Date(),
            },
          },
        );
        return res
          .status(200)
          .json({ secret, otpAuthUrl: createOtpAuthUrl(user.email, secret) });
      } catch (error) {
        if (error instanceof z.ZodError)
          return res.status(400).json({ error: "Enter your current password" });
        logger.error("MFA setup failed", error);
        const isConfigurationError =
          error instanceof Error &&
          error.message.includes("MFA_ENCRYPTION_KEY");
        return res.status(isConfigurationError ? 503 : 500).json({
          error: isConfigurationError
            ? "MFA is not configured on the server"
            : "MFA setup failed",
        });
      }
    },
  );

  router.post(
    "/mfa/enable",
    activeAuthMiddleware,
    async (req: Request, res: Response): Promise<any> => {
      try {
        const userId = (req as AuthenticatedRequest).user?.userId;
        if (!userId || !ObjectId.isValid(userId))
          return res.status(401).json({ error: "Unauthorized" });
        const { code } = MfaCodeInputSchema.parse(req.body);
        const user = await context.users.findOne({
          _id: new ObjectId(userId),
          isActive: { $ne: false },
        });
        if (!user?.mfaPendingSecretEncrypted)
          return res.status(400).json({ error: "Start MFA setup first" });
        const encryptedSecret = user.mfaPendingSecretEncrypted;
        if (!verifyTotp(decryptMfaSecret(encryptedSecret), code)) {
          return res
            .status(400)
            .json({ error: "The authentication code is invalid" });
        }
        const recoveryCodes = createRecoveryCodes();
        const recoveryCodeHashes = await Promise.all(
          recoveryCodes.map((recoveryCode) => bcrypt.hash(recoveryCode, 10)),
        );
        await context.users.updateOne(
          { _id: user._id },
          {
            $set: {
              mfaEnabled: true,
              mfaSecretEncrypted: encryptedSecret,
              mfaRecoveryCodeHashes: recoveryCodeHashes,
              mfaEnabledAt: new Date(),
              updatedAt: new Date(),
            },
            $unset: { mfaPendingSecretEncrypted: "" },
          },
        );
        await sendSecurityEmail(
          user,
          "MFA enabled",
          () => emailService.sendMfaEnabled(user.email),
        );
        return res
          .status(200)
          .json({ message: "MFA enabled successfully.", recoveryCodes });
      } catch (error) {
        if (error instanceof z.ZodError)
          return res
            .status(400)
            .json({ error: "Enter a valid authentication code" });
        logger.error("MFA enable failed", error);
        return res.status(500).json({ error: "MFA could not be enabled" });
      }
    },
  );

  router.post(
    "/mfa/disable",
    activeAuthMiddleware,
    async (req: Request, res: Response): Promise<any> => {
      try {
        const userId = (req as AuthenticatedRequest).user?.userId;
        if (!userId || !ObjectId.isValid(userId))
          return res.status(401).json({ error: "Unauthorized" });
        const { code, password } = MfaDisableInputSchema.parse(req.body);
        const user = await context.users.findOne({
          _id: new ObjectId(userId),
          isActive: { $ne: false },
        });
        if (!user?.mfaEnabled)
          return res.status(400).json({ error: "MFA is not enabled" });
        if (
          user.password &&
          (!password || !(await bcrypt.compare(password, user.password)))
        ) {
          return res
            .status(400)
            .json({ error: "Current password is incorrect" });
        }
        if (!(await verifyMfaCode(user, code)))
          return res
            .status(400)
            .json({ error: "The authentication code is invalid" });
        await context.users.updateOne(
          { _id: user._id },
          {
            $set: { mfaEnabled: false, updatedAt: new Date() },
            $unset: {
              mfaSecretEncrypted: "",
              mfaPendingSecretEncrypted: "",
              mfaRecoveryCodeHashes: "",
              mfaEnabledAt: "",
            },
          },
        );
        await sendSecurityEmail(
          user,
          "MFA disabled",
          () => emailService.sendMfaDisabled(user.email),
        );
        return res.status(200).json({ message: "MFA disabled successfully." });
      } catch (error) {
        if (error instanceof z.ZodError)
          return res
            .status(400)
            .json({ error: "Enter valid security details" });
        logger.error("MFA disable failed", error);
        return res.status(500).json({ error: "MFA could not be disabled" });
      }
    },
  );

  router.post(
    "/change-password",
    activeAuthMiddleware,
    async (req: Request, res: Response): Promise<any> => {
      try {
        const userId = (req as AuthenticatedRequest).user?.userId;
        if (!userId || !ObjectId.isValid(userId))
          return res.status(401).json({ error: "Unauthorized" });
        const { currentPassword, newPassword } =
          ChangePasswordInputSchema.parse(req.body);
        const user = await context.users.findOne({
          _id: new ObjectId(userId),
          isActive: { $ne: false },
        });
        if (!user?.password) {
          return res.status(400).json({
            error: "Password changes are unavailable for this sign-in method",
          });
        }
        if (!(await bcrypt.compare(currentPassword, user.password))) {
          return res
            .status(400)
            .json({ error: "Current password is incorrect" });
        }
        if (await bcrypt.compare(newPassword, user.password)) {
          return res.status(400).json({
            error: "New password must be different from the current password",
          });
        }

        const password = await bcrypt.hash(newPassword, 10);
        await context.users.updateOne(
          { _id: user._id },
          {
            $set: {
              password,
              passwordChangedAt: new Date(),
              updatedAt: new Date(),
            },
            $unset: { passwordResetTokenHash: "", passwordResetExpiresAt: "" },
            $inc: { authVersion: 1 },
          },
        );
        await sendSecurityEmail(
          user,
          "password changed",
          () => emailService.sendPasswordChanged(user.email),
        );
        return res.status(200).json({
          message: "Password changed successfully. Please sign in again.",
        });
      } catch (err) {
        if (err instanceof z.ZodError) {
          return res
            .status(400)
            .json({ error: err.issues[0]?.message || "Invalid password data" });
        }
        logger.error("Password change failed", err);
        return res.status(500).json({ error: "Password could not be changed" });
      }
    },
  );

  router.delete(
    "/me",
    activeAuthMiddleware,
    async (req: Request, res: Response): Promise<any> => {
      try {
        const userId = (req as AuthenticatedRequest).user?.userId;
        if (!userId || !ObjectId.isValid(userId))
          return res.status(401).json({ error: "Unauthorized" });
        const { password, reason } = DeactivateAccountInputSchema.parse(
          req.body || {},
        );
        const user = await context.users.findOne({
          _id: new ObjectId(userId),
          isActive: { $ne: false },
        });
        if (!user) return res.status(404).json({ error: "Profile not found" });
        if (
          user.password &&
          (!password || !(await bcrypt.compare(password, user.password)))
        ) {
          return res.status(400).json({
            error: "Enter your current password to deactivate the account",
          });
        }

        await sendSecurityEmail(
          user,
          "account deactivated",
          () => emailService.sendAccountDeactivated(user.email),
        );
        await context.users.updateOne(
          { _id: user._id },
          {
            $set: {
              isActive: false,
              deactivatedAt: new Date(),
              deactivationReason: reason || "Deactivated by user",
              updatedAt: new Date(),
            },
            $unset: { passwordResetTokenHash: "", passwordResetExpiresAt: "" },
            $inc: { authVersion: 1 },
          },
        );
        return res
          .status(200)
          .json({ message: "Account deactivated successfully" });
      } catch (err) {
        if (err instanceof z.ZodError) {
          return res.status(400).json({
            error: err.issues[0]?.message || "Invalid deactivation request",
          });
        }
        logger.error("Account deactivation failed", err);
        return res
          .status(500)
          .json({ error: "Account could not be deactivated" });
      }
    },
  );

  router.post("/refresh", async (req: Request, res: Response): Promise<any> => {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      return res.status(400).json({ error: "Refresh token required" });
    }

    try {
      const payload = jwt.verify(refreshToken, JWT_SECRET) as {
        userId?: string;
        tokenType?: string;
        authVersion?: number;
      };
      if (!payload.userId || payload.tokenType !== "refresh") {
        return res.status(401).json({ error: "Invalid token payload" });
      }
      if (!ObjectId.isValid(payload.userId)) {
        return res.status(401).json({ error: "Invalid token payload" });
      }

      const user = await context.users.findOne({
        _id: new ObjectId(payload.userId),
      });
      if (!user) {
        return res.status(401).json({ error: "User not found" });
      }
      if (
        user.isActive === false ||
        (payload.authVersion ?? 0) !== (user.authVersion ?? 0)
      ) {
        return res.status(401).json({ error: "Session is no longer valid" });
      }

      logger.info("[REFRESH TOKEN] Refresh token", user.email);

      const userRole = user.role || "user";
      const accessToken = jwt.sign(
        {
          userId: user._id.toString(),
          email: user.email,
          role: userRole,
          tokenType: "access",
          authVersion: user.authVersion ?? 0,
        },
        JWT_SECRET,
        { expiresIn: "1h" },
      );

      return res.status(200).json({
        accessToken,
        refreshToken,
        role: userRole,
      });
    } catch (err) {
      logger.error("Refresh token error", err);
      return res
        .status(401)
        .json({ error: "Invalid or expired refresh token" });
    }
  });

  return router;
}
