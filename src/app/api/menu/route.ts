import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { jsonError, readJson, requireAdmin } from "@/lib/api";

export async function GET() {
  try {
    const items = await prisma.menuItem.findMany({
      where: { isAvailable: true, category: { isActive: true } },
      include: {
        category: true,
        servingOptions: { where: { isAvailable: true }, orderBy: { price: "asc" } },
      },
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    });

    return NextResponse.json(items);
  } catch {
    return NextResponse.json(
      { error: "Menu is temporarily unavailable. Check database configuration." },
      { status: 503 },
    );
  }
}

function validOptions(value: unknown) {
  return Array.isArray(value) && value.every((option) =>
    typeof option === "object" && option !== null &&
    typeof (option as Record<string, unknown>).label === "string" &&
    (option as Record<string, unknown>).label !== "" &&
    Number.isFinite(Number((option as Record<string, unknown>).price)) &&
    Number((option as Record<string, unknown>).price) >= 0,
  );
}

export async function POST(request: Request) {
  const denied = requireAdmin(request);
  if (denied) return denied;
  const body = await readJson(request);
  if (!body || typeof body.name !== "string" || !body.name.trim() || typeof body.description !== "string" || !body.description.trim() || typeof body.categoryId !== "string") {
    return jsonError("name, description, and categoryId are required.", 400);
  }
  if (body.temperature !== undefined && !["HOT", "NORMAL", "CHILLED"].includes(String(body.temperature))) return jsonError("temperature must be HOT, NORMAL, or CHILLED.", 400);
  if (body.spiceIndex !== undefined && (!Number.isInteger(body.spiceIndex) || Number(body.spiceIndex) < 0 || Number(body.spiceIndex) > 3)) return jsonError("spiceIndex must be an integer from 0 to 3.", 400);
  if (body.servingOptions !== undefined && !validOptions(body.servingOptions)) return jsonError("servingOptions must contain labels and non-negative prices.", 400);
  try {
    const item = await prisma.menuItem.create({ data: {
      name: body.name.trim(), description: body.description.trim(), categoryId: body.categoryId,
      temperature: body.temperature as "HOT" | "NORMAL" | "CHILLED" | undefined,
      spiceIndex: body.spiceIndex === undefined ? 0 : Number(body.spiceIndex),
      imageUrl: typeof body.imageUrl === "string" ? body.imageUrl : null,
      imagePublicId: typeof body.imagePublicId === "string" ? body.imagePublicId : null,
      sortOrder: Number.isInteger(body.sortOrder) ? Number(body.sortOrder) : 0,
      isAvailable: typeof body.isAvailable === "boolean" ? body.isAvailable : true,
      servingOptions: { create: (body.servingOptions as Array<{label:string;price:number}> | undefined)?.map((o) => ({ label: o.label.trim(), price: o.price })) ?? [] },
    }, include: { category: true, servingOptions: true } });
    return NextResponse.json(item, { status: 201 });
  } catch (error) {
    if ((error as { code?: string }).code === "P2003") return jsonError("Category not found.", 404);
    return jsonError("Could not create menu item.", 500);
  }
}
