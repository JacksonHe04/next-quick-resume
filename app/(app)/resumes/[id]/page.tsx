import { notFound, redirect } from "next/navigation";

import { ResumeEditorLoader } from "@/components/resumes/resume-editor-loader";
import { getAppReadContext } from "@/modules/app/read-context";
import { listResumes } from "@/modules/resumes/repository";

export default async function ResumeEditorPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { database, userId, isGuest } = await getAppReadContext();
  // 访客只有一份 demo 简历，不进入具体 id 的编辑页
  if (isGuest) redirect("/resumes");

  const resumes = await listResumes(database, userId);
  const resume = resumes.find((item) => item.id === id);
  if (!resume) notFound();

  return <ResumeEditorLoader resume={resume} resumes={resumes} />;
}
