import { createImageUrlBuilder } from '@sanity/image-url'
import { SANITY_PUBLIC_CONFIG } from './config'

const builder = createImageUrlBuilder(SANITY_PUBLIC_CONFIG)

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function urlFor(source: any) {
  return builder.image(source)
}
