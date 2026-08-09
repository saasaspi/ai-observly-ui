import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json({ lastCalculated: new Date().toISOString() });
}
