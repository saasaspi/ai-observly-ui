import { NextResponse } from "next/server";

function generateApiKey(): string {
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
  let key = "";
  for (let i = 0; i < 24; i++) {
    key += chars[Math.floor(Math.random() * chars.length)];
  }
  return `obs_live_${key}`;
}

export async function POST() {
  return NextResponse.json({ keyDisplay: generateApiKey() });
}
