"use client";

import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { type FormEvent, useState } from "react";

import { Button, Card, Input } from "@/components/ui";

type ApiErrorPayload = {
  error?: { message?: string };
};

async function requestJson(
  url: string,
  method: "PATCH" | "DELETE",
  body: Record<string, string>,
) {
  const response = await fetch(url, {
    method,
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!response.ok) {
    const payload = (await response.json().catch(() => ({}))) as ApiErrorPayload;
    throw new Error(payload.error?.message ?? "操作失败，请稍后再试");
  }
}

function Message({
  value,
  error = false,
}: {
  value?: string;
  error?: boolean;
}) {
  if (!value) return null;
  return (
    <p
      role={error ? "alert" : "status"}
      className={
        error
          ? "mt-3 text-sm text-[#9d4450]"
          : "mt-3 text-sm text-foreground"
      }
    >
      {value}
    </p>
  );
}

export function SettingsForms({
  user,
}: {
  user: { name: string; email: string };
}) {
  const router = useRouter();
  const [profilePending, setProfilePending] = useState(false);
  const [profileMessage, setProfileMessage] = useState<{
    text: string;
    error?: boolean;
  }>();
  const [passwordPending, setPasswordPending] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState<{
    text: string;
    error?: boolean;
  }>();
  const [logoutPending, setLogoutPending] = useState(false);
  const [logoutError, setLogoutError] = useState<string>();
  const [deletePending, setDeletePending] = useState(false);
  const [deleteError, setDeleteError] = useState<string>();

  async function saveProfile(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setProfilePending(true);
    setProfileMessage(undefined);
    const data = new FormData(event.currentTarget);
    try {
      await requestJson("/api/account/profile", "PATCH", {
        name: String(data.get("name")),
      });
      setProfileMessage({ text: "个人资料已更新" });
      router.refresh();
    } catch (error) {
      setProfileMessage({ text: (error as Error).message, error: true });
    } finally {
      setProfilePending(false);
    }
  }

  async function savePassword(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPasswordPending(true);
    setPasswordMessage(undefined);
    const data = new FormData(event.currentTarget);
    try {
      await requestJson("/api/account/password", "PATCH", {
        currentPassword: String(data.get("currentPassword")),
        newPassword: String(data.get("newPassword")),
      });
      router.replace("/login");
      router.refresh();
    } catch (error) {
      setPasswordMessage({
        text: (error as Error).message,
        error: true,
      });
    } finally {
      setPasswordPending(false);
    }
  }

  async function logout() {
    setLogoutPending(true);
    setLogoutError(undefined);
    try {
      const response = await fetch("/api/auth/logout", { method: "POST" });
      if (!response.ok) {
        throw new Error("退出失败，请稍后再试");
      }
      router.replace("/login");
      router.refresh();
    } catch (error) {
      setLogoutError((error as Error).message);
      setLogoutPending(false);
    }
  }

  async function removeAccount(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setDeletePending(true);
    setDeleteError(undefined);
    const data = new FormData(event.currentTarget);
    try {
      await requestJson("/api/account", "DELETE", {
        password: String(data.get("password")),
      });
      router.replace("/");
      router.refresh();
    } catch (error) {
      setDeleteError((error as Error).message);
    } finally {
      setDeletePending(false);
    }
  }

  return (
    <div className="mt-7 space-y-5">
      <Card className="p-5 shadow-none sm:p-6">
        <div className="border-b border-border pb-4">
          <h2 className="font-[var(--font-display)] text-lg font-semibold tracking-[-0.03em]">
            个人资料
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            这些信息会显示在你的个人区域。
          </p>
        </div>
        <form
          onSubmit={saveProfile}
          className="mt-5 grid max-w-lg gap-4"
        >
          <label>
            <span className="mb-2 block text-sm font-medium">姓名</span>
            <Input name="name" defaultValue={user.name} required />
          </label>
          <label>
            <span className="mb-2 block text-sm font-medium">邮箱</span>
            <Input value={user.email} disabled />
          </label>
          <div>
            <Button type="submit" loading={profilePending}>
              保存资料
            </Button>
            <Message
              value={profileMessage?.text}
              error={profileMessage?.error}
            />
          </div>
        </form>
      </Card>

      <Card className="p-5 shadow-none sm:p-6">
        <div className="border-b border-border pb-4">
          <h2 className="font-[var(--font-display)] text-lg font-semibold tracking-[-0.03em]">
            登录密码
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            修改后，所有设备需要使用新密码重新登录。
          </p>
        </div>
        <form
          onSubmit={savePassword}
          className="mt-5 grid max-w-lg gap-4"
        >
          <label>
            <span className="mb-2 block text-sm font-medium">当前密码</span>
            <Input
              name="currentPassword"
              type="password"
              autoComplete="current-password"
              required
            />
          </label>
          <label>
            <span className="mb-2 block text-sm font-medium">新密码</span>
            <Input
              name="newPassword"
              type="password"
              autoComplete="new-password"
              placeholder="至少 8 个字符"
              required
            />
          </label>
          <div>
            <Button type="submit" loading={passwordPending}>
              修改密码
            </Button>
            <Message
              value={passwordMessage?.text}
              error={passwordMessage?.error}
            />
          </div>
        </form>
      </Card>

      <Card className="p-5 shadow-none sm:p-6">
        <div className="border-b border-border pb-4">
          <h2 className="font-[var(--font-display)] text-lg font-semibold tracking-[-0.03em]">
            登录会话
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            退出当前设备上的 SAYLESS 账户。
          </p>
        </div>
        <div className="mt-5">
          <Button
            type="button"
            variant="outline"
            loading={logoutPending}
            onClick={() => void logout()}
          >
            {!logoutPending ? <LogOut aria-hidden="true" /> : null}
            退出登录
          </Button>
          <Message value={logoutError} error />
        </div>
      </Card>

      <Card className="border-[#ebc3c8] p-5 shadow-none sm:p-6">
        <div className="border-b border-[#f0dadd] pb-4">
          <h2 className="font-[var(--font-display)] text-lg font-semibold tracking-[-0.03em] text-[#9d4450]">
            删除账户
          </h2>
          <p className="mt-1 text-sm leading-6 text-[#795f63]">
            删除后，简历、投递、面试、题库和批次都会永久移除，无法恢复。
          </p>
        </div>
        <form
          onSubmit={removeAccount}
          className="mt-5 grid max-w-lg gap-4"
        >
          <label>
            <span className="mb-2 block text-sm font-medium">
              输入当前密码确认
            </span>
            <Input
              name="password"
              type="password"
              autoComplete="current-password"
              required
            />
          </label>
          <div>
            <Button
              type="submit"
              variant="danger"
              loading={deletePending}
            >
              永久删除账户
            </Button>
            <Message value={deleteError} error />
          </div>
        </form>
      </Card>
    </div>
  );
}
