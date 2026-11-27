import { Icon } from "./icons";
import { instagramDmUrl, whatsappLink } from "@/lib/site";

/** "Chat with us" pair: WhatsApp (pre-filled greeting) and Instagram DM. */
export default function ChatLinks({ size = "", whatsappMessage, className = "" }: {
  size?: "" | "sm" | "lg";
  whatsappMessage?: string;
  className?: string;
}) {
  const s = size ? ` lp-btn--${size}` : "";
  return (
    <span className={`lp-chat-links ${className}`}>
      <a className={`lp-btn lp-btn--wa${s}`} href={whatsappLink(whatsappMessage ?? "Hi DOLCE! I have a question.")} target="_blank" rel="noopener noreferrer">
        <Icon name="whatsapp" size={size === "sm" ? 16 : 20} /> WhatsApp
      </a>
      <a className={`lp-btn lp-btn--ig${s}`} href={instagramDmUrl} target="_blank" rel="noopener noreferrer">
        <Icon name="instagram" size={size === "sm" ? 16 : 20} /> Instagram
      </a>
    </span>
  );
}
