"use client";

import { useCallback, useEffect, useState } from "react";
import { api } from "@/lib/client";
import type { CategoryDTO } from "@/lib/data";
import type { SectionProps } from "./AdminApp";

type Draft = { id?: string; name: string; slug: string; description: string; sortOrder: string; isActive: boolean };
const EMPTY: Draft = { name: "", slug: "", description: "", sortOrder: "0", isActive: true };

export default function CategoriesAdmin({ onError }: SectionProps) {
  const [categories, setCategories] = useState<CategoryDTO[] | null>(null);
  const [draft, setDraft] = useState<Draft | null>(null);
  const [busy, setBusy] = useState(false);

  const load = useCallback(() => api<CategoryDTO[]>("/api/admin/categories").then(setCategories).catch(onError), [onError]);
  useEffect(() => { load(); }, [load]);

  async function save(event: React.FormEvent) {
    event.preventDefault();
    if (!draft) return;
    setBusy(true);
    const body = {
      name: draft.name,
      ...(draft.slug.trim() ? { slug: draft.slug } : {}),
      description: draft.description,
      sortOrder: Number.parseInt(draft.sortOrder, 10) || 0,
      isActive: draft.isActive,
    };
    try {
      await api(draft.id ? `/api/categories/${draft.id}` : "/api/categories", { method: draft.id ? "PATCH" : "POST", json: body });
      setDraft(null);
      await load();
    } catch (err) {
      onError(err);
    } finally {
      setBusy(false);
    }
  }

  async function toggle(c: CategoryDTO) {
    try {
      await api(`/api/categories/${c.id}`, { method: "PATCH", json: { isActive: !c.isActive } });
      await load();
    } catch (err) { onError(err); }
  }

  async function remove(c: CategoryDTO) {
    if (!window.confirm(`Delete the category "${c.name}"? This cannot be undone.`)) return;
    try {
      await api(`/api/categories/${c.id}`, { method: "DELETE" });
      await load();
    } catch (err) { onError(err); }
  }

  return (
    <section>
      {draft ? (
        <form className="panel form" style={{ maxWidth: "none" }} onSubmit={save}>
          <h3>{draft.id ? "Edit category" : "New category"}</h3>
          <div className="form-row">
            <label className="field">Name<input required value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} /></label>
            <label className="field">Slug (optional)<input value={draft.slug} placeholder="auto from name" onChange={(e) => setDraft({ ...draft, slug: e.target.value })} /></label>
            <label className="field">Display order<input type="number" step={1} value={draft.sortOrder} onChange={(e) => setDraft({ ...draft, sortOrder: e.target.value })} /></label>
          </div>
          <label className="field">Description<textarea style={{ minHeight: 70 }} value={draft.description} onChange={(e) => setDraft({ ...draft, description: e.target.value })} /></label>
          <label className="check"><input type="checkbox" checked={draft.isActive} onChange={(e) => setDraft({ ...draft, isActive: e.target.checked })} /> Active (shown on the public menu)</label>
          <div className="row-actions">
            <button className="btn" disabled={busy}>{busy ? "Saving…" : "SAVE"}</button>
            <button type="button" className="btn btn-ghost" onClick={() => setDraft(null)}>Cancel</button>
          </div>
        </form>
      ) : (
        <div className="admin-toolbar">
          <span className="muted">{categories ? `${categories.length} categor${categories.length === 1 ? "y" : "ies"}` : ""}</span>
          <button className="btn btn-sm" onClick={() => setDraft(EMPTY)}>+ New category</button>
        </div>
      )}

      {categories === null ? <p className="muted">Loading…</p> : categories.length === 0 ? (
        <p className="empty muted">No categories yet. Create one (e.g. Desserts, Beverages) before adding menu items.</p>
      ) : (
        <div className="table-wrap">
          <table className="admin-table">
            <thead><tr><th>Order</th><th>Name</th><th>Slug</th><th>Items</th><th>Status</th><th /></tr></thead>
            <tbody>
              {categories.map((c) => (
                <tr key={c.id}>
                  <td>{c.sortOrder}</td>
                  <td><strong>{c.name}</strong>{c.description && <div className="muted" style={{ fontSize: 12 }}>{c.description}</div>}</td>
                  <td className="muted">{c.slug}</td>
                  <td>{c.itemCount}</td>
                  <td><span className={`badge ${c.isActive ? "badge-normal" : "badge-off"}`}>{c.isActive ? "Active" : "Inactive"}</span></td>
                  <td>
                    <div className="row-actions">
                      <button className="btn btn-sm btn-ghost" onClick={() => setDraft({ id: c.id, name: c.name, slug: c.slug, description: c.description ?? "", sortOrder: String(c.sortOrder), isActive: c.isActive })}>Edit</button>
                      <button className="btn btn-sm btn-ghost" onClick={() => toggle(c)}>{c.isActive ? "Deactivate" : "Activate"}</button>
                      <button className="btn btn-sm btn-danger" disabled={!!c.itemCount} title={c.itemCount ? "Move or delete this category's items first" : undefined} onClick={() => remove(c)}>Delete</button>
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
