import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { formatDate, type BlogCardData } from '@/lib/blog-utils'

const TOPIC_COLORS: Record<string, string> = {
  'Cost & Margin Management': 'bg-primary/10 text-primary',
  'Unit Economics': 'bg-emerald-50 text-emerald-700',
  'Comparisons': 'bg-violet-50 text-violet-700',
  'Data Reports': 'bg-amber-50 text-amber-700',
  'Product launch': 'bg-primary/10 text-primary',
}

export function TopicBadge({ topic }: { topic: string }) {
  return (
    <span className={`inline-block self-start text-xs font-medium px-2.5 py-1 rounded-full ${TOPIC_COLORS[topic] ?? 'bg-muted text-muted-foreground'}`}>
      {topic}
    </span>
  )
}

function Meta({ post }: { post: BlogCardData }) {
  const bits = [post.date ? formatDate(post.date) : null, post.minutes ? `${post.minutes} min read` : null].filter(Boolean)
  if (bits.length === 0) return null
  return <p className="text-xs text-muted-foreground">{bits.join('  |  ')}</p>
}

function Cover({ post, sizes, ratio }: { post: BlogCardData; sizes: string; ratio: string }) {
  return post.imageUrl ? (
    <div className={`relative w-full ${ratio} overflow-hidden bg-muted`}>
      <Image src={post.imageUrl} alt={`Featured illustration for ${post.title}`} fill className="object-cover" sizes={sizes} />
    </div>
  ) : (
    <div className={`w-full ${ratio} bg-primary/5 flex items-center justify-center px-6 text-center`}>
      <span className="font-outfit text-sm font-semibold text-primary/70">{post.topic ?? 'AI Observly'}</span>
    </div>
  )
}

export function BlogCard({ post }: { post: BlogCardData }) {
  return (
    <Link href={post.href} className="pub-card pub-card-link group !p-0 overflow-hidden bg-card" data-testid={`card-post-${post.key}`}>
      <Cover post={post} ratio="aspect-[16/9]" sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw" />
      <div className="flex flex-col flex-1 gap-3 p-6">
        {post.topic && <TopicBadge topic={post.topic} />}
        <h2 className="text-lg font-bold font-outfit text-foreground group-hover:text-primary leading-snug">{post.title}</h2>
        {post.description && <p className="text-[0.9375rem] text-muted-foreground leading-relaxed line-clamp-3 flex-1">{post.description}</p>}
        <Meta post={post} />
      </div>
    </Link>
  )
}

export function FeaturedCard({ post }: { post: BlogCardData }) {
  return (
    <Link
      href={post.href}
      className="pub-card pub-card-link group !p-0 overflow-hidden bg-card md:!flex-row mb-10"
      data-testid="card-featured-post"
    >
      <div className="md:w-[52%] shrink-0">
        <Cover post={post} ratio="aspect-[16/9] md:h-full md:aspect-auto md:min-h-[320px]" sizes="(max-width: 768px) 100vw, 640px" />
      </div>
      <div className="flex flex-col justify-center gap-4 p-6 md:p-10">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-primary">Start here</span>
          {post.topic && <TopicBadge topic={post.topic} />}
        </div>
        <h2 className="text-2xl md:text-3xl font-bold font-outfit text-foreground group-hover:text-primary leading-tight">{post.title}</h2>
        {post.description && <p className="text-base text-muted-foreground leading-relaxed">{post.description}</p>}
        <Meta post={post} />
        <span className="pub-link">Read the article <ArrowRight className="w-4 h-4" aria-hidden="true" /></span>
      </div>
    </Link>
  )
}

export function NextReads({ posts }: { posts: BlogCardData[] }) {
  if (posts.length === 0) return null
  return (
    <section aria-labelledby="next-reads-heading" className="mt-20 border-t border-border pt-12">
      <h2 id="next-reads-heading" className="text-2xl font-bold font-outfit text-foreground mb-6">Keep reading</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {posts.map((p) => <BlogCard key={p.key} post={p} />)}
      </div>
    </section>
  )
}
