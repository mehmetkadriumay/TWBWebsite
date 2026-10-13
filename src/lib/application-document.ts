import "server-only";

import fs from "node:fs";
import path from "node:path";
import Docxtemplater from "docxtemplater";
import PizZip from "pizzip";
import type { ParticipationApplication } from "@/lib/types";

const templatePath = path.join(
  process.cwd(),
  "templates",
  "TurksWithoutBordersProgramv2.docx",
);

const englishLevels: Record<string, string> = {
  intermediate: "Orta",
  good: "İyi",
  "very-good": "Çok iyi",
};

export type TurkiyeApplicationDocumentData = {
  applicationId: string;
  submittedAt: string;
  schoolName: string;
  provinceDistrict: string;
  principalName: string;
  teacherName: string;
  teacherEmail: string;
  teacherPhone: string;
  studentCount: string;
  ageGroup: string;
  englishLevel: string;
  details: string;
};

export function getTurkiyeApplicationDocumentData(
  application: ParticipationApplication,
): TurkiyeApplicationDocumentData {
  if (application.formType !== "turkiye") {
    throw new Error("Only Türkiye applications use this document template.");
  }
  const fields = application.fields;
  return {
    applicationId: String(application.id),
    submittedAt: new Intl.DateTimeFormat("tr-TR", {
      dateStyle: "long",
      timeZone: "UTC",
    }).format(new Date(application.submittedAt)),
    schoolName: fields.schoolName || "-",
    provinceDistrict:
      [fields.province, fields.district].filter(Boolean).join(" / ") || "-",
    principalName: fields.principalName || "-",
    teacherName:
      [fields.teacherFirstName, fields.teacherLastName]
        .filter(Boolean)
        .join(" ") || "-",
    teacherEmail: fields.teacherEmail || "-",
    teacherPhone: fields.teacherPhone || "-",
    studentCount: fields.studentCount || "-",
    ageGroup: fields.ageGroup || "-",
    englishLevel:
      englishLevels[fields.englishLevel] || fields.englishLevel || "-",
    details: fields.details || "Belirtilmedi.",
  };
}

export function createTurkiyeApplicationDocument(
  application: ParticipationApplication,
): Buffer {
  const zip = new PizZip(fs.readFileSync(templatePath));
  const document = new Docxtemplater(zip, {
    linebreaks: true,
    paragraphLoop: true,
  });
  document.render(getTurkiyeApplicationDocumentData(application));
  return document.getZip().generate({
    type: "nodebuffer",
    compression: "DEFLATE",
  });
}
