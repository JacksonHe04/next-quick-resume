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
