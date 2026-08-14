import { client } from '@/lib/sanity/client'
import { POST_QUERY, RELATED_POSTS_QUERY, type Post, type PostSummary } from '@/lib/sanity/queries'
import { urlFor } from '@/lib/sanity/image'
import { SanityPortableText } from '@/components/sanity-portable-text'
import { PublicLayout } from '@/components/public-layout'
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

// ── Related post mini-card ────────────────────────────────────────────────────

function RelatedCard({ post }: { post: PostSummary }) {
  const imageUrl = post.coverImage
    ? urlFor(post.coverImage).width(400).height(220).fit('crop').auto('format').url()
    : null

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
            sizes="(max-width: 768px) 100vw, 33vw"
          />
        </div>
      ) : (
        <div className="w-full aspect-[16/9] bg-primary/5" />
      )}
      <div className="p-4">
        <p className="text-sm font-semibold font-outfit text-foreground group-hover:text-primary transition-colors line-clamp-2 mb-1">
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

  const [post, related]: [Post | null, PostSummary[]] = await Promise.all([
    client.fetch(POST_QUERY, { slug }, { next: { revalidate: 60 } }),
    client.fetch(
      RELATED_POSTS_QUERY,
      // We need the topic for related posts; fetch post first, but we do both optimistically.
      // If the post fetch returns null we'll handle it below.
      { topic: '', slug },
      { next: { revalidate: 60 } },
    ),
  ])

  if (!post) notFound()

  // Re-fetch related posts with the correct topic now that we have the post
  const relatedPosts: PostSummary[] = post.topic
    ? await client.fetch(
        RELATED_POSTS_QUERY,
        { topic: post.topic, slug },
        { next: { revalidate: 60 } },
      )
    : []

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

      {/* Cover image */}
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

      <div className="max-w-2xl mx-auto px-6 py-12 w-full">
        {/* Back link */}
        <Link
          href="/blog"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          All posts
        </Link>

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

        {/* Divider */}
        <div className="border-t border-border my-14" />

        {/* Related posts */}
        {relatedPosts.length > 0 && (
          <section className="mb-14">
            <h2 className="text-xl font-bold font-outfit mb-6 text-foreground">Related posts</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {relatedPosts.map((rp) => (
                <RelatedCard key={rp._id} post={rp} />
              ))}
            </div>
          </section>
        )}

        {/* CTA */}
        <div className="bg-primary/5 border border-primary/20 rounded-2xl p-8 text-center">
          <p className="text-sm font-medium text-primary mb-2">AI Observly</p>
          <h3 className="text-xl font-bold font-outfit text-foreground mb-3">
            Stop guessing. Start seeing your AI margins.
          </h3>
          <p className="text-muted-foreground text-sm mb-6 max-w-sm mx-auto">
            Know exactly which customers and features are eroding your margins — before you find out on the invoice.
          </p>
          <Link
            href="/signup"
            className="inline-flex items-center gap-2 h-11 px-6 rounded-lg bg-primary text-primary-foreground font-medium text-sm hover:opacity-90 hover:-translate-y-0.5 hover:shadow-md transition-all duration-200 shadow-sm"
          >
            Start monitoring now <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </PublicLayout>
  )
}
