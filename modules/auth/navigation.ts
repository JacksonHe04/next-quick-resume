export function safePostAuthPath(value: string | undefined): string {
  return value?.startsWith("/app") && !value.startsWith("//")
    ? value
    : "/app";
}
