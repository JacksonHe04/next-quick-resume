import { NextResponse } from "next/server";

import {
  batchErrorResponse,
  getBatchActionContext,
  unauthenticatedResponse,
} from "@/modules/batches/actions";
import {
  createBatch,
  listBatches,
} from "@/modules/batches/service";

export async function GET(request: Request) {
  try {
    const context = await getBatchActionContext(request);
    if (!context) return unauthenticatedResponse();
    return NextResponse.json(
      await listBatches(context.repository, context.user.id),
    );
  } catch (error) {
    return batchErrorResponse(error);
  }
}

export async function POST(request: Request) {
  try {
    const context = await getBatchActionContext(request);
    if (!context) return unauthenticatedResponse();
    const batch = await createBatch(
      context.repository,
      context.user.id,
      await request.json(),
    );
    return NextResponse.json({ batch }, { status: 201 });
  } catch (error) {
    return batchErrorResponse(error);
  }
}
