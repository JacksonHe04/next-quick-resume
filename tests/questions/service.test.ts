import { describe, expect, it } from "vitest";

import {
  createQuestion,
  linkQuestion,
  updateQuestion,
  type QuestionRecord,
  type QuestionRepository,
} from "@/modules/questions/service";

class MemoryQuestionRepository implements QuestionRepository {
  questions = new Map<string, QuestionRecord>();
  interviews = new Map<string, { id: string; userId: string }>();
  links = new Set<string>();

  async findQuestion(userId: string, id: string) {
    const question = this.questions.get(id);
    return question?.userId === userId ? question : null;
  }

  async findInterview(userId: string, id: string) {
    const interview = this.interviews.get(id);
    return interview?.userId === userId ? interview : null;
  }

  async insert(record: QuestionRecord) {
    this.questions.set(record.id, record);
  }

  async update(id: string, changes: Partial<QuestionRecord>) {
    Object.assign(this.questions.get(id)!, changes);
  }

  async delete(id: string) {
    this.questions.delete(id);
  }

  async link(userId: string, interviewId: string, questionId: string) {
    this.links.add(`${userId}:${interviewId}:${questionId}`);
  }

  async unlink(userId: string, interviewId: string, questionId: string) {
    this.links.delete(`${userId}:${interviewId}:${questionId}`);
  }
}

const now = new Date("2026-07-25T00:00:00.000Z");

describe("question service", () => {
  it("creates a question with one continuously editable standard answer", async () => {
    const repository = new MemoryQuestionRepository();
    const question = await createQuestion(
      repository,
      "user-a",
      {
        questionText: "为什么选择产品经理？",
        answerMarkdown: "初始答案",
        category: "动机",
      },
      now,
    );

    await updateQuestion(
      repository,
      "user-a",
      question.id,
      { answerMarkdown: "持续迭代后的答案" },
      now,
    );

    expect(repository.questions.get(question.id)).toMatchObject({
      answerMarkdown: "持续迭代后的答案",
    });
  });

  it("links the current user's question to the current user's interview", async () => {
    const repository = new MemoryQuestionRepository();
    const question = await createQuestion(
      repository,
      "user-a",
      { questionText: "介绍一个项目", answerMarkdown: "" },
      now,
    );
    repository.interviews.set("interview-a", {
      id: "interview-a",
      userId: "user-a",
    });

    await linkQuestion(repository, "user-a", {
      interviewId: "interview-a",
      questionId: question.id,
    });

    expect(repository.links).toContain(
      `user-a:interview-a:${question.id}`,
    );
  });

  it("rejects linking another user's question to an interview", async () => {
    const repository = new MemoryQuestionRepository();
    const question = await createQuestion(
      repository,
      "user-b",
      { questionText: "Private question", answerMarkdown: "" },
      now,
    );
    repository.interviews.set("interview-a", {
      id: "interview-a",
      userId: "user-a",
    });

    await expect(
      linkQuestion(repository, "user-a", {
        interviewId: "interview-a",
        questionId: question.id,
      }),
    ).rejects.toMatchObject({ code: "QUESTION_NOT_FOUND" });
    expect(repository.links.size).toBe(0);
  });
});
