"use client";

import { Check, Plus, Search, X } from "lucide-react";
import {
  useEffect,
  useId,
  useState,
} from "react";

import { Input } from "@/components/ui";
import { appFetch } from "@/lib/app-fetch";

export type EntityPickerOption = {
  source: "official" | "private";
  id: string;
  name: string;
};

export function EntityPicker({
  entity,
  label,
  placeholder,
  value,
  onChange,
  error,
}: {
  entity: "company" | "position";
  label: string;
  placeholder: string;
  value: EntityPickerOption | null;
  onChange(value: EntityPickerOption | null): void;
  error?: string;
}) {
  const listboxId = useId();
  const [query, setQuery] = useState("");
  const [options, setOptions] = useState<EntityPickerOption[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [requestError, setRequestError] = useState<string>();

  useEffect(() => {
    if (!open || value) return;
    const controller = new AbortController();
    const timeout = window.setTimeout(async () => {
      setLoading(true);
      setRequestError(undefined);
      try {
        const response = await appFetch(
          `/api/catalog/${entity}?q=${encodeURIComponent(query)}`,
          { signal: controller.signal },
        );
        if (!response.ok) throw new Error("目录加载失败");
        const payload = (await response.json()) as {
          options: EntityPickerOption[];
        };
        setOptions(payload.options);
      } catch (fetchError) {
        if ((fetchError as Error).name !== "AbortError") {
          setRequestError((fetchError as Error).message);
        }
      } finally {
        setLoading(false);
      }
    }, 180);
    return () => {
      window.clearTimeout(timeout);
      controller.abort();
    };
  }, [entity, open, query, value]);

  async function createPrivate() {
    if (!query.trim()) return;
    setLoading(true);
    setRequestError(undefined);
    try {
      const response = await appFetch(`/api/catalog/${entity}`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ name: query }),
      });
      if (!response.ok) throw new Error("自定义条目创建失败");
      const payload = (await response.json()) as {
        option: EntityPickerOption;
      };
      onChange(payload.option);
      setOpen(false);
      setQuery("");
    } catch (createError) {
      setRequestError((createError as Error).message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative">
      <label
        htmlFor={`${listboxId}-input`}
        className="mb-2 block text-sm font-medium"
      >
        {label}
      </label>
      {value ? (
        <div className="flex min-h-11 items-center gap-2 rounded-xl border border-[#baddc6] bg-[#f7fbf8] px-3.5">
          <Check size={15} className="text-foreground" />
          <span className="min-w-0 flex-1 truncate text-sm">
            {value.name}
          </span>
          <span className="text-[10px] text-muted-foreground">
            {value.source === "official" ? "官方" : "自定义"}
          </span>
          <button
            type="button"
            aria-label={`清除${label}`}
            onClick={() => onChange(null)}
            className="grid size-7 place-items-center rounded-full text-muted-foreground hover:bg-[#e7f1e8]"
          >
            <X size={14} />
          </button>
        </div>
      ) : (
        <>
          <div className="relative">
            <Search
              size={15}
              className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[#98a099]"
            />
            <Input
              id={`${listboxId}-input`}
              role="combobox"
              aria-expanded={open}
              aria-controls={listboxId}
              aria-autocomplete="list"
              aria-invalid={Boolean(error)}
              value={query}
              placeholder={placeholder}
              className="pl-10"
              onFocus={() => setOpen(true)}
              onChange={(event) => {
                setQuery(event.target.value);
                setOpen(true);
              }}
            />
          </div>
          {open ? (
            <div className="absolute left-0 right-0 top-[calc(100%+6px)] z-30 overflow-hidden rounded-xl border border-border bg-white shadow-[0_18px_50px_rgb(32_38_32/0.14)]">
              <div
                id={listboxId}
                role="listbox"
                className="max-h-56 overflow-y-auto p-1.5"
              >
                {options.map((option) => (
                  <button
                    key={`${option.source}:${option.id}`}
                    type="button"
                    role="option"
                    aria-selected="false"
                    onClick={() => {
                      onChange(option);
                      setOpen(false);
                      setQuery("");
                    }}
                    className="flex min-h-10 w-full items-center justify-between rounded-lg px-3 text-left text-sm hover:bg-muted"
                  >
                    <span>{option.name}</span>
                    <span className="text-[10px] text-muted-foreground">
                      {option.source === "official" ? "官方" : "自定义"}
                    </span>
                  </button>
                ))}
                {!loading && options.length === 0 && !query ? (
                  <p className="px-3 py-4 text-center text-xs text-muted-foreground">
                    输入名称开始搜索
                  </p>
                ) : null}
              </div>
              {query.trim() ? (
                <button
                  type="button"
                  onClick={createPrivate}
                  disabled={loading}
                  className="flex min-h-11 w-full items-center gap-2 border-t border-border px-4 text-left text-sm text-foreground transition hover:bg-[#f7fbf8] disabled:opacity-50"
                >
                  <Plus size={15} />
                  没找到？使用“{query.trim()}”
                </button>
              ) : null}
              {requestError ? (
                <p className="border-t border-[#f0dadd] bg-[#fbecef] px-3 py-2 text-xs text-[#9d4450]">
                  {requestError}
                </p>
              ) : null}
            </div>
          ) : null}
        </>
      )}
      {error ? (
        <p className="mt-1.5 text-xs text-[#9d4450]">{error}</p>
      ) : null}
    </div>
  );
}
