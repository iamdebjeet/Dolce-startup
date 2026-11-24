import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { jsonError, requireAdmin } from "@/lib/api";

export async function GET(request: Request) {
  const denied = requireAdmin(request);
  if (denied) return denied;
  try {
    return NextResponse.json(await prisma.review.findMany({ orderBy: { createdAt: "desc" } }));
  } catch {
    return jsonError("Could not load reviews.", 503);
  }
}
