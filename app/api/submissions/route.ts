import { NextResponse } from "next/server";

import {
  getSubmissionActionContext,
  submissionErrorResponse,
  unauthenticatedResponse,
} from "@/modules/submissions/actions";
import { listSubmissionViews } from "@/modules/submissions/repository";
import { createSubmission } from "@/modules/submissions/service";

export async function GET(request: Request) {
  try {
    const context = await getSubmissionActionContext(request);
    if (!context) return unauthenticatedResponse();
    const submissions = await listSubmissionViews(
      context.database,
      context.user.id,
    );
    return NextResponse.json({ submissions });
  } catch (error) {
    return submissionErrorResponse(error);
  }
}

export async function POST(request: Request) {
  try {
    const context = await getSubmissionActionContext(request);
    if (!context) return unauthenticatedResponse();
    const submission = await createSubmission(
      context.repository,
      context.user.id,
      await request.json(),
    );
    return NextResponse.json({ submission }, { status: 201 });
  } catch (error) {
    return submissionErrorResponse(error);
  }
}
