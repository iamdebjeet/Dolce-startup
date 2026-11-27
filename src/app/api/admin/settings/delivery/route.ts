import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { jsonError, readJson, requireAdmin } from "@/lib/api";
import { CHARGE_MODES, type ChargeMode } from "@/lib/delivery";
import { getDeliverySettings } from "@/lib/settings";

export async function GET(request: Request) {
  const denied = requireAdmin(request);
  if (denied) return denied;
  try {
    return NextResponse.json(await getDeliverySettings());
  } catch {
    return jsonError("Could not load delivery settings.", 503);
  }
}

/** Amount field: null/"" clears it; otherwise a number from 0 to 1,00,000 with up to 2 decimals. */
function amount(value: unknown, label: string): { ok: true; value: number | null } | { ok: false; error: string } {
  if (value === null || value === undefined || value === "") return { ok: true, value: null };
  const n = Number(value);
  if (!Number.isFinite(n) || n < 0 || n > 100000) return { ok: false, error: `${label} must be between 0 and 100000.` };
  return { ok: true, value: Math.round(n * 100) / 100 };
}

export async function PUT(request: Request) {
  const denied = requireAdmin(request);
  if (denied) return denied;
  const body = await readJson(request);
  if (!body) return jsonError("A JSON object is required.", 400);
  if (!CHARGE_MODES.includes(body.chargeMode as ChargeMode)) return jsonError(`chargeMode must be one of ${CHARGE_MODES.join(", ")}.`, 400);
  if (typeof body.pickupEnabled !== "boolean") return jsonError("pickupEnabled must be true or false.", 400);

  const fields = {
    fixedFee: amount(body.fixedFee, "Fixed delivery charge"),
    perKmRate: amount(body.perKmRate, "Charge per km"),
    minimumCharge: amount(body.minimumCharge, "Minimum delivery charge"),
    freeAbove: amount(body.freeAbove, "Free delivery amount"),
  };
  for (const f of Object.values(fields)) if (!f.ok) return jsonError(f.error, 400);
  const v = Object.fromEntries(Object.entries(fields).map(([k, f]) => [k, (f as { value: number | null }).value])) as Record<keyof typeof fields, number | null>;

  if (body.chargeMode === "fixed" && v.fixedFee === null) return jsonError("Enter the fixed delivery charge (0 for free delivery everywhere).", 400);
  if (body.chargeMode === "per_km" && v.perKmRate === null) return jsonError("Enter the charge per km.", 400);

  const data = { chargeMode: body.chargeMode as ChargeMode, pickupEnabled: body.pickupEnabled, ...v };
  try {
    await prisma.deliverySettings.upsert({ where: { id: "default" }, create: { id: "default", ...data }, update: data });
    return NextResponse.json(data);
  } catch {
    return jsonError("Could not save delivery settings.", 500);
  }
}
