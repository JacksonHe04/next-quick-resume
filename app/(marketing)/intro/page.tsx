import {
  ArrowRight,
  CalendarCheck,
  Check,
  FileText,
  MessageSquareText,
  Send,
} from "lucide-react";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { BrandMark } from "@/components/ui/brand-mark";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const FLOW = [
  { label: "整理简历", icon: FileText },
  { label: "记录投递", icon: Send },
  { label: "准备面试", icon: CalendarCheck },
  { label: "沉淀答案", icon: MessageSquareText },
] as const;

const FEATURES = [
  {
    title: "完整链路",
    description: "从简历到每轮选拔，所有记录沿同一条求职路径向前推进。",
  },
  {
    title: "清晰状态",
    description: "投递状态跟随面试结果自动更新，不再手动维护重复信息。",
  },
  {
    title: "持续沉淀",
    description: "为每个问题维护标准答案，并按需关联到具体面试。",
  },
] as const;

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5 sm:px-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2.5 text-sm font-semibold tracking-[-0.02em]"
          >
            <BrandMark size="sm" />
            SAYLESS
          </Link>
          <nav className="flex items-center gap-1.5" aria-label="账户入口">
            <Button variant="ghost" asChild>
              <Link href="/login">登录</Link>
            </Button>
            <Button asChild>
              <Link href="/register">免费开始</Link>
            </Button>
          </nav>
        </div>
      </header>

      <section className="mx-auto max-w-7xl px-5 pb-20 pt-20 text-center sm:px-8 sm:pb-28 sm:pt-28">
        <Badge variant="outline" className="mb-6 rounded-full px-3 py-1">
          为完整求职流程而做
        </Badge>
        <h1 className="mx-auto max-w-5xl text-balance text-[clamp(3rem,7vw,6.4rem)] font-semibold leading-[0.94] tracking-[-0.075em]">
          别让求职，
          <br />
          散落在不同地方。
        </h1>
        <p className="mx-auto mt-7 max-w-2xl text-balance text-base leading-7 text-muted-foreground sm:text-lg">
          SAYLESS 把简历、已投递岗位、每一轮选拔和面试题放在同一个系统里。看清全局，然后专注下一步。
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Button size="lg" asChild>
            <Link href="/register">
              建立我的求职路径
              <ArrowRight data-icon="inline-end" />
            </Link>
          </Button>
          <Button size="lg" variant="outline" asChild>
            <Link href="/resumes">先浏览产品</Link>
          </Button>
        </div>
        <p className="mt-4 inline-flex items-center gap-1.5 text-xs text-muted-foreground">
          <Check className="size-3.5" />
          完全免费，无需登录即可浏览
        </p>

        <Card className="mx-auto mt-16 max-w-5xl text-left shadow-xl shadow-black/[0.04]">
          <CardHeader className="border-b border-border">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-xs text-muted-foreground">当前批次</p>
                <CardTitle className="mt-1">2026 夏季产品岗</CardTitle>
              </div>
              <Badge variant="secondary">进行中</Badge>
            </div>
          </CardHeader>
          <CardContent className="py-6">
            <div className="grid gap-2 sm:grid-cols-4">
              {FLOW.map(({ label, icon: Icon }, index) => (
                <div
                  key={label}
                  className="flex items-center gap-3 rounded-lg border border-border bg-muted/40 px-4 py-3"
                >
                  <span className="grid size-7 place-items-center rounded-md border border-border bg-background">
                    <Icon className="size-3.5" />
                  </span>
                  <div>
                    <p className="text-[11px] text-muted-foreground">
                      0{index + 1}
                    </p>
                    <p className="text-sm font-medium">{label}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 grid gap-3 sm:grid-cols-[1fr_1fr_1fr_1.6fr]">
              {[
                ["已投递", "24"],
                ["进行中", "8"],
                ["面试", "5"],
              ].map(([label, value]) => (
                <div
                  key={label}
                  className="rounded-lg border border-border px-4 py-4"
                >
                  <p className="font-mono text-2xl font-medium tracking-[-0.04em]">
                    {value}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {label}
                  </p>
                </div>
              ))}
              <div className="rounded-lg border border-border px-4 py-4">
                <p className="text-xs text-muted-foreground">下一场面试</p>
                <div className="mt-2 flex items-end justify-between gap-4">
                  <div>
                    <p className="text-sm font-medium">产品案例面 · 第二轮</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      7 月 28 日，14:00
                    </p>
                  </div>
                  <span className="font-mono text-xs">03 DAYS</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      <section className="border-y border-border bg-muted/35">
        <div className="mx-auto grid max-w-7xl divide-y divide-border sm:grid-cols-3 sm:divide-x sm:divide-y-0">
          {FEATURES.map(({ title, description }) => (
            <article key={title} className="px-6 py-12 sm:px-8">
              <h2 className="text-lg font-medium tracking-[-0.02em]">
                {title}
              </h2>
              <p className="mt-3 max-w-sm text-sm leading-6 text-muted-foreground">
                {description}
              </p>
            </article>
          ))}
        </div>
      </section>

      <footer className="mx-auto flex max-w-7xl flex-col gap-3 px-5 py-10 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between sm:px-8">
        <span>© 2026 SAYLESS</span>
        <span>把复杂留给系统，把注意力留给下一步。</span>
      </footer>
    </main>
  );
}
