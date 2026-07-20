import assert from "node:assert/strict";
import test from "node:test";
import { renderEmailHtml, renderEmailText } from "./email.service";
import { emailTemplates } from "./email.templates";

test("provides a dedicated template for every authentication email", () => {
  const templates = [
    emailTemplates.signupVerification("https://example.com/verify?token=abc"),
    emailTemplates.emailVerified(),
    emailTemplates.passwordResetRequest("https://example.com/reset?token=abc"),
    emailTemplates.passwordResetComplete(),
    emailTemplates.passwordChanged(),
    emailTemplates.mfaEnabled(),
    emailTemplates.mfaDisabled(),
    emailTemplates.accountDeactivated(),
  ];

  assert.equal(templates.length, 8);
  assert.equal(new Set(templates.map((template) => template.subject)).size, 8);
  assert.ok(
    templates.every(
      (template) =>
        template.subject.length > 0 &&
        template.preheader.length > 0 &&
        template.heading.length > 0 &&
        template.paragraphs.length > 0,
    ),
  );
});

test("renders accessible HTML and a plain-text fallback", () => {
  const template = emailTemplates.signupVerification(
    "https://example.com/verify?token=a&next=<login>",
  );
  const html = renderEmailHtml(template);
  const text = renderEmailText(template);

  assert.match(html, /<html lang="en">/);
  assert.match(html, /role="presentation"/);
  assert.match(html, /a&amp;next=&lt;login&gt;/);
  assert.doesNotMatch(html, /a&next=<login>/);
  assert.match(text, /Verify email: https:\/\/example.com\/verify/);
});
