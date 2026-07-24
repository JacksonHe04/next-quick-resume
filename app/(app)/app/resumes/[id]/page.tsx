import { ResumeEditorLoader } from "@/components/resumes/resume-editor-loader";

export default async function ResumeEditorPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  return <ResumeEditorLoader id={(await params).id} />;
}
