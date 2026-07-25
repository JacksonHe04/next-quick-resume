import Link from "next/link";

import { AuthFrame } from "@/components/auth/auth-frame";
import { LoginForm } from "@/components/auth/auth-forms";
import { safePostAuthPath } from "@/modules/auth/navigation";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const nextPath = safePostAuthPath((await searchParams).next);
  const registerHref = `/register?next=${encodeURIComponent(nextPath)}`;

  return (
    <AuthFrame
      eyebrow="Welcome back"
      title="继续你的求职路径"
      description="登录后，回到你上次推进的位置。"
      footer={
        <>
          还没有账户？{" "}
          <Link
            href={registerHref}
            className="font-medium text-foreground underline-offset-4 hover:underline"
          >
            免费注册
          </Link>
        </>
      }
    >
      <LoginForm nextPath={nextPath} />
    </AuthFrame>
  );
}
