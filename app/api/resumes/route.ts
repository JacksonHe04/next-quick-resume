import { NextResponse } from "next/server";

import {
  getResumeActionContext,
  resumeErrorResponse,
  unauthenticatedResponse,
} from "@/modules/resumes/actions";
import { listResumes } from "@/modules/resumes/repository";
import { createResume } from "@/modules/resumes/service";

export async function GET(request: Request) {
  try {
    const context = await getResumeActionContext(request);
    if (!context) return unauthenticatedResponse();
    return NextResponse.json({
      resumes: await listResumes(context.database, context.user.id),
    });
  } catch (error) {
    return resumeErrorResponse(error);
  }
}

export async function POST(request: Request) {
  try {
    const context = await getResumeActionContext(request);
    if (!context) return unauthenticatedResponse();
    const resume = await createResume(
      context.repository,
      context.user.id,
      await request.json(),
    );
    return NextResponse.json({ resume }, { status: 201 });
  } catch (error) {
    return resumeErrorResponse(error);
  }
}
