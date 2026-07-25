import { ResumeManager } from "@/components/resumes/resume-manager";
import { getAppReadContext } from "@/modules/app/read-context";
import { listResumes } from "@/modules/resumes/repository";

export default async function ResumesPage() {
  const { database, userId } = await getAppReadContext();
  const resumes = await listResumes(database, userId);

  return (
    <div className="mx-auto max-w-7xl px-5 py-10">
      <h1 className="font-[var(--font-display)] text-3xl font-semibold tracking-[-0.04em]">
        简历
      </h1>
      <p className="mt-2 text-sm text-muted-foreground">
        管理结构化简历，并在统一编辑器中预览和导出。
      </p>
      <ResumeManager initialResumes={resumes} />
    </div>
  );
}
