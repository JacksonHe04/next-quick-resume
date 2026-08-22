import { redirect } from "next/navigation";

import { ResumeEditorLoader } from "@/components/resumes/resume-editor-loader";
import { ResumeEmptyState } from "@/components/resumes/resume-empty-state";
import { getAppReadContext } from "@/modules/app/read-context";
import { listResumes } from "@/modules/resumes/repository";
import { DEMO_RESUME_ID } from "@/db/seed/demo";
import { createDefaultResumeDocument } from "@/modules/resumes/defaults";

export default async function ResumesPage() {
  const { database, userId, isGuest } = await getAppReadContext();
  const resumes = await listResumes(database, userId);

  // 访客：直接编辑 demo 简历，首次修改时才在数据库物化
  if (isGuest) {
    const demo =
      resumes.find((record) => record.id === DEMO_RESUME_ID) ?? {
        id: DEMO_RESUME_ID,
        userId,
        name: "我的简历",
        document: createDefaultResumeDocument(),
        isPublic: false,
        version: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
    return <ResumeEditorLoader resume={demo} resumes={[demo]} isGuest />;
  }

  const current = resumes[0];
  if (!current) {
    return <ResumeEmptyState />;
  }

  // /resumes 直接进入最近更新的简历编辑器；
  // 跳转到带 id 的地址，保证刷新 / 克隆等操作后当前简历不漂移。
  redirect(`/resumes/${current.id}`);
}
