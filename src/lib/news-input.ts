import type { NewsInput } from "@/lib/types";

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

export function parseNewsInput(value: unknown): NewsInput {
  if (!value || typeof value !== "object") {
    throw new Error("News details are required.");
  }
  const input = value as Record<string, unknown>;
  const publishedOn = optionalText(input.publishedOn, 10);
  if (publishedOn && !/^\d{4}-\d{2}-\d{2}$/.test(publishedOn)) {
    throw new Error("Publication date is invalid.");
  }
  return {
    titleTr: text(input.titleTr, "Turkish title", 300),
    titleEn: text(input.titleEn, "English title", 300),
    abstractTr: text(input.abstractTr, "Turkish abstract", 3000),
    abstractEn: text(input.abstractEn, "English abstract", 3000),
    sourceName: optionalText(input.sourceName, 255),
    articleUrl: optionalUrl(input.articleUrl, "Article link"),
    imageUrl: optionalUrl(input.imageUrl, "Image link"),
    videoUrl: optionalUrl(input.videoUrl, "Video link"),
    publishedOn,
    isPublished: input.isPublished !== false,
  };
}
