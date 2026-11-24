import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "DOLCE | A Little Taste of Italy",
  description: "DOLCE — Italian-inspired desserts, food and beverages.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
