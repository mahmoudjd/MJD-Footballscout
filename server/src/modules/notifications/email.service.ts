import axios from "axios";
import logger from "../../logger/logger";

type EmailMessage = {
  to: string;
  subject: string;
  heading: string;
  body: string;
  action?: { label: string; url: string };
};

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

function renderHtml(message: EmailMessage) {
  const action = message.action
    ? `<p style="margin:28px 0"><a href="${escapeHtml(message.action.url)}" style="background:#047857;color:#fff;padding:12px 18px;border-radius:10px;text-decoration:none;font-weight:700">${escapeHtml(message.action.label)}</a></p>`
    : "";
  return `<!doctype html><html><body style="margin:0;background:#f4f7f4;font-family:Arial,sans-serif;color:#063c2c"><div style="max-width:600px;margin:32px auto;background:#fff;border:1px solid #dce8e1;border-radius:18px;padding:32px"><p style="color:#047857;font-weight:700">MJD Football Scout</p><h1 style="font-size:24px">${escapeHtml(message.heading)}</h1><p style="line-height:1.65;color:#365b4e">${escapeHtml(message.body)}</p>${action}<p style="margin-top:32px;font-size:13px;color:#6b8078">If you did not request this action, secure your account immediately.</p></div></body></html>`;
}

export function createEmailService(environment: string) {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM || process.env.PASSWORD_RESET_FROM_EMAIL;

  const send = async (message: EmailMessage) => {
    if (!apiKey || !from) {
      if (environment === "production")
        logger.error("Email delivery is not configured");
      else logger.info(`[email:preview] ${message.subject} -> ${message.to}`);
      return false;
    }
    await axios.post(
      "https://api.resend.com/emails",
      {
        from,
        to: [message.to],
        subject: message.subject,
        text: `${message.heading}\n\n${message.body}${message.action ? `\n\n${message.action.label}: ${message.action.url}` : ""}`,
        html: renderHtml(message),
      },
      { headers: { Authorization: `Bearer ${apiKey}` }, timeout: 8000 },
    );
    return true;
  };

  return {
    sendVerification: (to: string, url: string) =>
      send({
        to,
        subject: "Verify your MJD Football Scout email",
        heading: "Confirm your email address",
        body: "Verify your email to activate your account. This secure link expires in 24 hours.",
        action: { label: "Verify Email", url },
      }),
    sendPasswordReset: (to: string, url: string) =>
      send({
        to,
        subject: "Reset your MJD Football Scout password",
        heading: "Reset your password",
        body: "Use this secure link to choose a new password. The link expires in 30 minutes and can only be used once.",
        action: { label: "Reset Password", url },
      }),
    sendSecurityNotice: (to: string, heading: string, body: string) =>
      send({ to, subject: `${heading} – MJD Football Scout`, heading, body }),
  };
}
