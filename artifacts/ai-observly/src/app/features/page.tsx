"use client";
import Link from "next/link";
import { DashboardLayout } from "@/components/layout";
import { ProtectedRoute } from "@/components/protected-route";
import { ChartPanel } from "@/components/charts";
import { useFeatureBreakdown } from "@/hooks/use-api";
import { Zap, Loader2, ChevronRight, TrendingUp, TrendingDown } from "lucide-react";

function MiniBar({ value, max }: { value: number; max: number }) {
  const pct = Math.min(Math.abs(value) / max, 1) * 100;
  return (
    <div className="w-full bg-muted rounded-full h-1.5 mt-1">
      <div
        className={`h-1.5 rounded-full transition-all ${value >= 0 ? "bg-green-500" : "bg-red-500"}`}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}

function MiniSparkline({ positive }: { positive: boolean }) {
  const vals = positive
    ? [20, 35, 28, 42, 50, 45, 58, 62, 55, 68]
    : [58, 50, 45, 38, 32, 28, 24, 22, 20, 18];
  const max = Math.max(...vals);
  const min = Math.min(...vals);
  const w = 56; const h = 20;
  const pts = vals.map((v, i) => {
    const x = (i / (vals.length - 1)) * w;
    const y = h - ((v - min) / (max - min || 1)) * h;
    return `${x},${y}`;
  });
  return (
    <svg width={w} height={h} className="opacity-70">
      <polyline points={pts.join(" ")} fill="none" stroke={positive ? "#16a34a" : "#dc2626"} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function FeaturesContent() {
  const { data: features, isLoading } = useFeatureBreakdown();
  const maxRoi = features ? Math.max(...features.map((f) => Math.abs(f.roi)), 1) : 1;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold font-outfit text-foreground">Features</h1>
        <p className="text-muted-foreground text-sm mt-1">ROI and margin breakdown by AI feature</p>
      </div>

      {/* Charts */}
      <ChartPanel section="features" pieTitle="ROI tier distribution" barTitle="Weekly feature cost trend" />

      {/* Feature list */}
      {isLoading ? (
        <div className="flex items-center justify-center h-40">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : features && features.length > 0 ? (
        <div className="space-y-3">
          {/* Header — hidden on mobile */}
          <div className="hidden sm:grid grid-cols-[1fr_90px_110px_100px_64px_36px] gap-4 px-4 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider border-b border-border">
            <span>Feature</span>
            <span>Cost</span>
            <span>Revenue est.</span>
            <span>ROI</span>
            <span>Trend</span>
            <span />
          </div>

          {features.map((f) => {
            const featureId = (f as { id?: string }).id ?? f.name.toLowerCase().replace(/\s+/g, "_");
            return (
              <Link
                key={f.name}
                href={`/features/${featureId}`}
                className="block bg-card border border-border rounded-xl shadow-sm hover:border-primary/40 hover:shadow-md transition-all group"
              >
                {/* Mobile card */}
                <div className="sm:hidden p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                        <Zap className="w-3.5 h-3.5" />
                      </div>
                      <span className="font-semibold text-foreground">{f.name}</span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-sm">
                    <div><p className="text-xs text-muted-foreground">Cost</p><p className="font-medium">${f.cost}</p></div>
                    <div><p className="text-xs text-muted-foreground">Revenue</p><p className="font-medium">${f.revenueEstimate}</p></div>
                    <div>
                      <p className="text-xs text-muted-foreground">ROI</p>
                      <p className={`font-semibold ${f.roi >= 0 ? "text-green-600" : "text-red-600"}`}>
                        {f.roi >= 0 ? "+" : ""}{f.roi}%
                      </p>
                    </div>
                  </div>
                  <MiniBar value={f.roi} max={maxRoi} />
                </div>

                {/* Desktop row */}
                <div className="hidden sm:grid grid-cols-[1fr_90px_110px_100px_64px_36px] gap-4 px-4 py-4 items-center text-sm">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                      <Zap className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium text-foreground truncate">{f.name}</p>
                      <MiniBar value={f.roi} max={maxRoi} />
                    </div>
                  </div>
                  <span className="text-muted-foreground">${f.cost}</span>
                  <span className="text-muted-foreground">${f.revenueEstimate}</span>
                  <div className="flex items-center gap-1.5">
                    {f.roi >= 0
                      ? <TrendingUp className="w-3.5 h-3.5 text-green-600" />
                      : <TrendingDown className="w-3.5 h-3.5 text-red-600" />}
                    <span className={`font-semibold ${f.roi >= 0 ? "text-green-600" : "text-red-600"}`}>
                      {f.roi >= 0 ? "+" : ""}{f.roi}%
                    </span>
                  </div>
                  <MiniSparkline positive={f.roi >= 0} />
                  <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                </div>
              </Link>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-16 text-muted-foreground">
          <Zap className="w-12 h-12 mx-auto mb-4 opacity-30" />
          <p className="font-semibold text-foreground mb-2">No feature data yet</p>
          <p className="text-sm mb-4">
            Feature tracking requires sending <code className="font-mono bg-muted px-1.5 py-0.5 rounded text-xs">feature_label</code> in usage events.
          </p>
          <Link href="/settings" className="text-sm text-primary hover:underline font-medium">
            Go to Settings to configure features →
          </Link>
        </div>
      )}
    </div>
  );
}

export default function FeaturesPage() {
  return (
    <ProtectedRoute>
      <DashboardLayout>
        <FeaturesContent />
      </DashboardLayout>
    </ProtectedRoute>
  );
}
