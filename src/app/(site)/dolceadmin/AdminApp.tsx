"use client";

import { useCallback, useEffect, useState } from "react";
import { api } from "@/lib/client";
import MenuAdmin from "./MenuAdmin";
import CategoriesAdmin from "./CategoriesAdmin";
import ReviewsAdmin from "./ReviewsAdmin";
import InquiriesAdmin from "./InquiriesAdmin";

const TABS = [
  { key: "menu", label: "Menu items" },
  { key: "categories", label: "Categories" },
  { key: "reviews", label: "Reviews" },
  { key: "inquiries", label: "Inquiries" },
] as const;
type Tab = (typeof TABS)[number]["key"];

/** Props every admin section gets. `onError` handles expired sessions centrally. */
export type SectionProps = { onError: (error: unknown) => void };

export default function AdminApp() {
  const [authenticated, setAuthenticated] = useState<boolean | null>(null);
  const [tab, setTab] = useState<Tab>("menu");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api<{ authenticated: boolean }>("/api/admin/session")
      .then((s) => setAuthenticated(s.authenticated))
      .catch(() => setAuthenticated(false));
  }, []);

  const onError = useCallback((err: unknown) => {
    if ((err as { status?: number }).status === 401) {
      setAuthenticated(false);
      setError("Your session has expired. Please sign in again.");
    } else {
      setError((err as Error).message);
    }
  }, []);

  async function logout() {
    await api("/api/admin/logout", { method: "POST" }).catch(() => undefined);
    setAuthenticated(false);
  }

  if (authenticated === null) return <p className="muted">Loading…</p>;
  if (!authenticated) return <LoginForm initialError={error} onSuccess={() => { setError(null); setAuthenticated(true); }} />;

  return (
    <div>
      <div className="admin-toolbar" style={{ marginBottom: 0 }}>
        <nav className="admin-tabs" style={{ flex: 1, margin: 0 }}>
          {TABS.map((t) => (
            <button key={t.key} className={tab === t.key ? "active" : ""} onClick={() => { setError(null); setTab(t.key); }}>{t.label}</button>
          ))}
        </nav>
        <button className="btn btn-ghost btn-sm" onClick={logout}>Sign out</button>
      </div>
      <div style={{ marginTop: 28 }}>
        {error && <p className="notice error" role="alert">{error} <button className="btn btn-sm btn-ghost" onClick={() => setError(null)}>Dismiss</button></p>}
        {tab === "menu" && <MenuAdmin onError={onError} />}
        {tab === "categories" && <CategoriesAdmin onError={onError} />}
        {tab === "reviews" && <ReviewsAdmin onError={onError} />}
        {tab === "inquiries" && <InquiriesAdmin onError={onError} />}
      </div>
    </div>
  );
}

function LoginForm({ onSuccess, initialError }: { onSuccess: () => void; initialError: string | null }) {
  const [error, setError] = useState(initialError);
  const [busy, setBusy] = useState(false);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    setBusy(true);
    setError(null);
    try {
      await api("/api/admin/login", { method: "POST", json: { email: data.get("email"), password: data.get("password") } });
      onSuccess();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <form className="form panel" onSubmit={submit} style={{ maxWidth: 420 }}>
      <h3>Sign in</h3>
      <label className="field">Email<input name="email" type="email" required autoComplete="username" /></label>
      <label className="field">Password<input name="password" type="password" required autoComplete="current-password" /></label>
      {error && <p className="notice error" role="alert">{error}</p>}
      <div><button className="btn" disabled={busy}>{busy ? "Signing in…" : "SIGN IN"}</button></div>
    </form>
  );
}
