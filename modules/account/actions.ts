import { NextResponse } from "next/server";
import { ZodError } from "zod";

import { getDb } from "@/db/client";
import { createAccountRepository } from "@/modules/account/repository";
import { AccountError } from "@/modules/account/service";
import { createAuthRepository } from "@/modules/auth/repository";
import { authenticateRequest } from "@/modules/auth/request";

export async function getAccountActionContext(request: Request) {
  const database = await getDb();
  const authRepository = createAuthRepository(database);
  const authenticated = await authenticateRequest(
    authRepository,
    request,
  );
  if (!authenticated) return null;

  return {
    user: authenticated.user,
    repository: createAccountRepository(database),
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

export function unauthenticatedResponse(): NextResponse {
  return NextResponse.json(
    {
      error: {
        code: "UNAUTHENTICATED",
        message: "请先登录",
      },
    },
    { status: 401 },
  );
}
