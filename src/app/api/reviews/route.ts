import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { jsonError, readJson } from "@/lib/api";

export async function GET() {
  try {
    const reviews = await prisma.review.findMany({ where: { isApproved: true }, orderBy: { createdAt: "desc" }, select: { id: true, name: true, rating: true, text: true, createdAt: true } });
    return NextResponse.json(reviews);
  } catch {
    return jsonError("Reviews are temporarily unavailable.", 503);
  }
}

export async function POST(request: Request) {
  const body = await readJson(request);
  if (!body || typeof body.name !== "string" || !body.name.trim() || typeof body.text !== "string" || !body.text.trim() || !Number.isInteger(body.rating) || Number(body.rating) < 1 || Number(body.rating) > 5) {
    return jsonError("A name, review text, and rating from 1 to 5 are required.", 400);
  }
  try {
    const review = await prisma.review.create({ data: { name: body.name.trim(), text: body.text.trim(), rating: Number(body.rating) } });
    return NextResponse.json({ id: review.id, message: "Thanks. Your review was submitted for approval." }, { status: 201 });
  } catch {
    return jsonError("Could not submit your review. Please try again later.", 503);
  }
}
