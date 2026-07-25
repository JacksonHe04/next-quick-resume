import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";

export function AuthFrame({
  eyebrow,
  title,
  description,
  children,
  footer,
}: {
  eyebrow: string;
  title: string;
  description: string;
  children: ReactNode;
  footer: ReactNode;
}) {
  return (
    <main className="grid min-h-screen place-items-center bg-muted/30 px-4 py-12">
      <div className="w-full max-w-[420px]">
        <Link
          href="/"
          className="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft size={15} />
          返回首页
        </Link>
        <section className="rounded-xl border border-border bg-background p-6 shadow-xl shadow-black/[0.04] sm:p-8">
          <span className="grid size-8 place-items-center rounded-md bg-foreground text-xs font-semibold text-background">
            S
          </span>
          <p className="mt-6 text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground">
            {eyebrow}
          </p>
          <h1 className="mt-2 text-[1.8rem] font-semibold leading-tight tracking-[-0.045em]">
            {title}
          </h1>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            {description}
          </p>
          <div className="mt-7">{children}</div>
          <div className="mt-7 border-t border-border pt-5 text-center text-sm text-muted-foreground">
            {footer}
          </div>
        </section>
      </div>
    </main>
  );
}
