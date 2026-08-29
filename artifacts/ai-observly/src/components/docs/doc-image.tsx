import { urlFor } from '@/lib/sanity/image';

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
        <img
          src={imageUrl}
          alt={value.alt || 'Documentation image'}
          width={value.dimensions?.width ?? 1400}
          height={value.dimensions?.height ?? 800}
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