import { NextResponse } from "next/server";

import {
  authErrorResponse,
  readJson,
} from "@/modules/auth/http";
import { resetPasswordInputSchema } from "@/modules/auth/schemas";
import { getAuthRuntime } from "@/modules/auth/server";
import { resetPassword } from "@/modules/auth/service";
import { SESSION_COOKIE_NAME } from "@/modules/auth/session";

export async function POST(request: Request) {
  try {
    const input = await readJson(request, resetPasswordInputSchema);
    const runtime = await getAuthRuntime();
    await resetPassword(runtime, input);
    const response = NextResponse.json({ ok: true });
    response.cookies.set(SESSION_COOKIE_NAME, "", {
      httpOnly: true,
      secure: new URL(request.url).protocol === "https:",
      sameSite: "lax",
      path: "/",
      maxAge: 0,
    });
    return response;
  } catch (error) {
    return authErrorResponse(error);
  }
}
