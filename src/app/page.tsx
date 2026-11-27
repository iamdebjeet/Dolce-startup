import "./landing.css";
import { Suspense } from "react";
import SiteNav from "@/components/SiteNav";
import SiteFooter from "@/components/SiteFooter";
import Reveal from "@/components/Reveal";
import ChatFab from "@/components/ChatFab";
import { Cafe, Fusion, Hero, Marquee, Purpose, Signature, Story } from "@/components/home/TopSections";
import { Contact, Faq, Gallery, HowToOrder, Reviews } from "@/components/home/BottomSections";
import MenuSection, { MenuSkeleton } from "@/components/menu/MenuSection";

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
      <ChatFab />
      <Reveal />
    </>
  );
}
