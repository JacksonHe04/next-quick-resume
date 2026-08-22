function publicSsoPath(
  action: "end" | "refresh" | "start",
  returnTo: string,
): string {
  return `/sso/${action}?${new URLSearchParams({ returnTo })}`;
}

export function saylessLoginPath(returnTo = "/resumes"): string {
  return publicSsoPath("start", returnTo);
}

export function saylessLogoutPath(returnTo = "/"): string {
  return publicSsoPath("end", returnTo);
}

export function saylessRefreshPath(returnTo = "/resumes"): string {
  return publicSsoPath("refresh", returnTo);
}
