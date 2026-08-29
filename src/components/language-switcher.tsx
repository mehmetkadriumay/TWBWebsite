"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Locale } from "@/lib/i18n";

export function LanguageSwitcher({ locale }: { locale: Locale }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function changeLanguage(nextLocale: Locale) {
    if (nextLocale === locale || busy) return;
    setBusy(true);
    const response = await fetch("/api/language", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ locale: nextLocale }),
    });
    if (response.ok) {
      router.refresh();
    }
    setBusy(false);
  }

  return (
    <div className="language-switcher" aria-label="Language">
      {(["tr", "en"] as const).map((option) => (
        <button
          aria-pressed={locale === option}
          className={locale === option ? "active" : ""}
          disabled={busy}
          key={option}
          onClick={() => void changeLanguage(option)}
          type="button"
        >
          {option.toUpperCase()}
        </button>
      ))}
    </div>
  );
}
