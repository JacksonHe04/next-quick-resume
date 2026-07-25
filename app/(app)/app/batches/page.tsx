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
    <div className="mx-auto max-w-7xl px-5 py-7 lg:py-9">
      <BatchManager initialData={initialData} />
    </div>
  );
}
