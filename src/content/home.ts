/**
 * Landing page copy. Edit text here — the page layout picks it up automatically.
 */
import type { StaticImageData } from "next/image";
import tiramisuPlate from "@/assets/images/tiramisu-plate.jpg";
import chocolateCups from "@/assets/images/chocolate-cups.jpg";
import tiramisuBerry from "@/assets/images/tiramisu-berry.jpg";
import tiramisuTray from "@/assets/images/tiramisu-tray.jpg";
import chocolateGlasses from "@/assets/images/chocolate-glasses.jpg";
import cardamom from "@/assets/images/cardamom.jpg";
import masala from "@/assets/images/masala.jpg";
import marigold2 from "@/assets/images/marigold-2.jpg";
import cafe2 from "@/assets/images/cafe-2.jpg";
import cappuccino from "@/assets/images/cappuccino.jpg";
import amalfi from "@/assets/images/amalfi.jpg";
import lemons from "@/assets/images/lemons.jpg";
import tiramisuSlice from "@/assets/images/tiramisu-slice.jpg";

export type IconName =
  | "heart" | "target" | "eye" | "leaf" | "sparkle" | "hand" | "dumbbell" | "cup" | "whatsapp"
  | "chat" | "check" | "gift" | "star" | "clock";

export const signatureItems: {
  id: string;
  italian: string;
  name: string;
  tagline: string;
  description: string;
  notes: string[];
  badge?: string;
  icon: IconName;
  image: StaticImageData;
  accent: string;
}[] = [
  {
    id: "classic",
    italian: "Classico",
    name: "Classic Tiramisu",
    tagline: "The one that started it all",
    description:
      "Coffee-soaked ladyfingers layered with silky mascarpone cream and finished with a generous dusting of cocoa. Light, creamy and true to the Italian original.",
    notes: ["Espresso", "Mascarpone", "Cocoa"],
    badge: "The original",
    icon: "cup",
    image: tiramisuPlate,
    accent: "var(--terracotta)",
  },
  {
    id: "chocolate",
    italian: "Al Cioccolato",
    name: "Chocolate Tiramisu",
    tagline: "Our bestseller — for chocolate lovers",
    description:
      "Our classic, made deeper and richer with layers of chocolate in every spoonful. Indulgent without being too sweet — perfect for celebrations.",
    notes: ["Dark chocolate", "Coffee", "Cream"],
    badge: "Bestseller",
    icon: "heart",
    image: chocolateCups,
    accent: "var(--vino)",
  },
  {
    id: "protein",
    italian: "Proteico",
    name: "High-Protein Tiramisu",
    tagline: "Indulgence that fits your goals",
    description:
      "Our lighter, protein-rich take on tiramisu for anyone who loves dessert and an active lifestyle. All the comfort of the classic, made to fit your day.",
    notes: ["Protein-rich", "Lighter", "Post-workout treat"],
    badge: "New",
    icon: "dumbbell",
    image: tiramisuBerry,
    accent: "var(--basil)",
  },
];

export const purpose: { title: string; hindi: string; text: string; icon: IconName }[] = [
  {
    title: "Our Motive",
    hindi: "हमारा मकसद",
    text: "To bring the warmth of a little Italian café to India — a place where every spoonful feels like a small holiday, and dessert is something you share.",
    icon: "heart",
  },
  {
    title: "Our Mission",
    hindi: "हमारा मिशन",
    text: "To handcraft authentic Italian desserts with quality ingredients, serve them with true Indian hospitality, and make ordering as easy as sending a WhatsApp message.",
    icon: "target",
  },
  {
    title: "Our Vision",
    hindi: "हमारा सपना",
    text: "To become India’s favourite home for tiramisu — and grow into a café where Italy and India share the same table, one dolce at a time.",
    icon: "eye",
  },
];

export const values: { title: string; text: string; icon: IconName }[] = [
  { title: "Fatto a mano", text: "Handmade in small batches, never mass-produced.", icon: "hand" },
  { title: "Fresh, always", text: "Made to order so it reaches you at its best.", icon: "clock" },
  { title: "Atithi Devo Bhava", text: "Every customer is a guest — and guests are treated with love.", icon: "sparkle" },
  { title: "100% Pure Veg", text: "A pure vegetarian café — everything we make and serve is vegetarian.", icon: "leaf" },
];

export const orderSteps: { title: string; text: string; icon: IconName }[] = [
  { title: "Pick from our menu", text: "Add what you love to your basket, tap Order Now and send it to us on WhatsApp or Instagram.", icon: "cup" },
  { title: "We confirm your order", text: "We’ll reply with availability, delivery charges and the final total.", icon: "check" },
  { title: "Enjoy your dolce", text: "Fresh, chilled and ready to make someone’s day a little sweeter.", icon: "heart" },
];


export const faqs: { q: string; a: string }[] = [
  { q: "Is DOLCE pure vegetarian?", a: "Yes! DOLCE is a 100% pure vegetarian café. Everything on our menu — every tiramisu, dessert and drink — is vegetarian, so the whole family can order with confidence." },
  { q: "How do I place an order?", a: "Add items from our menu to your basket and tap Order Now, then choose WhatsApp or Instagram. On WhatsApp your order is written for you — just press Send. On Instagram we copy your order so you can paste it into the chat. We’ll confirm availability, delivery and the final total." },
  { q: "Are delivery charges included?", a: "No — menu prices and the basket total exclude delivery charges. We’ll tell you the delivery charge for your location when we confirm your order." },
  { q: "Do you take orders for parties and celebrations?", a: "Yes! Birthdays, anniversaries, festivals, office treats — message us in advance for larger orders so we can make everything fresh for your day." },
  { q: "What is the High-Protein Tiramisu?", a: "It’s our lighter, protein-rich take on the classic, made for people who love dessert and an active lifestyle. Ask us on WhatsApp for its ingredients and nutrition details." },
  { q: "Do your desserts contain alcohol or allergens?", a: "Ingredients differ between flavours. Message us before ordering and we’ll share the full ingredient and allergen details for each one." },
  { q: "How should I store my tiramisu?", a: "Keep it refrigerated and enjoy it fresh. We’ll tell you the best-before time when you order." },
];

export const gallery: { src: StaticImageData; alt: string; tall?: boolean }[] = [
  { src: tiramisuTray, alt: "A tray of tiramisu dusted with cocoa", tall: false },
  { src: cappuccino, alt: "Cappuccino with latte art beside an espresso machine" },
  { src: marigold2, alt: "A bright marigold flower" },
  { src: chocolateGlasses, alt: "Chocolate desserts in glasses with dark chocolate", tall: false },
  { src: cardamom, alt: "Fresh green cardamom pods", tall: true },
  { src: cafe2, alt: "A calm, sunlit café interior", tall: true },
  { src: lemons, alt: "Lemons growing on a tree on the Amalfi coast", tall: true },
  { src: masala, alt: "Indian spices in steel bowls" },
  { src: amalfi, alt: "Colourful houses of the Amalfi coast" },
  { src: tiramisuSlice, alt: "A slice of tiramisu on a café table" },
];

export const marqueeWords = [
  "Mascarpone", "Espresso", "100% Pure Veg", "Cocoa", "Savoiardi", "शुद्ध शाकाहारी", "Fatto a mano", "मिठास", "La dolce vita", "Made fresh", "Benvenuti", "स्वाद",
];
