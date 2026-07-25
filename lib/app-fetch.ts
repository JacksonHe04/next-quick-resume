export function getLoginUrl(location: {
  pathname: string;
  search: string;
}): string {
  const next = `${location.pathname}${location.search}`;
  return `/login?next=${encodeURIComponent(next)}`;
}

export async function appFetch(
  input: RequestInfo | URL,
  init?: RequestInit,
): Promise<Response> {
  const response = await fetch(input, init);
  const method = (init?.method ?? "GET").toUpperCase();

  if (
    response.status === 401 &&
    method !== "GET" &&
    typeof window !== "undefined"
  ) {
    window.location.assign(getLoginUrl(window.location));
  }

  return response;
}

export async function patchJson<T = unknown>(
  url: string,
  body: unknown,
): Promise<T> {
  const response = await appFetch(url, {
    method: "PATCH",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
  const payload = (await response.json().catch(() => ({}))) as T & {
    error?: { message?: string };
  };
  if (!response.ok) {
    throw new Error(payload.error?.message ?? "保存失败，请稍后重试");
  }
  return payload;
}
