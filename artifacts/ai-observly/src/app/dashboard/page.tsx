"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { DashboardLayout } from "@/components/layout";
import { ProtectedRoute } from "@/components/protected-route";
import { ChartPanel } from "@/components/charts";
import { OnboardingDialog, useOnboardingDialog, useIntegrationBanner } from "@/components/onboarding-dialog";
import { useDashboardSummary } from "@/hooks/use-api";
import { TrendingUp, TrendingDown, DollarSign, Loader2, AlertCircle, Info, X } from "lucide-react";

function TrendSparkline({ data, color = "primary" }: { data: number[]; color?: "primary" | "green" | "red" }) {
  const max = Math.max(...data, 1);
  const min = Math.min(...data);
  const h = 40;
  const w = 100;
  const pts = data.map((v, i) => {
    const x = (i / (data.length - 1)) * w;
    const y = h - ((v - min) / (max - min || 1)) * h;
    return `${x},${y}`;
  });
  const colorMap = { primary: "#2563eb", green: "#16a34a", red: "#dc2626" };
  return (
    <svg width={w} height={h} className="opacity-60">
      <polyline points={pts.join(" ")} fill="none" stroke={colorMap[color]} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function IntegrationBanner() {
  const { show, dismiss } = useIntegrationBanner();
  if (!show) return null;
  return (
    <div className="flex items-center justify-between gap-3 px-4 py-3 bg-yellow-50 border border-yellow-200 rounded-xl text-sm">
      <div className="flex items-center gap-2.5 min-w-0">
        <AlertCircle className="w-4 h-4 text-yellow-600 shrink-0" />
        <span className="text-yellow-800 font-medium">Integration pending — no data yet.</span>
        <Link href="/docs" className="text-yellow-700 underline hover:text-yellow-900 hidden sm:inline">
          Finish setup →
        </Link>
      </div>
      <button onClick={dismiss} className="text-yellow-600 hover:text-yellow-800 shrink-0 p-1">
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}

function OverviewContent() {
  const { data: summary, isLoading: summaryLoading } = useDashboardSummary();
  const { show: showOnboarding, close: closeOnboarding } = useOnboardingDialog();

  const costTrend = [820, 910, 755, 985, 1040, 890, 970, 1100, 1055, 1140];
  const revTrend  = [2800, 3100, 2950, 3400, 3600, 3300, 3800, 3900, 4050, 4200];
  const profitTrend = [1980, 2190, 2195, 2415, 2560, 2410, 2830, 2800, 2995, 3060];

  return (
    <>
      {showOnboarding && <OnboardingDialog onClose={closeOnboarding} />}

      <div className="space-y-8">
        <div>
          <h1 className="text-2xl font-bold font-outfit text-foreground">Overview</h1>
          <p className="text-muted-foreground text-sm mt-1">Your AI cost &amp; margin summary</p>
        </div>

        <IntegrationBanner />

        {/* Summary cards */}
        {summaryLoading ? (
          <div className="flex items-center justify-center h-40">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : summary ? (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Total AI Cost</p>
                  <p className="text-3xl font-bold font-outfit text-foreground">${summary.totalCost.toLocaleString()}</p>
                  <p className="text-sm text-muted-foreground mt-1">this month</p>
                </div>
                <div className="w-10 h-10 bg-red-50 text-red-500 rounded-lg flex items-center justify-center">
                  <DollarSign className="w-5 h-5" />
                </div>
              </div>
              <TrendSparkline data={costTrend} color="red" />
            </div>

            <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Attributed Revenue</p>
                  <p className="text-3xl font-bold font-outfit text-foreground">${summary.totalRevenue.toLocaleString()}</p>
                  <p className="text-sm text-muted-foreground mt-1">from AI features</p>
                </div>
                <div className="w-10 h-10 bg-primary/10 text-primary rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-5 h-5" />
                </div>
              </div>
              <TrendSparkline data={revTrend} color="primary" />
            </div>

            <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Net Profit</p>
                  <p className={`text-3xl font-bold font-outfit ${summary.totalProfit >= 0 ? "text-green-600" : "text-red-600"}`}>
                    {summary.totalProfit >= 0 ? "+" : ""}${summary.totalProfit.toLocaleString()}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">AI margin</p>
                </div>
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${summary.totalProfit >= 0 ? "bg-green-50 text-green-600" : "bg-red-50 text-red-600"}`}>
                  {summary.totalProfit >= 0 ? <TrendingUp className="w-5 h-5" /> : <TrendingDown className="w-5 h-5" />}
                </div>
              </div>
              <TrendSparkline data={profitTrend} color="green" />
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-3 p-6 bg-card border border-border rounded-xl text-muted-foreground">
            <AlertCircle className="w-5 h-5 text-yellow-500" />
            <p className="text-sm">No data yet. Start sending usage events from your app.</p>
          </div>
        )}

        {/* Charts */}
        <ChartPanel
          section="overview"
          pieTitle="Cost by feature"
          barTitle="Weekly cost vs revenue"
        />

        {/* Getting started tip */}
        <div className="bg-primary/5 border border-primary/20 rounded-xl p-6">
          <div className="flex items-center gap-2 mb-3">
            <Info className="w-4 h-4 text-primary" />
            <h3 className="font-semibold text-sm text-foreground">Getting started</h3>
          </div>
          <p className="text-sm text-muted-foreground mb-4">This is mock data. Connect your app to see real numbers.</p>
          <div className="flex flex-wrap gap-3">
            <Link href="/docs" className="text-sm text-primary hover:underline font-medium">Integration guide →</Link>
            <Link href="/settings" className="text-sm text-primary hover:underline font-medium">Generate API key →</Link>
          </div>
        </div>
      </div>
    </>
  );
}

export default function Dashboard() {
  return (
    <ProtectedRoute>
      <DashboardLayout>
        <OverviewContent />
      </DashboardLayout>
    </ProtectedRoute>
  );
}
