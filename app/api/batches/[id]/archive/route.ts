import { NextResponse } from "next/server";

import {
  batchErrorResponse,
  getBatchActionContext,
  unauthenticatedResponse,
} from "@/modules/batches/actions";
import {
  archiveBatch,
  restoreBatch,
} from "@/modules/batches/service";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const context = await getBatchActionContext(request);
    if (!context) return unauthenticatedResponse();
    const { archived } = (await request.json().catch(() => ({
      archived: true,
    }))) as { archived?: boolean };
    const id = (await params).id;
    if (archived === false) {
      await restoreBatch(context.repository, context.user.id, id);
    } else {
      await archiveBatch(context.repository, context.user.id, id);
    }
    return NextResponse.json({ ok: true });
  } catch (error) {
    return batchErrorResponse(error);
  }
}
