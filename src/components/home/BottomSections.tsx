import Image from "next/image";
import { Icon } from "../icons";
import { Garland, Marigold } from "../decor";
import SectionHead from "./SectionHead";
import ContactForm from "../ContactForm";
import ReviewQrCard from "./ReviewQrCard";
import { FeaturedReviews, RatingSummary } from "./LiveReviews";
import { Suspense } from "react";
import { faqs, gallery, orderSteps } from "@/content/home";
import { site } from "@/lib/site";
import ChatLinks from "../ChatLinks";
import tiramisuTray from "@/assets/images/tiramisu-tray.jpg";

export function HowToOrder() {
  return (
    <section id="order" className="lp-section lp-order">
      <div className="lp-shell">
        <SectionHead center eyebrow="How to order" title={<>Three steps to something <em>sweet</em></>} hindi="ऑर्डर करना बहुत आसान है"
          intro="Order from our menu and send it to us on WhatsApp or Instagram — no apps, no sign-ups. Just say ciao!" />
        <ol className="lp-steps">
          {orderSteps.map((s, i) => (
            <li key={s.title} className="lp-step reveal" style={{ "--d": `${i * 120}ms` } as React.CSSProperties}>
              <span className="lp-step-num">{String(i + 1).padStart(2, "0")}</span>
              <span className="lp-icon-badge"><Icon name={s.icon} size={26} /></span>
              <h3>{s.title}</h3>
              <p>{s.text}</p>
            </li>
          ))}
        </ol>

        <div className="lp-wa-panel reveal">
          <div className="lp-wa-panel-img"><Image src={tiramisuTray} alt="" placeholder="blur" sizes="(max-width: 800px) 100vw, 420px" /></div>
          <div className="lp-wa-panel-body">
            <p className="lp-eyebrow lp-eyebrow--light"><Marigold /> Orders open</p>
            <h3>Craving tiramisu? Your order is a few taps away.</h3>
            <p>Pick from the menu and send your order in one go. Planning a party or festival, or have a question? Chat with us on WhatsApp or Instagram.</p>
            <div className="lp-wa-panel-actions">
              <a className="lp-btn lp-btn--light lp-btn--lg" href="#menu">
                Order from the menu <Icon name="arrow" size={18} />
              </a>
            </div>
            <div className="lp-wa-panel-chat">
              <span>Or chat with us:</span>
              <ChatLinks size="sm" />
            </div>
            <span className="lp-wa-note"><Icon name="clock" size={16} /> We reply as quickly as we can</span>
          </div>
        </div>
      </div>
    </section>
  );
}

export function Gallery() {
  return (
    <section id="gallery" className="lp-section lp-gallery">
      <div className="lp-shell">
        <SectionHead center eyebrow="Gallery" title={<>Little moments of <em>dolce vita</em></>} hindi="मीठे पल" />
        <div className="lp-gallery-grid">
          {gallery.map((g, i) => (
            <figure key={i} className={`lp-gallery-item reveal${g.tall ? " is-tall" : ""}`} style={{ "--d": `${(i % 4) * 80}ms` } as React.CSSProperties}>
              <Image src={g.src} alt={g.alt} placeholder="blur" sizes="(max-width: 700px) 50vw, (max-width: 1100px) 33vw, 280px" />
              <figcaption>{g.alt}</figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}

export function Reviews() {
  return (
    <section id="reviews" className="lp-section lp-reviews">
      <div className="lp-shell">
        <SectionHead center eyebrow="Reviews & ratings" title={<>Loved by our <em>customers</em></>} hindi="आपका प्यार, हमारी मिठास" />

        <div className="rv-feature">
          <div className="reveal"><ReviewQrCard /></div>
          <div className="rv-cta reveal" style={{ "--d": "120ms" } as React.CSSProperties}>
            <p className="lp-eyebrow"><Marigold /> Your feedback matters</p>
            <h3>Loved your <em>Dolce</em>? Tell us!</h3>
            <p className="lp-hindi" lang="hi">आपकी राय हमारे लिए खास है</p>
            <p className="rv-lead">Your rating helps us make every tiramisu better — and helps others discover DOLCE. It takes less than a minute.</p>
            <ol className="rv-steps">
              <li><span>1</span><div><strong>Scan the QR code</strong> with your phone camera</div></li>
              <li><span>2</span><div><strong>Rate us</strong> and share your experience</div></li>
              <li><span>3</span><div><strong>That’s it</strong> — grazie mille!</div></li>
            </ol>
            <a className="lp-btn lp-btn--primary lp-btn--lg rv-button" href={site.reviewFormUrl} target="_blank" rel="noopener noreferrer">
              <Icon name="star" size={20} filled /> Rate &amp; Review DOLCE
            </a>
            <p className="rv-note">On your phone? Just tap the button — it opens our review form.</p>

            <Suspense fallback={<div className="rv-score rv-score--loading" aria-hidden="true" />}>
              <RatingSummary />
            </Suspense>
          </div>
        </div>

        <div className="lp-reviews-layout">
          <Suspense fallback={null}>
            <FeaturedReviews />
          </Suspense>
        </div>
      </div>
    </section>
  );
}

export function Faq() {
  return (
    <section id="faq" className="lp-section lp-faq">
      <div className="lp-shell lp-faq-grid">
        <SectionHead eyebrow="FAQ" title={<>Good <em>questions</em></>} hindi="आपके सवाल, हमारे जवाब"
          intro="Can’t find what you’re looking for? Just ask us on WhatsApp or Instagram." />
        <div className="lp-faq-list">
          {faqs.map((f, i) => (
            <details key={f.q} className="lp-faq-item reveal" style={{ "--d": `${i * 70}ms` } as React.CSSProperties} open={i === 0}>
              <summary>{f.q}<Icon name="chevron" size={20} /></summary>
              <p>{f.a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}

export function Contact() {
  return (
    <section id="contact" className="lp-section lp-contact">
      <Garland className="lp-contact-garland" count={34} />
      <div className="lp-shell lp-contact-grid">
        <div className="reveal">
          <SectionHead light eyebrow="Get in touch" title={<>Let’s make your day a little <em>sweeter</em></>} hindi="चलिए बात करते हैं" />
          <ul className="lp-contact-list">
            <li>
              <span className="lp-icon-badge"><Icon name="whatsapp" /></span>
              <div><strong>Orders & chat</strong><span>Order from our menu, or message us on WhatsApp or Instagram — whichever you prefer.</span>
                <ChatLinks size="sm" className="lp-contact-chat" /></div>
            </li>
            <li>
              <span className="lp-icon-badge"><Icon name="gift" /></span>
              <div><strong>Parties & bulk orders</strong><span>Birthdays, festivals, office treats — message us in advance.</span></div>
            </li>
            <li>
              <span className="lp-icon-badge"><Icon name="mail" /></span>
              <div><strong>Everything else</strong><span>Collaborations, feedback or questions? Use the form and we’ll get back to you.</span></div>
            </li>
          </ul>
        </div>
        <div className="lp-contact-card reveal" style={{ "--d": "120ms" } as React.CSSProperties}>
          <h3>Send us a message</h3>
          <p className="lp-muted">Not for orders — for those, use our menu or WhatsApp/Instagram.</p>
          <ContactForm />
        </div>
      </div>
    </section>
  );
}
