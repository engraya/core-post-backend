/** HTML + plain-text builders for transactional email. Uses tables + inline styles for client compatibility. */

export type OtpEmailKind = 'verification' | 'password-reset';

const BRAND_NAME = 'Core Post';

const KIND_COPY: Record<
  OtpEmailKind,
  { title: string; headline: string; body: string; preheader: string }
> = {
  verification: {
    title: 'Your verification code',
    headline: 'Verify your email',
    body: 'Enter this code in the app to finish verifying your account. If you did not request this, you can ignore this email.',
    preheader: 'Your verification code is inside — it expires in 5 minutes.',
  },
  'password-reset': {
    title: 'Password reset code',
    headline: 'Reset your password',
    body: 'Use this code to set a new password. If you did not request a reset, you can ignore this email — your password will stay the same.',
    preheader: 'Your password reset code is inside — it expires in 5 minutes.',
  },
};

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/** Spaced digits for readability (e.g. 123 456). */
function formatCode(code: string): string {
  const digits = code.replace(/\D/g, '');
  if (digits.length <= 3) return digits;
  return `${digits.slice(0, 3)} ${digits.slice(3)}`;
}

export function buildOtpEmail(code: string, kind: OtpEmailKind): { html: string; text: string } {
  const copy = KIND_COPY[kind];
  const displayCode = escapeHtml(formatCode(code));
  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${escapeHtml(copy.title)}</title>
</head>
<body style="margin:0;padding:0;background-color:#eef1f6;-webkit-font-smoothing:antialiased;">
  <span style="display:none!important;font-size:1px;color:#eef1f6;line-height:1px;max-height:0;max-width:0;opacity:0;overflow:hidden;mso-hide:all;">
    ${escapeHtml(copy.preheader)}
  </span>
  <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color:#eef1f6;padding:24px 12px;">
    <tr>
      <td align="center">
        <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="max-width:520px;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 12px 40px rgba(15,23,42,0.08);">
          <tr>
            <td bgcolor="#1e3a5f" style="background:linear-gradient(135deg,#1e3a5f 0%,#2563eb 55%,#38bdf8 100%);padding:28px 32px 32px;">
              <p style="margin:0 0 4px;font-family:Georgia,'Times New Roman',serif;font-size:11px;letter-spacing:0.22em;text-transform:uppercase;color:rgba(255,255,255,0.85);">
                ${escapeHtml(BRAND_NAME)}
              </p>
              <h1 style="margin:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;font-size:24px;font-weight:700;line-height:1.25;color:#ffffff;">
                ${escapeHtml(copy.headline)}
              </h1>
            </td>
          </tr>
          <tr>
            <td style="padding:32px 32px 8px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;font-size:15px;line-height:1.65;color:#334155;">
              <p style="margin:0 0 24px;">${escapeHtml(copy.body)}</p>
              <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
                <tr>
                  <td align="center" style="background:#f1f5f9;border-radius:12px;border:1px solid #e2e8f0;padding:20px 16px;">
                    <p style="margin:0 0 8px;font-size:12px;font-weight:600;letter-spacing:0.08em;text-transform:uppercase;color:#64748b;">
                      Your code
                    </p>
                    <p style="margin:0;font-family:'SF Mono',Consolas,'Liberation Mono',Menlo,monospace;font-size:32px;font-weight:700;letter-spacing:0.12em;color:#0f172a;">
                      ${displayCode}
                    </p>
                  </td>
                </tr>
              </table>
              <p style="margin:24px 0 0;font-size:13px;line-height:1.6;color:#64748b;">
                This code expires in <strong style="color:#475569;">5 minutes</strong>. For your security, never share this code with anyone.
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding:0 32px 28px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;font-size:12px;line-height:1.5;color:#94a3b8;">
              <p style="margin:0;border-top:1px solid #e2e8f0;padding-top:20px;">
                Sent by ${escapeHtml(BRAND_NAME)} · This is an automated message, replies are not monitored.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`.trim();

  const text = [
    `${copy.headline} — ${BRAND_NAME}`,
    '',
    copy.body,
    '',
    `Your code: ${formatCode(code)}`,
    '',
    'This code expires in 5 minutes.',
  ].join('\n');

  return { html, text };
}
