"use client";
import Link from "next/link";
import { useParams } from "next/navigation";
import { DashboardLayout } from "@/components/layout";
import { ProtectedRoute } from "@/components/protected-route";
import { ChartPanel } from "@/components/charts";
import { useCustomerDetail } from "@/hooks/use-api";
import { ArrowLeft, Loader2, Users, AlertCircle, Cpu, Hash, Layers } from "lucide-react";

function CustomerDetailContent() {
  const { id } = useParams<{ id: string }>();
  const { data, isLoading, error } = useCustomerDetail(id);

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
        <Link href="/customers" className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Customers
        </Link>
        <div className="flex items-center gap-3 p-6 bg-card border border-border rounded-xl text-muted-foreground">
          <AlertCircle className="w-5 h-5 text-yellow-500" />
          <p className="text-sm">Customer not found.</p>
        </div>
      </div>
    );
  }

  const statusColor = data.status === "green" ? "text-green-600 bg-green-50" : data.status === "yellow" ? "text-yellow-600 bg-yellow-50" : "text-red-600 bg-red-50";

  return (
    <div className="space-y-8">
      {/* Back */}
      <Link href="/customers" className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back to Customers
      </Link>

      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold font-outfit text-foreground">{data.name}</h1>
            <span className={`inline-block mt-1 text-xs font-semibold px-2.5 py-1 rounded-full capitalize ${statusColor}`}>
              {data.status} margin
            </span>
          </div>
        </div>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "AI Cost", value: `$${data.cost.toLocaleString()}`, sub: "this month" },
          { label: "Revenue", value: `$${data.revenue.toLocaleString()}`, sub: "attributed" },
          { label: "Margin", value: `${data.margin >= 0 ? "+" : ""}$${data.margin.toLocaleString()}`, sub: "net profit", highlight: data.margin >= 0 ? "text-green-600" : "text-red-600" },
          { label: "Requests", value: data.requestCount.toLocaleString(), sub: "API calls" },
        ].map((s) => (
          <div key={s.label} className="bg-card border border-border rounded-xl p-5 shadow-sm">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">{s.label}</p>
            <p className={`text-2xl font-bold font-outfit ${s.highlight ?? "text-foreground"}`}>{s.value}</p>
            <p className="text-xs text-muted-foreground mt-1">{s.sub}</p>
          </div>
        ))}
      </div>

      {/* Technical details */}
      <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
        <h2 className="text-sm font-semibold text-foreground mb-4">Technical breakdown</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
              <Hash className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Total tokens</p>
              <p className="font-semibold text-foreground">{(data.tokens / 1_000_000).toFixed(2)}M</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-violet-50 text-violet-600 flex items-center justify-center">
              <Cpu className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">API requests</p>
              <p className="font-semibold text-foreground">{data.requestCount.toLocaleString()}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-cyan-50 text-cyan-600 flex items-center justify-center">
              <Layers className="w-4 h-4" />
            </div>
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
          section={`customer_${id}`}
          pieTitle="Cost by feature"
          barTitle="Weekly cost vs revenue"
          overrideBarData={data.barData}
          overridePieData={data.pieData}
        />
      </div>
    </div>
  );
}

export default function CustomerDetailPage() {
  return (
    <ProtectedRoute>
      <DashboardLayout>
        <CustomerDetailContent />
      </DashboardLayout>
    </ProtectedRoute>
  );
}
