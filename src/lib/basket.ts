"use client";

import { useSyncExternalStore } from "react";

/** Basket = { "<menuItemId>::<servingOptionId or ->": quantity }. Persisted in localStorage, synced across tabs. */
export type Basket = Record<string, number>;

const KEY = "dolce-basket-v1";
const EMPTY: Basket = {};
const MAX_QTY = 50;
let cache: Basket | null = null;
const listeners = new Set<() => void>();

export const basketKey = (itemId: string, optionId: string | null) => `${itemId}::${optionId ?? "-"}`;

function read(): Basket {
  if (cache) return cache;
  try {
    const parsed: unknown = JSON.parse(localStorage.getItem(KEY) ?? "{}");
    cache = {};
    if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
      for (const [k, v] of Object.entries(parsed)) {
        if (typeof v === "number" && Number.isInteger(v) && v > 0) cache[k] = Math.min(v, MAX_QTY);
      }
    }
  } catch {
    cache = {};
  }
  return cache;
}

function write(next: Basket) {
  cache = next;
  try {
    localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    // Storage unavailable (private mode): basket still works for this page view.
  }
  listeners.forEach((l) => l());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  const onStorage = (e: StorageEvent) => {
    if (e.key === KEY) {
      cache = null;
      listener();
    }
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", onStorage);
  };
}

export function useBasket() {
  const basket = useSyncExternalStore(subscribe, read, () => EMPTY);
  return {
    basket,
    setQty(key: string, qty: number) {
      const next = { ...read() };
      if (qty <= 0) delete next[key];
      else next[key] = Math.min(qty, MAX_QTY);
      write(next);
    },
    clear() {
      write({});
    },
  };
}
