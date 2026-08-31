"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { DownloadIcon, TrashIcon, UploadIcon } from "@/components/icons";
import type { Locale } from "@/lib/i18n";

export function WeekAdminTools({
  locale,
  selectedWeek,
}: {
  locale: Locale;
  selectedWeek?: number;
}) {
  const router = useRouter();
  const fileInput = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  async function deleteSelectedWeek() {
    if (!selectedWeek) return;
    const confirmation =
      locale === "tr"
        ? `Hafta ${selectedWeek} ve tüm soruları silinsin mi?`
        : `Delete week ${selectedWeek} and all of its questions?`;
    if (!window.confirm(confirmation)) {
      return;
    }

    setBusy(true);
    setMessage("");
    const response = await fetch(`/api/admin/weeks/${selectedWeek}`, {
      method: "DELETE",
    });
    const result = (await response.json()) as { message?: string; error?: string };
    setBusy(false);
    setMessage(result.message ?? result.error ?? "İşlem tamamlanamadı.");
    if (response.ok) router.push("/konusma-konulari");
    router.refresh();
  }

  async function importWorkbook(file: File) {
    setBusy(true);
    setMessage("");
    const formData = new FormData();
    formData.set("file", file);
    const response = await fetch("/api/admin/weeks/import", {
      method: "POST",
      body: formData,
    });
    const result = (await response.json()) as {
      message?: string;
      error?: string;
      weeks?: number[];
    };
    setBusy(false);
    setMessage(result.message ?? result.error ?? "İşlem tamamlanamadı.");
    fileInput.current!.value = "";
    if (response.ok) {
      const lastWeek = result.weeks?.at(-1);
      router.push(
        lastWeek
          ? `/konusma-konulari?hafta=${lastWeek}`
          : "/konusma-konulari",
      );
      router.refresh();
    }
  }

  return (
    <aside className="admin-topic-bar">
      <div>
        <span className="admin-badge">
          {locale === "tr" ? "Yönetici modu" : "Admin mode"}
        </span>
        <strong>
          {locale === "tr" ? "Haftalık içerik yönetimi" : "Weekly content management"}
        </strong>
        <small>
          {locale === "tr"
            ? "Her hafta “Hafta 1” biçiminde ayrı bir sekmedir. Başlık sütununa her konu bir kez yazılır; altındaki satırlarda o konuya ait sorular Soru sütununda yer alır. "
            : "Each week is a separate tab named “Hafta 1”. Enter each topic once in Başlık, then place that topic's questions beneath it in the Soru column. "}
          <a href="/api/admin/weeks/template">
            {locale === "tr" ? "Örnek dosyayı indir" : "Download a template"}
          </a>
        </small>
      </div>
      <div className="admin-topic-actions">
        <button
          className="button button-danger"
          disabled={!selectedWeek || busy}
          onClick={deleteSelectedWeek}
          type="button"
        >
          <TrashIcon /> {locale === "tr" ? "Haftayı Sil" : "Delete Week"}
        </button>
        <a className="button button-export" href="/api/admin/weeks/export">
          <DownloadIcon /> {locale === "tr" ? "Tümünü Dışa Aktar" : "Export All"}
        </a>
        <input
          accept=".xlsx,.xls"
          hidden
          onChange={(event) => {
            const file = event.target.files?.[0];
            if (file) void importWorkbook(file);
          }}
          ref={fileInput}
          type="file"
        />
        <button
          className="button button-primary"
          disabled={busy}
          onClick={() => fileInput.current?.click()}
          type="button"
        >
          <UploadIcon />{" "}
          {busy
            ? locale === "tr" ? "İşleniyor..." : "Processing..."
            : locale === "tr" ? "Excel'den İçe Aktar" : "Import from Excel"}
        </button>
      </div>
      {message && <p className="admin-message" role="status">{message}</p>}
    </aside>
  );
}
