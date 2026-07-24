import { NextResponse } from "next/server";

import {
  authErrorResponse,
  readJson,
  sessionCookieOptions,
} from "@/modules/auth/http";
import { registerInputSchema } from "@/modules/auth/schemas";
import { getAuthRuntime } from "@/modules/auth/server";
import { registerAccount } from "@/modules/auth/service";
import { SESSION_COOKIE_NAME } from "@/modules/auth/session";

export async function POST(request: Request) {
  try {
    const input = await readJson(request, registerInputSchema);
    const runtime = await getAuthRuntime();
    const result = await registerAccount(runtime, input);
    const response = NextResponse.json(
      {
        user: {
          id: result.user.id,
          email: result.user.email,
          name: result.user.name,
        },
      },
      { status: 201 },
    );
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
