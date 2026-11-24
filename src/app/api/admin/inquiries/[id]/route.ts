import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { jsonError, prismaCode, readJson, requireAdmin } from "@/lib/api";
import { INQUIRY_STATUSES, type InquiryStatus } from "@/lib/data";

type Context = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, { params }: Context) {
  const denied = requireAdmin(request);
  if (denied) return denied;
  const body = await readJson(request);
  if (!body || !INQUIRY_STATUSES.includes(body.status as InquiryStatus)) return jsonError(`status must be one of ${INQUIRY_STATUSES.join(", ")}.`, 400);
  try {
    return NextResponse.json(await prisma.contactInquiry.update({ where: { id: (await params).id }, data: { status: body.status as InquiryStatus } }));
  } catch (error) {
    if (prismaCode(error) === "P2025") return jsonError("Inquiry not found.", 404);
    return jsonError("Could not update inquiry.", 500);
  }
}

export async function DELETE(request: Request, { params }: Context) {
  const denied = requireAdmin(request);
  if (denied) return denied;
  try {
    await prisma.contactInquiry.delete({ where: { id: (await params).id } });
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    if (prismaCode(error) === "P2025") return jsonError("Inquiry not found.", 404);
    return jsonError("Could not delete inquiry.", 500);
  }
}
