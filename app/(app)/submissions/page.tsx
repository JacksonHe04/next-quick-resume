import { SubmissionManager } from "@/components/submissions/submission-manager";
import { getAppReadContext } from "@/modules/app/read-context";
import { createBatchRepository } from "@/modules/batches/repository";
import { listBatches } from "@/modules/batches/service";
import { listSubmissionViews } from "@/modules/submissions/repository";

export default async function SubmissionsPage() {
  const { database, userId } = await getAppReadContext();
  const [submissions, batchData] = await Promise.all([
    listSubmissionViews(database, userId),
    listBatches(createBatchRepository(database), userId),
  ]);
  const activeBatches = batchData.batches.filter(
    (batch) => !batch.archivedAt,
  );

  return (
    <div className="mx-auto max-w-7xl px-5 py-7 lg:py-9">
      <SubmissionManager
        initialSubmissions={submissions}
        initialBatches={activeBatches}
        initialCurrentBatchId={batchData.currentBatchId}
      />
    </div>
  );
}
