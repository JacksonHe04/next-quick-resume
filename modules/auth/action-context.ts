import { NextResponse } from "next/server";

import { getDb } from "@/db/client";
import { DEMO_USER_ID } from "@/db/seed/demo";
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
