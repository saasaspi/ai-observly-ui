/** The page already owns its H1. Normalize CMS heading levels without changing
 * the stored document, text, or heading IDs. */
export function normalizeHeadings<T>(value: T): T {
  if (!Array.isArray(value)) return value;
  let previousLevel = 1;
  return value.map(block => {
    if (!block || typeof block !== "object" || block._type !== "block") return block;
    const heading = /^h([1-6])$/.exec(block.style || "");
    if (!heading) return block;
    const level = Math.min(Math.max(2, Number(heading[1])), previousLevel + 1);
    previousLevel = level;
    return { ...block, style: `h${level}` };
  }) as T;
}
