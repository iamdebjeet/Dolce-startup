"use client";

import { useCallback, useEffect, useState } from "react";
import { api } from "@/lib/client";
import type { InquiryDTO, InquiryStatus } from "@/lib/data";
import type { SectionProps } from "./AdminApp";

// Mirrors INQUIRY_STATUSES in lib/data.ts (not imported as a value so Prisma stays out of the browser bundle).
const STATUSES: InquiryStatus[] = ["NEW", "READ", "RESOLVED"];

export default function InquiriesAdmin({ onError }: SectionProps) {
  const [inquiries, setInquiries] = useState<InquiryDTO[] | null>(null);
  const [status, setStatus] = useState<InquiryStatus | "">("");

  const load = useCallback(
    () => api<InquiryDTO[]>(`/api/admin/inquiries${status ? `?status=${status}` : ""}`).then(setInquiries).catch(onError),
    [onError, status],
  );
  useEffect(() => { load(); }, [load]);

  async function changeStatus(inquiry: InquiryDTO, next: InquiryStatus) {
    try {
      await api(`/api/admin/inquiries/${inquiry.id}`, { method: "PATCH", json: { status: next } });
      await load();
    } catch (err) { onError(err); }
  }

  async function remove(inquiry: InquiryDTO) {
    if (!window.confirm(`Delete the message from ${inquiry.name}?`)) return;
    try {
      await api(`/api/admin/inquiries/${inquiry.id}`, { method: "DELETE" });
      await load();
    } catch (err) { onError(err); }
  }

  return (
    <section>
      <div className="admin-toolbar">
        <label className="field" style={{ gridAutoFlow: "column", alignItems: "center" }}>
          Status
          <select value={status} onChange={(e) => setStatus(e.target.value as InquiryStatus | "")}>
            <option value="">All</option>
            {STATUSES.map((s) => <option key={s} value={s}>{s.toLowerCase()}</option>)}
          </select>
        </label>
      </div>
      {inquiries === null ? <p className="muted">Loading…</p> : inquiries.length === 0 ? <p className="empty muted">No messages.</p> : (
        <div className="table-wrap">
          <table className="admin-table">
            <thead><tr><th>Received</th><th>From</th><th>Message</th><th>Status</th><th /></tr></thead>
            <tbody>
              {inquiries.map((q) => (
                <tr key={q.id}>
                  <td className="muted" style={{ whiteSpace: "nowrap" }}>{new Date(q.createdAt).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })}</td>
                  <td>
                    <strong>{q.name}</strong>
                    <div><a href={`mailto:${q.email}`} style={{ color: "var(--dolce-burgundy)" }}>{q.email}</a></div>
                    {q.phone && <div className="muted">{q.phone}</div>}
                  </td>
                  <td style={{ maxWidth: 440, whiteSpace: "pre-wrap" }}>{q.message}</td>
                  <td>
                    <select value={q.status} onChange={(e) => changeStatus(q, e.target.value as InquiryStatus)} aria-label="Status"
                      style={{ font: "13px var(--sans)", padding: 4, border: "1px solid var(--line)", background: "#fffdf8" }}>
                      {STATUSES.map((s) => <option key={s} value={s}>{s.toLowerCase()}</option>)}
                    </select>
                  </td>
                  <td><button className="btn btn-sm btn-danger" onClick={() => remove(q)}>Delete</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
