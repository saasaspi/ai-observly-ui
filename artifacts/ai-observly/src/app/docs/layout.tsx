import { PublicLayout } from "@/components/public-layout";
import { DocsLayoutClient } from "./docs-layout-client";
import { getDocsNav } from "@/lib/sanity/docs";

export const metadata = {
  title: "Documentation - AI Observly",
  description: "Technical integration guide and API documentation for AI Observly.",
};

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
