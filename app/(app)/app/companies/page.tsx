import { Building2 } from "lucide-react";

import { ModulePlaceholder } from "@/components/app/module-placeholder";

export default function CompaniesPage() {
  return (
    <ModulePlaceholder
      title="公司"
      description="使用官方公司与岗位目录，找不到时保留私人记录。"
      icon={Building2}
    />
  );
}
