import { NextResponse } from "next/server";
import { ZodError } from "zod";

import {
  getAuthenticatedDatabaseContext,
  unauthenticatedResponse,
} from "@/modules/auth/action-context";
import { createResumeRepository } from "@/modules/resumes/repository";
import { ResumeError } from "@/modules/resumes/service";

export async function getResumeActionContext(request: Request) {
  const context = await getAuthenticatedDatabaseContext(request);
  if (!context) return null;
  return {
    database: context.database,
    user: context.user,
    repository: createResumeRepository(context.database),
  };
}

export function resumeErrorResponse(error: unknown) {
  if (error instanceof ResumeError) {
    return NextResponse.json(
      { error: { code: error.code, message: error.message } },
      { status: error.code === "VERSION_CONFLICT" ? 409 : 404 },
    );
  }
  if (error instanceof ZodError) {
    return NextResponse.json(
      {
        error: {
          code: "INVALID_REQUEST",
          message: "简历内容不完整或格式无效",
          details: error.flatten().fieldErrors,
        },
      },
      { status: 400 },
    );
  }
  console.error("Unhandled resume error", error);
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
