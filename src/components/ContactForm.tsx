"use client";

import { useState } from "react";
import { api } from "@/lib/client";

export default function ContactForm() {
  const [status, setStatus] = useState<{ ok: boolean; message: string } | null>(null);
  const [sending, setSending] = useState(false);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    setSending(true);
    setStatus(null);
    try {
      const result = await api<{ message: string }>("/api/contact", { method: "POST", json: Object.fromEntries(new FormData(form)) });
      setStatus({ ok: true, message: result.message });
      form.reset();
    } catch (error) {
      setStatus({ ok: false, message: (error as Error).message });
    } finally {
      setSending(false);
    }
  }

  return (
    <form className="form" onSubmit={submit}>
      <div className="form-row">
        <label className="field">Name<input name="name" required maxLength={100} autoComplete="name" /></label>
        <label className="field">Phone (optional)<input name="phone" type="tel" maxLength={30} autoComplete="tel" /></label>
      </div>
      <label className="field">Email<input name="email" type="email" required maxLength={200} autoComplete="email" /></label>
      <label className="field">Message<textarea name="message" required maxLength={5000} /></label>
      {status && <p className={`notice${status.ok ? "" : " error"}`} role="status">{status.message}</p>}
      <div><button className="btn" disabled={sending}>{sending ? "Sending…" : "SEND MESSAGE"}</button></div>
    </form>
  );
}
