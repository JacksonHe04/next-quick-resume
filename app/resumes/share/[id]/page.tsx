import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { ResumePreview } from "@/components/resumes/resume-preview";
import { getDb } from "@/db/client";
import { createDefaultResumeDocument } from "@/modules/resumes/defaults";
import { createResumeRepository } from "@/modules/resumes/repository";

export const dynamic = "force-dynamic";

// 隐私保护：公开分享页对访客只展示「新建简历」时的模板简历（mock 数据），
// 绝不渲染任何真实简历内容。findPublicById 仅用于确认该简历存在且已开启
// 公开分享（未公开 / 不存在的 id 依旧 404），不会把真实数据带到页面上。
const sharedTemplateDocument = createDefaultResumeDocument();

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const resume = await createResumeRepository(await getDb())
    .findPublicById(id);
  if (!resume) return { title: "简历不存在" };
  const name = sharedTemplateDocument.data.header.name || "简历模板";
  return {
    title: `${name} 的简历`,
    description: "SAYLESS 公开分享的简历模板预览",
  };
}

export default async function ResumeSharePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const resume = await createResumeRepository(await getDb())
    .findPublicById(id);
  if (!resume) notFound();

  return (
    <main className="min-h-dvh bg-muted/40 print:bg-transparent">
      <div className="mx-auto w-full max-w-[920px] px-4 py-8 sm:px-8 sm:py-12 print:max-w-none print:p-0">
        <div className="rounded-lg border border-border/60 bg-white px-6 py-8 shadow-sm sm:px-10 sm:py-12 print:rounded-none print:border-0 print:px-0 print:py-0 print:shadow-none">
          <ResumePreview document={sharedTemplateDocument} />
        </div>
      </div>
    </main>
  );
}
