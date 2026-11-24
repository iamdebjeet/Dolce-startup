import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { jsonError, rateLimit, readJson, requireAdmin } from "@/lib/api";

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request: Request) {
  const limited = rateLimit(request, "contact", 5, 10 * 60 * 1000);
  if (limited) return limited;
  const body = await readJson(request);
  if (!body || typeof body.name !== "string" || !body.name.trim() || typeof body.email !== "string" || !EMAIL.test(body.email.trim()) || typeof body.message !== "string" || !body.message.trim()) {
    return jsonError("Valid name, email, and message are required.", 400);
  }
  if (body.name.length > 100 || body.email.length > 200 || body.message.length > 5000 || (typeof body.phone === "string" && body.phone.length > 30)) {
    return jsonError("One or more fields are too long.", 400);
  }
  try {
    const inquiry = await prisma.contactInquiry.create({ data: {
      name: body.name.trim(),
      email: body.email.trim().toLowerCase(),
      phone: typeof body.phone === "string" ? body.phone.trim() || null : null,
      message: body.message.trim(),
    } });
    return NextResponse.json({ id: inquiry.id, message: "Thanks. Your message has been received." }, { status: 201 });
  } catch {
    return jsonError("Could not save your message. Please try again later.", 503);
  }
}

/** Kept for backwards compatibility; prefer GET /api/admin/inquiries. */
export async function GET(request: Request) {
  const denied = requireAdmin(request);
  if (denied) return denied;
  try {
    return NextResponse.json(await prisma.contactInquiry.findMany({ orderBy: { createdAt: "desc" } }));
  } catch {
    return jsonError("Could not load inquiries.", 503);
  }
}
