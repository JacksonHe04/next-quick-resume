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
  useEffect,
  useState,
} from "react";

import {
  Button,
  Card,
  FormDrawer,
  Input,
  StatusBadge,
} from "@/components/ui";

type Batch = {
  id: string;
  name: string;
  description: string | null;
  strategyMarkdown: string | null;
  startDate: string | null;
  endDate: string | null;
  archivedAt: string | null;
};

type BatchResponse = {
  batches: Batch[];
  currentBatchId: string | null;
};

async function api(
  url: string,
  method: "POST" | "DELETE",
  body?: unknown,
) {
  const response = await fetch(url, {
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

function formatDate(value: string | null) {
  return value
    ? new Intl.DateTimeFormat("zh-CN", {
        year: "numeric",
        month: "short",
        day: "numeric",
      }).format(new Date(value))
    : null;
}

export function BatchManager() {
  const [data, setData] = useState<BatchResponse>({
    batches: [],
    currentBatchId: null,
  });
  const [loading, setLoading] = useState(true);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string>();

  const load = useCallback(async () => {
    const response = await fetch("/api/batches", { cache: "no-store" });
    if (!response.ok) throw new Error("批次加载失败");
    setData((await response.json()) as BatchResponse);
  }, []);

  useEffect(() => {
    load()
      .catch((loadError) => setError((loadError as Error).message))
      .finally(() => setLoading(false));
  }, [load]);

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

  async function perform(
    action: () => Promise<void>,
  ) {
    setError(undefined);
    try {
      await action();
      await load();
    } catch (actionError) {
      setError((actionError as Error).message);
    }
  }

  if (loading) {
    return (
      <div className="mt-7 grid gap-3 sm:grid-cols-2">
        {[0, 1].map((item) => (
          <div
            key={item}
            className="h-48 animate-pulse rounded-[18px] border border-[#dce5dd] bg-white/60"
          />
        ))}
      </div>
    );
  }

  return (
    <>
      <div className="mt-7 flex items-center justify-between gap-4">
        <p className="text-sm text-[#687269]">
          当前批次只作为新建投递的默认分组，不会筛选其他页面。
        </p>
        <Button onClick={() => setDrawerOpen(true)}>
          <Plus size={16} />
          新建批次
        </Button>
      </div>
      {error ? (
        <p
          role="alert"
          className="mt-4 rounded-xl border border-[#ebc3c8] bg-[#fbecef] px-4 py-3 text-sm text-[#9d4450]"
        >
          {error}
        </p>
      ) : null}

      {data.batches.length === 0 ? (
        <Card className="mt-5 grid min-h-64 place-items-center p-8 text-center shadow-none">
          <div>
            <span className="mx-auto grid size-12 place-items-center rounded-2xl bg-[#e7f6ec] text-[#27764b]">
              <CalendarRange size={21} />
            </span>
            <h2 className="mt-4 font-medium">先建立第一个求职批次</h2>
            <p className="mt-1 text-sm text-[#687269]">
              例如“2026 夏季产品岗”或“毕业前冲刺阶段”。
            </p>
            <Button
              className="mt-5"
              onClick={() => setDrawerOpen(true)}
            >
              新建批次
            </Button>
          </div>
        </Card>
      ) : (
        <div className="mt-5 grid gap-4 md:grid-cols-2">
          {data.batches.map((batch) => {
            const current = batch.id === data.currentBatchId;
            const archived = Boolean(batch.archivedAt);
            const start = formatDate(batch.startDate);
            const end = formatDate(batch.endDate);
            return (
              <Card
                key={batch.id}
                className={
                  current
                    ? "border-[#9fd1ae] p-5 shadow-[0_15px_45px_rgb(39_118_75/0.08)]"
                    : "p-5 shadow-none"
                }
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="truncate font-[var(--font-display)] text-lg font-semibold tracking-[-0.03em]">
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
                    {batch.description ? (
                      <p className="mt-2 line-clamp-2 text-sm leading-6 text-[#687269]">
                        {batch.description}
                      </p>
                    ) : null}
                    {start || end ? (
                      <p className="mt-3 font-[var(--font-data)] text-[10px] text-[#879088]">
                        {start ?? "未设置"} — {end ?? "至今"}
                      </p>
                    ) : null}
                  </div>
                  <CalendarRange
                    size={18}
                    className="shrink-0 text-[#55a572]"
                  />
                </div>

                <div className="mt-5 flex flex-wrap gap-2 border-t border-[#edf0ed] pt-4">
                  {!archived && !current ? (
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() =>
                        perform(() =>
                          api(
                            `/api/batches/${batch.id}/current`,
                            "POST",
                          ),
                        )
                      }
                    >
                      <Check size={14} />
                      设为当前
                    </Button>
                  ) : null}
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() =>
                      perform(() =>
                        api(
                          `/api/batches/${batch.id}/archive`,
                          "POST",
                          { archived: !archived },
                        ),
                      )
                    }
                  >
                    {archived ? (
                      <RotateCcw size={14} />
                    ) : (
                      <Archive size={14} />
                    )}
                    {archived ? "恢复" : "归档"}
                  </Button>
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() =>
                      perform(() =>
                        api(`/api/batches/${batch.id}`, "DELETE"),
                      )
                    }
                  >
                    <Trash2 size={14} />
                    删除
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      )}

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
            <span className="mb-2 block text-sm font-medium">
              批次名称
            </span>
            <Input
              name="name"
              placeholder="例如：2026 夏季产品岗"
              required
            />
          </label>
          <label className="block">
            <span className="mb-2 block text-sm font-medium">
              简短说明
            </span>
            <textarea
              name="description"
              rows={3}
              className="w-full rounded-xl border border-[#dce5dd] bg-white px-3.5 py-3 text-sm outline-none transition focus:border-[#55b97a] focus:ring-3 focus:ring-[#55b97a]/15"
              placeholder="这个阶段的目标是什么？"
            />
          </label>
          <div className="grid grid-cols-2 gap-3">
            <label>
              <span className="mb-2 block text-sm font-medium">
                开始日期
              </span>
              <Input name="startDate" type="date" />
            </label>
            <label>
              <span className="mb-2 block text-sm font-medium">
                结束日期
              </span>
              <Input name="endDate" type="date" />
            </label>
          </div>
          <label className="block">
            <span className="mb-2 block text-sm font-medium">
              投递策略
            </span>
            <textarea
              name="strategyMarkdown"
              rows={7}
              className="w-full rounded-xl border border-[#dce5dd] bg-white px-3.5 py-3 font-[var(--font-data)] text-xs leading-6 outline-none transition focus:border-[#55b97a] focus:ring-3 focus:ring-[#55b97a]/15"
              placeholder="- 这一阶段优先投递什么岗位&#10;- 每周投递和复盘节奏"
            />
          </label>
        </form>
      </FormDrawer>
    </>
  );
}
