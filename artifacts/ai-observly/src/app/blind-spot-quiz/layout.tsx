import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";
import { PublicPageSeo } from "@/components/seo";

export const metadata: Metadata = pageMetadata("/blind-spot-quiz");

export default function BlindSpotQuizLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <><PublicPageSeo path="/blind-spot-quiz" />{children}</>;
}
