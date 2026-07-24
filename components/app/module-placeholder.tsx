import type { LucideIcon } from "lucide-react";

import { Card } from "@/components/ui";

export function ModulePlaceholder({
  title,
  description,
  icon: Icon,
}: {
  title: string;
  description: string;
  icon: LucideIcon;
}) {
  return (
    <div className="mx-auto max-w-6xl px-5 py-10">
      <h1 className="font-[var(--font-display)] text-3xl font-semibold tracking-[-0.04em]">
        {title}
      </h1>
      <p className="mt-2 text-sm text-[#687269]">{description}</p>
      <Card className="mt-7 grid min-h-64 place-items-center p-8 text-center shadow-none">
        <div>
          <span className="mx-auto grid size-12 place-items-center rounded-2xl bg-[#e7f6ec] text-[#27764b]">
            <Icon size={21} />
          </span>
          <p className="mt-4 text-sm font-medium">功能正在接入数据层</p>
          <p className="mt-1 text-xs text-[#879088]">
            页面框架已经就绪，后续任务会替换为完整的增删改查。
          </p>
        </div>
      </Card>
    </div>
  );
}
