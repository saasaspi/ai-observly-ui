import { client } from '@/lib/sanity/client'
import { POST_QUERY, type Post } from '@/lib/sanity/queries'
import { urlFor } from '@/lib/sanity/image'
import { SanityPortableText } from '@/components/sanity-portable-text'
import { TableOfContents } from '@/components/table-of-contents'
import { BlogCta } from '@/components/blog-cta'
import { PublicLayout } from '@/components/public-layout'
import { extractToc } from '@/lib/sanity/toc'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { ArrowLeft } from 'lucide-react'
import { LaunchArticle } from '@/components/launch-article'
import { LAUNCH_POST } from '@/lib/new-features'
import { BlogShare } from '@/components/blog/blog-share'
import { BlogMobileToc } from '@/components/blog/blog-mobile-toc'
import { NextReads, TopicBadge } from '@/components/blog/blog-cards'
import {
  NEXT_READS_QUERY, formatDate, minutesFromText, portableTextToPlain,
  type BlogCardData, type PostWithLength,
} from '@/lib/blog-utils'

export const revalidate = 60

// ── Helpers ──────────────────────────────────────────────────────────────────

// ── Metadata ─────────────────────────────────────────────────────────────────

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  if (slug === LAUNCH_POST.slug) {
    return {
      title: LAUNCH_POST.title,
      description: LAUNCH_POST.description,
      openGraph: { type: 'article', title: LAUNCH_POST.title, description: LAUNCH_POST.description },
    }
  }
  const post: Post | null = await client.fetch(POST_QUERY, { slug }, { next: { revalidate: 60 } })
  if (!post) return {}

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://ai-observly.replit.app'
  const coverUrl = post.coverImage
    ? urlFor(post.coverImage).width(1200).height(630).fit('crop').auto('format').url()
    : undefined

  return {
    title: post.seoTitle || post.title,
    description: post.metaDescription,
    alternates: {
      canonical: `${siteUrl}/blog/${slug}`,
    },
    openGraph: {
      type: 'article',
      title: post.seoTitle || post.title,
      description: post.metaDescription,
      publishedTime: post.publishedAt,
      images: coverUrl ? [{ url: coverUrl, width: 1200, height: 630 }] : undefined,
    },
  }
}

function toCard(p: PostWithLength): BlogCardData {
  return {
    key: p._id,
    href: `/blog/${p.slug}`,
    title: p.title,
    description: p.metaDescription,
    topic: p.topic,
    date: p.publishedAt,
    minutes: minutesFromText(portableTextToPlain(p.body)),
    imageUrl: p.coverImage ? urlFor(p.coverImage).width(800).height(450).fit('crop').auto('format').url() : null,
  }
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params

  if (slug === LAUNCH_POST.slug) {
    const latest: PostWithLength[] = await client.fetch(NEXT_READS_QUERY, { slug }, { next: { revalidate: 60 } })
    return <LaunchArticle nextReads={latest.slice(0, 3).map(toCard)} />
  }

  const [post, candidatePosts]: [Post | null, PostWithLength[]] = await Promise.all([
    client.fetch(POST_QUERY, { slug }, { next: { revalidate: 60 } }),
    client.fetch(NEXT_READS_QUERY, { slug }, { next: { revalidate: 60 } }),
  ])

  if (!post) notFound()

  // Sort: same-topic first, then newest — take up to 4
  const sameTopic = candidatePosts.filter((p) => p.topic === post.topic)
  const others = candidatePosts.filter((p) => p.topic !== post.topic)
  const recommended = [...sameTopic, ...others].slice(0, 3).map(toCard)
  const minutes = minutesFromText(portableTextToPlain(post.body))

  // Table of contents from body headings
  const tocEntries = post.body && post.body.length > 0 ? extractToc(post.body) : []
  const hasToC = tocEntries.length > 0

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://ai-observly.replit.app'
  const coverUrl = post.coverImage
    ? urlFor(post.coverImage).width(1600).height(640).fit('crop').auto('format').url()
    : null

  // JSON-LD Article structured data
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title,
    datePublished: post.publishedAt,
    publisher: {
      '@type': 'Organization',
      name: 'AI Observly',
      url: siteUrl,
    },
    ...(coverUrl ? { image: coverUrl } : {}),
    url: `${siteUrl}/blog/${slug}`,
  }

  return (
    <PublicLayout>
      {/* JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Cover image — full width */}
      {coverUrl && (
        <div className="relative w-full h-64 md:h-96 overflow-hidden bg-muted">
          <Image
            src={coverUrl}
            alt={post.title}
            fill
            priority
            className="object-cover"
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background/60 to-transparent" />
        </div>
      )}

      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 py-10 md:py-12 w-full blog-article">
        <Link
          href="/blog"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8"
        >
          <ArrowLeft className="w-4 h-4" aria-hidden="true" />
          All posts
        </Link>

        <div
          className={`grid gap-x-12 gap-y-10 justify-center ${
            hasToC ? 'grid-cols-1 lg:grid-cols-[220px_minmax(0,44rem)]' : 'grid-cols-1 lg:grid-cols-[minmax(0,44rem)]'
          }`}
        >
          {hasToC && (
            <aside className="hidden lg:block lg:row-span-1">
              <TableOfContents entries={tocEntries} />
            </aside>
          )}

          <article className="min-w-0">
            <header className="mb-8">
              <div className="flex flex-wrap items-center gap-x-3 gap-y-2 mb-4">
                {post.topic && <TopicBadge topic={post.topic} />}
                <span className="text-sm text-muted-foreground">{formatDate(post.publishedAt)}</span>
                {minutes && <span className="text-sm text-muted-foreground">{minutes} min read</span>}
              </div>
              <h1 className="text-3xl md:text-[2.75rem] font-bold font-outfit tracking-tight text-foreground mb-6 leading-[1.15]">
                {post.title}
              </h1>
              <BlogShare />
            </header>

            <BlogMobileToc entries={tocEntries} />

            {/* Body */}
            {post.body && post.body.length > 0 ? (
              <div className="prose-container blog-prose">
                <SanityPortableText value={post.body} />
              </div>
            ) : (
              <p className="text-muted-foreground italic">Content coming soon.</p>
            )}

            {/* FAQs */}
            {post.faq && post.faq.length > 0 && (
              <section className="mt-16 border-t border-border pt-12" aria-labelledby="blog-faq-heading">
                <p className="text-sm font-semibold uppercase tracking-widest text-primary mb-3">FAQs</p>
                <h2
                  id="blog-faq-heading"
                  className="text-2xl md:text-3xl font-bold font-outfit text-foreground mb-6"
                >
                  Frequently asked questions
                </h2>
                <div className="space-y-3">
                  {post.faq.map((faq, index) => (
                    <details
                      key={faq._key ?? `${faq.question}-${index}`}
                      className="group rounded-xl border border-border bg-card open:shadow-sm"
                    >
                      <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-5 py-4 font-semibold text-foreground marker:hidden">
                        <span>{faq.question}</span>
                        <span
                          aria-hidden="true"
                          className="shrink-0 text-2xl font-normal leading-none text-primary transition-transform duration-200 group-open:rotate-45"
                        >
                          +
                        </span>
                      </summary>
                      <div className="border-t border-border px-5 py-4">
                        <p className="whitespace-pre-line leading-relaxed text-muted-foreground">{faq.answer}</p>
                      </div>
                    </details>
                  ))}
                </div>
              </section>
            )}

            {/* CTA */}
            <BlogCta />
          </article>

        </div>
        <NextReads posts={recommended} />
      </div>
    </PublicLayout>
  )
}
