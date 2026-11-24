import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { jsonError, readJson, requireAdmin, slugify } from "@/lib/api";

type Context = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, { params }: Context) {
  const denied = requireAdmin(request);
  if (denied) return denied;
  const { id } = await params;
  const body = await readJson(request);
  if (!body) return jsonError("A JSON object is required.", 400);
  const data: Record<string, unknown> = {};
  if ("name" in body) {
    if (typeof body.name !== "string" || !body.name.trim()) return jsonError("Name cannot be empty.", 400);
    data.name = body.name.trim();
  }
  if ("slug" in body) {
    if (typeof body.slug !== "string" || !slugify(body.slug)) return jsonError("A valid slug is required.", 400);
    data.slug = slugify(body.slug);
  }
  if ("description" in body) data.description = typeof body.description === "string" ? body.description.trim() || null : null;
  if ("sortOrder" in body) {
    if (!Number.isInteger(body.sortOrder)) return jsonError("sortOrder must be an integer.", 400);
    data.sortOrder = body.sortOrder;
  }
  if ("isActive" in body) {
    if (typeof body.isActive !== "boolean") return jsonError("isActive must be a boolean.", 400);
    data.isActive = body.isActive;
  }
  try {
    return NextResponse.json(await prisma.category.update({ where: { id }, data }));
  } catch (error) {
    if ((error as { code?: string }).code === "P2025") return jsonError("Category not found.", 404);
    if ((error as { code?: string }).code === "P2002") return jsonError("Category name or slug already exists.", 409);
    return jsonError("Could not update category.", 500);
  }
}

export async function DELETE(request: Request, { params }: Context) {
  const denied = requireAdmin(request);
  if (denied) return denied;
  const { id } = await params;
  try {
    await prisma.category.delete({ where: { id } });
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    if ((error as { code?: string }).code === "P2025") return jsonError("Category not found.", 404);
    if ((error as { code?: string }).code === "P2003") return jsonError("Category still has menu items. Move or delete them first.", 409);
    return jsonError("Could not delete category.", 500);
  }
}
