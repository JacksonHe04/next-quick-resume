import Link from "next/link";

import { Card } from "@/components/ui";

export default function ResumesPage() {
  return (
    <div className="mx-auto max-w-6xl px-5 py-10">
      <h1 className="font-[var(--font-display)] text-3xl font-semibold tracking-[-0.04em]">
        简历
      </h1>
      <p className="mt-2 text-sm text-[#687269]">
        管理结构化简历，并在统一编辑器中预览和导出。
      </p>
      <Card className="mt-7 p-6 shadow-none">
        <h2 className="font-medium">默认简历</h2>
        <p className="mt-2 text-sm text-[#687269]">
          当前简历编辑功能已保留，服务端多简历管理将在本模块中继续整合。
        </p>
        <Link
          href="/app/resumes/editor"
          className="mt-5 inline-flex rounded-xl bg-[#27764b] px-4 py-2.5 text-sm font-medium text-white"
        >
          打开编辑器
        </Link>
      </Card>
    </div>
  );
}
