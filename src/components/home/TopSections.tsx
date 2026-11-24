import Image from "next/image";
import { Icon, Stars } from "../icons";
import { Garland, Mandala } from "../decor";
import SectionHead from "./SectionHead";
import { marqueeWords, purpose, reviews, signatureItems, values } from "@/content/home";
import { whatsappLink } from "@/lib/site";

import heroImg from "@/assets/images/tiramisu-slice.jpg";
import marigold from "@/assets/images/marigold.jpg";
import cappuccino2 from "@/assets/images/cappuccino-2.jpg";
import cocoa from "@/assets/images/cocoa.jpg";
import amalfi from "@/assets/images/amalfi.jpg";
import lemons from "@/assets/images/lemons.jpg";
import spices from "@/assets/images/spices.jpg";
import cafe1 from "@/assets/images/cafe-1.jpg";
import cappuccino from "@/assets/images/cappuccino.jpg";

const avgRating = reviews.reduce((s, r) => s + r.rating, 0) / reviews.length;

export function Hero() {
  return (
    <section id="home" className="lp-hero">
      <Mandala className="lp-hero-mandala" />
      <div className="lp-shell lp-hero-grid">
        <div className="lp-hero-copy">
          <p className="lp-pill reveal"><span className="lp-pill-dot" /> Benvenuti · Italian café, made in India</p>
          <h1 className="reveal" style={{ "--d": "80ms" } as React.CSSProperties}>
            A little taste of <em>Italy</em>, with an <span className="lp-saffron">Indian heart.</span>
          </h1>
          <p className="lp-hindi lp-hero-hindi reveal" lang="hi" style={{ "--d": "140ms" } as React.CSSProperties}>इटली का स्वाद, भारत का दिल</p>
          <p className="lp-hero-lead reveal" style={{ "--d": "200ms" } as React.CSSProperties}>
            Handmade tiramisu in three signature flavours — <strong>Classic</strong>, <strong>Chocolate</strong> and <strong>High-Protein</strong> — crafted the Italian way and delivered with Indian warmth.
          </p>
          <div className="lp-hero-ctas reveal" style={{ "--d": "260ms" } as React.CSSProperties}>
            <a className="lp-btn lp-btn--wa lp-btn--lg" href={whatsappLink()} target="_blank" rel="noopener noreferrer">
              <Icon name="whatsapp" /> Order on WhatsApp
            </a>
            <a className="lp-btn lp-btn--ghost lp-btn--lg" href="#tiramisu">
              Explore Tiramisu <Icon name="arrow" size={18} />
            </a>
          </div>
          <ul className="lp-hero-facts reveal" style={{ "--d": "320ms" } as React.CSSProperties}>
            <li><strong>3</strong><span>signature<br />tiramisus</span></li>
            <li><strong>100%</strong><span>made<br />by hand</span></li>
            <li><strong>{avgRating.toFixed(1)}★</strong><span>customer<br />love</span></li>
          </ul>
        </div>

        <div className="lp-hero-art reveal" style={{ "--d": "150ms" } as React.CSSProperties}>
          <div className="lp-arch lp-hero-main">
            <Image src={heroImg} alt="A slice of DOLCE classic tiramisu dusted with cocoa" placeholder="blur" fetchPriority="high" loading="eager"
              sizes="(max-width: 900px) 80vw, 440px" />
          </div>
          <div className="lp-hero-circle lp-float">
            <Image src={marigold} alt="" placeholder="blur" sizes="140px" />
          </div>
          <div className="lp-hero-coffee lp-float lp-float--slow">
            <Image src={cappuccino2} alt="" placeholder="blur" sizes="170px" />
          </div>
          <div className="lp-hero-card lp-hero-card--rating">
            <Stars rating={avgRating} size={14} />
            <strong>{avgRating.toFixed(1)} / 5</strong>
            <span>from happy customers</span>
          </div>
          <div className="lp-hero-card lp-hero-card--wa">
            <span className="lp-hero-card-icon"><Icon name="whatsapp" size={20} /></span>
            <span><strong>Order in a tap</strong><br />on WhatsApp</span>
          </div>
          <svg className="lp-badge-spin" viewBox="0 0 120 120" aria-hidden="true">
            <defs><path id="badge-circle" d="M60 60 m-46 0 a46 46 0 1 1 92 0 a46 46 0 1 1 -92 0" /></defs>
            <circle cx="60" cy="60" r="58" />
            <text><textPath href="#badge-circle" textLength="286" lengthAdjust="spacing">FATTO A MANO · HANDMADE · FRESH ·</textPath></text>
            <path className="lp-badge-heart" d="M60 72s-11-6.6-13.6-13A7.4 7.4 0 0 1 60 52.6 7.4 7.4 0 0 1 73.6 59c-2.6 6.4-13.6 13-13.6 13Z" />
          </svg>
        </div>
      </div>
      <Garland className="lp-hero-garland" count={34} />
    </section>
  );
}

export function Marquee() {
  const words = [...marqueeWords, ...marqueeWords];
  return (
    <div className="lp-marquee" aria-hidden="true">
      <div className="lp-marquee-track">
        {words.map((w, i) => <span key={i}>{w}<i>✦</i></span>)}
      </div>
    </div>
  );
}

export function Story() {
  return (
    <section id="story" className="lp-section lp-story">
      <div className="lp-shell lp-story-grid">
        <div className="lp-story-art reveal">
          <div className="lp-arch lp-story-main">
            <Image src={cocoa} alt="Cocoa being dusted over a dessert" placeholder="blur" sizes="(max-width: 900px) 70vw, 380px" />
          </div>
          <div className="lp-story-inset">
            <Image src={amalfi} alt="Colourful houses on the Amalfi coast in Italy" placeholder="blur" sizes="220px" />
          </div>
          <div className="lp-story-stamp"><span>Est. in</span><strong>India</strong><span>with ♥ for Italy</span></div>
        </div>
        <div>
          <SectionHead eyebrow="Our Story" title={<>From an Italian café dream to <em>your</em> table</>} hindi="हमारी कहानी" />
          <div className="lp-prose reveal">
            <p>
              DOLCE means <em>“sweet”</em> in Italian — and that’s exactly what we set out to share. We fell in love with
              the slow, joyful café culture of Italy: a good coffee, a spoon of tiramisu, and time with the people you love.
            </p>
            <p>
              We wanted that feeling here at home in India. So we started where every Italian dessert story starts — with
              <strong> tiramisu</strong>. We make it by hand, layer by layer, and serve it with the warmth of Indian
              hospitality, because here, <em>atithi devo bhava</em> — every guest is family.
            </p>
            <p>Today we’re a small, growing Italian café brand, and every order is still made with the same care as the very first one.</p>
          </div>
          <blockquote className="lp-quote reveal">
            <Icon name="quote" size={28} />
            <p>“La dolce vita isn’t a place — it’s a moment. We just help you find it.”</p>
            <cite>— Team DOLCE</cite>
          </blockquote>
        </div>
      </div>
    </section>
  );
}

export function Purpose() {
  return (
    <section id="mission" className="lp-section lp-purpose">
      <Mandala className="lp-purpose-mandala" petals={12} />
      <div className="lp-shell">
        <SectionHead center light eyebrow="What drives us" title={<>Our motive, mission &amp; <em>vision</em></>} hindi="हमारा उद्देश्य" />
        <div className="lp-purpose-grid">
          {purpose.map((p, i) => (
            <article key={p.title} className="lp-purpose-card reveal" style={{ "--d": `${i * 110}ms` } as React.CSSProperties}>
              <span className="lp-icon-badge"><Icon name={p.icon} size={26} /></span>
              <h3>{p.title}</h3>
              <p className="lp-hindi" lang="hi">{p.hindi}</p>
              <p>{p.text}</p>
            </article>
          ))}
        </div>
        <ul className="lp-values">
          {values.map((v, i) => (
            <li key={v.title} className="reveal" style={{ "--d": `${i * 90}ms` } as React.CSSProperties}>
              <Icon name={v.icon} size={24} />
              <div><strong>{v.title}</strong><span>{v.text}</span></div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

export function Signature() {
  return (
    <section id="tiramisu" className="lp-section lp-signature">
      <div className="lp-shell">
        <SectionHead center eyebrow="Our signature" title={<>The Tiramisu <em>Trio</em></>} hindi="हर चम्मच में इटली"
          intro="Tiramisu means “pick me up” in Italian. Ours comes in three moods — pick yours." />
        <div className="lp-trio">
          {signatureItems.map((item, i) => (
            <article key={item.id} className="lp-dish reveal" style={{ "--d": `${i * 120}ms`, "--accent": item.accent } as React.CSSProperties}>
              <div className="lp-dish-img">
                <Image src={item.image} alt={item.name} placeholder="blur" sizes="(max-width: 700px) 92vw, (max-width: 1100px) 45vw, 360px" />
                {item.badge && <span className="lp-dish-badge">{item.badge}</span>}
                <span className="lp-dish-icon"><Icon name={item.icon} size={22} /></span>
              </div>
              <div className="lp-dish-body">
                <p className="lp-dish-it" lang="it">{item.italian}</p>
                <h3>{item.name}</h3>
                <p className="lp-dish-tagline">{item.tagline}</p>
                <p>{item.description}</p>
                <ul className="lp-chips">{item.notes.map((n) => <li key={n}>{n}</li>)}</ul>
                <a className="lp-btn lp-btn--wa lp-btn--block" target="_blank" rel="noopener noreferrer"
                  href={whatsappLink(`Hi DOLCE! I'd like to order the ${item.name}.`)}>
                  <Icon name="whatsapp" size={18} /> Order {item.italian}
                </a>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

export function Fusion() {
  return (
    <section className="lp-section lp-fusion">
      <div className="lp-shell lp-fusion-grid">
        <div className="lp-fusion-col lp-fusion-col--it reveal">
          <div className="lp-fusion-img"><Image src={lemons} alt="Amalfi lemons on the tree" placeholder="blur" sizes="(max-width: 900px) 92vw, 33vw" /></div>
          <h3><span lang="it">Tecnica italiana</span></h3>
          <p>Classic recipes, silky mascarpone cream, coffee-soaked savoiardi and patience — the way it’s done in Italy.</p>
        </div>
        <div className="lp-fusion-center reveal" style={{ "--d": "120ms" } as React.CSSProperties}>
          <p className="lp-eyebrow">Where two cultures meet</p>
          <h2>Italian technique.<br /><em>Indian soul.</em></h2>
          <p className="lp-hindi" lang="hi">इटली की कला, भारत का प्यार</p>
          <p>
            We follow the Italian way — layered by hand, set with patience, dusted with cocoa just before it reaches you.
            And we serve it the Indian way: generously, warmly, and always with a smile.
          </p>
          <span className="lp-fusion-plus" aria-hidden="true">+</span>
        </div>
        <div className="lp-fusion-col lp-fusion-col--in reveal" style={{ "--d": "220ms" } as React.CSSProperties}>
          <div className="lp-fusion-img"><Image src={spices} alt="Whole Indian spices on a plate" placeholder="blur" sizes="(max-width: 900px) 92vw, 33vw" /></div>
          <h3>Indian hospitality</h3>
          <p>Made for celebrations big and small — birthdays, festivals, family evenings — and for the people we treat like family.</p>
        </div>
      </div>
    </section>
  );
}

export function Cafe() {
  return (
    <section className="lp-section lp-cafe">
      <div className="lp-shell lp-cafe-grid">
        <div>
          <SectionHead eyebrow="The DOLCE café" title={<>An Italian café at <em>heart</em></>} hindi="कॉफ़ी, मिठाई और अपनापन"
            intro="Tiramisu is where we began, but DOLCE is a café at heart — a warm place for desserts, coffee and good company. Our café menu keeps growing." />
          <div className="lp-cafe-actions reveal">
            <a className="lp-btn lp-btn--primary" href="#menu">Browse the menu <Icon name="arrow" size={18} /></a>
            <a className="lp-link" href={whatsappLink("Hi DOLCE! What's available today?")} target="_blank" rel="noopener noreferrer">Ask what’s fresh today →</a>
          </div>
        </div>
        <div className="lp-cafe-art reveal" style={{ "--d": "120ms" } as React.CSSProperties}>
          <div className="lp-cafe-a"><Image src={cafe1} alt="A bright, cosy café corner" placeholder="blur" sizes="(max-width: 900px) 55vw, 300px" /></div>
          <div className="lp-cafe-b"><Image src={cappuccino} alt="Cappuccino with latte art" placeholder="blur" sizes="(max-width: 900px) 45vw, 260px" /></div>
        </div>
      </div>
    </section>
  );
}
