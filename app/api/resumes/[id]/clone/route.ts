import { NextResponse } from "next/server";

import {
  getResumeActionContext,
  resumeErrorResponse,
  unauthenticatedResponse,
} from "@/modules/resumes/actions";
import { cloneResume } from "@/modules/resumes/service";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const context = await getResumeActionContext(request);
    if (!context) return unauthenticatedResponse();
    const resume = await cloneResume(
      context.repository,
      context.user.id,
      (await params).id,
    );
    return NextResponse.json({ resume }, { status: 201 });
  } catch (error) {
    return resumeErrorResponse(error);
  }
}
