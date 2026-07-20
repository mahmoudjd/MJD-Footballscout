export type EmailAction = {
  label: string;
  url: string;
};

export type EmailTemplate = {
  subject: string;
  preheader: string;
  heading: string;
  paragraphs: string[];
  action?: EmailAction;
  securityNotice?: string;
};

const accountSecurityNotice =
  "If you did not make this change, reset your password immediately and contact support.";

export const emailTemplates = {
  newDeviceLogin: (details: {
    device: string;
    location: string;
    ip?: string;
    occurredAt: Date;
    securityUrl: string;
  }): EmailTemplate => ({
    subject: "New sign-in activity – MJD Football Scout",
    preheader: "A new device or location signed in to your account.",
    heading: "New sign-in activity",
    paragraphs: [
      `Device: ${details.device}`,
      `Location: ${details.location}`,
      `IP address: ${details.ip || "Unavailable"}`,
      `Time: ${details.occurredAt.toISOString()}`,
    ],
    action: { label: "Review account security", url: details.securityUrl },
    securityNotice: accountSecurityNotice,
  }),

  onboardingWatchlists: (name: string, watchlistsUrl: string): EmailTemplate => ({
    subject: "Build your first scouting watchlist",
    preheader: "Keep promising players organized in one place.",
    heading: `Start your shortlist, ${name}`,
    paragraphs: [
      "Create a watchlist for a position, competition or transfer window and add promising players while you browse.",
      "You can reorder the list at any time to keep your strongest options at the top.",
    ],
    action: { label: "Create a watchlist", url: watchlistsUrl },
  }),

  onboardingRecruitment: (name: string, recruitmentUrl: string): EmailTemplate => ({
    subject: "Turn scouting into recruitment decisions",
    preheader: "Use the Recruitment Workspace and Shadow Team to plan your squad.",
    heading: `Plan the next move, ${name}`,
    paragraphs: [
      "Move candidates through your recruitment pipeline, assign deadlines and capture the reasoning behind every decision.",
      "Use Shadow Team to identify squad gaps and compare candidates for each role.",
    ],
    action: { label: "Open Recruitment Workspace", url: recruitmentUrl },
  }),

  signupVerification: (verificationUrl: string): EmailTemplate => ({
    subject: "Verify your MJD Football Scout email",
    preheader: "Confirm your email address to activate your account.",
    heading: "Welcome to MJD Football Scout",
    paragraphs: [
      "Your account has been created. Confirm your email address to finish setting it up and sign in.",
      "This secure verification link expires in 24 hours.",
    ],
    action: { label: "Verify email", url: verificationUrl },
    securityNotice:
      "If you did not create this account, you can safely ignore this email.",
  }),

  emailVerified: (): EmailTemplate => ({
    subject: "Email verified – MJD Football Scout",
    preheader: "Your email address has been verified successfully.",
    heading: "Email verified",
    paragraphs: [
      "Your email address was verified successfully. Your account is ready and you can now sign in.",
    ],
  }),

  passwordResetRequest: (resetUrl: string): EmailTemplate => ({
    subject: "Reset your MJD Football Scout password",
    preheader: "Use this secure link to choose a new password.",
    heading: "Reset your password",
    paragraphs: [
      "We received a request to reset your password.",
      "This secure link expires in 30 minutes and can only be used once.",
    ],
    action: { label: "Reset password", url: resetUrl },
    securityNotice:
      "If you did not request a password reset, you can safely ignore this email. Your password has not changed.",
  }),

  passwordResetComplete: (): EmailTemplate => ({
    subject: "Password reset – MJD Football Scout",
    preheader: "Your password was reset successfully.",
    heading: "Password reset",
    paragraphs: [
      "Your password was reset successfully. All existing sessions have been invalidated, so you will need to sign in again.",
    ],
    securityNotice: accountSecurityNotice,
  }),

  passwordChanged: (): EmailTemplate => ({
    subject: "Password changed – MJD Football Scout",
    preheader: "Your account password was changed.",
    heading: "Password changed",
    paragraphs: [
      "Your password was changed successfully. All existing sessions have been invalidated, so you will need to sign in again.",
    ],
    securityNotice: accountSecurityNotice,
  }),

  mfaEnabled: (): EmailTemplate => ({
    subject: "MFA enabled – MJD Football Scout",
    preheader: "Multi-factor authentication now protects your account.",
    heading: "Multi-factor authentication enabled",
    paragraphs: [
      "Multi-factor authentication is now enabled for your account.",
      "Keep your recovery codes in a secure place. Each recovery code can only be used once.",
    ],
    securityNotice: accountSecurityNotice,
  }),

  mfaDisabled: (): EmailTemplate => ({
    subject: "MFA disabled – MJD Football Scout",
    preheader: "Multi-factor authentication was removed from your account.",
    heading: "Multi-factor authentication disabled",
    paragraphs: [
      "Multi-factor authentication was removed from your account. Future sign-ins will no longer require an authentication code.",
    ],
    securityNotice: accountSecurityNotice,
  }),

  accountDeactivated: (): EmailTemplate => ({
    subject: "Account deactivated – MJD Football Scout",
    preheader: "Your MJD Football Scout account was deactivated.",
    heading: "Account deactivated",
    paragraphs: [
      "Your MJD Football Scout account was deactivated and can no longer be used to sign in.",
    ],
    securityNotice:
      "If you did not deactivate your account, contact support immediately.",
  }),
};
