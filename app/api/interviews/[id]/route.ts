import { NextResponse } from "next/server";

import {
  getInterviewActionContext,
  interviewErrorResponse,
  unauthenticatedResponse,
} from "@/modules/interviews/actions";
import {
  deleteInterview,
  updateInterview,
} from "@/modules/interviews/service";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const context = await getInterviewActionContext(request);
    if (!context) return unauthenticatedResponse();
    await updateInterview(
      context.repository,
      context.user.id,
      (await params).id,
      await request.json(),
    );
    return NextResponse.json({ ok: true });
  } catch (error) {
    return interviewErrorResponse(error);
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const context = await getInterviewActionContext(request);
    if (!context) return unauthenticatedResponse();
    await deleteInterview(
      context.repository,
      context.user.id,
      (await params).id,
    );
    return NextResponse.json({ ok: true });
  } catch (error) {
    return interviewErrorResponse(error);
  }
}
