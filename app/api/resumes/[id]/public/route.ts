import { NextResponse } from "next/server";
import { z } from "zod";

import {
  getResumeActionContext,
  resumeErrorResponse,
  unauthenticatedResponse,
} from "@/modules/resumes/actions";
import { setResumePublic } from "@/modules/resumes/service";

const toggleShareInputSchema = z.object({
  isPublic: z.boolean(),
});

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const context = await getResumeActionContext(request);
    if (!context) return unauthenticatedResponse();
    const input = toggleShareInputSchema.parse(await request.json());
    const resume = await setResumePublic(
      context.repository,
      context.user.id,
      (await params).id,
      input.isPublic,
    );
    return NextResponse.json({ resume });
  } catch (error) {
    return resumeErrorResponse(error);
  }
}
