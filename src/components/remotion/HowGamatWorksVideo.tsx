import React from "react";
import {
  AbsoluteFill,
  Audio,
  Easing,
  Img,
  Sequence,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import {
  Award,
  BookOpenCheck,
  BrainCircuit,
  CalendarCheck,
  CheckCircle2,
  LayoutDashboard,
  LineChart,
  ShieldCheck,
  TrendingUp,
  X,
} from "lucide-react";

export const HOW_IT_WORKS_FPS = 30;
// 160.56s voiceover -> 4818 frames @ 30fps (scene timings are locked to the narration)
export const HOW_IT_WORKS_DURATION_IN_FRAMES = 4818;

/* ============================================================================
   DESIGN TOKENS
   ========================================================================== */

const C = {
  ink: "#0B0D11",
  panel: "#12151B",
  line: "rgba(255,255,255,0.08)",
  brand: "#DC3545",
  brandSoft: "#FF6B7A",
  emerald: "#34D399",
  emeraldDeep: "#059669",
  amber: "#FBBF24",
  text: "#F8FAFC",
  muted: "rgba(248,250,252,0.68)",
  faint: "rgba(248,250,252,0.42)",
  uiInk: "#16181C",
  uiMuted: "#64748B",
  uiLine: "#E2E8F0",
  uiSoft: "#F8FAFC",
};

const FONT_DISPLAY = '"Sora", "Inter", system-ui, sans-serif';
const FONT_BODY = '"Inter", system-ui, sans-serif';

const CLAMP = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const EASE_OUT = Easing.bezier(0.22, 1, 0.36, 1);
const EASE_IN_OUT = Easing.bezier(0.65, 0, 0.35, 1);

/** Frames each scene overlaps the next one for a crossfade instead of a dip to black. */
const OVERLAP = 16;

const PHOTOS = {
  aboutHero: "/images/about-hero.jpg",
  community: "/images/community.jpg",
  chartReview: "/images/gallery/chart-review.jpg",
  liveWorkshop: "/images/gallery/live-workshop.jpg",
  mentorshipSession: "/images/gallery/mentorship-session.jpg",
  tradingFloor: "/images/gallery/trading-floor.jpg",
};

/** Narration-locked scene timeline (start frame, nominal duration). */
const T = {
  problem: { from: 0, dur: 345 },
  system: { from: 345, dur: 405 },
  enroll: { from: 750, dur: 564 },
  live: { from: 1314, dur: 765 },
  journal: { from: 2079, dur: 747 },
  scale: { from: 2826, dur: 660 },
  clipA: { from: 3486, dur: 360 },
  clipB: { from: 3846, dur: 249 },
  clipC: { from: 4095, dur: 234 },
  outro: { from: 4329, dur: 489 },
};

/* ============================================================================
   MOTION PRIMITIVES
   ========================================================================== */

/** Wraps a scene with a soft scale/blur crossfade on enter and exit. */
const SceneShell: React.FC<{
  duration: number;
  children: React.ReactNode;
  enterFrames?: number;
  exitFrames?: number;
}> = ({ duration, children, enterFrames = 18, exitFrames = OVERLAP }) => {
  const frame = useCurrentFrame();
  const enter = interpolate(frame, [0, enterFrames], [0, 1], { ...CLAMP, easing: EASE_OUT });
  const exit =
    exitFrames > 0
      ? interpolate(frame, [duration - exitFrames, duration], [0, 1], {
          ...CLAMP,
          easing: Easing.in(Easing.cubic),
        })
      : 0;
  const opacity = enter * (1 - exit);
  const scale = interpolate(enter, [0, 1], [1.035, 1]) * interpolate(exit, [0, 1], [1, 0.975]);
  const blur = (1 - enter) * 8 + exit * 6;

  return (
    <AbsoluteFill
      style={{
        opacity,
        transform: `scale(${scale})`,
        filter: blur > 0.05 ? `blur(${blur}px)` : undefined,
      }}
    >
      {children}
    </AbsoluteFill>
  );
};

/** Masked word-by-word kinetic type reveal. */
const KineticText: React.FC<{
  text: string;
  start?: number;
  stagger?: number;
  highlight?: string[];
  highlightColor?: string;
  style?: React.CSSProperties;
}> = ({ text, start = 0, stagger = 3, highlight = [], highlightColor = C.brand, style }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const words = text.split(" ");

  return (
    <span style={style}>
      {words.map((word, i) => {
        const s = spring({
          frame: frame - start - i * stagger,
          fps,
          config: { damping: 18, stiffness: 140, mass: 0.7 },
        });
        const clean = word.replace(/[^A-Za-z0-9’']/g, "");
        const isHighlight = highlight.includes(clean);
        return (
          <span
            key={`${word}-${i}`}
            style={{
              display: "inline-block",
              overflow: "hidden",
              verticalAlign: "top",
              paddingBottom: "0.1em",
              marginRight: i === words.length - 1 ? 0 : "0.26em",
            }}
          >
            <span
              style={{
                display: "inline-block",
                transform: `translateY(${(1 - s) * 105}%)`,
                opacity: interpolate(s, [0, 0.35, 1], [0, 1, 1]),
                color: isHighlight ? highlightColor : undefined,
              }}
            >
              {word}
            </span>
          </span>
        );
      })}
    </span>
  );
};

/** Fade + rise reveal for any block. */
const Reveal: React.FC<{
  start?: number;
  distance?: number;
  children: React.ReactNode;
  style?: React.CSSProperties;
}> = ({ start = 0, distance = 22, children, style }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({ frame: frame - start, fps, config: { damping: 20, stiffness: 120 } });
  return (
    <div
      style={{
        opacity: interpolate(s, [0, 1], [0, 1]),
        transform: `translateY(${(1 - s) * distance}px)`,
        ...style,
      }}
    >
      {children}
    </div>
  );
};

const Eyebrow: React.FC<{ label: string; color?: string; start?: number }> = ({
  label,
  color = C.brand,
  start = 0,
}) => {
  const frame = useCurrentFrame();
  const pulse = 0.55 + 0.45 * Math.sin((frame / 30) * Math.PI * 1.4);
  return (
    <Reveal start={start} distance={12}>
      <span
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 9,
          padding: "7px 14px",
          borderRadius: 999,
          border: `1px solid ${color}55`,
          backgroundColor: `${color}1A`,
          color,
          fontFamily: FONT_BODY,
          fontSize: 12.5,
          fontWeight: 800,
          letterSpacing: "0.16em",
          textTransform: "uppercase",
        }}
      >
        <span
          style={{
            width: 7,
            height: 7,
            borderRadius: "50%",
            backgroundColor: color,
            boxShadow: `0 0 ${10 * pulse}px ${color}`,
            opacity: 0.6 + pulse * 0.4,
          }}
        />
        {label}
      </span>
    </Reveal>
  );
};

/** Animated check row used to sync bullet points with on-screen actions. */
const CheckRow: React.FC<{ label: string; at: number }> = ({ label, at }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({ frame: frame - at, fps, config: { damping: 14, stiffness: 160 } });
  const done = frame >= at;
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 12,
        opacity: interpolate(s, [0, 1], [0.38, 1]),
        transform: `translateX(${(1 - s) * -10}px)`,
      }}
    >
      <span
        style={{
          width: 24,
          height: 24,
          borderRadius: 8,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: done ? C.emerald : "rgba(255,255,255,0.08)",
          border: done ? "none" : `1px solid ${C.line}`,
          transform: `scale(${done ? interpolate(s, [0, 1], [0.6, 1]) : 1})`,
        }}
      >
        {done && <CheckCircle2 size={15} color={C.ink} strokeWidth={3} />}
      </span>
      <span style={{ color: C.text, fontFamily: FONT_BODY, fontSize: 16.5, fontWeight: 600 }}>
        {label}
      </span>
    </div>
  );
};

/** Animated number counter. */
const useCount = (from: number, to: number, start: number, end: number) => {
  const frame = useCurrentFrame();
  return interpolate(frame, [start, end], [from, to], { ...CLAMP, easing: EASE_OUT });
};

/** Character typewriter. */
const useTyped = (text: string, start: number, cps = 1.4) => {
  const frame = useCurrentFrame();
  const chars = Math.max(0, Math.floor((frame - start) * cps));
  return text.slice(0, chars);
};

/* ============================================================================
   PERSISTENT LAYERS
   ========================================================================== */

/** Living brand backdrop shared by every scene — removes the "dip to black" feel. */
const BrandBackdrop: React.FC = () => {
  const frame = useCurrentFrame();
  const t = frame / 30;
  const g1x = 22 + Math.sin(t * 0.16) * 9;
  const g1y = 28 + Math.cos(t * 0.12) * 7;
  const g2x = 78 + Math.cos(t * 0.13) * 8;
  const g2y = 72 + Math.sin(t * 0.11) * 7;

  return (
    <AbsoluteFill style={{ backgroundColor: C.ink, overflow: "hidden" }}>
      <AbsoluteFill
        style={{
          background: `radial-gradient(520px circle at ${g1x}% ${g1y}%, rgba(220,53,69,0.22), transparent 70%), radial-gradient(560px circle at ${g2x}% ${g2y}%, rgba(52,211,153,0.10), transparent 70%)`,
        }}
      />
      <AbsoluteFill
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.045) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.045) 1px, transparent 1px)",
          backgroundSize: "56px 56px",
          backgroundPosition: `${(frame * 0.25) % 56}px ${(frame * 0.18) % 56}px`,
          maskImage: "radial-gradient(ellipse at center, black 30%, transparent 78%)",
          WebkitMaskImage: "radial-gradient(ellipse at center, black 30%, transparent 78%)",
        }}
      />
      <AbsoluteFill
        style={{
          background:
            "radial-gradient(ellipse at center, transparent 55%, rgba(0,0,0,0.55) 100%)",
        }}
      />
    </AbsoluteFill>
  );
};

const LogoMark: React.FC<{ size?: number }> = ({ size = 30 }) => (
  <div
    style={{
      width: size,
      height: size,
      borderRadius: size * 0.3,
      background: `linear-gradient(135deg, ${C.brand}, #A92230)`,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      color: "#ffffff",
      fontWeight: 900,
      fontSize: size * 0.5,
      fontFamily: FONT_DISPLAY,
      boxShadow: `0 ${size * 0.25}px ${size * 0.7}px rgba(220,53,69,0.45)`,
    }}
  >
    G
  </div>
);

const BrandWatermark: React.FC = () => {
  const frame = useCurrentFrame();
  const opacity = interpolate(
    frame,
    [10, 30, T.outro.from - 10, T.outro.from + 10],
    [0, 0.92, 0.92, 0],
    CLAMP
  );
  return (
    <div
      style={{
        position: "absolute",
        top: 28,
        left: 40,
        display: "flex",
        alignItems: "center",
        gap: 10,
        zIndex: 40,
        opacity,
      }}
    >
      <LogoMark size={28} />
      <span
        style={{
          color: C.text,
          fontWeight: 800,
          fontSize: 15,
          letterSpacing: "-0.02em",
          fontFamily: FONT_DISPLAY,
        }}
      >
        GAMAT <span style={{ color: C.brand }}>Fx</span>
      </span>
    </div>
  );
};

const CHAPTERS = [
  { n: "01", label: "Enroll", from: T.enroll.from, to: T.live.from },
  { n: "02", label: "Learn Live", from: T.live.from, to: T.journal.from },
  { n: "03", label: "Journal", from: T.journal.from, to: T.scale.from },
  { n: "04", label: "Scale", from: T.scale.from, to: T.clipA.from },
];

/** Bottom chapter rail for the 4-step walkthrough + global progress hairline. */
const ChapterRail: React.FC = () => {
  const frame = useCurrentFrame();
  const railOpacity = interpolate(
    frame,
    [T.enroll.from - 10, T.enroll.from + 20, T.clipA.from - 10, T.clipA.from + 10],
    [0, 1, 1, 0],
    CLAMP
  );
  const total = interpolate(frame, [0, HOW_IT_WORKS_DURATION_IN_FRAMES], [0, 100], CLAMP);

  return (
    <>
      {railOpacity > 0.01 && (
        <div
          style={{
            position: "absolute",
            bottom: 30,
            left: "50%",
            transform: `translateX(-50%) translateY(${(1 - railOpacity) * 12}px)`,
            display: "flex",
            gap: 14,
            opacity: railOpacity,
            zIndex: 40,
          }}
        >
          {CHAPTERS.map((ch) => {
            const p = interpolate(frame, [ch.from, ch.to], [0, 1], CLAMP);
            const active = frame >= ch.from && frame < ch.to;
            return (
              <div key={ch.n} style={{ width: 150 }}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "baseline",
                    gap: 7,
                    marginBottom: 7,
                    fontFamily: FONT_BODY,
                  }}
                >
                  <span
                    style={{
                      fontSize: 11,
                      fontWeight: 800,
                      color: active ? C.brand : C.faint,
                      letterSpacing: "0.1em",
                    }}
                  >
                    {ch.n}
                  </span>
                  <span
                    style={{
                      fontSize: 12.5,
                      fontWeight: 700,
                      color: active ? C.text : C.faint,
                    }}
                  >
                    {ch.label}
                  </span>
                </div>
                <div
                  style={{
                    height: 3,
                    borderRadius: 3,
                    backgroundColor: "rgba(255,255,255,0.12)",
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      width: `${p * 100}%`,
                      height: "100%",
                      backgroundColor: p >= 1 ? C.emerald : C.brand,
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}
      <div
        style={{
          position: "absolute",
          left: 0,
          bottom: 0,
          height: 3,
          width: `${total}%`,
          background: `linear-gradient(90deg, ${C.brand}, ${C.brandSoft})`,
          zIndex: 41,
          opacity: 0.85,
        }}
      />
    </>
  );
};

/* ============================================================================
   CURSOR (coordinates are relative to fixed-size UI mocks, so clicks land)
   ========================================================================== */

type CursorKeyframe = { frame: number; x: number; y: number; click?: boolean };

const AnimatedMouseCursor: React.FC<{ keyframes: CursorKeyframe[]; showFrom?: number }> = ({
  keyframes,
  showFrom = 0,
}) => {
  const frame = useCurrentFrame();
  if (keyframes.length === 0) return null;

  let x = keyframes[0].x;
  let y = keyframes[0].y;
  for (let i = 0; i < keyframes.length - 1; i++) {
    const a = keyframes[i];
    const b = keyframes[i + 1];
    if (frame >= a.frame && frame <= b.frame) {
      const t = interpolate(frame, [a.frame, b.frame], [0, 1], { ...CLAMP, easing: EASE_IN_OUT });
      // Slight arc so the motion feels hand-driven rather than robotic
      const arc = Math.sin(t * Math.PI) * Math.min(28, Math.abs(b.x - a.x) * 0.08);
      x = a.x + (b.x - a.x) * t;
      y = a.y + (b.y - a.y) * t - arc;
      break;
    } else if (frame > b.frame) {
      x = b.x;
      y = b.y;
    }
  }

  const activeClick = keyframes.find((k) => k.click && frame >= k.frame && frame <= k.frame + 20);
  const clickProgress = activeClick
    ? interpolate(frame, [activeClick.frame, activeClick.frame + 20], [0, 1], CLAMP)
    : 0;
  const press = activeClick
    ? interpolate(
        frame,
        [activeClick.frame, activeClick.frame + 4, activeClick.frame + 10],
        [1, 0.82, 1],
        CLAMP
      )
    : 1;
  const opacity = interpolate(frame, [showFrom, showFrom + 12], [0, 1], CLAMP);

  return (
    <div
      style={{
        position: "absolute",
        left: 0,
        top: 0,
        transform: `translate3d(${x}px, ${y}px, 0)`,
        zIndex: 60,
        pointerEvents: "none",
        opacity,
      }}
    >
      {activeClick && (
        <div
          style={{
            position: "absolute",
            left: -18,
            top: -18,
            width: 40,
            height: 40,
            borderRadius: "50%",
            backgroundColor: "rgba(220,53,69,0.18)",
            border: `2px solid ${C.brand}`,
            transform: `scale(${0.3 + clickProgress * 1.3})`,
            opacity: 1 - clickProgress,
          }}
        />
      )}
      <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        style={{
          transform: `scale(${press})`,
          transformOrigin: "4px 3px",
          filter: "drop-shadow(0 6px 10px rgba(0,0,0,0.4))",
          marginLeft: -4,
          marginTop: -3,
        }}
      >
        <path
          d="M4 3L20 11.5L12.5 13.5L9.5 21L4 3Z"
          fill="#ffffff"
          stroke="#111317"
          strokeWidth="1.6"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
};

/* ============================================================================
   SHARED SCENE LAYOUT
   ========================================================================== */

const CopyColumn: React.FC<{
  step: string;
  title: string;
  highlight?: string[];
  body: string;
  accent?: string;
  width?: number;
  children?: React.ReactNode;
}> = ({ step, title, highlight = [], body, accent = C.brand, width = 430, children }) => (
  <div
    style={{
      position: "absolute",
      left: 64,
      top: "46%",
      transform: "translateY(-50%)",
      width,
      zIndex: 10,
    }}
  >
    <Eyebrow label={step} color={accent} start={4} />
    <h2
      style={{
        color: C.text,
        fontFamily: FONT_DISPLAY,
        fontSize: 44,
        fontWeight: 800,
        lineHeight: 1.1,
        letterSpacing: "-0.03em",
        margin: "18px 0 0 0",
      }}
    >
      <KineticText text={title} start={10} highlight={highlight} highlightColor={accent} />
    </h2>
    <Reveal start={34}>
      <p
        style={{
          color: C.muted,
          fontFamily: FONT_BODY,
          fontSize: 17.5,
          lineHeight: 1.6,
          margin: "16px 0 0 0",
        }}
      >
        {body}
      </p>
    </Reveal>
    {children}
  </div>
);

/** Floating app window with an entrance tilt — gives UI mocks depth. */
const UiWindow: React.FC<{
  width: number;
  height: number;
  duration: number;
  children: React.ReactNode;
  enterAt?: number;
  dark?: boolean;
}> = ({ width, height, duration, children, enterAt = 14, dark = false }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({ frame: frame - enterAt, fps, config: { damping: 22, stiffness: 90 } });
  const rotY = interpolate(s, [0, 1], [-14, -4]) + interpolate(frame, [0, duration], [0, 3]);
  const rotX = interpolate(s, [0, 1], [8, 2]);
  const drift = interpolate(frame, [0, duration], [6, -6]);

  return (
    <div
      style={{
        position: "absolute",
        right: 56,
        top: "46%",
        width,
        height,
        marginTop: -height / 2,
        perspective: 1600,
        zIndex: 10,
      }}
    >
      <div
        style={{
          width: "100%",
          height: "100%",
          position: "relative",
          borderRadius: 20,
          overflow: "hidden",
          backgroundColor: dark ? C.panel : "#ffffff",
          border: dark ? `1px solid ${C.line}` : "1px solid rgba(255,255,255,0.4)",
          boxShadow:
            "0 50px 100px -20px rgba(0,0,0,0.65), 0 30px 60px -30px rgba(220,53,69,0.35)",
          opacity: s,
          transform: `translateY(${(1 - s) * 40 + drift}px) rotateY(${rotY}deg) rotateX(${rotX}deg)`,
          transformStyle: "preserve-3d",
        }}
      >
        {children}
      </div>
    </div>
  );
};

/* ============================================================================
   SCENE 1 — THE PROBLEM (0 – 345)
   ========================================================================== */

const FRAGMENTS = [
  { text: "Random YouTube tips", x: 70, y: 96, r: -6 },
  { text: "Paid signal groups", x: 930, y: 84, r: 5 },
  { text: "17 indicators, one chart", x: 1000, y: 560, r: -4 },
  { text: "No risk plan", x: 92, y: 560, r: 4 },
  { text: "Revenge trades", x: 520, y: 616, r: -3 },
  { text: "Zero feedback", x: 520, y: 46, r: 3 },
];

const Scene1Problem: React.FC<{ duration: number }> = ({ duration }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  return (
    <SceneShell duration={duration} enterFrames={24}>
      {FRAGMENTS.map((f, i) => {
        const appear = spring({ frame: frame - 6 - i * 5, fps, config: { damping: 16 } });
        const strikeAt = 175 + i * 7;
        const strike = interpolate(frame, [strikeAt, strikeAt + 14], [0, 1], {
          ...CLAMP,
          easing: EASE_OUT,
        });
        const floatY = Math.sin((frame + i * 23) / 26) * 6;
        const floatX = Math.cos((frame + i * 17) / 34) * 4;
        return (
          <div
            key={f.text}
            style={{
              position: "absolute",
              left: f.x,
              top: f.y,
              transform: `translate(${floatX}px, ${floatY + (1 - appear) * 30}px) rotate(${f.r}deg) scale(${interpolate(appear, [0, 1], [0.8, 1])})`,
              opacity: appear * interpolate(strike, [0, 1], [1, 0.32]),
              filter: strike > 0.5 ? `blur(${(strike - 0.5) * 2}px)` : undefined,
              display: "inline-flex",
              alignItems: "center",
              gap: 9,
              padding: "10px 16px",
              borderRadius: 14,
              backgroundColor: "rgba(18,21,27,0.82)",
              border: `1px solid ${C.line}`,
              boxShadow: "0 14px 30px rgba(0,0,0,0.35)",
              fontFamily: FONT_BODY,
              fontSize: 15,
              fontWeight: 600,
              color: C.muted,
              zIndex: 5,
            }}
          >
            <span
              style={{
                width: 20,
                height: 20,
                borderRadius: 6,
                backgroundColor: "rgba(220,53,69,0.18)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <X size={12} color={C.brandSoft} strokeWidth={3} />
            </span>
            <span style={{ position: "relative" }}>
              {f.text}
              <span
                style={{
                  position: "absolute",
                  left: 0,
                  top: "55%",
                  height: 2,
                  width: `${strike * 100}%`,
                  backgroundColor: C.brand,
                }}
              />
            </span>
          </div>
        );
      })}

      <AbsoluteFill
        style={{
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
          padding: "0 150px",
          zIndex: 10,
        }}
      >
        <Eyebrow label="Why most traders struggle" start={8} />
        <h1
          style={{
            color: C.text,
            fontFamily: FONT_DISPLAY,
            fontSize: 60,
            fontWeight: 800,
            lineHeight: 1.08,
            letterSpacing: "-0.035em",
            margin: "22px 0 0 0",
          }}
        >
          <KineticText text="Information isn’t the problem." start={18} />
          <br />
          <KineticText text="Lack of structure is." start={62} highlight={["structure"]} />
        </h1>
        <Reveal start={118}>
          <p
            style={{
              color: C.muted,
              fontFamily: FONT_BODY,
              fontSize: 20,
              lineHeight: 1.55,
              margin: "22px auto 0 auto",
              maxWidth: 700,
            }}
          >
            Random content, no live application and zero accountability keep aspiring traders
            stuck in guesswork.
          </p>
        </Reveal>
      </AbsoluteFill>
    </SceneShell>
  );
};

/* ============================================================================
   SCENE 2 — THE SYSTEM (345 – 750)
   ========================================================================== */

const SYSTEM_NODES = [
  { icon: LayoutDashboard, label: "Enroll", sub: "Instant access" },
  { icon: LineChart, label: "Learn Live", sub: "Weekly sessions" },
  { icon: BrainCircuit, label: "Journal", sub: "Mentor reviews" },
  { icon: ShieldCheck, label: "Scale", sub: "With accountability" },
];

const Scene2System: React.FC<{ duration: number }> = ({ duration }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const trackWidth = 860;
  const lineStart = 90;
  const lineEnd = 230;
  const lineP = interpolate(frame, [lineStart, lineEnd], [0, 1], { ...CLAMP, easing: EASE_IN_OUT });
  const pulseP = frame > lineEnd + 10 ? ((frame - lineEnd - 10) % 80) / 80 : -1;

  return (
    <SceneShell duration={duration}>
      <AbsoluteFill style={{ alignItems: "center", paddingTop: 128, zIndex: 10 }}>
        <Eyebrow label="The GAMAT Fx method" color={C.emerald} start={4} />
        <h2
          style={{
            color: C.text,
            fontFamily: FONT_DISPLAY,
            fontSize: 52,
            fontWeight: 800,
            lineHeight: 1.1,
            letterSpacing: "-0.035em",
            margin: "20px 0 0 0",
            textAlign: "center",
            maxWidth: 980,
          }}
        >
          <KineticText text="One complete system —" start={10} />
          <br />
          <KineticText
            text="from theory to live execution."
            start={34}
            highlight={["live", "execution"]}
          />
        </h2>

        <div style={{ position: "relative", width: trackWidth, height: 150, marginTop: 64 }}>
          {/* base + progress line */}
          <div
            style={{
              position: "absolute",
              left: 40,
              right: 40,
              top: 36,
              height: 2,
              backgroundColor: "rgba(255,255,255,0.1)",
            }}
          />
          <div
            style={{
              position: "absolute",
              left: 40,
              top: 36,
              height: 2,
              width: (trackWidth - 80) * lineP,
              background: `linear-gradient(90deg, ${C.brand}, ${C.emerald})`,
              boxShadow: `0 0 14px ${C.brand}`,
            }}
          />
          {pulseP >= 0 && (
            <div
              style={{
                position: "absolute",
                left: 40 + (trackWidth - 80) * pulseP - 6,
                top: 31,
                width: 12,
                height: 12,
                borderRadius: "50%",
                backgroundColor: "#fff",
                boxShadow: `0 0 18px 6px ${C.brandSoft}`,
                opacity: interpolate(pulseP, [0, 0.1, 0.9, 1], [0, 1, 1, 0]),
              }}
            />
          )}

          {SYSTEM_NODES.map((n, i) => {
            const at = lineStart + i * ((lineEnd - lineStart) / 3) - 6;
            const s = spring({ frame: frame - at, fps, config: { damping: 12, stiffness: 160 } });
            const lit = frame >= at;
            const cx = 40 + i * ((trackWidth - 80) / 3);
            return (
              <div
                key={n.label}
                style={{
                  position: "absolute",
                  left: cx - 70,
                  top: 0,
                  width: 140,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  opacity: interpolate(s, [0, 1], [0.25, 1]),
                }}
              >
                <div
                  style={{
                    width: 72,
                    height: 72,
                    borderRadius: 22,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    backgroundColor: lit ? C.brand : C.panel,
                    border: `1px solid ${lit ? "transparent" : C.line}`,
                    boxShadow: lit ? "0 18px 40px rgba(220,53,69,0.45)" : "none",
                    transform: `scale(${interpolate(s, [0, 1], [0.7, 1])})`,
                  }}
                >
                  <n.icon size={30} color="#fff" />
                </div>
                <span
                  style={{
                    marginTop: 14,
                    fontFamily: FONT_DISPLAY,
                    fontSize: 17,
                    fontWeight: 800,
                    color: C.text,
                  }}
                >
                  {n.label}
                </span>
                <span
                  style={{ marginTop: 3, fontFamily: FONT_BODY, fontSize: 13, color: C.faint }}
                >
                  0{i + 1} · {n.sub}
                </span>
              </div>
            );
          })}
        </div>

        <Reveal start={270}>
          <p
            style={{
              marginTop: 26,
              color: C.muted,
              fontFamily: FONT_BODY,
              fontSize: 19,
              textAlign: "center",
            }}
          >
            Here’s how it actually works — from day one.
          </p>
        </Reveal>
      </AbsoluteFill>
    </SceneShell>
  );
};

/* ============================================================================
   SCENE 3 — STEP 01 ENROLL (750 – 1314)
   Mock is a fixed 640×410 canvas, so cursor targets are exact.
   ========================================================================== */

const Scene3Enroll: React.FC<{ duration: number }> = ({ duration }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const coursesAt = 124;
  const downloadAt = 334;
  const activeTab = frame >= coursesAt ? "courses" : "overview";
  const dlProgress = interpolate(frame, [downloadAt + 4, downloadAt + 44], [0, 1], {
    ...CLAMP,
    easing: EASE_IN_OUT,
  });
  const downloaded = frame >= downloadAt + 44;
  const toast = spring({ frame: frame - (downloadAt + 50), fps, config: { damping: 16 } });
  const toastOut = interpolate(frame, [downloadAt + 170, downloadAt + 190], [1, 0], CLAMP);
  const headerSwap = interpolate(frame, [coursesAt, coursesAt + 12], [0, 1], CLAMP);
  const courseProgress = useCount(0, 18, coursesAt + 10, coursesAt + 70);

  const cursor: CursorKeyframe[] = [
    { frame: 30, x: 430, y: 330 },
    { frame: coursesAt - 4, x: 86, y: 106, click: true },
    { frame: 230, x: 400, y: 140 },
    { frame: downloadAt - 4, x: 552, y: 213, click: true },
    { frame: 450, x: 420, y: 288 },
    { frame: 540, x: 470, y: 330 },
  ];

  const sidebar = [
    { id: "overview", label: "Overview", icon: LayoutDashboard },
    { id: "courses", label: "My Courses", icon: BookOpenCheck },
    { id: "journal", label: "Trade Journal", icon: TrendingUp },
    { id: "events", label: "My Events", icon: CalendarCheck },
    { id: "certs", label: "Certificates", icon: Award },
  ];

  const cards = [
    {
      title: "Module 01 · Market Structure & Liquidity",
      sub: "12 HD lessons · Ready to stream",
      right: <span style={{ fontSize: 12, fontWeight: 800, color: C.brand }}>Watch →</span>,
    },
    {
      title: "PDF Workbooks & Pre-Trade Checklists",
      sub: "Institutional execution playbook",
      right: (
        <span
          style={{
            position: "relative",
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            width: 112,
            height: 30,
            borderRadius: 9,
            overflow: "hidden",
            backgroundColor: downloaded ? C.emerald : C.uiInk,
            color: downloaded ? C.uiInk : "#fff",
            fontSize: 11.5,
            fontWeight: 800,
          }}
        >
          {!downloaded && dlProgress > 0 && (
            <span
              style={{
                position: "absolute",
                left: 0,
                top: 0,
                bottom: 0,
                width: `${dlProgress * 100}%`,
                backgroundColor: C.brand,
              }}
            />
          )}
          <span style={{ position: "relative" }}>
            {downloaded ? "Downloaded ✓" : dlProgress > 0 ? `${Math.round(dlProgress * 100)}%` : "Download PDF"}
          </span>
        </span>
      ),
      highlight: downloaded,
    },
    {
      title: "Private Trader Community",
      sub: "Daily markups & live Q&A channels",
      right: <span style={{ fontSize: 11.5, fontWeight: 800, color: C.emeraldDeep }}>● 1.2k online</span>,
    },
  ];

  return (
    <SceneShell duration={duration}>
      <CopyColumn
        step="Step 01 · Enroll"
        title="Enroll & get instant access"
        highlight={["instant", "access"]}
        body="The moment you enroll, your full dashboard unlocks — structured modules, workbooks, checklists and the private community."
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 12, marginTop: 26 }}>
          <CheckRow label="HD video modules" at={coursesAt + 8} />
          <CheckRow label="Workbooks & checklists" at={downloadAt + 44} />
          <CheckRow label="Private trader community" at={450} />
        </div>
      </CopyColumn>

      <UiWindow width={640} height={410} duration={duration}>
        {/* top bar */}
        <div
          style={{
            position: "absolute",
            left: 0,
            top: 0,
            right: 0,
            height: 36,
            borderBottom: `1px solid ${C.uiLine}`,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "0 16px",
            backgroundColor: "#fff",
            fontFamily: FONT_BODY,
          }}
        >
          <div style={{ display: "flex", gap: 6 }}>
            {["#ef4444", "#f59e0b", "#10b981"].map((c) => (
              <span key={c} style={{ width: 9, height: 9, borderRadius: "50%", backgroundColor: c }} />
            ))}
          </div>
          <span style={{ fontSize: 11, fontWeight: 700, color: C.uiMuted }}>
            gamatfxacademy.com/dashboard
          </span>
          <span style={{ fontSize: 11, fontWeight: 800, color: C.emeraldDeep }}>● Enrolled</span>
        </div>

        {/* sidebar */}
        <div
          style={{
            position: "absolute",
            left: 0,
            top: 36,
            width: 170,
            bottom: 0,
            backgroundColor: "#F1F5F9",
            borderRight: `1px solid ${C.uiLine}`,
          }}
        />
        {sidebar.map((item, i) => {
          const isActive = activeTab === item.id;
          return (
            <div
              key={item.id}
              style={{
                position: "absolute",
                left: 12,
                top: 50 + i * 38,
                width: 146,
                height: 32,
                borderRadius: 10,
                display: "flex",
                alignItems: "center",
                gap: 9,
                padding: "0 11px",
                backgroundColor: isActive ? C.brand : "transparent",
                color: isActive ? "#fff" : "#334155",
                fontFamily: FONT_BODY,
                fontSize: 12.5,
                fontWeight: 700,
                boxShadow: isActive ? "0 8px 18px rgba(220,53,69,0.35)" : "none",
              }}
            >
              <item.icon size={15} />
              {item.label}
            </div>
          );
        })}

        {/* header */}
        <div style={{ position: "absolute", left: 190, top: 52, right: 20, fontFamily: FONT_BODY }}>
          <div style={{ position: "relative", height: 22 }}>
            <div style={{ position: "absolute", fontSize: 16, fontWeight: 800, color: C.uiInk, opacity: 1 - headerSwap }}>
              Student Workspace
            </div>
            <div style={{ position: "absolute", fontSize: 16, fontWeight: 800, color: C.uiInk, opacity: headerSwap }}>
              My Courses & Workbooks
            </div>
          </div>
          <div style={{ fontSize: 11.5, color: C.uiMuted, marginTop: 2 }}>
            Institutional Forex Mentorship · Full access
          </div>
          <span
            style={{
              position: "absolute",
              right: 0,
              top: 2,
              padding: "4px 10px",
              borderRadius: 999,
              backgroundColor: "#ECFDF5",
              color: C.emeraldDeep,
              fontSize: 11,
              fontWeight: 800,
            }}
          >
            Unlocked
          </span>
        </div>

        {/* cards */}
        {cards.map((card, j) => {
          const s = spring({ frame: frame - 26 - j * 6, fps, config: { damping: 18 } });
          return (
            <div
              key={card.title}
              style={{
                position: "absolute",
                left: 190,
                top: 106 + j * 74,
                width: 430,
                height: 62,
                borderRadius: 14,
                border: `1px solid ${card.highlight ? C.emerald : C.uiLine}`,
                backgroundColor: card.highlight ? "#ECFDF5" : C.uiSoft,
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "0 14px 0 16px",
                fontFamily: FONT_BODY,
                opacity: s,
                transform: `translateY(${(1 - s) * 14}px)`,
              }}
            >
              <div>
                <div style={{ fontSize: 13, fontWeight: 800, color: C.uiInk }}>{card.title}</div>
                <div style={{ fontSize: 11.5, color: C.uiMuted, marginTop: 2 }}>{card.sub}</div>
              </div>
              {card.right}
            </div>
          );
        })}

        {/* course progress */}
        <div
          style={{
            position: "absolute",
            left: 190,
            top: 338,
            width: 430,
            fontFamily: FONT_BODY,
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11.5, fontWeight: 700, color: C.uiMuted }}>
            <span>Course progress</span>
            <span style={{ color: C.uiInk }}>{Math.round(courseProgress)}%</span>
          </div>
          <div style={{ marginTop: 7, height: 7, borderRadius: 7, backgroundColor: C.uiLine, overflow: "hidden" }}>
            <div style={{ width: `${courseProgress}%`, height: "100%", backgroundColor: C.brand, borderRadius: 7 }} />
          </div>
        </div>

        {/* toast */}
        <div
          style={{
            position: "absolute",
            right: 18,
            bottom: 16,
            padding: "10px 14px",
            borderRadius: 12,
            backgroundColor: C.uiInk,
            color: "#fff",
            fontFamily: FONT_BODY,
            fontSize: 12,
            fontWeight: 700,
            display: "flex",
            alignItems: "center",
            gap: 8,
            boxShadow: "0 14px 30px rgba(0,0,0,0.3)",
            opacity: toast * toastOut,
            transform: `translateY(${(1 - toast) * 20}px)`,
          }}
        >
          <CheckCircle2 size={15} color={C.emerald} /> Workbook saved to your library
        </div>

        <AnimatedMouseCursor keyframes={cursor} showFrom={24} />
      </UiWindow>
    </SceneShell>
  );
};

/* ============================================================================
   SCENE 4 — STEP 02 LEARN LIVE (1314 – 2079)
   Self-drawing candlestick chart with a liquidity sweep → BOS → entry story.
   ========================================================================== */

type Candle = { open: number; close: number; high: number; low: number };

const CANDLES: Candle[] = (() => {
  const out: Candle[] = [];
  let prev = 1.0902;
  for (let i = 0; i < 44; i++) {
    let target: number;
    if (i <= 14) target = 1.0902 - (i / 14) * 0.0048;
    else if (i < 28) target = 1.0857 + Math.sin(i * 1.3) * 0.0005;
    else if (i === 28) target = 1.0849;
    else target = 1.085 + ((i - 28) / 15) * 0.0062;
    const close = target + Math.sin(i * 2.1) * 0.00035;
    const open = prev;
    const wick = 0.00018 + Math.abs(Math.sin(i * 1.7)) * 0.00035;
    const high = Math.max(open, close) + wick;
    const low = i === 28 ? 1.0832 : Math.min(open, close) - wick * 0.9;
    out.push({ open, close, high, low });
    prev = close;
  }
  return out;
})();

const SWEEP_INDEX = 28;
const ENTRY_INDEX = 30;
const RANGE_HIGH = Math.max(...CANDLES.slice(15, 28).map((c) => c.high));
const BOS_INDEX = CANDLES.findIndex((c, i) => i > SWEEP_INDEX && c.close > RANGE_HIGH);
const LIQUIDITY_LEVEL = 1.085;

const LiveChart: React.FC<{ width: number; height: number }> = ({ width, height }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const min = 1.0826;
  const max = 1.0922;
  const y = (p: number) => height - ((p - min) / (max - min)) * height;
  const step = width / CANDLES.length;
  const candleAt = (i: number) => 24 + i * 7;
  const xOf = (i: number) => i * step + step / 2;

  const liqAt = candleAt(20);
  const liqP = interpolate(frame, [liqAt, liqAt + 24], [0, 1], { ...CLAMP, easing: EASE_OUT });
  const sweepAt = candleAt(SWEEP_INDEX) + 6;
  const sweepS = spring({ frame: frame - sweepAt, fps, config: { damping: 10 } });
  const entryAt = candleAt(ENTRY_INDEX) + 6;
  const entryS = spring({ frame: frame - entryAt, fps, config: { damping: 14 } });
  const bosAt = candleAt(Math.max(BOS_INDEX, 0)) + 6;
  const bosP = interpolate(frame, [bosAt, bosAt + 18], [0, 1], { ...CLAMP, easing: EASE_OUT });
  const tpAt = entryAt + 12;
  const tpP = interpolate(frame, [tpAt, tpAt + 20], [0, 1], CLAMP);
  const lastAt = candleAt(CANDLES.length - 1) + 14;
  const rS = spring({ frame: frame - lastAt, fps, config: { damping: 12 } });
  const r = useCount(0, 3.2, lastAt, lastAt + 40);

  const tpTop = y(1.0916);
  const tpBottom = y(1.0906);

  return (
    <svg width={width} height={height} style={{ overflow: "visible" }}>
      {/* grid */}
      {[0.2, 0.4, 0.6, 0.8].map((g) => (
        <line key={g} x1={0} x2={width} y1={height * g} y2={height * g} stroke="rgba(255,255,255,0.06)" />
      ))}

      {/* TP zone */}
      <rect
        x={xOf(ENTRY_INDEX)}
        y={tpTop}
        width={(width - xOf(ENTRY_INDEX)) * tpP}
        height={tpBottom - tpTop}
        fill="rgba(52,211,153,0.14)"
        stroke="rgba(52,211,153,0.5)"
        strokeDasharray="4 4"
      />
      <text x={width - 6} y={tpTop - 6} textAnchor="end" fill={C.emerald} fontSize={11} fontWeight={800} fontFamily={FONT_BODY} opacity={tpP}>
        TAKE PROFIT
      </text>

      {/* liquidity line */}
      <line
        x1={xOf(15)}
        x2={xOf(15) + (width - xOf(15)) * liqP}
        y1={y(LIQUIDITY_LEVEL)}
        y2={y(LIQUIDITY_LEVEL)}
        stroke={C.amber}
        strokeWidth={1.5}
        strokeDasharray="6 5"
      />
      <text x={xOf(15)} y={y(LIQUIDITY_LEVEL) + 18} fill={C.amber} fontSize={11} fontWeight={800} fontFamily={FONT_BODY} opacity={liqP}>
        SELL-SIDE LIQUIDITY
      </text>

      {/* BOS line */}
      {BOS_INDEX > 0 && (
        <>
          <line
            x1={xOf(18)}
            x2={xOf(18) + (xOf(BOS_INDEX) - xOf(18)) * bosP}
            y1={y(RANGE_HIGH)}
            y2={y(RANGE_HIGH)}
            stroke="rgba(255,255,255,0.7)"
            strokeWidth={1.2}
          />
          <text x={xOf(BOS_INDEX) + 6} y={y(RANGE_HIGH) + 4} fill="#fff" fontSize={11} fontWeight={800} fontFamily={FONT_BODY} opacity={bosP}>
            BOS
          </text>
        </>
      )}

      {/* candles */}
      {CANDLES.map((c, i) => {
        const at = candleAt(i);
        const p = interpolate(frame, [at, at + 6], [0, 1], { ...CLAMP, easing: EASE_OUT });
        if (p <= 0) return null;
        const up = c.close >= c.open;
        const color = up ? C.emerald : C.brand;
        const bodyTop = y(Math.max(c.open, c.open + (c.close - c.open) * p));
        const bodyBottom = y(Math.min(c.open, c.open + (c.close - c.open) * p));
        const cx = xOf(i);
        return (
          <g key={i} opacity={interpolate(p, [0, 0.3], [0, 1], CLAMP)}>
            <line x1={cx} x2={cx} y1={y(c.high)} y2={y(c.low)} stroke={color} strokeWidth={1.3} />
            <rect
              x={cx - step * 0.3}
              y={bodyTop}
              width={step * 0.6}
              height={Math.max(1.5, bodyBottom - bodyTop)}
              rx={1.5}
              fill={color}
            />
          </g>
        );
      })}

      {/* sweep marker */}
      <g opacity={sweepS} transform={`translate(${xOf(SWEEP_INDEX)}, ${y(CANDLES[SWEEP_INDEX].low)})`}>
        <circle r={10 + (1 - sweepS) * 14} fill="none" stroke={C.amber} strokeWidth={2} />
        <circle r={4} fill={C.amber} />
        <text x={14} y={22} fill={C.amber} fontSize={12} fontWeight={800} fontFamily={FONT_BODY}>
          Liquidity sweep
        </text>
      </g>

      {/* entry marker */}
      <g
        opacity={entryS}
        transform={`translate(${xOf(ENTRY_INDEX)}, ${y(CANDLES[ENTRY_INDEX].low) + 26 + (1 - entryS) * 12})`}
      >
        <path d="M0 -14 L7 -4 L-7 -4 Z" fill={C.emerald} />
        <rect x={-26} y={0} width={52} height={20} rx={6} fill={C.emerald} />
        <text x={0} y={14} textAnchor="middle" fill={C.ink} fontSize={11} fontWeight={900} fontFamily={FONT_BODY}>
          ENTRY
        </text>
      </g>

      {/* R badge */}
      <g opacity={rS} transform={`translate(${width - 70}, ${tpBottom + 34}) scale(${interpolate(rS, [0, 1], [0.7, 1])})`}>
        <rect x={-46} y={-18} width={92} height={36} rx={11} fill={C.emerald} />
        <text x={0} y={6} textAnchor="middle" fill={C.ink} fontSize={17} fontWeight={900} fontFamily={FONT_DISPLAY}>
          +{r.toFixed(1)}R
        </text>
      </g>
    </svg>
  );
};

const Scene4Live: React.FC<{ duration: number }> = ({ duration }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const livePulse = 0.5 + 0.5 * Math.sin((frame / 30) * Math.PI * 2);
  const photo = spring({ frame: frame - 380, fps, config: { damping: 18 } });
  const photoZoom = interpolate(frame, [380, duration], [1.12, 1.0], CLAMP);

  return (
    <SceneShell duration={duration}>
      <CopyColumn
        step="Step 02 · Weekly live sessions"
        title="Learn, then apply it live"
        highlight={["live"]}
        body="Watch order flow, liquidity sweeps and market structure unfold in real time — and learn exactly why a setup qualifies, and when to stay out."
        width={400}
      >
        <div
          style={{
            marginTop: 24,
            width: 380,
            height: 132,
            borderRadius: 16,
            overflow: "hidden",
            position: "relative",
            border: `1px solid ${C.line}`,
            opacity: photo,
            transform: `translateY(${(1 - photo) * 24}px)`,
          }}
        >
          <Img
            src={PHOTOS.liveWorkshop}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              transform: `scale(${photoZoom})`,
            }}
          />
          <div
            style={{
              position: "absolute",
              inset: 0,
              background: "linear-gradient(0deg, rgba(11,13,17,0.9), rgba(11,13,17,0.1) 70%)",
            }}
          />
          <span
            style={{
              position: "absolute",
              left: 14,
              bottom: 12,
              color: C.text,
              fontFamily: FONT_BODY,
              fontSize: 13,
              fontWeight: 700,
            }}
          >
            Live mentor breakdowns · London & New York
          </span>
        </div>
      </CopyColumn>

      <UiWindow width={690} height={420} duration={duration} dark>
        <div
          style={{
            position: "absolute",
            left: 22,
            right: 22,
            top: 18,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            fontFamily: FONT_BODY,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 7,
                padding: "5px 11px",
                borderRadius: 8,
                backgroundColor: C.brand,
                color: "#fff",
                fontSize: 11,
                fontWeight: 900,
                letterSpacing: "0.08em",
              }}
            >
              <span style={{ width: 7, height: 7, borderRadius: "50%", backgroundColor: "#fff", opacity: 0.4 + livePulse * 0.6 }} />
              LIVE
            </span>
            <span style={{ color: C.text, fontSize: 14, fontWeight: 800 }}>EURUSD · M15</span>
          </div>
          <span
            style={{
              padding: "5px 12px",
              borderRadius: 999,
              border: `1px solid ${C.line}`,
              color: C.muted,
              fontSize: 11.5,
              fontWeight: 700,
            }}
          >
            London → New York session
          </span>
        </div>
        <div style={{ position: "absolute", left: 22, top: 70 }}>
          <LiveChart width={646} height={320} />
        </div>
      </UiWindow>
    </SceneShell>
  );
};

/* ============================================================================
   SCENE 5 — STEP 03 JOURNAL (2079 – 2826)
   Fixed 600×400 mock.
   ========================================================================== */

const JOURNAL_FIELDS = [
  { label: "Pair", value: "EURUSD · Buy", at: 60 },
  { label: "Entry", value: "1.08450", at: 120 },
  { label: "Stop / Target", value: "20p / 60p", at: 180 },
  { label: "Risk : Reward", value: "1 : 3", at: 240 },
];

const Scene5Journal: React.FC<{ duration: number }> = ({ duration }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const logAt = 336;
  const logged = frame >= logAt;
  const logPop = spring({ frame: frame - logAt, fps, config: { damping: 9, stiffness: 200 } });
  const feedback = spring({ frame: frame - 400, fps, config: { damping: 18 } });
  const quote = useTyped("Clean confirmation entry. Risk held at 1% — zero emotional chasing.", 420, 0.9);
  const winRate = useCount(0, 74, 360, 470);
  const avgR = useCount(0, 2.4, 360, 470);
  const rules = useCount(0, 96, 360, 470);

  const cursor: CursorKeyframe[] = [
    { frame: 24, x: 320, y: 300 },
    { frame: JOURNAL_FIELDS[0].at - 4, x: 86, y: 101, click: true },
    { frame: JOURNAL_FIELDS[1].at - 4, x: 228, y: 101, click: true },
    { frame: JOURNAL_FIELDS[2].at - 4, x: 370, y: 101, click: true },
    { frame: JOURNAL_FIELDS[3].at - 4, x: 512, y: 101, click: true },
    { frame: logAt - 4, x: 520, y: 171, click: true },
    { frame: 470, x: 330, y: 256 },
    { frame: 620, x: 360, y: 346 },
  ];

  return (
    <SceneShell duration={duration}>
      <CopyColumn
        step="Step 03 · Journal & review"
        title="Journal every trade. Get it reviewed."
        highlight={["reviewed"]}
        body="Log entry, stop, target and risk-to-reward in your Trade Journal so mentors can audit every setup and sharpen your habits."
        width={420}
      />

      <UiWindow width={600} height={400} duration={duration}>
        {/* header */}
        <div
          style={{
            position: "absolute",
            left: 20,
            right: 20,
            top: 20,
            height: 32,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            borderBottom: `1px solid ${C.uiLine}`,
            fontFamily: FONT_BODY,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 9, paddingBottom: 12 }}>
            <BrainCircuit size={18} color={C.brand} />
            <span style={{ fontSize: 15, fontWeight: 800, color: C.uiInk }}>Trade Journal</span>
          </div>
          <span style={{ fontSize: 11.5, fontWeight: 700, color: C.uiMuted, paddingBottom: 12 }}>
            Week 3 · 12 trades logged
          </span>
        </div>

        {/* fields */}
        {JOURNAL_FIELDS.map((f, k) => {
          const typed = useTypedStatic(f.value, f.at, frame);
          const focused = frame >= f.at - 4 && frame < f.at + 40;
          return (
            <div
              key={f.label}
              style={{
                position: "absolute",
                left: 20 + k * 142,
                top: 72,
                width: 132,
                height: 58,
                borderRadius: 12,
                border: `1.5px solid ${focused ? C.brand : C.uiLine}`,
                backgroundColor: focused ? "#FFF5F6" : C.uiSoft,
                padding: "9px 12px",
                boxSizing: "border-box",
                fontFamily: FONT_BODY,
              }}
            >
              <div style={{ fontSize: 10.5, fontWeight: 700, color: C.uiMuted }}>{f.label}</div>
              <div style={{ fontSize: 14, fontWeight: 800, color: C.uiInk, marginTop: 4, height: 18 }}>
                {typed}
                {focused && typed.length < f.value.length && (
                  <span style={{ display: "inline-block", width: 2, height: 15, marginLeft: 1, backgroundColor: C.brand, verticalAlign: "middle" }} />
                )}
              </div>
            </div>
          );
        })}

        {/* setup row */}
        <div
          style={{
            position: "absolute",
            left: 20,
            top: 146,
            width: 560,
            height: 50,
            borderRadius: 12,
            backgroundColor: C.uiSoft,
            border: `1px solid ${C.uiLine}`,
            display: "flex",
            alignItems: "center",
            gap: 8,
            padding: "0 12px",
            boxSizing: "border-box",
            fontFamily: FONT_BODY,
          }}
        >
          {["London sweep", "M5 FVG", "1% risk"].map((tag, i) => {
            const s = spring({ frame: frame - (270 + i * 10), fps, config: { damping: 14 } });
            return (
              <span
                key={tag}
                style={{
                  padding: "5px 10px",
                  borderRadius: 8,
                  backgroundColor: "#fff",
                  border: `1px solid ${C.uiLine}`,
                  fontSize: 11.5,
                  fontWeight: 700,
                  color: "#334155",
                  opacity: s,
                  transform: `scale(${interpolate(s, [0, 1], [0.7, 1])})`,
                }}
              >
                {tag}
              </span>
            );
          })}
        </div>
        <div
          style={{
            position: "absolute",
            left: 460,
            top: 156,
            width: 110,
            height: 30,
            borderRadius: 9,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: logged ? C.emerald : C.brand,
            color: logged ? C.uiInk : "#fff",
            fontFamily: FONT_BODY,
            fontSize: 12,
            fontWeight: 800,
            transform: `scale(${logged ? interpolate(logPop, [0, 1], [0.85, 1]) : 1})`,
            boxShadow: logged ? "0 8px 20px rgba(52,211,153,0.4)" : "0 8px 20px rgba(220,53,69,0.35)",
          }}
        >
          {logged ? "Logged ✓" : "+ Log trade"}
        </div>

        {/* mentor feedback */}
        <div
          style={{
            position: "absolute",
            left: 20,
            top: 212,
            width: 560,
            height: 84,
            borderRadius: 14,
            backgroundColor: "#ECFDF5",
            border: "1px solid #A7F3D0",
            display: "flex",
            alignItems: "flex-start",
            gap: 12,
            padding: "14px 16px",
            boxSizing: "border-box",
            fontFamily: FONT_BODY,
            opacity: feedback,
            transform: `translateY(${(1 - feedback) * 18}px)`,
          }}
        >
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: 12,
              backgroundColor: C.emeraldDeep,
              color: "#fff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 13,
              fontWeight: 800,
              flexShrink: 0,
            }}
          >
            MR
          </div>
          <div>
            <div style={{ fontSize: 12.5, fontWeight: 800, color: "#065F46" }}>
              Mentor review · Approved execution
            </div>
            <div style={{ fontSize: 12.5, color: "#047857", marginTop: 4, lineHeight: 1.45 }}>
              “{quote}”
            </div>
          </div>
        </div>

        {/* stats */}
        {[
          { label: "Win rate", value: `${Math.round(winRate)}%` },
          { label: "Average R", value: `${avgR.toFixed(1)}R` },
          { label: "Rules followed", value: `${Math.round(rules)}%` },
        ].map((s, i) => (
          <div
            key={s.label}
            style={{
              position: "absolute",
              left: 20 + i * 190,
              top: 312,
              width: 180,
              height: 68,
              borderRadius: 12,
              border: `1px solid ${C.uiLine}`,
              backgroundColor: C.uiSoft,
              padding: "12px 14px",
              boxSizing: "border-box",
              fontFamily: FONT_BODY,
            }}
          >
            <div style={{ fontSize: 10.5, fontWeight: 700, color: C.uiMuted }}>{s.label}</div>
            <div style={{ fontSize: 22, fontWeight: 900, color: C.uiInk, marginTop: 2, fontFamily: FONT_DISPLAY }}>
              {s.value}
            </div>
          </div>
        ))}

        <AnimatedMouseCursor keyframes={cursor} showFrom={20} />
      </UiWindow>
    </SceneShell>
  );
};

/** Non-hook typewriter helper (safe to call inside .map). */
function useTypedStatic(text: string, start: number, frame: number) {
  const chars = Math.max(0, Math.floor((frame - start) * 1.2));
  return text.slice(0, chars);
}

/* ============================================================================
   SCENE 6 — STEP 04 SCALE (2826 – 3486)
   Fixed 600×400 mock.
   ========================================================================== */

const EQUITY = [0, 0.6, 0.4, 1.1, 1.6, 1.3, 2.1, 2.6, 2.4, 3.2, 3.8, 3.6, 4.4, 5.1];

const Scene6Scale: React.FC<{ duration: number }> = ({ duration }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const checkpoints = ["Day 1", "Day 2", "Day 3", "Day 4", "Quiz"];
  const tickAt = (i: number) => 40 + i * 28;
  const allDone = frame >= tickAt(checkpoints.length - 1);
  const progress = interpolate(frame, [tickAt(0), tickAt(checkpoints.length - 1)], [0, 1], CLAMP);
  const badge = spring({ frame: frame - (tickAt(4) + 8), fps, config: { damping: 12 } });

  const certAt = 300;
  const certOpen = frame >= certAt;
  const certPop = spring({ frame: frame - certAt, fps, config: { damping: 12 } });
  const shine = interpolate(frame, [certAt + 4, certAt + 34], [-40, 140], CLAMP);

  const eqP = interpolate(frame, [340, 470], [0, 1], { ...CLAMP, easing: EASE_IN_OUT });
  const riskFill = interpolate(frame, [360, 420], [0, 1], { ...CLAMP, easing: EASE_OUT });

  const eqW = 260;
  const eqH = 70;
  const eqPts = EQUITY.map((v, i) => [
    (i / (EQUITY.length - 1)) * eqW,
    eqH - (v / 5.1) * eqH,
  ]);
  const eqPath = eqPts.map((p, i) => `${i === 0 ? "M" : "L"}${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join(" ");
  const eqLen = 420;

  const cursor: CursorKeyframe[] = [
    { frame: 30, x: 420, y: 330 },
    { frame: 160, x: 300, y: 86 },
    { frame: certAt - 4, x: 512, y: 192, click: true },
    { frame: 420, x: 430, y: 330 },
    { frame: 580, x: 470, y: 340 },
  ];

  return (
    <SceneShell duration={duration}>
      <CopyColumn
        step="Step 04 · Scale"
        title="Scale with accountability"
        highlight={["accountability"]}
        accent={C.emerald}
        body="Earn verified GAMAT Fx certificates, then graduate to live capital or funded challenges — with a rules-based plan and ongoing mentor support."
        width={420}
      />

      <UiWindow width={600} height={400} duration={duration}>
        <div
          style={{
            position: "absolute",
            left: 20,
            right: 20,
            top: 20,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            fontFamily: FONT_BODY,
          }}
        >
          <span style={{ fontSize: 15, fontWeight: 800, color: C.uiInk }}>Program progress</span>
          <span
            style={{
              padding: "4px 10px",
              borderRadius: 999,
              backgroundColor: "#ECFDF5",
              color: C.emeraldDeep,
              fontSize: 11,
              fontWeight: 800,
              opacity: badge,
              transform: `scale(${interpolate(badge, [0, 1], [0.6, 1])})`,
            }}
          >
            Fully attended ✓
          </span>
        </div>

        {checkpoints.map((c, i) => {
          const at = tickAt(i);
          const s = spring({ frame: frame - at, fps, config: { damping: 12, stiffness: 180 } });
          const done = frame >= at;
          return (
            <div
              key={c}
              style={{
                position: "absolute",
                left: 20 + i * 114,
                top: 64,
                width: 104,
                height: 34,
                borderRadius: 10,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 6,
                backgroundColor: done ? "#F0FDF4" : C.uiSoft,
                border: `1px solid ${done ? "#BBF7D0" : C.uiLine}`,
                color: done ? "#15803D" : C.uiMuted,
                fontFamily: FONT_BODY,
                fontSize: 12,
                fontWeight: 800,
                transform: `scale(${done ? interpolate(s, [0, 1], [0.85, 1]) : 1})`,
              }}
            >
              {done && <CheckCircle2 size={13} />}
              {c}
            </div>
          );
        })}
        <div
          style={{
            position: "absolute",
            left: 20,
            top: 110,
            width: 560,
            height: 5,
            borderRadius: 5,
            backgroundColor: C.uiLine,
            overflow: "hidden",
          }}
        >
          <div style={{ width: `${progress * 100}%`, height: "100%", backgroundColor: allDone ? C.emerald : C.brand }} />
        </div>

        {/* certificate */}
        <div
          style={{
            position: "absolute",
            left: 20,
            top: 132,
            width: 560,
            height: 120,
            borderRadius: 16,
            overflow: "hidden",
            border: `1.5px solid ${certOpen ? C.emerald : C.uiLine}`,
            background: certOpen
              ? "linear-gradient(135deg, #ECFDF5, #FFFFFF 60%)"
              : C.uiSoft,
            display: "flex",
            alignItems: "center",
            gap: 16,
            padding: "0 20px",
            boxSizing: "border-box",
            fontFamily: FONT_BODY,
            transform: `scale(${certOpen ? interpolate(certPop, [0, 1], [0.97, 1]) : 1})`,
          }}
        >
          <div
            style={{
              width: 64,
              height: 64,
              borderRadius: "50%",
              background: `linear-gradient(135deg, ${C.brand}, #A92230)`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 10px 24px rgba(220,53,69,0.35)",
              flexShrink: 0,
            }}
          >
            <Award size={30} color="#fff" />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 15, fontWeight: 800, color: C.uiInk }}>Verified GAMAT Fx Certificate</div>
            <div style={{ fontSize: 12, color: C.uiMuted, marginTop: 3 }}>
              Serial EVT-GMX-2841 · verify at gamatfxacademy.com
            </div>
          </div>
          <span
            style={{
              width: 128,
              height: 32,
              borderRadius: 9,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: certOpen ? C.emeraldDeep : C.uiInk,
              color: "#fff",
              fontSize: 11.5,
              fontWeight: 800,
              flexShrink: 0,
            }}
          >
            {certOpen ? "Certificate ready ✓" : "View certificate"}
          </span>
          {certOpen && (
            <div
              style={{
                position: "absolute",
                top: 0,
                bottom: 0,
                left: `${shine}%`,
                width: 80,
                background: "linear-gradient(100deg, transparent, rgba(255,255,255,0.85), transparent)",
                transform: "skewX(-18deg)",
              }}
            />
          )}
        </div>

        {/* risk rules */}
        <div
          style={{
            position: "absolute",
            left: 20,
            top: 270,
            width: 270,
            height: 110,
            borderRadius: 14,
            border: `1px solid ${C.uiLine}`,
            backgroundColor: C.uiSoft,
            padding: "14px 16px",
            boxSizing: "border-box",
            fontFamily: FONT_BODY,
          }}
        >
          <div style={{ fontSize: 11, fontWeight: 800, color: C.uiMuted, letterSpacing: "0.06em" }}>RISK RULES</div>
          {[
            { label: "Max risk / trade", value: "1.0%", w: 0.33 },
            { label: "Daily drawdown cap", value: "2.0%", w: 0.5 },
          ].map((r) => (
            <div key={r.label} style={{ marginTop: 10 }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11.5, fontWeight: 700, color: "#334155" }}>
                <span>{r.label}</span>
                <span>{r.value}</span>
              </div>
              <div style={{ marginTop: 5, height: 5, borderRadius: 5, backgroundColor: C.uiLine }}>
                <div style={{ width: `${r.w * riskFill * 100}%`, height: "100%", borderRadius: 5, backgroundColor: C.emerald }} />
              </div>
            </div>
          ))}
        </div>

        {/* equity curve */}
        <div
          style={{
            position: "absolute",
            left: 304,
            top: 270,
            width: 276,
            height: 110,
            borderRadius: 14,
            border: `1px solid ${C.uiLine}`,
            backgroundColor: C.uiSoft,
            padding: "12px 8px 0 8px",
            boxSizing: "border-box",
            fontFamily: FONT_BODY,
          }}
        >
          <div style={{ fontSize: 11, fontWeight: 800, color: C.uiMuted, letterSpacing: "0.06em", paddingLeft: 8 }}>
            FUNDED TRACK · EQUITY
          </div>
          <svg width={eqW} height={eqH} style={{ marginTop: 6, overflow: "visible" }}>
            <path
              d={`${eqPath} L${eqW} ${eqH} L0 ${eqH} Z`}
              fill="rgba(52,211,153,0.14)"
              opacity={eqP}
            />
            <path
              d={eqPath}
              fill="none"
              stroke={C.emeraldDeep}
              strokeWidth={2.5}
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeDasharray={eqLen}
              strokeDashoffset={eqLen * (1 - eqP)}
            />
          </svg>
        </div>

        <AnimatedMouseCursor keyframes={cursor} showFrom={24} />
      </UiWindow>
    </SceneShell>
  );
};

/* ============================================================================
   SCENE 7 — INSIDE THE ACADEMY (3486 – 4329)
   Cinematic photo montage (frame-accurate, no buffering 4K streams).
   ========================================================================== */

const AcademyClip: React.FC<{
  duration: number;
  photo: string;
  index: number;
  title: string;
  subtitle: string;
  pan: [number, number];
}> = ({ duration, photo, index, title, subtitle, pan }) => {
  const frame = useCurrentFrame();
  const p = interpolate(frame, [0, duration], [0, 1], CLAMP);
  const scale = interpolate(p, [0, 1], [1.08, 1.2]);
  const tx = interpolate(p, [0, 1], pan);
  const bar = interpolate(frame, [10, 34], [0, 1], { ...CLAMP, easing: EASE_OUT });

  return (
    <SceneShell duration={duration} enterFrames={14}>
      <AbsoluteFill style={{ overflow: "hidden" }}>
        <Img
          src={photo}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            transform: `translateX(${tx}px) scale(${scale})`,
          }}
        />
        <AbsoluteFill
          style={{
            background:
              "linear-gradient(0deg, rgba(11,13,17,0.92) 0%, rgba(11,13,17,0.35) 45%, rgba(11,13,17,0.15) 100%)",
          }}
        />
      </AbsoluteFill>

      {/* letterbox */}
      <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: 40, backgroundColor: "#000" }} />
      <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: 40, backgroundColor: "#000" }} />

      <div style={{ position: "absolute", left: 72, bottom: 92, maxWidth: 760, zIndex: 10 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <Eyebrow label="Inside the academy" start={4} />
          <Reveal start={8} distance={8}>
            <span style={{ color: C.faint, fontFamily: FONT_BODY, fontSize: 13, fontWeight: 700 }}>
              0{index} / 03
            </span>
          </Reveal>
        </div>
        <div style={{ display: "flex", alignItems: "stretch", gap: 18, marginTop: 18 }}>
          <div
            style={{
              width: 4,
              borderRadius: 4,
              backgroundColor: C.brand,
              transform: `scaleY(${bar})`,
              transformOrigin: "top",
            }}
          />
          <div>
            <h3
              style={{
                color: C.text,
                fontFamily: FONT_DISPLAY,
                fontSize: 46,
                fontWeight: 800,
                lineHeight: 1.08,
                letterSpacing: "-0.03em",
                margin: 0,
              }}
            >
              <KineticText text={title} start={10} />
            </h3>
            <Reveal start={30}>
              <p style={{ color: C.muted, fontFamily: FONT_BODY, fontSize: 18.5, lineHeight: 1.55, margin: "12px 0 0 0" }}>
                {subtitle}
              </p>
            </Reveal>
          </div>
        </div>
      </div>
    </SceneShell>
  );
};

/* ============================================================================
   SCENE 8 — OUTRO (4329 – 4818)
   ========================================================================== */

const Scene8Outro: React.FC<{ duration: number }> = ({ duration }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const mark = spring({ frame: frame - 6, fps, config: { damping: 11, stiffness: 120 } });
  const cta = spring({ frame: frame - 96, fps, config: { damping: 14 } });
  const shimmer = interpolate((frame - 110) % 90, [0, 40], [-60, 160], CLAMP);
  const ring = interpolate(frame % 60, [0, 60], [0, 1]);
  const fadeEnd = interpolate(frame, [duration - 18, duration], [1, 0], CLAMP);

  return (
    <SceneShell duration={duration} exitFrames={0}>
      <AbsoluteFill
        style={{
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
          zIndex: 10,
          opacity: fadeEnd,
        }}
      >
        <div style={{ position: "relative", transform: `scale(${mark}) rotate(${(1 - mark) * -20}deg)` }}>
          <div
            style={{
              position: "absolute",
              inset: -14,
              borderRadius: 30,
              border: `2px solid ${C.brand}`,
              opacity: (1 - ring) * 0.6 * mark,
              transform: `scale(${1 + ring * 0.4})`,
            }}
          />
          <LogoMark size={76} />
        </div>
        <Reveal start={24} distance={10}>
          <p
            style={{
              marginTop: 26,
              color: C.brandSoft,
              fontFamily: FONT_BODY,
              fontSize: 13.5,
              fontWeight: 800,
              letterSpacing: "0.2em",
              textTransform: "uppercase",
            }}
          >
            GAMAT Fx Academy
          </p>
        </Reveal>
        <h2
          style={{
            color: C.text,
            fontFamily: FONT_DISPLAY,
            fontSize: 60,
            fontWeight: 800,
            lineHeight: 1.06,
            letterSpacing: "-0.035em",
            margin: "14px 0 0 0",
          }}
        >
          <KineticText text="Build your edge —" start={34} />
          <br />
          <KineticText text="the right way." start={52} highlight={["right", "way"]} />
        </h2>
        <Reveal start={78}>
          <p style={{ marginTop: 18, color: C.muted, fontFamily: FONT_BODY, fontSize: 19 }}>
            Structure, live mentorship and accountability — in one system.
          </p>
        </Reveal>
        <div
          style={{
            position: "relative",
            overflow: "hidden",
            marginTop: 34,
            padding: "16px 38px",
            borderRadius: 999,
            backgroundColor: C.brand,
            color: "#fff",
            fontFamily: FONT_BODY,
            fontWeight: 800,
            fontSize: 18,
            boxShadow: "0 20px 44px rgba(220,53,69,0.5)",
            opacity: cta,
            transform: `translateY(${(1 - cta) * 16}px) scale(${interpolate(cta, [0, 1], [0.92, 1])})`,
          }}
        >
          Choose your program →
          <span
            style={{
              position: "absolute",
              top: 0,
              bottom: 0,
              left: `${shimmer}%`,
              width: 60,
              background: "linear-gradient(100deg, transparent, rgba(255,255,255,0.45), transparent)",
              transform: "skewX(-18deg)",
            }}
          />
        </div>
        <Reveal start={120} distance={8}>
          <p style={{ marginTop: 16, color: C.faint, fontFamily: FONT_BODY, fontSize: 15, fontWeight: 600 }}>
            gamatfxacademy.com
          </p>
        </Reveal>
      </AbsoluteFill>
    </SceneShell>
  );
};

/* ============================================================================
   MAIN COMPOSITION
   ========================================================================== */

const withOverlap = (dur: number) => dur + OVERLAP;

export const HowGamatWorksVideo: React.FC = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: C.ink, fontFamily: FONT_BODY }}>
      <Audio
        src="/audio/how-gamatfx-works.mp3"
        acceptableTimeShiftInSeconds={2.5}
        pauseWhenBuffering={false}
      />

      <BrandBackdrop />

      <Sequence from={T.problem.from} durationInFrames={withOverlap(T.problem.dur)}>
        <Scene1Problem duration={withOverlap(T.problem.dur)} />
      </Sequence>

      <Sequence from={T.system.from} durationInFrames={withOverlap(T.system.dur)}>
        <Scene2System duration={withOverlap(T.system.dur)} />
      </Sequence>

      <Sequence from={T.enroll.from} durationInFrames={withOverlap(T.enroll.dur)}>
        <Scene3Enroll duration={withOverlap(T.enroll.dur)} />
      </Sequence>

      <Sequence from={T.live.from} durationInFrames={withOverlap(T.live.dur)}>
        <Scene4Live duration={withOverlap(T.live.dur)} />
      </Sequence>

      <Sequence from={T.journal.from} durationInFrames={withOverlap(T.journal.dur)}>
        <Scene5Journal duration={withOverlap(T.journal.dur)} />
      </Sequence>

      <Sequence from={T.scale.from} durationInFrames={withOverlap(T.scale.dur)}>
        <Scene6Scale duration={withOverlap(T.scale.dur)} />
      </Sequence>

      <Sequence from={T.clipA.from} durationInFrames={withOverlap(T.clipA.dur)}>
        <AcademyClip
          duration={withOverlap(T.clipA.dur)}
          photo={PHOTOS.liveWorkshop}
          index={1}
          title="Live market breakdowns"
          subtitle="We mark key levels and wait patiently for confirmation before risking a single dollar."
          pan={[-20, 24]}
        />
      </Sequence>

      <Sequence from={T.clipB.from} durationInFrames={withOverlap(T.clipB.dur)}>
        <AcademyClip
          duration={withOverlap(T.clipB.dur)}
          photo={PHOTOS.chartReview}
          index={2}
          title="Reading multi-screen market data"
          subtitle="Macro news, higher-timeframe bias and lower-timeframe execution working together."
          pan={[22, -20]}
        />
      </Sequence>

      <Sequence from={T.clipC.from} durationInFrames={withOverlap(T.clipC.dur)}>
        <AcademyClip
          duration={withOverlap(T.clipC.dur)}
          photo={PHOTOS.mentorshipSession}
          index={3}
          title="Analysis on the go"
          subtitle="Courses, trade journal, daily outlooks and community tools — wherever you are."
          pan={[-18, 18]}
        />
      </Sequence>

      <Sequence from={T.outro.from} durationInFrames={T.outro.dur}>
        <Scene8Outro duration={T.outro.dur} />
      </Sequence>

      <BrandWatermark />
      <ChapterRail />
    </AbsoluteFill>
  );
};

export default HowGamatWorksVideo;
