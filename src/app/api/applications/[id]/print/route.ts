import { NextRequest, NextResponse } from "next/server";
import mammoth from "mammoth";
import { createTurkiyeApplicationDocument } from "@/lib/application-document";
import { verifyApplicationDocumentToken } from "@/lib/application-document-token";
import { getParticipationApplicationById } from "@/lib/db";

function parseId(value: string): number | null {
  const id = Number.parseInt(value, 10);
  return Number.isInteger(id) && id > 0 ? id : null;
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
  const document = createTurkiyeApplicationDocument(application);
  const converted = await mammoth.convertToHtml({ buffer: document });
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
    p { orphans: 3; widows: 3; }
    table { border-collapse: collapse; margin: 16px 0; width: 100%; }
    td, th { border: 1px solid #555; padding: 8px; vertical-align: top; }
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
  ${converted.value}
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
