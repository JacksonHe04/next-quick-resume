import { ArrowLeft, Sparkles } from "lucide-react";
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
    <main className="relative grid min-h-screen place-items-center overflow-hidden px-4 py-12">
      <div className="pointer-events-none absolute -right-40 -top-40 size-[32rem] rounded-full bg-[#55b97a]/10 blur-3xl" />
      <div className="relative w-full max-w-[430px]">
        <Link
          href="/"
          className="mb-8 inline-flex items-center gap-2 text-sm text-[#687269] transition hover:text-[#202620]"
        >
          <ArrowLeft size={15} />
          返回首页
        </Link>
        <section className="rounded-[24px] border border-[#dce5dd] bg-white p-6 shadow-[0_28px_90px_rgb(32_38_32/0.11)] sm:p-8">
          <span className="grid size-10 place-items-center rounded-xl bg-[#27764b] text-white shadow-[0_9px_22px_rgb(39_118_75/0.18)]">
            <Sparkles size={18} />
          </span>
          <p className="mt-6 text-xs font-medium uppercase tracking-[0.14em] text-[#55a572]">
            {eyebrow}
          </p>
          <h1 className="mt-2 font-[var(--font-display)] text-[2rem] font-semibold leading-tight tracking-[-0.05em]">
            {title}
          </h1>
          <p className="mt-2 text-sm leading-6 text-[#687269]">
            {description}
          </p>
          <div className="mt-7">{children}</div>
          <div className="mt-7 border-t border-[#edf0ed] pt-5 text-center text-sm text-[#687269]">
            {footer}
          </div>
        </section>
      </div>
    </main>
  );
}
