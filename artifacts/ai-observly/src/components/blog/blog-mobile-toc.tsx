'use client'
import { useRef } from 'react'
import { List } from 'lucide-react'

export type MobileTocEntry = { id: string; text: string; level: number }

export function BlogMobileToc({ entries }: { entries: MobileTocEntry[] }) {
  const ref = useRef<HTMLDetailsElement>(null)
  if (entries.length === 0) return null
  return (
    <details ref={ref} className="blog-mobile-toc lg:hidden rounded-xl border border-border bg-card mb-8">
      <summary className="flex cursor-pointer list-none items-center gap-2 px-4 py-3 text-sm font-semibold text-foreground marker:hidden">
        <List className="w-4 h-4 text-primary" aria-hidden="true" />
        In this article
        <span className="ml-auto text-xs font-normal text-muted-foreground">{entries.length} sections</span>
      </summary>
      <nav aria-label="In this article" className="border-t border-border px-4 py-3">
        <ul className="space-y-2.5">
          {entries.map((e) => (
            <li key={e.id} className={e.level === 3 ? 'pl-4' : ''}>
              <a
                href={`#${e.id}`}
                onClick={() => ref.current?.removeAttribute('open')}
                className="block text-sm leading-snug text-muted-foreground hover:text-foreground"
              >
                {e.text}
              </a>
            </li>
          ))}
        </ul>
      </nav>
    </details>
  )
}
