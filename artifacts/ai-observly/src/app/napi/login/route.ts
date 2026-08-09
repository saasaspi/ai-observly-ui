import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const { email, password } = await request.json();

  if (!email || !password) {
    return NextResponse.json({ success: false, error: "Invalid credentials" }, { status: 401 });
  }

  return NextResponse.json({ success: true, userId: `user_${email.split("@")[0]}` });
}
