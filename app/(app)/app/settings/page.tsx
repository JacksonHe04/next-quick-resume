import Link from "next/link";

import { SettingsForms } from "@/components/account/settings-forms";
import { AppTopbarPortal } from "@/components/app/app-topbar";
import { Button, Card, CardContent } from "@/components/ui";
import { getAppReadContext } from "@/modules/app/read-context";

export default async function SettingsPage() {
  const { user } = await getAppReadContext();

  return (
    <div className="mx-auto max-w-5xl px-5 py-7 lg:py-9">
      <AppTopbarPortal>
        <p className="text-sm font-medium">账号设置</p>
        {user ? (
          <p className="ml-auto text-xs text-muted-foreground">
            {user.email}
          </p>
        ) : null}
      </AppTopbarPortal>
      {user ? (
        <SettingsForms user={{ name: user.name, email: user.email }} />
      ) : (
        <Card className="mt-8 max-w-xl">
          <CardContent className="space-y-4 py-8">
            <div>
              <h2 className="text-base font-medium">登录后管理个人设置</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                访客可以浏览 SAYLESS 的全部功能页面；个人资料、密码和账户数据需要登录后管理。
              </p>
            </div>
            <Button asChild>
              <Link href="/login?next=%2Fapp%2Fsettings">登录</Link>
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
