'use client';
import { useId, useState } from 'react';
import { Check, Copy, FileCode2 } from 'lucide-react';
import { tokenize } from './syntax-highlighter';

export interface DocCodeBlockVariant {
  _key: string;
  language?: string;
  filename?: string;
  code: string;
  tabLabel?: string;
}

export interface DocCodeBlockProps {
  value: {
    _key?: string;
    _type: 'docCodeBlock';
    variants?: DocCodeBlockVariant[];
    language?: string;
    filename?: string;
    code?: string;
  };
}

export function DocCodeBlock({ value }: DocCodeBlockProps) {
  const [copied, setCopied] = useState(false);
  const [activeVariantId, setActiveVariantId] = useState<string>('');
  const componentId = useId().replace(/:/g, '');

  const variants = value.variants && value.variants.length > 0 
    ? value.variants 
    : [
        {
          _key: 'default',
          language: value.language || 'text',
          filename: value.filename,
          code: value.code || '',
        }
      ];

  const activeVariant = variants.find(v => v._key === activeVariantId) || variants[0];
  const tabId = (variantId: string) => `code-tab-${componentId}-${variantId}`;
  const panelId = `code-panel-${componentId}`;

  const selectVariant = (variantId: string) => {
    setActiveVariantId(variantId);
    setCopied(false);
  };

  const handleTabKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>, index: number) => {
    let nextIndex: number | null = null;
    if (event.key === 'ArrowRight') nextIndex = (index + 1) % variants.length;
    if (event.key === 'ArrowLeft') nextIndex = (index - 1 + variants.length) % variants.length;
    if (event.key === 'Home') nextIndex = 0;
    if (event.key === 'End') nextIndex = variants.length - 1;
    if (nextIndex === null) return;

    event.preventDefault();
    const nextVariant = variants[nextIndex];
    selectVariant(nextVariant._key);
    document.getElementById(tabId(nextVariant._key))?.focus();
  };

  const copyToClipboard = async () => {
    if (!activeVariant?.code) return;
    try {
      await navigator.clipboard.writeText(activeVariant.code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy code', err);
    }
  };

  const tokens = tokenize(activeVariant.code, activeVariant.language || 'text');

  return (
    <div className="my-6 rounded-xl overflow-hidden border border-border bg-muted/30 text-foreground shadow-sm">
      <div className="flex items-center justify-between px-4 py-2.5 bg-muted/50 border-b border-border">
        <div className="flex items-center gap-4 flex-1 overflow-x-auto no-scrollbar">
          {variants.length > 1 ? (
            <div className="flex items-center gap-2" role="tablist" aria-label="Code variants">
              {variants.map((v, index) => {
                const isActive = activeVariantId === v._key || (!activeVariantId && v._key === variants[0]._key);
                return (
                  <button
                    id={tabId(v._key)}
                    key={v._key}
                    onClick={() => selectVariant(v._key)}
                    onKeyDown={(event) => handleTabKeyDown(event, index)}
                    type="button"
                    role="tab"
                    aria-selected={isActive}
                    aria-controls={panelId}
                    tabIndex={isActive ? 0 : -1}
                    className={`text-sm px-3 py-1.5 rounded-md transition-colors whitespace-nowrap font-medium
                      ${isActive 
                        ? 'bg-background text-foreground shadow-sm ring-1 ring-border/50' 
                        : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                      }`}
                  >
                    {v.tabLabel || v.filename || v.language || 'Code'}
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              {activeVariant.language ? (
                <span className="uppercase text-[10px] font-semibold tracking-wider text-muted-foreground/70">
                  {activeVariant.language}
                </span>
              ) : null}
            </div>
          )}
        </div>

        <button
          onClick={copyToClipboard}
          className="ml-4 flex flex-shrink-0 items-center justify-center w-8 h-8 rounded text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
           aria-label={copied ? "Copied code to clipboard" : "Copy code to clipboard"}
          title="Copy code"
           type="button"
        >
          {copied ? <Check className="w-4 h-4 text-green-600 dark:text-green-500" /> : <Copy className="w-4 h-4" />}
        </button>
      </div>

      <div
        id={panelId}
        role={variants.length > 1 ? 'tabpanel' : undefined}
        aria-labelledby={variants.length > 1 ? tabId(activeVariant._key) : undefined}
        className="p-4 overflow-x-auto text-sm font-mono leading-relaxed"
      >
        <pre>
          <code>
            {tokens.map((token, i) => {
              // Instead of arbitrary hex, let's use some standardized tailwind colors
              // that look decent on both light and dark.
              let colorClass = 'text-foreground';
              if (token.type === 'keyword') colorClass = 'text-purple-600 dark:text-purple-400';
              else if (token.type === 'string') colorClass = 'text-green-600 dark:text-green-400';
              else if (token.type === 'number') colorClass = 'text-orange-600 dark:text-orange-400';
              else if (token.type === 'comment') colorClass = 'text-slate-500 dark:text-slate-400 italic';
              else if (token.type === 'function') colorClass = 'text-blue-600 dark:text-blue-400';
              else if (token.type === 'class') colorClass = 'text-yellow-600 dark:text-yellow-400';
              else if (token.type === 'operator' || token.type === 'punctuation') colorClass = 'text-sky-600 dark:text-sky-400';
              else if (token.type === 'property') colorClass = 'text-teal-600 dark:text-teal-400';
              
              return (
                <span key={i} className={colorClass}>
                  {token.content}
                </span>
              );
            })}
          </code>
        </pre>
      </div>
      {activeVariant.filename && (
        <div className="flex items-center gap-2 border-t border-border bg-muted/40 px-4 py-2 text-xs text-muted-foreground">
          <FileCode2 className="h-3.5 w-3.5" aria-hidden="true" />
          <span className="font-mono">{activeVariant.filename}</span>
        </div>
      )}
    </div>
  );
}
