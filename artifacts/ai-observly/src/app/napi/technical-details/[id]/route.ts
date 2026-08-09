import { NextResponse } from "next/server";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const mockData: Record<string, { tokens: number; models: string[]; requestCount: number }> = {
    cust_001: { tokens: 1_840_000, models: ["gpt-4o", "gpt-4o-mini"], requestCount: 3420 },
    cust_002: { tokens: 1_250_000, models: ["gpt-4o-mini"], requestCount: 2810 },
    cust_003: { tokens: 380_000, models: ["claude-3-5-haiku-20241022"], requestCount: 910 },
    cust_004: { tokens: 820_000, models: ["gpt-4o-mini", "claude-3-5-haiku-20241022"], requestCount: 1980 },
    cust_005: { tokens: 560_000, models: ["gpt-4o"], requestCount: 1240 },
  };

  const data = mockData[id] ?? { tokens: 100_000, models: ["gpt-4o-mini"], requestCount: 200 };
  return NextResponse.json(data);
}
