import { Resend } from "resend";

import type { TransactionalEmail } from "@/modules/auth/service";

type EmailPayload = {
  from: string;
  to: string[];
  subject: string;
  html: string;
};

type EmailResult = {
  data: { id: string } | null;
  error: { message: string } | null;
};

type EmailClient = {
  send(payload: EmailPayload): Promise<EmailResult>;
};

/**
 * Build the inline logo header that's appended to every SAYLESS email.
 *
 * We use a <img> tag pointing at the deployed origin's `/logo-180.png`
 * because Resend and most mail clients already cache / proxy remote images
 * — inlining a 60KB+ base64 PNG makes the email heavier without visual gain.
 *
 * `origin` is supplied by the caller (typically `publicOrigin()` from
 * `modules/auth/inon-sso.ts`) so production emails always reference the
 * deployed domain and local dev falls back to `http://localhost:3000`.
 */
function brandHeader(origin: string): string {
  const logoUrl = `${origin.replace(/\/$/, "")}/logo-180.png`;
  return `
    <div style="margin: 0 0 20px 0; padding: 16px 0; border-bottom: 1px solid #e6ece8;">
      <img src="${logoUrl}" alt="SAYLESS" width="36" height="36"
           style="display:block; width:36px; height:36px; border:0; outline:none; text-decoration:none;" />
    </div>
  `;
}

function emailShell(origin: string, body: string): string {
  return `
    <div style="font-family: Arial, sans-serif; color: #18211b; line-height: 1.6; max-width: 560px; margin: 0 auto;">
      ${brandHeader(origin)}
      ${body}
    </div>
  `;
}

function verificationEmailHtml(origin: string, code: string): string {
  return emailShell(
    origin,
    `
      <p>你好，</p>
      <p>你的 SAYLESS 注册验证码是：</p>
      <p style="font-size: 28px; font-weight: 700; letter-spacing: 6px">${code}</p>
      <p>验证码将在 10 分钟后失效。如果不是你本人操作，可以忽略这封邮件。</p>
    `,
  );
}

function passwordResetEmailHtml(origin: string, url: string): string {
  return emailShell(
    origin,
    `
      <p>你好，</p>
      <p>点击下面的按钮重置你的 SAYLESS 登录密码：</p>
      <p>
        <a href="${url}" style="display: inline-block; padding: 10px 18px; border-radius: 8px; background: #238b57; color: #ffffff; text-decoration: none">
          重置密码
        </a>
      </p>
      <p>链接将在 1 小时后失效。如果不是你本人操作，可以忽略这封邮件。</p>
    `,
  );
}

export function createResendEmail(
  client: EmailClient,
  from: string,
  origin: string,
): TransactionalEmail {
  async function send(payload: EmailPayload): Promise<void> {
    const result = await client.send(payload);
    if (result.error) {
      throw new Error(result.error.message);
    }
  }

  return {
    async sendVerificationCode({ to, code }) {
      await send({
        from,
        to: [to],
        subject: "你的 SAYLESS 注册验证码",
        html: verificationEmailHtml(origin, code),
      });
    },

    async sendPasswordReset({ to, url }) {
      await send({
        from,
        to: [to],
        subject: "重置你的 SAYLESS 登录密码",
        html: passwordResetEmailHtml(origin, url),
      });
    },
  };
}

export function createTransactionalEmail(
  apiKey: string,
  from: string,
  origin: string,
): TransactionalEmail {
  const resend = new Resend(apiKey);

  return createResendEmail(
    {
      async send(payload) {
        const result = await resend.emails.send(payload);
        return {
          data: result.data,
          error: result.error
            ? { message: result.error.message }
            : null,
        };
      },
    },
    from,
    origin,
  );
}
