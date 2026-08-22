import { redirect } from "next/navigation";

import { ResumeEmptyState } from "@/components/resumes/resume-empty-state";
import { getAppReadContext } from "@/modules/app/read-context";
import { listResumes } from "@/modules/resumes/repository";

export default async function ResumesPage() {
  const { database, userId } = await getAppReadContext();
  const resumes = await listResumes(database, userId);
  const current = resumes[0];

  if (!current) {
    return <ResumeEmptyState />;
  }

  // /resumes 直接进入最近更新的简历编辑器；
  // 跳转到带 id 的地址，保证刷新 / 克隆等操作后当前简历不漂移。
  redirect(`/resumes/${current.id}`);
}
