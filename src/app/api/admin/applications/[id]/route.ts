import { NextResponse } from "next/server";
import { createApplicationDocumentToken } from "@/lib/application-document-token";
import { isAdmin } from "@/lib/auth";
import {
  deleteApprovedParticipationApplication,
  getParticipationApplicationById,
  reviewParticipationApplication,
} from "@/lib/db";

function parseId(value: string): number | null {
  const id = Number.parseInt(value, 10);
  return Number.isInteger(id) && id > 0 ? id : null;
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Yetkisiz işlem." }, { status: 401 });
  }
  const id = parseId((await params).id);
  if (!id) {
    return NextResponse.json({ error: "Geçersiz başvuru." }, { status: 400 });
  }
  const application = await getParticipationApplicationById(id);
  if (!application) {
    return NextResponse.json({ error: "Başvuru bulunamadı." }, { status: 404 });
  }
  if (application.status !== "approved" || application.formType !== "turkiye") {
    return NextResponse.json(
      { error: "Belge yalnızca onaylanmış Türkiye başvuruları için hazırlanabilir." },
      { status: 400 },
    );
  }
  const token = createApplicationDocumentToken(id);
  const encodedToken = encodeURIComponent(token);
  return NextResponse.json({
    documentUrl: `/api/applications/${id}/document?token=${encodedToken}`,
    printUrl: `/api/applications/${id}/print?token=${encodedToken}`,
  });
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Yetkisiz işlem." }, { status: 401 });
  }
  const id = parseId((await params).id);
  if (!id) {
    return NextResponse.json({ error: "Geçersiz başvuru." }, { status: 400 });
  }

  let input: unknown;
  try {
    input = await request.json();
  } catch {
    return NextResponse.json({ error: "Geçersiz istek." }, { status: 400 });
  }
  const decision =
    input && typeof input === "object"
      ? (input as Record<string, unknown>).decision
      : null;
  if (decision !== "approve" && decision !== "reject") {
    return NextResponse.json({ error: "Geçersiz karar." }, { status: 400 });
  }

  try {
    const application = await reviewParticipationApplication(id, decision);
    if (!application) {
      return NextResponse.json({ error: "Başvuru bulunamadı." }, { status: 404 });
    }
    return NextResponse.json({
      application,
      message:
        decision === "approve"
          ? "Başvuru onaylandı ve öğrenci kaydı oluşturuldu."
          : "Başvuru reddedildi.",
    });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Başvuru değerlendirilemedi.",
      },
      { status: 400 },
    );
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Yetkisiz işlem." }, { status: 401 });
  }
  const id = parseId((await params).id);
  if (!id) {
    return NextResponse.json({ error: "Geçersiz başvuru." }, { status: 400 });
  }
  try {
    if (!(await deleteApprovedParticipationApplication(id))) {
      return NextResponse.json({ error: "Başvuru bulunamadı." }, { status: 404 });
    }
    return NextResponse.json({
      message: "Onaylanmış başvuru ve bağlı öğrenci kaydı silindi.",
    });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Başvuru silinemedi.",
      },
      { status: 400 },
    );
  }
}
