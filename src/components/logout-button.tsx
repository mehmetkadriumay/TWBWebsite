"use client";

import { useRouter } from "next/navigation";
import type { Locale } from "@/lib/i18n";

export function LogoutButton({ locale }: { locale: Locale }) {
  const router = useRouter();

  return (
    <button
      className="text-button"
      onClick={async () => {
        await fetch("/api/auth/logout", { method: "POST" });
        router.push("/");
        router.refresh();
      }}
      type="button"
    >
      {locale === "tr" ? "Güvenli çıkış" : "Sign out securely"}
    </button>
  );
}
