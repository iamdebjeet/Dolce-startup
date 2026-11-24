import { NextResponse } from "next/server";
import { SESSION_COOKIE, SESSION_TTL_SECONDS, checkAdminCredentials, createSessionToken } from "@/lib/auth";
import { jsonError, rateLimit, readJson } from "@/lib/api";

export async function POST(request: Request) {
  const limited = rateLimit(request, "login", 5, 15 * 60 * 1000);
  if (limited) return limited;
  const body = await readJson(request);
  if (!body || typeof body.email !== "string" || typeof body.password !== "string" || !body.email || !body.password) {
    return jsonError("Email and password are required.", 400);
  }
  const result = checkAdminCredentials(body.email, body.password);
  if (result === "unconfigured") return jsonError("Admin login is not configured. Set ADMIN_EMAIL and ADMIN_PASSWORD_HASH.", 503);
  if (result === "invalid") return jsonError("Incorrect email or password.", 401);
  const token = createSessionToken();
  if (!token) return jsonError("Admin login is not configured. Set ADMIN_SESSION_SECRET (32+ characters).", 503);

  const response = NextResponse.json({ authenticated: true });
  response.cookies.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: SESSION_TTL_SECONDS,
  });
  return response;
}
