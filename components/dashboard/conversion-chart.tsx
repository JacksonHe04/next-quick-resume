import { Card } from "@/components/ui";
import type { DashboardViewModel } from "@/modules/dashboard/service";

export function ConversionChart({
  dashboard,
}: {
  dashboard: DashboardViewModel;
}) {
  const { conversion } = dashboard;
  const steps = [
    [
      "已投递",
      conversion.submitted,
      conversion.rates.submitted,
    ],
    [
      "简历通过",
      conversion.resumePassed,
      conversion.rates.resumePassed,
    ],
    [
      "进入面试",
      conversion.enteredInterview,
      conversion.rates.enteredInterview,
    ],
    [
      "拿到 Offer",
      conversion.finalPassed,
      conversion.rates.finalPassed,
    ],
  ] as const;
  const interviewRate =
    conversion.resumePassed === 0
      ? 0
      : Math.round(
          (conversion.enteredInterview / conversion.resumePassed) * 100,
        );

  return (
    <Card className="overflow-hidden shadow-none">
      <div className="flex items-center justify-between border-b border-border px-5 py-4">
        <div>
          <h2 className="font-[var(--font-display)] text-lg font-semibold tracking-[-0.03em]">
            投递转化
          </h2>
          <p className="mt-1 text-xs text-muted-foreground">
            全部批次，不受当前批次筛选
          </p>
        </div>
        <span className="font-[var(--font-data)] text-xs text-muted-foreground">
          {conversion.submitted} TOTAL
        </span>
      </div>
      <div className="px-5 py-7">
        <div className="grid grid-cols-4 gap-2 text-center">
          {steps.map(([label, count, rate], index) => (
            <div key={label} className="relative">
              {index < steps.length - 1 ? (
                <span className="absolute left-[60%] right-[-40%] top-3 h-px bg-[#cbd7cc]" />
              ) : null}
              <span className="relative z-10 mx-auto grid size-6 place-items-center rounded-full border-4 border-white bg-[#55b97a] shadow-[0_0_0_1px_#55b97a]" />
              <p className="mt-4 font-[var(--font-data)] text-2xl font-semibold tracking-[-0.05em]">
                {count}
              </p>
              <p className="mt-1 text-xs font-medium">{label}</p>
              <p className="mt-1 font-[var(--font-data)] text-[10px] text-muted-foreground">
                {rate}%
              </p>
            </div>
          ))}
        </div>
        <div className="mt-8 rounded-2xl bg-muted px-4 py-3 text-sm text-muted-foreground">
          简历通过到进入面试的转化目前为{" "}
          <strong className="font-semibold text-foreground">
            {interviewRate}%
          </strong>
          。
        </div>
        {dashboard.stageDistribution.length > 0 ? (
          <div className="mt-5">
            <p className="text-xs font-medium text-muted-foreground">
              选拔阶段分布
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              {dashboard.stageDistribution.map((item) => (
                <span
                  key={item.label}
                  className="rounded-full border border-border bg-white px-3 py-1.5 text-xs text-muted-foreground"
                >
                  {item.label} · {item.count}
                </span>
              ))}
            </div>
          </div>
        ) : null}
      </div>
    </Card>
  );
}
