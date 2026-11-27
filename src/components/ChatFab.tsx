"use client";

import { useEffect, useRef, useState } from "react";
import { Icon } from "./icons";
import { instagramDmUrl, whatsappLink } from "@/lib/site";

/** Floating "chat with us" button that opens a WhatsApp / Instagram choice. */
export default function ChatFab() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => { if (!ref.current?.contains(e.target as Node)) setOpen(false); };
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    document.addEventListener("mousedown", onDown);
    window.addEventListener("keydown", onKey);
    return () => { document.removeEventListener("mousedown", onDown); window.removeEventListener("keydown", onKey); };
  }, [open]);

  return (
    <div className={`lp-fab-wrap${open ? " is-open" : ""}`} ref={ref}>
      <div className="lp-fab-menu" id="chat-menu" hidden={!open}>
        <p>Chat with DOLCE</p>
        <a className="lp-fab-opt lp-fab-opt--wa" href={whatsappLink("Hi DOLCE! I have a question.")} target="_blank" rel="noopener noreferrer" onClick={() => setOpen(false)}>
          <Icon name="whatsapp" size={20} /> WhatsApp
        </a>
        <a className="lp-fab-opt lp-fab-opt--ig" href={instagramDmUrl} target="_blank" rel="noopener noreferrer" onClick={() => setOpen(false)}>
          <Icon name="instagram" size={20} /> Instagram
        </a>
      </div>
      <button type="button" className="lp-fab" aria-expanded={open} aria-controls="chat-menu"
        aria-label={open ? "Close chat options" : "Chat with DOLCE on WhatsApp or Instagram"} onClick={() => setOpen(!open)}>
        <Icon name={open ? "close" : "chat"} size={26} />
      </button>
    </div>
  );
}
