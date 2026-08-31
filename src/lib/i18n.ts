import "server-only";

import { cookies } from "next/headers";

export type Locale = "tr" | "en";

export async function getLocale(): Promise<Locale> {
  const cookieStore = await cookies();
  return cookieStore.get("twb_locale")?.value === "en" ? "en" : "tr";
}

export function localizedSlug(slug: string, locale: Locale): string {
  return locale === "en" ? `${slug}-en` : slug;
}

export const ui = {
  tr: {
    nav: {
      story: "Hikâyemiz",
      how: "Nasıl Çalışır?",
      topics: "Haftalık Program ve Konular",
      join: "Katıl",
      admin: "Yönetim",
      login: "Giriş",
      mainMenu: "Ana menü",
      mobileMenu: "Mobil menü",
      openMenu: "Menüyü aç",
    },
    footer: {
      summary:
        "Dil pratiğini dostluğa, merakı kültürler arası bir köprüye dönüştürüyoruz.",
      explore: "Keşfet",
      contact: "İletişim",
      story: "Bizim Hikâyemiz",
      how: "Nasıl Çalışıyoruz",
      topics: "Haftalık Program ve Konular",
      join: "Projeye katıl",
      note: "Gençler için, gönüllülerle.",
    },
    home: {
      join: "Topluluğa katıl",
      how: "Nasıl çalışıyor?",
      trust: "İki kıta, tek sohbet topluluğu",
      weeklyTopic: "Bu haftanın konusu",
      live: "Canlı sohbet",
      safeGroups: "Güvenli küçük gruplar",
      brand: "Sınırsız Türkler",
      intro: "Bir dili konuşarak, bir kültürü paylaşarak öğren.",
      discover: "Hikâyemizi keşfet",
      values: [
        ["Kültürler arası", "Gündelik hayatı, gelenekleri ve yeni bakış açılarını paylaş."],
        ["Gerçek arkadaşlık", "Düzenli küçük gruplarda dinle, anlat ve birlikte geliş."],
        ["Özgüvenli İngilizce", "Not kaygısı olmadan, merak ettiğin konularda doğal konuş."],
      ],
      voices: "Gençlerin sesi",
      voicesTitle: "Her sohbet yeni bir pencere açıyor.",
      student: "Öğrenci",
      testimonials: [
        ["Yeni arkadaşlar tanımak ve onlarla İngilizce konuşabilmek harika bir duygu.", "Antalya, Türkiye", "AE"],
        ["İletişim kurarken birbirimize bir şeyler öğretmek ve öğrenmek hepimiz için çok değerli.", "Erzurum, Türkiye", "EY"],
        ["Biz Türkiye'nin kültürünü öğrenirken arkadaşlarımız da Amerika'nın kültürünü tanıyor.", "Seattle, Amerika", "SA"],
      ],
      newGroups: "Yeni gruplar açılıyor",
      cta: "Senin hikâyen hangi sohbetle başlayacak?",
      joinProject: "Projeye katıl",
      visualLabel: "Kıtalar arası bağlantı illüstrasyonu",
    },
    topics: {
      eyebrow: "Konuşma Konuları",
      title: "Her hafta yeni bir merakın peşinden git.",
      summary:
        "Görüşmeden önce haftanı seç, sorulara göz at ve fikirlerini İngilizce anlatmaya hazırlan.",
      week: "HAFTA",
      weekLabel: "Hafta",
      picker: "Hafta seçimi",
      questions: "konuşma sorusu",
      emptyTitle: "Henüz yayımlanmış bir hafta yok.",
      emptyAdmin: "Yukarıdaki içe aktarma düğmesiyle ilk Excel dosyanızı yükleyin.",
      emptyPublic: "Yeni konuşma konuları çok yakında burada olacak.",
    },
    join: {
      roles: [
        ["Türkiye'den öğrenci", "15 yaş ve üzerindeysen, öğretmenin tarafından seçildiysen ve veli iznin varsa aramıza katıl."],
        ["Amerika'dan öğrenci", "13 yaş ve üzerindeysen ve bölge koordinatörünün yönlendirmesi varsa Türkiye'deki arkadaşınla tanış."],
        ["Öğretmen veya gönüllü", "Bir gruba rehberlik et, haftalık görüşmeleri kolaylaştır ve gençlerin gelişimine destek ol."],
      ],
      apply: "Başvurunu başlat",
    },
  },
  en: {
    nav: {
      story: "Our Story",
      how: "How It Works",
      topics: "Weekly Program and Topics",
      join: "Join Us",
      admin: "Admin",
      login: "Log in",
      mainMenu: "Main menu",
      mobileMenu: "Mobile menu",
      openMenu: "Open menu",
    },
    footer: {
      summary:
        "Turning language practice into friendship and curiosity into a bridge between cultures.",
      explore: "Explore",
      contact: "Contact",
      story: "Our Story",
      how: "How It Works",
      topics: "Weekly Program and Topics",
      join: "Join the project",
      note: "For young people, powered by volunteers.",
    },
    home: {
      join: "Join the community",
      how: "How does it work?",
      trust: "Two continents, one conversation community",
      weeklyTopic: "This week's topic",
      live: "Live conversation",
      safeGroups: "Safe, small groups",
      brand: "Turks Without Borders",
      intro: "Learn a language by speaking. Discover a culture by sharing.",
      discover: "Discover our story",
      values: [
        ["Across cultures", "Share everyday life, traditions, and new perspectives."],
        ["Real friendship", "Listen, speak, and grow together in consistent small groups."],
        ["Confident English", "Speak naturally about what interests you, without worrying about grades."],
      ],
      voices: "Youth voices",
      voicesTitle: "Every conversation opens a new window.",
      student: "Student",
      testimonials: [
        ["Meeting new friends and being able to speak English with them is an amazing feeling.", "Antalya, Türkiye", "AE"],
        ["Communicating while teaching and learning from each other is valuable for all of us.", "Erzurum, Türkiye", "EY"],
        ["We learn about Turkish culture while our friends discover life in America.", "Seattle, USA", "SA"],
      ],
      newGroups: "New groups are opening",
      cta: "Which conversation will begin your story?",
      joinProject: "Join the project",
      visualLabel: "Illustration of a connection between continents",
    },
    topics: {
      eyebrow: "Conversation Topics",
      title: "Follow a new curiosity every week.",
      summary:
        "Choose your week, explore the questions, and prepare to share your ideas in English before your session.",
      week: "WEEK",
      weekLabel: "Week",
      picker: "Choose a week",
      questions: "conversation questions",
      emptyTitle: "No weeks have been published yet.",
      emptyAdmin: "Use the import button above to upload your first Excel file.",
      emptyPublic: "New conversation topics will be here soon.",
    },
    join: {
      roles: [
        ["Student in Türkiye", "Join us if you are 15 or older, selected by your teacher, and have permission from a parent or guardian."],
        ["Student in the United States", "If you are 13 or older and referred by a regional coordinator, meet your new conversation partner in Türkiye."],
        ["Teacher or volunteer", "Guide a group, facilitate weekly sessions, and support young people as they build confidence."],
      ],
      apply: "Start your application",
    },
  },
} as const;
