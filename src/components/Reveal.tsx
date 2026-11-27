"use client";

import { useEffect } from "react";

/**
 * Adds `.is-in` to every `.reveal` element as it scrolls into view (CSS handles the animation).
 * Content is visible without JS: the hidden state only applies once `html.js` is set in the layout.
 * Also watches for `.reveal` elements added later — e.g. the menu section, which streams in after
 * the rest of the page — so they don't stay invisible.
 */
export default function Reveal() {
  useEffect(() => {
    const reveal = (el: Element) => el.classList.add("is-in");

    if (!("IntersectionObserver" in window)) {
      const showAll = () => document.querySelectorAll(".reveal:not(.is-in)").forEach(reveal);
      showAll();
      const mo = new MutationObserver(showAll);
      mo.observe(document.body, { childList: true, subtree: true });
      return () => mo.disconnect();
    }

    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            reveal(entry.target);
            io.unobserve(entry.target);
          }
        }
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.12 },
    );
    const watched = new WeakSet<Element>();
    const watchNew = () => {
      document.querySelectorAll(".reveal:not(.is-in)").forEach((el) => {
        if (watched.has(el)) return;
        watched.add(el);
        io.observe(el);
      });
    };

    watchNew();
    const mo = new MutationObserver(watchNew);
    mo.observe(document.body, { childList: true, subtree: true });
    return () => {
      mo.disconnect();
      io.disconnect();
    };
  }, []);
  return null;
}
