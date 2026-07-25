import { notFound } from "next/navigation";

import { ResumeEditorLoader } from "@/components/resumes/resume-editor-loader";
import { getAppReadContext } from "@/modules/app/read-context";
import { listResumes } from "@/modules/resumes/repository";

export default async function ResumeEditorPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { database, userId } = await getAppReadContext();
  const resumes = await listResumes(database, userId);
  const resume = resumes.find((item) => item.id === id);
  if (!resume) notFound();

  return <ResumeEditorLoader resume={resume} resumes={resumes} />;
}
