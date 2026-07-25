import { NextResponse } from "next/server";
import { ZodError } from "zod";

import { firstFieldError } from "@/lib/http/errors";
import {
  getAuthenticatedDatabaseContext,
  unauthenticatedResponse,
} from "@/modules/auth/action-context";
import { createSubmissionRepository } from "@/modules/submissions/repository";
import { SubmissionError } from "@/modules/submissions/service";

export async function getSubmissionActionContext(request: Request) {
  const context = await getAuthenticatedDatabaseContext(request);
  if (!context) return null;
  return {
    database: context.database,
    user: context.user,
    repository: createSubmissionRepository(context.database),
  };
}

export function submissionErrorResponse(error: unknown) {
  if (error instanceof SubmissionError) {
    const status =
      error.code === "SUBMISSION_NOT_FOUND" ? 404 : 400;
    return NextResponse.json(
      { error: { code: error.code, message: error.message } },
      { status },
    );
  }
  if (error instanceof ZodError) {
    const details = error.flatten().fieldErrors;
    return NextResponse.json(
      {
        error: {
          code: "INVALID_REQUEST",
          message: firstFieldError(details) ?? "请求内容无效",
          details,
        },
      },
      { status: 400 },
    );
  }
  console.error("Unhandled submission error", error);
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
