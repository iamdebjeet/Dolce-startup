import { instagramProfileUrl, site } from "@/lib/site";

/** Structured data so search engines know DOLCE is a pure veg Italian café serving Bhubaneswar. */
export default function LocalBusinessJsonLd() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CafeOrCoffeeShop",
    name: "DOLCE",
    description: `100% pure vegetarian Italian café in ${site.city}, ${site.region}, known for handmade tiramisu.`,
    url: site.url,
    telephone: `+${site.whatsappNumber}`,
    servesCuisine: ["Italian", "Desserts"],
    address: { "@type": "PostalAddress", addressLocality: site.city, addressRegion: site.region, addressCountry: "IN" },
    areaServed: { "@type": "City", name: site.city },
    sameAs: [instagramProfileUrl],
  };
  return (
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
  );
}
