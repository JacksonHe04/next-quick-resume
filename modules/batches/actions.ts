import { NextResponse } from "next/server";
import { ZodError } from "zod";

import { firstFieldError } from "@/lib/http/errors";
import {
  getAuthenticatedDatabaseContext,
  unauthenticatedResponse,
} from "@/modules/auth/action-context";
import { createBatchRepository } from "@/modules/batches/repository";
import { BatchError } from "@/modules/batches/service";

export async function getBatchActionContext(request: Request) {
  const context = await getAuthenticatedDatabaseContext(request);
  if (!context) return null;
  return {
    user: context.user,
    repository: createBatchRepository(context.database),
  };
}

export function batchErrorResponse(error: unknown) {
  if (error instanceof BatchError) {
    const status =
      error.code === "BATCH_NOT_FOUND"
        ? 404
        : error.code === "BATCH_IN_USE"
          ? 409
          : 400;
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
  console.error("Unhandled batch error", error);
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
