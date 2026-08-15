import type { MetadataRoute } from 'next'
import { client } from '@/lib/sanity/client'
import { SITEMAP_POSTS_QUERY } from '@/lib/sanity/queries'
import { STATIC_PAGES } from '@/lib/sitemap-pages'

export const revalidate = 60

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://aiobservly.com'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const posts: { slug: string; publishedAt: string; _updatedAt: string }[] =
    await client.fetch(SITEMAP_POSTS_QUERY, {}, { next: { revalidate: 60 } })

  const postUrls: MetadataRoute.Sitemap = posts
    .filter((p) => p.slug)
    .map((post) => ({
      url: `${siteUrl}/blog/${post.slug}`,
      // Use Sanity's _updatedAt (real last-edit time); fall back to publishedAt.
      lastModified: new Date(post._updatedAt ?? post.publishedAt),
      changeFrequency: 'weekly',
      priority: 0.7,
    }))

  const staticUrls: MetadataRoute.Sitemap = STATIC_PAGES.map((page) => ({
    url: `${siteUrl}${page.path}`,
    // Static pages don't track individual edit times; use deploy time.
    lastModified: new Date(),
    changeFrequency: page.changeFrequency,
    priority: page.priority,
  }))

  return [...staticUrls, ...postUrls]
}
