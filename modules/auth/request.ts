import type { UserRecord } from "@/modules/auth/service";
import {
  resolveSession,
  SESSION_COOKIE_NAME,
  type SessionRecord,
} from "@/modules/auth/session";

type RequestAuthRepository = {
  findByTokenHash(
    tokenHash: string,
  ): Promise<SessionRecord | null>;
  deleteById(id: string): Promise<void>;
  findUserById(id: string): Promise<UserRecord | null>;
};

export function readRequestCookie(
  request: Request,
  name: string,
): string | null {
  const header = request.headers.get("cookie");
  if (!header) return null;

  for (const item of header.split(";")) {
    const [key, ...value] = item.trim().split("=");
    if (key === name) return decodeURIComponent(value.join("="));
  }
  return null;
}

export async function authenticateRequest(
  repository: RequestAuthRepository,
  request: Request,
  now = new Date(),
): Promise<{ session: SessionRecord; user: UserRecord } | null> {
  const rawToken = readRequestCookie(request, SESSION_COOKIE_NAME);
  if (!rawToken) return null;

  const session = await resolveSession(repository, rawToken, now);
  if (!session) return null;

  const user = await repository.findUserById(session.userId);
  if (!user || user.disabledAt) return null;

  return { session, user };
}
