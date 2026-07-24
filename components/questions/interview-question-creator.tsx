"use client";

import { Plus } from "lucide-react";
import { useState } from "react";

import { QuestionForm } from "@/components/questions/question-form";
import { Button, FormDrawer } from "@/components/ui";

export function InterviewQuestionCreator({
  interviewId,
}: {
  interviewId: string;
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button variant="secondary" onClick={() => setOpen(true)}>
        <Plus size={14} />
        沉淀面试问题
      </Button>
      <FormDrawer
        open={open}
        onClose={() => setOpen(false)}
        title="沉淀面试问题"
        description="创建后会自动关联当前选拔事件。"
      >
        <QuestionForm
          interviewId={interviewId}
          onCreated={() => setOpen(false)}
        />
      </FormDrawer>
    </>
  );
}
