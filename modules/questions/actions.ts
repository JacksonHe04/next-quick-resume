import { NextResponse } from "next/server";
import { ZodError } from "zod";

import {
  getAuthenticatedDatabaseContext,
  unauthenticatedResponse,
} from "@/modules/auth/action-context";
import { createQuestionRepository } from "@/modules/questions/repository";
import { QuestionError } from "@/modules/questions/service";

export async function getQuestionActionContext(request: Request) {
  const context = await getAuthenticatedDatabaseContext(request);
  if (!context) return null;
  return {
    database: context.database,
    user: context.user,
    repository: createQuestionRepository(context.database),
  };
}

export function questionErrorResponse(error: unknown) {
  if (error instanceof QuestionError) {
    return NextResponse.json(
      { error: { code: error.code, message: error.message } },
      { status: 404 },
    );
  }
  if (error instanceof ZodError) {
    return NextResponse.json(
      {
        error: {
          code: "INVALID_REQUEST",
          message: "请求内容无效",
          details: error.flatten().fieldErrors,
        },
      },
      { status: 400 },
    );
  }
  console.error("Unhandled question error", error);
  return NextResponse.json(
    {
      error: {
        code: "INTERNAL_ERROR",
        message: "服务暂时不可用，请稍后再试",
      },
    },
    { status: 500 },
  );
}

export { unauthenticatedResponse };
