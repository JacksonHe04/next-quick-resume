"use client";

import { Send } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { AppTopbarPortal } from "@/components/app/app-topbar";
import { IntentLink } from "@/components/app/intent-link";
import { Button } from "@/components/ui/button";
import { appFetch } from "@/lib/app-fetch";

export function DashboardTopbar({
  batches,
  initialCurrentBatchId,
}: {
  batches: Array<{ id: string; name: string }>;
  initialCurrentBatchId: string | null;
}) {
  const router = useRouter();
  const [currentBatchId, setCurrentBatchId] = useState(
    initialCurrentBatchId ?? "",
  );
  const [pending, setPending] = useState(false);

  async function changeBatch(batchId: string) {
    if (!batchId || batchId === currentBatchId) return;
    const previous = currentBatchId;
    setCurrentBatchId(batchId);
    setPending(true);
    const response = await appFetch(`/api/batches/${batchId}/current`, {
      method: "POST",
    });
    setPending(false);
    if (!response.ok) {
      setCurrentBatchId(previous);
      return;
    }
    router.refresh();
  }

  return (
    <AppTopbarPortal>
      <label className="flex items-center gap-2">
        <span className="hidden text-xs font-medium text-muted-foreground sm:inline">
          当前批次
        </span>
        <select
          aria-label="当前批次"
          value={currentBatchId}
          disabled={pending || batches.length === 0}
          onChange={(event) => void changeBatch(event.target.value)}
          className="h-9 min-w-36 max-w-56 rounded-md border border-input bg-background px-3 text-sm font-medium shadow-xs outline-none focus:border-ring focus:ring-3 focus:ring-ring/20"
        >
          {batches.length === 0 ? (
            <option value="">尚未建立批次</option>
          ) : null}
          {batches.map((batch) => (
            <option key={batch.id} value={batch.id}>
              {batch.name}
            </option>
          ))}
        </select>
      </label>
      <div className="ml-auto">
        <Button asChild>
          <IntentLink href="/app/submissions">
            <Send aria-hidden="true" />
            记录投递
          </IntentLink>
        </Button>
      </div>
    </AppTopbarPortal>
  );
}
