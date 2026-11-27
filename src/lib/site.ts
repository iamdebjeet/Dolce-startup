/**
 * Site-wide settings.
 * WhatsApp number: NEXT_PUBLIC_WHATSAPP_NUMBER overrides the default. A 10-digit Indian number gets the 91 country code added.
 */
const DEFAULT_WHATSAPP = "8338027212";

function normaliseWhatsApp(raw: string) {
  const digits = raw.replace(/\D/g, "").replace(/^0+/, "");
  return digits.length === 10 ? `91${digits}` : digits;
}

export const site = {
  name: "DOLCE",
  tagline: "A Little Taste of Italy",
  hindiTagline: "इटली का एक मीठा स्वाद",
  whatsappNumber: normaliseWhatsApp(process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || DEFAULT_WHATSAPP),
  /** Google Form where customers rate & review DOLCE (used by the review QR code and button). */
  reviewFormUrl: "https://docs.google.com/forms/d/e/1FAIpQLScRnKptqMQ6naYkkp2DHPF5QzPyL21212myweUW9n0DdkgNIg/viewform",
};

/** wa.me link that opens a chat with DOLCE's number and a pre-filled message (the customer taps Send). */
export function whatsappLink(message = "Hi DOLCE! I'd like to place an order.") {
  return `https://wa.me/${site.whatsappNumber}?text=${encodeURIComponent(message)}`;
}
