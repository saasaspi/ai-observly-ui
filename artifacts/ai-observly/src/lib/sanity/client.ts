import { createClient } from '@sanity/client'
import { SANITY_PUBLIC_CONFIG } from './config'

export const client = createClient({
  ...SANITY_PUBLIC_CONFIG,
  apiVersion: '2024-01-01',
  useCdn: false, // false so Next.js ISR controls caching, not Sanity's CDN layer
})
