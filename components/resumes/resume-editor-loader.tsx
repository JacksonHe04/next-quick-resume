"use client";

import { useCallback, useEffect, useState } from "react";

import { ResumeEditor } from "@/components/resumes/resume-editor";
import { appFetch } from "@/lib/app-fetch";
import type { ResumeRecord } from "@/modules/resumes/service";

export function ResumeEditorLoader({ id }: { id: string }) {
  const [resume, setResume] = useState<ResumeRecord>();
  const [error, setError] = useState<string>();

  const load = useCallback(async () => {
    const response = await appFetch(`/api/resumes/${id}`, {
      cache: "no-store",
    });
    const payload = (await response.json().catch(() => ({}))) as {
      resume?: ResumeRecord;
      error?: { message?: string };
    };
    if (!response.ok || !payload.resume) {
      throw new Error(payload.error?.message ?? "简历不存在");
    }
    setResume(payload.resume);
  }, [id]);

  useEffect(() => {
    load().catch((loadError) => setError((loadError as Error).message));
  }, [load]);

  if (error) {
    return (
      <div className="grid min-h-screen place-items-center bg-[#f4f6f1] p-6">
        <p role="alert" className="text-sm text-[#9d4450]">
          {error}
        </p>
      </div>
    );
  }
  if (!resume) {
    return (
      <div className="min-h-screen animate-pulse bg-[#eef2eb]" />
    );
  }
  return <ResumeEditor initial={resume} />;
}
