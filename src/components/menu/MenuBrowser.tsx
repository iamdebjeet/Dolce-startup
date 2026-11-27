"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { getPublicMenu, MenuItemDTO } from "@/lib/data";
import { basketKey, useBasket } from "@/lib/basket";
import { buildOrderMessage, formatRupees, orderTotals, type OrderLine } from "@/lib/order";
import { whatsappLink } from "@/lib/site";
import { Icon } from "../icons";
import { VegMark } from "../decor";

type Menu = Awaited<ReturnType<typeof getPublicMenu>>;
type Entry = { item: MenuItemDTO; optionId: string | null; option: string | null; price: number | null };

const TEMPERATURE = { HOT: "Hot", NORMAL: "Room temp", CHILLED: "Chilled" } as const;

/** Each orderable row of an item: its serving options, or one "price on request" row if it has none. */
function rowsFor(item: MenuItemDTO): Entry[] {
  return item.servingOptions.length
    ? item.servingOptions.map((o) => ({ item, optionId: o.id, option: o.label, price: o.price }))
    : [{ item, optionId: null, option: null, price: null }];
}

function Stepper({ qty, onChange, label }: { qty: number; onChange: (q: number) => void; label: string }) {
  if (qty === 0) {
    return (
      <button type="button" className="mn-add" onClick={() => onChange(1)} aria-label={`Add ${label}`}>
        Add <span aria-hidden="true">+</span>
      </button>
    );
  }
  return (
    <div className="mn-stepper" role="group" aria-label={`Quantity of ${label}`}>
      <button type="button" onClick={() => onChange(qty - 1)} aria-label={`Remove one ${label}`}>−</button>
      <output aria-live="polite">{qty}</output>
      <button type="button" onClick={() => onChange(qty + 1)} aria-label={`Add one more ${label}`}>+</button>
    </div>
  );
}

export default function MenuBrowser({ menu }: { menu: Menu }) {
  const { basket, setQty, clear } = useBasket();
  const [tab, setTab] = useState<string>("all");
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [note, setNote] = useState("");
  const [sent, setSent] = useState(false);
  const closeRef = useRef<HTMLButtonElement>(null);

  // Every orderable entry, keyed like the basket. Stale basket keys (item removed by admin) are simply ignored.
  const entries = useMemo(() => {
    const map = new Map<string, Entry>();
    for (const c of menu) for (const item of c.items) for (const e of rowsFor(item)) map.set(basketKey(item.id, e.optionId), e);
    return map;
  }, [menu]);

  const lines = useMemo(() => {
    const out: (OrderLine & { key: string; image: string | null })[] = [];
    for (const [key, qty] of Object.entries(basket)) {
      const e = entries.get(key);
      if (e && qty > 0) out.push({ key, name: e.item.name, option: e.option, unitPrice: e.price, qty, image: e.item.imageUrl });
    }
    return out;
  }, [basket, entries]);

  const { count, total, hasUnpriced } = orderTotals(lines);
  const message = buildOrderMessage(lines, { name, note });
  const visible = tab === "all" ? menu : menu.filter((c) => c.id === tab);

  // Lift the floating WhatsApp button above the basket bar; lock page scroll while the drawer is open.
  useEffect(() => {
    document.body.classList.toggle("has-basket", count > 0);
    return () => document.body.classList.remove("has-basket");
  }, [count]);
  useEffect(() => {
    if (!open) return;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    window.addEventListener("keydown", onKey);
    return () => { document.body.style.overflow = ""; window.removeEventListener("keydown", onKey); };
  }, [open]);

  function closeDrawer() {
    setOpen(false);
    setSent(false);
  }

  return (
    <div className="mn-browser">
      {menu.length > 1 && (
        <div className="mn-tabs" role="tablist" aria-label="Menu categories">
          {[{ id: "all", name: "All" }, ...menu].map((c) => (
            <button key={c.id} role="tab" aria-selected={tab === c.id} className={tab === c.id ? "is-active" : ""} onClick={() => setTab(c.id)}>
              {c.name}
              {c.id !== "all" && <span>{"items" in c ? c.items.length : ""}</span>}
            </button>
          ))}
        </div>
      )}

      {visible.map((category) => (
        <div key={category.id} className="mn-category">
          <div className="mn-category-head">
            <h3>{category.name}</h3>
            {category.description && <p>{category.description}</p>}
          </div>
          <div className="mn-grid">
            {category.items.map((item) => (
              <article key={item.id} className="mn-card">
                {item.imageUrl ? (
                  <div className="mn-card-img">
                    {/* Admin-provided image URL (Cloudinary or any https host), so a plain <img>. */}
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={item.imageUrl} alt={item.name} loading="lazy" />
                  </div>
                ) : (
                  <div className="mn-card-img mn-card-img--empty" aria-hidden="true"><Icon name="cup" size={34} /></div>
                )}
                <div className="mn-card-body">
                  <div className="mn-card-title">
                    <h4><VegMark size={16} className="mn-veg" /> {item.name}</h4>
                    <div className="mn-tags">
                      <span className={`mn-tag mn-tag--${item.temperature.toLowerCase()}`}>{TEMPERATURE[item.temperature]}</span>
                      {item.spiceIndex > 0 && (
                        <span className="mn-tag mn-tag--spice" title={`Spice level ${item.spiceIndex} of 3`}>
                          {"🌶".repeat(item.spiceIndex)}<span className="sr-only"> spice level {item.spiceIndex} of 3</span>
                        </span>
                      )}
                    </div>
                  </div>
                  <p className="mn-desc">{item.description}</p>
                  <ul className="mn-options">
                    {rowsFor(item).map((e) => {
                      const key = basketKey(item.id, e.optionId);
                      const label = e.option ? `${item.name} (${e.option})` : item.name;
                      return (
                        <li key={key} className={basket[key] ? "is-picked" : ""}>
                          <span className="mn-opt-label">{e.option ?? "Regular"}</span>
                          <span className="mn-opt-price">{e.price === null ? "On request" : formatRupees(e.price)}</span>
                          <Stepper qty={basket[key] ?? 0} label={label} onChange={(q) => setQty(key, q)} />
                        </li>
                      );
                    })}
                  </ul>
                </div>
              </article>
            ))}
          </div>
        </div>
      ))}

      {/* Sticky basket bar */}
      <div className={`mn-bar${count > 0 && !open ? " is-visible" : ""}`} aria-hidden={count === 0 || open}>
        <div className="mn-bar-info">
          <span className="mn-bar-count">{count}</span>
          <div>
            <strong>{count} item{count === 1 ? "" : "s"} in your basket</strong>
            <span>{formatRupees(total)}{hasUnpriced ? " + on request" : ""}</span>
          </div>
        </div>
        <button type="button" className="lp-btn lp-btn--wa" onClick={() => setOpen(true)} tabIndex={count === 0 || open ? -1 : 0}>
          <Icon name="whatsapp" size={18} /> Order Now
        </button>
      </div>

      {/* Basket drawer */}
      {open && (
        <div className="mn-drawer-wrap">
          <button className="mn-overlay" aria-label="Close basket" onClick={closeDrawer} tabIndex={-1} />
          <aside className="mn-drawer" role="dialog" aria-modal="true" aria-labelledby="mn-drawer-title">
            <header className="mn-drawer-head">
              <h3 id="mn-drawer-title">Your order</h3>
              <button ref={closeRef} className="mn-close" onClick={closeDrawer} aria-label="Close basket"><Icon name="close" size={22} /></button>
            </header>

            {lines.length === 0 ? (
              <p className="mn-drawer-empty">Your basket is empty. Add something sweet from the menu!</p>
            ) : (
              <>
                <ul className="mn-lines">
                  {lines.map((l) => (
                    <li key={l.key}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      {l.image ? <img src={l.image} alt="" /> : <span className="mn-line-ph"><Icon name="cup" size={18} /></span>}
                      <div className="mn-line-info">
                        <strong>{l.name}</strong>
                        <span>{l.option ?? "Regular"} · {l.unitPrice === null ? "price on request" : formatRupees(l.unitPrice)}</span>
                      </div>
                      <Stepper qty={l.qty} label={l.option ? `${l.name} (${l.option})` : l.name} onChange={(q) => setQty(l.key, q)} />
                    </li>
                  ))}
                </ul>

                <div className="mn-total">
                  <span>Total</span>
                  <strong>{formatRupees(total)}{hasUnpriced && <small> + items on request</small>}</strong>
                </div>

                <div className="mn-details">
                  <label className="field">Your name (optional)
                    <input value={name} onChange={(e) => setName(e.target.value)} maxLength={80} autoComplete="name" />
                  </label>
                  <label className="field">Note — date &amp; time, pickup or delivery, requests (optional)
                    <textarea value={note} onChange={(e) => setNote(e.target.value)} maxLength={500} rows={3} />
                  </label>
                </div>

                <details className="mn-preview">
                  <summary>Preview WhatsApp message</summary>
                  <pre>{message}</pre>
                </details>

                {sent ? (
                  <div className="mn-sent" role="status">
                    <p><Icon name="check" size={18} /><span>WhatsApp opened with your order — just tap <strong>Send</strong> there.</span></p>
                    <div className="mn-sent-actions">
                      <a className="lp-link" href={whatsappLink(message)} target="_blank" rel="noopener noreferrer">Open WhatsApp again</a>
                      <button type="button" className="lp-btn lp-btn--ghost lp-btn--sm" onClick={() => { clear(); setNote(""); closeDrawer(); }}>Done — clear basket</button>
                    </div>
                  </div>
                ) : (
                  <a className="lp-btn lp-btn--wa lp-btn--lg lp-btn--block" href={whatsappLink(message)} target="_blank" rel="noopener noreferrer"
                    onClick={() => setSent(true)}>
                    <Icon name="whatsapp" /> Send order on WhatsApp
                  </a>
                )}
                <p className="mn-fine">Prices are per the current menu. We’ll confirm availability and the final total on WhatsApp.</p>
              </>
            )}
          </aside>
        </div>
      )}
    </div>
  );
}
