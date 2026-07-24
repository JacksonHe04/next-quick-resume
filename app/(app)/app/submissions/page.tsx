import { Send } from "lucide-react";

import { ModulePlaceholder } from "@/components/app/module-placeholder";

export default function SubmissionsPage() {
  return (
    <ModulePlaceholder
      title="投递"
      description="记录已经发生的投递，并持续跟进当前阶段。"
      icon={Send}
    />
  );
}
