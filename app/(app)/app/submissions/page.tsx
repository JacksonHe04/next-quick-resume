import { SubmissionManager } from "@/components/submissions/submission-manager";

export default function SubmissionsPage() {
  return (
    <div className="mx-auto max-w-7xl px-5 py-10">
      <h1 className="font-[var(--font-display)] text-3xl font-semibold tracking-[-0.04em]">
        投递
      </h1>
      <p className="mt-2 text-sm text-[#687269]">
        记录已经发生的投递，并持续跟进当前阶段。
      </p>
      <SubmissionManager />
    </div>
  );
}
