import { ResumeEditor } from "@/components/resumes/resume-editor";
import type { ResumeRecord } from "@/modules/resumes/service";

export function ResumeEditorLoader({
  resume,
  resumes,
  isGuest = false,
}: {
  resume: ResumeRecord;
  resumes: ResumeRecord[];
  isGuest?: boolean;
}) {
  return (
    <ResumeEditor
      key={resume.id}
      initial={resume}
      availableResumes={resumes}
      isGuest={isGuest}
    />
  );
}
