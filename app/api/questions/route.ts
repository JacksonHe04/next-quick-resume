import { NextResponse } from "next/server";

import {
  getQuestionActionContext,
  questionErrorResponse,
  unauthenticatedResponse,
} from "@/modules/questions/actions";
import { listQuestionViews } from "@/modules/questions/repository";
import { createQuestion } from "@/modules/questions/service";

export async function GET(request: Request) {
  try {
    const context = await getQuestionActionContext(request);
    if (!context) return unauthenticatedResponse();
    const questions = await listQuestionViews(
      context.database,
      context.user.id,
    );
    return NextResponse.json({ questions });
  } catch (error) {
    return questionErrorResponse(error);
  }
}

export async function POST(request: Request) {
  try {
    const context = await getQuestionActionContext(request);
    if (!context) return unauthenticatedResponse();
    const question = await createQuestion(
      context.repository,
      context.user.id,
      await request.json(),
    );
    return NextResponse.json({ question }, { status: 201 });
  } catch (error) {
    return questionErrorResponse(error);
  }
}
