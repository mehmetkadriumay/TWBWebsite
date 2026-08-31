"use client";

import { FormEvent, useState } from "react";
import type { Locale } from "@/lib/i18n";

export function WhatsAppManagement({ locale }: { locale: Locale }) {
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [success, setSuccess] = useState(false);

  async function send(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setMessage("");
    setSuccess(false);
    const form = new FormData(event.currentTarget);
    const response = await fetch("/api/admin/whatsapp/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        recipient: form.get("recipient"),
        body: form.get("body"),
      }),
    });
    const result = (await response.json()) as {
      message?: string;
      error?: string;
      sid?: string;
      status?: string;
    };
    setBusy(false);
    setSuccess(response.ok);
    setMessage(
      response.ok
        ? `${result.message ?? "Message accepted."} ${result.sid ?? ""} ${result.status ?? ""}`.trim()
        : result.error ?? "The message could not be sent.",
    );
    if (response.ok) event.currentTarget.reset();
  }

  return (
    <form className="whatsapp-form" onSubmit={send}>
      <div className="whatsapp-heading">
        <div>
          <span className="eyebrow">Twilio WhatsApp</span>
          <h2>{locale === "tr" ? "WhatsApp mesajı gönder" : "Send a WhatsApp message"}</h2>
        </div>
        <span className="whatsapp-mark" aria-hidden="true">WA</span>
      </div>
      <div className="whatsapp-fields">
        <div>
          <label htmlFor="whatsapp-recipient">
            {locale === "tr" ? "Alıcı telefon numarası" : "Recipient phone number"}
          </label>
          <input
            id="whatsapp-recipient"
            name="recipient"
            pattern="^\+[1-9][0-9]{7,14}$"
            placeholder="+15551234567"
            required
            type="tel"
          />
          <small>
            {locale === "tr"
              ? "Ülke koduyla E.164 biçimini kullanın."
              : "Use E.164 format with the country code."}
          </small>
        </div>
        <div>
          <label htmlFor="whatsapp-body">
            {locale === "tr" ? "Mesaj" : "Message"}
          </label>
          <textarea
            id="whatsapp-body"
            maxLength={1600}
            name="body"
            required
            rows={8}
          />
          <small>
            {locale === "tr"
              ? "Serbest metin yalnızca kullanıcının son mesajından sonraki 24 saatlik WhatsApp oturumunda gönderilebilir."
              : "Free-form text can only be sent during the 24-hour WhatsApp session after the user's latest message."}
          </small>
        </div>
      </div>
      <div className="whatsapp-notice">
        <strong>{locale === "tr" ? "Twilio yapılandırması" : "Twilio configuration"}</strong>
        <p>
          {locale === "tr"
            ? "Sunucuda TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN ve TWILIO_WHATSAPP_FROM değişkenleri gereklidir. Sandbox kullanıyorsanız alıcının önce sandbox'a katılmış olması gerekir."
            : "The server requires TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, and TWILIO_WHATSAPP_FROM. Sandbox recipients must join your sandbox first."}
        </p>
      </div>
      <div className="editor-footer">
        <span className={success ? "form-success" : "form-error-text"} role="status">
          {message}
        </span>
        <button className="button button-primary" disabled={busy} type="submit">
          {busy
            ? locale === "tr" ? "Gönderiliyor..." : "Sending..."
            : locale === "tr" ? "WhatsApp gönder" : "Send WhatsApp"}
        </button>
      </div>
    </form>
  );
}
