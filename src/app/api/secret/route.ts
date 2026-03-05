import { NextRequest, NextResponse } from "next/server";

const COOKIE_NAME = "secret_access";
const COOKIE_VALUE = "granted";

export async function GET(req: NextRequest) {
  const hasAccess = req.cookies.get(COOKIE_NAME)?.value === COOKIE_VALUE;
  return NextResponse.json({ success: true, hasAccess });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const passcode = String(body?.passcode ?? "");
    const expected = process.env.SECRET_ROOM_PASSCODE;

    if (!expected) {
      return NextResponse.json({ success: false, message: "Secret passcode is not configured." }, { status: 500 });
    }

    if (passcode !== expected) {
      return NextResponse.json({ success: false, message: "Incorrect passcode." }, { status: 401 });
    }

    const response = NextResponse.json({ success: true, message: "Access granted." });
    response.cookies.set({
      name: COOKIE_NAME,
      value: COOKIE_VALUE,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 8,
    });

    return response;
  } catch {
    return NextResponse.json({ success: false, message: "Unable to unlock secret room." }, { status: 500 });
  }
}

export async function DELETE() {
  const response = NextResponse.json({ success: true, message: "Logged out from secret room." });
  response.cookies.set({
    name: COOKIE_NAME,
    value: "",
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
  return response;
}
