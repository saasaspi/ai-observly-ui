import { urlFor } from '@/lib/sanity/image';

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
        <img
          src={url}
          alt={value.altText || ''}
          className="block h-auto max-h-[720px] w-full object-contain"
          loading="lazy"
        />
      </figure>
    );
  } catch (e) {
    return null;
  }
}
