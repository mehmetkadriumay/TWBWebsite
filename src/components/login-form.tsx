"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import type { Locale } from "@/lib/i18n";

export function LoginForm({ locale }: { locale: Locale }) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError("");
    const form = new FormData(event.currentTarget);
    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username: form.get("username"),
        password: form.get("password"),
      }),
    });
    setBusy(false);
    if (!response.ok) {
      const result = (await response.json()) as { error?: string };
      setError(
        result.error ??
          (locale === "tr" ? "Giriş yapılamadı." : "Unable to log in."),
      );
      return;
    }
    router.push("/admin");
    router.refresh();
  }

  return (
    <form className="login-form" onSubmit={submit}>
      <div>
        <label htmlFor="username">
          {locale === "tr" ? "Kullanıcı adı" : "Username"}
        </label>
        <input
          autoComplete="username"
          id="username"
          name="username"
          required
          type="text"
        />
      </div>
      <div>
        <label htmlFor="password">
          {locale === "tr" ? "Şifre" : "Password"}
        </label>
        <input
          autoComplete="current-password"
          id="password"
          name="password"
          required
          type="password"
        />
      </div>
      {error && <p className="form-error" role="alert">{error}</p>}
      <button className="button button-primary" disabled={busy} type="submit">
        {busy
          ? locale === "tr" ? "Giriş yapılıyor..." : "Logging in..."
          : locale === "tr" ? "Yönetim paneline gir" : "Open admin dashboard"}
      </button>
    </form>
  );
}
