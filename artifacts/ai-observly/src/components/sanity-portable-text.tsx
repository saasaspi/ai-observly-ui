"use client";
import { PortableText, type PortableTextComponents } from '@portabletext/react'
import { slugifyHeading } from '@/lib/sanity/toc'
import { urlFor } from '@/lib/sanity/image'
import Image from 'next/image'

type PortableTextTable = {
  rows?: Array<{
    cells?: string[]
  }>
}

type PortableTextImage = {
  asset?: {
    _ref?: string
    _type?: string
  }
  alt?: string
  caption?: string
}

const components: PortableTextComponents = {
  block: {
    normal: ({ children }) => (
      <p className="mb-5 text-foreground leading-relaxed text-[1.0625rem]">{children}</p>
    ),
    h2: ({ children, value }) => {
      const text = (value.children ?? [])
        .map((child) => (
          typeof child === 'object' && child !== null && 'text' in child && typeof child.text === 'string'
            ? child.text
            : ''
        ))
        .join('')
      const id = slugifyHeading(text)
      return (
        <h2
          id={id}
          className="scroll-mt-24 text-2xl font-bold font-outfit mt-10 mb-4 text-foreground"
        >
          {children}
        </h2>
      )
    },
    h3: ({ children, value }) => {
      const text = (value.children ?? [])
        .map((child) => (
          typeof child === 'object' && child !== null && 'text' in child && typeof child.text === 'string'
            ? child.text
            : ''
        ))
        .join('')
      const id = slugifyHeading(text)
      return (
        <h3
          id={id}
          className="scroll-mt-24 text-xl font-semibold font-outfit mt-8 mb-3 text-foreground"
        >
          {children}
        </h3>
      )
    },
    h4: ({ children }) => (
      <h4 className="scroll-mt-24 text-lg font-semibold mt-6 mb-2 text-foreground">{children}</h4>
    ),
    blockquote: ({ children }) => (
      <blockquote className="border-l-4 border-primary pl-5 py-1 my-6 text-muted-foreground italic">
        {children}
      </blockquote>
    ),
  },
  marks: {
    strong: ({ children }) => <strong className="font-semibold text-foreground">{children}</strong>,
    em: ({ children }) => <em className="italic">{children}</em>,
    code: ({ children }) => (
      <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono text-foreground">{children}</code>
    ),
    link: ({ value, children }) => (
      <a
        href={value?.href}
        target={value?.href?.startsWith('http') ? '_blank' : undefined}
        rel={value?.href?.startsWith('http') ? 'noopener noreferrer' : undefined}
        className="text-primary underline underline-offset-2 hover:opacity-80 transition-opacity"
      >
        {children}
      </a>
    ),
  },
  list: {
    bullet: ({ children }) => (
      <ul className="list-disc pl-6 mb-5 space-y-1.5 text-foreground">{children}</ul>
    ),
    number: ({ children }) => (
      <ol className="list-decimal pl-6 mb-5 space-y-1.5 text-foreground">{children}</ol>
    ),
  },
  listItem: {
    bullet: ({ children }) => <li className="leading-relaxed">{children}</li>,
    number: ({ children }) => <li className="leading-relaxed">{children}</li>,
  },
  types: {
    image: ({ value }: { value: PortableTextImage }) => {
      if (!value?.asset?._ref) return null

      const imageUrl = urlFor(value).width(1400).auto('format').url()

      return (
        <figure className="my-8">
          <div className="relative min-h-[220px] w-full overflow-hidden rounded-xl border border-border bg-muted/30">
            <Image
              src={imageUrl}
              alt={value.alt || 'Blog image'}
              fill
              className="object-contain"
              sizes="(max-width: 768px) 100vw, 760px"
            />
          </div>
          {value.caption && (
            <figcaption className="mt-2 text-center text-sm text-muted-foreground">
              {value.caption}
            </figcaption>
          )}
        </figure>
      )
    },
    table: ({ value }: { value: PortableTextTable }) => {
      const rows = value?.rows ?? []
      if (rows.length === 0) return null

      const header = rows[0]?.cells ?? []
      const body = rows.slice(1)

      return (
        <div className="my-8 overflow-x-auto rounded-xl border border-border">
          <table className="w-full min-w-[520px] border-collapse text-sm">
            <thead className="bg-muted/60">
              <tr>
                {header.map((cell, index) => (
                  <th
                    key={index}
                    className="border-b border-border px-4 py-3 text-left font-semibold text-foreground"
                  >
                    {cell}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {body.map((row, rowIndex) => (
                <tr key={rowIndex} className="even:bg-muted/30">
                  {(row.cells ?? []).map((cell, cellIndex) => (
                    <td key={cellIndex} className="border-b border-border px-4 py-3 text-muted-foreground last:border-b-0">
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )
    },
  },
}

export function SanityPortableText({ value }: { value: unknown[] }) {
  return <PortableText value={value as Parameters<typeof PortableText>[0]['value']} components={components} />
}
