import type { MetadataRoute } from 'next'
import { client } from '@/lib/sanity/client'
import { SITEMAP_POSTS_QUERY } from '@/lib/sanity/queries'
import { LAUNCH_POST } from '@/lib/new-features'
import { STATIC_PAGES } from '@/lib/sitemap-pages'
import { SITE_URL } from '@/lib/seo'

export const revalidate = 60

const siteUrl = SITE_URL
const RELEASE_DATE = '2026-10-07'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [posts, docs]: [{ slug: string; publishedAt: string; _updatedAt: string }[], { slug: string; _updatedAt: string }[]] =
    await Promise.all([
      client.fetch(SITEMAP_POSTS_QUERY, {}, { next: { revalidate: 60 } }),
      client.fetch(`*[_type == "docPage" && defined(slug.current)]{"slug":slug.current,_updatedAt}`, {}, { next: { revalidate: 60 } }),
    ])

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
    // Metadata for all public pages was updated in this release, never use crawl time.
    lastModified: new Date(RELEASE_DATE),
    changeFrequency: page.changeFrequency,
    priority: page.priority,
  }))

  const launchUrl: MetadataRoute.Sitemap = [
    {
      url: `${siteUrl}/blog/${LAUNCH_POST.slug}`,
      lastModified: new Date(RELEASE_DATE),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
  ]

  const docUrls: MetadataRoute.Sitemap = docs.map(doc => ({
    url: `${siteUrl}/docs/${doc.slug.replace(/^\/+|\/+$/g, '')}`,
    lastModified: new Date(doc._updatedAt),
    changeFrequency: 'weekly', priority: 0.7,
  }))
  return [...new Map([...staticUrls, ...launchUrl, ...postUrls, ...docUrls].map(page => [page.url, page])).values()]
}
