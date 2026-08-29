import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronRight, FileText } from "lucide-react";
import { getDocBySlug, getDocsNav } from "@/lib/sanity/docs";
import { DocsPortableText } from "@/components/docs/docs-portable-text";
import { DocsToc } from "@/components/docs/docs-toc";
import { DocsPager } from "@/components/docs/docs-pager";
import type { Metadata } from "next";

type DocPageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: DocPageProps): Promise<Metadata> {
  const { slug } = await params;
  const doc = await getDocBySlug(slug);

  if (!doc) return {};

  return {
    title: `${doc.title} | AI Observly Docs`,
    description: doc.excerpt,
  };
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
        {/* Breadcrumbs */}
        <nav className="flex items-center gap-1.5 text-sm text-muted-foreground mb-8">
          <Link href="/docs" className="hover:text-foreground transition-colors">
            Docs
          </Link>
          <ChevronRight className="w-4 h-4" />
          {doc.category ? (
            <>
              <span>{doc.category.title}</span>
              <ChevronRight className="w-4 h-4" />
            </>
          ) : null}
          <span className="text-foreground font-medium truncate">{doc.title}</span>
        </nav>

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
          <DocsPortableText value={doc.body} />
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
            <h3 className="text-xl font-semibold mb-6">Related Articles</h3>
            <div className="grid sm:grid-cols-2 gap-4">
              {doc.relatedDocs.map(related => (
                <Link
                  key={related._id}
                  href={`/docs/${related.slug}`}
                  className="flex items-start gap-3 p-4 rounded-xl border border-border bg-card hover:bg-muted/50 transition-colors group"
                >
                  <FileText className="w-5 h-5 text-muted-foreground group-hover:text-primary mt-0.5 shrink-0" />
                  <div>
                    <h4 className="font-medium text-foreground group-hover:text-primary transition-colors">
                      {related.title}
                    </h4>
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
