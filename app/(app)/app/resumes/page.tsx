import { ResumeManager } from "@/components/resumes/resume-manager";
import { ResumeWorkspaceSwitch } from "@/components/resumes/resume-workspace-switch";
import { getAppReadContext } from "@/modules/app/read-context";
import { listResumes } from "@/modules/resumes/repository";

export default async function ResumesPage() {
  const { database, userId } = await getAppReadContext();
  const resumes = await listResumes(database, userId);
  const editorHref = resumes[0]
    ? `/app/resumes/${resumes[0].id}`
    : undefined;

  return (
    <div className="mx-auto max-w-7xl px-5 py-10">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-[var(--font-display)] text-3xl font-semibold tracking-[-0.04em]">
            简历
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            管理结构化简历，并在统一编辑器中预览和导出。
          </p>
        </div>
        <ResumeWorkspaceSwitch
          mode="manage"
          editorHref={editorHref}
        />
      </div>
      <ResumeManager initialResumes={resumes} />
    </div>
  );
}
