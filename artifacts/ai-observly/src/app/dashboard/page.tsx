"use client";
import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { DashboardLayout } from "@/components/layout";
import { ProtectedRoute } from "@/components/protected-route";
import { useDashboardSummary, useCustomers, useFeatureBreakdown, useTechnicalDetails } from "@/hooks/use-api";
import { TrendingUp, TrendingDown, DollarSign, Users, Zap, ChevronDown, ChevronUp, Loader2, AlertCircle, Info } from "lucide-react";

function TrendChart({ data, color = "primary" }: { data: number[]; color?: "primary" | "green" | "red" }) {
  const max = Math.max(...data, 1);
  const min = Math.min(...data);
  const h = 48;
  const w = 120;
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

function TechnicalDetailsCell({ customerId }: { customerId: string }) {
  const { data, isLoading } = useTechnicalDetails(customerId, true);
  if (isLoading) return <div className="flex items-center gap-2 text-sm text-muted-foreground"><Loader2 className="w-3 h-3 animate-spin" /> Loading…</div>;
  if (!data) return null;
  return (
    <dl className="text-xs space-y-1 text-muted-foreground">
      <div className="flex gap-3"><dt className="font-medium">Total tokens:</dt><dd>{data.tokens.toLocaleString()}</dd></div>
      <div className="flex gap-3"><dt className="font-medium">Requests:</dt><dd>{data.requestCount.toLocaleString()}</dd></div>
      <div className="flex gap-3"><dt className="font-medium">Models:</dt><dd>{data.models.join(", ")}</dd></div>
    </dl>
  );
}

function StatusDot({ status }: { status: "red" | "yellow" | "green" }) {
  const map = { red: "bg-red-500", yellow: "bg-yellow-500", green: "bg-green-500" };
  return <span className={`inline-block w-2.5 h-2.5 rounded-full ${map[status]} shrink-0`} />;
}

function DashboardContent() {
  const [activeTab, setActiveTab] = useState("overview");
  const [expandedCustomer, setExpandedCustomer] = useState<string | null>(null);

  const { data: summary, isLoading: summaryLoading } = useDashboardSummary();
  const { data: customers, isLoading: customersLoading } = useCustomers();
  const { data: features, isLoading: featuresLoading } = useFeatureBreakdown();

  const costTrend = [820, 910, 755, 985, 1040, 890, 970, 1100, 1055, 1140];
  const revTrend = [2800, 3100, 2950, 3400, 3600, 3300, 3800, 3900, 4050, 4200];
  const profitTrend = [1980, 2190, 2195, 2415, 2560, 2410, 2830, 2800, 2995, 3060];

  const tabs = ["overview", "customers", "features"];

  return (
    <div className="space-y-8">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-outfit text-foreground">Dashboard</h1>
          <p className="text-muted-foreground text-sm mt-1">Your AI cost &amp; margin overview</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-border gap-0">
        {tabs.map(t => (
          <button
            key={t}
            onClick={() => setActiveTab(t)}
            className={`px-4 py-2.5 text-sm font-medium capitalize transition-colors border-b-2 -mb-px ${
              activeTab === t
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {/* OVERVIEW TAB */}
      {activeTab === "overview" && (
        <div className="space-y-6">
          {summaryLoading ? (
            <div className="flex items-center justify-center h-40">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : summary ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Total AI Cost</p>
                    <p className="text-3xl font-bold font-outfit text-foreground">
                      ${summary.totalCost.toLocaleString()}
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">this month</p>
                  </div>
                  <div className="w-10 h-10 bg-red-50 text-red-500 rounded-lg flex items-center justify-center">
                    <DollarSign className="w-5 h-5" />
                  </div>
                </div>
                <TrendChart data={costTrend} color="red" />
              </div>

              <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Attributed Revenue</p>
                    <p className="text-3xl font-bold font-outfit text-foreground">
                      ${summary.totalRevenue.toLocaleString()}
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">from AI features</p>
                  </div>
                  <div className="w-10 h-10 bg-primary/10 text-primary rounded-lg flex items-center justify-center">
                    <TrendingUp className="w-5 h-5" />
                  </div>
                </div>
                <TrendChart data={revTrend} color="primary" />
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
                <TrendChart data={profitTrend} color="green" />
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-3 p-6 bg-card border border-border rounded-xl text-muted-foreground">
              <AlertCircle className="w-5 h-5 text-yellow-500" />
              <p className="text-sm">No data yet. Start sending usage events from your app.</p>
            </div>
          )}

          {/* Quick tips */}
          <div className="bg-primary/5 border border-primary/20 rounded-xl p-6">
            <div className="flex items-center gap-2 mb-3">
              <Info className="w-4 h-4 text-primary" />
              <h3 className="font-semibold text-sm text-foreground">Getting started</h3>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              This is mock data. Connect your app to see real numbers.
            </p>
            <div className="flex gap-3">
              <Link href="/docs" className="text-sm text-primary hover:underline font-medium">
                Integration guide →
              </Link>
              <Link href="/settings" className="text-sm text-primary hover:underline font-medium">
                Generate API key →
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* CUSTOMERS TAB */}
      {activeTab === "customers" && (
        <div className="space-y-4">
          {customersLoading ? (
            <div className="flex items-center justify-center h-40">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : customers && customers.length > 0 ? (
            <div className="space-y-3">
              <div className="grid grid-cols-[1fr_auto_auto_auto_auto] gap-4 px-4 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider border-b border-border">
                <span>Customer</span>
                <span>Cost</span>
                <span>Revenue</span>
                <span>Margin</span>
                <span>Status</span>
              </div>
              {customers.map(c => (
                <div key={c.id} className="bg-card border border-border rounded-xl overflow-hidden shadow-sm">
                  <button
                    className="w-full grid grid-cols-[1fr_auto_auto_auto_auto] gap-4 px-4 py-4 text-sm items-center hover:bg-muted/30 transition-colors"
                    onClick={() => setExpandedCustomer(expandedCustomer === c.id ? null : c.id)}
                  >
                    <span className="font-medium text-foreground text-left">{c.name}</span>
                    <span className="text-muted-foreground">${c.cost}</span>
                    <span className="text-muted-foreground">${c.revenue}</span>
                    <span className={`font-semibold ${c.margin >= 0 ? "text-green-600" : "text-red-600"}`}>
                      {c.margin >= 0 ? "+" : ""}${c.margin}
                    </span>
                    <div className="flex items-center gap-2">
                      <StatusDot status={c.status} />
                      {expandedCustomer === c.id ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
                    </div>
                  </button>
                  {expandedCustomer === c.id && (
                    <div className="px-4 pb-4 border-t border-border pt-3 bg-muted/20">
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Technical details</p>
                      <TechnicalDetailsCell customerId={c.id} />
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16 text-muted-foreground">
              <Users className="w-12 h-12 mx-auto mb-4 opacity-30" />
              <p className="font-semibold text-foreground mb-2">No customer data yet</p>
              <p className="text-sm mb-4">
                Customer tracking requires sending{" "}
                <code className="font-mono bg-muted px-1.5 py-0.5 rounded text-xs">customer_id</code> in usage events.
              </p>
              <Link href="/settings" className="text-sm text-primary hover:underline font-medium">
                Go to Settings to generate your API key →
              </Link>
            </div>
          )}
        </div>
      )}

      {/* FEATURES TAB */}
      {activeTab === "features" && (
        <div className="space-y-4">
          {featuresLoading ? (
            <div className="flex items-center justify-center h-40">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : features && features.length > 0 ? (
            <div className="space-y-3">
              <div className="grid grid-cols-[1fr_auto_auto_auto] gap-4 px-4 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider border-b border-border">
                <span>Feature</span>
                <span>Cost</span>
                <span>Revenue est.</span>
                <span>ROI</span>
              </div>
              {features.map(f => (
                <div key={f.name} className="bg-card border border-border rounded-xl shadow-sm">
                  <div className="grid grid-cols-[1fr_auto_auto_auto] gap-4 px-4 py-4 text-sm items-center">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                        <Zap className="w-4 h-4" />
                      </div>
                      <span className="font-medium text-foreground">{f.name}</span>
                    </div>
                    <span className="text-muted-foreground">${f.cost}</span>
                    <span className="text-muted-foreground">${f.revenueEstimate}</span>
                    <span className={`font-semibold ${f.roi >= 0 ? "text-green-600" : "text-red-600"}`}>
                      {f.roi >= 0 ? "+" : ""}{f.roi}%
                    </span>
                  </div>
                  <div className="px-4 pb-3">
                    <div className="w-full bg-muted rounded-full h-1.5">
                      <div
                        className={`h-1.5 rounded-full transition-all ${f.roi >= 0 ? "bg-green-500" : "bg-red-500"}`}
                        style={{ width: `${Math.min(Math.abs(f.roi) / 2, 100)}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16 text-muted-foreground">
              <Zap className="w-12 h-12 mx-auto mb-4 opacity-30" />
              <p className="font-semibold text-foreground mb-2">No feature data yet</p>
              <p className="text-sm mb-4">
                Feature tracking requires sending{" "}
                <code className="font-mono bg-muted px-1.5 py-0.5 rounded text-xs">feature_label</code> in usage events.
              </p>
              <Link href="/settings" className="text-sm text-primary hover:underline font-medium">
                Go to Settings to configure features →
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function Dashboard() {
  return (
    <ProtectedRoute>
      <DashboardLayout>
        <DashboardContent />
      </DashboardLayout>
    </ProtectedRoute>
  );
}
