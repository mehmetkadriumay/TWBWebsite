import type { NewsContentType, NewsInput } from "@/lib/types";

function text(value: unknown, label: string, maximum: number): string {
  if (typeof value !== "string") throw new Error(`${label} is required.`);
  const normalized = value.trim();
  if (!normalized) throw new Error(`${label} is required.`);
  if (normalized.length > maximum) {
    throw new Error(`${label} must be ${maximum} characters or fewer.`);
  }
  return normalized;
}

function optionalText(value: unknown, maximum: number): string {
  if (typeof value !== "string") return "";
  const normalized = value.trim();
  if (normalized.length > maximum) {
    throw new Error(`A field exceeds the ${maximum}-character limit.`);
  }
  return normalized;
}

function optionalUrl(value: unknown, label: string): string {
  const normalized = optionalText(value, 2000);
  if (!normalized) return "";
  let url: URL;
  try {
    url = new URL(normalized);
  } catch {
    throw new Error(`${label} must be a valid URL.`);
  }
  if (!["http:", "https:"].includes(url.protocol)) {
    throw new Error(`${label} must use http or https.`);
  }
  return url.toString();
}

function optionalImageUrl(value: unknown): string {
  const normalized = optionalText(value, 2000);
  if (!normalized) return "";
  if (/^\/api\/uploads\/\d{13}-[0-9a-f-]{36}\.(gif|jpe?g|png|webp)$/i.test(normalized)) {
    return normalized;
  }
  return optionalUrl(normalized, "Image link");
}

export function parseNewsInput(value: unknown): NewsInput {
  if (!value || typeof value !== "object") {
    throw new Error("News details are required.");
  }
  const input = value as Record<string, unknown>;
  const allowedTypes: NewsContentType[] = ["update", "news", "video", "blog"];
  const contentType = allowedTypes.includes(input.contentType as NewsContentType)
    ? (input.contentType as NewsContentType)
    : "news";
  const publishedAt = optionalText(input.publishedAt, 16);
  if (
    publishedAt &&
    !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(publishedAt)
  ) {
    throw new Error("Publication date and time are invalid.");
  }
  const titleTr =
    contentType === "update"
      ? optionalText(input.titleTr, 300)
      : text(input.titleTr, "Turkish title", 300);
  const titleEn =
    contentType === "update"
      ? optionalText(input.titleEn, 300)
      : text(input.titleEn, "English title", 300);
  return {
    contentType,
    titleTr,
    titleEn,
    abstractTr: text(
      input.abstractTr,
      contentType === "update" ? "Turkish update" : "Turkish abstract",
      contentType === "update" ? 500 : 3000,
    ),
    abstractEn: text(
      input.abstractEn,
      contentType === "update" ? "English update" : "English abstract",
      contentType === "update" ? 500 : 3000,
    ),
    category: optionalText(input.category, 100),
    sourceName: optionalText(input.sourceName, 255),
    articleUrl: optionalUrl(input.articleUrl, "Article link"),
    imageUrl: optionalImageUrl(input.imageUrl),
    videoUrl: optionalUrl(input.videoUrl, "Video link"),
    publishedAt,
    isPublished: input.isPublished !== false,
    isFeatured: input.isFeatured === true,
  };
}
