import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { jsonError, parseServingOptions, prismaCode, readJson, requireAdmin } from "@/lib/api";
import { getMenuItem, getPublicMenuItems } from "@/lib/data";
import { validateMenuItemFields } from "@/lib/validate";

export async function GET() {
  try {
    return NextResponse.json(await getPublicMenuItems());
  } catch {
    return jsonError("Menu is temporarily unavailable. Check database configuration.", 503);
  }
}

export async function POST(request: Request) {
  const denied = requireAdmin(request);
  if (denied) return denied;
  const body = await readJson(request);
  if (!body || typeof body.name !== "string" || !body.name.trim() || typeof body.description !== "string" || !body.description.trim() || typeof body.categoryId !== "string") {
    return jsonError("name, description, and categoryId are required.", 400);
  }
  const invalid = validateMenuItemFields(body);
  if (invalid) return jsonError(invalid, 400);
  const servingOptions = body.servingOptions === undefined ? [] : parseServingOptions(body.servingOptions);
  if (!servingOptions) return jsonError("servingOptions must contain labels and non-negative prices.", 400);

  try {
    const item = await prisma.menuItem.create({ data: {
      name: body.name.trim(),
      description: body.description.trim(),
      categoryId: body.categoryId,
      temperature: body.temperature as "HOT" | "NORMAL" | "CHILLED" | undefined,
      spiceIndex: body.spiceIndex === undefined ? 0 : Number(body.spiceIndex),
      imageUrl: typeof body.imageUrl === "string" && body.imageUrl ? body.imageUrl : null,
      imagePublicId: typeof body.imagePublicId === "string" && body.imagePublicId ? body.imagePublicId : null,
      sortOrder: body.sortOrder === undefined ? 0 : Number(body.sortOrder),
      isAvailable: body.isAvailable === undefined ? true : Boolean(body.isAvailable),
      servingOptions: { create: servingOptions },
    } });
    return NextResponse.json(await getMenuItem(item.id), { status: 201 });
  } catch (error) {
    if (prismaCode(error) === "P2003") return jsonError("Category not found.", 404);
    if (prismaCode(error) === "P2002") return jsonError("Serving option labels must be unique per item.", 409);
    return jsonError("Could not create menu item.", 500);
  }
}
