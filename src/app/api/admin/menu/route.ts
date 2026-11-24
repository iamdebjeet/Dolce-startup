import { NextResponse } from "next/server";
import { jsonError, requireAdmin } from "@/lib/api";
import { getAllMenuItems } from "@/lib/data";

/** All menu items, including unavailable ones and unavailable serving options. */
export async function GET(request: Request) {
  const denied = requireAdmin(request);
  if (denied) return denied;
  try {
    return NextResponse.json(await getAllMenuItems());
  } catch {
    return jsonError("Could not load menu items.", 503);
  }
}
