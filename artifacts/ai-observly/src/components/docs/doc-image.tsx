import { urlFor } from '@/lib/sanity/image';
import Image from 'next/image';

type DocImageValue = {
  asset?: {
    _ref?: string;
  };
  alt?: string;
  caption?: string;
  dimensions?: {
    width?: number;
    height?: number;
  };
};

export function DocImage({ value }: { value: DocImageValue }) {
  if (!value?.asset?._ref) return null;

  try {
    const imageUrl = urlFor(value).width(1400).auto('format').fit('max').url();
    return (
      <figure className="my-8">
        <Image
          src={imageUrl}
          alt={value.alt || value.caption || 'AI Observly documentation illustration'}
          width={value.dimensions?.width ?? Number(value.asset._ref.match(/-(\d+)x(\d+)-/)?.[1] || 1400)}
          height={value.dimensions?.height ?? Number(value.asset._ref.match(/-(\d+)x(\d+)-/)?.[2] || 800)}
          sizes="(max-width: 768px) 100vw, (max-width: 1280px) 70vw, 900px"
          className="block h-auto max-h-[720px] w-full rounded-xl border border-border object-contain"
          loading="lazy"
        />
        {value.caption && (
          <figcaption className="mt-2 text-center text-sm text-muted-foreground">
            {value.caption}
          </figcaption>
        )}
      </figure>
    );
  } catch {
    return null;
  }
}