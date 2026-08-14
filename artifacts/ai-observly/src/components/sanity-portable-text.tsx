"use client";
import { PortableText, type PortableTextComponents } from '@portabletext/react'
import { slugifyHeading } from '@/lib/sanity/toc'

const components: PortableTextComponents = {
  block: {
    normal: ({ children }) => (
      <p className="mb-5 text-foreground leading-relaxed text-[1.0625rem]">{children}</p>
    ),
    h2: ({ children, value }) => {
      const text = (value.children ?? []).map((c: { text?: string }) => c.text ?? '').join('')
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
      const text = (value.children ?? []).map((c: { text?: string }) => c.text ?? '').join('')
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
}

export function SanityPortableText({ value }: { value: unknown[] }) {
  return <PortableText value={value as Parameters<typeof PortableText>[0]['value']} components={components} />
}
