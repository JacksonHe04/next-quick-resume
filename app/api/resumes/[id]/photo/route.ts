import { NextResponse } from "next/server";
import { z } from "zod";

import {
  getResumeWriteContext,
  resumeErrorResponse,
} from "@/modules/resumes/actions";
import { scopeOf } from "@/modules/resumes/repository";
import { uploadResumePhoto } from "@/modules/resumes/service";

const uploadPhotoInputSchema = z.object({
  photoData: z.string().min(1),
});

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const context = await getResumeWriteContext(request);
    const input = uploadPhotoInputSchema.parse(await request.json());
    await uploadResumePhoto(
      context.repository,
      context.user.id,
      (await params).id,
      input.photoData,
      undefined,
      scopeOf(context.guestDeviceId),
    );
    return NextResponse.json({ ok: true });
  } catch (error) {
    return resumeErrorResponse(error);
  }
}
