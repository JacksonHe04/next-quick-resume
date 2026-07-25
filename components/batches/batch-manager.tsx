"use client";

import {
  Archive,
  CalendarRange,
  Check,
  Plus,
  RotateCcw,
  Trash2,
} from "lucide-react";
import {
  type FormEvent,
  useCallback,
  useState,
} from "react";

import { AppTopbarPortal } from "@/components/app/app-topbar";
import {
  Button,
  Card,
  DataTable,
  DataViewSwitch,
  FormDrawer,
  Input,
  StatusBadge,
  useDataView,
  type DataTableColumn,
} from "@/components/ui";
import { appFetch, patchJson } from "@/lib/app-fetch";

export type BatchView = {
  id: string;
  name: string;
  description: string | null;
  strategyMarkdown: string | null;
  startDate: string | Date | null;
  endDate: string | Date | null;
  archivedAt: string | Date | null;
};

export type BatchResponse = {
  batches: BatchView[];
  currentBatchId: string | null;
};

async function api(
  url: string,
  method: "POST" | "DELETE",
  body?: unknown,
) {
  const response = await appFetch(url, {
    method,
    headers: body ? { "content-type": "application/json" } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!response.ok) {
    const payload = (await response.json().catch(() => ({}))) as {
      error?: { message?: string };
    };
    throw new Error(payload.error?.message ?? "操作失败，请稍后再试");
  }
}

function dateInput(value: string | Date | null) {
  if (!value) return "";
  return (typeof value === "string" ? value : value.toISOString()).slice(
    0,
    10,
  );
}

function formatDate(value: string | Date | null) {
  return value
    ? new Intl.DateTimeFormat("zh-CN", {
        year: "numeric",
        month: "short",
        day: "numeric",
      }).format(new Date(value))
    : "未设置";
}

export function BatchManager({
  initialData,
}: {
  initialData: BatchResponse;
}) {
  const [data, setData] = useState<BatchResponse>(initialData);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string>();
  const [view, setView] = useDataView("batches");

  const load = useCallback(async () => {
    const response = await appFetch("/api/batches", { cache: "no-store" });
    if (!response.ok) throw new Error("批次加载失败");
    setData((await response.json()) as BatchResponse);
  }, []);

  async function create(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError(undefined);
    const values = new FormData(event.currentTarget);
    try {
      await api("/api/batches", "POST", {
        name: String(values.get("name")),
        description: String(values.get("description") ?? "") || undefined,
        strategyMarkdown:
          String(values.get("strategyMarkdown") ?? "") || undefined,
        startDate: String(values.get("startDate") ?? "") || undefined,
        endDate: String(values.get("endDate") ?? "") || undefined,
      });
      setDrawerOpen(false);
      await load();
    } catch (createError) {
      setError((createError as Error).message);
    } finally {
      setPending(false);
    }
  }

  async function perform(action: () => Promise<void>) {
    setError(undefined);
    try {
      await action();
      await load();
    } catch (actionError) {
      setError((actionError as Error).message);
    }
  }

  async function update(id: string, changes: Record<string, unknown>) {
    await patchJson(`/api/batches/${id}`, changes);
    await load();
  }

  const columns: DataTableColumn<BatchView>[] = [
    {
      key: "name",
      header: "批次名称",
      className: "min-w-48",
      render: (batch) => <span className="font-medium">{batch.name}</span>,
      editable: {
        label: "批次名称",
        value: (batch) => batch.name,
        onSave: (batch, value) => update(batch.id, { name: value }),
      },
    },
    {
      key: "status",
      header: "状态",
      render: (batch) =>
        batch.id === data.currentBatchId ? (
          <StatusBadge value="current" />
        ) : batch.archivedAt ? (
          <StatusBadge value="archived" />
        ) : (
          <StatusBadge value="active" />
        ),
    },
    {
      key: "description",
      header: "说明",
      className: "min-w-64 whitespace-normal",
      render: (batch) => (
        <span className="line-clamp-2 text-muted-foreground">
          {batch.description || "未填写"}
        </span>
      ),
      editable: {
        label: "批次说明",
        type: "textarea",
        value: (batch) => batch.description,
        onSave: (batch, value) =>
          update(batch.id, { description: value || null }),
      },
    },
    {
      key: "strategy",
      header: "投递策略",
      className: "min-w-72 whitespace-normal",
      render: (batch) => (
        <span className="line-clamp-2 text-muted-foreground">
          {batch.strategyMarkdown || "未填写"}
        </span>
      ),
      editable: {
        label: "投递策略",
        type: "textarea",
        value: (batch) => batch.strategyMarkdown,
        onSave: (batch, value) =>
          update(batch.id, { strategyMarkdown: value || null }),
      },
    },
    {
      key: "start",
      header: "开始日期",
      render: (batch) => (
        <span className="font-[var(--font-data)] text-xs text-muted-foreground">
          {formatDate(batch.startDate)}
        </span>
      ),
      editable: {
        label: "开始日期",
        type: "date",
        value: (batch) => dateInput(batch.startDate),
        onSave: (batch, value) =>
          update(batch.id, { startDate: value || null }),
      },
    },
    {
      key: "end",
      header: "结束日期",
      render: (batch) => (
        <span className="font-[var(--font-data)] text-xs text-muted-foreground">
          {formatDate(batch.endDate)}
        </span>
      ),
      editable: {
        label: "结束日期",
        type: "date",
        value: (batch) => dateInput(batch.endDate),
        onSave: (batch, value) =>
          update(batch.id, { endDate: value || null }),
      },
    },
    {
      key: "actions",
      header: <span className="sr-only">操作</span>,
      className: "w-40 text-right",
      render: (batch) => {
        const current = batch.id === data.currentBatchId;
        const archived = Boolean(batch.archivedAt);
        return (
          <div className="flex justify-end gap-1">
            {!archived && !current ? (
              <button
                type="button"
                aria-label="设为当前批次"
                onClick={() =>
                  void perform(() =>
                    api(`/api/batches/${batch.id}/current`, "POST"),
                  )
                }
                className="grid size-8 place-items-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground"
              >
                <Check size={14} />
              </button>
            ) : null}
            <button
              type="button"
              aria-label={archived ? "恢复批次" : "归档批次"}
              onClick={() =>
                void perform(() =>
                  api(`/api/batches/${batch.id}/archive`, "POST", {
                    archived: !archived,
                  }),
                )
              }
              className="grid size-8 place-items-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground"
            >
              {archived ? <RotateCcw size={14} /> : <Archive size={14} />}
            </button>
            <button
              type="button"
              aria-label="删除批次"
              onClick={() =>
                void perform(() =>
                  api(`/api/batches/${batch.id}`, "DELETE"),
                )
              }
              className="grid size-8 place-items-center rounded-md text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
            >
              <Trash2 size={14} />
            </button>
          </div>
        );
      },
    },
  ];

  function batchCard(batch: BatchView) {
    const current = batch.id === data.currentBatchId;
    const archived = Boolean(batch.archivedAt);
    return (
      <Card
        className={
          current
            ? "h-full border-[#9fd1ae] p-5 shadow-[0_15px_45px_rgb(39_118_75/0.08)]"
            : "h-full p-5 shadow-none"
        }
      >
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="truncate text-base font-semibold">
                {batch.name}
              </h2>
              {current ? (
                <StatusBadge value="current" />
              ) : archived ? (
                <StatusBadge value="archived" />
              ) : (
                <StatusBadge value="active" />
              )}
            </div>
            <p className="mt-2 line-clamp-2 text-sm leading-6 text-muted-foreground">
              {batch.description || "未填写说明"}
            </p>
            <p className="mt-3 font-[var(--font-data)] text-[10px] text-muted-foreground">
              {formatDate(batch.startDate)} — {formatDate(batch.endDate)}
            </p>
          </div>
          <CalendarRange size={18} className="shrink-0 text-[#55a572]" />
        </div>
      </Card>
    );
  }

  return (
    <>
      <AppTopbarPortal>
        <label className="flex items-center gap-2">
          <span className="hidden text-xs font-medium text-muted-foreground sm:inline">
            当前批次
          </span>
          <select
            aria-label="当前批次"
            value={data.currentBatchId ?? ""}
            disabled={!data.batches.some((batch) => !batch.archivedAt)}
            onChange={(event) => {
              const id = event.target.value;
              if (id) {
                void perform(() =>
                  api(`/api/batches/${id}/current`, "POST"),
                );
              }
            }}
            className="h-9 min-w-36 max-w-56 rounded-md border border-input bg-background px-3 text-sm font-medium shadow-xs outline-none focus:border-ring focus:ring-3 focus:ring-ring/20"
          >
            {data.batches
              .filter((batch) => !batch.archivedAt)
              .map((batch) => (
                <option key={batch.id} value={batch.id}>
                  {batch.name}
                </option>
              ))}
          </select>
        </label>
        <div className="ml-auto flex items-center gap-2">
          <DataViewSwitch view={view} onChange={setView} />
          <Button onClick={() => setDrawerOpen(true)}>
            <Plus aria-hidden="true" />
            新建批次
          </Button>
        </div>
      </AppTopbarPortal>

      <p className="mb-5 text-sm text-muted-foreground">
        当前批次只作为新建投递的默认分组，不会筛选其他页面。
      </p>

      {error ? (
        <p
          role="alert"
          className="mb-5 rounded-md border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm text-destructive"
        >
          {error}
        </p>
      ) : null}

      <div>
        <DataTable
          columns={columns}
          rows={data.batches}
          rowKey={(batch) => batch.id}
          viewStorageKey="batches"
          view={view}
          hideViewSwitch
          empty="先建立第一个求职批次"
          gridCard={batchCard}
        />
      </div>

      <FormDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        title="新建批次"
        description="用一个时间阶段或策略为投递分组。"
        footer={
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setDrawerOpen(false)}
            >
              取消
            </Button>
            <Button
              type="submit"
              form="create-batch-form"
              loading={pending}
            >
              创建批次
            </Button>
          </div>
        }
      >
        <form
          id="create-batch-form"
          onSubmit={create}
          className="space-y-5"
        >
          <label className="block">
            <span className="mb-2 block text-sm font-medium">批次名称</span>
            <Input
              name="name"
              placeholder="例如：2026 夏季产品岗"
              required
            />
          </label>
          <label className="block">
            <span className="mb-2 block text-sm font-medium">简短说明</span>
            <textarea
              name="description"
              rows={3}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/20"
              placeholder="这个阶段的目标是什么？"
            />
          </label>
          <div className="grid grid-cols-2 gap-3">
            <label>
              <span className="mb-2 block text-sm font-medium">开始日期</span>
              <Input name="startDate" type="date" />
            </label>
            <label>
              <span className="mb-2 block text-sm font-medium">结束日期</span>
              <Input name="endDate" type="date" />
            </label>
          </div>
          <label className="block">
            <span className="mb-2 block text-sm font-medium">投递策略</span>
            <textarea
              name="strategyMarkdown"
              rows={7}
              className="w-full rounded-md border border-input bg-background px-3 py-2 font-[var(--font-data)] text-xs leading-6 outline-none focus:border-ring focus:ring-2 focus:ring-ring/20"
              placeholder="- 这一阶段优先投递什么岗位&#10;- 每周投递和复盘节奏"
            />
          </label>
        </form>
      </FormDrawer>
    </>
  );
}
