import { connection } from "next/server";

import { CompanyManager } from "@/components/catalog/company-grid";
import { getDb } from "@/db/client";
import { listOfficialCompanies } from "@/modules/catalog/repository";

export default async function CompaniesPage() {
  await connection();
  const companies = await listOfficialCompanies(await getDb());
  return (
    <div className="mx-auto max-w-7xl px-5 py-7 lg:py-9">
      <div className="mb-5 rounded-md border border-border bg-muted px-4 py-3 text-sm text-muted-foreground">
        公司目录统一由 SAYLESS 维护。招聘网站用于浏览职位，投递进度用于查询已投递申请。
      </div>
      <CompanyManager companies={companies} />
    </div>
  );
}
