import Link from "next/link";

export default function HomePage() {
  return (
    <main>
      <header className="page-shell" style={{ padding: "28px 0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <Link href="/" style={{ color: "var(--dolce-burgundy)", fontSize: 30, letterSpacing: ".16em", fontWeight: 700 }}>DOLCE</Link>
        <nav style={{ display: "flex", gap: 22, fontFamily: "Arial, sans-serif", fontSize: 14 }}>
          <Link href="/about">About</Link>
          <Link href="/menu">Menu</Link>
          <Link href="/reviews">Reviews</Link>
          <Link href="/contact">Contact</Link>
        </nav>
      </header>
      <section className="page-shell" style={{ padding: "100px 0 120px", textAlign: "center" }}>
        <p className="eyebrow">Italian taste · Indian heart</p>
        <h1 style={{ color: "var(--dolce-burgundy)", fontSize: "clamp(48px, 9vw, 88px)", fontWeight: 500, margin: "18px 0" }}>A Little Taste<br />of Italy</h1>
        <p style={{ maxWidth: 560, margin: "0 auto", font: "17px/1.8 Arial, sans-serif", color: "#625b54" }}>
          A warm place for desserts, food, tea and coffee. Discover the DOLCE experience.
        </p>
        <Link href="/menu" style={{ display: "inline-block", marginTop: 32, background: "var(--dolce-burgundy)", color: "white", padding: "14px 28px", font: "14px Arial, sans-serif", letterSpacing: ".08em" }}>EXPLORE MENU</Link>
      </section>
      <footer className="page-shell" style={{ borderTop: "1px solid #dfd5c6", padding: "24px 0", color: "#766d63", font: "12px Arial, sans-serif" }}>
        © {new Date().getFullYear()} DOLCE
      </footer>
    </main>
  );
}
