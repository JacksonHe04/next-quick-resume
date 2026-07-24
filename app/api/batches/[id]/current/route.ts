import { NextResponse } from "next/server";

import {
  batchErrorResponse,
  getBatchActionContext,
  unauthenticatedResponse,
} from "@/modules/batches/actions";
import { setCurrentBatch } from "@/modules/batches/service";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const context = await getBatchActionContext(request);
    if (!context) return unauthenticatedResponse();
    await setCurrentBatch(
      context.repository,
      context.user.id,
      (await params).id,
    );
    return NextResponse.json({ ok: true });
  } catch (error) {
    return batchErrorResponse(error);
  }
}
