import { redirect } from "next/navigation";

import { ResumeEditorLoader } from "@/components/resumes/resume-editor-loader";
import { ResumeEmptyState } from "@/components/resumes/resume-empty-state";
import { getAppReadContext } from "@/modules/app/read-context";
import { listResumes, scopeOf } from "@/modules/resumes/repository";
import { DEMO_RESUME_ID } from "@/db/seed/demo";
import { createDefaultResumeDocument } from "@/modules/resumes/defaults";
import type { ResumeRecord } from "@/modules/resumes/service";

export default async function ResumesPage() {
  const { database, userId, isGuest, guestDeviceId } =
    await getAppReadContext();
  const scope = scopeOf(guestDeviceId);
  const resumes = await listResumes(database, userId, scope);

  // 访客：绝不读取数据库里任何真实简历（历史版本曾把真实简历存进 demo-resume
  // 行，构成隐私泄露）。只做两件事：
  // 1) 本浏览器设备已物化过简历（guest_device_id 命中）→ 直接回到最近编辑的
  //    那一份继续编辑（与登录用户的行为一致）；
  // 2) 否则展示「新建简历」时的模板简历（mock），首次修改时物化为该设备下的
  //    新记录（见 resume-editor 的访客保存流程）。
  if (isGuest) {
    if (guestDeviceId && resumes.length > 0) {
      redirect(`/resumes/${resumes[0].id}`);
    }
    const demo: ResumeRecord = {
      id: DEMO_RESUME_ID,
      userId,
      guestDeviceId: null,
      name: "我的简历",
      document: createDefaultResumeDocument(),
      isPublic: false,
      version: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    return <ResumeEditorLoader resume={demo} resumes={[demo]} isGuest guestDraft />;
  }

  const current = resumes[0];
  if (!current) {
    return <ResumeEmptyState />;
  }

  // /resumes 直接进入最近更新的简历编辑器；
  // 跳转到带 id 的地址，保证刷新 / 克隆等操作后当前简历不漂移。
  redirect(`/resumes/${current.id}`);
}
