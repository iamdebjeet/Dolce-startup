import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { jsonError, readJson, requireAdmin, slugify } from "@/lib/api";

export async function GET() {
  try {
    const categories = await prisma.category.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: "asc" },
    });
    return NextResponse.json(categories);
  } catch {
    return NextResponse.json(
      { error: "Categories are temporarily unavailable. Check database configuration." },
      { status: 503 },
    );
  }
}

export async function POST(request: Request) {
  const denied = requireAdmin(request);
  if (denied) return denied;
  const body = await readJson(request);
  if (!body || typeof body.name !== "string" || !body.name.trim()) return jsonError("A category name is required.", 400);
  const slug = typeof body.slug === "string" && body.slug.trim() ? slugify(body.slug) : slugify(body.name);
  if (!slug) return jsonError("A valid category slug is required.", 400);
  try {
    const category = await prisma.category.create({ data: {
      name: body.name.trim(), slug,
      description: typeof body.description === "string" ? body.description.trim() || null : null,
      sortOrder: Number.isInteger(body.sortOrder) ? Number(body.sortOrder) : 0,
      isActive: typeof body.isActive === "boolean" ? body.isActive : true,
    } });
    return NextResponse.json(category, { status: 201 });
  } catch (error) {
    if ((error as { code?: string }).code === "P2002") return jsonError("Category name or slug already exists.", 409);
    return jsonError("Could not create category.", 500);
  }
}
