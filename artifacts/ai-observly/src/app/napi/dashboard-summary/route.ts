import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    totalCost: 1140,
    totalRevenue: 4200,
    totalProfit: 3060,
  });
}
