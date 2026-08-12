"use client";
import { useState, useRef, useCallback } from "react";
import { PublicLayout } from "@/components/public-layout";
import Link from "next/link";
import Papa from "papaparse";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  LineChart, Line, ReferenceDot,
} from "recharts";
import {
  Upload, ChevronDown, ChevronUp, CheckCircle2, AlertCircle,
  Copy, ArrowRight, ExternalLink, RefreshCw, TrendingUp, Shield, Zap,
} from "lucide-react";

// ── Types ──────────────────────────────────────────────────────────────────────
interface ParsedRow {
  date: string;
  cost: number;
  model?: string;
  key?: string;
  inputTokens?: number;
  cacheReadTokens?: number;
}
interface DailyData { date: string; label: string; cost: number; }
interface Report {
  totalSpend: number;
  dayCount: number;
  projectedMonth: number | null;
  projectedYear: number | null;
  byModel: { model: string; cost: number; share: number }[];
  byDay: DailyData[];
  chartData: { label: string; cost: number; isSpike: boolean }[];
  isWeekly: boolean;
  cacheEfficiency: number | null;
  premiumShare: number | null;
  spikes: DailyData[];
  keyConc: { topKey: string; share: number } | null;
  hasKeyCol: boolean;
  topModel: { model: string; share: number } | null;
  healthScore: number;
  grade: string;
  gradeColor: string;
  startDate: string;
  endDate: string;
}

// ── Column name variants ───────────────────────────────────────────────────────
const COST_COLS = ["total cost (usd)", "cost", "amount", "total_cost", "cost_usd", "total cost", "amount (usd)", "charges", "spend"];
const DATE_COLS = ["date", "day", "timestamp", "time", "period", "usage_date", "start_time"];
const MODEL_COLS = ["model", "model_name", "ai model", "engine", "model_id"];
const KEY_COLS = ["api key", "api_key", "key", "project", "organization", "project_name", "user_id", "key_name"];
const INPUT_COLS = ["input tokens", "input_tokens", "prompt tokens", "prompt_tokens", "input token count"];
const CACHE_COLS = ["cache read tokens", "cache_read_tokens", "cached tokens", "cached_input_tokens", "cache read input tokens"];
const PREMIUM_TERMS = ["opus", "ultra", "gpt-5", "gpt-4", "o1", "o3", "pro", "sonnet", "haiku", "gemini-1.5-pro", "claude-3"];

const norm = (s: string) => s.toLowerCase().trim().replace(/\s+/g, " ");
const findCol = (headers: string[], variants: string[]) => headers.find(h => variants.includes(norm(h)));

// ── Date parsing ───────────────────────────────────────────────────────────────
function parseDate(s: string): string | null {
  if (!s) return null;
  s = String(s).trim();
  // YYYY-MM-DD
  if (/^\d{4}-\d{2}-\d{2}/.test(s)) return s.substring(0, 10);
  // MM/DD/YYYY or DD/MM/YYYY
  const parts = s.split(/[\/\-\.\s]/);
  if (parts.length >= 3) {
    const nums = parts.map(Number);
    if (nums[2] > 1000) return `${nums[2]}-${String(nums[0]).padStart(2, "0")}-${String(nums[1]).padStart(2, "0")}`;
    if (nums[0] > 1000) return `${nums[0]}-${String(nums[1]).padStart(2, "0")}-${String(nums[2]).padStart(2, "0")}`;
  }
  // ISO date-time
  const d = new Date(s);
  if (!isNaN(d.getTime())) return d.toISOString().substring(0, 10);
  return null;
}

function fmtDate(iso: string): string {
  const [, m, d] = iso.split("-");
  const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  return `${months[parseInt(m) - 1]} ${parseInt(d)}`;
}

function fmtDollar(n: number) { return "$" + n.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ","); }

// ── Health score ───────────────────────────────────────────────────────────────
function calcHealth(cacheEff: number | null, premShare: number | null, spikes: number, keyShare: number | null): { score: number; grade: string; gradeColor: string } {
  let score = 100;
  if (cacheEff !== null) {
    if (cacheEff < 0.20) score -= 15;
    else if (cacheEff < 0.40) score -= 8;
  }
  if (premShare !== null) {
    if (premShare > 0.60) score -= 20;
    else if (premShare > 0.40) score -= 10;
  }
  score -= Math.min(spikes, 3) * 8;
  if (keyShare !== null) {
    if (keyShare > 0.80) score -= 15;
    else if (keyShare > 0.60) score -= 8;
  }
  score = Math.max(0, Math.min(100, score));
  let grade: string;
  let gradeColor: string;
  if (score >= 90) { grade = "Excellent — you're running a tight ship"; gradeColor = "text-green-600"; }
  else if (score >= 75) { grade = "Good — a few things worth tightening"; gradeColor = "text-blue-600"; }
  else if (score >= 55) { grade = "Needs attention — some margin leaks worth fixing"; gradeColor = "text-yellow-600"; }
  else { grade = "High risk — significant cost inefficiencies detected"; gradeColor = "text-red-600"; }
  return { score, grade, gradeColor };
}

// ── CSV parsing + analysis ─────────────────────────────────────────────────────
function analyzeCSV(csvText: string): { report: Report } | { error: string } {
  const parsed = Papa.parse<Record<string, string>>(csvText, {
    header: true, skipEmptyLines: true, transformHeader: (h) => h.trim(),
  });

  const headers = parsed.meta.fields ?? [];
  const dateCol = findCol(headers, DATE_COLS);
  const costCol = findCol(headers, COST_COLS);
  if (!dateCol) return { error: `Couldn't find a date column. Expected one of: ${DATE_COLS.slice(0, 5).join(", ")}.` };
  if (!costCol) return { error: `Couldn't find a cost column. Expected one of: ${COST_COLS.slice(0, 5).join(", ")}.` };

  const modelCol = findCol(headers, MODEL_COLS);
  const keyCol = findCol(headers, KEY_COLS);
  const inputCol = findCol(headers, INPUT_COLS);
  const cacheCol = findCol(headers, CACHE_COLS);

  const rows: ParsedRow[] = [];
  for (const raw of parsed.data) {
    const date = parseDate(raw[dateCol!] ?? "");
    const cost = parseFloat(raw[costCol!] ?? "0");
    if (!date || isNaN(cost) || cost < 0) continue;
    rows.push({
      date,
      cost,
      model: modelCol ? raw[modelCol]?.trim() : undefined,
      key: keyCol ? raw[keyCol]?.trim() : undefined,
      inputTokens: inputCol ? parseInt(raw[inputCol] ?? "0") || undefined : undefined,
      cacheReadTokens: cacheCol ? parseInt(raw[cacheCol] ?? "0") || undefined : undefined,
    });
  }

  if (rows.length === 0) return { error: "The file was parsed but no valid rows were found. Make sure it has date and cost columns with data." };

  // Aggregate by day
  const byDayMap = new Map<string, number>();
  rows.forEach(r => byDayMap.set(r.date, (byDayMap.get(r.date) ?? 0) + r.cost));
  const byDay = Array.from(byDayMap.entries()).sort(([a], [b]) => a.localeCompare(b)).map(([date, cost]) => ({ date, label: fmtDate(date), cost }));

  const dayCount = byDay.length;
  const totalSpend = rows.reduce((s, r) => s + r.cost, 0);
  const avgDaily = totalSpend / Math.max(dayCount, 1);
  const projectedMonth = dayCount >= 3 ? avgDaily * 30 : null;
  const projectedYear = dayCount >= 3 ? avgDaily * 365 : null;

  // Detect spikes (>50% jump over previous day, meaningful dollar amount)
  const spikes: DailyData[] = [];
  for (let i = 1; i < byDay.length; i++) {
    const prev = byDay[i - 1].cost;
    const curr = byDay[i].cost;
    if (prev > 0 && curr / prev - 1 > 0.5 && curr - prev > 5) {
      spikes.push(byDay[i]);
    }
  }

  // Model breakdown
  const modelMap = new Map<string, number>();
  rows.forEach(r => { if (r.model) modelMap.set(r.model, (modelMap.get(r.model) ?? 0) + r.cost); });
  const byModel = Array.from(modelMap.entries())
    .map(([model, cost]) => ({ model, cost, share: totalSpend > 0 ? cost / totalSpend : 0 }))
    .sort((a, b) => b.cost - a.cost);

  // Premium model share
  let premiumShare: number | null = null;
  if (byModel.length > 0) {
    const premiumCost = byModel.filter(m => PREMIUM_TERMS.some(t => m.model.toLowerCase().includes(t))).reduce((s, m) => s + m.cost, 0);
    premiumShare = totalSpend > 0 ? premiumCost / totalSpend : 0;
    if (premiumShare < 0.20) premiumShare = null; // skip if <20%
  }

  // Cache efficiency
  let cacheEfficiency: number | null = null;
  if (inputCol && cacheCol) {
    const totalInput = rows.reduce((s, r) => s + (r.inputTokens ?? 0), 0);
    const totalCache = rows.reduce((s, r) => s + (r.cacheReadTokens ?? 0), 0);
    if (totalInput + totalCache > 0) cacheEfficiency = totalCache / (totalInput + totalCache);
  }

  // Key concentration
  let keyConc: { topKey: string; share: number } | null = null;
  if (keyCol) {
    const keyMap = new Map<string, number>();
    rows.forEach(r => { if (r.key) keyMap.set(r.key, (keyMap.get(r.key) ?? 0) + r.cost); });
    if (keyMap.size > 0) {
      const top = Array.from(keyMap.entries()).sort(([, a], [, b]) => b - a)[0];
      keyConc = { topKey: top[0], share: totalSpend > 0 ? top[1] / totalSpend : 0 };
    }
  }

  // Top model
  const topModel = byModel.length > 0 ? { model: byModel[0].model, share: byModel[0].share } : null;

  // Chart data (weekly grouping if >14 days)
  const isWeekly = dayCount > 14;
  let chartData: { label: string; cost: number; isSpike: boolean }[];
  const spikeSet = new Set(spikes.map(s => s.date));

  if (!isWeekly) {
    chartData = byDay.map(d => ({ label: d.label, cost: parseFloat(d.cost.toFixed(2)), isSpike: spikeSet.has(d.date) }));
  } else {
    const weekMap = new Map<string, { label: string; cost: number; hasSpike: boolean }>();
    byDay.forEach(d => {
      const dt = new Date(d.date + "T00:00:00Z");
      const week = Math.floor((dt.getTime() - new Date("2000-01-03T00:00:00Z").getTime()) / (7 * 86400000));
      const key = `${week}`;
      if (!weekMap.has(key)) weekMap.set(key, { label: `Wk of ${d.label}`, cost: 0, hasSpike: false });
      const w = weekMap.get(key)!;
      w.cost += d.cost;
      if (spikeSet.has(d.date)) w.hasSpike = true;
    });
    chartData = Array.from(weekMap.values()).map(w => ({ label: w.label, cost: parseFloat(w.cost.toFixed(2)), isSpike: w.hasSpike }));
  }

  const { score, grade, gradeColor } = calcHealth(cacheEfficiency, premiumShare, spikes.length, keyConc?.share ?? null);

  return {
    report: {
      totalSpend, dayCount, projectedMonth, projectedYear,
      byModel, byDay, chartData, isWeekly,
      cacheEfficiency, premiumShare, spikes,
      keyConc, hasKeyCol: !!keyCol,
      topModel, healthScore: score, grade, gradeColor,
      startDate: byDay[0]?.date ?? "", endDate: byDay[byDay.length - 1]?.date ?? "",
    }
  };
}

// ── Sample CSV generator ───────────────────────────────────────────────────────
const GPT4O = [13.00,14.70,14.30,15.60,13.40,15.00,13.80,16.30,13.20,15.40,14.00,13.60,15.30,12.90,15.70,52.80,14.10,14.60,13.90,16.00,13.10,14.80,14.20,15.90,13.30,15.20,13.70,16.10,13.00,14.90];
const MINI  = [11.20,10.40,12.10,11.80,10.60,12.30,11.00,10.80,12.50,11.40,10.90,12.00,11.60,10.70,12.40,11.30,10.50,12.20,11.10,10.30,12.60,11.50,10.20,12.70,11.70,10.80,12.30,11.40,10.60,12.80];
function generateSampleCSV(): string {
  const lines = ["Date,Model,Total Cost (USD),Input Tokens,Output Tokens,Cache Read Tokens,API Key"];
  for (let d = 0; d < 30; d++) {
    const date = `2026-06-${String(d + 1).padStart(2, "0")}`;
    const g = GPT4O[d];
    const gInput = Math.round(g * 14000), gCache = Math.round(gInput * 0.17), gOut = Math.round(g * 3500);
    lines.push(`${date},gpt-4o-2024-11-20,${g.toFixed(2)},${gInput},${gOut},${gCache},Production`);
    const m = MINI[d];
    const mInput = Math.round(m * 85000), mCache = Math.round(mInput * 0.22), mOut = Math.round(m * 28000);
    const mKey = d % 2 === 0 ? "Development" : "Production";
    lines.push(`${date},gpt-4o-mini-2024-07-18,${m.toFixed(2)},${mInput},${mOut},${mCache},${mKey}`);
  }
  return lines.join("\n");
}

// ── Recharts custom tooltip ────────────────────────────────────────────────────
function ChartTooltip({ active, payload, label }: { active?: boolean; payload?: { value: number }[]; label?: string }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-card border border-border rounded-lg px-3 py-2 shadow-lg text-sm">
      <p className="text-muted-foreground mb-0.5">{label}</p>
      <p className="font-bold text-foreground">{fmtDollar(payload[0].value)}</p>
    </div>
  );
}

// ── Two-segment bar ────────────────────────────────────────────────────────────
function SegmentBar({ share, leftColor, leftLabel, rightLabel }: { share: number; leftColor: string; leftLabel: string; rightLabel: string }) {
  const pct = Math.round(share * 100);
  return (
    <div className="space-y-2">
      <div className="flex items-center h-5 rounded-full overflow-hidden bg-muted w-full">
        <div className={`h-full ${leftColor} transition-all duration-700`} style={{ width: `${pct}%` }} />
      </div>
      <div className="flex justify-between text-xs text-muted-foreground">
        <span className="font-medium">{leftLabel} — {pct}%</span>
        <span>{rightLabel} — {100 - pct}%</span>
      </div>
    </div>
  );
}

// ── Provider instructions ──────────────────────────────────────────────────────
function ProviderInstructions() {
  const [open, setOpen] = useState(false);
  const providers = [
    { name: "Claude (Anthropic)", steps: "Console → Usage & Cost → pick a month → Export CSV.", url: "https://console.anthropic.com/settings/usage", urlLabel: "Anthropic Console" },
    { name: "OpenAI", steps: "platform.openai.com → Usage → Export → download the cost CSV.", url: "https://platform.openai.com/usage", urlLabel: "OpenAI Usage" },
    { name: "Gemini (Google Cloud)", steps: "Google Cloud Billing → Reports → set your billing period → Download CSV.", url: "https://cloud.google.com/billing/docs/how-to/export-data-overview", urlLabel: "GCP Billing Docs" },
  ];
  return (
    <div className="mt-4 border border-border rounded-xl overflow-hidden">
      <button className="w-full flex items-center justify-between p-4 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors" onClick={() => setOpen(!open)}>
        <span>Not sure where to find this file?</span>
        {open ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
      </button>
      {open && (
        <div className="border-t border-border divide-y divide-border">
          {providers.map(p => (
            <div key={p.name} className="p-4">
              <p className="text-sm font-semibold text-foreground mb-1">{p.name}</p>
              <p className="text-sm text-muted-foreground mb-2">{p.steps}</p>
              <a href={p.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-xs text-primary hover:underline">
                <ExternalLink className="w-3 h-3" /> {p.urlLabel}
              </a>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Main page ──────────────────────────────────────────────────────────────────
export default function SpendCheckupPage() {
  const [stage, setStage] = useState<"upload" | "report">("upload");
  const [report, setReport] = useState<Report | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isSample, setIsSample] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const processText = useCallback((text: string, sample = false) => {
    setErrorMsg(null);
    const result = analyzeCSV(text);
    if ("error" in result) { setErrorMsg(result.error); return; }
    setReport(result.report);
    setIsSample(sample);
    setStage("report");
    setTimeout(() => window.scrollTo({ top: 0, behavior: "smooth" }), 50);
  }, []);

  const handleFile = (file: File) => {
    if (!file.name.endsWith(".csv") && file.type !== "text/csv") { setErrorMsg("Please upload a .csv file."); return; }
    const reader = new FileReader();
    reader.onload = (e) => processText(e.target?.result as string);
    reader.readAsText(file);
  };

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault(); setIsDragging(false);
    const f = e.dataTransfer.files[0]; if (f) handleFile(f);
  }, []);

  const copySummary = () => {
    if (!report) return;
    const txt = [
      `AI Spend Check-up Report`,
      `Period: ${fmtDate(report.startDate)} – ${fmtDate(report.endDate)}`,
      `Health Score: ${report.healthScore}/100 — ${report.grade}`,
      `Total Spend: ${fmtDollar(report.totalSpend)}`,
      report.projectedMonth ? `Projected Monthly: ${fmtDollar(report.projectedMonth)}` : "",
      report.projectedYear ? `Projected Annual: ${fmtDollar(report.projectedYear)}` : "",
    ].filter(Boolean).join("\n");
    navigator.clipboard.writeText(txt).then(() => { setCopied(true); setTimeout(() => setCopied(false), 2000); });
  };

  // ── Upload stage ──
  if (stage === "upload") {
    return (
      <PublicLayout>
        <section className="py-20 px-6 max-w-2xl mx-auto w-full">
          <div className="text-center mb-10">
            <div className="inline-flex items-center rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary mb-6">
              Free tool · No sign-up required
            </div>
            <h1 className="text-4xl md:text-5xl font-bold font-outfit mb-4">The AI Spend Check-up</h1>
            <p className="text-muted-foreground text-lg leading-relaxed max-w-lg mx-auto">
              Upload your Claude, OpenAI, or Gemini billing CSV. Get the plain-English version — no token jargon, just what it means for your business.
            </p>
          </div>

          {/* Upload area */}
          <div
            className={`relative border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-all duration-200 ${isDragging ? "border-primary bg-primary/5 scale-[1.01]" : "border-border hover:border-primary/50 hover:bg-muted/30"}`}
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={onDrop}
            onClick={() => fileRef.current?.click()}
          >
            <input ref={fileRef} type="file" accept=".csv" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }} />
            <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary mx-auto mb-4">
              <Upload className="w-7 h-7" />
            </div>
            <p className="font-semibold text-foreground text-lg mb-1">Drop your billing CSV here</p>
            <p className="text-sm text-muted-foreground">or click to browse — .csv files only</p>
          </div>

          {errorMsg && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-xl flex gap-3 text-sm text-red-700">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
              <div><strong>Couldn't parse this file.</strong> {errorMsg}</div>
            </div>
          )}

          <div className="mt-4 text-center">
            <button onClick={() => processText(generateSampleCSV(), true)} className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline">
              Don&apos;t have a file handy? Try it with sample data <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <ProviderInstructions />

          <p className="text-xs text-muted-foreground text-center mt-8">
            Your file is processed entirely in your browser — it&apos;s never uploaded anywhere.
          </p>
        </section>
      </PublicLayout>
    );
  }

  if (!report) return null;

  // ── Report stage ──
  const topKeyShare = report.keyConc?.share ?? 0;

  return (
    <PublicLayout>
      <div className="max-w-3xl mx-auto px-6 py-12 w-full space-y-10">

        {/* Header + reset */}
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            {isSample && (
              <div className="inline-flex items-center gap-1.5 rounded-full bg-yellow-100 border border-yellow-200 text-yellow-700 text-xs font-semibold px-3 py-1 mb-3">
                Sample data — upload your own CSV to analyse your real spend
              </div>
            )}
            <h1 className="text-2xl font-bold font-outfit mb-1">AI Spend Check-up Report</h1>
            <p className="text-muted-foreground text-sm">{fmtDate(report.startDate)} – {fmtDate(report.endDate)} · {report.dayCount} day{report.dayCount !== 1 ? "s" : ""}</p>
          </div>
          <button onClick={() => { setStage("upload"); setReport(null); setErrorMsg(null); }} className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground border border-border rounded-lg px-4 py-2 hover:bg-muted transition-colors">
            <RefreshCw className="w-4 h-4" /> New file
          </button>
        </div>

        {/* Score + stats */}
        <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
          <div className="flex items-start gap-6 flex-wrap">
            {/* Score circle */}
            <div className="flex flex-col items-center shrink-0">
              <div className="relative w-24 h-24">
                <svg viewBox="0 0 36 36" className="w-24 h-24 -rotate-90">
                  <circle cx="18" cy="18" r="15.9" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-muted/30" />
                  <circle cx="18" cy="18" r="15.9" fill="none" stroke="currentColor" strokeWidth="2.5" strokeDasharray={`${report.healthScore} ${100 - report.healthScore}`} strokeLinecap="round" className={report.healthScore >= 75 ? "text-green-500" : report.healthScore >= 55 ? "text-yellow-500" : "text-red-500"} />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-2xl font-bold font-outfit">{report.healthScore}</span>
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-1 font-medium">out of 100</p>
            </div>
            {/* Grade + actions */}
            <div className="flex-1 min-w-0">
              <p className={`text-base font-semibold mb-1 ${report.gradeColor}`}>{report.grade}</p>
              <p className="text-sm text-muted-foreground mb-4">Cost Health Score based on cache efficiency, model mix, spend spikes, and cost concentration.</p>
              <button onClick={copySummary} className="inline-flex items-center gap-2 text-sm font-medium border border-border rounded-lg px-4 py-2 hover:bg-muted transition-colors">
                {copied ? <CheckCircle2 className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                {copied ? "Copied!" : "Copy summary"}
              </button>
            </div>
          </div>

          {/* 3 stat cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6 pt-6 border-t border-border">
            {[
              { label: "Total spend", value: fmtDollar(report.totalSpend), sub: `over ${report.dayCount} days` },
              { label: "Projected this month", value: report.projectedMonth ? fmtDollar(report.projectedMonth) : "—", sub: report.projectedMonth ? "at current daily pace" : "need ≥3 days of data" },
              { label: "Projected annual", value: report.projectedYear ? fmtDollar(report.projectedYear) : "—", sub: report.projectedYear ? "if nothing changes" : "need ≥3 days of data" },
            ].map(s => (
              <div key={s.label} className="bg-background border border-border rounded-xl p-4">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-1">{s.label}</p>
                <p className="text-2xl font-bold font-outfit text-foreground">{s.value}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{s.sub}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Where your money's going (model bars) */}
        {report.byModel.length > 0 && (
          <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
            <h2 className="font-bold text-lg font-outfit mb-5">Where your money&apos;s going</h2>
            <div className="space-y-4">
              {report.byModel.map(m => (
                <div key={m.model}>
                  <div className="flex justify-between text-sm mb-1.5">
                    <span className="font-medium text-foreground truncate max-w-[60%]">{m.model}</span>
                    <span className="text-muted-foreground shrink-0">{fmtDollar(m.cost)} <span className="text-foreground font-semibold">({Math.round(m.share * 100)}%)</span></span>
                  </div>
                  <div className="h-3 rounded-full bg-muted overflow-hidden">
                    <div className="h-full bg-primary rounded-full transition-all duration-700" style={{ width: `${m.share * 100}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Spend over time chart */}
        <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
          <h2 className="font-bold text-lg font-outfit mb-1">Spend over time</h2>
          <p className="text-sm text-muted-foreground mb-5">{report.isWeekly ? "Grouped by week (30+ days of data)" : "Daily spend"}</p>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={report.chartData} margin={{ top: 4, right: 4, bottom: 4, left: 4 }}>
              <XAxis dataKey="label" tick={{ fontSize: 10 }} tickLine={false} axisLine={false} interval="preserveStartEnd" />
              <YAxis tickFormatter={(v) => `$${v}`} tick={{ fontSize: 10 }} tickLine={false} axisLine={false} width={48} />
              <Tooltip content={<ChartTooltip />} cursor={{ fill: "var(--muted)", opacity: 0.5 }} />
              <Bar dataKey="cost" radius={[4, 4, 0, 0]}>
                {report.chartData.map((entry, i) => (
                  <rect key={i} fill={entry.isSpike ? "#ef4444" : "var(--primary)"} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
          {report.spikes.length > 0 && (
            <p className="text-xs text-red-600 mt-3 flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500 shrink-0" />
              Red bars = spend spike days (more than 50% above the previous day)
            </p>
          )}
        </div>

        {/* What we noticed */}
        <div>
          <h2 className="font-bold text-xl font-outfit mb-4">What we noticed</h2>
          <div className="space-y-4">

            {/* Biggest cost driver — always shown if model data available */}
            {report.topModel && (
              <InsightCard
                label={`Top model: ${Math.round(report.topModel.share * 100)}% of spend`}
                title="Biggest cost driver"
                body={`${report.topModel.model} accounts for ${Math.round(report.topModel.share * 100)}% of your total AI spend. If you can reduce calls to this model, route eligible requests to a cheaper alternative, or cache frequent responses, the savings will be proportional to its share.`}
                icon={<TrendingUp className="w-5 h-5" />}
              />
            )}

            {/* Cache efficiency */}
            {report.cacheEfficiency !== null && (
              <InsightCard
                label={`cache_hit_rate: ${Math.round(report.cacheEfficiency * 100)}%`}
                title={report.cacheEfficiency < 0.25 ? "Low prompt cache reuse — you're rebuilding context from scratch most of the time" : "Cache efficiency is reasonable"}
                body={report.cacheEfficiency < 0.25
                  ? `Only ${Math.round(report.cacheEfficiency * 100)}% of your input tokens are being served from cache. The other ${Math.round((1 - report.cacheEfficiency) * 100)}% are re-sent on every request. For any workflow that re-uses the same system prompt or context, enabling prompt caching can cut input costs by 50–90%.`
                  : `${Math.round(report.cacheEfficiency * 100)}% of your input tokens are being served from cache — that means less than half are being rebuilt from scratch on each request. There's still room to improve, but you're not starting from zero.`}
                icon={<Shield className="w-5 h-5" />}
                visual={<SegmentBar share={report.cacheEfficiency} leftColor="bg-primary" leftLabel="Cached" rightLabel="Fresh input" />}
              />
            )}

            {/* Premium model share — only if ≥20% */}
            {report.premiumShare !== null && (
              <InsightCard
                label={`premium_model_share: ${Math.round(report.premiumShare * 100)}%`}
                title={`${Math.round(report.premiumShare * 100)}% of your spend is going to your most expensive model(s)`}
                body={`Over half of your costs are coming from your priciest model. That's not necessarily wrong — but it's worth asking which of those calls actually need that level of capability, and which could be handled by a smaller, cheaper model for a fraction of the cost.`}
                icon={<Zap className="w-5 h-5" />}
                visual={<SegmentBar share={report.premiumShare} leftColor="bg-orange-400" leftLabel="Premium models" rightLabel="Other models" />}
              />
            )}

            {/* Spend spikes */}
            <InsightCard
              label={report.spikes.length > 0 ? `spend_spikes: ${report.spikes.length} detected` : "spend_spikes: none"}
              title={report.spikes.length > 0 ? `${report.spikes.length} spend spike${report.spikes.length > 1 ? "s" : ""} detected` : "No spend spikes — consistent daily usage"}
              body={report.spikes.length > 0
                ? `${report.spikes.map(s => {
                    const prev = report.byDay.find(d => d.date < s.date)?.cost ?? 0;
                    const pct = prev > 0 ? Math.round((s.cost / prev - 1) * 100) : 0;
                    return `${s.label} was ${pct}% above the previous day (${fmtDollar(s.cost)} vs ${fmtDollar(prev)})`;
                  }).join("; ")}. Spikes like these are worth investigating — a runaway job, a bad retry loop, or an unexpected traffic surge can inflate your bill significantly in a short window.`
                : "Your spend was consistent across the period — no single day jumped more than 50% above the previous one. That's a sign your AI usage is predictable and well-controlled."}
              icon={<AlertCircle className="w-5 h-5" />}
              visual={report.spikes.length > 0 ? (
                <div className="mt-3">
                  <ResponsiveContainer width="100%" height={60}>
                    <LineChart data={report.byDay.map(d => ({ ...d, value: d.cost }))}>
                      <Line type="monotone" dataKey="value" stroke="var(--primary)" strokeWidth={1.5} dot={false} />
                      {report.spikes.map(s => (
                        <ReferenceDot key={s.date} x={s.label} y={s.cost} r={5} fill="#ef4444" stroke="white" strokeWidth={2} />
                      ))}
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              ) : undefined}
            />

            {/* Key concentration */}
            {report.hasKeyCol && report.keyConc && (
              <InsightCard
                label={`key_concentration: ${Math.round(topKeyShare * 100)}% from "${report.keyConc.topKey}"`}
                title={topKeyShare > 0.80 ? `Almost all your spend is coming from one API key` : `Most spend is concentrated in one key or project`}
                body={`"${report.keyConc.topKey}" accounts for ${Math.round(topKeyShare * 100)}% of your total AI cost. With this level of concentration, you can't tell which customer, feature, or workflow the remaining ${Math.round((1 - topKeyShare) * 100)}% belongs to — or whether spend shifts are driven by a specific part of the product or the whole thing.`}
                icon={<Shield className="w-5 h-5" />}
                visual={<SegmentBar share={topKeyShare} leftColor="bg-yellow-400" leftLabel={`"${report.keyConc.topKey}"`} rightLabel="Other keys" />}
              />
            )}
            {report.hasKeyCol && !report.keyConc && (
              <InsightCard
                label="key_concentration: single key"
                title="All spend is on one API key — no customer attribution possible"
                body="Your billing CSV has a single API key, so there's no way to tell from this file which customer, feature, or workflow is driving the cost. You're seeing the aggregate — not the breakdown. Adding a customer ID or feature tag to your API calls is how you go from 'here's the total' to 'here's which customer is costing you the most.'"
                icon={<Shield className="w-5 h-5" />}
              />
            )}
            {!report.hasKeyCol && (
              <InsightCard
                label="key_concentration: no key column found"
                title="No API key or project column — cost attribution isn't possible from this file"
                body="This billing export doesn't include a key, project, or user identifier column. That means there's no way to tell from the file alone which part of the product, which customer, or which workflow the cost belongs to. To get that breakdown, you need to tag your API calls with a customer ID before the request goes out."
                icon={<Shield className="w-5 h-5" />}
              />
            )}
          </div>
        </div>

        {/* What you can't see yet */}
        <div className="bg-primary/5 border border-primary/15 rounded-2xl p-6">
          <h2 className="font-bold text-xl font-outfit mb-1">What you can&apos;t see yet</h2>
          <p className="text-muted-foreground text-sm mb-6">This report is a one-time snapshot of your invoice. The full product shows the same numbers live, broken down by customer and feature, updating automatically. Here&apos;s a preview:</p>
          <div className="grid sm:grid-cols-3 gap-4 mb-6">
            {/* Sample: Per-Customer Attribution */}
            <SampleCard title="Per-Customer Cost Attribution" desc="See exactly which customer is driving your bill — not just the total.">
              <div className="space-y-2 mt-3">
                {[{ name: "Acme Corp", cost: "$380", margin: "-$60", c: "text-red-600" },{ name: "Verity Labs", cost: "$315", margin: "+$95", c: "text-yellow-600" },{ name: "Moonshot AI", cost: "$95", margin: "+$315", c: "text-green-600" }].map(r => (
                  <div key={r.name} className="flex justify-between items-center text-xs">
                    <span className="font-medium">{r.name}</span>
                    <span className={`font-bold ${r.c}`}>{r.margin}</span>
                  </div>
                ))}
              </div>
            </SampleCard>
            {/* Sample: Per-Feature Margins */}
            <SampleCard title="Per-Feature Margins & ROI" desc="Which features earn their keep, and which are quietly losing money?">
              <div className="space-y-2 mt-3">
                {[{ f: "AI Search", share: 0.65, neg: false },{ f: "Summaries", share: 0.28, neg: true },{ f: "Tagging", share: 0.07, neg: false }].map(r => (
                  <div key={r.f} className="flex items-center gap-2 text-xs">
                    <span className="w-16 shrink-0">{r.f}</span>
                    <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
                      <div className={`h-full ${r.neg ? "bg-red-400" : "bg-primary"}`} style={{ width: `${r.share * 100}%` }} />
                    </div>
                    <span className={r.neg ? "text-red-600 font-semibold" : "text-muted-foreground"}>{r.neg ? "–margin" : "✓"}</span>
                  </div>
                ))}
              </div>
            </SampleCard>
            {/* Sample: Plan Profitability */}
            <SampleCard title="Plan & Pricing Profitability" desc="Does each pricing tier actually cover the AI cost it creates?">
              <div className="space-y-2 mt-3">
                {[{ plan: "Free", color: "bg-red-400", cover: "12%" },{ plan: "Pro", color: "bg-green-400", cover: "94%" },{ plan: "Enterprise", color: "bg-green-500", cover: "210%" }].map(r => (
                  <div key={r.plan} className="flex items-center gap-2 text-xs">
                    <span className="w-16 shrink-0 font-medium">{r.plan}</span>
                    <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
                      <div className={`h-full ${r.color}`} style={{ width: r.cover }} />
                    </div>
                    <span className="text-muted-foreground">{r.cover}</span>
                  </div>
                ))}
              </div>
            </SampleCard>
          </div>
          <div className="flex flex-col sm:flex-row items-center gap-4 pt-4 border-t border-primary/15">
            <p className="text-sm text-muted-foreground flex-1">The full product shows these numbers live — updating automatically as your product runs, broken down by every customer and feature.</p>
            <Link href="/signup" className="shrink-0 inline-flex items-center gap-2 h-11 px-6 bg-primary text-primary-foreground rounded-lg font-medium hover:opacity-90 hover:-translate-y-0.5 hover:shadow-md transition-all duration-200 text-sm">
              Start monitoring now <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

        {/* Footer disclaimer */}
        <p className="text-xs text-muted-foreground text-center pb-4 leading-relaxed max-w-lg mx-auto">
          Figures are estimates based on the uploaded file. The premium-model and spend-spike flags are heuristics meant to point in the right direction, not exact audits. Your file is processed entirely in the browser and is never uploaded anywhere.
        </p>
      </div>
    </PublicLayout>
  );
}

// ── Sub-components ─────────────────────────────────────────────────────────────
function InsightCard({ label, title, body, icon, visual }: { label: string; title: string; body: string; icon: React.ReactNode; visual?: React.ReactNode }) {
  return (
    <div className="bg-card border border-border rounded-xl p-5 shadow-sm">
      <div className="flex items-start gap-3">
        <div className="w-9 h-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">{icon}</div>
        <div className="flex-1 min-w-0">
          <code className="text-[11px] text-muted-foreground font-mono bg-muted px-1.5 py-0.5 rounded mb-2 inline-block">{label}</code>
          <p className="font-semibold text-foreground text-sm mb-2">{title}</p>
          <p className="text-muted-foreground text-sm leading-relaxed">{body}</p>
          {visual && <div className="mt-4">{visual}</div>}
        </div>
      </div>
    </div>
  );
}

function SampleCard({ title, desc, children }: { title: string; desc: string; children: React.ReactNode }) {
  return (
    <div className="bg-card border border-border rounded-xl p-4 relative overflow-hidden">
      <div className="absolute top-2 right-2 text-[10px] font-bold bg-yellow-100 border border-yellow-200 text-yellow-700 px-2 py-0.5 rounded-full">SAMPLE</div>
      <p className="text-xs font-bold text-foreground pr-12 mb-1">{title}</p>
      <p className="text-[11px] text-muted-foreground mb-1 leading-relaxed">{desc}</p>
      {children}
    </div>
  );
}
