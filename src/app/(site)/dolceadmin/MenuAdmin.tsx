"use client";

import { useCallback, useEffect, useState } from "react";
import { api, formatPrice } from "@/lib/client";
import type { CategoryDTO, MenuItemDTO, Temperature } from "@/lib/data";
import type { SectionProps } from "./AdminApp";

type OptionDraft = { label: string; price: string; isAvailable: boolean };
type Draft = {
  id?: string;
  name: string;
  description: string;
  categoryId: string;
  temperature: Temperature;
  spiceIndex: number;
  imageUrl: string;
  imagePublicId: string;
  sortOrder: string;
  isAvailable: boolean;
  servingOptions: OptionDraft[];
};

function emptyDraft(categoryId: string): Draft {
  return { name: "", description: "", categoryId, temperature: "NORMAL", spiceIndex: 0, imageUrl: "", imagePublicId: "", sortOrder: "0", isAvailable: true, servingOptions: [{ label: "Regular", price: "", isAvailable: true }] };
}

function toDraft(item: MenuItemDTO): Draft {
  return {
    id: item.id, name: item.name, description: item.description, categoryId: item.categoryId, temperature: item.temperature,
    spiceIndex: item.spiceIndex, imageUrl: item.imageUrl ?? "", imagePublicId: item.imagePublicId ?? "", sortOrder: String(item.sortOrder),
    isAvailable: item.isAvailable, servingOptions: item.servingOptions.map((o) => ({ label: o.label, price: String(o.price), isAvailable: o.isAvailable })),
  };
}

export default function MenuAdmin({ onError }: SectionProps) {
  const [items, setItems] = useState<MenuItemDTO[] | null>(null);
  const [categories, setCategories] = useState<CategoryDTO[]>([]);
  const [draft, setDraft] = useState<Draft | null>(null);
  const [filter, setFilter] = useState("");
  const [busy, setBusy] = useState(false);
  const [uploading, setUploading] = useState(false);

  const load = useCallback(
    () => Promise.all([api<MenuItemDTO[]>("/api/admin/menu"), api<CategoryDTO[]>("/api/admin/categories")])
      .then(([i, c]) => { setItems(i); setCategories(c); })
      .catch(onError),
    [onError],
  );
  useEffect(() => { load(); }, [load]);

  function update<K extends keyof Draft>(key: K, value: Draft[K]) {
    setDraft((d) => (d ? { ...d, [key]: value } : d));
  }
  function updateOption(index: number, patch: Partial<OptionDraft>) {
    setDraft((d) => d && { ...d, servingOptions: d.servingOptions.map((o, i) => (i === index ? { ...o, ...patch } : o)) });
  }

  async function upload(file: File) {
    setUploading(true);
    try {
      const form = new FormData();
      form.append("file", file);
      const result = await api<{ imageUrl: string; imagePublicId: string }>("/api/admin/upload", { method: "POST", body: form });
      setDraft((d) => d && { ...d, ...result });
    } catch (err) { onError(err); } finally { setUploading(false); }
  }

  async function save(event: React.FormEvent) {
    event.preventDefault();
    if (!draft) return;
    setBusy(true);
    const body = {
      name: draft.name,
      description: draft.description,
      categoryId: draft.categoryId,
      temperature: draft.temperature,
      spiceIndex: draft.spiceIndex,
      imageUrl: draft.imageUrl.trim() || null,
      imagePublicId: draft.imagePublicId || null,
      sortOrder: Number.parseInt(draft.sortOrder, 10) || 0,
      isAvailable: draft.isAvailable,
      servingOptions: draft.servingOptions.filter((o) => o.label.trim() || o.price).map((o) => ({ label: o.label, price: o.price === "" ? "" : Number(o.price), isAvailable: o.isAvailable })),
    };
    try {
      await api(draft.id ? `/api/menu/${draft.id}` : "/api/menu", { method: draft.id ? "PATCH" : "POST", json: body });
      setDraft(null);
      await load();
    } catch (err) { onError(err); } finally { setBusy(false); }
  }

  async function toggle(item: MenuItemDTO) {
    try {
      await api(`/api/menu/${item.id}`, { method: "PATCH", json: { isAvailable: !item.isAvailable } });
      await load();
    } catch (err) { onError(err); }
  }

  async function remove(item: MenuItemDTO) {
    if (!window.confirm(`Delete "${item.name}"? This cannot be undone. Tip: mark it unavailable instead to hide it temporarily.`)) return;
    try {
      await api(`/api/menu/${item.id}`, { method: "DELETE" });
      await load();
    } catch (err) { onError(err); }
  }

  if (items === null) return <p className="muted">Loading…</p>;

  const visible = filter ? items.filter((i) => i.categoryId === filter) : items;

  return (
    <section>
      {draft ? (
        <form className="panel form" style={{ maxWidth: "none" }} onSubmit={save}>
          <h3>{draft.id ? "Edit menu item" : "New menu item"}</h3>
          <div className="form-row">
            <label className="field">Name<input required value={draft.name} onChange={(e) => update("name", e.target.value)} /></label>
            <label className="field">Category
              <select required value={draft.categoryId} onChange={(e) => update("categoryId", e.target.value)}>
                {categories.map((c) => <option key={c.id} value={c.id}>{c.name}{c.isActive ? "" : " (inactive)"}</option>)}
              </select>
            </label>
          </div>
          <label className="field">Description<textarea required value={draft.description} onChange={(e) => update("description", e.target.value)} /></label>
          <div className="form-row">
            <label className="field">Temperature
              <select value={draft.temperature} onChange={(e) => update("temperature", e.target.value as Temperature)}>
                <option value="HOT">Hot</option><option value="NORMAL">Room temp</option><option value="CHILLED">Chilled</option>
              </select>
            </label>
            <label className="field">Spice level
              <select value={draft.spiceIndex} onChange={(e) => update("spiceIndex", Number(e.target.value))}>
                <option value={0}>0 — none</option><option value={1}>1 — mild</option><option value={2}>2 — medium</option><option value={3}>3 — hot</option>
              </select>
            </label>
            <label className="field">Display order<input type="number" step={1} value={draft.sortOrder} onChange={(e) => update("sortOrder", e.target.value)} /></label>
          </div>

          <div className="field">
            <span>Image</span>
            <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              {draft.imageUrl && <img className="thumb" src={draft.imageUrl} alt="" style={{ width: 96, height: 72 }} />}
              <input type="file" accept="image/jpeg,image/png,image/webp,image/avif" disabled={uploading}
                onChange={(e) => { const f = e.target.files?.[0]; if (f) upload(f); e.target.value = ""; }} style={{ width: "auto" }} />
              {uploading && <span className="muted">Uploading…</span>}
              {draft.imageUrl && <button type="button" className="btn btn-sm btn-ghost" onClick={() => setDraft({ ...draft, imageUrl: "", imagePublicId: "" })}>Remove image</button>}
            </div>
            <input placeholder="…or paste an https image URL" value={draft.imageUrl}
              onChange={(e) => setDraft({ ...draft, imageUrl: e.target.value, imagePublicId: "" })} />
          </div>

          <div className="field">
            <span>Serving options & prices (₹)</span>
            {draft.servingOptions.map((o, i) => (
              <div className="option-row" key={i}>
                <input placeholder="Label, e.g. Half / Full / 1 Pc" value={o.label} onChange={(e) => updateOption(i, { label: e.target.value })} />
                <input type="number" min={0} step="0.01" placeholder="Price" value={o.price} onChange={(e) => updateOption(i, { price: e.target.value })} />
                <label className="check" style={{ fontSize: 12 }}><input type="checkbox" checked={o.isAvailable} onChange={(e) => updateOption(i, { isAvailable: e.target.checked })} /> Available</label>
                <button type="button" className="btn btn-sm btn-danger" aria-label="Remove option"
                  onClick={() => setDraft({ ...draft, servingOptions: draft.servingOptions.filter((_, j) => j !== i) })}>✕</button>
              </div>
            ))}
            <div><button type="button" className="btn btn-sm btn-ghost" onClick={() => setDraft({ ...draft, servingOptions: [...draft.servingOptions, { label: "", price: "", isAvailable: true }] })}>+ Add option</button></div>
          </div>

          <label className="check"><input type="checkbox" checked={draft.isAvailable} onChange={(e) => update("isAvailable", e.target.checked)} /> Available (shown on the public menu)</label>
          <div className="row-actions">
            <button className="btn" disabled={busy || uploading}>{busy ? "Saving…" : "SAVE"}</button>
            <button type="button" className="btn btn-ghost" onClick={() => setDraft(null)}>Cancel</button>
          </div>
        </form>
      ) : (
        <div className="admin-toolbar">
          <label className="field" style={{ gridAutoFlow: "column", alignItems: "center" }}>
            Category
            <select value={filter} onChange={(e) => setFilter(e.target.value)}>
              <option value="">All ({items.length})</option>
              {categories.map((c) => <option key={c.id} value={c.id}>{c.name} ({c.itemCount})</option>)}
            </select>
          </label>
          <button className="btn btn-sm" disabled={categories.length === 0} title={categories.length === 0 ? "Create a category first" : undefined}
            onClick={() => setDraft(emptyDraft(filter || categories[0]?.id || ""))}>+ New menu item</button>
        </div>
      )}

      {categories.length === 0 ? (
        <p className="empty muted">Create a category in the Categories tab before adding menu items.</p>
      ) : visible.length === 0 ? (
        <p className="empty muted">No menu items yet.</p>
      ) : (
        <div className="table-wrap">
          <table className="admin-table">
            <thead><tr><th /><th>Name</th><th>Category</th><th>Prices</th><th>Status</th><th /></tr></thead>
            <tbody>
              {visible.map((item) => (
                <tr key={item.id}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <td>{item.imageUrl ? <img className="thumb" src={item.imageUrl} alt="" /> : <div className="thumb" />}</td>
                  <td><strong>{item.name}</strong><div className="muted" style={{ fontSize: 12 }}>{item.temperature.toLowerCase()}{item.spiceIndex ? ` · spice ${item.spiceIndex}` : ""} · order {item.sortOrder}</div></td>
                  <td>{item.category.name}</td>
                  <td>
                    {item.servingOptions.length === 0 ? <span className="muted">—</span> : item.servingOptions.map((o) => (
                      <div key={o.id} style={o.isAvailable ? undefined : { textDecoration: "line-through", color: "var(--muted)" }}>{o.label}: {formatPrice(o.price)}</div>
                    ))}
                  </td>
                  <td><span className={`badge ${item.isAvailable ? "badge-normal" : "badge-off"}`}>{item.isAvailable ? "Available" : "Unavailable"}</span></td>
                  <td>
                    <div className="row-actions">
                      <button className="btn btn-sm btn-ghost" onClick={() => setDraft(toDraft(item))}>Edit</button>
                      <button className="btn btn-sm btn-ghost" onClick={() => toggle(item)}>{item.isAvailable ? "Mark unavailable" : "Mark available"}</button>
                      <button className="btn btn-sm btn-danger" onClick={() => remove(item)}>Delete</button>
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
