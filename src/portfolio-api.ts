import type {
  PortfolioDocument,
  PortfolioLocale,
  PortfolioLocalized,
  PortfolioPublicEntry,
} from "./portfolio-types";
const configured =
  import.meta.env.VITE_PORTFOLIO_API_URL || "https://labs.atajan.org/api/v1";
export const apiBase = configured.replace(/\/$/, "");
export const adminOrigin = new URL(
  import.meta.env.VITE_ADMIN_ORIGIN || "https://labs.atajan.org",
).origin;
export const localize = (
  value: PortfolioLocalized | undefined,
  locale: PortfolioLocale,
) => value?.[locale] || value?.en || "";
export function safeUrl(value: string | undefined, fallback = "#contact") {
  const safeFallback = fallback.startsWith("#") ? `/${fallback}` : fallback;
  if (!value) return safeFallback;
  if (value.startsWith("#") && !/[\s<>]/.test(value)) return `/${value}`;
  if (/^\/(?!\/)[a-zA-Z0-9/_?#=&.%+-]*$/.test(value)) return value;
  try {
    const url = new URL(value);
    return ["https:", "mailto:", "tel:"].includes(url.protocol) &&
      !url.username &&
      !url.password
      ? url.href
      : safeFallback;
  } catch {
    return safeFallback;
  }
}
const previewMedia = new Map<string, string>();
export function clearPreviewMedia() {
  for (const url of previewMedia.values()) URL.revokeObjectURL(url);
  previewMedia.clear();
}
export function setPreviewMedia(value: unknown) {
  clearPreviewMedia();
  if (!Array.isArray(value)) return;
  let total = 0;
  for (const item of value.slice(0, 30)) {
    if (
      typeof item?.id !== "string" ||
      !(item.blob instanceof Blob) ||
      !["image/png", "image/jpeg", "image/webp", "image/avif"].includes(
        item.blob.type,
      ) ||
      item.blob.size > 5 * 1024 * 1024
    )
      continue;
    total += item.blob.size;
    if (total > 30 * 1024 * 1024) break;
    const previous = previewMedia.get(item.id);
    if (previous) URL.revokeObjectURL(previous);
    previewMedia.set(item.id, URL.createObjectURL(item.blob));
  }
}
export const mediaUrl = (id: string) =>
  previewMedia.get(id) ||
  `${apiBase}/portfolio/media/${encodeURIComponent(id)}`;
export function validDocument(value: unknown): value is PortfolioDocument {
  if (!value || typeof value !== "object") return false;
  const doc = value as Partial<PortfolioDocument>;
  return (
    typeof doc.version === "string" &&
    Array.isArray(doc.entries) &&
    doc.entries.length <= 1000 &&
    doc.entries.every(
      (item: PortfolioPublicEntry) =>
        typeof item?.id === "string" &&
        typeof item.kind === "string" &&
        typeof item.slug === "string" &&
        typeof item.content?.title?.en === "string",
    )
  );
}
export async function loadPublished(
  signal: AbortSignal,
): Promise<PortfolioDocument> {
  const response = await fetch(`${apiBase}/portfolio/content`, {
    signal,
    credentials: "omit",
    headers: { Accept: "application/json" },
  });
  if (!response.ok) throw new Error("Published content is unavailable");
  const value: unknown = await response.json();
  if (!validDocument(value)) throw new Error("Invalid published content");
  return value;
}
