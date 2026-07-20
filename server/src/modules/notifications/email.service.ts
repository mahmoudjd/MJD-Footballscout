import axios from "axios";
import logger from "../../logger/logger";
import { EmailTemplate, emailTemplates } from "./email.templates";

function escapeHtml(value: string) {
  return value.replace(
    /[&<>'"]/g,
    (character) =>
      ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        "'": "&#039;",
        '"': "&quot;",
      })[character] || character,
  );
}

export function renderEmailHtml(template: EmailTemplate) {
  const action = template.action
    ? `<tr><td style="padding:8px 40px 32px"><a href="${escapeHtml(template.action.url)}" style="display:inline-block;background:#047857;color:#ffffff;padding:13px 20px;border-radius:10px;text-decoration:none;font-weight:700">${escapeHtml(template.action.label)}</a></td></tr>`
    : "";
  const paragraphs = template.paragraphs
    .map(
      (paragraph) =>
        `<p style="margin:0 0 16px;line-height:1.65;color:#365b4e">${escapeHtml(paragraph)}</p>`,
    )
    .join("");
  const securityNotice = template.securityNotice
    ? `<tr><td style="padding:0 40px 32px"><div style="padding:16px;background:#f4f7f4;border-radius:10px;font-size:13px;line-height:1.55;color:#526d63">${escapeHtml(template.securityNotice)}</div></td></tr>`
    : "";

  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${escapeHtml(template.subject)}</title></head><body style="margin:0;background:#f4f7f4;font-family:Arial,sans-serif;color:#063c2c"><div style="display:none;max-height:0;overflow:hidden;opacity:0">${escapeHtml(template.preheader)}</div><table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f4f7f4"><tr><td align="center" style="padding:32px 16px"><table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:600px;background:#ffffff;border:1px solid #dce8e1;border-radius:18px;overflow:hidden"><tr><td style="padding:32px 40px 12px;color:#047857;font-weight:700">MJD Football Scout</td></tr><tr><td style="padding:0 40px 12px"><h1 style="margin:0;font-size:26px;line-height:1.25;color:#063c2c">${escapeHtml(template.heading)}</h1></td></tr><tr><td style="padding:0 40px 16px">${paragraphs}</td></tr>${action}${securityNotice}<tr><td style="padding:24px 40px;background:#063c2c;color:#dce8e1;font-size:12px;line-height:1.5">MJD Football Scout · Player intelligence for smarter recruitment</td></tr></table></td></tr></table></body></html>`;
}

export function renderEmailText(template: EmailTemplate) {
  return [
    template.heading,
    ...template.paragraphs,
    template.action
      ? `${template.action.label}: ${template.action.url}`
      : undefined,
    template.securityNotice,
  ]
    .filter((line): line is string => Boolean(line))
    .join("\n\n");
}

export function createEmailService(environment: string) {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM || process.env.PASSWORD_RESET_FROM_EMAIL;

  const send = async (to: string, template: EmailTemplate) => {
    if (!apiKey || !from) {
      if (environment === "production")
        logger.error("Email delivery is not configured");
      else logger.info(`[email:preview] ${template.subject} -> ${to}`);
      return false;
    }
    await axios.post(
      "https://api.resend.com/emails",
      {
        from,
        to: [to],
        subject: template.subject,
        text: renderEmailText(template),
        html: renderEmailHtml(template),
      },
      { headers: { Authorization: `Bearer ${apiKey}` }, timeout: 8000 },
    );
    return true;
  };

  return {
    sendNewDeviceLogin: (
      to: string,
      details: Parameters<typeof emailTemplates.newDeviceLogin>[0],
    ) => send(to, emailTemplates.newDeviceLogin(details)),
    sendOnboardingWatchlists: (to: string, name: string, url: string) =>
      send(to, emailTemplates.onboardingWatchlists(name, url)),
    sendOnboardingRecruitment: (to: string, name: string, url: string) =>
      send(to, emailTemplates.onboardingRecruitment(name, url)),
    sendSignupVerification: (to: string, url: string) =>
      send(to, emailTemplates.signupVerification(url)),
    sendEmailVerified: (to: string) => send(to, emailTemplates.emailVerified()),
    sendPasswordResetRequest: (to: string, url: string) =>
      send(to, emailTemplates.passwordResetRequest(url)),
    sendPasswordResetComplete: (to: string) =>
      send(to, emailTemplates.passwordResetComplete()),
    sendPasswordChanged: (to: string) =>
      send(to, emailTemplates.passwordChanged()),
    sendMfaEnabled: (to: string) => send(to, emailTemplates.mfaEnabled()),
    sendMfaDisabled: (to: string) => send(to, emailTemplates.mfaDisabled()),
    sendAccountDeactivated: (to: string) =>
      send(to, emailTemplates.accountDeactivated()),
  };
}
