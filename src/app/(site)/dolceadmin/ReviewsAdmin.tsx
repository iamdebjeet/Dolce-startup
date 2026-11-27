"use client";

import { useCallback, useEffect, useState } from "react";
import { api } from "@/lib/client";
import type { ReviewDTO } from "@/lib/data";
import type { SectionProps } from "./AdminApp";

type Filter = "ready" | "featured" | "hidden" | "all";

const PERMISSION: Record<ReviewDTO["consent"], { label: string; cls: string }> = {
  first_name: { label: "Show first name", cls: "badge-normal" },
  anonymous: { label: "Show anonymously", cls: "badge-chilled" },
  private: { label: "Keep private", cls: "badge-off" },
};

// Mirrors canFeature() in lib/reviews.ts (not imported, to keep Prisma out of the browser bundle).
const canFeature = (r: ReviewDTO) => r.consent !== "private" && r.text.trim().length > 0;

export default function ReviewsAdmin({ onError }: SectionProps) {
  const [reviews, setReviews] = useState<ReviewDTO[] | null>(null);
  const [filter, setFilter] = useState<Filter>("ready");

  const load = useCallback(() => api<ReviewDTO[]>("/api/admin/reviews").then(setReviews).catch(onError), [onError]);
  useEffect(() => { load(); }, [load]);

  async function setFeatured(r: ReviewDTO, isApproved: boolean) {
    try {
      await api(`/api/admin/reviews/${r.id}`, { method: "PATCH", json: { isApproved } });
      await load();
    } catch (err) { onError(err); }
  }

  async function remove(r: ReviewDTO) {
    if (!window.confirm(`Delete the review from ${r.name}? It will also stop counting toward the average rating.`)) return;
    try {
      await api(`/api/admin/reviews/${r.id}`, { method: "DELETE" });
      await load();
    } catch (err) { onError(err); }
  }

  if (reviews === null) return <p className="muted">Loading…</p>;

  const groups: Record<Filter, ReviewDTO[]> = {
    ready: reviews.filter((r) => canFeature(r) && !r.isApproved),
    featured: reviews.filter((r) => r.isApproved),
    hidden: reviews.filter((r) => !canFeature(r)),
    all: reviews,
  };
  const visible = groups[filter];
  const average = reviews.length ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length : 0;

  return (
    <section>
      <div className="admin-toolbar">
        <label className="field" style={{ gridAutoFlow: "column", alignItems: "center" }}>
          Show
          <select value={filter} onChange={(e) => setFilter(e.target.value as Filter)}>
            <option value="ready">Ready to feature ({groups.ready.length})</option>
            <option value="featured">Featured on website ({groups.featured.length})</option>
            <option value="hidden">Private / rating only ({groups.hidden.length})</option>
            <option value="all">All responses ({groups.all.length})</option>
          </select>
        </label>
        <span className="muted">
          {reviews.length ? <>Website shows <strong>{average.toFixed(1)}★</strong> from {reviews.length} rating{reviews.length === 1 ? "" : "s"}</> : "No ratings yet"}
        </span>
      </div>
      <p className="muted" style={{ fontSize: 13, marginTop: -4 }}>
        Every rating counts toward the average. Only reviews you <strong>Feature</strong> appear on the website — and only if the customer allowed it and wrote a review.
      </p>

      {visible.length === 0 ? <p className="empty muted">Nothing here.</p> : (
        <div className="table-wrap">
          <table className="admin-table">
            <thead><tr><th>Date</th><th>Name</th><th>Rating</th><th>Review</th><th>Permission</th><th /></tr></thead>
            <tbody>
              {visible.map((r) => (
                <tr key={r.id}>
                  <td className="muted" style={{ whiteSpace: "nowrap" }}>
                    {new Date(r.createdAt).toLocaleDateString("en-IN")}
                    <div style={{ fontSize: 11 }}>{r.source === "google_form" ? "Google Form" : "Website"}</div>
                  </td>
                  <td>{r.name}{r.product && <div className="muted" style={{ fontSize: 12 }}>Liked: {r.product}</div>}</td>
                  <td className="stars" style={{ whiteSpace: "nowrap" }}>{"★".repeat(r.rating)}<span style={{ color: "#d9c9b3" }}>{"★".repeat(5 - r.rating)}</span></td>
                  <td style={{ maxWidth: 420, whiteSpace: "pre-wrap" }}>{r.text || <span className="muted">(rating only, no written review)</span>}</td>
                  <td>
                    <span className={`badge ${PERMISSION[r.consent].cls}`}>{PERMISSION[r.consent].label}</span>
                    {r.isApproved && <div style={{ marginTop: 6 }}><span className="badge badge-hot">On website</span></div>}
                  </td>
                  <td>
                    <div className="row-actions">
                      {r.isApproved ? (
                        <button className="btn btn-sm btn-ghost" onClick={() => setFeatured(r, false)}>Remove from website</button>
                      ) : (
                        <button className="btn btn-sm" disabled={!canFeature(r)} onClick={() => setFeatured(r, true)}
                          title={canFeature(r) ? undefined : r.consent === "private" ? "The customer asked to keep this private" : "No written review to show"}>
                          Feature
                        </button>
                      )}
                      <button className="btn btn-sm btn-danger" onClick={() => remove(r)}>Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
