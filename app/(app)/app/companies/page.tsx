import { CompanyGrid } from "@/components/catalog/company-grid";
import { getDb } from "@/db/client";
import { listOfficialCompanies } from "@/modules/catalog/repository";

export default async function CompaniesPage() {
  const companies = await listOfficialCompanies(await getDb());
  return (
    <div className="mx-auto max-w-7xl px-5 py-10">
      <h1 className="font-[var(--font-display)] text-3xl font-semibold tracking-[-0.04em]">
        公司
      </h1>
      <p className="mt-2 text-sm text-[#687269]">
        浏览 SAYLESS 官方维护、全站共享的公司目录。
      </p>
      <div className="mt-5 rounded-xl border border-[#dce5dd] bg-[#f8faf6] px-4 py-3 text-sm text-[#687269]">
        搜索不到的公司可以在记录投递时自定义；自定义公司只属于你，不会进入这个官方目录。
      </div>
      <CompanyGrid companies={companies} />
    </div>
  );
}
