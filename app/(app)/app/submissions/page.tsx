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
    <div className="mx-auto max-w-7xl px-5 py-10">
      <h1 className="font-[var(--font-display)] text-3xl font-semibold tracking-[-0.04em]">
        投递
      </h1>
      <p className="mt-2 text-sm text-muted-foreground">
        记录已经发生的投递，并持续跟进当前阶段。
      </p>
      <SubmissionManager
        initialSubmissions={submissions}
        initialBatches={activeBatches}
        initialCurrentBatchId={batchData.currentBatchId}
      />
    </div>
  );
}
