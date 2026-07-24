import { NextResponse } from "next/server";

import {
  getResumeActionContext,
  resumeErrorResponse,
  unauthenticatedResponse,
} from "@/modules/resumes/actions";
import {
  deleteResume,
  ResumeError,
  saveResume,
} from "@/modules/resumes/service";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const context = await getResumeActionContext(request);
    if (!context) return unauthenticatedResponse();
    const resume = await context.repository.find(
      context.user.id,
      (await params).id,
    );
    if (!resume) {
      throw new ResumeError("RESUME_NOT_FOUND", "简历不存在");
    }
    return NextResponse.json({ resume });
  } catch (error) {
    return resumeErrorResponse(error);
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const context = await getResumeActionContext(request);
    if (!context) return unauthenticatedResponse();
    const body: unknown = await request.json();
    const resume = await saveResume(
      context.repository,
      context.user.id,
      {
        ...(typeof body === "object" && body !== null ? body : {}),
        id: (await params).id,
      },
    );
    return NextResponse.json({ resume });
  } catch (error) {
    return resumeErrorResponse(error);
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const context = await getResumeActionContext(request);
    if (!context) return unauthenticatedResponse();
    await deleteResume(
      context.repository,
      context.user.id,
      (await params).id,
    );
    return NextResponse.json({ ok: true });
  } catch (error) {
    return resumeErrorResponse(error);
  }
}
