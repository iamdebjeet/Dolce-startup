import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { jsonError, readJson, requireAdmin } from "@/lib/api";

type Context = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, { params }: Context) {
  const denied = requireAdmin(request);
  if (denied) return denied;
  const body = await readJson(request);
  if (!body || typeof body.isApproved !== "boolean") return jsonError("isApproved must be a boolean.", 400);
  try {
    return NextResponse.json(await prisma.review.update({ where: { id: (await params).id }, data: { isApproved: body.isApproved } }));
  } catch (error) {
    if ((error as { code?: string }).code === "P2025") return jsonError("Review not found.", 404);
    return jsonError("Could not update review.", 500);
  }
}

export async function DELETE(request: Request, { params }: Context) {
  const denied = requireAdmin(request);
  if (denied) return denied;
  try {
    await prisma.review.delete({ where: { id: (await params).id } });
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    if ((error as { code?: string }).code === "P2025") return jsonError("Review not found.", 404);
    return jsonError("Could not delete review.", 500);
  }
}
