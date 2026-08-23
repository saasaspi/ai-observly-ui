"use client";

import { useRef, useState, useEffect } from "react";

// ─── Data ────────────────────────────────────────────────────────────────────

const TOOLS = [
  {
    name: "AI Observly", cat: "own", catlabel: "AI Observly",
    x: 697, y: 97, r: 9,
    fill: "#2563eb", labelFill: "#1d4ed8", labelWeight: "600",
    labelX: 14, labelY: 4,
    desc: "Per-customer margin, per-feature ROI, and plan-pricing guidance — built for non-technical AI SaaS founders.",
  },
  {
    name: "Costr", cat: "direct", catlabel: "Per-Customer Cost Tool",
    x: 490, y: 228, r: 6,
    fill: "#0ea5b7", labelFill: "#64748b", labelWeight: "400",
    labelX: 12, labelY: 4,
    desc: "Per-customer AI cost attribution via a proxy header. Indie-priced, but no plan-tier pricing guidance.",
  },
  {
    name: "PerUnit", cat: "direct", catlabel: "Per-Customer Cost Tool",
    x: 456, y: 261, r: 6,
    fill: "#0ea5b7", labelFill: "#64748b", labelWeight: "400",
    labelX: 12, labelY: 18,
    desc: "Cost by customer, feature, and pricing tier. $99/mo early access, metadata-tagging setup.",
  },
  {
    name: "MarginDash", cat: "direct", catlabel: "Per-Customer Cost Tool",
    x: 366, y: 144, r: 6,
    fill: "#0ea5b7", labelFill: "#64748b", labelWeight: "400",
    labelX: 12, labelY: 4,
    desc: "Per-customer & per-feature margin with Stripe sync and budget enforcement. SDK-first, engineering-oriented setup.",
  },
  {
    name: "Helicone", cat: "obs", catlabel: "LLM Observability",
    x: 242, y: 342, r: 6,
    fill: "#94a3b8", labelFill: "#64748b", labelWeight: "400",
    labelX: 12, labelY: 4,
    desc: "Request-level observability and cost tagging. No revenue or margin data — built for debugging, not pricing.",
  },
  {
    name: "Langfuse", cat: "obs", catlabel: "LLM Observability",
    x: 200, y: 378, r: 6,
    fill: "#94a3b8", labelFill: "#64748b", labelWeight: "400",
    labelX: 12, labelY: 4,
    desc: "Open-source tracing and prompt debugging. Deep trace views, but no cost-to-revenue link.",
  },
  {
    name: "LangSmith", cat: "obs", catlabel: "LLM Observability",
    x: 173, y: 412, r: 6,
    fill: "#94a3b8", labelFill: "#64748b", labelWeight: "400",
    labelX: 12, labelY: 4,
    desc: "Agent evaluation and debugging for LangChain apps. Cost is a side effect of tracing, not the focus.",
  },
  {
    name: "CloudZero", cat: "finops", catlabel: "Cloud & AI FinOps",
    x: 269, y: 88, r: 6,
    fill: "#6366f1", labelFill: "#64748b", labelWeight: "400",
    labelX: 12, labelY: 4,
    desc: "Enterprise-grade cost-per-customer across cloud + AI spend. Powerful, but built for finance/platform teams and enterprise budgets.",
  },
  {
    name: "Amberflo", cat: "finops", catlabel: "Cloud & AI FinOps",
    x: 242, y: 172, r: 6,
    fill: "#6366f1", labelFill: "#64748b", labelWeight: "400",
    labelX: -72, labelY: 4,
    desc: "Usage-based billing and cost attribution by customer or workload. Custom enterprise pricing, not indie-scale.",
  },
] as const;

const LEGEND = [
  { cat: "own",    label: "AI Observly",              color: "#2563eb" },
  { cat: "direct", label: "Per-customer cost tools",  color: "#0ea5b7" },
  { cat: "obs",    label: "LLM observability",        color: "#94a3b8" },
  { cat: "finops", label: "Cloud & AI FinOps",        color: "#6366f1" },
] as const;

const CAT_COLORS: Record<string, string> = {
  own: "#2563eb", direct: "#0ea5b7", obs: "#64748b", finops: "#6366f1",
};

// ─── Component ───────────────────────────────────────────────────────────────

interface TooltipState {
  name: string; cat: string; catlabel: string; desc: string;
  x: number; y: number;
}

export function PositioningMatrix() {
  const cardRef = useRef<HTMLDivElement>(null);
  const [tooltip, setTooltip] = useState<TooltipState | null>(null);
  const [offFilters, setOffFilters] = useState<Set<string>>(new Set());
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(mq.matches);
    const handler = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  const isDimmed = (cat: string) => offFilters.size > 0 && offFilters.has(cat);

  function calcTipPos(e: React.MouseEvent) {
    if (!cardRef.current) return { x: 0, y: 0 };
    const rect = cardRef.current.getBoundingClientRect();
    let x = e.clientX - rect.left + 16;
    let y = e.clientY - rect.top + 16;
    if (x + 262 > rect.width) x = e.clientX - rect.left - 268;
    return { x, y };
  }

  function handleEnter(tool: (typeof TOOLS)[number], e: React.MouseEvent) {
    const pos = calcTipPos(e);
    setTooltip({ name: tool.name, cat: tool.cat, catlabel: tool.catlabel, desc: tool.desc, ...pos });
  }

  function handleMove(e: React.MouseEvent) {
    const pos = calcTipPos(e);
    setTooltip(prev => prev ? { ...prev, ...pos } : prev);
  }

  function handleLeave() {
    setTooltip(null);
  }

  function handleClick(tool: (typeof TOOLS)[number], e: React.MouseEvent) {
    e.stopPropagation();
    if (tooltip?.name === tool.name) { setTooltip(null); return; }
    const pos = calcTipPos(e);
    setTooltip({ name: tool.name, cat: tool.cat, catlabel: tool.catlabel, desc: tool.desc, ...pos });
  }

  function toggleFilter(cat: string) {
    setOffFilters(prev => {
      const next = new Set(prev);
      if (next.has(cat)) next.delete(cat); else next.add(cat);
      return next;
    });
  }

  return (
    <section className="py-24 px-6 bg-background border-t border-border">
      <div className="max-w-5xl mx-auto">

        {/* Header */}
        <div className="text-center mb-12">
          <p data-reveal className="text-sm font-semibold uppercase tracking-widest text-primary mb-3">
            Where we fit
          </p>
          <h2
            data-reveal
            style={{ transitionDelay: "0.08s" }}
            className="text-3xl md:text-4xl font-bold font-outfit mb-4"
          >
            The AI cost landscape has two axes.
            <br className="hidden md:block" />
            We built for the{" "}
            <span className="text-primary">corner nobody else did.</span>
          </h2>
          <p
            data-reveal
            style={{ transitionDelay: "0.16s" }}
            className="text-muted-foreground text-lg max-w-xl mx-auto mb-5"
          >
            Every tool below answers a different question. Plotting them on two
            axes makes the gap obvious.
          </p>
          <div
            data-reveal
            style={{ transitionDelay: "0.20s" }}
            className="inline-block text-sm text-muted-foreground bg-muted/50 border border-border rounded-xl px-4 py-3 max-w-2xl text-left"
          >
            <strong className="text-foreground">How to read this:</strong> the
            horizontal axis is{" "}
            <strong className="text-foreground">who the tool is built for</strong> —
            an engineering team, or a non-technical founder. The vertical axis is{" "}
            <strong className="text-foreground">what problem it solves</strong> —
            tracing requests, or telling you if a customer is profitable. Hover any
            point for specifics.
          </div>
        </div>

        {/* Chart card */}
        <div
          ref={cardRef}
          className="relative border border-border rounded-2xl bg-card p-4 md:p-6 shadow-sm overflow-hidden"
          onClick={() => setTooltip(null)}
        >
          {/* Mobile Y-axis caption */}
          <p className="md:hidden text-[10px] font-mono tracking-wide text-muted-foreground mb-3">
            <span>Observability &amp; Debugging</span>
            <span className="text-primary mx-1">→</span>
            <span className="text-primary font-semibold">Business Profitability &amp; Pricing</span>
          </p>

          <div className="flex items-stretch gap-2">
            {/* Rotated Y-axis label — desktop only */}
            <div className="hidden md:block relative w-8 flex-none select-none">
              <div
                className="absolute left-1/2 top-1/2 whitespace-nowrap text-[10px] font-mono tracking-wide text-muted-foreground"
                style={{ transform: "translate(-50%,-50%) rotate(-90deg)", width: 520, textAlign: "center" }}
              >
                <span>Observability &amp; Debugging</span>
                <span className="text-primary mx-2">→</span>
                <span className="text-primary font-semibold">Business Profitability &amp; Pricing</span>
              </div>
            </div>

            {/* SVG */}
            <div className="flex-1 min-w-0">
              <svg
                viewBox="0 0 820 600"
                className="w-full h-auto"
                style={{ display: "block", overflow: "visible" }}
              >
                <defs>
                  <marker id="pmArrow" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto">
                    <path d="M0,0 L8,4 L0,8 Z" fill="#cbd5e1" />
                  </marker>
                </defs>

                {/* Quadrant tints */}
                <rect x="435" y="40"  width="345" height="245" fill="#2563eb" opacity="0.045" />
                <rect x="90"  y="40"  width="345" height="245" fill="#6366f1" opacity="0.04"  />
                <rect x="90"  y="285" width="345" height="235" fill="#64748b" opacity="0.035" />
                <rect x="435" y="285" width="345" height="235" fill="#64748b" opacity="0.012" />

                {/* Gridlines */}
                <line x1="90" y1="112" x2="780" y2="112" stroke="#eef2f7" strokeWidth="1" />
                <line x1="90" y1="402" x2="780" y2="402" stroke="#eef2f7" strokeWidth="1" />
                <line x1="262" y1="40"  x2="262" y2="520" stroke="#eef2f7" strokeWidth="1" />
                <line x1="608" y1="40"  x2="608" y2="520" stroke="#eef2f7" strokeWidth="1" />

                {/* Quadrant dividers */}
                <line x1="435" y1="40"  x2="435" y2="520" stroke="#cbd5e1" strokeWidth="1" strokeDasharray="3 5" />
                <line x1="90"  y1="285" x2="780" y2="285" stroke="#cbd5e1" strokeWidth="1" strokeDasharray="3 5" />

                {/* Axes */}
                <line x1="90" y1="520" x2="772" y2="520" stroke="#cbd5e1" strokeWidth="1.5" markerEnd="url(#pmArrow)" />
                <line x1="90" y1="520" x2="90"  y2="48"  stroke="#cbd5e1" strokeWidth="1.5" markerEnd="url(#pmArrow)" />

                {/* Quadrant labels */}
                <text x="450" y="62"  fontSize="10.5" letterSpacing="1.2" fill="#1d4ed8" fontWeight="600" fontFamily="monospace">FOUNDER-FIRST PROFITABILITY</text>
                <text x="105" y="62"  fontSize="10.5" letterSpacing="1.2" fill="#94a3b8" fontFamily="monospace">ENGINEERING-LED PROFITABILITY</text>
                <text x="105" y="500" fontSize="10.5" letterSpacing="1.2" fill="#94a3b8" fontFamily="monospace">DEVELOPER OBSERVABILITY</text>

                {/* AI Observly pulsing ring */}
                {!reducedMotion && (
                  <circle cx="697" cy="97" r="11" fill="none" stroke="#2563eb" strokeWidth="1.5" opacity="0.55">
                    <animate attributeName="r"       from="11" to="26" dur="2.6s" repeatCount="indefinite" />
                    <animate attributeName="opacity" from="0.6" to="0"  dur="2.6s" repeatCount="indefinite" />
                  </circle>
                )}

                {/* Data points */}
                {TOOLS.map((tool) => (
                  <g
                    key={tool.name}
                    transform={`translate(${tool.x},${tool.y})`}
                    style={{
                      cursor: "pointer",
                      opacity: isDimmed(tool.cat) ? 0.18 : 1,
                      transition: "opacity 0.2s ease",
                    }}
                    onMouseEnter={(e) => handleEnter(tool, e)}
                    onMouseMove={handleMove}
                    onMouseLeave={handleLeave}
                    onClick={(e) => handleClick(tool, e)}
                  >
                    <circle r={tool.r} fill={tool.fill} stroke="#fff" strokeWidth="2" />
                    <text
                      x={tool.labelX}
                      y={tool.labelY}
                      fontSize="11"
                      fill={tool.labelFill}
                      fontWeight={tool.labelWeight}
                      fontFamily="monospace"
                      style={{ pointerEvents: "none" }}
                    >
                      {tool.name}
                    </text>
                  </g>
                ))}
              </svg>

              {/* X-axis label */}
              <div className="text-center mt-3 text-[10px] font-mono tracking-wide text-muted-foreground select-none">
                <span>Developers &amp; Engineering Teams</span>
                <span className="text-primary mx-2">→</span>
                <span className="text-primary font-semibold">Non-Technical Founders</span>
              </div>
            </div>
          </div>

          {/* Tooltip */}
          {tooltip && (
            <div
              className="absolute z-20 bg-background border border-primary/20 rounded-xl p-3.5 shadow-xl pointer-events-none"
              style={{ left: tooltip.x, top: tooltip.y, maxWidth: 250 }}
            >
              <p className="font-bold font-outfit text-sm text-foreground mb-0.5">{tooltip.name}</p>
              <p
                className="text-[10px] font-mono uppercase tracking-wide mb-2"
                style={{ color: CAT_COLORS[tooltip.cat] }}
              >
                {tooltip.catlabel}
              </p>
              <p className="text-xs text-muted-foreground leading-relaxed">{tooltip.desc}</p>
            </div>
          )}
        </div>

        {/* Legend chips */}
        <div className="flex flex-wrap gap-2.5 mt-5">
          {LEGEND.map(({ cat, label, color }) => (
            <button
              key={cat}
              onClick={() => toggleFilter(cat)}
              className={`flex items-center gap-2 text-xs font-mono text-muted-foreground bg-background border border-border rounded-full px-3.5 py-2 cursor-pointer hover:border-primary/30 transition-all duration-150 ${
                offFilters.has(cat) ? "opacity-35" : ""
              }`}
            >
              <span className="w-2 h-2 rounded-full flex-none" style={{ background: color }} />
              {label}
            </button>
          ))}
        </div>

        {/* Footnote */}
        <p className="mt-4 text-[11px] font-mono text-muted-foreground/60 max-w-3xl leading-relaxed">
          Positioning reflects publicly documented target audiences, setup model, and feature scope as of August 2026 — a qualitative read of the market, not a scored benchmark.
        </p>

      </div>
    </section>
  );
}
