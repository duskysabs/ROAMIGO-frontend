export function safeRedirectPath(
  value: string | string[] | undefined,
  fallback = "/customer",
): string {
  const candidate = Array.isArray(value) ? value[0] : value;

  return candidate?.startsWith("/") &&
    !candidate.startsWith("//") &&
    !candidate.includes("\\")
    ? candidate
    : fallback;
}
