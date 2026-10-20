"use client";

import { ChangeEvent, useId, useState } from "react";
import type { Locale } from "@/lib/i18n";

export function ImageUploadField({
  label,
  locale,
  name,
  onChange,
  value,
}: {
  label: string;
  locale: Locale;
  name?: string;
  onChange: (value: string) => void;
  value: string;
}) {
  const id = useId();
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");

  async function upload(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    setUploading(true);
    setMessage("");
    const form = new FormData();
    form.set("image", file);
    try {
      const response = await fetch("/api/admin/uploads", {
        method: "POST",
        body: form,
      });
      const result = (await response.json()) as {
        error?: string;
        message?: string;
        url?: string;
      };
      setMessage(result.message ?? result.error ?? "");
      if (response.ok && result.url) onChange(result.url);
    } catch {
      setMessage(
        locale === "tr"
          ? "Görsel yüklenemedi. Bağlantınızı kontrol edip tekrar deneyin."
          : "The image could not be uploaded. Check your connection and try again.",
      );
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="image-upload-field">
      <label htmlFor={`${id}-url`}>
        <span>{label}</span>
        <input
          id={`${id}-url`}
          name={name}
          onChange={(event) => onChange(event.target.value)}
          placeholder={
            locale === "tr"
              ? "https://... veya /api/uploads/..."
              : "https://... or /api/uploads/..."
          }
          type="text"
          value={value}
        />
      </label>
      <div className="image-upload-actions">
        <label className="button button-secondary" htmlFor={`${id}-file`}>
          {uploading
            ? locale === "tr"
              ? "Yükleniyor..."
              : "Uploading..."
            : locale === "tr"
              ? "Bilgisayardan görsel yükle"
              : "Upload image from computer"}
        </label>
        <input
          accept="image/jpeg,image/png,image/gif,image/webp"
          disabled={uploading}
          id={`${id}-file`}
          onChange={(event) => void upload(event)}
          type="file"
        />
        <small>
          {locale === "tr"
            ? "JPEG, PNG, GIF veya WebP · en fazla 5 MB"
            : "JPEG, PNG, GIF, or WebP · maximum 5 MB"}
        </small>
      </div>
      {message && <p aria-live="polite">{message}</p>}
      {value && (
        <div className="image-upload-preview">
          <img alt="" src={value} />
          <button
            onClick={() => {
              onChange("");
              setMessage("");
            }}
            type="button"
          >
            {locale === "tr" ? "Görseli kaldır" : "Remove image"}
          </button>
        </div>
      )}
    </div>
  );
}
