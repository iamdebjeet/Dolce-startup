/** Decorative motifs: Indian marigold garland (toran), rangoli mandala, Italian tricolore. All aria-hidden. */

export function Garland({ count = 28, className = "" }: { count?: number; className?: string }) {
  const width = count * 36;
  return (
    <div className={`lp-garland ${className}`} aria-hidden="true">
      <svg viewBox={`0 0 ${width} 46`} preserveAspectRatio="none">
        <path d={`M0 6 Q ${width / 2} 30 ${width} 6`} fill="none" stroke="#7a4a2a" strokeWidth="1.2" />
        {Array.from({ length: count }, (_, i) => {
          const x = i * 36 + 18;
          const t = x / width;
          const y = 6 + 48 * t * (1 - t); // point on the quadratic string (endpoints y=6, control y=30)
          const color = i % 3 === 1 ? "#f2c14e" : "#f08a24";
          return (
            <g key={i} transform={`translate(${x} ${y + 9})`}>
              {i % 2 === 0 && <path d="M-9 -6 q -6 4 -3 10 q 5 -2 3 -10Z" fill="#3e7a43" />}
              <circle r="8.5" fill={color} />
              <circle r="5.5" fill={color} stroke="#d0661a" strokeWidth="1" strokeDasharray="2 2" />
              <circle r="2" fill="#b8501a" />
            </g>
          );
        })}
      </svg>
    </div>
  );
}

export function Mandala({ className = "", petals = 16 }: { className?: string; petals?: number }) {
  return (
    <svg className={`lp-mandala ${className}`} viewBox="-100 -100 200 200" aria-hidden="true">
      <g fill="none" stroke="currentColor" strokeWidth="0.8">
        <circle r="96" />
        <circle r="70" strokeDasharray="2 4" />
        <circle r="40" />
        <circle r="14" />
        {Array.from({ length: petals }, (_, i) => (
          <g key={i} transform={`rotate(${(360 / petals) * i})`}>
            <path d="M0 -14 C 10 -30 10 -50 0 -70 C -10 -50 -10 -30 0 -14Z" />
            <path d="M0 -70 C 8 -80 6 -90 0 -96 C -6 -90 -8 -80 0 -70Z" />
            <circle cy="-56" r="3" />
          </g>
        ))}
        {Array.from({ length: petals }, (_, i) => (
          <path key={`o${i}`} transform={`rotate(${(360 / petals) * i + 360 / petals / 2})`} d="M0 -40 C 6 -48 6 -58 0 -64 C -6 -58 -6 -48 0 -40Z" />
        ))}
      </g>
    </svg>
  );
}

export function Tricolore({ className = "" }: { className?: string }) {
  return <span className={`lp-tricolore ${className}`} aria-hidden="true" />;
}

/** Small marigold flower used as a bullet next to eyebrows. */
export function Marigold({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="-10 -10 20 20" aria-hidden="true" className="lp-marigold">
      {Array.from({ length: 10 }, (_, i) => (
        <ellipse key={i} rx="3" ry="6" transform={`rotate(${i * 36}) translate(0 -3)`} fill={i % 2 ? "#f2c14e" : "#f08a24"} />
      ))}
      <circle r="2.6" fill="#b8501a" />
    </svg>
  );
}
