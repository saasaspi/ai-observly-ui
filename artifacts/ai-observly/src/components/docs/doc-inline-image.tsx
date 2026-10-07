import { urlFor } from '@/lib/sanity/image';
import Image from 'next/image';

export interface DocInlineImageProps {
  value: {
    _type: 'docInlineImage';
    image: any;
    altText?: string;
  };
}

export function DocInlineImage({ value }: DocInlineImageProps) {
  if (!value?.image) return null;
  
  try {
    const url = urlFor(value.image).width(1200).auto('format').fit('max').url();
    return (
      <figure className="my-8 overflow-hidden rounded-xl border border-border bg-muted/20">
        <Image
          src={url}
          alt={value.altText || value.image.alt || 'AI Observly documentation illustration'}
          width={Number(value.image.asset?._ref?.match(/-(\d+)x(\d+)-/)?.[1] || 1200)}
          height={Number(value.image.asset?._ref?.match(/-(\d+)x(\d+)-/)?.[2] || 800)}
          sizes="(max-width: 768px) 100vw, (max-width: 1280px) 70vw, 900px"
          className="block h-auto max-h-[720px] w-full object-contain"
          loading="lazy"
        />
      </figure>
    );
  } catch (e) {
    return null;
  }
}
