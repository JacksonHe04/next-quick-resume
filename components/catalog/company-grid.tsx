"use client";

import {
  Building2,
  ExternalLink,
  MapPin,
} from "lucide-react";

import { CompanyResourceLink } from "@/components/catalog/company-resource-link";
import {
  Card,
  DataTable,
  PresentationBadge,
  type DataTableColumn,
} from "@/components/ui";
import type { OfficialCompany } from "@/modules/catalog/repository";

function companyInitial(name: string) {
  return name.trim().slice(0, 1).toUpperCase();
}

function OptionalCompanyLink({
  companyName,
  href,
  resource,
  children,
}: {
  companyName: string;
  href: string | null;
  resource: "careers" | "process";
  children: string;
}) {
  return href ? (
    <CompanyResourceLink
      companyName={companyName}
      href={href}
      resource={resource}
    >
      {children}
    </CompanyResourceLink>
  ) : (
    <span className="text-muted-foreground">未提供</span>
  );
}

export function CompanyManager({
  companies,
}: {
  companies: OfficialCompany[];
}) {
  const columns: DataTableColumn<OfficialCompany>[] = [
    {
      key: "name",
      header: "公司名称",
      className: "min-w-56",
      render: (company) => (
        <span className="inline-flex items-center gap-2 font-medium">
          <span className="grid size-7 place-items-center rounded-md border border-border bg-muted text-xs">
            {companyInitial(company.name)}
          </span>
          {company.name}
        </span>
      ),
    },
    {
      key: "priority",
      header: "优先级",
      render: (company) =>
        company.priority ? (
          <PresentationBadge
            label={company.priority}
            tone={company.priority === "Top" ? "positive" : "neutral"}
          />
        ) : (
          <span className="text-muted-foreground">未设置</span>
        ),
    },
    {
      key: "cities",
      header: "城市",
      className: "min-w-44",
      render: (company) => (
        <span className="text-muted-foreground">
          {company.cities.length > 0
            ? company.cities.join("、")
            : "未提供"}
        </span>
      ),
    },
    {
      key: "submissions",
      header: "关联投递",
      render: (company) => (
        <span className="text-muted-foreground">
          {company.submissionCount} 条投递
        </span>
      ),
    },
    {
      key: "careers",
      header: "招聘网站",
      className: "min-w-44",
      render: (company) => (
        <OptionalCompanyLink
          companyName={company.name}
          href={company.careersUrl}
          resource="careers"
        >
          打开招聘页
        </OptionalCompanyLink>
      ),
    },
    {
      key: "process",
      header: "投递进度",
      className: "min-w-44",
      render: (company) => (
        <OptionalCompanyLink
          companyName={company.name}
          href={company.processUrl}
          resource="process"
        >
          查询进度
        </OptionalCompanyLink>
      ),
    },
  ];

  return (
    <div className="mt-5">
      <DataTable
        columns={columns}
        rows={companies}
        rowKey={(company) => company.id}
        viewStorageKey="companies"
        empty="公司目录正在整理"
        gridCard={(company) => (
          <Card className="group h-full p-5 shadow-none transition hover:border-[#b7cbb9]">
            <div className="flex items-start gap-4">
              <span className="grid size-12 shrink-0 place-items-center rounded-xl border border-border bg-muted text-lg font-semibold">
                {companyInitial(company.name)}
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-3">
                  <h2 className="truncate text-base font-semibold">
                    {company.name}
                  </h2>
                  {company.priority ? (
                    <PresentationBadge
                      label={company.priority}
                      tone={
                        company.priority === "Top"
                          ? "positive"
                          : "neutral"
                      }
                    />
                  ) : null}
                </div>
                <p className="mt-1 inline-flex items-center gap-1 text-xs text-muted-foreground">
                  <MapPin size={12} />
                  {company.cities.length > 0
                    ? company.cities.join("、")
                    : "城市未提供"}
                </p>
              </div>
            </div>
            <p className="mt-6 text-xs text-muted-foreground">
              {company.submissionCount} 条关联投递
            </p>
            <div className="mt-3 grid grid-cols-2 gap-2 border-t border-border pt-4">
              <OptionalCompanyLink
                companyName={company.name}
                href={company.careersUrl}
                resource="careers"
              >
                招聘网站
              </OptionalCompanyLink>
              <OptionalCompanyLink
                companyName={company.name}
                href={company.processUrl}
                resource="process"
              >
                投递进度
              </OptionalCompanyLink>
            </div>
          </Card>
        )}
      />
    </div>
  );
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
          <Building2 size={24} className="mx-auto text-[#55a572]" />
          <p className="mt-4 text-sm font-medium">
            官方公司目录正在整理
          </p>
          <p className="mt-2 inline-flex items-center gap-1 text-xs text-muted-foreground">
            <ExternalLink size={12} />
            目录会由 SAYLESS 统一维护
          </p>
        </div>
      </Card>
    );
  }
  return <CompanyManager companies={companies} />;
}
