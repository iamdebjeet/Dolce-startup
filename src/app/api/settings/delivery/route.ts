import { NextResponse } from "next/server";
import { getDeliverySettingsSafe } from "@/lib/settings";

/** Public: current delivery & pickup settings. */
export async function GET() {
  return NextResponse.json(await getDeliverySettingsSafe());
}
