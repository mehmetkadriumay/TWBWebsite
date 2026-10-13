import { NextRequest, NextResponse } from "next/server";
import { getTurkiyeApplicationDocumentData } from "@/lib/application-document";
import { verifyApplicationDocumentToken } from "@/lib/application-document-token";
import { getParticipationApplicationById } from "@/lib/db";

function parseId(value: string): number | null {
  const id = Number.parseInt(value, 10);
  return Number.isInteger(id) && id > 0 ? id : null;
}

function escapeHtml(value: string): string {
  return value.replace(
    /[&<>"']/g,
    (character) =>
      ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#039;",
      })[character]!,
  );
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const id = parseId((await params).id);
  const token = request.nextUrl.searchParams.get("token");
  if (!id || !verifyApplicationDocumentToken(token, id)) {
    return new NextResponse("Belge bağlantısı geçersiz veya süresi dolmuş.", {
      status: 403,
    });
  }
  const application = await getParticipationApplicationById(id);
  if (!application || application.formType !== "turkiye") {
    return new NextResponse("Başvuru bulunamadı.", { status: 404 });
  }
  const data = getTurkiyeApplicationDocumentData(application);
  const documentUrl = `/api/applications/${id}/document?token=${encodeURIComponent(token ?? "")}`;
  const html = `<!doctype html>
<html lang="tr">
<head>
  <meta charset="utf-8">
  <meta name="referrer" content="no-referrer">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>TWB Türkiye Başvurusu ${id}</title>
  <style>
    body { color: #111; font: 12pt Arial, sans-serif; line-height: 1.45; margin: 0 auto; max-width: 190mm; padding: 12mm; }
    h1, h2, h3 { color: #0a3161; page-break-after: avoid; }
    h1 { font-size: 22pt; }
    h2 { font-size: 15pt; margin-top: 28px; }
    .meta { display: flex; gap: 28px; margin-bottom: 20px; }
    table { border-collapse: collapse; margin: 16px 0; width: 100%; }
    td, th { border: 1px solid #555; padding: 8px; vertical-align: top; }
    th { background: #eef3f8; text-align: left; width: 38%; }
    .signature-grid { display: grid; gap: 28px; grid-template-columns: 1fr 1fr; margin-top: 36px; }
    .signature { border-top: 1px solid #444; padding-top: 7px; }
    .toolbar { align-items: center; background: #eef3f8; display: flex; gap: 14px; margin-bottom: 20px; padding: 12px; }
    .toolbar a { color: #0a3161; font-weight: 700; }
    @media print { .toolbar { display: none; } body { max-width: none; padding: 0; } }
  </style>
</head>
<body>
  <div class="toolbar">
    <strong>Başvuru kaydedildi.</strong>
    <a href="${documentUrl}">Word belgesini indir</a>
  </div>
  <h1>Turks Without Borders Programı</h1>
  <h2>Türkiye Katılım Başvuru Formu</h2>
  <div class="meta">
    <strong>Başvuru No: ${escapeHtml(data.applicationId)}</strong>
    <strong>Başvuru Tarihi: ${escapeHtml(data.submittedAt)}</strong>
  </div>
  <table>
    <tr><th>Okulun Adı</th><td>${escapeHtml(data.schoolName)}</td></tr>
    <tr><th>İl / İlçe</th><td>${escapeHtml(data.provinceDistrict)}</td></tr>
    <tr><th>Okul Müdürü</th><td>${escapeHtml(data.principalName)}</td></tr>
    <tr><th>Öğretmenin Adı</th><td>${escapeHtml(data.teacherName)}</td></tr>
    <tr><th>Öğretmen E-postası</th><td>${escapeHtml(data.teacherEmail)}</td></tr>
    <tr><th>Öğretmen Telefonu</th><td>${escapeHtml(data.teacherPhone)}</td></tr>
    <tr><th>Katılan Öğrenci Sayısı</th><td>${escapeHtml(data.studentCount)}</td></tr>
    <tr><th>Yaş Grubu</th><td>${escapeHtml(data.ageGroup)}</td></tr>
    <tr><th>İngilizce Seviyesi</th><td>${escapeHtml(data.englishLevel)}</td></tr>
    <tr><th>Özel İstekler / Açıklamalar</th><td>${escapeHtml(data.details)}</td></tr>
    <tr><th>Öğrencilerin Adları ve Doğum Tarihleri</th><td>Basılı form üzerinde tamamlanacaktır.</td></tr>
  </table>
  <p>Kuralları okudum; yukarıda bilgileri verilen öğrencilerin programa katılımını onaylıyorum.</p>
  <div class="signature-grid">
    <div class="signature">Velinin Adı, Soyadı ve İmzası</div>
    <div class="signature">Tarih</div>
    <div class="signature">Okul Müdürünün Adı, Soyadı ve İmzası</div>
    <div class="signature">Tarih</div>
  </div>
  <script>window.addEventListener("load", function () { window.setTimeout(function () { window.print(); }, 350); });</script>
</body>
</html>`;
  return new NextResponse(html, {
    headers: {
      "Cache-Control": "private, no-store",
      "Content-Type": "text/html; charset=utf-8",
      "Referrer-Policy": "no-referrer",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
