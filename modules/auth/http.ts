import { NextResponse } from "next/server";
import type { z } from "zod";

import { AuthError, type AuthErrorCode } from "@/modules/auth/errors";

const AUTH_ERROR_STATUS: Record<AuthErrorCode, number> = {
  EMAIL_ALREADY_REGISTERED: 409,
  INVALID_CREDENTIALS: 401,
  INVALID_RESET_TOKEN: 400,
  INVALID_VERIFICATION_CODE: 400,
  RATE_LIMITED: 429,
  EMAIL_DELIVERY_FAILED: 503,
};

export class InvalidRequestBodyError extends Error {
  constructor(public readonly details?: unknown) {
    super("请求内容无效");
    this.name = "InvalidRequestBodyError";
  }
}

export async function readJson<TSchema extends z.ZodTypeAny>(
  request: Request,
  schema: TSchema,
): Promise<z.infer<TSchema>> {
  let value: unknown;
  try {
    value = await request.json();
  } catch {
    throw new InvalidRequestBodyError();
  }

  const result = schema.safeParse(value);
  if (!result.success) {
    throw new InvalidRequestBodyError(result.error.flatten().fieldErrors);
  }

  return result.data;
}

export function authErrorResponse(error: unknown): NextResponse {
  if (error instanceof AuthError) {
    return NextResponse.json(
      { error: { code: error.code, message: error.message } },
      { status: AUTH_ERROR_STATUS[error.code] },
    );
  }

  if (error instanceof InvalidRequestBodyError) {
    return NextResponse.json(
      {
        error: {
          code: "INVALID_REQUEST",
          message: error.message,
          details: error.details,
        },
      },
      { status: 400 },
    );
  }

  console.error("Unhandled authentication error", error);
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

export function sessionCookieOptions(expires: Date, secure: boolean) {
  return {
    httpOnly: true,
    secure,
    sameSite: "lax" as const,
    path: "/",
    expires,
  };
}
