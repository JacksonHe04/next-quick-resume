import { NextResponse } from "next/server";

import { getDevelopmentLoginCredentials } from "@/modules/auth/development";
import {
  authErrorResponse,
  sessionCookieOptions,
} from "@/modules/auth/http";
import { getAuthRepository } from "@/modules/auth/server";
import { login } from "@/modules/auth/service";
import { SESSION_COOKIE_NAME } from "@/modules/auth/session";

export async function POST(request: Request) {
  const credentials = getDevelopmentLoginCredentials();
  if (!credentials) {
    return NextResponse.json(
      {
        error: {
          code: "NOT_FOUND",
          message: "开发快捷登录不可用",
        },
      },
      { status: 404 },
    );
  }

  try {
    const result = await login(
      { repository: await getAuthRepository() },
      credentials,
    );
    const response = NextResponse.json({
      user: {
        id: result.user.id,
        email: result.user.email,
        name: result.user.name,
      },
    });
    response.cookies.set(
      SESSION_COOKIE_NAME,
      result.rawToken,
      sessionCookieOptions(
        result.expiresAt,
        new URL(request.url).protocol === "https:",
      ),
    );
    return response;
  } catch (error) {
    return authErrorResponse(error);
  }
}
