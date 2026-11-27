import type { Metadata, Viewport } from "next";
import { DM_Sans, Great_Vibes, Playfair_Display, Tiro_Devanagari_Hindi } from "next/font/google";
import "./globals.css";
import { site } from "@/lib/site";

const display = Playfair_Display({ subsets: ["latin"], style: ["normal", "italic"], variable: "--font-display", display: "swap" });
const sans = DM_Sans({ subsets: ["latin"], variable: "--font-sans", display: "swap" });
const hindi = Tiro_Devanagari_Hindi({ subsets: ["devanagari", "latin"], weight: "400", variable: "--font-hindi", display: "swap" });
const script = Great_Vibes({ subsets: ["latin"], weight: "400", variable: "--font-script", display: "swap" });

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: `DOLCE | Pure Veg Italian Café & Tiramisu in ${site.city}`,
  description: `DOLCE is a 100% pure veg Italian café in ${site.city}, ${site.region}. Handmade Classic, Chocolate and High-Protein Tiramisu — delivery across ${site.city} or pickup. Order on WhatsApp or Instagram.`,
  keywords: [`tiramisu ${site.city}`, `Italian desserts ${site.city}`, `pure veg café ${site.city}`, "DOLCE tiramisu"],
  alternates: { canonical: "/" },
  openGraph: {
    title: `DOLCE | A Little Taste of Italy in ${site.city}`,
    description: `Pure veg Italian café in ${site.city}. Handmade tiramisu — delivery across ${site.city} or pickup.`,
    type: "website",
    locale: "en_IN",
    siteName: "DOLCE",
  },
};

// "only light": the design is light-only, so browsers must not auto-darken it
// (Chrome's forced dark mode was inverting colours and making the review QR unscannable).
export const viewport: Viewport = { themeColor: "#6B1E2E", colorScheme: "only light" };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${display.variable} ${sans.variable} ${hindi.variable} ${script.variable}`} suppressHydrationWarning>
      <head>
        {/* Enables scroll-reveal styles only when JS runs, so content is never hidden without JS. */}
        <script dangerouslySetInnerHTML={{ __html: "document.documentElement.classList.add('js')" }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
