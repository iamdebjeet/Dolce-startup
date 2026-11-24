"use client";

import { useCallback, useEffect, useState } from "react";
import { api } from "@/lib/client";
import type { ReviewDTO } from "@/lib/data";
import type { SectionProps } from "./AdminApp";

export default function ReviewsAdmin({ onError }: SectionProps) {
  const [reviews, setReviews] = useState<ReviewDTO[] | null>(null);
  const [show, setShow] = useState<"pending" | "approved" | "all">("pending");

  const load = useCallback(() => api<ReviewDTO[]>("/api/admin/reviews").then(setReviews).catch(onError), [onError]);
  useEffect(() => { load(); }, [load]);

  async function setApproved(r: ReviewDTO, isApproved: boolean) {
    try {
      await api(`/api/admin/reviews/${r.id}`, { method: "PATCH", json: { isApproved } });
      await load();
    } catch (err) { onError(err); }
  }

  async function remove(r: ReviewDTO) {
    if (!window.confirm(`Delete the review from ${r.name}?`)) return;
    try {
      await api(`/api/admin/reviews/${r.id}`, { method: "DELETE" });
      await load();
    } catch (err) { onError(err); }
  }

  if (reviews === null) return <p className="muted">Loading…</p>;
  const pending = reviews.filter((r) => !r.isApproved).length;
  const visible = reviews.filter((r) => show === "all" || (show === "approved" ? r.isApproved : !r.isApproved));

  return (
    <section>
      <div className="admin-toolbar">
        <label className="field" style={{ gridAutoFlow: "column", alignItems: "center" }}>
          Show
          <select value={show} onChange={(e) => setShow(e.target.value as typeof show)}>
            <option value="pending">Awaiting approval ({pending})</option>
            <option value="approved">Approved ({reviews.length - pending})</option>
            <option value="all">All ({reviews.length})</option>
          </select>
        </label>
      </div>
      {visible.length === 0 ? <p className="empty muted">Nothing here.</p> : (
        <div className="table-wrap">
          <table className="admin-table">
            <thead><tr><th>Date</th><th>Name</th><th>Rating</th><th>Review</th><th>Status</th><th /></tr></thead>
            <tbody>
              {visible.map((r) => (
                <tr key={r.id}>
                  <td className="muted" style={{ whiteSpace: "nowrap" }}>{new Date(r.createdAt).toLocaleDateString("en-IN")}</td>
                  <td>{r.name}</td>
                  <td className="stars" style={{ whiteSpace: "nowrap" }}>{"★".repeat(r.rating)}</td>
                  <td style={{ maxWidth: 420, whiteSpace: "pre-wrap" }}>{r.text}</td>
                  <td><span className={`badge ${r.isApproved ? "badge-normal" : "badge-off"}`}>{r.isApproved ? "Public" : "Pending"}</span></td>
                  <td>
                    <div className="row-actions">
                      {r.isApproved
                        ? <button className="btn btn-sm btn-ghost" onClick={() => setApproved(r, false)}>Hide</button>
                        : <button className="btn btn-sm" onClick={() => setApproved(r, true)}>Approve</button>}
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
