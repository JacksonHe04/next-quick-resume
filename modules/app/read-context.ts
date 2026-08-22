import "server-only";

import { cookies } from "next/headers";
import { connection } from "next/server";
import { cache } from "react";

import { getDb } from "@/db/client";
import { DEMO_USER_ID } from "@/db/seed/demo";
import { getOptionalCurrentUser } from "@/modules/auth/server";
import {
  ANON_COOKIE_NAME,
  isValidAnonRawId,
} from "@/modules/auth/anon-id";

export const getAppReadContext = cache(async function getAppReadContext() {
  await connection();
  const [database, user] = await Promise.all([
    getDb(),
    getOptionalCurrentUser(),
  ]);

  // 访客身份：优先解析浏览器级匿名设备 id（proxy.ts 下发），用于按设备
  // 隔离访客简历；无有效 UUID 时返回 null（页面侧回退为纯模板展示）。
  let guestDeviceId: string | null = null;
  if (!user) {
    const raw = (await cookies()).get(ANON_COOKIE_NAME)?.value;
    guestDeviceId = raw && isValidAnonRawId(raw) ? raw : null;
  }

  return {
    database,
    user,
    userId: user?.id ?? DEMO_USER_ID,
    isGuest: !user,
    guestDeviceId,
  };
});
