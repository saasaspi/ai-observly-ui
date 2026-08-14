import type { TocEntry } from '@/lib/sanity/toc'

interface TableOfContentsProps {
  entries: TocEntry[]
}

export function TableOfContents({ entries }: TableOfContentsProps) {
  if (entries.length === 0) return null

  return (
    <nav aria-label="Table of contents" className="sticky top-24 self-start max-h-[calc(100vh-7rem)] overflow-y-auto">
      <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
        Contents
      </p>
      <ul className="space-y-2.5">
        {entries.map((entry) => (
          <li key={entry.id} className={entry.level === 3 ? 'pl-3' : ''}>
            <a
              href={`#${entry.id}`}
              className="block text-sm text-muted-foreground hover:text-foreground transition-colors leading-snug line-clamp-3"
            >
              {entry.text}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  )
}
