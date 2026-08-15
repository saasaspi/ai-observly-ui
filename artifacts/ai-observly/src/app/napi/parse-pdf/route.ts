// pdf-parse v2 exports a named class, not a default function
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { PDFParse } = require("pdf-parse") as {
  PDFParse: new (opts: { data: Buffer | Uint8Array; verbosity?: number }) => {
    getText: () => Promise<{ text: string }>;
  };
};

// ── Helpers ────────────────────────────────────────────────────────────────────
function stripCost(s: string): number {
  return parseFloat(String(s).replace(/[$,]/g, ""));
}

// Month abbreviations → zero-padded number
const MONTH_MAP: Record<string, string> = {
  jan: "01", feb: "02", mar: "03", apr: "04", may: "05", jun: "06",
  jul: "07", aug: "08", sep: "09", oct: "10", nov: "11", dec: "12",
};

function toIso(raw: string): string | null {
  raw = raw.trim();
  if (/^\d{4}-\d{2}-\d{2}/.test(raw)) return raw.substring(0, 10);
  const mdy = raw.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (mdy) return `${mdy[3]}-${mdy[1].padStart(2, "0")}-${mdy[2].padStart(2, "0")}`;
  const written = raw.match(/^([A-Za-z]{3,9})\.?\s+(\d{1,2})(?:,?\s*(\d{4}))?$/);
  if (written) {
    const mo = MONTH_MAP[written[1].substring(0, 3).toLowerCase()];
    if (mo) {
      const yr = written[3] ?? new Date().getFullYear().toString();
      return `${yr}-${mo}-${written[2].padStart(2, "0")}`;
    }
  }
  return null;
}

// Recognisable LLM model name pattern
const MODEL_RE = /\b(gpt-[\w\d.\-]+|chatgpt-[\w\d.\-]+|o1(?:-[\w\d.\-]+)?|o3(?:-[\w\d.\-]+)?|o4(?:-[\w\d.\-]+)?|claude-[\w\d.\-]+|gemini-[\w\d.\-]+|mistral-[\w\d.\-]+|llama-?[\w\d.\-]+)/i;

// ── Multi-page horizontal-split table parser ───────────────────────────────────
// Some PDF exports split one logical table across two sets of pages:
//   Left-half pages:  Date | Project | API Key | Feature | Model | Capability | Input Tokens
//   Right-half pages: Output Tokens | Cache Read | Cache Write | Web Search $ | Code Exec $ | Token Cost $
// Rows are in the same order on both halves, so we pair them by position.
function parseHorizontalSplitTable(text: string): {
  rows: { date: string; cost: number; model?: string; key?: string }[];
  modelMap: Record<string, number>;
} | null {
  // pdf-parse separates pages with "\n-- N of M --\n"
  const pages = text.split(/\n--\s*\d+\s+of\s+\d+\s*--\n/);

  const dateRows: { date: string; model?: string; key?: string }[] = [];
  const costValues: number[] = [];

  for (const page of pages) {
    const lines = page.trim().split("\n").map((l) => l.trim()).filter(Boolean);
    if (!lines.length) continue;

    // Classify page by checking the first 3 lines for known header words
    const headerBlock = lines.slice(0, 3).join(" ");
    const isDateHalf =
      /\bDate\b/.test(headerBlock) && /Input Tokens/i.test(headerBlock);
    const isCostHalf = /Token Cost/i.test(headerBlock);

    if (isDateHalf) {
      // Header row — skip lines until the first data row (ISO date)
      for (const line of lines) {
        const isoMatch = line.match(/^(\d{4}-\d{2}-\d{2})\s/);
        if (!isoMatch) continue;
        const date = isoMatch[1];
        const modelMatch = line.match(MODEL_RE);
        // API keys are compact hyphen-separated slugs like prod-assistant, staging
        const keyMatch = line.match(/\b([a-z][a-z0-9]*(?:-[a-z0-9]+)+)\b/);
        // Exclude model names from key match
        const key =
          keyMatch && keyMatch[1] !== modelMatch?.[1]?.toLowerCase()
            ? keyMatch[1]
            : undefined;
        dateRows.push({ date, model: modelMatch?.[1], key });
      }
    } else if (isCostHalf) {
      // Each data row is all numbers; the LAST number is Token Cost ($)
      for (const line of lines) {
        if (/[a-zA-Z]/.test(line)) continue; // skip header/label lines
        const tokens = line.trim().split(/\s+/);
        if (tokens.length < 2) continue;
        const last = parseFloat(tokens[tokens.length - 1]);
        if (!isNaN(last) && last >= 0) costValues.push(last);
      }
    }
  }

  // ── Build paired rows ──────────────────────────────────────────────────────
  const pairedRows: { date: string; cost: number; model?: string; key?: string }[] = [];
  const n = Math.min(dateRows.length, costValues.length);
  for (let i = 0; i < n; i++) {
    pairedRows.push({
      date: dateRows[i].date,
      cost: costValues[i],
      model: dateRows[i].model,
      key: dateRows[i].key,
    });
  }

  // ── Extract model-level totals from summary tables ─────────────────────────
  // Pattern: "gpt-5.6  145174563  30088891  ... $7,623.45"
  const modelMap: Record<string, number> = {};
  const MODEL_SUMMARY_RE =
    /\b(gpt-[\w\d.\-]+|o\d(?:-[\w\d.\-]+)?)\b(?:(?:\s+[\d,]+)+)\s+\$([\d,]+\.\d{2})/g;
  let m: RegExpExecArray | null;
  while ((m = MODEL_SUMMARY_RE.exec(text)) !== null) {
    const model = m[1];
    const cost = parseFloat(m[2].replace(/,/g, ""));
    if (!isNaN(cost) && cost > 0 && cost > (modelMap[model] ?? 0)) {
      modelMap[model] = cost; // keep the largest (= summary total)
    }
  }

  if (pairedRows.length === 0 && Object.keys(modelMap).length === 0) return null;
  return { rows: pairedRows, modelMap };
}

// ── Flat same-line parser ──────────────────────────────────────────────────────
// For standard exports where each line has date + cost on the same line.
function parseFlatText(text: string): {
  rows: { date: string; cost: number; model?: string; key?: string }[];
  modelMap: Record<string, number>;
} | null {
  const modelMap: Record<string, number> = {};
  const rows: { date: string; cost: number; model?: string; key?: string }[] = [];
  const seenDates = new Set<string>();

  const flat = text.replace(/[^\S\n]+/g, " ").replace(/\r/g, "");
  const lines = flat.split("\n").map((l) => l.trim());

  const ISO_IN_LINE = /(\d{4}-\d{2}-\d{2})/g;
  const COST_RE = /\$[\d,]+\.\d{2}|\b\d{1,4},\d{3}\.\d{2}\b|\b\d+\.\d{2}\b/g;

  for (const line of lines) {
    ISO_IN_LINE.lastIndex = 0;
    const dates: string[] = [];
    let m: RegExpExecArray | null;
    while ((m = ISO_IN_LINE.exec(line)) !== null) dates.push(m[1]);
    if (!dates.length) continue;

    COST_RE.lastIndex = 0;
    const costs: { pos: number; val: number }[] = [];
    while ((m = COST_RE.exec(line)) !== null) {
      const v = stripCost(m[0]);
      if (!isNaN(v) && v > 0) costs.push({ pos: m.index, val: v });
    }
    if (!costs.length) continue;

    for (const date of dates) {
      if (seenDates.has(date)) continue;
      const datePos = line.indexOf(date);
      const after = costs.find((c) => c.pos > datePos);
      if (after && after.val < 1_000_000) {
        seenDates.add(date);
        const modelMatch = line.match(MODEL_RE);
        rows.push({ date, cost: after.val, model: modelMatch?.[1] });
      }
    }
  }

  // Written-month fallback
  if (!rows.length) {
    const WRITTEN = /\b([A-Za-z]{3,9}\.?\s+\d{1,2}(?:,?\s*\d{4})?)\s+\$?([\d,]+\.\d{2})/g;
    WRITTEN.lastIndex = 0;
    let m2: RegExpExecArray | null;
    while ((m2 = WRITTEN.exec(flat)) !== null) {
      const date = toIso(m2[1]);
      const cost = stripCost(m2[2]);
      if (date && !isNaN(cost) && cost > 0 && !seenDates.has(date)) {
        seenDates.add(date);
        rows.push({ date, cost });
      }
    }
  }

  // Model summary scan
  const MODEL_FULL = flat.replace(/\n/g, " ");
  const MODEL_SCAN_RE =
    /\b(gpt-[\w\d.\-]+|claude-[\w\d.\-]+|gemini-[\w\d.\-]+|o\d(?:-[\w\d.\-]+)?)\b/gi;
  let mm: RegExpExecArray | null;
  MODEL_SCAN_RE.lastIndex = 0;
  while ((mm = MODEL_SCAN_RE.exec(MODEL_FULL)) !== null) {
    const after = MODEL_FULL.substring(mm.index + mm[0].length, mm.index + mm[0].length + 40);
    const costMatch = after.match(/\$?([\d,]+\.\d{2})/);
    if (costMatch) {
      const cost = stripCost(costMatch[1]);
      if (!isNaN(cost) && cost > 0) {
        const key = mm[1];
        modelMap[key] = (modelMap[key] ?? 0) + cost;
      }
    }
  }

  if (!rows.length) return null;
  return { rows, modelMap };
}

// ── Route handler ──────────────────────────────────────────────────────────────
export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    if (!file) {
      return Response.json({ error: "No file uploaded." }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    let pdfText: string;
    try {
      const parser = new PDFParse({ data: buffer, verbosity: 0 });
      const result = await parser.getText();
      pdfText = result.text;
    } catch (e) {
      console.error("[parse-pdf] pdfjs error:", e);
      return Response.json(
        {
          error:
            "Could not read the PDF. Make sure it is not password-protected and contains selectable (non-scanned) text.",
        },
        { status: 400 }
      );
    }

    // Try the split-table parser first (handles multi-page column-split exports),
    // then fall back to the same-line parser (handles flat exports).
    let result =
      parseHorizontalSplitTable(pdfText) ?? parseFlatText(pdfText);

    if (!result || result.rows.length === 0) {
      return Response.json(
        {
          error:
            "Could not find date and cost data in this PDF. The tool works best with usage-export PDFs that contain a Date column and a cost column. Try exporting as CSV for the most reliable results.",
        },
        { status: 400 }
      );
    }

    console.log(
      `[parse-pdf] extracted ${result.rows.length} rows, ${Object.keys(result.modelMap).length} models`
    );
    return Response.json(result);
  } catch (err) {
    console.error("[parse-pdf] unexpected error:", err);
    return Response.json({ error: "Unexpected error parsing PDF." }, { status: 500 });
  }
}
