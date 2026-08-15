// TypeScript types matching the Post schema in artifacts/sanity-studio/schemas/post.ts

export type SanityImageAsset = {
  _type: 'image'
  asset: { _ref: string; _type: 'reference' }
  hotspot?: { x: number; y: number; width: number; height: number }
  crop?: { top: number; bottom: number; left: number; right: number }
}

export type Post = {
  _id: string
  title: string
  slug: string
  coverImage?: SanityImageAsset
  publishedAt: string
  body?: unknown[]
  seoTitle?: string
  metaDescription?: string
  topic?: string
}

export type PostSummary = Pick<Post, '_id' | 'title' | 'slug' | 'coverImage' | 'publishedAt' | 'metaDescription' | 'topic'>

// All published posts ordered newest-first
export const POSTS_QUERY = `
  *[_type == "post"] | order(publishedAt desc) {
    _id,
    title,
    "slug": slug.current,
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
    "slug": slug.current,
    coverImage,
    publishedAt,
    metaDescription,
    topic
  }
`

// Single post by slug — full fields
export const POST_QUERY = `
  *[_type == "post" && slug.current == $slug][0] {
    _id,
    title,
    "slug": slug.current,
    coverImage,
    publishedAt,
    body,
    seoTitle,
    metaDescription,
    topic
  }
`

// Up to 3 related posts in the same topic, excluding current
export const RELATED_POSTS_QUERY = `
  *[_type == "post" && topic == $topic && slug.current != $slug] | order(publishedAt desc) [0...3] {
    _id,
    title,
    "slug": slug.current,
    coverImage,
    publishedAt,
    metaDescription
  }
`

// Up to 10 recent posts excluding current — used to build the recommended sidebar.
// Topic-priority sorting happens in JS: same topic first, then fill with newest.
export const RECOMMENDED_POSTS_QUERY = `
  *[_type == "post" && slug.current != $slug] | order(publishedAt desc) [0...10] {
    _id,
    title,
    "slug": slug.current,
    coverImage,
    publishedAt,
    topic
  }
`

// Lightweight query for sitemap generation.
// _updatedAt is the Sanity-managed last-edit timestamp; falls back to publishedAt if missing.
export const SITEMAP_POSTS_QUERY = `
  *[_type == "post"] {
    "slug": slug.current,
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
