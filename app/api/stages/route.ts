import { NextResponse } from "next/server";

import {
  getInterviewActionContext,
  interviewErrorResponse,
  unauthenticatedResponse,
} from "@/modules/interviews/actions";
import { listActiveStages } from "@/modules/interviews/repository";

export async function GET(request: Request) {
  try {
    const context = await getInterviewActionContext(request);
    if (!context) return unauthenticatedResponse();
    const stages = await listActiveStages(context.database);
    return NextResponse.json({ stages });
  } catch (error) {
    return interviewErrorResponse(error);
  }
}
