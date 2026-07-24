import { NextResponse } from "next/server";

import {
  authErrorResponse,
  readJson,
} from "@/modules/auth/http";
import { requestVerificationCodeInputSchema } from "@/modules/auth/schemas";
import { getAuthRuntime } from "@/modules/auth/server";
import { requestRegistrationCode } from "@/modules/auth/service";

export async function POST(request: Request) {
  try {
    const input = await readJson(
      request,
      requestVerificationCodeInputSchema,
    );
    const runtime = await getAuthRuntime();
    await requestRegistrationCode(runtime, input);
    return NextResponse.json({ ok: true });
  } catch (error) {
    return authErrorResponse(error);
  }
}
