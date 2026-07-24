import { NextResponse } from "next/server";

import { authErrorResponse } from "@/modules/auth/http";
import { authenticateRequest } from "@/modules/auth/request";
import { getAuthRuntime } from "@/modules/auth/server";

export async function GET(request: Request) {
  try {
    const { repository } = await getAuthRuntime();
    const authenticated = await authenticateRequest(repository, request);
    if (!authenticated) {
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
        id: authenticated.user.id,
        email: authenticated.user.email,
        name: authenticated.user.name,
      },
    });
  } catch (error) {
    return authErrorResponse(error);
  }
}
