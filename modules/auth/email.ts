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

function verificationEmailHtml(code: string): string {
  return `
    <div style="font-family: Arial, sans-serif; color: #18211b; line-height: 1.6">
      <p>你好，</p>
      <p>你的 SAYLESS 注册验证码是：</p>
      <p style="font-size: 28px; font-weight: 700; letter-spacing: 6px">${code}</p>
      <p>验证码将在 10 分钟后失效。如果不是你本人操作，可以忽略这封邮件。</p>
    </div>
  `;
}

function passwordResetEmailHtml(url: string): string {
  return `
    <div style="font-family: Arial, sans-serif; color: #18211b; line-height: 1.6">
      <p>你好，</p>
      <p>点击下面的按钮重置你的 SAYLESS 登录密码：</p>
      <p>
        <a href="${url}" style="display: inline-block; padding: 10px 18px; border-radius: 8px; background: #238b57; color: #ffffff; text-decoration: none">
          重置密码
        </a>
      </p>
      <p>链接将在 1 小时后失效。如果不是你本人操作，可以忽略这封邮件。</p>
    </div>
  `;
}

export function createResendEmail(
  client: EmailClient,
  from: string,
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
        html: verificationEmailHtml(code),
      });
    },

    async sendPasswordReset({ to, url }) {
      await send({
        from,
        to: [to],
        subject: "重置你的 SAYLESS 登录密码",
        html: passwordResetEmailHtml(url),
      });
    },
  };
}

export function createTransactionalEmail(
  apiKey: string,
  from: string,
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
  );
}
