import { ConversionChart } from "@/components/dashboard/conversion-chart";
import { DashboardTopbar } from "@/components/dashboard/dashboard-topbar";
import { DashboardMetrics } from "@/components/dashboard/metrics";
import { UpcomingInterviews } from "@/components/dashboard/upcoming-interviews";
import { getAppReadContext } from "@/modules/app/read-context";
import { createBatchRepository } from "@/modules/batches/repository";
import { listBatches } from "@/modules/batches/service";
import { createDashboardRepository } from "@/modules/dashboard/repository";
import { getDashboard } from "@/modules/dashboard/service";

export default async function DashboardPage() {
  const { database, user, userId } = await getAppReadContext();

  const [dashboard, batchData] = await Promise.all([
    getDashboard(createDashboardRepository(database), userId, {}),
    listBatches(createBatchRepository(database), userId),
  ]);
  const hour = new Date().getHours();
  const greeting =
    hour < 11 ? "早上好" : hour < 18 ? "下午好" : "晚上好";

  return (
    <>
      <DashboardTopbar
        batches={batchData.batches
          .filter((batch) => !batch.archivedAt)
          .map((batch) => ({ id: batch.id, name: batch.name }))}
        initialCurrentBatchId={batchData.currentBatchId}
      />
      <div className="mx-auto max-w-[1440px] px-4 py-7 sm:px-7 lg:px-10 lg:py-9">
        <h1 className="font-[var(--font-display)] text-3xl font-semibold tracking-[-0.045em] sm:text-4xl">
          {user ? `${greeting}${user.name ? `，${user.name}` : ""}` : "欢迎体验"}
          。继续向前。
        </h1>

        <DashboardMetrics dashboard={dashboard} />

        <div className="mt-5 grid gap-5 xl:grid-cols-[1.15fr_0.85fr]">
          <ConversionChart dashboard={dashboard} />
          <UpcomingInterviews interviews={dashboard.upcomingInterviews} />
        </div>
      </div>
    </>
  );
}
