import { NextResponse } from "next/server";
import { jsonError, requireAdmin } from "@/lib/api";
import { cloudinaryConfigured, uploadImage } from "@/lib/cloudinary";

const MAX_BYTES = 5 * 1024 * 1024;
const TYPES = ["image/jpeg", "image/png", "image/webp", "image/avif"];

/** multipart/form-data with a single "file" field. Returns { imageUrl, imagePublicId } to store on a menu item. */
export async function POST(request: Request) {
  const denied = requireAdmin(request);
  if (denied) return denied;
  if (!cloudinaryConfigured()) return jsonError("Image upload is not configured. Set the CLOUDINARY_* variables.", 503);
  let file: FormDataEntryValue | null;
  try {
    file = (await request.formData()).get("file");
  } catch {
    return jsonError("Send the image as multipart/form-data in a \"file\" field.", 400);
  }
  if (!(file instanceof Blob)) return jsonError("An image file is required.", 400);
  if (!TYPES.includes(file.type)) return jsonError("Image must be JPEG, PNG, WebP, or AVIF.", 415);
  if (file.size > MAX_BYTES) return jsonError("Image must be 5 MB or smaller.", 413);
  try {
    return NextResponse.json(await uploadImage(file), { status: 201 });
  } catch (error) {
    return jsonError(error instanceof Error ? `Upload failed: ${error.message}` : "Upload failed.", 502);
  }
}
