import { NextResponse } from "next/server";
import { SESSION_COOKIE, readCookie, safeEqual, verifySessionToken } from "@/lib/auth";

export function jsonError(message: string, status: number, headers?: HeadersInit) {
  return NextResponse.json({ error: message }, { status, headers });
}

export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function prismaCode(error: unknown) {
  return (error as { code?: string } | null)?.code;
}

/**
 * Allows a request if it carries either a valid admin session cookie (browser admin portal)
 * or `Authorization: Bearer <ADMIN_API_TOKEN>` (scripts / integrations).
 * Returns an error response when denied, or null when allowed.
 */
export function requireAdmin(request: Request) {
  const bearer = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
  if (bearer) {
    const configured = process.env.ADMIN_API_TOKEN;
    if (!configured) return jsonError("Admin API token is not configured.", 503);
    return safeEqual(configured, bearer) ? null : jsonError("Unauthorized.", 401);
  }

  if (!verifySessionToken(readCookie(request, SESSION_COOKIE))) return jsonError("Unauthorized.", 401);

  if (!["GET", "HEAD", "OPTIONS"].includes(request.method) && !isSameOriginRequest(request)) {
    return jsonError("Cross-origin request rejected.", 403);
  }
  return null;
}

/**
 * CSRF defence for cookie-authenticated writes (on top of the SameSite=Strict cookie).
 * Prefers the browser-set Sec-Fetch-Site header, which works behind proxies (Codespaces, Vercel)
 * where the Host the server sees differs from the URL in the browser. Falls back to Origin vs Host.
 */
function isSameOriginRequest(request: Request) {
  const fetchSite = request.headers.get("sec-fetch-site");
  if (fetchSite) return fetchSite === "same-origin" || fetchSite === "none";

  const origin = request.headers.get("origin");
  if (!origin) return true; // Non-browser client without Origin; the cookie can't have been sent cross-site.
  let originHost: string;
  try {
    originHost = new URL(origin).host;
  } catch {
    return false;
  }
  const hosts = [request.headers.get("x-forwarded-host"), request.headers.get("host")]
    .flatMap((h) => (h ? h.split(",").map((s) => s.trim()) : []));
  return hosts.includes(originHost);
}

export function slugify(value: string) {
  return value.toLowerCase().trim().normalize("NFKD").replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

export async function readJson(request: Request): Promise<Record<string, unknown> | null> {
  try {
    const value: unknown = await request.json();
    return isRecord(value) ? value : null;
  } catch {
    return null;
  }
}

export type ServingOptionInput = { label: string; price: number; isAvailable: boolean };

export function parseServingOptions(value: unknown): ServingOptionInput[] | null {
  if (!Array.isArray(value)) return null;
  const options: ServingOptionInput[] = [];
  for (const option of value) {
    if (!isRecord(option) || typeof option.label !== "string" || !option.label.trim()) return null;
    const price = Number(option.price);
    if (option.price === "" || option.price === null || !Number.isFinite(price) || price < 0) return null;
    if ("isAvailable" in option && typeof option.isAvailable !== "boolean") return null;
    options.push({ label: option.label.trim(), price: Math.round(price * 100) / 100, isAvailable: option.isAvailable !== false });
  }
  return options;
}

export function clientIp(request: Request) {
  return request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || request.headers.get("x-real-ip") || "unknown";
}

const buckets = new Map<string, { count: number; resetAt: number }>();

/**
 * Simple fixed-window, in-memory rate limiter. It is per server instance, so on serverless
 * hosting it only slows abuse down; swap for a shared store (e.g. Redis) if that matters.
 */
export function rateLimit(request: Request, key: string, limit: number, windowMs: number) {
  const now = Date.now();
  const id = `${key}:${clientIp(request)}`;
  const bucket = buckets.get(id);
  if (!bucket || bucket.resetAt <= now) {
    if (buckets.size > 10_000) for (const [k, v] of buckets) if (v.resetAt <= now) buckets.delete(k);
    buckets.set(id, { count: 1, resetAt: now + windowMs });
    return null;
  }
  bucket.count += 1;
  if (bucket.count <= limit) return null;
  const retryAfter = Math.ceil((bucket.resetAt - now) / 1000);
  return jsonError("Too many requests. Please try again shortly.", 429, { "Retry-After": String(retryAfter) });
}
