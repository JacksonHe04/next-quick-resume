export type ApiFieldErrors = Record<
  string,
  string[] | undefined
>;

export function firstFieldError(
  details: unknown,
): string | undefined {
  if (!details || typeof details !== "object") return undefined;

  for (const messages of Object.values(
    details as ApiFieldErrors,
  )) {
    const message = messages?.find(
      (value) => typeof value === "string" && value.length > 0,
    );
    if (message) return message;
  }

  return undefined;
}
