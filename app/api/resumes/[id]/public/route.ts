import { NextResponse } from "next/server";
import { z } from "zod";

import {
  getResumeWriteContext,
  resumeErrorResponse,
} from "@/modules/resumes/actions";
import { scopeOf } from "@/modules/resumes/repository";
import { setResumePublic } from "@/modules/resumes/service";

const toggleShareInputSchema = z.object({
  isPublic: z.boolean(),
});

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const context = await getResumeWriteContext(request);
    const input = toggleShareInputSchema.parse(await request.json());
    const resume = await setResumePublic(
      context.repository,
      context.user.id,
      (await params).id,
      input.isPublic,
      undefined,
      scopeOf(context.guestDeviceId),
    );
    return NextResponse.json({ resume });
  } catch (error) {
    return resumeErrorResponse(error);
  }
}
