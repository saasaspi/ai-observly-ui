import { createClient } from '@sanity/client'

export const client = createClient({
  projectId: 'y4ebxpas',
  dataset: 'production',
  apiVersion: '2024-01-01',
  useCdn: false, // false so Next.js ISR controls caching, not Sanity's CDN layer
})
