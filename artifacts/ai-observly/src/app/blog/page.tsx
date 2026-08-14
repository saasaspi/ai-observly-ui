import { client } from '@/lib/sanity/client'
import { POSTS_QUERY, POSTS_BY_TOPIC_QUERY, TOPIC_OPTIONS, type PostSummary } from '@/lib/sanity/queries'
import { urlFor } from '@/lib/sanity/image'
import { PublicLayout } from '@/components/public-layout'
import Image from 'next/image'
import Link from 'next/link'
import type { Metadata } from 'next'

export const revalidate = 60

export const metadata: Metadata = {
  title: 'Blog | AI Observly',
  description: 'Insights on AI cost management, unit economics, and margin visibility for founders.',
}

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

function TopicBadge({ topic }: { topic: string }) {
  const cls = TOPIC_COLORS[topic] ?? 'bg-muted text-muted-foreground'
  return (
    <span className={`inline-block text-xs font-medium px-2.5 py-1 rounded-full ${cls}`}>
      {topic}
    </span>
  )
}

function PostCard({ post }: { post: PostSummary }) {
  const imageUrl = post.coverImage
    ? urlFor(post.coverImage).width(800).height(420).fit('crop').auto('format').url()
    : null

  return (
    <Link
      href={`/blog/${post.slug}`}
      className="group flex flex-col bg-card border border-border rounded-2xl overflow-hidden hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200"
    >
      {imageUrl ? (
        <div className="relative w-full aspect-[16/9] overflow-hidden bg-muted">
          <Image
            src={imageUrl}
            alt={post.title}
            fill
            className="object-cover group-hover:scale-[1.02] transition-transform duration-300"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        </div>
      ) : (
        <div className="w-full aspect-[16/9] bg-primary/5 flex items-center justify-center">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-primary/30">
            <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
          </svg>
        </div>
      )}

      <div className="flex flex-col flex-1 p-6 gap-3">
        {post.topic && <TopicBadge topic={post.topic} />}
        <h2 className="text-lg font-bold font-outfit text-foreground group-hover:text-primary transition-colors leading-snug line-clamp-2">
          {post.title}
        </h2>
        {post.metaDescription && (
          <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3 flex-1">
            {post.metaDescription}
          </p>
        )}
        <p className="text-xs text-muted-foreground mt-auto pt-2 border-t border-border/50">
          {formatDate(post.publishedAt)}
        </p>
      </div>
    </Link>
  )
}

export default async function BlogPage({
  searchParams,
}: {
  searchParams: Promise<{ topic?: string }>
}) {
  const { topic } = await searchParams

  const activeTopic = TOPIC_OPTIONS.includes(topic as typeof TOPIC_OPTIONS[number])
    ? (topic as string)
    : undefined

  const posts: PostSummary[] = await client.fetch(
    activeTopic ? POSTS_BY_TOPIC_QUERY : POSTS_QUERY,
    activeTopic ? { topic: activeTopic } : {},
    { next: { revalidate: 60 } },
  )

  return (
    <PublicLayout>
      <div className="max-w-6xl mx-auto px-6 py-16 w-full">
        {/* Header */}
        <div className="mb-12 text-center">
          <div className="inline-flex items-center rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary mb-6 shadow-sm">
            <span className="flex h-2 w-2 rounded-full bg-primary mr-2 animate-pulse" />
            AI Observly Blog
          </div>
          <h1 className="text-4xl md:text-5xl font-bold font-outfit tracking-tight text-foreground mb-4">
            Insights on AI cost & margin
          </h1>
          <p className="text-lg text-muted-foreground max-w-xl mx-auto">
            Practical guidance for founders who want to understand what their AI is actually costing them.
          </p>
        </div>

        {/* Topic filter */}
        <div className="flex flex-wrap gap-2 justify-center mb-10">
          <Link
            href="/blog"
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
              !activeTopic
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'bg-muted text-muted-foreground hover:text-foreground hover:bg-muted/80'
            }`}
          >
            All posts
          </Link>
          {TOPIC_OPTIONS.map((t) => (
            <Link
              key={t}
              href={`/blog?topic=${encodeURIComponent(t)}`}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                activeTopic === t
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'bg-muted text-muted-foreground hover:text-foreground hover:bg-muted/80'
              }`}
            >
              {t}
            </Link>
          ))}
        </div>

        {/* Posts grid */}
        {posts.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-muted-foreground text-lg">
              {activeTopic
                ? `No posts in "${activeTopic}" yet.`
                : 'No posts published yet. Check back soon.'}
            </p>
            {activeTopic && (
              <Link href="/blog" className="mt-4 inline-block text-primary hover:underline text-sm">
                View all posts →
              </Link>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {posts.map((post) => (
              <PostCard key={post._id} post={post} />
            ))}
          </div>
        )}
      </div>
    </PublicLayout>
  )
}
