import { client } from '@/lib/sanity/client'
import { POST_QUERY, RECOMMENDED_POSTS_QUERY, type Post, type PostSummary } from '@/lib/sanity/queries'
import { urlFor } from '@/lib/sanity/image'
import { SanityPortableText } from '@/components/sanity-portable-text'
import { TableOfContents } from '@/components/table-of-contents'
import { PublicLayout } from '@/components/public-layout'
import { extractToc } from '@/lib/sanity/toc'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { ArrowLeft, ArrowRight } from 'lucide-react'

export const revalidate = 60

// ── Helpers ──────────────────────────────────────────────────────────────────

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })
}

const TOPIC_COLORS: Record<string, string> = {
  'Cost & Margin Management': 'bg-primary/10 text-primary',
  'Unit Economics': 'bg-emerald-50 text-emerald-700',
  'Comparisons': 'bg-violet-50 text-violet-700',
  'Data Reports': 'bg-amber-50 text-amber-700',
}

// ── Metadata ─────────────────────────────────────────────────────────────────

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
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

// ── Recommended sidebar card ──────────────────────────────────────────────────

function RecommendedCard({ post }: { post: PostSummary }) {
  const imageUrl = post.coverImage
    ? urlFor(post.coverImage).width(560).height(315).fit('crop').auto('format').url()
    : null

  const topicColorCls = post.topic
    ? (TOPIC_COLORS[post.topic] ?? 'bg-muted text-muted-foreground')
    : 'bg-muted text-muted-foreground'

  return (
    <Link
      href={`/blog/${post.slug}`}
      className="group flex flex-col bg-card border border-border rounded-xl overflow-hidden hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
    >
      {imageUrl ? (
        <div className="relative w-full aspect-[16/9] overflow-hidden bg-muted">
          <Image
            src={imageUrl}
            alt={post.title}
            fill
            className="object-cover group-hover:scale-[1.02] transition-transform duration-300"
            sizes="(max-width: 1024px) 100vw, 280px"
          />
        </div>
      ) : (
        <div className="w-full aspect-[16/9] bg-primary/5" />
      )}
      <div className="p-3.5">
        {post.topic && (
          <span className={`inline-block text-[10px] font-semibold px-2 py-0.5 rounded-full mb-2 ${topicColorCls}`}>
            {post.topic}
          </span>
        )}
        <p className="text-sm font-semibold font-outfit text-foreground group-hover:text-primary transition-colors line-clamp-2 leading-snug mb-1.5">
          {post.title}
        </p>
        <p className="text-xs text-muted-foreground">{formatDate(post.publishedAt)}</p>
      </div>
    </Link>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params

  const [post, candidatePosts]: [Post | null, PostSummary[]] = await Promise.all([
    client.fetch(POST_QUERY, { slug }, { next: { revalidate: 60 } }),
    client.fetch(RECOMMENDED_POSTS_QUERY, { slug }, { next: { revalidate: 60 } }),
  ])

  if (!post) notFound()

  // Sort: same-topic first, then newest — take up to 4
  const sameTopic = candidatePosts.filter((p) => p.topic === post.topic)
  const others = candidatePosts.filter((p) => p.topic !== post.topic)
  const recommended = [...sameTopic, ...others].slice(0, 4)

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

  const topicColorCls = post.topic
    ? (TOPIC_COLORS[post.topic] ?? 'bg-muted text-muted-foreground')
    : ''

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

      {/* Three-column layout */}
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 py-12 w-full">
        {/* Back link */}
        <Link
          href="/blog"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          All posts
        </Link>

        <div
          className={`grid gap-x-10 gap-y-12 ${
            hasToC
              ? 'grid-cols-1 lg:grid-cols-[200px_minmax(0,1fr)_260px]'
              : 'grid-cols-1 lg:grid-cols-[minmax(0,1fr)_260px]'
          }`}
        >
          {/* ── Left: Table of Contents (hidden on mobile, stacks below article) ── */}
          {hasToC && (
            <aside className="hidden lg:block">
              <TableOfContents entries={tocEntries} />
            </aside>
          )}

          {/* ── Center: Article body ── */}
          <article className="min-w-0">
            {/* Meta */}
            <div className="flex flex-wrap items-center gap-3 mb-4">
              {post.topic && (
                <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${topicColorCls}`}>
                  {post.topic}
                </span>
              )}
              <span className="text-sm text-muted-foreground">{formatDate(post.publishedAt)}</span>
            </div>

            {/* Title */}
            <h1 className="text-3xl md:text-4xl font-bold font-outfit tracking-tight text-foreground mb-10 leading-tight">
              {post.title}
            </h1>

            {/* Body */}
            {post.body && post.body.length > 0 ? (
              <div className="prose-container">
                <SanityPortableText value={post.body} />
              </div>
            ) : (
              <p className="text-muted-foreground italic">Content coming soon.</p>
            )}

            {/* CTA */}
            <div className="mt-16 bg-primary/5 border border-primary/20 rounded-2xl p-8 text-center">
              <p className="text-sm font-medium text-primary mb-2">AI Observly</p>
              <h3 className="text-xl font-bold font-outfit text-foreground mb-3">
                Not sure where your AI budget is going?
              </h3>
              <p className="text-muted-foreground text-sm mb-6 max-w-sm mx-auto">
                Take our free 90-second quiz to find your AI cost blind spots — see if you know what you're really spending, and whether it's profitable.
              </p>
              <Link
                href="/blind-spot-quiz"
                className="inline-flex items-center gap-2 h-11 px-6 rounded-lg bg-primary text-primary-foreground font-medium text-sm hover:opacity-90 hover:-translate-y-0.5 hover:shadow-md transition-all duration-200 shadow-sm"
              >
                Take the free quiz <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </article>

          {/* ── Right: Recommended Articles ── */}
          <aside>
            <div className="lg:sticky lg:top-24 lg:self-start">
              {recommended.length > 0 && (
                <>
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-4">
                    Recommended Articles
                  </p>
                  <div className="flex flex-col gap-4">
                    {recommended.map((rp) => (
                      <RecommendedCard key={rp._id} post={rp} />
                    ))}
                  </div>
                </>
              )}
            </div>
          </aside>
        </div>
      </div>
    </PublicLayout>
  )
}
