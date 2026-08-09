"use client";
import Link from "next/link";
import { useParams } from "next/navigation";
import { DashboardLayout } from "@/components/layout";
import { ProtectedRoute } from "@/components/protected-route";
import { ChartPanel } from "@/components/charts";
import { useFeatureDetail, useAddonCosts } from "@/hooks/use-api";
import { ArrowLeft, Loader2, Zap, AlertCircle, Hash, Cpu, Layers, TrendingUp, TrendingDown, DollarSign } from "lucide-react";

function FeatureDetailContent() {
  const { id } = useParams<{ id: string }>();
  const { data, isLoading, error } = useFeatureDetail(id);
  const { data: addonCosts } = useAddonCosts();

  // Filter addon costs relevant to this feature
  const relevantAddons = addonCosts?.filter((c) => c.featureId === id) ?? [];
  const totalAddon = relevantAddons.reduce((sum, c) => sum + c.amount, 0);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="space-y-6">
        <Link href="/features" className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Features
        </Link>
        <div className="flex items-center gap-3 p-6 bg-card border border-border rounded-xl text-muted-foreground">
          <AlertCircle className="w-5 h-5 text-yellow-500" />
          <p className="text-sm">Feature not found.</p>
        </div>
      </div>
    );
  }

  const totalCost = data.cost + totalAddon;
  const adjustedMargin = data.revenueEstimate - totalCost;
  const adjustedRoi = totalCost > 0
    ? Math.round(((data.revenueEstimate - totalCost) / totalCost) * 100)
    : null;

  const roiPositive = (adjustedRoi ?? data.roi) >= 0;

  return (
    <div className="space-y-8">
      {/* Back */}
      <Link href="/features" className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back to Features
      </Link>

      {/* Header */}
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
          <Zap className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-2xl font-bold font-outfit text-foreground">{data.name}</h1>
          <div className={`flex items-center gap-1.5 mt-1 text-sm font-semibold ${roiPositive ? "text-green-600" : "text-red-600"}`}>
            {roiPositive ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
            {adjustedRoi !== null ? `${adjustedRoi >= 0 ? "+" : ""}${adjustedRoi}% ROI` : "ROI: N/A"}
            {totalAddon > 0 && <span className="text-xs text-muted-foreground font-normal">(incl. add-on costs)</span>}
          </div>
        </div>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "AI Cost", value: `$${data.cost.toLocaleString()}`, sub: "tracked cost" },
          { label: "Add-on Costs", value: `$${totalAddon.toLocaleString()}`, sub: `${relevantAddons.length} logged`, highlight: totalAddon > 0 ? "text-orange-600" : undefined },
          { label: "Revenue Est.", value: `$${data.revenueEstimate.toLocaleString()}`, sub: "attributed" },
          {
            label: "Margin",
            value: `${adjustedMargin >= 0 ? "+" : ""}$${adjustedMargin.toLocaleString()}`,
            sub: "net profit",
            highlight: adjustedMargin >= 0 ? "text-green-600" : "text-red-600",
          },
        ].map((s) => (
          <div key={s.label} className="bg-card border border-border rounded-xl p-5 shadow-sm">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">{s.label}</p>
            <p className={`text-2xl font-bold font-outfit ${s.highlight ?? "text-foreground"}`}>{s.value}</p>
            <p className="text-xs text-muted-foreground mt-1">{s.sub}</p>
          </div>
        ))}
      </div>

      {/* Technical breakdown */}
      <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
        <h2 className="text-sm font-semibold text-foreground mb-4">Technical breakdown</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center"><Hash className="w-4 h-4" /></div>
            <div>
              <p className="text-xs text-muted-foreground">Total tokens</p>
              <p className="font-semibold text-foreground">{(data.tokenCount / 1_000_000).toFixed(2)}M</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-violet-50 text-violet-600 flex items-center justify-center"><Cpu className="w-4 h-4" /></div>
            <div>
              <p className="text-xs text-muted-foreground">API requests</p>
              <p className="font-semibold text-foreground">{data.requestCount.toLocaleString()}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-cyan-50 text-cyan-600 flex items-center justify-center"><Layers className="w-4 h-4" /></div>
            <div>
              <p className="text-xs text-muted-foreground">Models used</p>
              <p className="font-semibold text-foreground text-sm">{data.models.join(", ")}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div>
        <h2 className="text-base font-semibold text-foreground mb-4">Historical analytics</h2>
        <ChartPanel
          section={`feature_${id}`}
          pieTitle="Token cost breakdown"
          barTitle="Weekly cost vs revenue"
          overrideBarData={data.barData}
          overridePieData={data.pieData}
        />
      </div>

      {/* Add-on costs on this feature */}
      {relevantAddons.length > 0 && (
        <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-foreground">Logged add-on costs</h2>
            <Link href="/settings?tab=addon-cost" className="text-xs text-primary hover:underline font-medium">
              Manage →
            </Link>
          </div>
          <div className="space-y-2">
            {relevantAddons.map((c) => (
              <div key={c.id} className="flex items-center justify-between text-sm py-2 border-b border-border last:border-0">
                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-lg bg-orange-50 text-orange-600 flex items-center justify-center">
                    <DollarSign className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">{c.costType}</p>
                    {c.notes && <p className="text-xs text-muted-foreground">{c.notes}</p>}
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-foreground">${c.amount} {c.currency}</p>
                  <p className="text-xs text-muted-foreground capitalize">{c.recurrence}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default function FeatureDetailPage() {
  return (
    <ProtectedRoute>
      <DashboardLayout>
        <FeatureDetailContent />
      </DashboardLayout>
    </ProtectedRoute>
  );
}
