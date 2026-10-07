import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";
import { PublicPageSeo } from "@/components/seo";

export const metadata: Metadata = pageMetadata("/spend-checkup");

export default function SpendCheckupLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <><PublicPageSeo path="/spend-checkup" />{children}</>;
}
