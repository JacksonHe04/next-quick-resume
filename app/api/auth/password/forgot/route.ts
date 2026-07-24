import { NextResponse } from "next/server";

import {
  authErrorResponse,
  readJson,
} from "@/modules/auth/http";
import { forgotPasswordInputSchema } from "@/modules/auth/schemas";
import { getAuthRuntime } from "@/modules/auth/server";
import { requestPasswordReset } from "@/modules/auth/service";

export async function POST(request: Request) {
  try {
    const input = await readJson(request, forgotPasswordInputSchema);
    const runtime = await getAuthRuntime();
    await requestPasswordReset(
      { ...runtime, appUrl: new URL(request.url).origin },
      input,
    );
    return NextResponse.json({ ok: true });
  } catch (error) {
    return authErrorResponse(error);
  }
}
