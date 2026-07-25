import { InterviewManager } from "@/components/interviews/interview-manager";

export default function InterviewsPage() {
  return (
    <div className="mx-auto max-w-7xl px-5 py-10">
      <h1 className="font-[var(--font-display)] text-3xl font-semibold tracking-[-0.04em]">
        面试
      </h1>
      <p className="mt-2 text-sm text-muted-foreground">
        管理测评、笔试和每一轮面试安排。
      </p>
      <InterviewManager />
    </div>
  );
}
