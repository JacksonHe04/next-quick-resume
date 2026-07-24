import Link from "next/link";

import { AuthFrame } from "@/components/auth/auth-frame";
import { LoginForm } from "@/components/auth/auth-forms";

export default function LoginPage() {
  return (
    <AuthFrame
      eyebrow="Welcome back"
      title="继续你的求职路径"
      description="登录后，回到你上次推进的位置。"
      footer={
        <>
          还没有账户？{" "}
          <Link
            href="/register"
            className="font-medium text-[#27764b] hover:underline"
          >
            免费注册
          </Link>
        </>
      }
    >
      <LoginForm />
    </AuthFrame>
  );
}
