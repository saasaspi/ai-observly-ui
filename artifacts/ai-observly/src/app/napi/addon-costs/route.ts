import { NextResponse } from "next/server";

// In-memory store for demo (in production this would be a DB)
let addonCosts: AddonCost[] = [
  {
    id: "ac1",
    costType: "Infra",
    amount: 120,
    currency: "USD",
    featureId: "chat",
    featureName: "Smart Chat",
    dateIncurred: "2026-07-01",
    recurrence: "monthly",
    notes: "GPU server costs for chat inference",
  },
  {
    id: "ac2",
    costType: "Resource",
    amount: 45,
    currency: "USD",
    featureId: "summarization",
    featureName: "Summarization",
    dateIncurred: "2026-07-15",
    recurrence: "one-time",
    notes: "Vector DB setup",
  },
];

export interface AddonCost {
  id: string;
  costType: string;
  amount: number;
  currency: string;
  featureId: string;
  featureName: string;
  dateIncurred: string;
  recurrence: "one-time" | "monthly" | "weekly";
  notes?: string;
}

export async function GET() {
  return NextResponse.json(addonCosts);
}

export async function POST(req: Request) {
  const body = await req.json();
  const cost: AddonCost = {
    id: `ac_${Date.now()}`,
    ...body,
  };
  addonCosts.push(cost);
  return NextResponse.json(cost);
}

export async function PUT(req: Request) {
  const body = await req.json();
  addonCosts = addonCosts.map((c) => (c.id === body.id ? { ...c, ...body } : c));
  return NextResponse.json({ success: true });
}

export async function DELETE(req: Request) {
  const { id } = await req.json();
  addonCosts = addonCosts.filter((c) => c.id !== id);
  return NextResponse.json({ success: true });
}
