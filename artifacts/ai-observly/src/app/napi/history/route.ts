import { NextResponse } from "next/server";

function generateWeeklyData(weeks: number, baseRevenue: number, baseCost: number) {
  const data = [];
  const now = new Date();
  for (let i = weeks - 1; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i * 7);
    const label = d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    const jitter = () => 0.85 + Math.random() * 0.3;
    const cost = Math.round(baseCost * jitter());
    const revenue = Math.round(baseRevenue * jitter());
    data.push({ period: label, cost, revenue, profit: revenue - cost });
  }
  return data;
}

function generatePieSlices(section: string) {
  if (section === "overview") {
    return [
      { name: "Smart Chat", value: 38, color: "#2563eb" },
      { name: "Summarization", value: 24, color: "#7c3aed" },
      { name: "Code Assist", value: 22, color: "#0891b2" },
      { name: "Translation", value: 16, color: "#059669" },
    ];
  }
  if (section === "customers") {
    return [
      { name: "Acme Corp", value: 31, color: "#2563eb" },
      { name: "TechFlow", value: 26, color: "#7c3aed" },
      { name: "StartupXYZ", value: 21, color: "#0891b2" },
      { name: "DevHub", value: 13, color: "#059669" },
      { name: "Others", value: 9, color: "#d97706" },
    ];
  }
  if (section === "features") {
    return [
      { name: "High ROI (>100%)", value: 45, color: "#059669" },
      { name: "Medium ROI (20-100%)", value: 35, color: "#2563eb" },
      { name: "Low ROI (<20%)", value: 20, color: "#d97706" },
    ];
  }
  return [];
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const section = searchParams.get("section") ?? "overview";
  const range = searchParams.get("range") ?? "30d";

  const weeksMap: Record<string, number> = { "7d": 1, "30d": 4, "90d": 12 };
  const weeks = weeksMap[range] ?? 4;

  const barData = generateWeeklyData(weeks, 4200, 1140);
  const pieData = generatePieSlices(section);

  return NextResponse.json({ barData, pieData });
}
