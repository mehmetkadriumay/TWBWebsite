import type { Metadata } from "next";
import { ParticipationForms } from "@/components/participation-forms";
import { PageHero } from "@/components/page-hero";
import { getPage } from "@/lib/db";
import { getLocale, localizedSlug } from "@/lib/i18n";

export const metadata: Metadata = { title: "Projeye Katılım" };

const participationCopy = {
  tr: {
    introTitle: "Yeni gruplarımıza katılın",
    intro:
      "Başvuru yapmadan önce aşağıdaki katılım koşullarını dikkatle inceleyin. Koşullar size veya grubunuza uygunsa sayfanın sonundaki Türkiye ya da Amerika Birleşik Devletleri başvuru formunu doldurun.",
    requirements: "Projeye Katılım Şartları",
    groups: [
      {
        number: "01",
        title: "Türkiye'deki öğrenciler",
        summary: "Türkiye'den katılacak öğrencilerin karşılaması gereken koşullar",
        items: [
          "Proje koordinatörlerinin belirlediği okullarda görev yapan öğretmenler tarafından seçilmiş olmak.",
          "Başvuru tarihinde en az 15 yaşında olmak.",
          "Tüm görüşmelere veli bilgisi ve izni dahilinde katılmak.",
          "Özel bir engel bulunmadıkça haftalık görüşmelerde kamerayı açık tutmak.",
          "Öğretmenin bildirdiği gün ve saatte hazır olmak ve haftalık programdaki konuşma konularına önceden çalışmak.",
          "Bir görüşmeye katılamayacaksa bunu en az iki gün önceden öğretmenine bildirmek.",
          "Velinin bilgisi olmadan telefon numarası, sosyal medya hesabı veya başka kişisel iletişim bilgileri paylaşmamak.",
          "Görüşmelerde uygun ve saygılı bir dil kullanmak; dini, siyasi veya uygunsuz içerikli tartışmalardan kaçınmak.",
        ],
      },
      {
        number: "02",
        title: "Amerika Birleşik Devletleri'ndeki öğrenciler",
        summary: "Amerika'dan katılacak öğrencilerin karşılaması gereken koşullar",
        items: [
          "Amerika Birleşik Devletleri'nde yaşayan ve eğitimine devam eden bir öğrenci olmak.",
          "Başvuru tarihinde en az 13 yaşında olmak.",
          "Bir bölge koordinatörü tarafından aday gösterilmek ve en az iki kişiden referans sunabilmek.",
          "Özel bir engel bulunmadıkça haftalık görüşmelerde kamerayı açık tutmak.",
          "Bölge koordinatörünün bildirdiği gün ve saatte hazır olmak ve haftalık konuşma konularına önceden hazırlanmak.",
          "Bir görüşmeye katılamayacaksa bunu en az iki gün önceden bölge koordinatörüne bildirmek.",
          "Velinin bilgisi olmadan telefon numarası, sosyal medya hesabı veya başka kişisel iletişim bilgileri paylaşmamak.",
          "Görüşmelerde uygun ve saygılı bir dil kullanmak; dini, siyasi veya uygunsuz içerikli tartışmalardan kaçınmak.",
        ],
      },
      {
        number: "03",
        title: "Veliler",
        summary: "Öğrencinin projeye başlamasından önce tamamlanması gereken işlemler",
        items: [
          "Türkiye'deki öğrencilerin velileri, Proje Katılım ve İzin Formunu doldurup öğrencinin okulundaki sorumlu öğretmene teslim etmelidir.",
          "Amerika Birleşik Devletleri'ndeki öğrencilerin velileri, Proje Katılım Formunu doldurup bağlı oldukları bölge koordinatörüne teslim etmelidir.",
        ],
      },
      {
        number: "04",
        title: "Türkiye'deki öğretmenler",
        summary: "Okul gruplarından sorumlu öğretmenlerin görevleri",
        items: [
          "Proje başlamadan önce okul müdüründen okulun ve öğrencilerin projeye katılması için onay almak.",
          "Veliler tarafından imzalanmış katılım ve izin formlarını proje koordinatörlerine ulaştırmak.",
          "Velilere projenin işleyişini ve öğrencilerin katılacağı görüşmelerin gün ve saatlerini bildirmek.",
          "Grup görüşmelerine belirlenen gün ve saatte katılmak ve konuşmanın düzenli ilerlemesine rehberlik etmek.",
          "Öğrencilerin görüşme kurallarına uymasını ve kaçınılması gereken davranışları takip etmek.",
          "Haftalık programdaki konu başlıklarıyla soruları öğrencilere en geç her haftanın salı günü iletmek.",
        ],
      },
      {
        number: "05",
        title: "Amerika'daki bölge koordinatörleri",
        summary: "Bölgesel grupları yöneten gönüllü koordinatörlerin görevleri",
        items: [
          "Web sitesinde yayımlanan haftalık konu başlıklarını ve soruları kendi gruplarındaki öğrencilere zamanında iletmek.",
          "Görüşmeye katılamayacak bir öğrencinin yerine uygun bir katılımcı bulmak; bu mümkün değilse durumu en az bir gün önceden genel koordinatörlere bildirmek.",
        ],
      },
    ],
    permissionTitle: "Katılım ve veli izin formu",
    permissionText:
      "Türkiye'den projeye katılım onayı alan öğrencilerin velileri, imzalı katılım ve izin formunu sorumlu öğretmene ulaştırmalıdır.",
    permissionLink: "Türkiye Katılım ve İzin Formunu İndir",
    applicationButton: "Başvuru formlarına git",
  },
  en: {
    introTitle: "Join one of our new groups",
    intro:
      "Before applying, review every participation requirement below. If the conditions fit you or your group, complete the Türkiye or United States application form at the bottom of this page.",
    requirements: "Project Participation Requirements",
    groups: [
      {
        number: "01",
        title: "Students in Türkiye",
        summary: "Requirements for students participating from Türkiye",
        items: [
          "Be selected by a teacher working at a school identified by the project coordinators.",
          "Be at least 15 years old when applying.",
          "Participate in every conversation with the knowledge and permission of a parent or guardian.",
          "Keep the camera on during weekly sessions unless there is an exceptional reason not to do so.",
          "Attend at the date and time set by the teacher and prepare the weekly program and conversation topics in advance.",
          "Notify the teacher at least two days beforehand when unable to attend a weekly session.",
          "Do not exchange phone numbers, social-media accounts, or other personal contact information without a parent or guardian's knowledge.",
          "Use respectful, appropriate language and avoid religious, political, or otherwise unsuitable discussions.",
        ],
      },
      {
        number: "02",
        title: "Students in the United States",
        summary: "Requirements for students participating from the United States",
        items: [
          "Live and attend school in the United States.",
          "Be at least 13 years old when applying.",
          "Be nominated by a regional coordinator and be able to provide at least two references.",
          "Keep the camera on during weekly sessions unless there is an exceptional reason not to do so.",
          "Attend at the date and time set by the regional coordinator and prepare the weekly conversation topics in advance.",
          "Notify the regional coordinator at least two days beforehand when unable to attend a weekly session.",
          "Do not exchange phone numbers, social-media accounts, or other personal contact information without a parent or guardian's knowledge.",
          "Use respectful, appropriate language and avoid religious, political, or otherwise unsuitable discussions.",
        ],
      },
      {
        number: "03",
        title: "Parents and guardians",
        summary: "Steps required before a student begins the project",
        items: [
          "Parents or guardians of students in Türkiye must complete the Project Participation and Permission Form and give it to the responsible school teacher.",
          "Parents or guardians of students in the United States must complete the Project Participation Form and give it to their regional coordinator.",
        ],
      },
      {
        number: "04",
        title: "Teachers in Türkiye",
        summary: "Responsibilities of teachers leading school groups",
        items: [
          "Obtain approval from the school principal before the school and its students begin participating.",
          "Send the participation and permission forms signed by parents or guardians to the project coordinators.",
          "Explain the project to families and communicate the scheduled dates and times of student sessions.",
          "Attend group conversations at the scheduled time and guide the discussion.",
          "Monitor compliance with the conversation rules and behaviors students must avoid.",
          "Send each week's program, topic headings, and questions to students no later than Tuesday.",
        ],
      },
      {
        number: "05",
        title: "Regional coordinators in the United States",
        summary: "Responsibilities of volunteers managing regional groups",
        items: [
          "Send the weekly topic headings and questions published on the website to every student in their group.",
          "Find an appropriate replacement when a student cannot attend; if that is not possible, notify the general coordinators at least one day in advance.",
        ],
      },
    ],
    permissionTitle: "Participation and parent permission form",
    permissionText:
      "Parents or guardians of students approved to participate from Türkiye must send the signed participation and permission form to the responsible teacher.",
    permissionLink: "Download the Türkiye Participation and Permission Form",
    applicationButton: "Go to application forms",
  },
} as const;

export default async function JoinPage() {
  const locale = await getLocale();
  const copy = participationCopy[locale];
  const page = await getPage(localizedSlug("projeye-katilim", locale));
  if (!page) return null;

  return (
    <>
      <PageHero eyebrow={page.eyebrow} title={page.title} summary={page.summary} />
      <section className="section participation-intro">
        <div className="container participation-intro-grid">
          <div>
            <span className="eyebrow">{copy.requirements}</span>
            <h2>{copy.introTitle}</h2>
          </div>
          <div>
            <p>{copy.intro}</p>
            <a className="text-link" href="#application-forms">
              {copy.applicationButton} ↓
            </a>
          </div>
        </div>

        <div className="container requirement-list">
          {copy.groups.map((group) => (
            <article className="requirement-card" key={group.number}>
              <header>
                <span>{group.number}</span>
                <div>
                  <h3>{group.title}</h3>
                  <p>{group.summary}</p>
                </div>
              </header>
              <ul>
                {group.items.map((item) => (
                  <li key={item}>
                    <span aria-hidden="true">✓</span>
                    <p>{item}</p>
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>

        <div className="container">
          <aside className="permission-panel">
            <div>
              <span className="eyebrow">{locale === "tr" ? "ÖNEMLİ BELGE" : "REQUIRED DOCUMENT"}</span>
              <h2>{copy.permissionTitle}</h2>
              <p>{copy.permissionText}</p>
            </div>
            <a
              className="button button-white"
              href="http://www.turkswithoutborders.net/wordpress/wp-content/uploads/2023/11/katilim-izin-formu-TR.pdf"
              rel="noreferrer"
              target="_blank"
            >
              {copy.permissionLink}
            </a>
          </aside>
        </div>
      </section>
      <ParticipationForms locale={locale} />
    </>
  );
}
