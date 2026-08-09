import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json([
    { id: "cust_001", name: "Acme Corp", cost: 380, revenue: 320, margin: -60, status: "red" },
    { id: "cust_002", name: "Verity Labs", cost: 315, revenue: 410, margin: 95, status: "yellow" },
    { id: "cust_003", name: "Moonshot AI", cost: 95, revenue: 410, margin: 315, status: "green" },
    { id: "cust_004", name: "Synthetica", cost: 210, revenue: 480, margin: 270, status: "green" },
    { id: "cust_005", name: "NovaCRM", cost: 140, revenue: 180, margin: 40, status: "yellow" },
  ]);
}
