import { cache } from "react";
import { prisma } from "@/lib/prisma";

/** Customer permission from the Google Form question "May we feature your feedback…?". */
export const CONSENTS = ["first_name", "anonymous", "private"] as const;
export type Consent = (typeof CONSENTS)[number];

export const ANONYMOUS_NAME = "A DOLCE customer";

/** Maps the form's answer text to a consent value. Anything unrecognised is treated as private (safest). */
export function consentFromAnswer(answer: unknown): Consent {
  const a = typeof answer === "string" ? answer.trim().toLowerCase() : "";
  if (a.startsWith("yes") && a.includes("first name")) return "first_name";
  if (a.startsWith("yes") && a.includes("anonym")) return "anonymous";
  return "private";
}

/** Only ever store/show the first name; anonymous reviews get a generic label. */
export function displayName(fullName: unknown, consent: Consent) {
  if (consent === "anonymous") return ANONYMOUS_NAME;
  const first = typeof fullName === "string" ? fullName.trim().split(/\s+/)[0] ?? "" : "";
  return first.slice(0, 40) || ANONYMOUS_NAME;
}

/** A review may appear on the website only with the customer's permission and some text to show. */
export function canFeature(review: { consent: string; text: string }) {
  return review.consent !== "private" && review.text.trim().length > 0;
}

export type ReviewStats = { count: number; average: number; distribution: { stars: number; count: number }[] };
export type PublicReview = { id: string; name: string; rating: number; text: string; product: string | null; createdAt: string };

/** Average and distribution across ALL ratings (private ones included — only their text stays hidden). */
export const getReviewStats = cache(async (): Promise<ReviewStats> => {
  const groups = await prisma.review.groupBy({ by: ["rating"], _count: { _all: true } });
  const byStars = new Map(groups.map((g) => [g.rating, g._count._all]));
  const count = groups.reduce((n, g) => n + g._count._all, 0);
  const sum = groups.reduce((s, g) => s + g.rating * g._count._all, 0);
  return {
    count,
    average: count ? Math.round((sum / count) * 10) / 10 : 0,
    distribution: [5, 4, 3, 2, 1].map((stars) => ({ stars, count: byStars.get(stars) ?? 0 })),
  };
});

/** Reviews the admin chose to feature, limited to ones the customer allowed us to show. */
export const getFeaturedReviews = cache(async (limit = 9): Promise<PublicReview[]> => {
  const rows = await prisma.review.findMany({
    where: { isApproved: true, consent: { not: "private" }, NOT: { text: "" } },
    orderBy: { createdAt: "desc" },
    take: limit,
    select: { id: true, name: true, rating: true, text: true, product: true, createdAt: true },
  });
  return rows.map((r) => ({ ...r, createdAt: r.createdAt.toISOString() }));
});
