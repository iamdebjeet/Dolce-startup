import { Icon } from "./icons";
import { PureVegBadge, Tricolore } from "./decor";
import { instagramProfileUrl, site } from "@/lib/site";
import ChatLinks from "./ChatLinks";

export default function SiteFooter({ onHome = false }: { onHome?: boolean }) {
  const h = (id: string) => (onHome ? `#${id}` : `/#${id}`);
  return (
    <footer className="lp-footer">
      <Tricolore />
      <div className="lp-shell lp-footer-grid">
        <div>
          <div className="lp-logo lp-logo--light"><span>DOLCE</span><small>Italian Café · India</small></div>
          <p className="lp-footer-tag">{site.tagline}<br /><span lang="hi" className="lp-hindi">{site.hindiTagline}</span></p>
          <PureVegBadge className="veg-badge--dark" />
        </div>
        <nav aria-label="Footer">
          <h4>Explore</h4>
          <a href={h("story")}>Our Story</a>
          <a href={h("tiramisu")}>Signature Tiramisu</a>
          <a href={h("reviews")}>Reviews</a>
          <a href={site.reviewFormUrl} target="_blank" rel="noopener noreferrer">Rate &amp; Review us ↗</a>
          <a href={h("menu")}>Menu</a>
        </nav>
        <div>
          <h4>Order</h4>
          <p>Order from our menu and send it on WhatsApp or Instagram.</p>
          <a className="lp-btn lp-btn--primary lp-btn--sm" href={h("menu")}>Order now <Icon name="arrow" size={16} /></a>
          <p className="lp-footer-chat">Chat with us:</p>
          <ChatLinks size="sm" />
          <a className="lp-footer-ig" href={instagramProfileUrl} target="_blank" rel="noopener noreferrer">
            <Icon name="instagram" size={16} /> @{site.instagramUsername}
          </a>
        </div>
      </div>
      <div className="lp-shell lp-footer-bottom">
        <span>© {new Date().getFullYear()} DOLCE. Made with love in India, inspired by Italy.</span>
        <span lang="it">Grazie mille ♥</span>
      </div>
    </footer>
  );
}
