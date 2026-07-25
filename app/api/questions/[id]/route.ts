import { NextResponse } from "next/server";

import { getReadDatabaseContext } from "@/modules/auth/action-context";
import { createQuestionRepository } from "@/modules/questions/repository";
import {
  getQuestionActionContext,
  questionErrorResponse,
  unauthenticatedResponse,
} from "@/modules/questions/actions";
import { listQuestionInterviewLinks } from "@/modules/questions/repository";
import {
  deleteQuestion,
  updateQuestion,
} from "@/modules/questions/service";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const context = await getReadDatabaseContext(request);
    const id = (await params).id;
    const repository = createQuestionRepository(context.database);
    const question = await repository.findQuestion(context.userId, id);
    if (!question) {
      return NextResponse.json(
        {
          error: {
            code: "QUESTION_NOT_FOUND",
            message: "问题不存在",
          },
        },
        { status: 404 },
      );
    }
    const interviews = await listQuestionInterviewLinks(
      context.database,
      context.userId,
      id,
    );
    return NextResponse.json({ question, interviews });
  } catch (error) {
    return questionErrorResponse(error);
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const context = await getQuestionActionContext(request);
    if (!context) return unauthenticatedResponse();
    await updateQuestion(
      context.repository,
      context.user.id,
      (await params).id,
      await request.json(),
    );
    return NextResponse.json({ ok: true });
  } catch (error) {
    return questionErrorResponse(error);
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const context = await getQuestionActionContext(request);
    if (!context) return unauthenticatedResponse();
    await deleteQuestion(
      context.repository,
      context.user.id,
      (await params).id,
    );
    return NextResponse.json({ ok: true });
  } catch (error) {
    return questionErrorResponse(error);
  }
}
