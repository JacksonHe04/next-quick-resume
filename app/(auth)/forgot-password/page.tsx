import Link from "next/link";

import { AuthFrame } from "@/components/auth/auth-frame";
import { ForgotPasswordForm } from "@/components/auth/auth-forms";

export default function ForgotPasswordPage() {
  return (
    <AuthFrame
      eyebrow="Account recovery"
      title="重新设置密码"
      description="输入注册邮箱，我们会发送一条有效期为一小时的重置链接。"
      footer={
        <Link
          href="/login"
          className="font-medium text-[#27764b] hover:underline"
        >
          返回登录
        </Link>
      }
    >
      <ForgotPasswordForm />
    </AuthFrame>
  );
}
