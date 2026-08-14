// Extracts H2/H3 headings from a Sanity Portable Text body for the table of contents.

type PortableTextSpan = {
  _type: string
  text?: string
}

type PortableTextBlock = {
  _type: string
  _key: string
  style?: string
  children?: PortableTextSpan[]
}

export type TocEntry = {
  id: string
  text: string
  level: 2 | 3
}

/** Converts heading text to a URL-safe anchor id — must match the renderer in sanity-portable-text.tsx */
export function slugifyHeading(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
}

export function extractToc(body: unknown[]): TocEntry[] {
  const entries: TocEntry[] = []
  for (const block of body as PortableTextBlock[]) {
    if (block._type !== 'block') continue
    if (block.style !== 'h2' && block.style !== 'h3') continue
    const text = (block.children ?? []).map((c) => c.text ?? '').join('')
    if (!text.trim()) continue
    entries.push({
      id: slugifyHeading(text),
      text,
      level: block.style === 'h2' ? 2 : 3,
    })
  }
  return entries
}
