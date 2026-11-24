import type { Metadata, Viewport } from "next";
import { DM_Sans, Playfair_Display, Tiro_Devanagari_Hindi } from "next/font/google";
import "./globals.css";

const display = Playfair_Display({ subsets: ["latin"], style: ["normal", "italic"], variable: "--font-display", display: "swap" });
const sans = DM_Sans({ subsets: ["latin"], variable: "--font-sans", display: "swap" });
const hindi = Tiro_Devanagari_Hindi({ subsets: ["devanagari", "latin"], weight: "400", variable: "--font-hindi", display: "swap" });

export const metadata: Metadata = {
  title: "DOLCE | A Little Taste of Italy — Italian Café in India",
  description: "DOLCE is an Italian café in India. Handmade Classic, Chocolate and High-Protein Tiramisu — order on WhatsApp.",
  openGraph: {
    title: "DOLCE | A Little Taste of Italy",
    description: "Handmade Classic, Chocolate and High-Protein Tiramisu. Order on WhatsApp.",
    type: "website",
  },
};

export const viewport: Viewport = { themeColor: "#6B1E2E" };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${display.variable} ${sans.variable} ${hindi.variable}`} suppressHydrationWarning>
      <head>
        {/* Enables scroll-reveal styles only when JS runs, so content is never hidden without JS. */}
        <script dangerouslySetInnerHTML={{ __html: "document.documentElement.classList.add('js')" }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
