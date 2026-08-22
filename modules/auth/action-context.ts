import { NextResponse } from "next/server";

import { getDb } from "@/db/client";
import { DEMO_USER_ID } from "@/db/seed/demo";
import { readAnonRawIdFromRequest } from "@/modules/auth/anon-id";
import { getInonProjectSession } from "@/modules/auth/inon-session";
import { resolveInonProjectUser } from "@/modules/auth/inon-user";

export async function getAuthenticatedDatabaseContext(
  request: Request,
) {
  const database = await getDb();
  const session = await getInonProjectSession(request);
  if (!session) return null;
  const user = await resolveInonProjectUser(database, session);
  if (user.disabledAt) return null;

  return {
    database,
    user,
    session,
  };
}

export async function getReadDatabaseContext(request: Request) {
  const database = await getDb();
  const session = await getInonProjectSession(request);
  const user = session
    ? await resolveInonProjectUser(database, session)
    : null;
  const authenticated = user && !user.disabledAt ? user : null;

  return {
    database,
    userId: authenticated?.id ?? DEMO_USER_ID,
    user: authenticated,
    isGuest: !authenticated,
    // 未登录时以浏览器匿名设备 id 作为数据隔离键（null = 无有效 id）
    guestDeviceId: authenticated
      ? null
      : readAnonRawIdFromRequest(request),
  };
}

export function unauthenticatedResponse(): NextResponse {
  return NextResponse.json(
    {
      error: {
        code: "UNAUTHENTICATED",
        message: "请先登录",
      },
    },
    { status: 401 },
  );
}
