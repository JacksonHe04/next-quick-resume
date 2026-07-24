import { Video } from "lucide-react";

import { ModulePlaceholder } from "@/components/app/module-placeholder";

export default function InterviewsPage() {
  return (
    <ModulePlaceholder
      title="面试"
      description="管理测评、笔试和每一轮面试安排。"
      icon={Video}
    />
  );
}
