import { brand, brandLogoUrl } from "@/lib/brand";

export const REAWAKEN_WELCOME_TEMPLATE_NAME = "Reawaken — Welcome";
export const REAWAKEN_WELCOME_TEMPLATE_TAG = "reawaken";

export const REAWAKEN_WELCOME_SUBJECT =
  "Welcome to Reawaken USA{% if params.FIRSTNAME %}, {{ params.FIRSTNAME }}{% endif %}!";

export function buildReawakenWelcomeEmailHtml(logoUrl = brandLogoUrl()) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Welcome to Reawaken USA</title>
</head>
<body style="margin:0;padding:0;background:${brand.colors.background};font-family:Inter,Arial,Helvetica,sans-serif;color:${brand.colors.black};">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:${brand.colors.background};padding:32px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="600" cellspacing="0" cellpadding="0" style="max-width:600px;background:#ffffff;border-radius:12px;border:1px solid ${brand.colors.border};overflow:hidden;">
          <tr>
            <td style="padding:32px 40px 24px;text-align:center;background:${brand.colors.black};">
              <img src="${logoUrl}" alt="Reawaken USA" width="72" height="72" style="display:block;margin:0 auto 16px;border:0;" />
              <p style="margin:0;font-size:13px;letter-spacing:0.08em;text-transform:uppercase;color:#ffffff;opacity:0.85;">Reawaken USA</p>
            </td>
          </tr>
          <tr>
            <td style="padding:40px;">
              <h1 style="margin:0 0 16px;font-size:28px;line-height:1.25;color:${brand.colors.black};">
                Welcome{% if params.FIRSTNAME %}, {{ params.FIRSTNAME }}{% endif %}!
              </h1>
              <p style="margin:0 0 16px;font-size:16px;line-height:1.7;color:${brand.colors.navy};">
                We're glad you're here. Reawaken USA is building a nationwide movement of faith, freedom, and campus leadership — and you're now part of it.
              </p>
              <p style="margin:0 0 24px;font-size:16px;line-height:1.7;color:${brand.colors.navy};">
                Your Command Center account is your hub for tasks, events, and team communication. Use the button below to sign in anytime.
              </p>
              <table role="presentation" cellspacing="0" cellpadding="0" style="margin:0 0 28px;">
                <tr>
                  <td style="border-radius:8px;background:${brand.colors.red};">
                    <a href="${brand.commandCenterUrl}" style="display:inline-block;padding:14px 28px;font-size:15px;font-weight:600;color:#ffffff;text-decoration:none;">
                      Open Command Center
                    </a>
                  </td>
                </tr>
              </table>
              <p style="margin:0 0 8px;font-size:15px;line-height:1.7;color:${brand.colors.navy};">
                Learn more about our mission at
                <a href="${brand.website}" style="color:${brand.colors.red};text-decoration:underline;">reawakenusa.org</a>.
              </p>
              <p style="margin:24px 0 0;font-size:14px;line-height:1.6;color:${brand.colors.muted};">
                Questions? Reply to this email or contact us at
                <a href="mailto:${brand.supportEmail}" style="color:${brand.colors.red};">${brand.supportEmail}</a>.
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding:24px 40px;background:#F1F5F9;border-top:1px solid ${brand.colors.border};text-align:center;">
              <p style="margin:0;font-size:12px;line-height:1.6;color:${brand.colors.muted};">
                Reawaken USA · 501(c)(3) nonprofit<br />
                <a href="${brand.website}" style="color:${brand.colors.muted};">${brand.website.replace("https://", "")}</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

/** Local preview / demo-mode template object. */
export function getReawakenWelcomeTemplate() {
  const html = buildReawakenWelcomeEmailHtml();
  return {
    id: "reawaken-welcome",
    name: REAWAKEN_WELCOME_TEMPLATE_NAME,
    channel: "email" as const,
    subject: "Welcome to Reawaken USA!",
    preview:
      "Welcome to Reawaken USA — open Command Center, explore our mission, and get started with the team.",
    body: html,
    category: REAWAKEN_WELCOME_TEMPLATE_TAG,
    updatedAt: new Date().toISOString().slice(0, 10),
    usageCount: 0,
  };
}
