import { BatchManager } from "@/components/batches/batch-manager";
import { getAppReadContext } from "@/modules/app/read-context";
import { createBatchRepository } from "@/modules/batches/repository";
import { listBatches } from "@/modules/batches/service";

export default async function BatchesPage() {
  const { database, userId } = await getAppReadContext();
  const initialData = await listBatches(
    createBatchRepository(database),
    userId,
  );

  return (
    <div className="mx-auto max-w-7xl px-5 py-10">
      <h1 className="font-[var(--font-display)] text-3xl font-semibold tracking-[-0.04em]">
        批次
      </h1>
      <p className="mt-2 text-sm text-muted-foreground">
        按求职阶段为投递分组，并选择一个当前批次。
      </p>
      <BatchManager initialData={initialData} />
    </div>
  );
}
