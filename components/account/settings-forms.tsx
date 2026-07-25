import { ExternalLink, LogOut } from "lucide-react";

import { Button, Card } from "@/components/ui";
import { saylessLogoutPath } from "@/modules/auth/paths";

export function SettingsForms({
  user,
}: {
  user: { name: string; email: string };
}) {
  return (
    <div className="mt-7 space-y-5">
      <Card className="p-5 shadow-none sm:p-6">
        <div className="border-b border-border pb-4">
          <h2 className="font-[var(--font-display)] text-lg font-semibold tracking-[-0.03em]">
            iNon 统一账号
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            SAYLESS 使用与 iNon、Leaf、PINE 和 Treez 相同的账号。
          </p>
        </div>
        <div className="mt-5 grid max-w-lg gap-4">
          <div className="rounded-xl border border-border px-4 py-3">
            <p className="font-medium">{user.name}</p>
            <p className="mt-1 text-sm text-muted-foreground">{user.email}</p>
          </div>
          <div>
            <Button asChild>
              <a href="https://inon.space/sso/account">
                管理用户名、密码与会话
                <ExternalLink aria-hidden="true" />
              </a>
            </Button>
          </div>
        </div>
      </Card>

      <Card className="p-5 shadow-none sm:p-6">
        <div className="border-b border-border pb-4">
          <h2 className="font-[var(--font-display)] text-lg font-semibold tracking-[-0.03em]">
            登录会话
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            退出当前设备上的 SAYLESS 会话，不影响其他 iNon 项目。
          </p>
        </div>
        <div className="mt-5">
          <Button asChild variant="outline">
            <a href={saylessLogoutPath("/")}>
              <LogOut aria-hidden="true" />
              退出 SAYLESS
            </a>
          </Button>
        </div>
      </Card>
    </div>
  );
}
