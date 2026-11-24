import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function MenuPage() {
  let categories: Awaited<ReturnType<typeof prisma.category.findMany>> = [];

  try {
    categories = await prisma.category.findMany({
      where: { isActive: true, menuItems: { some: { isAvailable: true } } },
      orderBy: { sortOrder: "asc" },
    });
  } catch {
    // The database is not connected until DATABASE_URL and migrations are configured.
  }

  return (
    <main className="page-shell" style={{ padding: "64px 0" }}>
      <p className="eyebrow">Discover DOLCE</p>
      <h1 style={{ color: "var(--dolce-burgundy)", fontSize: 54, fontWeight: 500 }}>Our Menu</h1>
      {categories.length === 0 ? (
        <section style={{ border: "1px solid #dfd5c6", padding: 36, marginTop: 28, textAlign: "center" }}>
          <h2 style={{ fontSize: 26, fontWeight: 500 }}>Our menu is being prepared.</h2>
          <p style={{ font: "15px/1.7 Arial, sans-serif", color: "#766d63" }}>Check back soon for the latest DOLCE offerings.</p>
        </section>
      ) : (
        <p style={{ fontFamily: "Arial, sans-serif" }}>Menu categories are ready. Menu item cards will be added in the next implementation phase.</p>
      )}
    </main>
  );
}
