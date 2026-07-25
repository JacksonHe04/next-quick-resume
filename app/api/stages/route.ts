import { NextResponse } from "next/server";

import { getReadDatabaseContext } from "@/modules/auth/action-context";
import { interviewErrorResponse } from "@/modules/interviews/actions";
import { listActiveStages } from "@/modules/interviews/repository";

export async function GET(request: Request) {
  try {
    const context = await getReadDatabaseContext(request);
    const stages = await listActiveStages(context.database);
    return NextResponse.json({ stages });
  } catch (error) {
    return interviewErrorResponse(error);
  }
}
