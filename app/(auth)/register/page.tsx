import Link from "next/link";

import { AuthFrame } from "@/components/auth/auth-frame";
import { RegisterForm } from "@/components/auth/auth-forms";
import { safePostAuthPath } from "@/modules/auth/navigation";

export default async function RegisterPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const nextPath = safePostAuthPath((await searchParams).next);
  const loginHref = `/login?next=${encodeURIComponent(nextPath)}`;

  return (
    <AuthFrame
      eyebrow="Start clearly"
      title="建立你的求职空间"
      description="从一份简历开始，逐步把投递和面试串起来。"
      footer={
        <>
          已经注册？{" "}
          <Link
            href={loginHref}
            className="font-medium text-foreground underline-offset-4 hover:underline"
          >
            直接登录
          </Link>
        </>
      }
    >
      <RegisterForm nextPath={nextPath} />
    </AuthFrame>
  );
}
