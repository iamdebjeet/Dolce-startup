import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { jsonError, readJson, requireAdmin } from "@/lib/api";

export async function POST(request: Request) {
  const body = await readJson(request);
  if (!body || typeof body.name !== "string" || !body.name.trim() || typeof body.email !== "string" || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.email) || typeof body.message !== "string" || !body.message.trim()) {
    return jsonError("Valid name, email, and message are required.", 400);
  }
  try {
    const inquiry = await prisma.contactInquiry.create({ data: {
      name: body.name.trim(), email: body.email.trim().toLowerCase(),
      phone: typeof body.phone === "string" ? body.phone.trim() || null : null,
      message: body.message.trim(),
    } });
    return NextResponse.json({ id: inquiry.id, message: "Thanks. Your message has been received." }, { status: 201 });
  } catch {
    return jsonError("Could not save your message. Please try again later.", 503);
  }
}

export async function GET(request: Request) {
  const denied = requireAdmin(request);
  if (denied) return denied;
  try {
    return NextResponse.json(await prisma.contactInquiry.findMany({ orderBy: { createdAt: "desc" } }));
  } catch {
    return jsonError("Could not load inquiries.", 503);
  }
}
