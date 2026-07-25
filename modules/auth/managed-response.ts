import { NextResponse } from "next/server";

import { saylessLoginPath } from "@/modules/auth/paths";

export function legacyAuthDisabledResponse(): NextResponse {
  return NextResponse.json(
    {
      error: {
        code: "INON_SSO_REQUIRED",
        message: "SAYLESS 已改用 iNon 统一账号登录。",
      },
      loginUrl: saylessLoginPath("/app"),
    },
    { status: 410 },
  );
}

export function centralAccountManagedResponse(): NextResponse {
  return NextResponse.json(
    {
      error: {
        code: "INON_ACCOUNT_MANAGED",
        message: "用户名、密码和账号安全由 iNon 统一账号管理。",
      },
      accountUrl: "https://inon.space/sso/account",
    },
    { status: 410 },
  );
}
