import { createHash } from "node:crypto";

function config() {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;
  return cloudName && apiKey && apiSecret ? { cloudName, apiKey, apiSecret } : null;
}

export function cloudinaryConfigured() {
  return config() !== null;
}

/** Cloudinary signature: sha1 of alphabetically sorted "k=v" pairs joined by "&", followed by the API secret. */
function signParams(params: Record<string, string>, apiSecret: string) {
  const toSign = Object.keys(params).sort().map((k) => `${k}=${params[k]}`).join("&");
  return createHash("sha1").update(toSign + apiSecret).digest("hex");
}

export async function uploadImage(file: Blob) {
  const cfg = config();
  if (!cfg) throw new Error("Cloudinary is not configured.");
  const params = { folder: "dolce/menu", timestamp: String(Math.floor(Date.now() / 1000)) };
  const form = new FormData();
  form.append("file", file);
  for (const [k, v] of Object.entries(params)) form.append(k, v);
  form.append("api_key", cfg.apiKey);
  form.append("signature", signParams(params, cfg.apiSecret));

  const response = await fetch(`https://api.cloudinary.com/v1_1/${cfg.cloudName}/image/upload`, { method: "POST", body: form });
  const data = (await response.json()) as { secure_url?: string; public_id?: string; error?: { message?: string } };
  if (!response.ok || !data.secure_url || !data.public_id) throw new Error(data.error?.message ?? "Upload failed.");
  return { imageUrl: data.secure_url, imagePublicId: data.public_id };
}

/** Best-effort delete; failures are logged, never thrown, so they can't block menu edits. */
export async function deleteImage(publicId: string | null | undefined) {
  const cfg = config();
  if (!cfg || !publicId) return;
  const params = { public_id: publicId, timestamp: String(Math.floor(Date.now() / 1000)) };
  const form = new FormData();
  for (const [k, v] of Object.entries(params)) form.append(k, v);
  form.append("api_key", cfg.apiKey);
  form.append("signature", signParams(params, cfg.apiSecret));
  try {
    await fetch(`https://api.cloudinary.com/v1_1/${cfg.cloudName}/image/destroy`, { method: "POST", body: form });
  } catch (error) {
    console.error("Cloudinary delete failed", error);
  }
}
