import { NextResponse } from "next/server";

import {
  getSubmissionActionContext,
  submissionErrorResponse,
  unauthenticatedResponse,
} from "@/modules/submissions/actions";
import {
  deleteSubmission,
  updateSubmission,
} from "@/modules/submissions/service";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const context = await getSubmissionActionContext(request);
    if (!context) return unauthenticatedResponse();
    await updateSubmission(
      context.repository,
      context.user.id,
      (await params).id,
      await request.json(),
    );
    return NextResponse.json({ ok: true });
  } catch (error) {
    return submissionErrorResponse(error);
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const context = await getSubmissionActionContext(request);
    if (!context) return unauthenticatedResponse();
    await deleteSubmission(
      context.repository,
      context.user.id,
      (await params).id,
    );
    return NextResponse.json({ ok: true });
  } catch (error) {
    return submissionErrorResponse(error);
  }
}
