// pdf-parse is a CommonJS module — must use require() in Next.js App Router
// eslint-disable-next-line @typescript-eslint/no-require-imports
const pdfParse = require("pdf-parse") as (buf: Buffer) => Promise<{ text: string }>;

// ── Helpers ────────────────────────────────────────────────────────────────────
function stripCost(s: string): number {
  return parseFloat(s.replace(/[$,]/g, ""));
}

// Month abbreviations → zero-padded month number
const MONTH_MAP: Record<string, string> = {
  jan: "01", feb: "02", mar: "03", apr: "04", may: "05", jun: "06",
  jul: "07", aug: "08", sep: "09", oct: "10", nov: "11", dec: "12",
};

function toIso(raw: string): string | null {
  raw = raw.trim();
  // Already ISO
  if (/^\d{4}-\d{2}-\d{2}/.test(raw)) return raw.substring(0, 10);
  // M/D/YYYY or MM/DD/YYYY
  const mdy = raw.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (mdy) return `${mdy[3]}-${mdy[1].padStart(2, "0")}-${mdy[2].padStart(2, "0")}`;
  // "Jul 1" / "Jul 01" / "Jul 1, 2026" / "July 1, 2026"
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

// ── Known LLM model name prefixes ─────────────────────────────────────────────
const MODEL_RE =
  /\b(gpt-[\w\d\.\-]+|chatgpt-[\w\d\.\-]+|o1(?:-[\w\d\.\-]+)?|o3(?:-[\w\d\.\-]+)?|o4(?:-[\w\d\.\-]+)?|claude-[\w\d\.\-]+|gemini-[\w\d\.\-]+|mistral-[\w\d\.\-]+|llama-?[\w\d\.\-]+|titan-[\w\d\.\-]+)/gi;

// ── Main text parser ───────────────────────────────────────────────────────────
function parsePdfText(text: string): {
  rows: { date: string; cost: number; model?: string }[];
  modelMap: Record<string, number>;
} | null {
  const modelMap: Record<string, number> = {};

  // Collapse whitespace runs to a single space (preserves line breaks via \n)
  const flat = text.replace(/[^\S\n]+/g, " ").replace(/\r/g, "");
  const lines = flat.split("\n").map((l) => l.trim());

  const rows: { date: string; cost: number; model?: string }[] = [];
  const seenDates = new Set<string>();

  // ── Pass 1: scan every line for date + cost pair ──────────────────────────
  // Works for:
  //   "2026-07-01 $412.41"
  //   "Production - AI Assistant $6,149.52 47.9% 2026-07-01 $412.41"
  //   "Jul 1 $412.41"
  const ISO_IN_LINE = /(\d{4}-\d{2}-\d{2})/g;
  const COST_RE = /\$[\d,]+\.\d{2}|\b\d{1,4},\d{3}\.\d{2}\b|\b\d+\.\d{2}\b/g;

  for (const line of lines) {
    // Find all ISO dates in line
    const dates: string[] = [];
    let m: RegExpExecArray | null;
    ISO_IN_LINE.lastIndex = 0;
    while ((m = ISO_IN_LINE.exec(line)) !== null) dates.push(m[1]);

    if (dates.length === 0) continue;

    // Find all costs in line
    COST_RE.lastIndex = 0;
    const costs: number[] = [];
    while ((m = COST_RE.exec(line)) !== null) {
      const v = stripCost(m[0]);
      if (!isNaN(v) && v > 0) costs.push(v);
    }

    if (costs.length === 0) continue;

    // Pair each date with the cost that appears immediately after it
    // (handles side-by-side table rows)
    for (const date of dates) {
      if (seenDates.has(date)) continue;
      const datePos = line.indexOf(date);
      // Find the first cost that starts after the date
      COST_RE.lastIndex = 0;
      let bestCost: number | null = null;
      while ((m = COST_RE.exec(line)) !== null) {
        if (m.index > datePos) { bestCost = stripCost(m[0]); break; }
      }
      if (bestCost !== null && bestCost > 0 && bestCost < 1_000_000) {
        seenDates.add(date);
        rows.push({ date, cost: bestCost });
      }
    }
  }

  // ── Pass 2: if still no rows, try written-month dates (Jul 1 $412.41) ────
  if (rows.length === 0) {
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

  // ── Pass 3: extract model → cost from any line matching MODEL name + cost ─
  // We scan the whole flat text for "gpt-4o $7,623.45" style entries.
  const modelScan = flat.replace(/\n/g, " ");
  MODEL_RE.lastIndex = 0;
  let mm: RegExpExecArray | null;
  while ((mm = MODEL_RE.exec(modelScan)) !== null) {
    const modelName = mm[1].toLowerCase();
    // Look for a cost in the next ~30 chars
    const after = modelScan.substring(mm.index + mm[0].length, mm.index + mm[0].length + 40);
    const costMatch = after.match(/\$?([\d,]+\.\d{2})/);
    if (costMatch) {
      const cost = stripCost(costMatch[1]);
      if (!isNaN(cost) && cost > 0) {
        // Normalise model name casing to what was found
        const canonical = mm[1];
        modelMap[canonical] = (modelMap[canonical] ?? 0) + cost;
      }
    }
  }

  if (rows.length === 0) return null;
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

    let pdfData: { text: string };
    try {
      pdfData = await pdfParse(buffer);
    } catch {
      return Response.json(
        { error: "Could not read the PDF. Make sure it is not password-protected and contains selectable text." },
        { status: 400 }
      );
    }

    const result = parsePdfText(pdfData.text);
    if (!result || result.rows.length === 0) {
      return Response.json(
        {
          error:
            "Could not find date and cost data in this PDF. The tool works best with usage-export PDFs that include a date column and a cost column. Try exporting as CSV instead.",
        },
        { status: 400 }
      );
    }

    return Response.json(result);
  } catch (err) {
    console.error("[parse-pdf]", err);
    return Response.json({ error: "Unexpected error parsing PDF." }, { status: 500 });
  }
}
