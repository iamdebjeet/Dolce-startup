import Image from "next/image";
import QRCode from "qrcode";
import { site } from "@/lib/site";
import { Icon } from "../icons";
import tiramisu from "@/assets/images/tiramisu-plate.jpg";

/** "Dolce ticket": photo header, perforated tear line, and a scannable QR to the review form. */
export default async function ReviewQrCard() {
  // Vector QR rendered on the server; always dark-on-white for reliable scanning.
  const qrSvg = await QRCode.toString(site.reviewFormUrl, {
    type: "svg",
    margin: 0,
    errorCorrectionLevel: "M",
    color: { dark: "#2a1912", light: "#ffffff" },
  });

  return (
    <article className="rq" aria-labelledby="rq-title">
      <div className="rq-top">
        <Image src={tiramisu} alt="" fill placeholder="blur" sizes="400px" className="rq-top-img" />
        <div className="rq-top-content">
          <span className="rq-brand">DOLCE · Italian Café</span>
          <h3 id="rq-title" className="rq-title">How was your <em>dolce</em>?</h3>
          <div className="rq-stars" aria-hidden="true">
            {[0, 1, 2, 3, 4].map((i) => (
              <span key={i} style={{ "--i": i } as React.CSSProperties}><Icon name="star" size={26} filled /></span>
            ))}
          </div>
          <p className="rq-sub">Rate us in under a minute</p>
        </div>
      </div>

      <div className="rq-tear" aria-hidden="true" />

      <div className="rq-bottom">
        <a className="rq-qr" href={site.reviewFormUrl} target="_blank" rel="noopener noreferrer" aria-label="Open the DOLCE review form">
          <span className="rq-corner rq-corner--tl" />
          <span className="rq-corner rq-corner--tr" />
          <span className="rq-corner rq-corner--bl" />
          <span className="rq-corner rq-corner--br" />
          <span className="rq-qr-code" dangerouslySetInnerHTML={{ __html: qrSvg }} />
        </a>
        <p className="rq-hint"><Icon name="camera" size={18} /> Point your phone camera at the code</p>
        <a className="rq-link" href={site.reviewFormUrl} target="_blank" rel="noopener noreferrer">
          or tap here to open the review form <Icon name="arrow" size={16} />
        </a>
      </div>
    </article>
  );
}
