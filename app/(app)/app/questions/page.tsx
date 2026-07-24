import { HelpCircle } from "lucide-react";

import { ModulePlaceholder } from "@/components/app/module-placeholder";

export default function QuestionsPage() {
  return (
    <ModulePlaceholder
      title="题库"
      description="沉淀问题和一份持续迭代的标准答案。"
      icon={HelpCircle}
    />
  );
}
