import { ArrowUpRight, CalendarClock } from "lucide-react";
import Link from "next/link";

import { IntentLink } from "@/components/app/intent-link";
import { Card, StatusBadge } from "@/components/ui";
import type { DashboardViewModel } from "@/modules/dashboard/service";

function formatSchedule(value: Date) {
  return new Intl.DateTimeFormat("zh-CN", {
    month: "short",
    day: "numeric",
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(value);
}

export function UpcomingInterviews({
  interviews,
}: {
  interviews: DashboardViewModel["upcomingInterviews"];
}) {
  return (
    <Card className="overflow-hidden shadow-none">
      <div className="flex items-center justify-between border-b border-border px-5 py-4">
        <div>
          <h2 className="font-[var(--font-display)] text-lg font-semibold tracking-[-0.03em]">
            近期面试
          </h2>
          <p className="mt-1 text-xs text-muted-foreground">
            接下来最近三场安排
          </p>
        </div>
        <CalendarClock size={18} className="text-[#55a572]" />
      </div>
      <div className="divide-y divide-[#edf0ed]">
        {interviews.map((interview) => (
          <IntentLink
            key={interview.id}
            href={`/app/interviews/${interview.id}`}
            className="group flex items-center gap-4 px-5 py-4 transition hover:bg-muted"
          >
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <p className="truncate text-sm font-medium">
                  {interview.companyName}
                </p>
                <StatusBadge value="upcoming" />
              </div>
              <p className="mt-1 truncate text-sm text-muted-foreground">
                {interview.name} · {interview.positionName}
              </p>
              <p className="mt-1.5 font-[var(--font-data)] text-[10px] text-muted-foreground">
                {formatSchedule(interview.scheduledAt!)}
              </p>
            </div>
            <ArrowUpRight
              size={16}
              className="text-[#a2aba3] transition group-hover:text-foreground"
            />
          </IntentLink>
        ))}
        {interviews.length === 0 ? (
          <div className="px-5 py-12 text-center">
            <p className="text-sm font-medium">近期没有待进行的面试</p>
            <Link
              href="/app/interviews"
              className="mt-2 inline-block text-xs text-foreground hover:underline"
            >
              查看全部选拔事件
            </Link>
          </div>
        ) : null}
      </div>
    </Card>
  );
}
