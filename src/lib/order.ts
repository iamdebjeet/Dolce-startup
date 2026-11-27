/** Builds the WhatsApp order message from basket lines. Pure: safe on server and client. */

export type OrderLine = {
  name: string;
  option: string | null; // serving option label, e.g. "Half"; null when the item has no options
  unitPrice: number | null; // null = price on request
  qty: number;
};

export function formatRupees(value: number) {
  return `₹${Number.isInteger(value) ? value.toLocaleString("en-IN") : value.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function orderTotals(lines: OrderLine[]) {
  const count = lines.reduce((n, l) => n + l.qty, 0);
  const total = lines.reduce((sum, l) => sum + (l.unitPrice ?? 0) * l.qty, 0);
  const hasUnpriced = lines.some((l) => l.unitPrice === null);
  return { count, total: Math.round(total * 100) / 100, hasUnpriced };
}

export function buildOrderMessage(lines: OrderLine[], details: { name?: string; note?: string } = {}) {
  const { count, total, hasUnpriced } = orderTotals(lines);
  const rows = lines.map((l, i) => {
    const label = l.option ? `${l.name} (${l.option})` : l.name;
    const price = l.unitPrice === null ? "price on request" : formatRupees(l.unitPrice * l.qty);
    return `${i + 1}. ${label} x ${l.qty} = ${price}`;
  });
  const parts = [
    "Hi DOLCE! I'd like to place an order:",
    "",
    ...rows,
    "",
    `Items: ${count}`,
    `Total: ${formatRupees(total)}${hasUnpriced ? " + items priced on request" : ""} (excluding delivery charges)`,
  ];
  const name = details.name?.trim();
  const note = details.note?.trim();
  if (name || note) parts.push("");
  if (name) parts.push(`Name: ${name}`);
  if (note) parts.push(`Note: ${note}`);
  parts.push("", "Please confirm availability. Thank you!");
  return parts.join("\n");
}
