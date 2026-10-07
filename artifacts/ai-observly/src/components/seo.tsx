import Link from "next/link";
import { applicationSchema, breadcrumbSchema } from "@/lib/seo";

export function JsonLd({ data }: { data: unknown }) {
  if (!data) return null;
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }} />;
}

export function Breadcrumbs({ items }: { items: { name: string; path: string }[] }) {
  return <>
    <JsonLd data={breadcrumbSchema(items)} />
    <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground mb-6">
      {items.map((item, i) => <span key={item.path} className="inline-flex items-center gap-2">
        {i > 0 && <span aria-hidden="true">/</span>}
        {i === items.length - 1 ? <span aria-current="page">{item.name}</span> : <Link href={item.path} className="hover:text-primary underline-offset-4 hover:underline">{item.name}</Link>}
      </span>)}
    </nav>
  </>;
}

export function PublicPageSeo({ path }: { path: string }) {
  return <JsonLd data={applicationSchema(path)} />;
}
