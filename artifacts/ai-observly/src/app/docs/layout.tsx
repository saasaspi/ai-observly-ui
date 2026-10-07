import { PublicLayout } from "@/components/public-layout";
import { DocsLayoutClient } from "./docs-layout-client";
import { getDocsNav } from "@/lib/sanity/docs";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata("/docs");
export const revalidate = 60;

export default async function DocsLayout({ children }: { children: any }) {
  const navData = await getDocsNav();

  return (
    <PublicLayout>
      <DocsLayoutClient navData={navData}>
        {children}
      </DocsLayoutClient>
    </PublicLayout>
  );
}
