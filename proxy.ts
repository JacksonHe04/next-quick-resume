import { NextResponse, type NextRequest } from "next/server";

import {
  ANON_COOKIE_NAME,
  ANON_ID_MAX_AGE_SECONDS,
} from "@/modules/auth/anon-id";

// 访客的浏览器级匿名身份：首次请求（含 API）若未携带 sayless_anon cookie，
// 就在这里生成一个 UUID 随响应下发。HttpOnly 使页面脚本无法读取，服务端
// 在 RSC 与 API 路由里通过 cookie 解析。已登录用户不受影响（服务端优先
// 解析 session，忽略该 cookie）。
export function proxy(request: NextRequest) {
  if (request.cookies.has(ANON_COOKIE_NAME)) return NextResponse.next();

  const response = NextResponse.next();
  response.cookies.set(ANON_COOKIE_NAME, crypto.randomUUID(), {
    httpOnly: true,
    sameSite: "lax",
    secure: request.nextUrl.protocol === "https:",
    path: "/",
    maxAge: ANON_ID_MAX_AGE_SECONDS,
  });
  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon\\.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
