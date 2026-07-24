import { NextResponse } from "next/server";

import { getDb } from "@/db/client";
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
