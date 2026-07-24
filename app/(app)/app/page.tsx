import {
  ArrowUpRight,
  CalendarClock,
  CircleCheck,
  Send,
  TrendingUp,
  Video,
} from "lucide-react";
import Link from "next/link";

import { Card, StatusBadge } from "@/components/ui";

const UPCOMING_INTERVIEWS = [
  {
    company: "字节跳动",
    title: "产品案例面 · 第二轮",
    time: "7 月 28 日 14:00",
    status: "upcoming" as const,
  },
  {
    company: "小红书",
    title: "业务面 · 第一轮",
    time: "7 月 30 日 10:30",
    status: "upcoming" as const,
  },
  {
    company: "腾讯",
    title: "HR 面",
    time: "8 月 1 日 16:00",
    status: "upcoming" as const,
  },
];

export default function DashboardPage() {
  return (
    <div className="mx-auto max-w-[1440px] px-4 py-7 sm:px-7 lg:px-10 lg:py-10">
      <header className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm text-[#687269]">2026 夏季产品岗</p>
          <h1 className="mt-1 font-[var(--font-display)] text-3xl font-semibold tracking-[-0.045em] sm:text-4xl">
            早上好，继续向前。
          </h1>
        </div>
        <Link
          href="/app/submissions/new"
          className="inline-flex min-h-11 items-center justify-center gap-2 self-start rounded-xl bg-[#27764b] px-4 text-sm font-medium text-white shadow-[0_8px_22px_rgb(39_118_75/0.16)] transition hover:bg-[#1f603d]"
        >
          <Send size={16} />
          记录投递
        </Link>
      </header>

      <section
        className="mt-8 grid gap-3 sm:grid-cols-2 xl:grid-cols-4"
        aria-label="求职数据概览"
      >
        {[
          {
            label: "已投递",
            value: "24",
            note: "本批次 18",
            icon: Send,
          },
          {
            label: "进行中",
            value: "8",
            note: "33% 的投递",
            icon: TrendingUp,
          },
          {
            label: "待面试",
            value: "3",
            note: "未来 7 天",
            icon: Video,
          },
          {
            label: "已通过",
            value: "5",
            note: "含 1 个 Offer",
            icon: CircleCheck,
          },
        ].map(({ label, value, note, icon: Icon }) => (
          <Card key={label} className="p-5 shadow-none">
            <div className="flex items-center justify-between">
              <span className="text-sm text-[#687269]">{label}</span>
              <span className="grid size-8 place-items-center rounded-lg bg-[#eef4ee] text-[#27764b]">
                <Icon size={15} />
              </span>
            </div>
            <p className="mt-5 font-[var(--font-data)] text-[2.35rem] font-semibold leading-none tracking-[-0.07em]">
              {value}
            </p>
            <p className="mt-2 text-xs text-[#879088]">{note}</p>
          </Card>
        ))}
      </section>

      <div className="mt-5 grid gap-5 xl:grid-cols-[1.15fr_0.85fr]">
        <Card className="overflow-hidden shadow-none">
          <div className="flex items-center justify-between border-b border-[#edf0ed] px-5 py-4">
            <div>
              <h2 className="font-[var(--font-display)] text-lg font-semibold tracking-[-0.03em]">
                投递转化
              </h2>
              <p className="mt-1 text-xs text-[#879088]">
                全部批次，不受当前批次筛选
              </p>
            </div>
            <span className="font-[var(--font-data)] text-xs text-[#687269]">
              24 TOTAL
            </span>
          </div>
          <div className="px-5 py-7">
            <div className="grid grid-cols-4 gap-2 text-center">
              {[
                ["已投递", 24, "100%"],
                ["简历通过", 13, "54%"],
                ["进入面试", 8, "33%"],
                ["最终通过", 5, "21%"],
              ].map(([label, count, rate], index) => (
                <div key={String(label)} className="relative">
                  {index < 3 ? (
                    <span className="absolute left-[60%] right-[-40%] top-3 h-px bg-[#cbd7cc]" />
                  ) : null}
                  <span className="relative z-10 mx-auto grid size-6 place-items-center rounded-full border-4 border-white bg-[#55b97a] shadow-[0_0_0_1px_#55b97a]" />
                  <p className="mt-4 font-[var(--font-data)] text-2xl font-semibold tracking-[-0.05em]">
                    {count}
                  </p>
                  <p className="mt-1 text-xs font-medium">{label}</p>
                  <p className="mt-1 font-[var(--font-data)] text-[10px] text-[#879088]">
                    {rate}
                  </p>
                </div>
              ))}
            </div>
            <div className="mt-8 rounded-2xl bg-[#f6f8f4] px-4 py-3 text-sm text-[#687269]">
              简历通过到进入面试的转化最值得关注：目前为{" "}
              <strong className="font-semibold text-[#27764b]">62%</strong>。
            </div>
          </div>
        </Card>

        <Card className="overflow-hidden shadow-none">
          <div className="flex items-center justify-between border-b border-[#edf0ed] px-5 py-4">
            <div>
              <h2 className="font-[var(--font-display)] text-lg font-semibold tracking-[-0.03em]">
                近期面试
              </h2>
              <p className="mt-1 text-xs text-[#879088]">未来三场安排</p>
            </div>
            <CalendarClock size={18} className="text-[#55a572]" />
          </div>
          <div className="divide-y divide-[#edf0ed]">
            {UPCOMING_INTERVIEWS.map((interview) => (
              <Link
                key={`${interview.company}-${interview.title}`}
                href="/app/interviews"
                className="group flex items-center gap-4 px-5 py-4 transition hover:bg-[#fbfcf9]"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="truncate text-sm font-medium">
                      {interview.company}
                    </p>
                    <StatusBadge value={interview.status} />
                  </div>
                  <p className="mt-1 truncate text-sm text-[#687269]">
                    {interview.title}
                  </p>
                  <p className="mt-1.5 font-[var(--font-data)] text-[10px] text-[#879088]">
                    {interview.time}
                  </p>
                </div>
                <ArrowUpRight
                  size={16}
                  className="text-[#a2aba3] transition group-hover:text-[#27764b]"
                />
              </Link>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
