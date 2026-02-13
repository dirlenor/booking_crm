export function getSafeNextPath(
  rawNext: string | null | undefined,
  fallback: string = "/"
): string {
  if (!rawNext) return fallback;

  let normalized = rawNext.trim();
  if (!normalized) return fallback;

  try {
    normalized = decodeURIComponent(normalized);
  } catch {
    normalized = rawNext.trim();
  }

  if (!normalized.startsWith("/") || normalized.startsWith("//")) {
    return fallback;
  }

  return normalized;
}
