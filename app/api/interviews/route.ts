import { NextResponse } from "next/server";

import { getReadDatabaseContext } from "@/modules/auth/action-context";
import {
  getInterviewActionContext,
  interviewErrorResponse,
  unauthenticatedResponse,
} from "@/modules/interviews/actions";
import { listInterviewViews } from "@/modules/interviews/repository";
import { createInterview } from "@/modules/interviews/service";

export async function GET(request: Request) {
  try {
    const context = await getReadDatabaseContext(request);
    const interviews = await listInterviewViews(
      context.database,
      context.userId,
    );
    return NextResponse.json({ interviews });
  } catch (error) {
    return interviewErrorResponse(error);
  }
}

export async function POST(request: Request) {
  try {
    const context = await getInterviewActionContext(request);
    if (!context) return unauthenticatedResponse();
    const interview = await createInterview(
      context.repository,
      context.user.id,
      await request.json(),
    );
    return NextResponse.json({ interview }, { status: 201 });
  } catch (error) {
    return interviewErrorResponse(error);
  }
}
