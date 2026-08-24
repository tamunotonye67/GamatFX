import { useEffect, useState } from "react";

/**
 * Live analog clock showing the current forex trading session.
 * The outer ring maps the 24-hour day, with coloured arcs for
 * Sydney / Tokyo / London / New York sessions (UTC hours).
 */

type Session = { name: string; short: string; start: number; end: number; color: string };

const SESSIONS: Session[] = [
  { name: "Sydney", short: "SYD", start: 21, end: 6, color: "#8b5cf6" },
  { name: "Tokyo", short: "TYO", start: 0, end: 9, color: "#38bdf8" },
  { name: "London", short: "LDN", start: 7, end: 16, color: "#dc3545" },
  { name: "New York", short: "NY", start: 12, end: 21, color: "#f59e0b" },
];

const R = 132;
const CX = 150;
const CY = 150;

/** Point on a circle for a given fraction (0–1) of the full turn. */
function pt(frac: number, radius: number) {
  const a = frac * Math.PI * 2 - Math.PI / 2;
  return { x: CX + Math.cos(a) * radius, y: CY + Math.sin(a) * radius };
}

/** SVG arc path across a 24-hour range (handles wrap past midnight). */
function arc(startH: number, endH: number, radius: number) {
  const span = (endH - startH + 24) % 24 || 24;
  const s = pt(startH / 24, radius);
  const e = pt(((startH + span) % 24) / 24, radius);
  const large = span > 12 ? 1 : 0;
  return `M ${s.x} ${s.y} A ${radius} ${radius} 0 ${large} 1 ${e.x} ${e.y}`;
}

function isOpen(s: Session, utcH: number) {
  return s.start < s.end ? utcH >= s.start && utcH < s.end : utcH >= s.start || utcH < s.end;
}

export default function MarketClock() {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const t = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(t);
  }, []);

  const h = now.getHours();
  const m = now.getMinutes();
  const s = now.getSeconds();
  const utcH = now.getUTCHours() + now.getUTCMinutes() / 60;

  const hourAngle = ((h % 12) + m / 60) * 30;
  const minAngle = (m + s / 60) * 6;
  const secAngle = s * 6;

  const open = SESSIONS.filter((x) => isOpen(x, utcH));
  const nowFrac = utcH / 24;
  const marker = pt(nowFrac, R + 12);

  return (
    <div
      className="group/clock relative w-full max-w-[320px] cursor-pointer select-none transition-transform duration-500 ease-[cubic-bezier(.34,1.8,.5,1)] hover:scale-[1.07] sm:max-w-[340px] xl:max-w-[370px]"
    >
      {/* Glow */}
      <div className="pointer-events-none absolute inset-0 -z-10 rounded-full bg-[radial-gradient(circle,rgba(220,53,69,0.28),transparent_65%)] blur-2xl transition-transform duration-500 group-hover/clock:scale-125" />

      <svg viewBox="0 0 300 300" className="w-full drop-shadow-2xl" role="img"
        aria-label={`Analog clock showing ${now.toLocaleTimeString()}`}>
        <defs>
          <radialGradient id="face" cx="50%" cy="38%">
            <stop offset="0%" stopColor="#22252b" />
            <stop offset="100%" stopColor="#0d0f12" />
          </radialGradient>
          <filter id="soft"><feGaussianBlur stdDeviation="2.5" /></filter>
        </defs>

        {/* Session arcs */}
        {SESSIONS.map((x, i) => (
          <path key={x.name} d={arc(x.start, x.end, R + 12 - i * 0)}
            stroke={x.color} strokeWidth={isOpen(x, utcH) ? 7 : 3}
            strokeLinecap="round" fill="none"
            opacity={isOpen(x, utcH) ? 0.95 : 0.28}
            style={{ transition: "stroke-width .4s, opacity .4s" }} />
        ))}

        {/* Now marker on the session ring */}
        <circle cx={marker.x} cy={marker.y} r="6" fill="#fff" filter="url(#soft)" opacity="0.9" />
        <circle cx={marker.x} cy={marker.y} r="4" fill="#dc3545" />

        {/* Face */}
        <circle cx={CX} cy={CY} r={R - 8} fill="url(#face)" stroke="rgba(255,255,255,0.10)" strokeWidth="1.5" />
        <circle cx={CX} cy={CY} r={R - 20} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="1" />

        {/* Ticks */}
        {Array.from({ length: 60 }).map((_, i) => {
          const major = i % 5 === 0;
          const a = (i / 60) * Math.PI * 2 - Math.PI / 2;
          const r1 = R - 26;
          const r2 = r1 - (major ? 12 : 5);
          return (
            <line key={i}
              x1={CX + Math.cos(a) * r1} y1={CY + Math.sin(a) * r1}
              x2={CX + Math.cos(a) * r2} y2={CY + Math.sin(a) * r2}
              stroke={major ? "rgba(255,255,255,0.55)" : "rgba(255,255,255,0.18)"}
              strokeWidth={major ? 2.5 : 1} strokeLinecap="round" />
          );
        })}

        {/* Numerals */}
        {[12, 3, 6, 9].map((n, i) => {
          const p = pt(i / 4, R - 52);
          return (
            <text key={n} x={p.x} y={p.y + 6} textAnchor="middle"
              fill="rgba(255,255,255,0.7)" fontSize="17" fontWeight="700"
              fontFamily="Sora, sans-serif">{n}</text>
          );
        })}

        {/* Brand mark */}
        <text x={CX} y={CY - 34} textAnchor="middle" fill="#dc3545" fontSize="11"
          fontWeight="800" letterSpacing="3" fontFamily="Inter, sans-serif">GAMAT FX</text>

        {/* Digital readout */}
        <text x={CX} y={CY + 52} textAnchor="middle" fill="rgba(255,255,255,0.92)"
          fontSize="20" fontWeight="700" fontFamily="Sora, sans-serif">
          {String(h).padStart(2, "0")}:{String(m).padStart(2, "0")}:{String(s).padStart(2, "0")}
        </text>
        <text x={CX} y={CY + 70} textAnchor="middle" fill="rgba(255,255,255,0.4)"
          fontSize="9.5" fontWeight="600" letterSpacing="1.5" fontFamily="Inter, sans-serif">
          {open.length ? `${open.map((o) => o.short).join(" · ")} OPEN` : "MARKET QUIET"}
        </text>

        {/* Hands */}
        <g style={{ transition: "transform .3s cubic-bezier(.4,2,.6,1)" }}
          transform={`rotate(${hourAngle} ${CX} ${CY})`}>
          <line x1={CX} y1={CY + 14} x2={CX} y2={CY - 56} stroke="#fff" strokeWidth="6" strokeLinecap="round" />
        </g>
        <g style={{ transition: "transform .3s cubic-bezier(.4,2,.6,1)" }}
          transform={`rotate(${minAngle} ${CX} ${CY})`}>
          <line x1={CX} y1={CY + 18} x2={CX} y2={CY - 84} stroke="#fff" strokeWidth="4" strokeLinecap="round" opacity="0.9" />
        </g>
        <g transform={`rotate(${secAngle} ${CX} ${CY})`}>
          <line x1={CX} y1={CY + 24} x2={CX} y2={CY - 94} stroke="#dc3545" strokeWidth="2" strokeLinecap="round" />
          <circle cx={CX} cy={CY - 94} r="3.5" fill="#dc3545" />
        </g>

        <circle cx={CX} cy={CY} r="7" fill="#16181c" stroke="#dc3545" strokeWidth="2.5" />
      </svg>

      {/* Legend */}
      <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
        {SESSIONS.map((x) => {
          const on = isOpen(x, utcH);
          return (
            <div key={x.name}
              className={`rounded-lg border px-1 py-2 text-center transition ${
                on ? "border-white/25 bg-white/10" : "border-white/10 bg-white/[0.03]"
              }`}>
              <span className="flex items-center justify-center gap-1">
                <span className={`h-2 w-2 rounded-full shrink-0 ${on ? "animate-pulse" : ""}`}
                  style={{ background: x.color, opacity: on ? 1 : 0.35 }} />
                <span className={`text-[10px] sm:text-[11px] font-bold whitespace-nowrap ${on ? "text-white" : "text-white/40"}`}>{x.name}</span>
              </span>
              <span className={`mt-0.5 block text-[10px] font-semibold ${on ? "text-brand-light" : "text-white/30"}`}>
                {on ? "OPEN" : "CLOSED"}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
