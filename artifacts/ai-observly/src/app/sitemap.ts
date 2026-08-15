import type { MetadataRoute } from 'next'
import { client } from '@/lib/sanity/client'
import { SITEMAP_POSTS_QUERY } from '@/lib/sanity/queries'

export const revalidate = 60

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://ai-observly.replit.app'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const posts: { slug: string; publishedAt: string }[] = await client.fetch(
    SITEMAP_POSTS_QUERY,
    {},
    { next: { revalidate: 60 } },
  )

  const postUrls: MetadataRoute.Sitemap = posts
    .filter((p) => p.slug)
    .map((post) => ({
      url: `${siteUrl}/blog/${post.slug}`,
      lastModified: new Date(post.publishedAt),
      changeFrequency: 'weekly',
      priority: 0.7,
    }))

  return [
    { url: siteUrl,                           lastModified: new Date(), changeFrequency: 'daily',   priority: 1.0 },
    { url: `${siteUrl}/blog`,                 lastModified: new Date(), changeFrequency: 'daily',   priority: 0.9 },
    { url: `${siteUrl}/docs`,                 lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7 },
    { url: `${siteUrl}/spend-checkup`,        lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7 },
    { url: `${siteUrl}/#pricing`,             lastModified: new Date(), changeFrequency: 'monthly', priority: 0.6 },
    ...postUrls,
  ]
}
