import { cache } from "react";
import { prisma } from "@/lib/prisma";
import { CHARGE_MODES, DEFAULT_DELIVERY, type ChargeMode, type DeliverySettingsDTO } from "@/lib/delivery";

const num = (v: unknown) => (v === null || v === undefined ? null : Number(v));

/** Delivery settings from the database, falling back to defaults ("confirmed in chat") if none saved yet. */
export const getDeliverySettings = cache(async (): Promise<DeliverySettingsDTO> => {
  const row = await prisma.deliverySettings.findUnique({ where: { id: "default" } });
  if (!row) return DEFAULT_DELIVERY;
  return {
    chargeMode: (CHARGE_MODES as readonly string[]).includes(row.chargeMode) ? (row.chargeMode as ChargeMode) : "unset",
    fixedFee: num(row.fixedFee),
    perKmRate: num(row.perKmRate),
    minimumCharge: num(row.minimumCharge),
    freeAbove: num(row.freeAbove),
    pickupEnabled: row.pickupEnabled,
  };
});

/** Same as getDeliverySettings, but never throws (pages keep working if the DB is briefly unavailable). */
export async function getDeliverySettingsSafe() {
  try {
    return await getDeliverySettings();
  } catch (error) {
    console.error("Delivery settings unavailable", error);
    return DEFAULT_DELIVERY;
  }
}
