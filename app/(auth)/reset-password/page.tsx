import Link from "next/link";

import { AuthFrame } from "@/components/auth/auth-frame";
import { ResetPasswordForm } from "@/components/auth/auth-forms";

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token = "" } = await searchParams;
  return (
    <AuthFrame
      eyebrow="New password"
      title="设置一个新密码"
      description="保存后，其他设备上的旧登录会话将全部失效。"
      footer={
        <Link
          href="/login"
          className="font-medium text-[#27764b] hover:underline"
        >
          返回登录
        </Link>
      }
    >
      <ResetPasswordForm token={token} />
    </AuthFrame>
  );
}
