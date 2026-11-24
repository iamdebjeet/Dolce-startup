import { Marigold } from "../decor";

export default function SectionHead({ eyebrow, title, hindi, intro, center = false, light = false }: {
  eyebrow: string;
  title: React.ReactNode;
  hindi?: string;
  intro?: string;
  center?: boolean;
  light?: boolean;
}) {
  return (
    <div className={`lp-head reveal${center ? " lp-head--center" : ""}${light ? " lp-head--light" : ""}`}>
      <p className="lp-eyebrow"><Marigold /> {eyebrow}</p>
      <h2>{title}</h2>
      {hindi && <p className="lp-hindi lp-head-hindi" lang="hi">{hindi}</p>}
      {intro && <p className="lp-intro">{intro}</p>}
    </div>
  );
}
