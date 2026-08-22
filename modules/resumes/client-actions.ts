import { appFetch } from "@/lib/app-fetch";
import { createDefaultResumeDocument } from "@/modules/resumes/defaults";
import type { ResumeRecord } from "@/modules/resumes/service";

export async function createResume(
  name: string,
): Promise<ResumeRecord> {
  const response = await appFetch("/api/resumes", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      name,
      document: createDefaultResumeDocument(),
    }),
  });
  const payload = (await response.json().catch(() => ({}))) as {
    resume?: ResumeRecord;
    error?: { message?: string };
  };
  if (!response.ok || !payload.resume) {
    throw new Error(payload.error?.message ?? "创建失败");
  }
  return payload.resume;
}
