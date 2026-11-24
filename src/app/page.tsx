import "./landing.css";
import { Suspense } from "react";
import SiteNav from "@/components/SiteNav";
import SiteFooter from "@/components/SiteFooter";
import Reveal from "@/components/Reveal";
import { Icon } from "@/components/icons";
import { Cafe, Fusion, Hero, Marquee, Purpose, Signature, Story } from "@/components/home/TopSections";
import { Contact, Faq, Gallery, HowToOrder, Reviews } from "@/components/home/BottomSections";
import MenuSection, { MenuSkeleton } from "@/components/menu/MenuSection";
import { whatsappLink } from "@/lib/site";

// The menu section reads live data managed in the admin portal, so render per request.
export const dynamic = "force-dynamic";

export default function HomePage() {
  return (
    <>
      <SiteNav onHome />
      <main className="lp">
        <Hero />
        <Marquee />
        <Story />
        <Purpose />
        <Signature />
        <Suspense fallback={<MenuSkeleton />}>
          <MenuSection />
        </Suspense>
        <Fusion />
        <HowToOrder />
        <Cafe />
        <Gallery />
        <Reviews />
        <Faq />
        <Contact />
      </main>
      <SiteFooter onHome />
      <a className="lp-fab" href={whatsappLink()} target="_blank" rel="noopener noreferrer" aria-label="Chat with DOLCE on WhatsApp">
        <Icon name="whatsapp" size={28} />
      </a>
      <Reveal />
    </>
  );
}
