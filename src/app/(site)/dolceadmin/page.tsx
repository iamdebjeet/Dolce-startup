import type { Metadata } from "next";
import AdminApp from "./AdminApp";

export const metadata: Metadata = { title: "DOLCE Admin", robots: { index: false, follow: false } };

export default function AdminPage() {
  return (
    <main className="page-shell page">
      <p className="eyebrow">Management portal</p>
      <h1 className="page-title">DOLCE Admin</h1>
      <AdminApp />
    </main>
  );
}
