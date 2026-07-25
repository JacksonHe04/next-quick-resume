import { NextResponse } from "next/server";
import { ZodError } from "zod";

import { firstFieldError } from "@/lib/http/errors";
import { createAccountRepository } from "@/modules/account/repository";
import { AccountError } from "@/modules/account/service";
import {
  getAuthenticatedDatabaseContext,
  unauthenticatedResponse,
} from "@/modules/auth/action-context";

export async function getAccountActionContext(request: Request) {
  const context = await getAuthenticatedDatabaseContext(request);
  if (!context) return null;

  return {
    user: context.user,
    repository: createAccountRepository(context.database),
  };
}

export function accountErrorResponse(error: unknown): NextResponse {
  if (error instanceof AccountError) {
    const status = error.code === "ACCOUNT_NOT_FOUND" ? 404 : 400;
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

  console.error("Unhandled account error", error);
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
