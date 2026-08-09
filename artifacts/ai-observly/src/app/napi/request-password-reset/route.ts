import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const { email } = await request.json();
  console.log("Password reset requested for:", email);
  return NextResponse.json({ success: true });
}
