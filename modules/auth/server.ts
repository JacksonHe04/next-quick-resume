import { cache } from "react";

import { getDb } from "@/db/client";
import { getInonProjectSession } from "@/modules/auth/inon-session";
import { resolveInonProjectUser } from "@/modules/auth/inon-user";

export const getOptionalCurrentUser = cache(async function getOptionalCurrentUser() {
  const session = await getInonProjectSession();
  if (!session) return null;

  const user = await resolveInonProjectUser(await getDb(), session);
  return user && !user.disabledAt ? user : null;
});
