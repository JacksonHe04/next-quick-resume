"use client";

import { ArrowUpRight, Building2, Globe2, Plus } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";

import {
  Button,
  Card,
  DataTable,
  Input,
  PresentationBadge,
  type DataTableColumn,
} from "@/components/ui";
import { appFetch, patchJson } from "@/lib/app-fetch";
import type { OfficialCompany } from "@/modules/catalog/repository";

type CompanyRow =
  | (OfficialCompany & { source: "official" })
  | {
      id: string;
      source: "private";
      name: string;
      logoUrl: null;
      websiteUrl: null;
      careersUrl: null;
      industry: null;
    };

function companyInitial(name: string) {
  return name.trim().slice(0, 1).toUpperCase();
}

export function CompanyManager({
  companies,
  interactive = true,
}: {
  companies: OfficialCompany[];
  interactive?: boolean;
}) {
  const [privateCompanies, setPrivateCompanies] = useState<CompanyRow[]>([]);
  const [newName, setNewName] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string>();

  const loadPrivate = useCallback(async () => {
    if (!interactive) return;
    const response = await appFetch("/api/catalog/company?q=", {
      cache: "no-store",
    });
    if (!response.ok) throw new Error("自定义公司加载失败");
    const payload = (await response.json()) as {
      options: Array<{
        source: "official" | "private";
        id: string;
        name: string;
      }>;
    };
    setPrivateCompanies(
      payload.options
        .filter((option) => option.source === "private")
        .map((option) => ({
          ...option,
          source: "private" as const,
          logoUrl: null,
          websiteUrl: null,
          careersUrl: null,
          industry: null,
        })),
    );
  }, [interactive]);

  useEffect(() => {
    loadPrivate().catch((loadError) =>
      setError((loadError as Error).message),
    );
  }, [loadPrivate]);

  const rows = useMemo<CompanyRow[]>(
    () => [
      ...companies.map((company) => ({
        ...company,
        source: "official" as const,
      })),
      ...privateCompanies,
    ],
    [companies, privateCompanies],
  );

  async function create() {
    if (!newName.trim()) return;
    setPending(true);
    setError(undefined);
    try {
      const response = await appFetch("/api/catalog/company", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ name: newName }),
      });
      const payload = (await response.json().catch(() => ({}))) as {
        error?: { message?: string };
      };
      if (!response.ok) {
        throw new Error(payload.error?.message ?? "创建公司失败");
      }
      setNewName("");
      await loadPrivate();
    } catch (createError) {
      setError((createError as Error).message);
    } finally {
      setPending(false);
    }
  }

  async function rename(company: CompanyRow, value: string) {
    if (company.source !== "private") return;
    await patchJson(`/api/catalog/company/${company.id}`, {
      name: value,
    });
    await loadPrivate();
  }

  const columns: DataTableColumn<CompanyRow>[] = [
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
      editable: {
        label: "公司名称",
        value: (company) => company.name,
        disabled: (company) => company.source === "official",
        readOnlyReason: "官方公司由 SAYLESS 统一维护",
        onSave: rename,
      },
    },
    {
      key: "source",
      header: "来源",
      render: (company) =>
        company.source === "official" ? (
          <PresentationBadge label="官方公司" tone="positive" />
        ) : (
          <PresentationBadge label="我的公司" tone="neutral" />
        ),
    },
    {
      key: "industry",
      header: "行业",
      render: (company) => (
        <span className="text-muted-foreground">
          {company.industry || "未分类"}
        </span>
      ),
    },
    {
      key: "website",
      header: "官网",
      className: "min-w-44",
      render: (company) =>
        company.websiteUrl ? (
          <a
            href={company.websiteUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1 text-muted-foreground hover:text-foreground"
          >
            打开官网
            <ArrowUpRight size={13} />
          </a>
        ) : (
          <span className="text-muted-foreground">未提供</span>
        ),
    },
    {
      key: "careers",
      header: "招聘页面",
      className: "min-w-44",
      render: (company) =>
        company.careersUrl ? (
          <a
            href={company.careersUrl}
            target="_blank"
            rel="noreferrer"
            aria-label={`查看 ${company.name} 招聘页面`}
            className="inline-flex items-center gap-1 text-muted-foreground hover:text-foreground"
          >
            打开招聘页
            <ArrowUpRight size={13} />
          </a>
        ) : (
          <span className="text-muted-foreground">未提供</span>
        ),
    },
  ];

  return (
    <>
      {interactive ? (
        <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <label className="w-full max-w-sm">
            <span className="mb-2 block text-sm font-medium">
              添加我的公司
            </span>
            <Input
              value={newName}
              onChange={(event) => setNewName(event.target.value)}
              placeholder="搜索不到时在这里创建"
              maxLength={120}
            />
          </label>
          <Button
            onClick={() => void create()}
            loading={pending}
            disabled={!newName.trim()}
          >
            <Plus size={16} />
            添加公司
          </Button>
        </div>
      ) : null}

      {error ? (
        <p
          role="alert"
          className="mt-4 rounded-md border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm text-destructive"
        >
          {error}
        </p>
      ) : null}

      <div className="mt-5">
        <DataTable
          columns={columns}
          rows={rows}
          rowKey={(company) => `${company.source}:${company.id}`}
          viewStorageKey="companies"
          empty="公司目录正在整理"
          gridCard={(company) => {
            const target = company.careersUrl ?? company.websiteUrl;
            return (
              <Card className="group h-full p-5 shadow-none transition hover:border-[#b7cbb9]">
                <div className="flex items-start gap-4">
                  <span className="grid size-12 shrink-0 place-items-center rounded-xl border border-border bg-muted text-lg font-semibold">
                    {companyInitial(company.name)}
                  </span>
                  <div className="min-w-0 flex-1">
                    <h2 className="truncate text-base font-semibold">
                      {company.name}
                    </h2>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {company.industry ?? "行业未分类"}
                    </p>
                  </div>
                </div>
                <div className="mt-7 flex items-center justify-between border-t border-border pt-4">
                  <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Globe2 size={13} />
                    {company.source === "official"
                      ? "官方公司"
                      : "我的公司"}
                  </span>
                  {target ? (
                    <a
                      href={target}
                      target="_blank"
                      rel="noreferrer"
                      aria-label={`查看 ${company.name} 招聘页面`}
                      className="inline-flex items-center gap-1 text-xs font-medium"
                    >
                      招聘页面
                      <ArrowUpRight size={13} />
                    </a>
                  ) : null}
                </div>
              </Card>
            );
          }}
        />
      </div>
    </>
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
          <p className="mt-4 text-sm font-medium">官方公司目录正在整理</p>
        </div>
      </Card>
    );
  }
  return <CompanyManager companies={companies} interactive={false} />;
}
