"use client";
import { useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import { useHistory } from "@/hooks/use-api";
import { Loader2 } from "lucide-react";

const RANGES = [
  { label: "7d", value: "7d" },
  { label: "30d", value: "30d" },
  { label: "90d", value: "90d" },
];

interface ChartPanelProps {
  section: string;
  pieTitle?: string;
  barTitle?: string;
  /** Override data (for per-item detail pages) */
  overrideBarData?: { period: string; cost: number; revenue: number }[];
  overridePieData?: { name: string; value: number; color: string }[];
}

function CustomTooltip({ active, payload, label }: { active?: boolean; payload?: { name: string; value: number; color: string }[]; label?: string }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-card border border-border rounded-lg shadow-lg p-3 text-xs min-w-[120px]">
      {label && <p className="font-semibold text-foreground mb-1.5">{label}</p>}
      {payload.map((p) => (
        <div key={p.name} className="flex items-center justify-between gap-4">
          <span className="flex items-center gap-1.5 text-muted-foreground">
            <span className="w-2 h-2 rounded-full inline-block" style={{ background: p.color }} />
            {p.name}
          </span>
          <span className="font-semibold text-foreground">${p.value.toLocaleString()}</span>
        </div>
      ))}
    </div>
  );
}

function PieTooltip({ active, payload }: { active?: boolean; payload?: { name: string; value: number; payload: { color: string } }[] }) {
  if (!active || !payload?.length) return null;
  const p = payload[0];
  return (
    <div className="bg-card border border-border rounded-lg shadow-lg p-3 text-xs">
      <p className="font-semibold text-foreground">{p.name}</p>
      <p className="text-muted-foreground">{p.value}%</p>
    </div>
  );
}

export function ChartPanel({ section, pieTitle, barTitle, overrideBarData, overridePieData }: ChartPanelProps) {
  const [range, setRange] = useState("30d");
  const { data, isLoading } = useHistory(section, range);

  const barData = overrideBarData ?? data?.barData ?? [];
  const pieData = overridePieData ?? data?.pieData ?? [];

  return (
    <div className="space-y-5">
      {/* Time range selector */}
      {!overrideBarData && (
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground font-medium">Range:</span>
          <div className="flex gap-1">
            {RANGES.map((r) => (
              <button
                key={r.value}
                onClick={() => setRange(r.value)}
                className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
                  range === r.value
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground"
                }`}
              >
                {r.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {isLoading && !overrideBarData ? (
        <div className="flex items-center justify-center h-40">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* Bar chart */}
          <div className="bg-card border border-border rounded-xl p-5 shadow-sm">
            <p className="text-sm font-semibold text-foreground mb-4">
              {barTitle ?? "Cost vs Revenue"}
            </p>
            {barData.length === 0 ? (
              <div className="flex items-center justify-center h-40 text-muted-foreground text-sm">
                No data yet
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={180}>
                <BarChart data={barData} barGap={4} barSize={24}>
                  <XAxis
                    dataKey="period"
                    tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(v) => `$${v}`}
                    width={40}
                  />
                  <Tooltip content={<CustomTooltip />} cursor={{ fill: "var(--muted)", opacity: 0.5 }} />
                  <Bar dataKey="cost" name="Cost" fill="#ef4444" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="revenue" name="Revenue" fill="#2563eb" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Pie chart */}
          <div className="bg-card border border-border rounded-xl p-5 shadow-sm">
            <p className="text-sm font-semibold text-foreground mb-4">
              {pieTitle ?? "Distribution"}
            </p>
            {pieData.length === 0 ? (
              <div className="flex items-center justify-center h-40 text-muted-foreground text-sm">
                No data yet
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={180}>
                <PieChart>
                  <Pie
                    data={pieData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={75}
                    paddingAngle={3}
                  >
                    {pieData.map((entry, i) => (
                      <Cell key={i} fill={entry.color} stroke="transparent" />
                    ))}
                  </Pie>
                  <Tooltip content={<PieTooltip />} />
                  <Legend
                    iconType="circle"
                    iconSize={8}
                    wrapperStyle={{ fontSize: 11, color: "var(--muted-foreground)" }}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
