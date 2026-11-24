import { NextResponse } from "next/server";
import { SESSION_COOKIE, readCookie, verifySessionToken } from "@/lib/auth";

export async function GET(request: Request) {
  return NextResponse.json({ authenticated: verifySessionToken(readCookie(request, SESSION_COOKIE)) });
}
