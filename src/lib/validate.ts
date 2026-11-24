/** Validates optional menu item fields shared by create (POST) and update (PATCH). Returns an error message or null. */
export function validateMenuItemFields(body: Record<string, unknown>): string | null {
  if ("name" in body && (typeof body.name !== "string" || !body.name.trim())) return "Name cannot be empty.";
  if ("description" in body && (typeof body.description !== "string" || !body.description.trim())) return "Description cannot be empty.";
  if ("categoryId" in body && (typeof body.categoryId !== "string" || !body.categoryId)) return "categoryId must be a string.";
  if ("temperature" in body && !["HOT", "NORMAL", "CHILLED"].includes(String(body.temperature))) return "temperature must be HOT, NORMAL, or CHILLED.";
  if ("spiceIndex" in body && (!Number.isInteger(body.spiceIndex) || Number(body.spiceIndex) < 0 || Number(body.spiceIndex) > 3)) return "spiceIndex must be an integer from 0 to 3.";
  if ("sortOrder" in body && !Number.isInteger(body.sortOrder)) return "sortOrder must be an integer.";
  if ("isAvailable" in body && typeof body.isAvailable !== "boolean") return "isAvailable must be a boolean.";
  for (const key of ["imageUrl", "imagePublicId"] as const) {
    if (key in body && body[key] !== null && typeof body[key] !== "string") return `${key} must be a string or null.`;
  }
  if (typeof body.imageUrl === "string" && body.imageUrl && !/^https:\/\//.test(body.imageUrl)) return "imageUrl must be an https URL.";
  return null;
}
