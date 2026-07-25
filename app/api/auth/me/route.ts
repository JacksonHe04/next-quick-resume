import { NextResponse } from "next/server";

import { getAuthenticatedDatabaseContext } from "@/modules/auth/action-context";

export async function GET(request: Request) {
  const context = await getAuthenticatedDatabaseContext(request);
  if (!context) {
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

  return NextResponse.json({
    user: {
      id: context.user.id,
      email: context.user.email,
      name: context.user.name,
    },
  });
}
