"use client";

import { FileText, Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { createResume } from "@/modules/resumes/client-actions";

export function ResumeEmptyState() {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string>();

  async function create() {
    setPending(true);
    setError(undefined);
    try {
      const resume = await createResume("我的简历");
      router.push(`/resumes/${resume.id}`);
    } catch (createError) {
      setError((createError as Error).message);
      setPending(false);
    }
  }

  return (
    <div className="mx-auto max-w-7xl px-5 py-7 lg:py-9">
      <div className="grid place-items-center rounded-xl border border-dashed border-border bg-muted/20 px-6 py-20 text-center">
        <div className="grid size-14 place-items-center rounded-2xl border border-border bg-background">
          <FileText className="size-6 text-[#55a572]" aria-hidden="true" />
        </div>
        <h1 className="mt-5 text-xl font-semibold text-foreground">
          还没有简历
        </h1>
        <p className="mt-2 max-w-sm text-sm text-muted-foreground">
          创建第一份结构化简历，编辑与预览会直接展示在这里。
        </p>
        {error ? (
          <p role="alert" className="mt-3 text-sm text-destructive">
            {error}
          </p>
        ) : null}
        <Button className="mt-6" onClick={() => void create()} loading={pending}>
          <Plus aria-hidden="true" />
          新建简历
        </Button>
      </div>
    </div>
  );
}
