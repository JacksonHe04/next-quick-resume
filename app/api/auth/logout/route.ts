import { NextResponse } from "next/server";

import { authErrorResponse } from "@/modules/auth/http";
import { readRequestCookie } from "@/modules/auth/request";
import { getAuthRuntime } from "@/modules/auth/server";
import {
  resolveSession,
  SESSION_COOKIE_NAME,
} from "@/modules/auth/session";

export async function POST(request: Request) {
  try {
    const rawToken = readRequestCookie(request, SESSION_COOKIE_NAME);
    if (rawToken) {
      const { repository } = await getAuthRuntime();
      const session = await resolveSession(repository, rawToken);
      if (session) await repository.deleteById(session.id);
    }

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
