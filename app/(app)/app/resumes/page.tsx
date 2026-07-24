import { ResumeManager } from "@/components/resumes/resume-manager";

export default function ResumesPage() {
  return (
    <div className="mx-auto max-w-7xl px-5 py-10">
      <h1 className="font-[var(--font-display)] text-3xl font-semibold tracking-[-0.04em]">
        简历
      </h1>
      <p className="mt-2 text-sm text-[#687269]">
        管理结构化简历，并在统一编辑器中预览和导出。
      </p>
      <ResumeManager />
    </div>
  );
}
