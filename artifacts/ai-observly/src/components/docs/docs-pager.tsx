import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface PagerItem {
  title: string;
  slug: string;
}

interface DocsPagerProps {
  prev?: PagerItem;
  next?: PagerItem;
}

export function DocsPager({ prev, next }: DocsPagerProps) {
  if (!prev && !next) return null;

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-8 mt-12 border-t border-border">
      {prev ? (
        <Link 
          href={`/docs/${prev.slug}`}
          className="flex flex-col gap-1 w-full sm:w-1/2 p-4 rounded-lg border border-border bg-card hover:bg-muted/50 transition-colors group"
        >
          <div className="flex items-center gap-1 text-sm text-muted-foreground mb-1">
            <ChevronLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
            Previous
          </div>
          <div className="font-medium text-foreground">{prev.title}</div>
        </Link>
      ) : (
        <div className="w-full sm:w-1/2" />
      )}

      {next ? (
        <Link 
          href={`/docs/${next.slug}`}
          className="flex flex-col gap-1 w-full sm:w-1/2 p-4 rounded-lg border border-border bg-card hover:bg-muted/50 transition-colors text-right group"
        >
          <div className="flex items-center justify-end gap-1 text-sm text-muted-foreground mb-1">
            Next
            <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </div>
          <div className="font-medium text-foreground">{next.title}</div>
        </Link>
      ) : (
        <div className="w-full sm:w-1/2" />
      )}
    </div>
  );
}
