import { NextResponse } from "next/server";
import { ZodError } from "zod";

import { firstFieldError } from "@/lib/http/errors";
import {
  getAuthenticatedDatabaseContext,
  unauthenticatedResponse,
} from "@/modules/auth/action-context";
import { createCatalogRepository } from "@/modules/catalog/repository";

export async function getCatalogActionContext(request: Request) {
  const context = await getAuthenticatedDatabaseContext(request);
  if (!context) return null;
  return {
    user: context.user,
    repository: createCatalogRepository(context.database),
  };
}

export function catalogErrorResponse(error: unknown) {
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
  console.error("Unhandled catalog error", error);
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
