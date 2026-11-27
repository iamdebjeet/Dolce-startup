/** Delivery pricing rules (pure: safe on server and in the browser). Settings are edited in /dolceadmin. */
import { formatRupees } from "./money";

export const CHARGE_MODES = ["unset", "fixed", "per_km"] as const;
export type ChargeMode = (typeof CHARGE_MODES)[number];

export type DeliverySettingsDTO = {
  chargeMode: ChargeMode;
  fixedFee: number | null;
  perKmRate: number | null;
  minimumCharge: number | null;
  freeAbove: number | null;
  pickupEnabled: boolean;
};

export const DEFAULT_DELIVERY: DeliverySettingsDTO = {
  chargeMode: "unset", fixedFee: null, perKmRate: null, minimumCharge: null, freeAbove: null, pickupEnabled: true,
};

export type Fulfilment = "delivery" | "pickup";

export type DeliveryQuote =
  | { kind: "pickup" }
  | { kind: "free"; freeAbove: number }
  | { kind: "fixed"; fee: number }
  | { kind: "per_km"; rate: number; minimum: number | null }
  | { kind: "unset" };

/** Effective mode: a mode whose amount isn't filled in behaves like "unset" (confirmed in chat). */
function effectiveMode(s: DeliverySettingsDTO): ChargeMode {
  if (s.chargeMode === "fixed" && s.fixedFee !== null) return "fixed";
  if (s.chargeMode === "per_km" && s.perKmRate !== null) return "per_km";
  return "unset";
}

export function deliveryQuote(subtotal: number, s: DeliverySettingsDTO, method: Fulfilment): DeliveryQuote {
  if (method === "pickup") return { kind: "pickup" };
  if (s.freeAbove !== null && subtotal >= s.freeAbove) return { kind: "free", freeAbove: s.freeAbove };
  const mode = effectiveMode(s);
  if (mode === "fixed") return s.fixedFee === 0 ? { kind: "free", freeAbove: 0 } : { kind: "fixed", fee: s.fixedFee! };
  if (mode === "per_km") return { kind: "per_km", rate: s.perKmRate!, minimum: s.minimumCharge };
  return { kind: "unset" };
}

/** Amount still needed for free delivery, or null when there's no offer / already qualifies / pickup. */
export function amountToFreeDelivery(subtotal: number, s: DeliverySettingsDTO, method: Fulfilment) {
  if (method === "pickup" || s.freeAbove === null || subtotal >= s.freeAbove) return null;
  return Math.round((s.freeAbove - subtotal) * 100) / 100;
}

/** Delivery fee included in the total, or null when it can't be known yet (per km / not set). */
export function knownFee(q: DeliveryQuote): number | null {
  if (q.kind === "pickup" || q.kind === "free") return 0;
  if (q.kind === "fixed") return q.fee;
  return null;
}

/** Short label for the delivery line in the basket and the order message. */
export function quoteLabel(q: DeliveryQuote): string {
  switch (q.kind) {
    case "pickup": return "Pickup — no delivery charge";
    case "free": return q.freeAbove > 0 ? `Free (order above ${formatRupees(q.freeAbove)})` : "Free";
    case "fixed": return formatRupees(q.fee);
    case "per_km": return `${formatRupees(q.rate)}/km${q.minimum ? `, min ${formatRupees(q.minimum)}` : ""} — confirmed in chat`;
    case "unset": return "Confirmed in chat based on your location";
  }
}

/** One-line description of the delivery charge rule, for the info section. */
export function describeCharges(s: DeliverySettingsDTO): string {
  const mode = effectiveMode(s);
  if (mode === "fixed") return s.fixedFee === 0 ? "Free delivery anywhere in the city." : `${formatRupees(s.fixedFee!)} delivery charge anywhere in the city.`;
  if (mode === "per_km") return `${formatRupees(s.perKmRate!)} per km${s.minimumCharge ? ` (minimum ${formatRupees(s.minimumCharge)})` : ""}, based on your distance — confirmed in the chat.`;
  return "Delivery charges depend on your location — we confirm them in the chat.";
}
