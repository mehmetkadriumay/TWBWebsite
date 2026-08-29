import type { Metadata } from "next";
import { ContentPage } from "@/components/content-page";

export const metadata: Metadata = { title: "Bizim Hikâyemiz" };

export default function StoryPage() {
  return <ContentPage slug="bizim-hikayemiz" />;
}
