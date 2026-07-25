import { ResumeEditor } from "@/components/resumes/resume-editor";
import type { ResumeRecord } from "@/modules/resumes/service";

export function ResumeEditorLoader({
  resume,
  resumes,
}: {
  resume: ResumeRecord;
  resumes: ResumeRecord[];
}) {
  return (
    <ResumeEditor
      key={resume.id}
      initial={resume}
      availableResumes={resumes}
    />
  );
}
