/** Builds the WhatsApp/Instagram order message from basket lines. Pure: safe on server and client. */
import { formatRupees } from "./money";
import { knownFee, quoteLabel, type DeliveryQuote, type Fulfilment } from "./delivery";

export { formatRupees };

export type OrderLine = {
  name: string;
  option: string | null; // serving option label, e.g. "Half"; null when the item has no options
  unitPrice: number | null; // null = price on request
  qty: number;
};

export function orderTotals(lines: OrderLine[]) {
  const count = lines.reduce((n, l) => n + l.qty, 0);
  const total = lines.reduce((sum, l) => sum + (l.unitPrice ?? 0) * l.qty, 0);
  const hasUnpriced = lines.some((l) => l.unitPrice === null);
  return { count, total: Math.round(total * 100) / 100, hasUnpriced };
}

export type OrderDetails = {
  name?: string;
  note?: string;
  /** Delivery or pickup, the customer's area, and the delivery quote shown in the basket. */
  fulfilment?: { method: Fulfilment; area?: string; quote: DeliveryQuote; city: string };
};

export function buildOrderMessage(lines: OrderLine[], details: OrderDetails = {}) {
  const { count, total, hasUnpriced } = orderTotals(lines);
  const rows = lines.map((l, i) => {
    const label = l.option ? `${l.name} (${l.option})` : l.name;
    const price = l.unitPrice === null ? "price on request" : formatRupees(l.unitPrice * l.qty);
    return `${i + 1}. ${label} x ${l.qty} = ${price}`;
  });
  const onRequest = hasUnpriced ? " + items priced on request" : "";
  const parts = ["Hi DOLCE! I'd like to place an order:", "", ...rows, "", `Items: ${count}`];

  const f = details.fulfilment;
  if (!f) {
    parts.push(`Total: ${formatRupees(total)}${onRequest} (excluding delivery charges)`);
  } else {
    parts.push(`Subtotal: ${formatRupees(total)}${onRequest}`);
    if (f.method === "pickup") {
      parts.push("Order type: Pickup (please share the pickup address)");
    } else {
      parts.push(`Order type: Delivery in ${f.city}`);
      const area = f.area?.trim();
      if (area) parts.push(`Delivery area: ${area}`);
      parts.push(`Delivery: ${quoteLabel(f.quote)}`);
    }
    const fee = knownFee(f.quote);
    parts.push(fee === null
      ? `Total: ${formatRupees(total)}${onRequest} (excluding delivery charges)`
      : `Total: ${formatRupees(Math.round((total + fee) * 100) / 100)}${onRequest}`);
  }

  const name = details.name?.trim();
  const note = details.note?.trim();
  if (name || note) parts.push("");
  if (name) parts.push(`Name: ${name}`);
  if (note) parts.push(`Note: ${note}`);
  parts.push("", "Please confirm availability. Thank you!");
  return parts.join("\n");
}
