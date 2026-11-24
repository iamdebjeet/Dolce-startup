import "../landing.css";
import SiteNav from "@/components/SiteNav";
import SiteFooter from "@/components/SiteFooter";

/** Shared chrome for secondary pages (café menu, admin). The home page renders its own one-page nav. */
export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <SiteNav />
      <div className="lp-subpage">{children}</div>
      <SiteFooter />
    </>
  );
}
