import { Send } from "lucide-react";
import Link from "next/link";

import { ConversionChart } from "@/components/dashboard/conversion-chart";
import { DashboardMetrics } from "@/components/dashboard/metrics";
import { UpcomingInterviews } from "@/components/dashboard/upcoming-interviews";
import { getAppReadContext } from "@/modules/app/read-context";
import { createDashboardRepository } from "@/modules/dashboard/repository";
import { getDashboard } from "@/modules/dashboard/service";

export default async function DashboardPage() {
  const { database, user, userId } = await getAppReadContext();

  const dashboard = await getDashboard(
    createDashboardRepository(database),
    userId,
    {},
  );
  const hour = new Date().getHours();
  const greeting =
    hour < 11 ? "早上好" : hour < 18 ? "下午好" : "晚上好";

  return (
    <div className="mx-auto max-w-[1440px] px-4 py-7 sm:px-7 lg:px-10 lg:py-10">
      <header className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm text-muted-foreground">
            {dashboard.currentBatchName
              ? `当前阶段：${dashboard.currentBatchName}`
              : "还没有设置当前批次"}
          </p>
          <h1 className="mt-1 font-[var(--font-display)] text-3xl font-semibold tracking-[-0.045em] sm:text-4xl">
            {user ? `${greeting}${user.name ? `，${user.name}` : ""}` : "欢迎体验"}
            。继续向前。
          </h1>
        </div>
        <Link
          href="/app/submissions"
          className="inline-flex min-h-11 items-center justify-center gap-2 self-start rounded-xl bg-foreground px-4 text-sm font-medium text-white shadow-[0_8px_22px_rgb(39_118_75/0.16)] transition hover:bg-foreground/85"
        >
          <Send size={16} />
          记录投递
        </Link>
      </header>

      <DashboardMetrics dashboard={dashboard} />

      <div className="mt-5 grid gap-5 xl:grid-cols-[1.15fr_0.85fr]">
        <ConversionChart dashboard={dashboard} />
        <UpcomingInterviews interviews={dashboard.upcomingInterviews} />
      </div>
    </div>
  );
}
