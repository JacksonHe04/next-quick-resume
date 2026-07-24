import { NextResponse } from "next/server";

import {
  accountErrorResponse,
  getAccountActionContext,
  unauthenticatedResponse,
} from "@/modules/account/actions";
import { changePassword } from "@/modules/account/service";
import { SESSION_COOKIE_NAME } from "@/modules/auth/session";

export async function PATCH(request: Request) {
  try {
    const context = await getAccountActionContext(request);
    if (!context) return unauthenticatedResponse();
    await changePassword(
      context.repository,
      context.user.id,
      await request.json(),
    );
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
    return accountErrorResponse(error);
  }
}
