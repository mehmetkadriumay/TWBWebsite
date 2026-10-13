import { NextRequest, NextResponse } from "next/server";
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
  if (
    !id ||
    !verifyApplicationDocumentToken(
      request.nextUrl.searchParams.get("token"),
      id,
    )
  ) {
    return NextResponse.json(
      { error: "Belge bağlantısı geçersiz veya süresi dolmuş." },
      { status: 403 },
    );
  }
  const application = await getParticipationApplicationById(id);
  if (!application || application.formType !== "turkiye") {
    return NextResponse.json({ error: "Başvuru bulunamadı." }, { status: 404 });
  }
  const document = createTurkiyeApplicationDocument(application);
  return new NextResponse(new Uint8Array(document), {
    headers: {
      "Cache-Control": "private, no-store",
      "Content-Disposition": `attachment; filename="TWB-Turkiye-Basvuru-${id}.docx"`,
      "Content-Type":
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
