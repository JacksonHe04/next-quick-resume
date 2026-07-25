import { NextResponse } from "next/server";

import { getDb } from "@/db/client";
import { DEMO_USER_ID } from "@/db/seed/demo";
import { createAuthRepository } from "@/modules/auth/repository";
import { authenticateRequest } from "@/modules/auth/request";

export async function getAuthenticatedDatabaseContext(
  request: Request,
) {
  const database = await getDb();
  const authRepository = createAuthRepository(database);
  const authenticated = await authenticateRequest(
    authRepository,
    request,
  );
  if (!authenticated) return null;

  return {
    database,
    authRepository,
    user: authenticated.user,
    session: authenticated.session,
  };
}

export async function getReadDatabaseContext(request: Request) {
  const database = await getDb();
  const authRepository = createAuthRepository(database);
  const authenticated = await authenticateRequest(authRepository, request);

  return {
    database,
    authRepository,
    userId: authenticated?.user.id ?? DEMO_USER_ID,
    user: authenticated?.user ?? null,
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
