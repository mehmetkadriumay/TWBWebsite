import type { ContentPage } from "@/lib/types";

export const legacyHowItWorksBodies = {
  tr: "Türkiye ve Amerika'daki profesyonel eğitimcilik geçmişine sahip gönüllüler programı koordine eder. Öğrenciler yaşlarına ve seviyelerine uygun küçük gruplara eşleştirilir.\n\nHer hafta yeni konuşma konusu ve yönlendirici sorular yayımlanır. Öğrenciler önceden hazırlanır, belirlenen saatte görüntülü görüşmeye katılır ve günlük İngilizceyle fikirlerini paylaşır.\n\nÖğretmenler ve koordinatörler güvenli ortamı gözetir; gençler ise grup kararlarına katılarak sorumluluk, iletişim ve liderlik becerilerini geliştirir.",
  en: "Volunteer coordinators with professional education experience in Türkiye and the United States run the program. Students are matched in small groups suited to their age and language level.\n\nA new topic and guiding questions are published every week. Students prepare in advance, join a video call at the scheduled time, and share their ideas in everyday English.\n\nTeachers and coordinators maintain a safe environment, while students take part in group decisions and develop responsibility, communication, and leadership skills.",
} as const;

export const legacyParticipationBodies = {
  tr: "Katılımcılar haftalık görüşmelere düzenli devam etmeyi, konuşma konularına hazırlanmayı ve görüntülü görüşmelere katılmayı kabul eder.\n\nTürkiye'deki öğrenciler öğretmenleri tarafından seçilir ve veli izniyle katılır. Amerika'daki öğrenciler bölge koordinatörleri tarafından aday gösterilir. Tüm katılımcılar güvenli iletişim kurallarına uyar; kişisel bilgilerini izinsiz paylaşmaz, politik veya uygunsuz içerik kullanmaz.\n\nÖğretmen ve koordinatörler program saatlerini ailelere bildirir, haftalık konuları öğrencilere ulaştırır ve görüşmeleri yönlendirir. Katılım için ekibimize e-posta ile ulaşabilirsiniz.",
  en: "Participants commit to attending weekly sessions, preparing the conversation topics, and joining by video whenever possible.\n\nStudents in Türkiye are selected by their teachers and join with permission from a parent or guardian. Students in the United States are nominated by regional coordinators. Everyone follows safe communication rules, protects personal information, and avoids political or inappropriate content.\n\nTeachers and coordinators share schedules with families, distribute weekly topics, and facilitate each conversation. Email our team to begin your application.",
} as const;

export const currentParticipationBodies = {
  tr: "Başvuru yapmadan önce aşağıdaki katılım koşullarını dikkatle inceleyin. Koşullar size veya grubunuza uygunsa sayfanın sonundaki Türkiye ya da Amerika Birleşik Devletleri başvuru formunu doldurun.\n\nTürkiye başvurusu öğretmen, okul ve katılacak öğrenci grubu bilgilerini; Amerika Birleşik Devletleri başvurusu ise öğrenci, referans veren kişi ve veli bilgilerini toplar.\n\nGönderilen başvurular proje ekibi tarafından yönetim panelinde değerlendirilir. Onaylanan başvurular uygun Türk öğrenci grubu veya yabancı öğrenci kaydına dönüştürülür.",
  en: "Before applying, carefully review the participation requirements below. If the conditions fit you or your group, complete the Türkiye or United States application form at the bottom of the page.\n\nThe Türkiye application collects teacher, school, and participating student-group information. The United States application collects applicant, referrer, and parent or guardian information.\n\nThe project team reviews submitted applications in the administration panel. Approved applications become the appropriate Turkish student-group or foreign-student record.",
} as const;

export const defaultPages: ContentPage[] = [
  {
    slug: "home",
    title: "Kıtalar arası dostluk ve kültür köprüsü kuruyoruz.",
    eyebrow: "Sınırlar olmadan öğren",
    summary:
      "Gençlerin gerçek sohbetlerle İngilizce pratiği yaptığı, kültürleri tanıdığı ve kalıcı dostluklar kurduğu gönüllü bir öğrenme topluluğu.",
    body:
      "Biz Amerika Birleşik Devletleri'nde yaşayan gençlerle Türkiye'de İngilizce öğrenen öğrencileri bir araya getiriyoruz. Haftalık, güvenli ve yönlendirilmiş görüşmelerle dil öğrenimini bir dersten ortak bir deneyime dönüştürüyoruz.",
  },
  {
    slug: "bizim-hikayemiz",
    title: "Bir grupla başlayan, iki ülkeye yayılan hikâye",
    eyebrow: "Bizim Hikâyemiz",
    summary:
      "Amerika Birleşik Devletleri'nde yaşayan Türk gençleri ile Türkiye'nin farklı şehirlerindeki öğrenciler arasında bir köprü kurmak için yola çıktık.",
    body:
      "Turks Without Borders, Mart 2020'de Seattle'da tek bir grupla faaliyete başladı. Yalova Çiftlikköy Taşköprü Ortaokulu ile yürüttüğümüz pilot dönemin olumlu sonuçları programın bugünkü yapısını oluşturdu.\n\nİlk yılın ardından Amerika'nın farklı eyaletlerindeki Türk toplulukları da programa katıldı. Böylece Amerika'daki gençler kültürel bağlarını korurken Türkiye'deki arkadaşları günlük İngilizce kalıplarıyla pratik yapıyor; tüm katılımcılar birlikte zaman ayırmayı, dinlemeyi ve yardımlaşmayı öğreniyor.\n\nVizyonumuz; güçlü bir yabancı dil, kültürel merak ve özgüvenle dünya ile entegre, geleceğe hazır bir gençliğin temelini atmak.",
  },
  {
    slug: "nasil-calisiyoruz",
    title: "Her hafta, gerçek bir sohbet etrafında buluşuyoruz",
    eyebrow: "Nasıl Çalışıyoruz",
    summary:
      "Mektup arkadaşlığı fikrini günümüz teknolojisiyle yüz yüze, güvenli ve düzenli görüşmelere dönüştürüyoruz.",
    body:
      "Turks Without Borders, geçmişte yabancı dil pratiğini güçlendirmek için okullarda kullanılan mektup arkadaşlığı yaklaşımından ilham alır ve bu yaklaşımı günümüz teknolojisiyle yüz yüze çevrim içi görüşmelere dönüştürür. Proje, Amerika Birleşik Devletleri ve Washington Eyaleti yasalarına göre kurulmuş kâr amacı gütmeyen TACAWA'nın (Turkish American Cultural Association of Washington) Sosyal Dayanışma Ağı bünyesinde faaliyet gösterir.\n\nProgramı, Türkiye ve Amerika Birleşik Devletleri'nde profesyonel eğitimcilik deneyimi bulunan ve projeyi gönüllü olarak başlatıp yürüten üyeler yönetir. Belirlenmiş kurallar ve proje ekibinin gözetimi altında, Amerika'nın farklı eyaletlerinde yaşayan Türk ailelerin çocukları ile Türkiye'nin farklı illerindeki öğrenciler gönüllü olarak bir araya gelir. Görüşmeler, önceden hazırlanan haftalık konular üzerinden karşılıklı İngilizce konuşmalar şeklinde gerçekleştirilir.\n\nProjeye katılan gençler demokratik bir çalışma ortamında kararları birlikte alır, bağlı oldukları grupların yönünü belirler, elde edilen sonuçları değerlendirir ve programın sürekli gelişmesine katkıda bulunur. Bu yaklaşımın gençlerin kişisel gelişimini ve eğitimci bakış açısını güçlendirdiğini gözlemliyoruz. Gelecekte başarılı olabilmeleri için iletişim becerilerinin kritik olduğuna inanıyor ve gençlere daha fazla sorumluluk veriyoruz. Amerika'daki gençlerin Türkiye'deki arkadaşlarıyla günlük İngilizce üzerinden bağ kurması ve yaratıcı fikirlerini paylaşması; Türkiye'deki gençlerin ise yabancı dil öğrenmenin eğlenceli yönünü keşfetmesi, dili sevmesi ve İngilizceyi yalnızca bir ders değil, kişisel ve profesyonel yaşamlarında başarılarını destekleyecek bir araç olarak görmesi programın temel amaçları arasındadır.",
  },
  {
    slug: "projeye-katilim",
    title: "Yeni bir konuşmayla yeni bir bağ kur",
    eyebrow: "Projeye Katılım",
    summary:
      "Türkiye'den öğrenciler, Amerika'dan gençler, öğretmenler ve gönüllü koordinatörler için yeni gruplar açıyoruz.",
    body: currentParticipationBodies.tr,
  },
  {
    slug: "home-en",
    title: "Building a bridge of friendship and culture across continents.",
    eyebrow: "Learn without borders",
    summary:
      "A volunteer learning community where young people practice English through real conversations, discover cultures, and build lasting friendships.",
    body:
      "We connect young people living in the United States with students learning English in Türkiye. Through weekly, guided, and safe conversations, language learning becomes a shared experience rather than just another class.",
  },
  {
    slug: "bizim-hikayemiz-en",
    title: "A story that began with one group and grew across two countries",
    eyebrow: "Our Story",
    summary:
      "We set out to build a bridge between Turkish youth living in the United States and students in cities throughout Türkiye.",
    body:
      "Turks Without Borders began in Seattle in March 2020 with a single group. The positive results from our pilot with Yalova Çiftlikköy Taşköprü Middle School shaped the program we run today.\n\nAfter a successful first year, Turkish communities in other US states joined the program. Young people in America maintain their cultural ties while their friends in Türkiye practice everyday English; everyone learns to make time for one another, listen, and help each other grow.\n\nOur vision is to help build a generation that is globally connected and ready for the future through strong language skills, cultural curiosity, and confidence.",
  },
  {
    slug: "nasil-calisiyoruz-en",
    title: "Every week, we meet around a real conversation",
    eyebrow: "How It Works",
    summary:
      "We transform the traditional pen-pal idea into safe, consistent, face-to-face conversations using today's technology.",
    body:
      "Turks Without Borders draws inspiration from the pen-pal model once used in schools to reinforce foreign-language learning and transforms it into face-to-face online conversations through today's technology. The project operates through the Social Solidarity Network of TACAWA, the Turkish American Cultural Association of Washington, a nonprofit organization established under United States and Washington State law.\n\nThe program is led by volunteers with professional education experience in Türkiye and the United States who created and continue to manage the project. Within established rules and under the project team's supervision, children of Turkish families living in several U.S. states meet voluntarily with students living in different provinces of Türkiye. Their sessions are conducted as two-way English conversations based on topics prepared in advance.\n\nYoung participants work in a democratic environment where they make decisions together, help guide their groups, examine outcomes, and continually improve the program. We have observed that this approach makes a significant contribution to their personal development and educational perspective. Because strong communication skills are essential to their future success, the project gives young people greater responsibility. Its goals include helping youth in the United States connect with friends in Türkiye through everyday English and share creative ideas, while students in Türkiye discover and enjoy the engaging side of language learning and recognize that English is not merely a school subject but a tool that can support success throughout their personal and professional lives.",
  },
  {
    slug: "projeye-katilim-en",
    title: "Start a new connection with one conversation",
    eyebrow: "Join the Project",
    summary:
      "We are opening new groups for students in Türkiye, young people in the United States, teachers, and volunteer coordinators.",
    body: currentParticipationBodies.en,
  },
];

export const seedTopics = [
  "What is the best activity to do while camping?",
  "How many times have you gone camping? Did you enjoy it?",
  "Where is the best place to go camping in your country?",
  "What are the four most important things to bring camping?",
  "How much luxury is too much when you go camping?",
  "Have you ever camped in extreme weather?",
  "What is the best thing about camping? What is the worst?",
  "What advice would you give a first-time camper?",
  "What is the best food to bring on a camping trip?",
];
