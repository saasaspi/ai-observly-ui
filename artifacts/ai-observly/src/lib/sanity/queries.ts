// TypeScript types matching the Post schema in artifacts/sanity-studio/schemas/post.ts

export type SanityImageAsset = {
  _type: 'image'
  asset: { _ref: string; _type: 'reference' }
  hotspot?: { x: number; y: number; width: number; height: number }
  crop?: { top: number; bottom: number; left: number; right: number }
}

export type PostFaq = {
  _key?: string
  question: string
  answer: string
}

export type Post = {
  _id: string
  title: string
  slug: string
  coverImage?: SanityImageAsset
  publishedAt: string
  body?: unknown[]
  faq?: PostFaq[]
  seoTitle?: string
  metaDescription?: string
  topic?: string
}

export type PostSummary = Pick<Post, '_id' | 'title' | 'slug' | 'coverImage' | 'publishedAt' | 'metaDescription' | 'topic'>

/**
 * GROQ helper: always returns a slug without a leading slash.
 *
 * Sanity's slug field is free-text, so someone can accidentally save "/my-slug"
 * instead of "my-slug". This expression normalises it at the GROQ level so
 * the website never sees a leading slash regardless of what's stored.
 *
 *   slug.current[0..0] == "/"  → strip first char  → slug.current[1...]
 *   otherwise                  → use as-is         → slug.current
 */
// GROQ doesn't support open-ended string slices, so we use [1..200] as a
// safe upper bound — no slug is ever 200+ characters long.
const SLUG_PROJECTION = `select(slug.current[0..0] == "/" => slug.current[1..200], slug.current)`

// All published posts ordered newest-first
export const POSTS_QUERY = `
  *[_type == "post"] | order(publishedAt desc) {
    _id,
    title,
    "slug": ${SLUG_PROJECTION},
    coverImage,
    publishedAt,
    metaDescription,
    topic
  }
`

// Posts filtered by a single topic
export const POSTS_BY_TOPIC_QUERY = `
  *[_type == "post" && topic == $topic] | order(publishedAt desc) {
    _id,
    title,
    "slug": ${SLUG_PROJECTION},
    coverImage,
    publishedAt,
    metaDescription,
    topic
  }
`

// Single post by slug — full fields.
// Matches both "my-slug" and "/my-slug" so a leading slash in Sanity never
// causes a 404 on the website.
export const POST_QUERY = `
  *[_type == "post" && (slug.current == $slug || slug.current == ("/"+$slug))][0] {
    _id,
    title,
    "slug": ${SLUG_PROJECTION},
    coverImage,
    publishedAt,
    body,
    faq,
    seoTitle,
    metaDescription,
    topic
  }
`

// Up to 3 related posts in the same topic, excluding current.
// The exclusion filter also covers the "/slug" form stored in Sanity.
export const RELATED_POSTS_QUERY = `
  *[_type == "post" && topic == $topic
    && slug.current != $slug && slug.current != ("/"+$slug)
  ] | order(publishedAt desc) [0...3] {
    _id,
    title,
    "slug": ${SLUG_PROJECTION},
    coverImage,
    publishedAt,
    metaDescription
  }
`

// Up to 10 recent posts excluding current — used to build the recommended sidebar.
// Topic-priority sorting happens in JS: same topic first, then fill with newest.
export const RECOMMENDED_POSTS_QUERY = `
  *[_type == "post"
    && slug.current != $slug && slug.current != ("/"+$slug)
  ] | order(publishedAt desc) [0...10] {
    _id,
    title,
    "slug": ${SLUG_PROJECTION},
    coverImage,
    publishedAt,
    topic
  }
`

// Lightweight query for sitemap generation.
// _updatedAt is the Sanity-managed last-edit timestamp; falls back to publishedAt if missing.
export const SITEMAP_POSTS_QUERY = `
  *[_type == "post"] {
    "slug": ${SLUG_PROJECTION},
    publishedAt,
    _updatedAt
  }
`

export const TOPIC_OPTIONS = [
  'Cost & Margin Management',
  'Unit Economics',
  'Comparisons',
  'Data Reports',
] as const
