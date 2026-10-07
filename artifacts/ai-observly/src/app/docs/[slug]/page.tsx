import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronRight, FileText } from "lucide-react";
import { getDocBySlug, getDocsNav } from "@/lib/sanity/docs";
import { DocsPortableText } from "@/components/docs/docs-portable-text";
import { DocsToc } from "@/components/docs/docs-toc";
import { DocsPager } from "@/components/docs/docs-pager";
import type { Metadata } from "next";
import { pageMetadata, SITE_URL, ORGANIZATION_ID } from "@/lib/seo";
import { Breadcrumbs, JsonLd } from "@/components/seo";
import { urlFor } from "@/lib/sanity/image";
import { portableTextToPlain } from "@/lib/blog-utils";
export const revalidate = 60;

function docImage(doc: { coverImage?: unknown; body?: unknown[] }) {
  const image = doc.body?.find(block => block && typeof block === "object" && "_type" in block &&
    ["image", "docInlineImage"].includes(String(block._type)));
  return doc.coverImage || (image && typeof image === "object" && "image" in image ? image.image : image);
}

type DocPageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: DocPageProps): Promise<Metadata> {
  const { slug } = await params;
  const doc = await getDocBySlug(slug);

  if (!doc) return {};

  const source = docImage(doc);
  const image = source ? urlFor(source).width(1200).height(630).fit("crop").url() : undefined;
  return pageMetadata(`/docs/${slug}`, { title: doc.seoTitle || doc.title,
    description: doc.metaDescription || doc.excerpt || portableTextToPlain(doc.body).slice(0, 159) || `AI Observly documentation: ${doc.title}`,
    image, article: true, published: doc._createdAt, modified: doc._updatedAt });
}

export default async function DocPage({ params }: DocPageProps) {
  const { slug } = await params;
  
  const doc = await getDocBySlug(slug);

  if (!doc) {
    notFound();
  }

  // Get navigation data to determine prev/next links
  const navData = await getDocsNav();
  
  const categoryDocs = doc.category
    ? navData.categories.find((category) => category._id === doc.category?._id)?.docs ?? []
    : navData.uncategorized;
  const currentIndex = categoryDocs.findIndex((item) => item.slug === slug);
  const prevDoc = currentIndex > 0 ? categoryDocs[currentIndex - 1] : undefined;
  const nextDoc =
    currentIndex !== -1 && currentIndex < categoryDocs.length - 1
      ? categoryDocs[currentIndex + 1]
      : undefined;

  return (
    <div className="flex flex-col xl:flex-row gap-8 w-full max-w-7xl mx-auto py-8">
      {/* Article Content */}
      <article className="flex-1 min-w-0" id="docs-content">
        <JsonLd data={{ "@context": "https://schema.org", "@type": "TechArticle", headline: doc.title,
          description: doc.excerpt, url: `${SITE_URL}/docs/${slug}`, datePublished: doc._createdAt, dateModified: doc._updatedAt,
          author: { "@type": "Organization", "@id": ORGANIZATION_ID, name: "AI Observly" },
          publisher: { "@id": ORGANIZATION_ID }, image: docImage(doc) ? urlFor(docImage(doc)).width(1200).height(630).fit("crop").url() : `${SITE_URL}/social/docs/${slug}` }} />
        {/* Breadcrumbs */}
        <Breadcrumbs items={[{ name: "Home", path: "/" }, { name: "Docs", path: "/docs" }, { name: doc.title, path: `/docs/${slug}` }]} />

        {/* Header */}
        <header className="mb-10">
          <h1 className="text-4xl font-bold font-outfit text-foreground tracking-tight mb-4">
            {doc.title}
          </h1>
          {doc.excerpt && (
            <p className="text-xl text-muted-foreground leading-relaxed">
              {doc.excerpt}
            </p>
          )}
        </header>

        {/* Portable Text Content */}
        {doc.body && doc.body.length > 0 ? (
              <DocsPortableText value={doc.body} title={doc.title} />
        ) : (
          <div className="py-12 text-center border border-dashed border-border rounded-xl bg-muted/20">
            <p className="text-muted-foreground">This document is currently being written.</p>
          </div>
        )}

        {/* Previous and next pages in the same category */}
        <DocsPager prev={prevDoc} next={nextDoc} />

        {/* Related Articles */}
        {doc.relatedDocs && doc.relatedDocs.length > 0 && (
          <div className="mt-16 pt-8 border-t border-border">
            <h2 className="text-xl font-semibold mb-6">Related Articles</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              {doc.relatedDocs.map(related => (
                <Link
                  key={related._id}
                  href={`/docs/${related.slug}`}
                  className="flex items-start gap-3 p-4 rounded-xl border border-border bg-card hover:bg-muted/50 transition-colors group"
                >
                  <FileText className="w-5 h-5 text-muted-foreground group-hover:text-primary mt-0.5 shrink-0" />
                  <div>
                    <h3 className="font-medium text-foreground group-hover:text-primary transition-colors">
                      {related.title}
                    </h3>
                    {related.excerpt && (
                      <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                        {related.excerpt}
                      </p>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </article>

      {/* Right Sidebar - ToC */}
      <aside className="hidden xl:block w-64 shrink-0">
        <div className="sticky top-[7rem] max-h-[calc(100vh-8rem)] overflow-y-auto pr-4">
          <DocsToc />
        </div>
      </aside>
    </div>
  );
}
