import { notFound } from "next/navigation";

import { ResumeEditorLoader } from "@/components/resumes/resume-editor-loader";
import { getAppReadContext } from "@/modules/app/read-context";
import { listResumes, scopeOf } from "@/modules/resumes/repository";

export default async function ResumeEditorPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { database, userId, isGuest, guestDeviceId } =
    await getAppReadContext();
  // 访客只允许打开自己设备下物化的简历（scope 按 guest_device_id 过滤，
  // 其他设备 / 账号的记录一律 404）；从未物化过的访客直接回到 /resumes。
  // 注意：无有效设备 id 的访客必须 404——scope 回退会命中 demo 账号自己的
  // 种子简历，绝不能把它渲染给访客。
  if (isGuest && !guestDeviceId) notFound();
  const scope = scopeOf(guestDeviceId);
  const resumes = await listResumes(database, userId, scope);
  const resume = resumes.find((item) => item.id === id);
  if (!resume) notFound();

  return (
    <ResumeEditorLoader
      resume={resume}
      resumes={resumes}
      isGuest={isGuest}
    />
  );
}
