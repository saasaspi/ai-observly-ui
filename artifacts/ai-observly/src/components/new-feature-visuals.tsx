import type { ReactNode } from "react";

// Every visual here is an illustration with made-up numbers. Each one carries an
// "Example" tag so nobody mistakes it for live data.

function Frame({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="bg-card p-5 sm:p-6">
      <div className="flex items-center justify-between gap-3 mb-4">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{title}</p>
        <span className="shrink-0 rounded-full border border-dashed border-primary/40 bg-primary/5 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-primary">
          Example, not live data
        </span>
      </div>
      {children}
    </div>
  );
}

function Bar({ pct, className = "bg-primary" }: { pct: number; className?: string }) {
  return (
    <div className="h-2 rounded-full bg-muted overflow-hidden">
      <div className={`h-full rounded-full ${className}`} style={{ width: `${pct}%` }} />
    </div>
  );
}

// ── Savings ───────────────────────────────────────────────────────────────────
export function SavingsHeroVisual() {
  return (
    <div className="rounded-2xl border border-border shadow-xl shadow-primary/5 overflow-hidden">
      <Frame title="Repeated work, this month">
        <div className="flex h-10 rounded-lg overflow-hidden text-[11px] font-semibold">
          <div className="bg-primary/80 text-primary-foreground flex items-center px-3" style={{ width: "58%" }}>Reused</div>
          <div className="bg-amber-200 text-amber-900 flex items-center px-3" style={{ width: "42%" }}>Full price</div>
        </div>
        <div className="grid grid-cols-2 gap-3 mt-4">
          <div className="rounded-xl bg-emerald-50 border border-emerald-100 p-3">
            <p className="text-[10px] uppercase font-semibold text-emerald-700 tracking-wider">Saved</p>
            <p className="text-2xl font-bold font-outfit text-emerald-700">$212</p>
            <p className="text-[11px] text-emerald-700/80">by reusing earlier work</p>
          </div>
          <div className="rounded-xl bg-amber-50 border border-amber-100 p-3">
            <p className="text-[10px] uppercase font-semibold text-amber-700 tracking-wider">Missed</p>
            <p className="text-2xl font-bold font-outfit text-amber-700">$148</p>
            <p className="text-[11px] text-amber-700/80">could have been reused</p>
          </div>
        </div>
      </Frame>
    </div>
  );
}

export function SavingsRankingVisual() {
  const rows = [
    { name: "Chat Assistant", reuse: 81 },
    { name: "AI Summary", reuse: 64 },
    { name: "Smart Search", reuse: 37 },
    { name: "Auto-Tagging", reuse: 9, flag: true },
  ];
  return (
    <Frame title="Features ranked by reuse">
      <div className="space-y-4">
        {rows.map((r) => (
          <div key={r.name}>
            <div className="flex justify-between items-center text-sm mb-1 gap-2">
              <span className="font-medium text-foreground">{r.name}</span>
              <span className="text-xs font-semibold text-primary">{r.reuse}% reused</span>
            </div>
            <Bar pct={r.reuse} className={r.flag ? "bg-amber-400" : "bg-primary"} />
            {r.flag && (
              <p className="text-[11px] text-amber-700 mt-1">Used a lot, reused very little. Worth a look.</p>
            )}
          </div>
        ))}
      </div>
    </Frame>
  );
}

export function SavingsExplainerVisual() {
  return (
    <Frame title="Same instructions, sent again">
      <div className="space-y-2.5 text-sm">
        {[
          { t: "Customer 1 asks a question", c: "Full price", cls: "bg-amber-100 text-amber-800" },
          { t: "Customer 2 asks a question", c: "Reused, cheaper", cls: "bg-emerald-100 text-emerald-800" },
          { t: "Customer 3 asks a question", c: "Reused, cheaper", cls: "bg-emerald-100 text-emerald-800" },
        ].map((r) => (
          <div key={r.t} className="flex items-center justify-between gap-3 border border-border rounded-lg px-3 py-2.5">
            <span className="text-foreground">{r.t}</span>
            <span className={`text-[11px] font-semibold rounded-full px-2.5 py-0.5 shrink-0 ${r.cls}`}>{r.c}</span>
          </div>
        ))}
      </div>
    </Frame>
  );
}

export function SavingsTableVisual() {
  const rows = [
    { name: "Chat Assistant", saved: "$96", missed: "$21" },
    { name: "AI Summary", saved: "$74", missed: "$38" },
    { name: "Smart Search", saved: "$31", missed: "$52" },
    { name: "Auto-Tagging", saved: "$11", missed: "$37" },
  ];
  return (
    <div>
      <div className="flex text-[10px] font-semibold text-muted-foreground uppercase tracking-wider px-4 py-2 border-b border-border">
        <span className="flex-1">Feature</span>
        <span className="w-20 text-right">Saved</span>
        <span className="w-20 text-right">Missed</span>
      </div>
      {rows.map((r) => (
        <div key={r.name} className="flex items-center px-4 py-3 border-b border-border last:border-0 text-sm">
          <span className="flex-1 font-medium text-foreground">{r.name}</span>
          <span className="w-20 text-right font-semibold text-emerald-700">{r.saved}</span>
          <span className="w-20 text-right font-semibold text-amber-700">{r.missed}</span>
        </div>
      ))}
      <p className="px-4 py-2 text-[10px] text-muted-foreground border-t border-border">Example numbers for illustration only.</p>
    </div>
  );
}

// ── Speed ─────────────────────────────────────────────────────────────────────
function RangeRow({ name, typical, slow, max = 16 }: { name: string; typical: number; slow: number; max?: number }) {
  return (
    <div>
      <div className="flex justify-between text-sm mb-1.5 gap-2">
        <span className="font-medium text-foreground">{name}</span>
        <span className="text-xs text-muted-foreground">usually {typical}s, slow ones {slow}s</span>
      </div>
      <div className="relative h-2.5 rounded-full bg-muted overflow-hidden">
        <div className="absolute inset-y-0 left-0 rounded-full bg-red-300" style={{ width: `${(slow / max) * 100}%` }} />
        <div className="absolute inset-y-0 left-0 rounded-full bg-primary" style={{ width: `${(typical / max) * 100}%` }} />
      </div>
    </div>
  );
}

export function SpeedHeroVisual() {
  return (
    <div className="rounded-2xl border border-border shadow-xl shadow-primary/5 overflow-hidden">
      <Frame title="How long people wait">
        <div className="space-y-4">
          <RangeRow name="Chat Assistant" typical={2.1} slow={6.8} />
          <RangeRow name="AI Summary" typical={4.4} slow={11.2} />
          <RangeRow name="Report Gen" typical={7.9} slow={15.5} />
        </div>
        <div className="flex gap-4 mt-4 text-[11px] text-muted-foreground">
          <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-primary" />Typical</span>
          <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-red-300" />Unusually slow</span>
        </div>
      </Frame>
    </div>
  );
}

export function SpeedSlowCostlyVisual() {
  const rows = [
    { f: "Report Gen", w: "14.2s", c: "$0.42", hot: true },
    { f: "AI Summary", w: "11.8s", c: "$0.31", hot: true },
    { f: "Chat Assistant", w: "6.1s", c: "$0.02", hot: false },
  ];
  return (
    <Frame title="Slow and expensive requests">
      <div className="space-y-2">
        {rows.map((r) => (
          <div key={r.f} className={`flex items-center justify-between gap-3 rounded-lg border px-3 py-2.5 text-sm ${r.hot ? "border-red-200 bg-red-50" : "border-border"}`}>
            <span className="font-medium text-foreground">{r.f}</span>
            <span className="text-xs text-muted-foreground">waited {r.w}</span>
            <span className="text-xs font-semibold text-foreground">{r.c}</span>
            {r.hot && <span className="hidden sm:inline text-[10px] font-semibold uppercase text-red-600">Slow + costly</span>}
          </div>
        ))}
      </div>
    </Frame>
  );
}

export function SpeedWritingVisual() {
  const rows = [
    { m: "Model A", pct: 84, v: "Writes quickly" },
    { m: "Model B", pct: 52, v: "Middle of the pack" },
    { m: "Model C", pct: 23, v: "Writes slowly" },
  ];
  return (
    <Frame title="How fast each model writes its answer">
      <div className="space-y-4">
        {rows.map((r) => (
          <div key={r.m}>
            <div className="flex justify-between text-sm mb-1">
              <span className="font-medium text-foreground">{r.m}</span>
              <span className="text-xs text-muted-foreground">{r.v}</span>
            </div>
            <Bar pct={r.pct} />
          </div>
        ))}
      </div>
    </Frame>
  );
}

export function SpeedProvidersVisual() {
  const rows = [
    { p: "OpenAI", pct: 55 },
    { p: "Anthropic", pct: 62 },
    { p: "Gemini", pct: 48 },
    { p: "Groq", pct: 22 },
    { p: "Azure", pct: 58 },
  ];
  return (
    <div>
      <div className="p-5 sm:p-6">
        <div className="flex items-center justify-between gap-3 mb-4">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Typical wait by service</p>
          <span className="shrink-0 rounded-full border border-dashed border-primary/40 bg-primary/5 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-primary">Example, not live data</span>
        </div>
        <div className="space-y-3">
          {rows.map((r) => (
            <div key={r.p} className="flex items-center gap-3">
              <span className="w-20 text-sm font-medium text-foreground">{r.p}</span>
              <div className="flex-1"><Bar pct={r.pct} /></div>
            </div>
          ))}
        </div>
        <p className="text-[11px] text-muted-foreground mt-3">Shorter bar means a shorter wait. Shapes are illustrative.</p>
      </div>
    </div>
  );
}

// ── Reliability ───────────────────────────────────────────────────────────────
export function ReliabilityHeroVisual() {
  const reasons = [
    { r: "Too many requests at once", v: "$58", pct: 62 },
    { r: "Instructions were too long", v: "$27", pct: 30 },
    { r: "Blocked by a safety filter", v: "$9", pct: 10 },
  ];
  return (
    <div className="rounded-2xl border border-border shadow-xl shadow-primary/5 overflow-hidden">
      <Frame title="Spent on requests that failed">
        <p className="text-3xl font-bold font-outfit text-red-600">$94</p>
        <p className="text-xs text-muted-foreground mb-4">this month, grouped by reason</p>
        <div className="space-y-3">
          {reasons.map((x) => (
            <div key={x.r}>
              <div className="flex justify-between text-sm mb-1 gap-2">
                <span className="text-foreground">{x.r}</span>
                <span className="font-semibold text-foreground">{x.v}</span>
              </div>
              <Bar pct={x.pct} className="bg-red-300" />
            </div>
          ))}
        </div>
      </Frame>
    </div>
  );
}

export function ReliabilityFeedVisual() {
  const rows = [
    { t: "2 min ago", c: "Verity Labs", f: "AI Summary", r: "Too many requests" },
    { t: "19 min ago", c: "Moonshot AI", f: "Chat Assistant", r: "Instructions too long" },
    { t: "47 min ago", c: "Acme Corp", f: "Report Gen", r: "Safety filter" },
    { t: "1 hr ago", c: "Verity Labs", f: "AI Summary", r: "Too many requests" },
  ];
  return (
    <Frame title="Recent failures">
      <div className="mb-3 flex items-center gap-2 border border-border rounded-lg px-3 py-2 text-xs text-muted-foreground bg-background">
        Search by customer, feature or reason
      </div>
      <div className="divide-y divide-border border border-border rounded-lg">
        {rows.map((r, i) => (
          <div key={i} className="px-3 py-2.5 text-sm">
            <div className="flex justify-between gap-2">
              <span className="font-medium text-foreground">{r.c}</span>
              <span className="text-[11px] text-muted-foreground">{r.t}</span>
            </div>
            <p className="text-xs text-muted-foreground">{r.f} · {r.r}</p>
          </div>
        ))}
      </div>
    </Frame>
  );
}

export function ReliabilityEndingsVisual() {
  const rows = [
    { l: "Finished normally", v: 91, cls: "bg-emerald-400" },
    { l: "Cut short, answer incomplete", v: 6, cls: "bg-amber-400" },
    { l: "Handed off to a tool", v: 3, cls: "bg-primary" },
  ];
  return (
    <Frame title="How responses ended">
      <div className="flex h-8 rounded-lg overflow-hidden mb-4">
        {rows.map((r) => (
          <div key={r.l} className={r.cls} style={{ width: `${r.v}%` }} />
        ))}
      </div>
      <div className="space-y-2">
        {rows.map((r) => (
          <div key={r.l} className="flex items-center justify-between text-sm">
            <span className="flex items-center gap-2 text-foreground"><span className={`w-2.5 h-2.5 rounded-full ${r.cls}`} />{r.l}</span>
            <span className="text-xs text-muted-foreground">{r.v}%</span>
          </div>
        ))}
      </div>
      <p className="text-[11px] text-muted-foreground mt-3">A tool handoff is normal: the AI asked another system to do a step.</p>
    </Frame>
  );
}

export function ReliabilityTableVisual() {
  const rows = [
    { r: "Too many requests", n: "38", c: "$58" },
    { r: "Instructions too long", n: "17", c: "$27" },
    { r: "Safety filter", n: "11", c: "$9" },
  ];
  return (
    <div>
      <div className="flex text-[10px] font-semibold text-muted-foreground uppercase tracking-wider px-4 py-2 border-b border-border">
        <span className="flex-1">Reason</span>
        <span className="w-20 text-right">Requests</span>
        <span className="w-20 text-right">Money spent</span>
      </div>
      {rows.map((r) => (
        <div key={r.r} className="flex items-center px-4 py-3 border-b border-border last:border-0 text-sm">
          <span className="flex-1 font-medium text-foreground">{r.r}</span>
          <span className="w-20 text-right text-muted-foreground">{r.n}</span>
          <span className="w-20 text-right font-semibold text-red-600">{r.c}</span>
        </div>
      ))}
      <p className="px-4 py-2 text-[10px] text-muted-foreground border-t border-border">Example numbers for illustration only.</p>
    </div>
  );
}
