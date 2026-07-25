import {
  CircleCheck,
  Layers,
  Send,
  TrendingUp,
  Video,
  type LucideIcon,
} from "lucide-react";

import { Card } from "@/components/ui";
import type { DashboardViewModel } from "@/modules/dashboard/service";

export function DashboardMetrics({
  dashboard,
}: {
  dashboard: DashboardViewModel;
}) {
  const items: Array<{
    label: string;
    value: number;
    note: string;
    icon: LucideIcon;
  }> = [
    {
      label: "已投递",
      value: dashboard.totalSubmissions,
      note: "全部批次",
      icon: Send,
    },
    {
      label: "进行中",
      value: dashboard.activeSubmissions,
      note:
        dashboard.totalSubmissions === 0
          ? "尚无投递"
          : `${Math.round(
              (dashboard.activeSubmissions /
                dashboard.totalSubmissions) *
                100,
            )}% 的投递`,
      icon: TrendingUp,
    },
    {
      label: "近期面试",
      value: dashboard.interviewsNextSevenDays,
      note: "未来 7 天",
      icon: Video,
    },
    {
      label: "活跃批次",
      value: dashboard.batchCounts.active,
      note: `${dashboard.batchCounts.archived} 个已归档`,
      icon: Layers,
    },
    {
      label: "已通过",
      value: dashboard.successfulSubmissions,
      note: `含 ${dashboard.conversion.finalPassed} 个 Offer`,
      icon: CircleCheck,
    },
  ];

  return (
    <section
      className="mt-8 grid gap-3 sm:grid-cols-2 xl:grid-cols-5"
      aria-label="求职数据概览"
    >
      {items.map(({ label, value, note, icon: Icon }) => (
        <Card key={label} className="p-5 shadow-none">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">{label}</span>
            <span className="grid size-8 place-items-center rounded-lg bg-muted text-foreground">
              <Icon size={15} />
            </span>
          </div>
          <p className="mt-5 font-[var(--font-data)] text-[2.35rem] font-semibold leading-none tracking-[-0.07em]">
            {value}
          </p>
          <p className="mt-2 text-xs text-muted-foreground">{note}</p>
        </Card>
      ))}
    </section>
  );
}
