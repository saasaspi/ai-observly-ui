// pdf-parse v1.1.1 — battle-tested Node.js PDF library, no web-worker required.
// Must stay in serverExternalPackages (next.config.ts) so webpack doesn't
// try to bundle it and break its internal require('fs') calls.
// Require the internal lib directly to skip pdf-parse v1's self-test in
// index.js which opens ./test/data/05-versions-space.pdf at import time
// and crashes in Next.js where the CWD isn't the pdf-parse package root.
// eslint-disable-next-line @typescript-eslint/no-require-imports
const pdfParse = require("pdf-parse/lib/pdf-parse") as (
  buf: Buffer,
  opts?: { pagerender?: (pageData: PageData) => Promise<string> }
) => Promise<{ text: string; numpages: number }>;

interface PageData {
  pageIndex: number; // 0-based
  getTextContent: () => Promise<{
    items: Array<{ str: string; transform: number[] }>;
  }>;
}

// ── Text extraction ────────────────────────────────────────────────────────────
// We provide a custom pagerender so we can:
//   1. Sort text items by (y desc, x asc) to reconstruct natural reading order.
//   2. Insert "-- N of M --" page markers that the parser uses to find section
//      boundaries without scanning the full text in one pass.
//
// We don't know total pages inside pagerender, so we use a placeholder and
// replace it after pdfParse returns.

async function extractPdfText(buffer: Buffer): Promise<string> {
  const pageParts: string[] = [];

  const result = await pdfParse(buffer, {
    pagerender: async (pageData: PageData): Promise<string> => {
      const content = await pageData.getTextContent();

      // Sort: top-to-bottom (ty descending), then left-to-right (tx ascending).
      // PDF origin is bottom-left, so higher ty = higher on the page.
      const items = [...content.items].sort((a, b) => {
        const yDiff = b.transform[5] - a.transform[5];
        if (Math.abs(yDiff) > 3) return yDiff;
        return a.transform[4] - b.transform[4];
      });

      // Cluster items into lines by y proximity
      const lines: string[][] = [];
      let curLine: string[] = [];
      let lastY = Infinity;

      for (const item of items) {
        const y = item.transform[5];
        if (Math.abs(y - lastY) > 3 && curLine.length > 0) {
          lines.push(curLine);
          curLine = [];
        }
        const s = item.str?.trim();
        if (s) curLine.push(s);
        lastY = y;
      }
      if (curLine.length > 0) lines.push(curLine);

      const pageText = lines.map((l) => l.join(" ")).join("\n");
      // Use a placeholder total ("%%TOTAL%%") replaced after we know numpages.
      const marker = `\n-- ${pageData.pageIndex + 1} of %%TOTAL%% --\n`;
      pageParts.push(pageText + marker);
      // pdf-parse v1 concatenates the return value of each pagerender call;
      // we return empty so we control the full text ourselves.
      return "";
    },
  });

  // Replace placeholder with actual page count
  const total = result.numpages;
  return pageParts.join("").replace(/%%TOTAL%%/g, String(total));
}

// ── Shared helpers ─────────────────────────────────────────────────────────────
function stripCost(s: string): number {
  return parseFloat(String(s).replace(/[$,]/g, ""));
}

const MONTH_MAP: Record<string, string> = {
  jan: "01", feb: "02", mar: "03", apr: "04", may: "05", jun: "06",
  jul: "07", aug: "08", sep: "09", oct: "10", nov: "11", dec: "12",
};

function toIso(raw: string): string | null {
  raw = raw.trim();
  if (/^\d{4}-\d{2}-\d{2}/.test(raw)) return raw.substring(0, 10);
  const mdy = raw.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (mdy)
    return `${mdy[3]}-${mdy[1].padStart(2, "0")}-${mdy[2].padStart(2, "0")}`;
  const wr = raw.match(/^([A-Za-z]{3,9})\.?\s+(\d{1,2})(?:,?\s*(\d{4}))?$/);
  if (wr) {
    const mo = MONTH_MAP[wr[1].substring(0, 3).toLowerCase()];
    if (mo)
      return `${wr[3] ?? new Date().getFullYear()}-${mo}-${wr[2].padStart(2, "0")}`;
  }
  return null;
}

const MODEL_RE =
  /\b(gpt-[\w\d.\-]+|chatgpt-[\w\d.\-]+|o1(?:-[\w\d.\-]+)?|o3(?:-[\w\d.\-]+)?|o4(?:-[\w\d.\-]+)?|claude-[\w\d.\-]+|gemini-[\w\d.\-]+|mistral-[\w\d.\-]+|llama-?[\w\d.\-]+)/i;

// ── Parser A: horizontal split table ──────────────────────────────────────────
// Handles PDFs where a wide table is split across two page groups:
//   Left-half pages:  Date | Project | API Key | Model | … | Input Tokens
//   Right-half pages: Output Tokens | … | Token Cost ($)
// Rows are in the same order in both halves, so we pair them by position.
function parseHorizontalSplit(text: string) {
  const pages = text.split(/\n--\s*\d+\s+of\s+\d+\s*--\n?/);

  const dateRows: { date: string; model?: string; key?: string }[] = [];
  const costValues: number[] = [];

  for (const page of pages) {
    const lines = page
      .trim()
      .split("\n")
      .map((l) => l.trim())
      .filter(Boolean);
    if (!lines.length) continue;

    const headerBlock = lines.slice(0, 3).join(" ");
    const isDateHalf =
      /\bDate\b/.test(headerBlock) && /Input Tokens/i.test(headerBlock);
    const isCostHalf = /Token Cost/i.test(headerBlock);

    if (isDateHalf) {
      for (const line of lines) {
        const iso = line.match(/^(\d{4}-\d{2}-\d{2})\s/);
        if (!iso) continue;
        const model = line.match(MODEL_RE)?.[1];
        const keyMatch = line.match(/\b([a-z][a-z0-9]*(?:-[a-z0-9]+)+)\b/);
        const key =
          keyMatch && keyMatch[1] !== model?.toLowerCase()
            ? keyMatch[1]
            : undefined;
        dateRows.push({ date: iso[1], model, key });
      }
    } else if (isCostHalf) {
      for (const line of lines) {
        if (/[a-zA-Z]/.test(line)) continue; // skip header/label lines
        const tokens = line.trim().split(/\s+/);
        if (tokens.length < 2) continue;
        // Sum ALL decimal-point values on the line — these are the cost columns
        // (Web Search Cost + Code Execution Cost + Token Cost = Total Cost).
        // Large integers (token counts) never have a decimal point.
        const totalCost = tokens
          .filter((t) => /\.\d/.test(t))
          .reduce((s, t) => s + parseFloat(t), 0);
        if (totalCost >= 0) costValues.push(totalCost);
      }
    }
  }

  if (!dateRows.length || !costValues.length) return null;

  const n = Math.min(dateRows.length, costValues.length);
  const rows = Array.from({ length: n }, (_, i) => ({
    date: dateRows[i].date,
    cost: costValues[i],
    model: dateRows[i].model,
    key: dateRows[i].key,
  }));

  // Model-level totals from summary table: "gpt-5.6 [numbers…] $7,623.45"
  const modelMap: Record<string, number> = {};
  const MSRE =
    /\b(gpt-[\w\d.\-]+|o\d(?:-[\w\d.\-]+)?)\b(?:(?:\s+[\d,]+)+)\s+\$([\d,]+\.\d{2})/g;
  let m: RegExpExecArray | null;
  while ((m = MSRE.exec(text)) !== null) {
    const cost = parseFloat(m[2].replace(/,/g, ""));
    if (!isNaN(cost) && cost > (modelMap[m[1]] ?? 0)) modelMap[m[1]] = cost;
  }

  return { rows, modelMap };
}

// ── Parser B: flat detailed table ─────────────────────────────────────────────
// Handles exports where ALL columns live on one line per usage row, including
// a "Total Cost" column at the far right (e.g. Claude console exports).
// Multiple rows can share the same date; each row's last decimal is Total Cost.
function parseFlatDetailedTable(text: string) {
  const lines = text.split("\n").map((l) => l.trim()).filter(Boolean);

  // Need a header row that has both "Date" and "Total Cost"
  const headerIdx = lines.findIndex(
    (l) => /\bDate\b/i.test(l) && /Total Cost/i.test(l)
  );
  if (headerIdx === -1) return null;

  const rows: { date: string; cost: number; model?: string; key?: string }[] =
    [];
  const modelMap: Record<string, number> = {};

  for (const line of lines.slice(headerIdx + 1)) {
    const iso = line.match(/^(\d{4}-\d{2}-\d{2})\s/);
    if (!iso) continue;
    const date = iso[1];

    // Find all decimal numbers on the line; the LAST one is Total Cost
    const decimals = [...line.matchAll(/\b(\d+\.\d+)\b/g)];
    if (!decimals.length) continue;
    const totalCost = parseFloat(decimals[decimals.length - 1][1]);
    if (isNaN(totalCost) || totalCost < 0) continue;

    const model = line.match(MODEL_RE)?.[1];
    // API keys often look like key_xxx or prod-xxx
    const keyMatch = line.match(/\bkey_[\w]+\b/i) ?? line.match(/\bprod-[\w-]+\b/);

    rows.push({ date, cost: totalCost, model, key: keyMatch?.[0] });
    if (model) modelMap[model] = (modelMap[model] ?? 0) + totalCost;
  }

  return rows.length ? { rows, modelMap } : null;
}

// ── Parser C: generic flat fallback ───────────────────────────────────────────
// Handles any export where each row starts with an ISO date and has one or more
// decimal cost values.  Takes the LAST decimal on each line (= Total Cost when
// multiple cost columns exist) and accumulates — never deduplicates by date so
// multi-row-per-date exports are summed correctly.
function parseFlatText(text: string) {
  const rows: { date: string; cost: number; model?: string; key?: string }[] =
    [];
  const modelMap: Record<string, number> = {};

  const flat = text.replace(/[^\S\n]+/g, " ").replace(/\r/g, "");
  const lines = flat.split("\n").map((l) => l.trim());

  for (const line of lines) {
    // Line must start with an ISO date
    const isoMatch = line.match(/^(\d{4}-\d{2}-\d{2})\s/);
    if (!isoMatch) continue;
    const date = isoMatch[1];

    // Collect ALL decimal numbers on the line
    const decimals = [...line.matchAll(/\b(\d+\.\d+)\b/g)].map((m) =>
      parseFloat(m[1])
    );
    if (!decimals.length) continue;

    // Prefer the last decimal (= Total Cost column) but reject implausibly large
    // values (token counts occasionally have a .0 form)
    const cost = [...decimals].reverse().find((v) => v < 100_000);
    if (cost === undefined || cost <= 0) continue;

    const model = line.match(MODEL_RE)?.[1];
    const keyMatch =
      line.match(/\bkey_[\w]+\b/i) ?? line.match(/\bprod-[\w-]+\b/);
    rows.push({ date, cost, model, key: keyMatch?.[0] });
    if (model) modelMap[model] = (modelMap[model] ?? 0) + cost;
  }

  // Written-month fallback (e.g. "Jul 1 $4.83")
  if (!rows.length) {
    const WRITTEN =
      /\b([A-Za-z]{3,9}\.?\s+\d{1,2}(?:,?\s*\d{4})?)\s+\$?([\d,]+\.\d{2})/g;
    let m: RegExpExecArray | null;
    while ((m = WRITTEN.exec(flat)) !== null) {
      const date = toIso(m[1]);
      const cost = stripCost(m[2]);
      if (date && !isNaN(cost) && cost > 0) rows.push({ date, cost });
    }
  }

  return rows.length ? { rows, modelMap } : null;
}

// ── Route handler ──────────────────────────────────────────────────────────────
export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    if (!file)
      return Response.json({ error: "No file uploaded." }, { status: 400 });

    const buffer = Buffer.from(await file.arrayBuffer());

    let pdfText: string;
    try {
      pdfText = await extractPdfText(buffer);
    } catch (e) {
      console.error("[parse-pdf] extraction error:", e);
      return Response.json(
        {
          error:
            "Could not read the PDF. Make sure it is not password-protected and contains selectable (non-scanned) text.",
        },
        { status: 400 }
      );
    }

    // Try parsers in order of specificity:
    //   A) horizontal split (OpenAI multi-page table)
    //   B) flat detailed   (Claude/Gemini: all cols on one line, Total Cost last)
    //   C) flat summary    (one aggregated row per date)
    const result =
      parseHorizontalSplit(pdfText) ??
      parseFlatDetailedTable(pdfText) ??
      parseFlatText(pdfText);

    if (!result || result.rows.length === 0) {
      return Response.json(
        {
          error:
            "Could not find date and cost data in this PDF. Try exporting as CSV for the most reliable results.",
        },
        { status: 400 }
      );
    }

    console.log(
      `[parse-pdf] OK — ${result.rows.length} rows, ${Object.keys(result.modelMap).length} models`
    );
    return Response.json(result);
  } catch (err) {
    console.error("[parse-pdf] unexpected:", err);
    return Response.json({ error: "Unexpected error parsing PDF." }, { status: 500 });
  }
}
