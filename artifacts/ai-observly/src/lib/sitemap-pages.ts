/**
 * sitemap-pages.ts
 *
 * Single source of truth for every public static page in the sitemap.
 *
 * Rules for inclusion:
 *   ✅  Add a page here when it's publicly accessible without authentication.
 *   ❌  Do NOT add: /login, /signup, /dashboard, /onboarding, /settings,
 *       /customers, or anything under /napi/ — these match robots.txt Disallow.
 *
 * Blog posts are NOT listed here; they are fetched dynamically from Sanity
 * in sitemap.ts so every published post appears automatically.
 */

export type StaticPage = {
  path: string
  changeFrequency: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never'
  priority: number
}

export const STATIC_PAGES: StaticPage[] = [
  { path: '/',              changeFrequency: 'daily',   priority: 1.0 },
  { path: '/blog',          changeFrequency: 'daily',   priority: 0.9 },
  { path: '/pricing',       changeFrequency: 'monthly', priority: 0.8 },
  { path: '/docs',          changeFrequency: 'monthly', priority: 0.7 },
  { path: '/spend-checkup',    changeFrequency: 'monthly', priority: 0.7 },
  { path: '/blind-spot-quiz', changeFrequency: 'monthly', priority: 0.7 },
]
