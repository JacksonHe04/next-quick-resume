import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { ResumePreview } from "@/components/resumes/resume-preview";
import { getDb } from "@/db/client";
import { createResumeRepository } from "@/modules/resumes/repository";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const resume = await createResumeRepository(await getDb())
    .findPublicById(id);
  if (!resume) return { title: "简历不存在" };
  const name = resume.document.data.header.name || resume.name;
  return {
    title: `${name} 的简历`,
    description: "SAYLESS 公开分享的简历预览",
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
          <ResumePreview document={resume.document} />
        </div>
      </div>
    </main>
  );
}
