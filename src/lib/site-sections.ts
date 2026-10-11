import "server-only";

import { ui, type Locale } from "@/lib/i18n";

const story = {
  tr: {
    videosEyebrow: "PROJE VİDEOLARI",
    videosTitle: "Hikâyemizi anlatan iki resmi kayıt.",
    videosSummary:
      "Projenin nasıl doğduğunu, kimler tarafından yürütüldüğünü ve öğrenciler arasında nasıl bir kültür ve dil köprüsü kurduğunu doğrudan proje ekibinden dinleyin.",
    watchLabel: "YouTube'da izle",
    durationLabel: "Süre",
    publisherLabel: "Yayımlayan",
    samplesEyebrow: "GERÇEK SOHBETLER",
    samplesTitle: "Konuşma örnekleri",
    samplesSummary:
      "Öğrencilerimizin haftalık buluşmalarından, programın doğal ve destekleyici sohbet ortamını yansıtan kısa örnekler.",
    samplesDisclaimerTitle: "Rıza ve gizlilik notu",
    samplesDisclaimer:
      "Bu videolar katılımcıların bilgisi ve açık rızasıyla kaydedilmiş ve paylaşılmıştır.",
    samples: [
      {
        title: "Konuşma örneği 1",
        description: "Turks Without Borders çevrim içi öğrenci görüşmesinden bir kesit.",
        src: "/media/conversation-sample-1.mp4",
      },
      {
        title: "Konuşma örneği 2",
        description: "Turks Without Borders çevrim içi öğrenci görüşmesinden bir kesit.",
        src: "/media/conversation-sample-2.mp4",
      },
    ],
    newsEyebrow: "BASINDA BİZ",
    newsTitle: "Hakkımızdaki Haberler",
    newsSummary:
      "Turks Without Borders'ın çalışmaları, etkinlikleri ve gençler arasında kurduğu kültür köprüsü hakkında yayımlanan haberleri keşfedin.",
    newsEmpty:
      "Yeni haberler ve proje duyuruları yakında burada paylaşılacak.",
    readNews: "Haberi oku",
    watchVideo: "Videoyu izle",
    followInstagram: "Instagram'da takip et",
    videos: [
      {
        id: "sPXLQtMGHXI",
        duration: "12:30",
        title: "Turks Without Borders",
        publisher: "TACAWA Social Support",
        description:
          "TACAWA Sosyal Dayanışma ekibi tarafından hazırlanan Turks Without Borders proje filmi.",
      },
      {
        id: "O_XBZTjMiUY",
        duration: "52:17",
        title: "Turks Without Borders Project",
        publisher: "Assembly of Turkish American Associations",
        description:
          "Projenin kurucuları Ülkü Umay ve Serpil İngeç'in proje modelini tanıttığı ve soruları yanıtladığı kapsamlı sunum.",
      },
    ],
  },
  en: {
    videosEyebrow: "PROJECT VIDEOS",
    videosTitle: "Two official recordings that tell our story.",
    videosSummary:
      "Hear directly from the project team about how the program began, who leads it, and how it builds a bridge of language and culture between students.",
    watchLabel: "Watch on YouTube",
    durationLabel: "Duration",
    publisherLabel: "Published by",
    samplesEyebrow: "REAL CONVERSATIONS",
    samplesTitle: "Conversation samples",
    samplesSummary:
      "Short examples from our students' weekly meetings that reflect the program's natural and supportive conversation environment.",
    samplesDisclaimerTitle: "Consent and privacy notice",
    samplesDisclaimer:
      "These videos were recorded and shared with the knowledge and explicit consent of the attendees.",
    samples: [
      {
        title: "Conversation sample 1",
        description: "A moment from a Turks Without Borders online student conversation.",
        src: "/media/conversation-sample-1.mp4",
      },
      {
        title: "Conversation sample 2",
        description: "A moment from a Turks Without Borders online student conversation.",
        src: "/media/conversation-sample-2.mp4",
      },
    ],
    newsEyebrow: "IN THE NEWS",
    newsTitle: "News About Us",
    newsSummary:
      "Explore coverage of Turks Without Borders, our activities, and the cultural bridge the project creates between young people.",
    newsEmpty:
      "New coverage and project announcements will be shared here soon.",
    readNews: "Read the article",
    watchVideo: "Watch video",
    followInstagram: "Follow on Instagram",
    videos: [
      {
        id: "sPXLQtMGHXI",
        duration: "12:30",
        title: "Turks Without Borders",
        publisher: "TACAWA Social Support",
        description:
          "A Turks Without Borders project film produced by the TACAWA Social Support team.",
      },
      {
        id: "O_XBZTjMiUY",
        duration: "52:17",
        title: "Turks Without Borders Project",
        publisher: "Assembly of Turkish American Associations",
        description:
          "An in-depth presentation and Q&A in which project founders Ülkü Umay and Serpil İngeç introduce the program model.",
      },
    ],
  },
} as const;

const how = {
  tr: {
    sectionEyebrow: "PROGRAM MODELİ",
    sectionTitle: "Geçmişten ilham alan, gençlerle gelişen bir model.",
    sectionSummary:
      "Mektup arkadaşlığından çevrim içi görüşmelere uzanan yapımızı, kimlerin yürüttüğünü ve gençlere ne kazandırmayı amaçladığımızı keşfedin.",
    headings: [
      "Mektup arkadaşlığından yüz yüze görüşmelere",
      "Gönüllü eğitimciler, güvenli ve planlı sohbetler",
      "Gençlerin yön verdiği kişisel gelişim ortamı",
    ],
    labels: ["Köken ve yapı", "Programın işleyişi", "Hedefler ve gelişim"],
    principlesTitle: "Programın temel bileşenleri",
    principles: [
      ["İki ülke", "Türkiye ile Amerika Birleşik Devletleri arasında düzenli bağlantı"],
      ["Gönüllülük", "Profesyonel eğitimcilik deneyimine sahip gönüllü ekip"],
      ["Haftalık diyalog", "Önceden belirlenen konular etrafında karşılıklı İngilizce konuşma"],
      ["Genç liderliği", "Karar alan, sonuçları değerlendiren ve sorumluluk üstlenen katılımcılar"],
    ],
  },
  en: {
    sectionEyebrow: "PROGRAM MODEL",
    sectionTitle: "Inspired by the past and continually improved by young people.",
    sectionSummary:
      "Explore how the project developed from pen-pal exchanges into online conversations, who leads it, and what it is designed to give young participants.",
    headings: [
      "From pen pals to face-to-face conversations",
      "Volunteer educators and safe, planned discussions",
      "A youth-led environment for personal growth",
    ],
    labels: ["Origins and structure", "How the program operates", "Goals and development"],
    principlesTitle: "Core elements of the program",
    principles: [
      ["Two countries", "A consistent connection between Türkiye and the United States"],
      ["Volunteer-led", "A volunteer team with professional education experience"],
      ["Weekly dialogue", "Two-way English conversation around topics prepared in advance"],
      ["Youth leadership", "Participants who make decisions, evaluate results, and accept responsibility"],
    ],
  },
} as const;

const participation = {
  tr: {
    introTitle: "Yeni gruplarımıza katılın",
    requirements: "Projeye Katılım Şartları",
    applicationButton: "Başvuru formlarına git",
    permissionEyebrow: "ÖNEMLİ BELGE",
    permissionTitle: "Katılım ve veli izin formu",
    permissionText:
      "Türkiye'den projeye katılım onayı alan öğrencilerin velileri, imzalı katılım ve izin formunu sorumlu öğretmene ulaştırmalıdır.",
    permissionLink: "Türkiye Katılım ve İzin Formunu İndir",
    permissionUrl:
      "http://www.turkswithoutborders.net/wordpress/wp-content/uploads/2023/11/katilim-izin-formu-TR.pdf",
    forms: {
      eyebrow: "BAŞVURU FORMLARI",
      title: "Size uygun başvuru formunu doldurun.",
      summary:
        "Türkiye başvurusu öğretmen ve okul grubu bilgilerini; Amerika başvurusu öğrenci, referans veren kişi ve veli bilgilerini toplar.",
      turkeyTitle: "Türkiye'den Proje Başvurusu",
      usTitle: "Amerika'dan Proje Başvurusu",
      turkeyRegion: "TÜRKİYE",
      usRegion: "AMERİKA BİRLEŞİK DEVLETLERİ",
      teacherSection: "Başvuruyu yapan öğretmen",
      schoolSection: "Okul bilgileri",
      studentsSection: "Projeye katılacak öğrenciler",
      applicantSection: "Başvuru sahibi öğrenci",
      referrerSection: "Referans veren kişi",
      parentSection: "Veli bilgileri",
      firstName: "Adı",
      lastName: "Soyadı",
      email: "E-posta adresi",
      phone: "Telefon numarası",
      schoolName: "Çalıştığı okulun adı",
      province: "Okulun bulunduğu il",
      provincePlaceholder: "İl seçin",
      district: "İlçe",
      principal: "Okul müdürünün adı soyadı",
      studentCount: "Öğrenci sayısı",
      ageGroup: "Yaş grubu",
      englishLevel: "İngilizce seviyeleri",
      levelPlaceholder: "Seviye seçin",
      intermediate: "Orta",
      good: "İyi",
      veryGood: "Çok iyi",
      details: "Paylaşmak istediğiniz detay bilgiler",
      dateOfBirth: "Doğum tarihi",
      state: "Eyalet",
      city: "Şehir",
      statePlaceholder: "Eyalet seçin",
      consent:
        "Verdiğim bilgilerin proje başvurusunun değerlendirilmesi amacıyla kullanılmasını kabul ediyorum.",
      humanTitle: "Ben insanım",
      humanHelp: "Başvuruyu göndermeden önce bu kutuyu işaretleyin.",
      submit: "Başvuruyu Gönder",
      submitting: "Gönderiliyor...",
      thankYou: "Teşekkür ederiz!",
    },
    groups: [
      {
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
        title: "Veliler",
        summary: "Öğrencinin projeye başlamasından önce tamamlanması gereken işlemler",
        items: [
          "Türkiye'deki öğrencilerin velileri, Proje Katılım ve İzin Formunu doldurup öğrencinin okulundaki sorumlu öğretmene teslim etmelidir.",
          "Amerika Birleşik Devletleri'ndeki öğrencilerin velileri, Proje Katılım Formunu doldurup bağlı oldukları bölge koordinatörüne teslim etmelidir.",
        ],
      },
      {
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
        title: "Amerika'daki bölge koordinatörleri",
        summary: "Bölgesel grupları yöneten gönüllü koordinatörlerin görevleri",
        items: [
          "Web sitesinde yayımlanan haftalık konu başlıklarını ve soruları kendi gruplarındaki öğrencilere zamanında iletmek.",
          "Görüşmeye katılamayacak bir öğrencinin yerine uygun bir katılımcı bulmak; bu mümkün değilse durumu en az bir gün önceden genel koordinatörlere bildirmek.",
        ],
      },
    ],
  },
  en: {
    introTitle: "Join one of our new groups",
    requirements: "Project Participation Requirements",
    applicationButton: "Go to application forms",
    permissionEyebrow: "REQUIRED DOCUMENT",
    permissionTitle: "Participation and parent permission form",
    permissionText:
      "Parents or guardians of students approved to participate from Türkiye must send the signed participation and permission form to the responsible teacher.",
    permissionLink: "Download the Türkiye Participation and Permission Form",
    permissionUrl:
      "http://www.turkswithoutborders.net/wordpress/wp-content/uploads/2023/11/katilim-izin-formu-TR.pdf",
    forms: {
      eyebrow: "APPLICATION FORMS",
      title: "Complete the application form that applies to you.",
      summary:
        "The Türkiye form collects teacher and school-group details; the U.S. form collects applicant, referrer, and parent information.",
      turkeyTitle: "Project Application from Türkiye",
      usTitle: "Project Application from the U.S.",
      turkeyRegion: "TÜRKİYE",
      usRegion: "UNITED STATES",
      teacherSection: "Applying teacher",
      schoolSection: "School information",
      studentsSection: "Participating students",
      applicantSection: "Applicant",
      referrerSection: "Referring person",
      parentSection: "Parent or guardian",
      firstName: "First name",
      lastName: "Last name",
      email: "Email address",
      phone: "Phone number",
      schoolName: "School name",
      province: "Province",
      provincePlaceholder: "Select a province",
      district: "District",
      principal: "Principal's full name",
      studentCount: "Number of students",
      ageGroup: "Age group",
      englishLevel: "English proficiency",
      levelPlaceholder: "Select a level",
      intermediate: "Intermediate",
      good: "Good",
      veryGood: "Very good",
      details: "Additional details",
      dateOfBirth: "Date of birth",
      state: "State",
      city: "City",
      statePlaceholder: "Select a state",
      consent:
        "I agree that the information provided may be used to evaluate this project application.",
      humanTitle: "I am human",
      humanHelp: "Check this box before submitting your application.",
      submit: "Submit Application",
      submitting: "Submitting...",
      thankYou: "Thank you!",
    },
    groups: [
      {
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
        title: "Parents and guardians",
        summary: "Steps required before a student begins the project",
        items: [
          "Parents or guardians of students in Türkiye must complete the Project Participation and Permission Form and give it to the responsible school teacher.",
          "Parents or guardians of students in the United States must complete the Project Participation Form and give it to their regional coordinator.",
        ],
      },
      {
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
        title: "Regional coordinators in the United States",
        summary: "Responsibilities of volunteers managing regional groups",
        items: [
          "Send the weekly topic headings and questions published on the website to every student in their group.",
          "Find an appropriate replacement when a student cannot attend; if that is not possible, notify the general coordinators at least one day in advance.",
        ],
      },
    ],
  },
} as const;

export function defaultSections(slug: string): Record<string, unknown> {
  const locale: Locale = slug.endsWith("-en") ? "en" : "tr";
  const base = slug.endsWith("-en") ? slug.slice(0, -3) : slug;
  if (base === "home") {
    return {
      home: ui[locale].home,
      navigation: ui[locale].nav,
      footer: ui[locale].footer,
      contact: {
        emailRecipients: "serpil_ingec@hotmail.com,ulkuumay@hotmail.com",
        emailLabel:
          locale === "tr"
            ? "Serpil İngeç ve Ülkü Umay'a e-posta gönder"
            : "Email Serpil İngeç and Ülkü Umay",
        emailTitle: locale === "tr" ? "E-posta gönder" : "Send an email",
        instagramUrl: "https://www.instagram.com/turks_without_borders/",
        instagramLabel:
          locale === "tr"
            ? "Turks Without Borders Instagram profilini aç"
            : "Open the Turks Without Borders Instagram profile",
      },
      topicsPage: ui[locale].topics,
    };
  }
  if (base === "bizim-hikayemiz") return { story: story[locale] };
  if (base === "nasil-calisiyoruz") return { how: how[locale] };
  if (base === "projeye-katilim") {
    return { participation: participation[locale] };
  }
  return {};
}

export function storySections(locale: Locale) {
  return story[locale];
}

export function howSections(locale: Locale) {
  return how[locale];
}

export function participationSections(locale: Locale) {
  return participation[locale];
}

export function managedSection<T>(
  sections: Record<string, unknown>,
  key: string,
  fallback: T,
): T {
  const value = sections[key];
  return value && typeof value === "object" ? (value as T) : fallback;
}
