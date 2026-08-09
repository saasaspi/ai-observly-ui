"use client";
import Link from "next/link";
import { DashboardLayout } from "@/components/layout";
import { ProtectedRoute } from "@/components/protected-route";
import { ChartPanel } from "@/components/charts";
import { useCustomers } from "@/hooks/use-api";
import { Users, Loader2, ChevronRight } from "lucide-react";

function StatusDot({ status }: { status: "red" | "yellow" | "green" }) {
  const map = { red: "bg-red-500", yellow: "bg-yellow-500", green: "bg-green-500" };
  return <span className={`inline-block w-2.5 h-2.5 rounded-full ${map[status]} shrink-0`} />;
}

function MiniSparkline({ values, positive }: { values: number[]; positive: boolean }) {
  const max = Math.max(...values, 1);
  const min = Math.min(...values);
  const w = 60; const h = 24;
  const pts = values.map((v, i) => {
    const x = (i / (values.length - 1)) * w;
    const y = h - ((v - min) / (max - min || 1)) * h;
    return `${x},${y}`;
  });
  return (
    <svg width={w} height={h} className="opacity-70">
      <polyline points={pts.join(" ")} fill="none" stroke={positive ? "#16a34a" : "#dc2626"} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function CustomersContent() {
  const { data: customers, isLoading } = useCustomers();

  const sparklines: Record<string, number[]> = {
    cust_1: [380, 410, 430, 455, 420, 455],
    cust_2: [210, 240, 250, 255, 248, 240],
    cust_3: [45, 50, 54, 55, 52, 53],
    cust_4: [15, 14, 16, 15, 15, 14],
    cust_5: [85, 95, 98, 105, 99, 97],
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold font-outfit text-foreground">Customers</h1>
        <p className="text-muted-foreground text-sm mt-1">Per-customer AI cost and margin breakdown</p>
      </div>

      {/* Charts */}
      <ChartPanel section="customers" pieTitle="Cost share by customer" barTitle="Weekly revenue trend" />

      {/* Customer list */}
      {isLoading ? (
        <div className="flex items-center justify-center h-40">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : customers && customers.length > 0 ? (
        <div className="space-y-3">
          {/* Table header — hidden on mobile */}
          <div className="hidden sm:grid grid-cols-[1fr_80px_80px_90px_80px_36px] gap-4 px-4 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider border-b border-border">
            <span>Customer</span>
            <span>Cost</span>
            <span>Revenue</span>
            <span>Margin</span>
            <span>Status</span>
            <span />
          </div>
          {customers.map((c) => (
            <Link
              key={c.id}
              href={`/customers/${c.id}`}
              className="block bg-card border border-border rounded-xl shadow-sm hover:border-primary/40 hover:shadow-md transition-all group"
            >
              {/* Mobile card layout */}
              <div className="sm:hidden p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <StatusDot status={c.status} />
                    <span className="font-semibold text-foreground">{c.name}</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                </div>
                <div className="grid grid-cols-3 gap-2 text-sm">
                  <div><p className="text-xs text-muted-foreground">Cost</p><p className="font-medium">${c.cost}</p></div>
                  <div><p className="text-xs text-muted-foreground">Revenue</p><p className="font-medium">${c.revenue}</p></div>
                  <div>
                    <p className="text-xs text-muted-foreground">Margin</p>
                    <p className={`font-semibold ${c.margin >= 0 ? "text-green-600" : "text-red-600"}`}>
                      {c.margin >= 0 ? "+" : ""}${c.margin}
                    </p>
                  </div>
                </div>
              </div>

              {/* Desktop row layout */}
              <div className="hidden sm:grid grid-cols-[1fr_80px_80px_90px_80px_36px] gap-4 px-4 py-4 items-center text-sm">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                    <Users className="w-4 h-4" />
                  </div>
                  <span className="font-medium text-foreground truncate">{c.name}</span>
                </div>
                <span className="text-muted-foreground">${c.cost}</span>
                <span className="text-muted-foreground">${c.revenue}</span>
                <div className="flex items-center gap-2">
                  <span className={`font-semibold ${c.margin >= 0 ? "text-green-600" : "text-red-600"}`}>
                    {c.margin >= 0 ? "+" : ""}${c.margin}
                  </span>
                  <MiniSparkline values={sparklines[c.id] ?? [1, 2, 3]} positive={c.margin >= 0} />
                </div>
                <div className="flex items-center gap-1.5">
                  <StatusDot status={c.status} />
                  <span className="text-xs text-muted-foreground capitalize">{c.status}</span>
                </div>
                <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 text-muted-foreground">
          <Users className="w-12 h-12 mx-auto mb-4 opacity-30" />
          <p className="font-semibold text-foreground mb-2">No customer data yet</p>
          <p className="text-sm mb-4">
            Customer tracking requires sending <code className="font-mono bg-muted px-1.5 py-0.5 rounded text-xs">customer_id</code> in usage events.
          </p>
          <Link href="/settings" className="text-sm text-primary hover:underline font-medium">
            Go to Settings to generate your API key →
          </Link>
        </div>
      )}
    </div>
  );
}

export default function CustomersPage() {
  return (
    <ProtectedRoute>
      <DashboardLayout>
        <CustomersContent />
      </DashboardLayout>
    </ProtectedRoute>
  );
}
