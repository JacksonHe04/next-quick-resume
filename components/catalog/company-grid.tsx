import { ArrowUpRight, Building2, Globe2 } from "lucide-react";

import { Card } from "@/components/ui";
import type { OfficialCompany } from "@/modules/catalog/repository";

function companyInitial(name: string) {
  return name.trim().slice(0, 1).toUpperCase();
}

export function CompanyGrid({
  companies,
}: {
  companies: OfficialCompany[];
}) {
  if (companies.length === 0) {
    return (
      <Card className="mt-7 grid min-h-64 place-items-center p-8 text-center shadow-none">
        <div>
          <span className="mx-auto grid size-12 place-items-center rounded-2xl bg-[#e7f6ec] text-[#27764b]">
            <Building2 size={21} />
          </span>
          <p className="mt-4 text-sm font-medium">官方公司目录正在整理</p>
          <p className="mt-1 text-xs text-[#879088]">
            创建投递时仍可使用只属于你的自定义公司。
          </p>
        </div>
      </Card>
    );
  }

  return (
    <ul className="mt-7 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {companies.map((company) => {
        const target = company.careersUrl ?? company.websiteUrl;
        return (
          <li key={company.id}>
            <Card className="group h-full p-5 shadow-none transition hover:-translate-y-0.5 hover:border-[#b7cbb9] hover:shadow-[0_16px_45px_rgb(32_38_32/0.07)]">
              <div className="flex items-start gap-4">
                <span className="grid size-12 shrink-0 place-items-center rounded-2xl border border-[#dce5dd] bg-[#f6f8f4] font-[var(--font-display)] text-lg font-semibold text-[#27764b]">
                  {companyInitial(company.name)}
                </span>
                <div className="min-w-0 flex-1">
                  <h2 className="truncate font-[var(--font-display)] text-lg font-semibold tracking-[-0.03em]">
                    {company.name}
                  </h2>
                  <p className="mt-1 text-xs text-[#879088]">
                    {company.industry ?? "行业未分类"}
                  </p>
                </div>
              </div>
              <div className="mt-7 flex items-center justify-between border-t border-[#edf0ed] pt-4">
                <span className="inline-flex items-center gap-1.5 text-xs text-[#687269]">
                  <Globe2 size={13} />
                  官方公司
                </span>
                {target ? (
                  <a
                    href={target}
                    target="_blank"
                    rel="noreferrer"
                    aria-label={`查看 ${company.name} 招聘页面`}
                    className="inline-flex items-center gap-1 text-xs font-medium text-[#27764b] hover:underline"
                  >
                    招聘页面
                    <ArrowUpRight size={13} />
                  </a>
                ) : null}
              </div>
            </Card>
          </li>
        );
      })}
    </ul>
  );
}
