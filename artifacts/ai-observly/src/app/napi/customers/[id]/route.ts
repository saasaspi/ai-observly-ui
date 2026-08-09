import { NextResponse } from "next/server";

const customerDetails: Record<string, object> = {
  cust_001: {
    id: "cust_001",
    name: "Acme Corp",
    cost: 380,
    revenue: 320,
    margin: -60,
    status: "red",
    tokens: 1840000,
    requestCount: 3420,
    models: ["gpt-4o", "gpt-4o-mini"],
    barData: [
      { period: "Week 1", cost: 88, revenue: 72 },
      { period: "Week 2", cost: 98, revenue: 80 },
      { period: "Week 3", cost: 102, revenue: 85 },
      { period: "Week 4", cost: 92, revenue: 83 },
    ],
    pieData: [
      { name: "Smart Chat", value: 50, color: "#2563eb" },
      { name: "Doc Summary", value: 30, color: "#7c3aed" },
      { name: "Email Draft", value: 20, color: "#0891b2" },
    ],
  },
  cust_002: {
    id: "cust_002",
    name: "Verity Labs",
    cost: 315,
    revenue: 410,
    margin: 95,
    status: "yellow",
    tokens: 1250000,
    requestCount: 2810,
    models: ["gpt-4o-mini"],
    barData: [
      { period: "Week 1", cost: 72, revenue: 95 },
      { period: "Week 2", cost: 82, revenue: 105 },
      { period: "Week 3", cost: 85, revenue: 108 },
      { period: "Week 4", cost: 76, revenue: 102 },
    ],
    pieData: [
      { name: "Doc Summary", value: 55, color: "#2563eb" },
      { name: "Analytics", value: 45, color: "#7c3aed" },
    ],
  },
  cust_003: {
    id: "cust_003",
    name: "Moonshot AI",
    cost: 95,
    revenue: 410,
    margin: 315,
    status: "green",
    tokens: 380000,
    requestCount: 910,
    models: ["claude-3-5-haiku-20241022"],
    barData: [
      { period: "Week 1", cost: 22, revenue: 95 },
      { period: "Week 2", cost: 25, revenue: 105 },
      { period: "Week 3", cost: 26, revenue: 108 },
      { period: "Week 4", cost: 22, revenue: 102 },
    ],
    pieData: [
      { name: "Analytics Copilot", value: 70, color: "#2563eb" },
      { name: "Email Drafter", value: 30, color: "#7c3aed" },
    ],
  },
  cust_004: {
    id: "cust_004",
    name: "Synthetica",
    cost: 210,
    revenue: 480,
    margin: 270,
    status: "green",
    tokens: 820000,
    requestCount: 1980,
    models: ["gpt-4o-mini", "claude-3-5-haiku-20241022"],
    barData: [
      { period: "Week 1", cost: 50, revenue: 112 },
      { period: "Week 2", cost: 54, revenue: 122 },
      { period: "Week 3", cost: 56, revenue: 126 },
      { period: "Week 4", cost: 50, revenue: 120 },
    ],
    pieData: [
      { name: "Smart Chat", value: 45, color: "#2563eb" },
      { name: "Doc Summary", value: 35, color: "#7c3aed" },
      { name: "Other", value: 20, color: "#059669" },
    ],
  },
  cust_005: {
    id: "cust_005",
    name: "NovaCRM",
    cost: 140,
    revenue: 180,
    margin: 40,
    status: "yellow",
    tokens: 560000,
    requestCount: 1240,
    models: ["gpt-4o"],
    barData: [
      { period: "Week 1", cost: 33, revenue: 43 },
      { period: "Week 2", cost: 37, revenue: 46 },
      { period: "Week 3", cost: 36, revenue: 47 },
      { period: "Week 4", cost: 34, revenue: 44 },
    ],
    pieData: [
      { name: "Email Drafter", value: 60, color: "#2563eb" },
      { name: "Smart Chat", value: 40, color: "#7c3aed" },
    ],
  },
};

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const customer = customerDetails[id];
  if (!customer) {
    return NextResponse.json({ error: "Customer not found" }, { status: 404 });
  }
  return NextResponse.json(customer);
}
