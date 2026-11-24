import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { jsonError, requireAdmin } from "@/lib/api";
import { INQUIRY_STATUSES, type InquiryStatus } from "@/lib/data";

/** Optional ?status=NEW|READ|RESOLVED filter. */
export async function GET(request: Request) {
  const denied = requireAdmin(request);
  if (denied) return denied;
  const status = new URL(request.url).searchParams.get("status");
  if (status && !INQUIRY_STATUSES.includes(status as InquiryStatus)) return jsonError("Invalid status filter.", 400);
  try {
    return NextResponse.json(await prisma.contactInquiry.findMany({
      where: status ? { status } : undefined,
      orderBy: { createdAt: "desc" },
    }));
  } catch {
    return jsonError("Could not load inquiries.", 503);
  }
}
