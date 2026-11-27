/** ₹ formatting with Indian digit grouping, e.g. ₹1,200 or ₹149.50. */
export function formatRupees(value: number) {
  return `₹${Number.isInteger(value) ? value.toLocaleString("en-IN") : value.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}
