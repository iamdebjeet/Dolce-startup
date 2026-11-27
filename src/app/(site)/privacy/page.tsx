import type { Metadata } from "next";
import Link from "next/link";
import { instagramProfileUrl, site, whatsappLink } from "@/lib/site";

export const metadata: Metadata = {
  title: "Privacy | DOLCE",
  description: `How DOLCE (${site.city}) collects and uses your information.`,
  alternates: { canonical: "/privacy" },
};

const UPDATED = "27 November 2026";

export default function PrivacyPage() {
  const phone = `+${site.whatsappNumber.slice(0, 2)} ${site.whatsappNumber.slice(2, 7)} ${site.whatsappNumber.slice(7)}`;
  return (
    <main className="page-shell page lp-privacy">
      <p className="eyebrow">Your data, your choice</p>
      <h1 className="page-title">Privacy at DOLCE</h1>
      <p className="lead">
        DOLCE is a small pure-veg Italian café in {site.city}, {site.region}. We collect only what we need to take your
        orders, answer your messages and learn from your feedback — and we never sell your information.
      </p>
      <p className="muted">Last updated: {UPDATED}</p>

      <h2>What we collect, and why</h2>
      <h3>Contact form</h3>
      <p>
        Your name, email, phone number (optional) and message. We store them securely so we can reply to you, and delete
        them once they’re no longer needed.
      </p>

      <h3>Orders</h3>
      <p>
        Your basket is saved only in your own browser until you send it. When you tap <strong>Order Now</strong>, your
        order (items, and any name, area or note you add) is sent to us through <strong>WhatsApp</strong> or{" "}
        <strong>Instagram</strong>. We use it only to confirm, prepare and deliver your order. Those messages are also
        handled under WhatsApp’s and Instagram’s own privacy policies. Our website does not store your orders.
      </p>

      <h3>Reviews and ratings (Google Form)</h3>
      <p>
        Our review form asks for your name, age range, gender, the product you liked, your ratings, your review and
        whether we may feature it. <strong>Age range and gender stay in Google Forms</strong> and are used only to
        understand our customers as a group.
      </p>
      <ul>
        <li>Your <strong>rating</strong> counts toward the average rating shown on our website.</li>
        <li>Your <strong>review text</strong> appears on our website only if you said yes to featuring it — with your first name only, or as “A DOLCE customer” if you chose anonymous.</li>
        <li>If you chose “keep it private”, your review is never shown publicly.</li>
      </ul>

      <h3>Cookies and tracking</h3>
      <p>
        We don’t use advertising or tracking cookies. Your browser keeps your basket locally, and our staff login uses a
        cookie that only applies to our team.
      </p>

      <h2>Who helps us</h2>
      <p>
        We use trusted services to run DOLCE: Netlify (website hosting), Neon (our database), Google Forms (reviews),
        Meta — WhatsApp and Instagram (orders and chat), and Cloudinary (menu photos). They process data on our behalf and
        may store it on servers outside India.
      </p>

      <h2>Your rights</h2>
      <p>
        Under India’s Digital Personal Data Protection Act, 2023, you can ask us to show, correct or delete the
        information we hold about you, or withdraw permission you gave us — for example, to stop featuring your review.
        You can also raise a concern with us at any time.
      </p>
      <p>
        If you’re under 18, please ask a parent or guardian before sharing your details or a review with us.
      </p>

      <h2>Contact us</h2>
      <p>For any privacy question or request, message us — we’ll respond as soon as we can:</p>
      <ul>
        <li>WhatsApp: <a href={whatsappLink("Hi DOLCE! I have a privacy request.")} target="_blank" rel="noopener noreferrer">{phone}</a></li>
        <li>Instagram: <a href={instagramProfileUrl} target="_blank" rel="noopener noreferrer">@{site.instagramUsername}</a></li>
        <li>Or use the <Link href="/#contact">contact form</Link> on our website.</li>
      </ul>
    </main>
  );
}
