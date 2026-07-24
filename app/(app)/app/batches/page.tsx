import { CalendarRange } from "lucide-react";

import { ModulePlaceholder } from "@/components/app/module-placeholder";

export default function BatchesPage() {
  return (
    <ModulePlaceholder
      title="批次"
      description="按求职阶段为投递分组，并选择一个当前批次。"
      icon={CalendarRange}
    />
  );
}
