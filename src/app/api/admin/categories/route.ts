import { NextResponse } from "next/server";
import { jsonError, requireAdmin } from "@/lib/api";
import { getAllCategories } from "@/lib/data";

/** All categories, including inactive ones, with item counts. */
export async function GET(request: Request) {
  const denied = requireAdmin(request);
  if (denied) return denied;
  try {
    return NextResponse.json(await getAllCategories());
  } catch {
    return jsonError("Could not load categories.", 503);
  }
}
