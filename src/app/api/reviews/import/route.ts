import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isRecord, jsonError, readJson } from "@/lib/api";
import { safeEqual } from "@/lib/auth";
import { canFeature, consentFromAnswer, displayName } from "@/lib/reviews";

/**
 * Receives Google Form responses from the Apps Script in scripts/google-form-sync.gs.
 * Auth: `Authorization: Bearer <FORM_WEBHOOK_SECRET>`.
 * Body: { responses: [{ id, submittedAt, name, product, rating, review, consent }] }  (max 500 per call)
 * Idempotent: responses are matched by their Google Form response id.
 * Privacy: only the first name (or nothing, when anonymous) is stored; age and gender are never sent.
 */
export async function POST(request: Request) {
  const secret = process.env.FORM_WEBHOOK_SECRET;
  if (!secret || secret.length < 24) return jsonError("Review import is not configured. Set FORM_WEBHOOK_SECRET.", 503);
  const supplied = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "") ?? "";
  if (!safeEqual(secret, supplied)) return jsonError("Unauthorized.", 401);

  const body = await readJson(request);
  const responses = Array.isArray(body?.responses) ? body.responses : null;
  if (!responses) return jsonError("Expected { responses: [...] }.", 400);
  if (responses.length > 500) return jsonError("Send at most 500 responses per request.", 413);

  let created = 0, updated = 0;
  const skipped: { id: unknown; reason: string }[] = [];

  for (const r of responses) {
    if (!isRecord(r) || typeof r.id !== "string" || !r.id.trim() || r.id.length > 200) {
      skipped.push({ id: isRecord(r) ? r.id : null, reason: "missing response id" });
      continue;
    }
    const rating = Number(r.rating);
    if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
      skipped.push({ id: r.id, reason: "rating must be 1-5" });
      continue;
    }
    const consent = consentFromAnswer(r.consent);
    const text = typeof r.review === "string" ? r.review.trim().slice(0, 2000) : "";
    const product = typeof r.product === "string" && r.product.trim() ? r.product.trim().slice(0, 120) : null;
    const submitted = typeof r.submittedAt === "string" ? new Date(r.submittedAt) : null;
    const data = { name: displayName(r.name, consent), rating, text, product, consent, source: "google_form" };

    try {
      const existing = await prisma.review.findUnique({ where: { externalId: r.id }, select: { id: true, isApproved: true } });
      if (existing) {
        // Keep the admin's "featured" choice, unless the review can no longer be shown.
        await prisma.review.update({ where: { id: existing.id }, data: { ...data, isApproved: existing.isApproved && canFeature(data) } });
        updated++;
      } else {
        await prisma.review.create({
          data: { ...data, externalId: r.id, ...(submitted && !Number.isNaN(submitted.getTime()) ? { createdAt: submitted } : {}) },
        });
        created++;
      }
    } catch {
      skipped.push({ id: r.id, reason: "database error" });
    }
  }

  return NextResponse.json({ created, updated, skipped });
}
