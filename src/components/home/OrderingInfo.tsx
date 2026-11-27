import { Icon } from "../icons";
import { describeCharges } from "@/lib/delivery";
import { formatRupees } from "@/lib/money";
import { getDeliverySettingsSafe } from "@/lib/settings";
import { site } from "@/lib/site";
import { orderAhead } from "@/content/home";

/** "Good to know" cards: where we deliver, pickup, charges (from admin settings), and order lead times. */
export default async function OrderingInfo() {
  const s = await getDeliverySettingsSafe();
  const cards = [
    {
      icon: "pin" as const,
      title: `Delivering in ${site.city}`,
      text: `We currently deliver only within ${site.city}, ${site.region}. Outside the city? Message us — we’re growing!`,
    },
    ...(s.pickupEnabled
      ? [{ icon: "gift" as const, title: "Pickup available", text: "Prefer to collect your order? Choose Pickup in the basket — we’ll share the pickup address in the chat." }]
      : []),
    {
      icon: "check" as const,
      title: "Delivery charges",
      text: describeCharges(s) + (s.freeAbove !== null ? ` Free delivery on orders of ${formatRupees(s.freeAbove)} or more.` : ""),
    },
    { icon: "clock" as const, title: "Order ahead", text: orderAhead },
  ];

  return (
    <div className="lp-info">
      <h3 className="lp-info-title">Good to know</h3>
      <ul className="lp-info-grid">
        {cards.map((c, i) => (
          <li key={c.title} className="lp-info-card reveal" style={{ "--d": `${i * 90}ms` } as React.CSSProperties}>
            <span className="lp-icon-badge"><Icon name={c.icon} size={22} /></span>
            <div><strong>{c.title}</strong><p>{c.text}</p></div>
          </li>
        ))}
      </ul>
    </div>
  );
}
