"use client";
import { useState, useRef, useCallback } from "react";
import { PublicLayout } from "@/components/public-layout";
import Link from "next/link";
import Papa from "papaparse";
import {
  BarChart, Bar, Cell, XAxis, YAxis, Tooltip, ResponsiveContainer,
  AreaChart, Area, LineChart, Line, ReferenceDot,
  PieChart, Pie, Legend,
} from "recharts";
import {
  Upload, ChevronDown, ChevronUp, CheckCircle2, AlertCircle,
  Copy, ArrowRight, ExternalLink, RefreshCw, TrendingUp, Shield, Zap,
  DollarSign, Calendar, TrendingDown,
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

const MODEL_COLORS = ["#2563eb", "#7c3aed", "#0891b2", "#059669", "#d97706", "#dc2626", "#db2777"];

const norm = (s: string) => s.toLowerCase().trim().replace(/\s+/g, " ");
const findCol = (headers: string[], variants: string[]) => headers.find(h => variants.includes(norm(h)));

// ── Date parsing ───────────────────────────────────────────────────────────────
function parseDate(s: string): string | null {
  if (!s) return null;
  s = String(s).trim();
  if (/^\d{4}-\d{2}-\d{2}/.test(s)) return s.substring(0, 10);
  const parts = s.split(/[\/\-\.\s]/);
  if (parts.length >= 3) {
    const nums = parts.map(Number);
    if (nums[2] > 1000) return `${nums[2]}-${String(nums[0]).padStart(2, "0")}-${String(nums[1]).padStart(2, "0")}`;
    if (nums[0] > 1000) return `${nums[0]}-${String(nums[1]).padStart(2, "0")}-${String(nums[2]).padStart(2, "0")}`;
  }
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
function calcHealth(cacheEff: number | null, premShare: number | null, spikes: number, keyShare: number | null): { score: number; grade: string; gradeColor: string; gradeBg: string } {
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
  let grade: string, gradeColor: string, gradeBg: string;
  if (score >= 90) { grade = "Excellent — running a tight ship"; gradeColor = "text-green-700"; gradeBg = "bg-green-50 border-green-200"; }
  else if (score >= 75) { grade = "Good — a few things worth tightening"; gradeColor = "text-blue-700"; gradeBg = "bg-blue-50 border-blue-200"; }
  else if (score >= 55) { grade = "Needs attention — some margin leaks to fix"; gradeColor = "text-amber-700"; gradeBg = "bg-amber-50 border-amber-200"; }
  else { grade = "High risk — significant cost inefficiencies"; gradeColor = "text-red-700"; gradeBg = "bg-red-50 border-red-200"; }
  return { score, grade, gradeColor, gradeBg };
}

// ── CSV parsing + analysis ─────────────────────────────────────────────────────
function analyzeCSV(csvText: string): { report: Report } | { error: string } {
  const parsed = Papa.parse<Record<string, string>>(csvText, {
    header: true, skipEmptyLines: true, transformHeader: (h) => h.trim(),
  });

  const headers = parsed.meta.fields ?? [];
  const dateCol = findCol(headers, DATE_COLS);
  const costCol = findCol(headers, COST_COLS);
  if (!dateCol) return { error: "Couldn't find a date column. Expected one of: " + DATE_COLS.slice(0, 5).join(", ") + "." };
  if (!costCol) return { error: "Couldn't find a cost column. Expected one of: " + COST_COLS.slice(0, 5).join(", ") + "." };

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
      date, cost,
      model: modelCol ? raw[modelCol]?.trim() : undefined,
      key: keyCol ? raw[keyCol]?.trim() : undefined,
      inputTokens: inputCol ? parseInt(raw[inputCol] ?? "0") || undefined : undefined,
      cacheReadTokens: cacheCol ? parseInt(raw[cacheCol] ?? "0") || undefined : undefined,
    });
  }

  if (rows.length === 0) return { error: "The file was parsed but no valid rows were found. Make sure it has date and cost columns with data." };

  const byDayMap = new Map<string, number>();
  rows.forEach(r => byDayMap.set(r.date, (byDayMap.get(r.date) ?? 0) + r.cost));
  const byDay = Array.from(byDayMap.entries()).sort(([a], [b]) => a.localeCompare(b)).map(([date, cost]) => ({ date, label: fmtDate(date), cost }));

  const dayCount = byDay.length;
  const totalSpend = rows.reduce((s, r) => s + r.cost, 0);
  const avgDaily = totalSpend / Math.max(dayCount, 1);
  const projectedMonth = dayCount >= 3 ? avgDaily * 30 : null;
  const projectedYear = dayCount >= 3 ? avgDaily * 365 : null;

  const spikes: DailyData[] = [];
  for (let i = 1; i < byDay.length; i++) {
    const prev = byDay[i - 1].cost;
    const curr = byDay[i].cost;
    if (prev > 0 && curr / prev - 1 > 0.5 && curr - prev > 5) spikes.push(byDay[i]);
  }

  const modelMap = new Map<string, number>();
  rows.forEach(r => { if (r.model) modelMap.set(r.model, (modelMap.get(r.model) ?? 0) + r.cost); });
  const byModel = Array.from(modelMap.entries())
    .map(([model, cost]) => ({ model, cost, share: totalSpend > 0 ? cost / totalSpend : 0 }))
    .sort((a, b) => b.cost - a.cost);

  let premiumShare: number | null = null;
  if (byModel.length > 0) {
    const premiumCost = byModel.filter(m => PREMIUM_TERMS.some(t => m.model.toLowerCase().includes(t))).reduce((s, m) => s + m.cost, 0);
    premiumShare = totalSpend > 0 ? premiumCost / totalSpend : 0;
    if (premiumShare < 0.20) premiumShare = null;
  }

  let cacheEfficiency: number | null = null;
  if (inputCol && cacheCol) {
    const totalInput = rows.reduce((s, r) => s + (r.inputTokens ?? 0), 0);
    const totalCache = rows.reduce((s, r) => s + (r.cacheReadTokens ?? 0), 0);
    if (totalInput + totalCache > 0) cacheEfficiency = totalCache / (totalInput + totalCache);
  }

  let keyConc: { topKey: string; share: number } | null = null;
  if (keyCol) {
    const keyMap = new Map<string, number>();
    rows.forEach(r => { if (r.key) keyMap.set(r.key, (keyMap.get(r.key) ?? 0) + r.cost); });
    if (keyMap.size > 0) {
      const top = Array.from(keyMap.entries()).sort(([, a], [, b]) => b - a)[0];
      keyConc = { topKey: top[0], share: totalSpend > 0 ? top[1] / totalSpend : 0 };
    }
  }

  const topModel = byModel.length > 0 ? { model: byModel[0].model, share: byModel[0].share } : null;

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

  const { score, grade, gradeColor, gradeBg } = calcHealth(cacheEfficiency, premiumShare, spikes.length, keyConc?.share ?? null);

  return {
    report: {
      totalSpend, dayCount, projectedMonth, projectedYear,
      byModel, byDay, chartData, isWeekly,
      cacheEfficiency, premiumShare, spikes,
      keyConc, hasKeyCol: !!keyCol,
      topModel, healthScore: score, grade, gradeColor: gradeColor + " " + gradeBg,
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
function ChartTooltip({ active, payload, label }: { active?: boolean; payload?: { value: number; name?: string }[]; label?: string }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-card border border-border rounded-xl px-4 py-3 shadow-xl text-sm min-w-[120px]">
      <p className="text-muted-foreground text-xs mb-1.5 font-medium">{label}</p>
      {payload.map((p, i) => (
        <p key={i} className="font-bold text-foreground">{fmtDollar(p.value)}</p>
      ))}
    </div>
  );
}

function PieTooltip({ active, payload }: { active?: boolean; payload?: { name: string; value: number; payload: { cost: number } }[] }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-card border border-border rounded-xl px-4 py-3 shadow-xl text-sm">
      <p className="font-medium text-foreground mb-0.5 truncate max-w-[180px]">{payload[0].name}</p>
      <p className="font-bold text-foreground">{fmtDollar(payload[0].payload.cost)}</p>
      <p className="text-xs text-muted-foreground">{Math.round(payload[0].value)}% of spend</p>
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
              <div><strong>Couldn&apos;t parse this file.</strong> {errorMsg}</div>
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

  // ── Derived values for report ──
  const topKeyShare = report.keyConc?.share ?? 0;
  const [gradeTextClass, ...gradeBgParts] = report.gradeColor.split(" ");
  const gradeBgClass = gradeBgParts.join(" ");

  // Pie chart data for model breakdown
  const pieData = report.byModel.slice(0, 6).map((m, i) => ({
    name: m.model.length > 22 ? m.model.slice(0, 20) + "…" : m.model,
    value: Math.round(m.share * 100),
    cost: m.cost,
    fill: MODEL_COLORS[i % MODEL_COLORS.length],
  }));

  // Health score ring stroke values
  const circumference = 2 * Math.PI * 45;
  const strokeDash = (report.healthScore / 100) * circumference;
  const ringColor = report.healthScore >= 75 ? "#16a34a" : report.healthScore >= 55 ? "#d97706" : "#dc2626";

  // Daily area chart data
  const areaData = report.byDay.map(d => ({
    label: d.label,
    cost: parseFloat(d.cost.toFixed(2)),
    isSpike: report.spikes.some(s => s.date === d.date),
  }));

  return (
    <PublicLayout>
      <div className="max-w-4xl mx-auto px-6 py-14 w-full">

        {/* ── Header ── */}
        <div className="flex items-start justify-between gap-4 flex-wrap mb-12">
          <div>
            {isSample && (
              <div className="inline-flex items-center gap-1.5 rounded-full bg-yellow-100 border border-yellow-200 text-yellow-700 text-xs font-semibold px-3 py-1 mb-4">
                Sample data — upload your own CSV to analyse your real spend
              </div>
            )}
            <h1 className="text-3xl font-bold font-outfit mb-2">AI Spend Check-up Report</h1>
            <p className="text-muted-foreground">{fmtDate(report.startDate)} – {fmtDate(report.endDate)} · {report.dayCount} day{report.dayCount !== 1 ? "s" : ""}</p>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={copySummary} className="inline-flex items-center gap-2 text-sm font-medium border border-border rounded-xl px-4 py-2.5 hover:bg-muted transition-colors">
              {copied ? <CheckCircle2 className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
              {copied ? "Copied!" : "Copy summary"}
            </button>
            <button onClick={() => { setStage("upload"); setReport(null); setErrorMsg(null); }} className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground border border-border rounded-xl px-4 py-2.5 hover:bg-muted transition-colors">
              <RefreshCw className="w-4 h-4" /> New file
            </button>
          </div>
        </div>

        {/* ── Health Score + Stats ── */}
        <div className="bg-card border border-border rounded-3xl p-8 shadow-sm mb-10">
          <div className="flex items-start gap-8 flex-wrap">
            {/* Score ring */}
            <div className="flex flex-col items-center shrink-0">
              <div className="relative w-36 h-36">
                <svg viewBox="0 0 100 100" className="w-36 h-36 -rotate-90">
                  <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="6" className="text-muted/20" />
                  <circle
                    cx="50" cy="50" r="45" fill="none"
                    stroke={ringColor} strokeWidth="6"
                    strokeDasharray={`${strokeDash} ${circumference - strokeDash}`}
                    strokeLinecap="round"
                    style={{ transition: "stroke-dasharray 1s ease" }}
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-3xl font-bold font-outfit leading-none">{report.healthScore}</span>
                  <span className="text-xs text-muted-foreground mt-1">/ 100</span>
                </div>
              </div>
            </div>
            {/* Grade */}
            <div className="flex-1 min-w-[200px]">
              <div className={`inline-flex items-center gap-2 rounded-xl border px-4 py-2 mb-4 ${gradeBgClass}`}>
                <span className={`text-sm font-semibold ${gradeTextClass}`}>{report.grade}</span>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed max-w-md">
                Cost Health Score based on cache efficiency, model mix, spend spikes, and cost concentration. Each factor contributes to how well your AI spend is under control.
              </p>
            </div>
          </div>

          {/* Stat cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-8 pt-8 border-t border-border">
            {[
              { label: "Total spend", value: fmtDollar(report.totalSpend), sub: `across ${report.dayCount} days`, icon: <DollarSign className="w-5 h-5" />, color: "text-blue-600 bg-blue-50" },
              { label: "Projected this month", value: report.projectedMonth ? fmtDollar(report.projectedMonth) : "—", sub: report.projectedMonth ? "at current daily pace" : "need ≥3 days of data", icon: <Calendar className="w-5 h-5" />, color: "text-violet-600 bg-violet-50" },
              { label: "Projected annual", value: report.projectedYear ? fmtDollar(report.projectedYear) : "—", sub: report.projectedYear ? "if nothing changes" : "need ≥3 days of data", icon: <TrendingDown className="w-5 h-5" />, color: "text-amber-600 bg-amber-50" },
            ].map(s => (
              <div key={s.label} className="bg-background border border-border rounded-2xl p-5 flex items-start gap-4">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${s.color}`}>{s.icon}</div>
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-1">{s.label}</p>
                  <p className="text-2xl font-bold font-outfit text-foreground leading-none mb-1">{s.value}</p>
                  <p className="text-xs text-muted-foreground">{s.sub}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Spend over time ── */}
        <div className="bg-card border border-border rounded-3xl p-8 shadow-sm mb-10">
          <div className="flex items-start justify-between gap-4 mb-6">
            <div>
              <h2 className="text-xl font-bold font-outfit mb-1">Spend over time</h2>
              <p className="text-sm text-muted-foreground">{report.isWeekly ? "Grouped by week — 30+ days of data" : "Daily spend across your data range"}</p>
            </div>
            {report.spikes.length > 0 && (
              <div className="flex items-center gap-2 text-xs text-red-600 bg-red-50 border border-red-200 rounded-xl px-3 py-2 shrink-0">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500 shrink-0" />
                {report.spikes.length} spike{report.spikes.length > 1 ? "s" : ""} detected
              </div>
            )}
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={report.chartData} margin={{ top: 8, right: 8, bottom: 8, left: 8 }}>
              <defs>
                <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#2563eb" stopOpacity={1} />
                  <stop offset="100%" stopColor="#2563eb" stopOpacity={0.7} />
                </linearGradient>
              </defs>
              <XAxis dataKey="label" tick={{ fontSize: 11, fill: "#94a3b8" }} tickLine={false} axisLine={false} interval="preserveStartEnd" />
              <YAxis tickFormatter={(v) => `$${v}`} tick={{ fontSize: 11, fill: "#94a3b8" }} tickLine={false} axisLine={false} width={52} />
              <Tooltip content={<ChartTooltip />} cursor={{ fill: "#f1f5f9", opacity: 0.8 }} />
              <Bar dataKey="cost" radius={[6, 6, 0, 0]}>
                {report.chartData.map((entry, i) => (
                  <Cell key={i} fill={entry.isSpike ? "#ef4444" : "url(#barGradient)"} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
          {report.spikes.length > 0 && (
            <p className="text-xs text-muted-foreground mt-3 flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500 shrink-0" />
              Red bars mark days where spend jumped more than 50% over the previous day
            </p>
          )}
        </div>

        {/* ── Daily trend (area chart) — only if ≥7 days ── */}
        {report.byDay.length >= 7 && (
          <div className="bg-card border border-border rounded-3xl p-8 shadow-sm mb-10">
            <div className="mb-6">
              <h2 className="text-xl font-bold font-outfit mb-1">Daily cost rhythm</h2>
              <p className="text-sm text-muted-foreground">How your spend flows day-by-day — flat lines mean predictable costs, sharp peaks mean surprises.</p>
            </div>
            <ResponsiveContainer width="100%" height={260}>
              <AreaChart data={areaData} margin={{ top: 8, right: 8, bottom: 8, left: 8 }}>
                <defs>
                  <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#2563eb" stopOpacity={0.25} />
                    <stop offset="100%" stopColor="#2563eb" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="label" tick={{ fontSize: 11, fill: "#94a3b8" }} tickLine={false} axisLine={false} interval="preserveStartEnd" />
                <YAxis tickFormatter={(v) => `$${v}`} tick={{ fontSize: 11, fill: "#94a3b8" }} tickLine={false} axisLine={false} width={52} />
                <Tooltip content={<ChartTooltip />} cursor={{ stroke: "#2563eb", strokeWidth: 1, strokeDasharray: "4 4" }} />
                <Area type="monotone" dataKey="cost" stroke="#2563eb" strokeWidth={2.5} fill="url(#areaGradient)" dot={false} activeDot={{ r: 5, fill: "#2563eb", strokeWidth: 2, stroke: "white" }} />
                {report.spikes.map((s, i) => (
                  <ReferenceDot key={i} x={s.label} y={s.cost} r={6} fill="#ef4444" stroke="white" strokeWidth={2} />
                ))}
              </AreaChart>
            </ResponsiveContainer>
            {report.spikes.length > 0 && (
              <p className="text-xs text-muted-foreground mt-3 flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500 shrink-0" />
                Red dots mark spend spike days
              </p>
            )}
          </div>
        )}

        {/* ── Model breakdown ── */}
        {report.byModel.length > 0 && (
          <div className="bg-card border border-border rounded-3xl p-8 shadow-sm mb-10">
            <div className="mb-6">
              <h2 className="text-xl font-bold font-outfit mb-1">Where your money&apos;s going</h2>
              <p className="text-sm text-muted-foreground">Cost breakdown by model — which AI is driving your bill.</p>
            </div>
            <div className="grid lg:grid-cols-2 gap-8 items-center">
              {/* Donut chart */}
              <div>
                <ResponsiveContainer width="100%" height={280}>
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={72}
                      outerRadius={110}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {pieData.map((entry, i) => (
                        <Cell key={i} fill={entry.fill} />
                      ))}
                    </Pie>
                    <Tooltip content={<PieTooltip />} />
                    <Legend
                      formatter={(value) => <span style={{ fontSize: 11, color: "#64748b" }}>{value}</span>}
                      iconSize={10}
                      iconType="circle"
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              {/* Horizontal bars */}
              <div className="space-y-5">
                {report.byModel.map((m, i) => (
                  <div key={m.model}>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="font-medium text-foreground truncate max-w-[55%]">{m.model}</span>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-muted-foreground text-xs">{fmtDollar(m.cost)}</span>
                        <span className="text-foreground font-bold text-xs bg-muted px-2 py-0.5 rounded-full">{Math.round(m.share * 100)}%</span>
                      </div>
                    </div>
                    <div className="h-2.5 rounded-full bg-muted overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-700"
                        style={{ width: `${m.share * 100}%`, backgroundColor: MODEL_COLORS[i % MODEL_COLORS.length] }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── Key metrics row (cache + premium share) ── */}
        {(report.cacheEfficiency !== null || report.premiumShare !== null) && (
          <div className="grid sm:grid-cols-2 gap-6 mb-10">
            {report.cacheEfficiency !== null && (
              <div className="bg-card border border-border rounded-3xl p-8 shadow-sm">
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                    <Shield className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-bold text-foreground">Cache efficiency</p>
                    <p className="text-xs text-muted-foreground">% of input tokens served from cache</p>
                  </div>
                </div>
                <div className="flex items-end gap-3 mb-4">
                  <span className="text-4xl font-bold font-outfit text-foreground">{Math.round(report.cacheEfficiency * 100)}%</span>
                  <span className={`text-sm font-medium mb-1 ${report.cacheEfficiency < 0.25 ? "text-red-600" : report.cacheEfficiency < 0.5 ? "text-amber-600" : "text-green-600"}`}>
                    {report.cacheEfficiency < 0.25 ? "Too low" : report.cacheEfficiency < 0.5 ? "Fair" : "Good"}
                  </span>
                </div>
                <ResponsiveContainer width="100%" height={100}>
                  <BarChart data={[
                    { label: "Cached", value: Math.round(report.cacheEfficiency * 100), fill: "#2563eb" },
                    { label: "Fresh", value: Math.round((1 - report.cacheEfficiency) * 100), fill: "#e2e8f0" },
                  ]} margin={{ top: 0, right: 0, bottom: 0, left: 0 }} layout="vertical">
                    <XAxis type="number" hide domain={[0, 100]} />
                    <YAxis type="category" dataKey="label" tick={{ fontSize: 11, fill: "#94a3b8" }} tickLine={false} axisLine={false} width={44} />
                    <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                      {[{ fill: "#2563eb" }, { fill: "#e2e8f0" }].map((c, i) => (
                        <Cell key={i} fill={c.fill} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
                <p className="text-xs text-muted-foreground mt-3 leading-relaxed">
                  {report.cacheEfficiency < 0.25
                    ? "Low cache reuse — enabling prompt caching could cut input costs by 50–90%."
                    : "Reasonable cache reuse — you're not rebuilding context from scratch every time."}
                </p>
              </div>
            )}

            {report.premiumShare !== null && (
              <div className="bg-card border border-border rounded-3xl p-8 shadow-sm">
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-10 h-10 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center shrink-0">
                    <Zap className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-bold text-foreground">Premium model share</p>
                    <p className="text-xs text-muted-foreground">% of spend on your most expensive models</p>
                  </div>
                </div>
                <div className="flex items-end gap-3 mb-4">
                  <span className="text-4xl font-bold font-outfit text-foreground">{Math.round(report.premiumShare * 100)}%</span>
                  <span className={`text-sm font-medium mb-1 ${report.premiumShare > 0.6 ? "text-red-600" : report.premiumShare > 0.4 ? "text-amber-600" : "text-green-600"}`}>
                    {report.premiumShare > 0.6 ? "High" : report.premiumShare > 0.4 ? "Moderate" : "Controlled"}
                  </span>
                </div>
                <ResponsiveContainer width="100%" height={100}>
                  <PieChart>
                    <Pie
                      data={[
                        { name: "Premium", value: Math.round(report.premiumShare * 100) },
                        { name: "Other", value: Math.round((1 - report.premiumShare) * 100) },
                      ]}
                      cx="50%" cy="50%" innerRadius={28} outerRadius={44}
                      startAngle={90} endAngle={-270}
                      paddingAngle={2} dataKey="value"
                    >
                      <Cell fill="#f97316" />
                      <Cell fill="#f1f5f9" />
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                <p className="text-xs text-muted-foreground mt-3 leading-relaxed">
                  {report.premiumShare > 0.6
                    ? "Over half your cost is from top-tier models. Some of these calls might work with a cheaper alternative."
                    : "Premium model usage is in a reasonable range — most spend is on cost-effective models."}
                </p>
              </div>
            )}
          </div>
        )}

        {/* ── Spend spikes detail ── */}
        {report.byDay.length >= 3 && (
          <div className="bg-card border border-border rounded-3xl p-8 shadow-sm mb-10">
            <div className="flex items-center gap-3 mb-5">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${report.spikes.length > 0 ? "bg-red-50 text-red-600" : "bg-green-50 text-green-600"}`}>
                <AlertCircle className="w-5 h-5" />
              </div>
              <div>
                <p className="font-bold text-foreground">
                  {report.spikes.length > 0 ? `${report.spikes.length} spend spike${report.spikes.length > 1 ? "s" : ""} detected` : "No spend spikes"}
                </p>
                <p className="text-xs text-muted-foreground">Days where cost jumped more than 50% over the previous day</p>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={180}>
              <LineChart data={report.byDay.map(d => ({ label: d.label, cost: d.cost }))} margin={{ top: 8, right: 8, bottom: 8, left: 8 }}>
                <defs>
                  <linearGradient id="spikeLineGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#2563eb" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="#2563eb" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="label" tick={{ fontSize: 10, fill: "#94a3b8" }} tickLine={false} axisLine={false} interval="preserveStartEnd" />
                <YAxis tickFormatter={(v) => `$${v}`} tick={{ fontSize: 10, fill: "#94a3b8" }} tickLine={false} axisLine={false} width={48} />
                <Tooltip content={<ChartTooltip />} />
                <Line type="monotone" dataKey="cost" stroke="#2563eb" strokeWidth={2} dot={false} activeDot={{ r: 4, fill: "#2563eb", strokeWidth: 2, stroke: "white" }} />
                {report.spikes.map((s, i) => (
                  <ReferenceDot key={i} x={s.label} y={s.cost} r={6} fill="#ef4444" stroke="white" strokeWidth={2} />
                ))}
              </LineChart>
            </ResponsiveContainer>
            {report.spikes.length > 0 ? (
              <div className="mt-4 space-y-2">
                {report.spikes.map(s => {
                  const prev = report.byDay.find(d => d.date < s.date)?.cost ?? 0;
                  const pct = prev > 0 ? Math.round((s.cost / prev - 1) * 100) : 0;
                  return (
                    <div key={s.date} className="flex items-center gap-3 bg-red-50 border border-red-100 rounded-xl px-4 py-3 text-sm">
                      <span className="w-2 h-2 rounded-full bg-red-500 shrink-0" />
                      <span className="font-medium text-foreground">{s.label}</span>
                      <span className="text-red-700 font-semibold">+{pct}% ({fmtDollar(s.cost)} vs {fmtDollar(prev)})</span>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-sm text-green-700 bg-green-50 border border-green-100 rounded-xl px-4 py-3 mt-4">
                Your spend was consistent — no day jumped more than 50% above the previous one. Usage looks predictable and well-controlled.
              </p>
            )}
          </div>
        )}

        {/* ── Key concentration ── */}
        {report.hasKeyCol && (
          <div className="bg-card border border-border rounded-3xl p-8 shadow-sm mb-10">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-xl bg-yellow-50 text-yellow-600 flex items-center justify-center shrink-0">
                <Shield className="w-5 h-5" />
              </div>
              <div>
                <p className="font-bold text-foreground">API key concentration</p>
                <p className="text-xs text-muted-foreground">How spend is distributed across keys / projects</p>
              </div>
            </div>
            {report.keyConc ? (
              <>
                <div className="flex items-end gap-3 mb-6">
                  <span className="text-4xl font-bold font-outfit text-foreground">{Math.round(topKeyShare * 100)}%</span>
                  <span className="text-sm text-muted-foreground mb-1">from &ldquo;{report.keyConc.topKey}&rdquo;</span>
                </div>
                <div className="w-full h-3 rounded-full bg-muted overflow-hidden mb-3">
                  <div className="h-full rounded-full bg-yellow-400 transition-all duration-700" style={{ width: `${topKeyShare * 100}%` }} />
                </div>
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>&ldquo;{report.keyConc.topKey}&rdquo; — {Math.round(topKeyShare * 100)}%</span>
                  <span>Other keys — {Math.round((1 - topKeyShare) * 100)}%</span>
                </div>
                <p className="text-sm text-muted-foreground mt-4 leading-relaxed">
                  {topKeyShare > 0.80
                    ? `Almost all your spend flows through a single key. You can't tell which customer, feature, or workflow the remaining ${Math.round((1 - topKeyShare) * 100)}% belongs to.`
                    : `Most spend is concentrated in one key. This limits visibility into which parts of your product are actually driving cost.`}
                </p>
              </>
            ) : (
              <p className="text-sm text-muted-foreground leading-relaxed">
                Your billing export has a single API key — there&apos;s no way to tell which customer, feature, or workflow is driving cost from this file alone.
              </p>
            )}
          </div>
        )}

        {!report.hasKeyCol && (
          <div className="bg-card border border-border rounded-3xl p-8 shadow-sm mb-10">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-500 flex items-center justify-center shrink-0">
                <Shield className="w-5 h-5" />
              </div>
              <div>
                <p className="font-bold text-foreground mb-2">No API key or project column found</p>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  This billing export doesn&apos;t include a key, project, or user identifier. That means there&apos;s no way to tell from the file alone which part of the product, which customer, or which workflow the cost belongs to.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* ── Top model insight ── */}
        {report.topModel && (
          <div className="bg-card border border-border rounded-3xl p-8 shadow-sm mb-10">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                <TrendingUp className="w-5 h-5" />
              </div>
              <div>
                <p className="font-bold text-foreground">Biggest cost driver</p>
                <p className="text-xs text-muted-foreground">Top model by spend share</p>
              </div>
            </div>
            <div className="flex items-end gap-3 mb-4">
              <span className="text-4xl font-bold font-outfit text-foreground">{Math.round(report.topModel.share * 100)}%</span>
              <span className="text-sm text-muted-foreground mb-1 truncate max-w-[300px]">{report.topModel.model}</span>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {report.topModel.model} accounts for {Math.round(report.topModel.share * 100)}% of your total AI spend. If you can reduce calls to this model, route eligible requests to a cheaper alternative, or cache frequent responses, the savings will be proportional to its share.
            </p>
          </div>
        )}

        {/* ── What you can't see yet ── */}
        <div className="bg-primary/5 border border-primary/15 rounded-3xl p-8 mb-10">
          <h2 className="text-3xl font-bold font-outfit mb-3">What you can&apos;t see for LLM Spend Reports, but you can see in AI Observly</h2>
          <p className="text-muted-foreground text-sm mb-8 max-w-2xl">
            This report is a one-time snapshot of your invoice. The full product shows the same numbers live, broken down by customer and feature, updating automatically.
          </p>
          <div className="grid sm:grid-cols-3 gap-5 mb-8">
            <SampleCard title="Per-Customer Cost Attribution" desc="See exactly which customer is driving your bill — not just the total.">
              <div className="space-y-3 mt-4">
                {[
                  { name: "Acme Corp", cost: "$380", margin: "-$60", c: "text-red-600 bg-red-50" },
                  { name: "Verity Labs", cost: "$315", margin: "+$95", c: "text-amber-600 bg-amber-50" },
                  { name: "Moonshot AI", cost: "$95", margin: "+$315", c: "text-green-600 bg-green-50" },
                ].map(r => (
                  <div key={r.name} className="flex justify-between items-center text-xs">
                    <span className="font-medium text-foreground">{r.name}</span>
                    <span className={`font-bold px-2 py-0.5 rounded-full ${r.c}`}>{r.margin}</span>
                  </div>
                ))}
              </div>
            </SampleCard>
            <SampleCard title="Per-Feature Margins & ROI" desc="Which features earn their keep, and which are quietly losing money?">
              <div className="space-y-3 mt-4">
                {[{ f: "AI Search", share: 0.65, neg: false },{ f: "Summaries", share: 0.28, neg: true },{ f: "Tagging", share: 0.07, neg: false }].map(r => (
                  <div key={r.f} className="flex items-center gap-2 text-xs">
                    <span className="w-16 shrink-0 font-medium">{r.f}</span>
                    <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
                      <div className={`h-full rounded-full ${r.neg ? "bg-red-400" : "bg-primary"}`} style={{ width: `${r.share * 100}%` }} />
                    </div>
                    <span className={r.neg ? "text-red-600 font-semibold text-[10px]" : "text-green-600 text-[10px] font-semibold"}>{r.neg ? "–margin" : "✓ profit"}</span>
                  </div>
                ))}
              </div>
            </SampleCard>
            <SampleCard title="Plan & Pricing Profitability" desc="Does each pricing tier actually cover the AI cost it creates?">
              <div className="space-y-3 mt-4">
                {[{ plan: "Free", color: "bg-red-400", cover: "12%", neg: true },{ plan: "Pro", color: "bg-green-400", cover: "94%", neg: false },{ plan: "Enterprise", color: "bg-green-500", cover: "210%", neg: false }].map(r => (
                  <div key={r.plan} className="flex items-center gap-2 text-xs">
                    <span className="w-16 shrink-0 font-medium">{r.plan}</span>
                    <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
                      <div className={`h-full rounded-full ${r.color}`} style={{ width: r.cover }} />
                    </div>
                    <span className={`${r.neg ? "text-red-600" : "text-muted-foreground"} font-medium`}>{r.cover}</span>
                  </div>
                ))}
              </div>
            </SampleCard>
          </div>
          <div className="flex flex-col sm:flex-row items-center gap-4 pt-6 border-t border-primary/15">
            <p className="text-sm text-muted-foreground flex-1">The full product shows these numbers live — updating automatically as your product runs, broken down by every customer and feature.</p>
            <Link href="/#pricing" className="shrink-0 inline-flex items-center gap-2 h-12 px-7 bg-primary text-primary-foreground rounded-xl font-medium hover:opacity-90 hover:-translate-y-0.5 hover:shadow-md transition-all duration-200 text-sm">
              Start monitoring now <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

        {/* ── Footer disclaimer ── */}
        <p className="text-xs text-muted-foreground text-center pb-6 leading-relaxed max-w-lg mx-auto">
          Figures are estimates based on the uploaded file. The premium-model and spend-spike flags are heuristics meant to point in the right direction, not exact audits. Your file is processed entirely in the browser and is never uploaded anywhere.
        </p>
      </div>
    </PublicLayout>
  );
}

// ── Sub-components ─────────────────────────────────────────────────────────────
function SampleCard({ title, desc, children }: { title: string; desc: string; children: React.ReactNode }) {
  return (
    <div className="bg-card border border-border rounded-2xl p-5 relative overflow-hidden">
      <div className="absolute top-3 right-3 text-[10px] font-bold bg-yellow-100 border border-yellow-200 text-yellow-700 px-2 py-0.5 rounded-full">SAMPLE</div>
      <p className="text-sm font-bold text-foreground pr-14 mb-1">{title}</p>
      <p className="text-[11px] text-muted-foreground leading-relaxed">{desc}</p>
      {children}
    </div>
  );
}
