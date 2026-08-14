import { client } from '@/lib/sanity/client'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const limit = Math.min(parseInt(searchParams.get('limit') ?? '5', 10), 20)

  const posts = await client.fetch(
    `*[_type == "post"] | order(publishedAt desc) [0...$limit] {
      _id,
      title,
      "slug": slug.current,
      coverImage,
      publishedAt,
      metaDescription,
      topic
    }`,
    { limit },
    { next: { revalidate: 60 } },
  )

  return NextResponse.json(posts)
}
