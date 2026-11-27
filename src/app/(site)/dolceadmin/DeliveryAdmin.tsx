"use client";

import { useCallback, useEffect, useState } from "react";
import { api } from "@/lib/client";
import { describeCharges, type ChargeMode, type DeliverySettingsDTO } from "@/lib/delivery";
import { formatRupees } from "@/lib/money";
import type { SectionProps } from "./AdminApp";

type Draft = { chargeMode: ChargeMode; fixedFee: string; perKmRate: string; minimumCharge: string; freeAbove: string; pickupEnabled: boolean };

const toDraft = (s: DeliverySettingsDTO): Draft => ({
  chargeMode: s.chargeMode,
  fixedFee: s.fixedFee?.toString() ?? "",
  perKmRate: s.perKmRate?.toString() ?? "",
  minimumCharge: s.minimumCharge?.toString() ?? "",
  freeAbove: s.freeAbove?.toString() ?? "",
  pickupEnabled: s.pickupEnabled,
});
const n = (v: string) => (v.trim() === "" ? null : Number(v));
const toSettings = (d: Draft): DeliverySettingsDTO => ({
  chargeMode: d.chargeMode, fixedFee: n(d.fixedFee), perKmRate: n(d.perKmRate), minimumCharge: n(d.minimumCharge), freeAbove: n(d.freeAbove), pickupEnabled: d.pickupEnabled,
});

const MODES: { value: ChargeMode; title: string; text: string }[] = [
  { value: "unset", title: "Not decided yet", text: "Customers see “delivery charges depend on your location — confirmed in the chat”." },
  { value: "fixed", title: "Fixed charge for the whole city", text: "One delivery charge anywhere in Bhubaneswar. The basket adds it to the total." },
  { value: "per_km", title: "Charge per km", text: "A rate per km (optional minimum). The basket shows the rate; you confirm the exact charge in the chat." },
];

export default function DeliveryAdmin({ onError }: SectionProps) {
  const [draft, setDraft] = useState<Draft | null>(null);
  const [saved, setSaved] = useState(false);
  const [busy, setBusy] = useState(false);

  const load = useCallback(
    () => api<DeliverySettingsDTO>("/api/admin/settings/delivery").then((s) => setDraft(toDraft(s))).catch(onError),
    [onError],
  );
  useEffect(() => { load(); }, [load]);

  if (!draft) return <p className="muted">Loading…</p>;
  const set = (patch: Partial<Draft>) => { setSaved(false); setDraft({ ...draft, ...patch }); };
  const preview = toSettings(draft);

  async function save(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    try {
      const s = await api<DeliverySettingsDTO>("/api/admin/settings/delivery", { method: "PUT", json: toSettings(draft!) });
      setDraft(toDraft(s));
      setSaved(true);
    } catch (err) { onError(err); } finally { setBusy(false); }
  }

  return (
    <form className="panel form" style={{ maxWidth: 720 }} onSubmit={save}>
      <h3>Delivery &amp; pickup</h3>
      <p className="muted" style={{ margin: 0 }}>Changes apply to the website and the basket immediately — no deploy needed.</p>

      <fieldset style={{ border: 0, padding: 0, margin: 0, display: "grid", fontSize: 14 }}>
        <legend style={{ marginBottom: 8, fontWeight: 600 }}>Delivery charge</legend>
        {MODES.map((m) => (
          <label key={m.value} className="check" style={{ alignItems: "flex-start", padding: "10px 12px", border: "1px solid var(--line)", borderRadius: 12, background: draft.chargeMode === m.value ? "#fdf0dc" : "#fff", marginBottom: 8 }}>
            <input type="radio" name="chargeMode" checked={draft.chargeMode === m.value} onChange={() => set({ chargeMode: m.value })} style={{ marginTop: 3 }} />
            <span><strong>{m.title}</strong><br /><span className="muted" style={{ fontSize: 13 }}>{m.text}</span></span>
          </label>
        ))}
      </fieldset>

      {draft.chargeMode === "fixed" && (
        <label className="field">Delivery charge for the whole city (₹)
          <input type="number" min={0} step="0.01" required value={draft.fixedFee} onChange={(e) => set({ fixedFee: e.target.value })} placeholder="e.g. 40 (0 = always free)" />
        </label>
      )}
      {draft.chargeMode === "per_km" && (
        <div className="form-row">
          <label className="field">Charge per km (₹)
            <input type="number" min={0} step="0.01" required value={draft.perKmRate} onChange={(e) => set({ perKmRate: e.target.value })} placeholder="e.g. 10" />
          </label>
          <label className="field">Minimum charge (₹, optional)
            <input type="number" min={0} step="0.01" value={draft.minimumCharge} onChange={(e) => set({ minimumCharge: e.target.value })} placeholder="e.g. 30" />
          </label>
        </div>
      )}

      <label className="field">Free delivery for orders of (₹, optional)
        <input type="number" min={0} step="0.01" value={draft.freeAbove} onChange={(e) => set({ freeAbove: e.target.value })} placeholder="Leave empty for no free-delivery offer" />
      </label>

      <label className="check">
        <input type="checkbox" checked={draft.pickupEnabled} onChange={(e) => set({ pickupEnabled: e.target.checked })} />
        Offer pickup (you share the pickup address in the chat)
      </label>

      <div className="notice">
        <strong>Customers will see:</strong> {describeCharges(preview)}
        {preview.freeAbove !== null && <> Free delivery on orders of {formatRupees(preview.freeAbove)} or more.</>}
        {preview.pickupEnabled ? " Pickup available." : " Delivery only."}
      </div>

      <div className="row-actions" style={{ alignItems: "center" }}>
        <button className="btn" disabled={busy}>{busy ? "Saving…" : "SAVE"}</button>
        {saved && <span className="muted" role="status">Saved ✓</span>}
      </div>
    </form>
  );
}
