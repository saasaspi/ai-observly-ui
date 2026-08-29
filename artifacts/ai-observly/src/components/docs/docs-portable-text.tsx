'use client';

import { PortableText, PortableTextComponents, PortableTextProps } from '@portabletext/react';
import { DocSteps } from './doc-steps';
import { DocCodeBlock } from './doc-code-block';
import { DocInlineImage } from './doc-inline-image';

function slugify(text: string) {
  return text.toString().toLowerCase().trim()
    .replace(/\s+/g, '-')
    .replace(/&/g, '-and-')
    .replace(/[^\w-]+/g, '')
    .replace(/--+/g, '-');
}

function headingId(value: unknown) {
  const block = value as {
    _key?: string;
    children?: Array<{ text?: unknown }>;
  };
  const text = block.children
    ?.map((child) => (typeof child.text === 'string' ? child.text : ''))
    .join('') ?? '';
  const textSlug = slugify(text) || 'section';
  return block._key ? `${textSlug}-${slugify(block._key)}` : textSlug;
}

const components: PortableTextComponents = {
  types: {
    docSteps: DocSteps,
    docCodeBlock: DocCodeBlock,
    docInlineImage: DocInlineImage,
  },
  block: {
    normal: ({ children }) => (
      <p className="leading-7 [&:not(:first-child)]:mt-6 text-muted-foreground">{children}</p>
    ),
    h2: ({ children, value }) => {
      const id = headingId(value);
      return (
        <h2 id={id} className="scroll-m-20 border-b pb-2 text-2xl font-semibold tracking-tight first:mt-0 mt-10 mb-4 text-foreground">
          {children}
        </h2>
      );
    },
    h3: ({ children, value }) => {
      const id = headingId(value);
      return (
        <h3 id={id} className="scroll-m-20 text-xl font-semibold tracking-tight mt-8 mb-4 text-foreground">
          {children}
        </h3>
      );
    },
    h4: ({ children }) => (
      <h4 className="scroll-m-20 text-lg font-semibold tracking-tight mt-6 mb-4 text-foreground">{children}</h4>
    ),
    blockquote: ({ children }) => (
      <blockquote className="mt-6 border-l-2 border-primary/30 bg-muted/30 pl-6 py-4 italic text-muted-foreground rounded-r-lg">
        {children}
      </blockquote>
    ),
  },
  list: {
    bullet: ({ children }) => (
      <ul className="my-6 ml-6 list-disc [&>li]:mt-2 text-muted-foreground">{children}</ul>
    ),
    number: ({ children }) => (
      <ol className="my-6 ml-6 list-decimal [&>li]:mt-2 text-muted-foreground">{children}</ol>
    ),
  },
  listItem: {
    bullet: ({ children }) => <li>{children}</li>,
    number: ({ children }) => <li>{children}</li>,
  },
  marks: {
    strong: ({ children }) => <strong className="font-semibold text-foreground">{children}</strong>,
    em: ({ children }) => <em className="italic">{children}</em>,
    code: ({ children }) => (
      <code className="relative rounded bg-muted px-[0.3rem] py-[0.2rem] font-mono text-sm font-medium text-foreground">
        {children}
      </code>
    ),
    link: ({ children, value }) => {
      const rel = !value.href.startsWith('/') ? 'noreferrer noopener' : undefined;
      return (
        <a 
          href={value.href} 
          rel={rel} 
          className="font-medium text-primary underline underline-offset-4 hover:text-primary/80 transition-colors"
        >
          {children}
        </a>
      );
    },
  },
};

export function DocsPortableText(props: Omit<PortableTextProps, 'components'>) {
  return (
    <div className="portable-text w-full max-w-none">
      <PortableText components={components} {...props} />
    </div>
  );
}
