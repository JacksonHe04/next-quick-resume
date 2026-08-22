const PUBLIC_PATHS = new Set([
  "/login",
  "/register",
  "/forgot-password",
  "/reset-password",
  "/intro",
  "/sso",
]);

export function safePostAuthPath(value: string | undefined): string {
  if (!value) return "/resumes";
  if (!value.startsWith("/") || value.startsWith("//")) return "/resumes";
  // 排除公开路径（避免登录后跳回登录页等）
  for (const publicPath of PUBLIC_PATHS) {
    if (value === publicPath || value.startsWith(`${publicPath}/`)) {
      return "/resumes";
    }
  }
  return value;
}
