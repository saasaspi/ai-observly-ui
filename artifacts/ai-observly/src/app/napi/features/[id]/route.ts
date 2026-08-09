import { NextResponse } from "next/server";

const featureDetails: Record<string, object> = {
  chat: {
    id: "chat",
    name: "Smart chatbot",
    cost: 520,
    revenueEstimate: 1800,
    roi: 246,
    margin: 1280,
    tokenCount: 2340000,
    requestCount: 4821,
    models: ["gpt-4o", "gpt-4o-mini"],
    barData: [
      { period: "Week 1", cost: 118, revenue: 408 },
      { period: "Week 2", cost: 132, revenue: 458 },
      { period: "Week 3", cost: 142, revenue: 478 },
      { period: "Week 4", cost: 128, revenue: 456 },
    ],
    pieData: [
      { name: "Input tokens", value: 62, color: "#2563eb" },
      { name: "Output tokens", value: 28, color: "#7c3aed" },
      { name: "Infra add-on", value: 10, color: "#0891b2" },
    ],
  },
  summarization: {
    id: "summarization",
    name: "Doc summarizer",
    cost: 310,
    revenueEstimate: 1200,
    roi: 287,
    margin: 890,
    tokenCount: 980000,
    requestCount: 2103,
    models: ["gpt-4o-mini", "claude-3-haiku"],
    barData: [
      { period: "Week 1", cost: 72, revenue: 278 },
      { period: "Week 2", cost: 80, revenue: 308 },
      { period: "Week 3", cost: 84, revenue: 318 },
      { period: "Week 4", cost: 74, revenue: 296 },
    ],
    pieData: [
      { name: "Input tokens", value: 55, color: "#2563eb" },
      { name: "Output tokens", value: 35, color: "#7c3aed" },
      { name: "Resource add-on", value: 10, color: "#059669" },
    ],
  },
  email_draft: {
    id: "email_draft",
    name: "Email drafter",
    cost: 195,
    revenueEstimate: 800,
    roi: 310,
    margin: 605,
    tokenCount: 820000,
    requestCount: 3412,
    models: ["gpt-4o-mini"],
    barData: [
      { period: "Week 1", cost: 45, revenue: 185 },
      { period: "Week 2", cost: 52, revenue: 205 },
      { period: "Week 3", cost: 52, revenue: 208 },
      { period: "Week 4", cost: 46, revenue: 202 },
    ],
    pieData: [
      { name: "Input tokens", value: 45, color: "#2563eb" },
      { name: "Output tokens", value: 55, color: "#7c3aed" },
    ],
  },
  analytics: {
    id: "analytics",
    name: "Analytics copilot",
    cost: 115,
    revenueEstimate: 400,
    roi: 248,
    margin: 285,
    tokenCount: 620000,
    requestCount: 1890,
    models: ["gpt-4o"],
    barData: [
      { period: "Week 1", cost: 26, revenue: 92 },
      { period: "Week 2", cost: 30, revenue: 102 },
      { period: "Week 3", cost: 32, revenue: 108 },
      { period: "Week 4", cost: 27, revenue: 98 },
    ],
    pieData: [
      { name: "Input tokens", value: 70, color: "#2563eb" },
      { name: "Output tokens", value: 30, color: "#7c3aed" },
    ],
  },
};

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const feature = featureDetails[id];
  if (!feature) {
    return NextResponse.json({ error: "Feature not found" }, { status: 404 });
  }
  return NextResponse.json(feature);
}
