import { connection } from "next/server";

import { CompanyManager } from "@/components/catalog/company-grid";
import { getDb } from "@/db/client";
import { listOfficialCompanies } from "@/modules/catalog/repository";

export default async function CompaniesPage() {
  await connection();
  const companies = await listOfficialCompanies(await getDb());
  return (
    <div className="mx-auto max-w-7xl px-5 py-10">
      <h1 className="font-[var(--font-display)] text-3xl font-semibold tracking-[-0.04em]">
        公司
      </h1>
      <p className="mt-2 text-sm text-muted-foreground">
        浏览 SAYLESS 官方维护、全站共享的公司目录与投递入口。
      </p>
      <div className="mt-5 rounded-md border border-border bg-muted px-4 py-3 text-sm text-muted-foreground">
        公司目录统一由 SAYLESS 维护。招聘网站用于浏览职位，投递进度用于查询已投递申请。
      </div>
      <CompanyManager companies={companies} />
    </div>
  );
}
