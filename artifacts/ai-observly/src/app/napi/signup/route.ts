import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const { email, password } = await request.json();

  if (!email || !password) {
    return NextResponse.json({ success: false, error: "Email and password are required" }, { status: 400 });
  }

  return NextResponse.json({ success: true, userId: `user_${email.split("@")[0]}` });
}
