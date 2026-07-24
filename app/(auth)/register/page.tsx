import Link from "next/link";

import { AuthFrame } from "@/components/auth/auth-frame";
import { RegisterForm } from "@/components/auth/auth-forms";

export default function RegisterPage() {
  return (
    <AuthFrame
      eyebrow="Start clearly"
      title="建立你的求职空间"
      description="从一份简历开始，逐步把投递和面试串起来。"
      footer={
        <>
          已经注册？{" "}
          <Link
            href="/login"
            className="font-medium text-[#27764b] hover:underline"
          >
            直接登录
          </Link>
        </>
      }
    >
      <RegisterForm />
    </AuthFrame>
  );
}
