import type { Metadata } from "next";
import { Manrope, Newsreader } from "next/font/google";
import { Footer } from "@/components/footer";
import { Header } from "@/components/header";
import { getLocale } from "@/lib/i18n";
import "./globals.css";

const manrope = Manrope({
  subsets: ["latin", "latin-ext"],
  variable: "--font-sans",
});
const newsreader = Newsreader({
  subsets: ["latin", "latin-ext"],
  variable: "--font-serif",
});

export const metadata: Metadata = {
  title: {
    default: "Turks Without Borders",
    template: "%s · Turks Without Borders",
  },
  description:
    "Türkiye ve Amerika'daki gençleri İngilizce sohbet ve kültür paylaşımıyla buluşturan gönüllü topluluk.",
};

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const locale = await getLocale();
  return (
    <html lang={locale}>
      <body className={`${manrope.variable} ${newsreader.variable}`}>
        <Header locale={locale} />
        <main>{children}</main>
        <Footer locale={locale} />
      </body>
    </html>
  );
}
