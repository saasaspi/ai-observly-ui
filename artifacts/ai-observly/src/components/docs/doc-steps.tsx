import { DocsPortableText } from './docs-portable-text';

export interface DocStep {
  _key: string;
  title: string;
  content?: any[];
  stepNumber?: number;
}

export interface DocStepsProps {
  value: {
    _type: 'docSteps';
    steps: DocStep[];
  };
}

function stepHeadingId(title: string, key: string, index: number) {
  const titleSlug = title
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/&/g, '-and-')
    .replace(/[^\w-]+/g, '')
    .replace(/--+/g, '-');
  const keySlug = key.replace(/[^\w-]+/g, '').toLowerCase();

  return `${titleSlug || `step-${index + 1}`}-${keySlug || index + 1}`;
}

export function DocSteps({ value }: DocStepsProps) {
  if (!value.steps || value.steps.length === 0) return null;

  return (
    <div className="my-10 relative">
      <div className="flex flex-col gap-10">
        {value.steps.map((step, index) => (
          <div key={step._key} className="relative flex gap-6 items-start">
            {index < value.steps.length - 1 && (
              <div className="absolute left-[15px] top-8 -bottom-10 w-0.5 bg-border" aria-hidden="true" />
            )}
            <div className="relative z-10 flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-full border-[3px] border-background bg-primary text-primary-foreground font-semibold text-sm shadow-sm ring-1 ring-border/50">
              {step.stepNumber ?? index + 1}
            </div>
            
            <div className="flex-1 min-w-0 pt-0.5">
              {step.title && (
                <h3
                  id={stepHeadingId(step.title, step._key, index)}
                  className="text-lg font-semibold tracking-tight text-foreground mb-3 font-outfit scroll-m-20"
                >
                  {step.title}
                </h3>
              )}
              {step.content && step.content.length > 0 && (
                <div className="mt-2 [&>div:first-child>p:first-child]:mt-0">
                  <DocsPortableText value={step.content} />
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
