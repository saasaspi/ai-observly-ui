import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json([
    { id: "chat", name: "Smart chatbot", cost: 520, revenueEstimate: 1800, roi: 246 },
    { id: "summarization", name: "Doc summarizer", cost: 310, revenueEstimate: 1200, roi: 287 },
    { id: "email_draft", name: "Email drafter", cost: 195, revenueEstimate: 800, roi: 310 },
    { id: "analytics", name: "Analytics copilot", cost: 115, revenueEstimate: 400, roi: 248 },
  ]);
}
