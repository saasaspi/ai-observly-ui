import { client } from '@/lib/sanity/client'
import { urlFor } from '@/lib/sanity/image'
import { PublicLayout } from '@/components/public-layout'
import Link from 'next/link'
import type { Metadata } from 'next'
import { Search } from 'lucide-react'
import { pageMetadata } from '@/lib/seo'
import { LAUNCH_POST } from '@/lib/new-features'
import { LAUNCH_READ_MINUTES } from '@/components/launch-article'
import { BlogCard, FeaturedCard } from '@/components/blog/blog-cards'
import {
  BLOG_TOPICS, LAUNCH_TOPIC, buildListingQuery, cleanQuery, launchMatches,
  minutesFromText, portableTextToPlain, searchTokens, type BlogCardData, type PostWithLength,
} from '@/lib/blog-utils'

export const revalidate = 60

export const metadata: Metadata = pageMetadata('/blog')

function href(topic?: string, q?: string) {
  const p = new URLSearchParams()
  if (topic) p.set('topic', topic)
  if (q) p.set('q', q)
  const s = p.toString()
  return s ? `/blog?${s}` : '/blog'
}

export default async function BlogPage({
  searchParams,
}: {
  searchParams: Promise<{ topic?: string | string[]; q?: string | string[] }>
}) {
  const sp = await searchParams
  const rawTopic = Array.isArray(sp.topic) ? sp.topic[0] : sp.topic
  const activeTopic = rawTopic && BLOG_TOPICS.includes(rawTopic) ? rawTopic : undefined
  const q = cleanQuery(sp.q)
  const tokens = searchTokens(q)
  const filtered = Boolean(activeTopic || q)

  let posts: PostWithLength[] = []
  if (activeTopic !== LAUNCH_TOPIC) {
    const { query, params } = buildListingQuery(Boolean(activeTopic), tokens)
    posts = await client.fetch(query, activeTopic ? { ...params, topic: activeTopic } : params, { next: { revalidate: 60 } })
  }

  const cards: BlogCardData[] = posts.map((p) => ({
    key: p._id,
    href: `/blog/${p.slug}`,
    title: p.title,
    description: p.metaDescription,
    topic: p.topic,
    date: p.publishedAt,
    minutes: minutesFromText(portableTextToPlain(p.body)),
    imageUrl: p.coverImage ? urlFor(p.coverImage).width(1000).height(560).fit('crop').auto('format').url() : null,
  }))

  const showLaunch =
    (!activeTopic || activeTopic === LAUNCH_TOPIC) && launchMatches(LAUNCH_POST.title, LAUNCH_POST.description, tokens)
  const launch: BlogCardData = {
    key: 'launch',
    href: `/blog/${LAUNCH_POST.slug}`,
    title: LAUNCH_POST.title,
    description: LAUNCH_POST.description,
    topic: LAUNCH_TOPIC,
    minutes: LAUNCH_READ_MINUTES,
  }

  // Featured: newest real CMS article on the unsearched view, otherwise the launch guide if it is all there is.
  const all = showLaunch ? [launch, ...cards] : cards
  const featured = !q && cards.length > 0 ? cards[0] : !q && showLaunch ? launch : null
  const rest = featured ? all.filter((c) => c.key !== featured.key) : all
  const total = all.length

  return (
    <PublicLayout>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-14 md:py-16 w-full">
        <header className="mb-10 text-center">
          <p className="text-sm font-semibold uppercase tracking-widest text-primary mb-4">AI Observly Blog</p>
          <h1 className="text-4xl md:text-5xl font-bold font-outfit tracking-tight text-foreground mb-4">
            Insights on AI cost & margin
          </h1>
          <p className="text-lg text-muted-foreground max-w-xl mx-auto mb-8">
            Practical guidance for founders who want to understand what their AI is actually costing them.
          </p>

          <form action="/blog" method="get" role="search" className="blog-search">
            {activeTopic && <input type="hidden" name="topic" value={activeTopic} />}
            <label htmlFor="blog-q" className="sr-only">Search articles by title or description</label>
            <input id="blog-q" type="search" name="q" defaultValue={q} placeholder="Search articles, e.g. margin" autoComplete="off" maxLength={80} />
            <button type="submit" className="pub-btn pub-btn-primary">
              <Search className="w-4 h-4" aria-hidden="true" /> Search
            </button>
          </form>
        </header>

        <nav aria-label="Filter articles by topic" className="mb-8">
          <div className="blog-topics no-scrollbar">
            <Link href={href(undefined, q)} className="blog-topic" aria-current={!activeTopic ? 'page' : undefined}>All posts</Link>
            {BLOG_TOPICS.map((t) => (
              <Link key={t} href={href(t, q)} className="blog-topic" aria-current={activeTopic === t ? 'page' : undefined}>
                {t}
              </Link>
            ))}
          </div>
        </nav>

        <div role="status" aria-live="polite" className="flex flex-wrap items-center justify-between gap-2 mb-6 text-sm text-muted-foreground">
          <span>
            {filtered
              ? `${total} ${total === 1 ? 'article' : 'articles'}${q ? ` matching "${q}"` : ''}${activeTopic ? ` in ${activeTopic}` : ''}`
              : `${total} ${total === 1 ? 'article' : 'articles'}`}
          </span>
          {filtered && total > 0 && <Link href="/blog" className="pub-link">Clear filters</Link>}
        </div>

        {total === 0 ? (
          <div className="pub-card items-center text-center py-14 bg-card">
            <h2 className="text-xl font-bold font-outfit text-foreground mb-2">
              {filtered ? 'Nothing matches that yet' : 'No posts published yet'}
            </h2>
            <p className="text-muted-foreground max-w-md mb-6">
              {filtered
                ? 'Try fewer words, check the spelling, or look across every topic.'
                : 'Check back soon.'}
            </p>
            {filtered && <Link href="/blog" className="pub-btn pub-btn-secondary">Clear search and topic</Link>}
          </div>
        ) : (
          <>
            {featured && <FeaturedCard post={featured} />}
            {rest.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {rest.map((c) => <BlogCard key={c.key} post={c} />)}
              </div>
            )}
          </>
        )}
      </div>
    </PublicLayout>
  )
}
