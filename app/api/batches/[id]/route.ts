import { NextResponse } from "next/server";

import {
  batchErrorResponse,
  getBatchActionContext,
  unauthenticatedResponse,
} from "@/modules/batches/actions";
import {
  deleteBatch,
  updateBatch,
} from "@/modules/batches/service";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const context = await getBatchActionContext(request);
    if (!context) return unauthenticatedResponse();
    await updateBatch(
      context.repository,
      context.user.id,
      (await params).id,
      await request.json(),
    );
    return NextResponse.json({ ok: true });
  } catch (error) {
    return batchErrorResponse(error);
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const context = await getBatchActionContext(request);
    if (!context) return unauthenticatedResponse();
    await deleteBatch(
      context.repository,
      context.user.id,
      (await params).id,
    );
    return NextResponse.json({ ok: true });
  } catch (error) {
    return batchErrorResponse(error);
  }
}
