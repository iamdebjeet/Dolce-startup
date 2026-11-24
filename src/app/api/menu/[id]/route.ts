import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { jsonError, parseServingOptions, prismaCode, readJson, requireAdmin } from "@/lib/api";
import { deleteImage } from "@/lib/cloudinary";
import { getMenuItem } from "@/lib/data";
import { validateMenuItemFields } from "@/lib/validate";

type Context = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: Context) {
  try {
    const item = await getMenuItem((await params).id);
    if (!item || !item.isAvailable) return jsonError("Menu item not found.", 404);
    return NextResponse.json({ ...item, servingOptions: item.servingOptions.filter((o) => o.isAvailable) });
  } catch {
    return jsonError("Menu is temporarily unavailable.", 503);
  }
}

export async function PATCH(request: Request, { params }: Context) {
  const denied = requireAdmin(request);
  if (denied) return denied;
  const { id } = await params;
  const body = await readJson(request);
  if (!body) return jsonError("A JSON object is required.", 400);
  const invalid = validateMenuItemFields(body);
  if (invalid) return jsonError(invalid, 400);

  const data: Record<string, unknown> = {};
  for (const key of ["categoryId", "temperature", "spiceIndex", "sortOrder", "isAvailable"] as const) {
    if (key in body) data[key] = body[key];
  }
  if ("name" in body) data.name = String(body.name).trim();
  if ("description" in body) data.description = String(body.description).trim();
  if ("imageUrl" in body) data.imageUrl = body.imageUrl || null;
  if ("imagePublicId" in body) data.imagePublicId = body.imagePublicId || null;
  if ("servingOptions" in body) {
    const options = parseServingOptions(body.servingOptions);
    if (!options) return jsonError("servingOptions must contain labels and non-negative prices.", 400);
    data.servingOptions = { deleteMany: {}, create: options };
  }

  try {
    const previous = await prisma.menuItem.findUnique({ where: { id }, select: { imagePublicId: true } });
    if (!previous) return jsonError("Menu item not found.", 404);
    await prisma.menuItem.update({ where: { id }, data });
    if ("imagePublicId" in data && previous.imagePublicId && previous.imagePublicId !== data.imagePublicId) {
      await deleteImage(previous.imagePublicId);
    }
    return NextResponse.json(await getMenuItem(id));
  } catch (error) {
    if (prismaCode(error) === "P2025") return jsonError("Menu item not found.", 404);
    if (prismaCode(error) === "P2003") return jsonError("Category not found.", 404);
    if (prismaCode(error) === "P2002") return jsonError("Serving option labels must be unique per item.", 409);
    return jsonError("Could not update menu item.", 500);
  }
}

export async function DELETE(request: Request, { params }: Context) {
  const denied = requireAdmin(request);
  if (denied) return denied;
  const { id } = await params;
  try {
    const deleted = await prisma.menuItem.delete({ where: { id } });
    await deleteImage(deleted.imagePublicId);
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    if (prismaCode(error) === "P2025") return jsonError("Menu item not found.", 404);
    return jsonError("Could not delete menu item.", 500);
  }
}
