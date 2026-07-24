import { NextResponse } from "next/server";

import {
  getQuestionActionContext,
  questionErrorResponse,
  unauthenticatedResponse,
} from "@/modules/questions/actions";
import {
  linkQuestion,
  unlinkQuestion,
} from "@/modules/questions/service";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const context = await getQuestionActionContext(request);
    if (!context) return unauthenticatedResponse();
    const { interviewId } = (await request.json()) as {
      interviewId: string;
    };
    await linkQuestion(context.repository, context.user.id, {
      questionId: (await params).id,
      interviewId,
    });
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
    const { interviewId } = (await request.json()) as {
      interviewId: string;
    };
    await unlinkQuestion(context.repository, context.user.id, {
      questionId: (await params).id,
      interviewId,
    });
    return NextResponse.json({ ok: true });
  } catch (error) {
    return questionErrorResponse(error);
  }
}
