"use client";

import { useRouter } from "next/navigation";
import {
  useCallback,
  type FormEvent,
  useEffect,
  useRef,
  useState,
} from "react";

import { Button, Input } from "@/components/ui";

type ApiErrorPayload = {
  error?: { message?: string };
};

async function postJson(
  url: string,
  body: Record<string, string>,
): Promise<Response> {
  const response = await fetch(url, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!response.ok) {
    const payload = (await response.json().catch(() => ({}))) as ApiErrorPayload;
    throw new Error(payload.error?.message ?? "操作失败，请稍后再试");
  }
  return response;
}

function Field({
  label,
  name,
  type = "text",
  autoComplete,
  placeholder,
  defaultValue,
}: {
  label: string;
  name: string;
  type?: string;
  autoComplete?: string;
  placeholder?: string;
  defaultValue?: string;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-medium text-muted-foreground">
        {label}
      </span>
      <Input
        name={name}
        type={type}
        autoComplete={autoComplete}
        placeholder={placeholder}
        defaultValue={defaultValue}
        required
      />
    </label>
  );
}

function FormMessage({
  error,
  success,
}: {
  error?: string;
  success?: string;
}) {
  const message = error ?? success;
  if (!message) return null;
  return (
    <p
      role={error ? "alert" : "status"}
      className={
        error
          ? "rounded-xl border border-[#ebc3c8] bg-[#fbecef] px-3 py-2.5 text-sm text-[#9d4450]"
          : "rounded-xl border border-[#baddc6] bg-[#e7f6ec] px-3 py-2.5 text-sm text-foreground"
      }
    >
      {message}
    </p>
  );
}

export function LoginForm({
  nextPath = "/app",
  developmentLoginEnabled = false,
}: {
  nextPath?: string;
  developmentLoginEnabled?: boolean;
}) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [developmentPending, setDevelopmentPending] =
    useState(false);
  const [error, setError] = useState<string>();
  const developmentLoginStarted = useRef(false);

  const loginDevelopmentAccount = useCallback(async () => {
    setDevelopmentPending(true);
    setError(undefined);
    try {
      await postJson("/api/auth/development-login", {});
      router.replace(nextPath);
      router.refresh();
    } catch (submissionError) {
      setError(
        `开发快捷登录失败：${(submissionError as Error).message}`,
      );
    } finally {
      setDevelopmentPending(false);
    }
  }, [nextPath, router]);

  useEffect(() => {
    if (
      !developmentLoginEnabled ||
      developmentLoginStarted.current
    ) {
      return;
    }
    developmentLoginStarted.current = true;
    void loginDevelopmentAccount();
  }, [developmentLoginEnabled, loginDevelopmentAccount]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError(undefined);
    const data = new FormData(event.currentTarget);
    try {
      await postJson("/api/auth/login", {
        email: String(data.get("email")),
        password: String(data.get("password")),
      });
      router.replace(nextPath);
      router.refresh();
    } catch (submissionError) {
      setError((submissionError as Error).message);
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <Field
        label="邮箱"
        name="email"
        type="email"
        autoComplete="email"
        placeholder="you@example.com"
      />
      <Field
        label="密码"
        name="password"
        type="password"
        autoComplete="current-password"
        placeholder="输入登录密码"
      />
      <div className="flex justify-end">
        <a
          href="/forgot-password"
          className="text-xs font-medium text-foreground hover:underline"
        >
          忘记密码？
        </a>
      </div>
      <FormMessage error={error} />
      {developmentLoginEnabled ? (
        <Button
          type="button"
          variant="secondary"
          block
          loading={developmentPending}
          onClick={loginDevelopmentAccount}
        >
          直接登录开发账号
        </Button>
      ) : null}
      <Button type="submit" block loading={pending}>
        登录
      </Button>
    </form>
  );
}

export function RegisterForm({ nextPath = "/app" }: { nextPath?: string }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [codePending, setCodePending] = useState(false);
  const [codeSent, setCodeSent] = useState(false);
  const [error, setError] = useState<string>();

  async function requestCode(form: HTMLFormElement) {
    const data = new FormData(form);
    const email = String(data.get("email"));
    if (!email) {
      setError("请先输入邮箱");
      return;
    }
    setCodePending(true);
    setError(undefined);
    try {
      await postJson("/api/auth/register/code", { email });
      setCodeSent(true);
    } catch (requestError) {
      setError((requestError as Error).message);
    } finally {
      setCodePending(false);
    }
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError(undefined);
    const data = new FormData(event.currentTarget);
    try {
      await postJson("/api/auth/register", {
        name: String(data.get("name")),
        email: String(data.get("email")),
        code: String(data.get("code")),
        password: String(data.get("password")),
      });
      router.replace(nextPath);
      router.refresh();
    } catch (submissionError) {
      setError((submissionError as Error).message);
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <Field
        label="你的名字"
        name="name"
        autoComplete="name"
        placeholder="怎么称呼你"
      />
      <Field
        label="邮箱"
        name="email"
        type="email"
        autoComplete="email"
        placeholder="you@example.com"
      />
      <div>
        <span className="mb-2 block text-sm font-medium text-muted-foreground">
          邮箱验证码
        </span>
        <div className="grid grid-cols-[1fr_auto] gap-2">
          <Input
            name="code"
            inputMode="numeric"
            autoComplete="one-time-code"
            pattern="[0-9]{6}"
            maxLength={6}
            placeholder="6 位验证码"
            required
          />
          <Button
            type="button"
            variant="secondary"
            loading={codePending}
            onClick={(event) =>
              requestCode(event.currentTarget.form!)
            }
          >
            {codeSent ? "重新发送" : "发送验证码"}
          </Button>
        </div>
      </div>
      <Field
        label="密码"
        name="password"
        type="password"
        autoComplete="new-password"
        placeholder="至少 8 个字符"
      />
      <FormMessage
        error={error}
        success={codeSent ? "验证码已发送，请查看邮箱" : undefined}
      />
      <Button type="submit" block loading={pending}>
        创建账户
      </Button>
    </form>
  );
}

export function ForgotPasswordForm() {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string>();
  const [sent, setSent] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError(undefined);
    const data = new FormData(event.currentTarget);
    try {
      await postJson("/api/auth/password/forgot", {
        email: String(data.get("email")),
      });
      setSent(true);
    } catch (submissionError) {
      setError((submissionError as Error).message);
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <Field
        label="注册邮箱"
        name="email"
        type="email"
        autoComplete="email"
        placeholder="you@example.com"
      />
      <FormMessage
        error={error}
        success={
          sent
            ? "如果该邮箱已注册，你会收到一封密码重置邮件"
            : undefined
        }
      />
      <Button type="submit" block loading={pending}>
        发送重置邮件
      </Button>
    </form>
  );
}

export function ResetPasswordForm({ token }: { token: string }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string>();

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError(undefined);
    const data = new FormData(event.currentTarget);
    try {
      await postJson("/api/auth/password/reset", {
        token,
        password: String(data.get("password")),
      });
      router.replace("/login?reset=success");
    } catch (submissionError) {
      setError((submissionError as Error).message);
    } finally {
      setPending(false);
    }
  }

  if (!token) {
    return (
      <FormMessage error="重置链接缺少令牌，请重新申请密码重置邮件" />
    );
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <Field
        label="新密码"
        name="password"
        type="password"
        autoComplete="new-password"
        placeholder="至少 8 个字符"
      />
      <FormMessage error={error} />
      <Button type="submit" block loading={pending}>
        保存新密码
      </Button>
    </form>
  );
}
