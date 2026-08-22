import { NextResponse } from "next/server";
import { ZodError } from "zod";

import { getDb } from "@/db/client";
import { DEMO_USER_ID } from "@/db/seed/demo";
import {
  getAuthenticatedDatabaseContext,
  unauthenticatedResponse,
} from "@/modules/auth/action-context";
import { readAnonRawIdFromRequest } from "@/modules/auth/anon-id";
import { getInonProjectSession } from "@/modules/auth/inon-session";
import { resolveInonProjectUser } from "@/modules/auth/inon-user";
import { createResumeRepository } from "@/modules/resumes/repository";
import { ResumeError } from "@/modules/resumes/service";

export async function getResumeActionContext(request: Request) {
  const context = await getAuthenticatedDatabaseContext(request);
  if (!context) return null;
  return {
    database: context.database,
    user: context.user,
    repository: createResumeRepository(context.database),
  };
}

// 未登录用户以 demo 沙箱账号身份写入，并按浏览器匿名设备 id（guestDeviceId）
// 隔离数据：首次修改物化为该设备下的新记录，回访时凭同一 id 续编（见
// resume-editor 的访客保存流程与 modules/auth/anon-id.ts）。
export async function getResumeWriteContext(request: Request) {
  const database = await getDb();
  const session = await getInonProjectSession(request);
  const user = session
    ? await resolveInonProjectUser(database, session)
    : null;
  const authenticated = user && !user.disabledAt ? user : null;
  return {
    database,
    user: authenticated ?? { id: DEMO_USER_ID, disabledAt: null },
    guestDeviceId: authenticated
      ? null
      : readAnonRawIdFromRequest(request),
    repository: createResumeRepository(database),
  };
}

export function resumeErrorResponse(error: unknown) {
  if (error instanceof ResumeError) {
    return NextResponse.json(
      { error: { code: error.code, message: error.message } },
      { status: error.code === "VERSION_CONFLICT" ? 409 : 404 },
    );
  }
  if (error instanceof ZodError) {
    return NextResponse.json(
      {
        error: {
          code: "INVALID_REQUEST",
          message: "简历内容不完整或格式无效",
          details: error.flatten().fieldErrors,
        },
      },
      { status: 400 },
    );
  }
  console.error("Unhandled resume error", error);
  return NextResponse.json(
    {
      error: {
        code: "INTERNAL_ERROR",
        message: "服务暂时不可用，请稍后再试",
      },
    },
    { status: 500 },
  );
}

export { unauthenticatedResponse };
