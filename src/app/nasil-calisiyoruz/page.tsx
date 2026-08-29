import type { Metadata } from "next";
import { ContentPage } from "@/components/content-page";

export const metadata: Metadata = { title: "Nasıl Çalışıyoruz" };

export default function HowItWorksPage() {
  return <ContentPage slug="nasil-calisiyoruz" />;
}
