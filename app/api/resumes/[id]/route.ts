import { NextResponse } from "next/server";

import { getReadDatabaseContext } from "@/modules/auth/action-context";
import { createResumeRepository } from "@/modules/resumes/repository";
import {
  getResumeWriteContext,
  resumeErrorResponse,
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
    const context = await getReadDatabaseContext(request);
    const resume = await createResumeRepository(context.database).find(
      context.userId,
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
    const context = await getResumeWriteContext(request);
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
    const context = await getResumeWriteContext(request);
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
