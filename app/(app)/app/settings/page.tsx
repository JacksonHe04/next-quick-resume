import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { SettingsForms } from "@/components/account/settings-forms";
import { getAuthRepository } from "@/modules/auth/server";
import {
  resolveSession,
  SESSION_COOKIE_NAME,
} from "@/modules/auth/session";

export default async function SettingsPage() {
  const token = (await cookies()).get(SESSION_COOKIE_NAME)?.value;
  if (!token) redirect("/login");

  const repository = await getAuthRepository();
  const session = await resolveSession(repository, token);
  if (!session) redirect("/login");
  const user = await repository.findUserById(session.userId);
  if (!user) redirect("/login");

  return (
    <div className="mx-auto max-w-5xl px-5 py-10">
      <h1 className="font-[var(--font-display)] text-3xl font-semibold tracking-[-0.04em]">
        个人设置
      </h1>
      <p className="mt-2 text-sm text-[#687269]">
        管理个人资料、登录安全和账户数据。
      </p>
      <SettingsForms user={{ name: user.name, email: user.email }} />
    </div>
  );
}
