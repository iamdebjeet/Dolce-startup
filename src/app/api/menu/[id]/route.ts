import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { jsonError, readJson, requireAdmin } from "@/lib/api";

type Context = { params: Promise<{ id: string }> };

function validOptions(value: unknown) {
  return Array.isArray(value) && value.every((option) => typeof option === "object" && option !== null &&
    typeof (option as Record<string, unknown>).label === "string" && (option as Record<string, unknown>).label !== "" &&
    Number.isFinite(Number((option as Record<string, unknown>).price)) && Number((option as Record<string, unknown>).price) >= 0);
}

export async function PATCH(request: Request, { params }: Context) {
  const denied = requireAdmin(request);
  if (denied) return denied;
  const { id } = await params;
  const body = await readJson(request);
  if (!body) return jsonError("A JSON object is required.", 400);
  if ("name" in body && (typeof body.name !== "string" || !body.name.trim())) return jsonError("Name cannot be empty.", 400);
  if ("description" in body && (typeof body.description !== "string" || !body.description.trim())) return jsonError("Description cannot be empty.", 400);
  if ("temperature" in body && !["HOT", "NORMAL", "CHILLED"].includes(String(body.temperature))) return jsonError("temperature must be HOT, NORMAL, or CHILLED.", 400);
  if ("spiceIndex" in body && (!Number.isInteger(body.spiceIndex) || Number(body.spiceIndex) < 0 || Number(body.spiceIndex) > 3)) return jsonError("spiceIndex must be an integer from 0 to 3.", 400);
  if ("sortOrder" in body && !Number.isInteger(body.sortOrder)) return jsonError("sortOrder must be an integer.", 400);
  if ("isAvailable" in body && typeof body.isAvailable !== "boolean") return jsonError("isAvailable must be a boolean.", 400);
  if ("servingOptions" in body && !validOptions(body.servingOptions)) return jsonError("servingOptions must contain labels and non-negative prices.", 400);
  const data: Record<string, unknown> = {};
  for (const key of ["name", "description", "categoryId", "temperature", "spiceIndex", "imageUrl", "imagePublicId", "sortOrder", "isAvailable"] as const) {
    if (key in body) data[key] = body[key];
  }
  if (typeof data.name === "string") data.name = data.name.trim();
  if (typeof data.description === "string") data.description = data.description.trim();
  if ("servingOptions" in body) data.servingOptions = { deleteMany: {}, create: (body.servingOptions as Array<{label:string;price:number}>).map((o) => ({ label: o.label.trim(), price: o.price })) };
  try {
    return NextResponse.json(await prisma.menuItem.update({ where: { id }, data, include: { category: true, servingOptions: true } }));
  } catch (error) {
    if ((error as { code?: string }).code === "P2025") return jsonError("Menu item or category not found.", 404);
    if ((error as { code?: string }).code === "P2002") return jsonError("Serving option labels must be unique per item.", 409);
    return jsonError("Could not update menu item.", 500);
  }
}

export async function DELETE(request: Request, { params }: Context) {
  const denied = requireAdmin(request);
  if (denied) return denied;
  const { id } = await params;
  try {
    await prisma.menuItem.delete({ where: { id } });
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    if ((error as { code?: string }).code === "P2025") return jsonError("Menu item not found.", 404);
    return jsonError("Could not delete menu item.", 500);
  }
}
