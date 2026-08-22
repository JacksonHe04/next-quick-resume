import { ResumeEditor } from "@/components/resumes/resume-editor";
import type { ResumeRecord } from "@/modules/resumes/service";

export function ResumeEditorLoader({
  resume,
  resumes,
  isGuest = false,
  guestDraft = false,
}: {
  resume: ResumeRecord;
  resumes: ResumeRecord[];
  isGuest?: boolean;
  // 访客编辑的是「新建简历」模板 mock（尚未物化）：首次修改才创建记录；
  // 反之回访访客拿到的是自己设备下已物化的记录，直接续写。
  guestDraft?: boolean;
}) {
  return (
    <ResumeEditor
      key={resume.id}
      initial={resume}
      availableResumes={resumes}
      isGuest={isGuest}
      guestDraft={guestDraft}
    />
  );
}
