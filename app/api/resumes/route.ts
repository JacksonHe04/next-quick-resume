import { NextResponse } from "next/server";

import { getReadDatabaseContext } from "@/modules/auth/action-context";
import {
  getResumeWriteContext,
  resumeErrorResponse,
} from "@/modules/resumes/actions";
import { listResumes } from "@/modules/resumes/repository";
import { createResume } from "@/modules/resumes/service";

export async function GET(request: Request) {
  try {
    const context = await getReadDatabaseContext(request);
    return NextResponse.json({
      resumes: await listResumes(context.database, context.userId),
    });
  } catch (error) {
    return resumeErrorResponse(error);
  }
}

export async function POST(request: Request) {
  try {
    const context = await getResumeWriteContext(request);
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
