import { NextResponse } from "next/server";

import {
  accountErrorResponse,
  getAccountActionContext,
  unauthenticatedResponse,
} from "@/modules/account/actions";
import { updateProfile } from "@/modules/account/service";

export async function PATCH(request: Request) {
  try {
    const context = await getAccountActionContext(request);
    if (!context) return unauthenticatedResponse();
    await updateProfile(
      context.repository,
      context.user.id,
      await request.json(),
    );
    return NextResponse.json({ ok: true });
  } catch (error) {
    return accountErrorResponse(error);
  }
}
