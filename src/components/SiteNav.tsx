"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Icon } from "./icons";

const LINKS = [
  { id: "story", label: "Our Story" },
  { id: "tiramisu", label: "Tiramisu" },
  { id: "menu", label: "Menu" },
  { id: "order", label: "How to Order" },
  { id: "gallery", label: "Gallery" },
  { id: "reviews", label: "Reviews" },
  { id: "contact", label: "Contact" },
];

/** `onHome` = true on the one-page site (plain #anchors + scroll-spy); false elsewhere (links go to /#section). */
export default function SiteNav({ onHome = false }: { onHome?: boolean }) {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [active, setActive] = useState<string | null>(null);

  useEffect(() => {
    let frame = 0;
    const update = () => {
      frame = 0;
      setScrolled(window.scrollY > 24);
      if (!onHome) return;
      // Current section = the last nav section whose top has passed 40% of the viewport, as long as
      // that section is still on screen (sections without a nav link in between clear the highlight).
      const line = window.innerHeight * 0.4;
      let current: string | null = null;
      for (const { id } of LINKS) {
        const el = document.getElementById(id);
        if (!el) continue;
        const rect = el.getBoundingClientRect();
        if (rect.top <= line) current = rect.bottom > line ? id : null;
      }
      setActive(current);
    };
    const onScroll = () => { if (!frame) frame = requestAnimationFrame(update); };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [onHome]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  const href = (id: string) => (onHome ? `#${id}` : `/#${id}`);

  return (
    <header className={`lp-nav${scrolled ? " is-scrolled" : ""}`}>
      <div className="lp-awning" aria-hidden="true" />
      <div className="lp-nav-inner lp-shell">
        <Link href={onHome ? "#home" : "/"} className="lp-logo" onClick={() => setOpen(false)}>
          <span>DOLCE</span>
          <small>Italian Café · India</small>
        </Link>

        <nav className={`lp-nav-links${open ? " is-open" : ""}`} aria-label="Main">
          {LINKS.map((l) => (
            <a key={l.id} href={href(l.id)} className={active === l.id ? "is-active" : ""} onClick={() => setOpen(false)}>
              {l.label}
            </a>
          ))}
          <a className="lp-btn lp-btn--primary lp-nav-cta" href={href("menu")} onClick={() => setOpen(false)}>
            Order Now <Icon name="arrow" size={18} />
          </a>
        </nav>

        <button className="lp-burger" aria-label={open ? "Close menu" : "Open menu"} aria-expanded={open} onClick={() => setOpen(!open)}>
          <Icon name={open ? "close" : "menu"} size={26} />
        </button>
      </div>
    </header>
  );
}
