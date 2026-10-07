import { TOPIC_OPTIONS } from '@/lib/sanity/queries'

export const LAUNCH_TOPIC = 'Product launch'
export const BLOG_TOPICS: string[] = [...TOPIC_OPTIONS, LAUNCH_TOPIC]

export type BlogCardData = {
  key: string
  href: string
  title: string
  description?: string
  topic?: string
  date?: string
  minutes?: number | null
  imageUrl?: string | null
}

export type PostWithLength = {
  _id: string
  title: string
  slug: string
  coverImage?: import('@/lib/sanity/queries').SanityImageAsset
  publishedAt: string
  metaDescription?: string
  topic?: string
  body?: unknown[]
}

const WORDS_PER_MINUTE = 220

export function minutesFromWords(words: number): number | null {
  if (!Number.isFinite(words) || words < 1) return null
  return Math.max(1, Math.ceil(words / WORDS_PER_MINUTE))
}

export function minutesFromText(text: string): number | null {
  const words = text.trim().split(/\s+/).filter(Boolean).length
  return minutesFromWords(words)
}

type Span = { text?: string }
type Block = { _type?: string; children?: Span[]; rows?: { cells?: string[] }[] }

export function portableTextToPlain(body?: unknown[]): string {
  if (!body) return ''
  const parts: string[] = []
  for (const b of body as Block[]) {
    if (b._type === 'block') parts.push((b.children ?? []).map((c) => c.text ?? '').join(''))
    else if (Array.isArray(b.rows)) for (const r of b.rows) parts.push((r.cells ?? []).join(' '))
  }
  return parts.join(' ')
}

export function cleanQuery(raw: string | string[] | undefined): string {
  const v = Array.isArray(raw) ? raw[0] : raw
  return (v ?? '').replace(/\s+/g, ' ').trim().slice(0, 80)
}

export function searchTokens(q: string): string[] {
  return q
    .split(' ')
    .map((t) => t.replace(/[^\p{L}\p{N}]/gu, ''))
    .filter(Boolean)
    .slice(0, 5)
}

const PROJECTION = `{
  _id,
  title,
  "slug": select(slug.current[0..0] == "/" => slug.current[1..200], slug.current),
  coverImage,
  publishedAt,
  metaDescription,
  topic,
  body
}`

/** Real search over title + metaDescription; every word must match. Combined with topic filter. */
export function buildListingQuery(hasTopic: boolean, tokens: string[]) {
  const conds = ['_type == "post"']
  const params: Record<string, string> = {}
  if (hasTopic) conds.push('topic == $topic')
  tokens.forEach((t, i) => {
    conds.push(`(title match $t${i} || metaDescription match $t${i})`)
    params[`t${i}`] = `*${t}*`
  })
  return { query: `*[${conds.join(' && ')}] | order(publishedAt desc) ${PROJECTION}`, params }
}

export const NEXT_READS_QUERY = `*[_type == "post" && slug.current != $slug && slug.current != ("/"+$slug)] | order(publishedAt desc) [0...10] ${PROJECTION}`

export function launchMatches(title: string, description: string, tokens: string[]) {
  const hay = `${title} ${description}`.toLowerCase()
  return tokens.every((t) => hay.includes(t.toLowerCase()))
}

export function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
}
