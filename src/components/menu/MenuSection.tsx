import { getPublicMenu } from "@/lib/data";
import { whatsappLink } from "@/lib/site";
import { Icon } from "../icons";
import { VegMark } from "../decor";
import SectionHead from "../home/SectionHead";
import MenuBrowser from "./MenuBrowser";

function Head() {
  return (
    <>
      <SectionHead center eyebrow="Our menu" title={<>Pick, add, <em>order</em></>} hindi="जो मन करे, चुनिए"
        intro="Browse by category, add what you love to your basket, and send your order to us on WhatsApp in one tap." />
      <p className="mn-veg-note reveal">
        <VegMark size={18} label="" /> Everything on our menu is <strong>100% pure vegetarian</strong>
        <span lang="hi" className="lp-hindi"> · शुद्ध शाकाहारी</span>
      </p>
    </>
  );
}

/** Live menu from the admin portal (server-rendered). */
export default async function MenuSection() {
  let menu: Awaited<ReturnType<typeof getPublicMenu>> = [];
  let failed = false;
  try {
    menu = await getPublicMenu();
  } catch (error) {
    console.error("Menu unavailable", error);
    failed = true;
  }

  return (
    <section id="menu" className="lp-section mn">
      <div className="lp-shell">
        <Head />
        {menu.length === 0 ? (
          <div className="mn-empty reveal">
            <span className="lp-icon-badge"><Icon name="cup" size={26} /></span>
            <h3>{failed ? "Our menu is taking a short break" : "Our menu is being freshly prepared"}</h3>
            <p>{failed ? "Please check back in a little while." : "New dishes are coming soon."} Meanwhile, our signature tiramisu is just a message away.</p>
            <a className="lp-btn lp-btn--wa" href={whatsappLink()} target="_blank" rel="noopener noreferrer">
              <Icon name="whatsapp" size={18} /> Order on WhatsApp
            </a>
          </div>
        ) : (
          <MenuBrowser menu={menu} />
        )}
      </div>
    </section>
  );
}

export function MenuSkeleton() {
  return (
    <section id="menu" className="lp-section mn" aria-busy="true">
      <div className="lp-shell">
        <Head />
        <div className="mn-grid">
          {[0, 1, 2].map((i) => <div key={i} className="mn-card mn-card--skeleton" />)}
        </div>
      </div>
    </section>
  );
}
