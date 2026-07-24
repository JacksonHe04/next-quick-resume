import { NextResponse } from "next/server";

import {
  authErrorResponse,
  readJson,
  sessionCookieOptions,
} from "@/modules/auth/http";
import { loginInputSchema } from "@/modules/auth/schemas";
import { getAuthRuntime } from "@/modules/auth/server";
import { login } from "@/modules/auth/service";
import { SESSION_COOKIE_NAME } from "@/modules/auth/session";

export async function POST(request: Request) {
  try {
    const input = await readJson(request, loginInputSchema);
    const runtime = await getAuthRuntime();
    const result = await login(runtime, input);
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
