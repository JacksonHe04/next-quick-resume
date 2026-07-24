import {
  ArrowRight,
  CalendarCheck,
  Check,
  FileText,
  MessageSquareText,
  Send,
} from "lucide-react";
import Link from "next/link";

const FLOW = [
  { label: "整理简历", icon: FileText },
  { label: "记录投递", icon: Send },
  { label: "准备面试", icon: CalendarCheck },
  { label: "沉淀答案", icon: MessageSquareText },
] as const;

export default function LandingPage() {
  return (
    <main className="overflow-hidden">
      <header className="mx-auto flex h-20 max-w-7xl items-center justify-between px-5 sm:px-8">
        <Link
          href="/"
          className="font-[var(--font-display)] text-lg font-semibold tracking-[-0.04em]"
        >
          SAYLESS
        </Link>
        <nav className="flex items-center gap-2" aria-label="账户入口">
          <Link
            href="/login"
            className="rounded-xl px-4 py-2.5 text-sm font-medium text-[#4f5951] transition hover:bg-white"
          >
            登录
          </Link>
          <Link
            href="/register"
            className="rounded-xl bg-[#27764b] px-4 py-2.5 text-sm font-medium text-white shadow-[0_8px_24px_rgb(39_118_75/0.16)] transition hover:bg-[#1f603d]"
          >
            免费开始
          </Link>
        </nav>
      </header>

      <section className="relative mx-auto max-w-7xl px-5 pb-24 pt-14 sm:px-8 sm:pt-24 lg:grid lg:grid-cols-[1.06fr_0.94fr] lg:items-center lg:gap-16 lg:pb-32">
        <div>
          <p className="mb-5 inline-flex items-center gap-2 rounded-full border border-[#cae2d1] bg-[#eaf6ee] px-3 py-1.5 text-xs font-medium text-[#27764b]">
            <span className="size-1.5 rounded-full bg-[#55b97a]" />
            为完整求职流程而做
          </p>
          <h1 className="max-w-[760px] font-[var(--font-display)] text-[clamp(2.8rem,7vw,5.9rem)] font-semibold leading-[0.96] tracking-[-0.065em] text-[#202620]">
            别让求职，
            <br />
            变成一堆
            <span className="relative ml-[0.12em] inline-block text-[#27764b]">
              碎片
              <svg
                className="absolute -bottom-2 left-0 w-full text-[#55b97a]"
                viewBox="0 0 220 10"
                fill="none"
                aria-hidden="true"
              >
                <path
                  d="M3 7C62 2 151 3 217 5"
                  stroke="currentColor"
                  strokeWidth="5"
                  strokeLinecap="round"
                />
              </svg>
            </span>
            。
          </h1>
          <p className="mt-8 max-w-xl text-base leading-7 text-[#687269] sm:text-lg sm:leading-8">
            SAYLESS 把简历、已投递岗位、每一轮选拔和面试题放在同一条路径上。你只需要专注下一步。
          </p>
          <div className="mt-9 flex flex-wrap items-center gap-3">
            <Link
              href="/register"
              className="group inline-flex min-h-12 items-center gap-2 rounded-xl bg-[#27764b] px-5 text-sm font-medium text-white shadow-[0_12px_30px_rgb(39_118_75/0.2)] transition hover:-translate-y-0.5 hover:bg-[#1f603d]"
            >
              建立我的求职路径
              <ArrowRight
                size={17}
                className="transition group-hover:translate-x-0.5"
              />
            </Link>
            <span className="inline-flex items-center gap-1.5 px-2 text-sm text-[#687269]">
              <Check size={15} className="text-[#55b97a]" />
              完全免费
            </span>
          </div>
        </div>

        <div className="relative mt-16 lg:mt-0">
          <div className="absolute -inset-8 -z-10 rounded-full bg-[#55b97a]/10 blur-3xl" />
          <div className="rounded-[28px] border border-[#dce5dd] bg-white p-5 shadow-[0_30px_100px_rgb(32_38_32/0.12)] sm:p-7">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-[#879088]">当前批次</p>
                <p className="mt-1 font-[var(--font-display)] text-lg font-semibold">
                  2026 夏季产品岗
                </p>
              </div>
              <span className="rounded-full bg-[#e7f6ec] px-3 py-1 text-xs font-medium text-[#27764b]">
                进行中
              </span>
            </div>

            <div className="mt-9">
              <div className="relative grid grid-cols-4">
                <span className="absolute left-[12.5%] right-[12.5%] top-3 h-px bg-[#cbd7cc]" />
                <span className="absolute left-[12.5%] top-3 h-px w-1/2 bg-[#55b97a]" />
                {FLOW.map(({ label, icon: Icon }, index) => (
                  <div
                    key={label}
                    className="relative z-10 flex flex-col items-center text-center"
                  >
                    <span
                      className={
                        index < 3
                          ? "grid size-6 place-items-center rounded-full border-4 border-white bg-[#55b97a] shadow-[0_0_0_1px_#55b97a]"
                          : "grid size-6 place-items-center rounded-full border border-[#cbd7cc] bg-white"
                      }
                    >
                      {index === 2 ? (
                        <span className="size-1.5 rounded-full bg-white" />
                      ) : null}
                    </span>
                    <Icon
                      size={17}
                      className="mt-4 text-[#687269]"
                      aria-hidden="true"
                    />
                    <span className="mt-1.5 text-xs font-medium text-[#4f5951]">
                      {label}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-8 grid grid-cols-3 gap-2.5">
              {[
                ["已投递", "24"],
                ["进行中", "8"],
                ["面试", "5"],
              ].map(([label, value]) => (
                <div
                  key={label}
                  className="rounded-2xl border border-[#e3e9e3] bg-[#f8faf6] px-3 py-4"
                >
                  <p className="font-[var(--font-data)] text-2xl font-semibold tracking-[-0.05em]">
                    {value}
                  </p>
                  <p className="mt-1 text-xs text-[#879088]">{label}</p>
                </div>
              ))}
            </div>

            <div className="mt-3 rounded-2xl border border-[#e3e9e3] p-4">
              <p className="text-xs font-medium text-[#879088]">下一场面试</p>
              <div className="mt-2 flex items-end justify-between gap-4">
                <div>
                  <p className="font-medium">产品案例面 · 第二轮</p>
                  <p className="mt-1 text-xs text-[#687269]">
                    7 月 28 日，14:00
                  </p>
                </div>
                <span className="font-[var(--font-data)] text-xs text-[#27764b]">
                  03 DAYS
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-y border-[#dce5dd] bg-white/65">
        <div className="mx-auto grid max-w-7xl gap-px bg-[#dce5dd] sm:grid-cols-3">
          {[
            ["一条路径", "从投递到每轮选拔，状态自动向前推进。"],
            ["一个题库", "标准答案持续迭代，随时关联到具体面试。"],
            ["一个视角", "统计、转化和近期安排，在首页同时看清。"],
          ].map(([title, description]) => (
            <article key={title} className="bg-[#fbfcf9] px-6 py-10 sm:px-8">
              <h2 className="font-[var(--font-display)] text-xl font-semibold tracking-[-0.03em]">
                {title}
              </h2>
              <p className="mt-3 max-w-sm text-sm leading-6 text-[#687269]">
                {description}
              </p>
            </article>
          ))}
        </div>
      </section>

      <footer className="mx-auto flex max-w-7xl flex-col gap-3 px-5 py-10 text-xs text-[#879088] sm:flex-row sm:items-center sm:justify-between sm:px-8">
        <span>© 2026 SAYLESS</span>
        <span>把复杂留给系统，把注意力留给下一步。</span>
      </footer>
    </main>
  );
}
