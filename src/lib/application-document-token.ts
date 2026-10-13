import "server-only";

import { createHmac, timingSafeEqual } from "node:crypto";

const tokenDurationSeconds = 10 * 60;

function secret(): string {
  const value = process.env.SESSION_SECRET;
  if (!value || value.length < 32) {
    throw new Error("SESSION_SECRET must contain at least 32 characters.");
  }
  return value;
}

function signature(payload: string): string {
  return createHmac("sha256", secret())
    .update(`application-document:${payload}`)
    .digest("base64url");
}

function safeEqual(left: string, right: string): boolean {
  const a = Buffer.from(left);
  const b = Buffer.from(right);
  return a.length === b.length && timingSafeEqual(a, b);
}

export function createApplicationDocumentToken(applicationId: number): string {
  const payload = Buffer.from(
    JSON.stringify({
      applicationId,
      expiresAt: Math.floor(Date.now() / 1000) + tokenDurationSeconds,
    }),
  ).toString("base64url");
  return `${payload}.${signature(payload)}`;
}

export function verifyApplicationDocumentToken(
  token: string | null,
  applicationId: number,
): boolean {
  if (!token) return false;
  const [payload, suppliedSignature] = token.split(".");
  if (
    !payload ||
    !suppliedSignature ||
    !safeEqual(signature(payload), suppliedSignature)
  ) {
    return false;
  }
  try {
    const value = JSON.parse(
      Buffer.from(payload, "base64url").toString("utf8"),
    ) as { applicationId?: number; expiresAt?: number };
    return (
      value.applicationId === applicationId &&
      typeof value.expiresAt === "number" &&
      value.expiresAt > Math.floor(Date.now() / 1000)
    );
  } catch {
    return false;
  }
}
