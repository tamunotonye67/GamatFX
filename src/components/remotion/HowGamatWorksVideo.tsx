import React from "react";
import {
  AbsoluteFill,
  Audio,
  Img,
  OffthreadVideo,
  Sequence,
  Video,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import {
  Award,
  BookOpenCheck,
  BrainCircuit,
  CheckCircle2,
  Compass,
  FileCheck2,
  Globe,
  Layers,
  LineChart,
  MonitorPlay,
  ShieldCheck,
  Smartphone,
  Sparkles,
  TrendingUp,
  Users,
  XCircle,
} from "lucide-react";

export const HOW_IT_WORKS_FPS = 30;
// 160.56s voiceover -> 4818 frames @ 30fps
export const HOW_IT_WORKS_DURATION_IN_FRAMES = 4818;

const CLIPS = {
  mainDesk:
    "https://videos.pexels.com/video-files/38484636/16343740_3840_2160_50fps.mp4",
  liveBreakdown:
    "https://videos.pexels.com/video-files/38581107/16386444_3840_2160_50fps.mp4",
  multiScreen:
    "https://videos.pexels.com/video-files/38358369/16288463_3840_2160_25fps.mp4",
  onTheGo:
    "https://videos.pexels.com/video-files/35606120/15089547_3840_2160_25fps.mp4",
};

const PHOTOS = {
  hero: "/images/hero.jpg",
  aboutHero: "/images/about-hero.jpg",
  community: "/images/community.jpg",
  campusLab: "/images/gallery/campus-lab.jpg",
  chartReview: "/images/gallery/chart-review.jpg",
  graduation: "/images/gallery/graduation.jpg",
  liveWorkshop: "/images/gallery/live-workshop.jpg",
  mentorshipSession: "/images/gallery/mentorship-session.jpg",
  tradingFloor: "/images/gallery/trading-floor.jpg",
};

/* -------------------------- Subtitles Synced to VO -------------------------- */

type CaptionSegment = {
  fromSec: number;
  toSec: number;
  text: string;
  highlight?: string;
};

const CAPTIONS: CaptionSegment[] = [
  {
    fromSec: 0.2,
    toSec: 11.2,
    text: "Most aspiring traders don’t fail because they lack information—they fail trying to piece together random YouTube videos without structure, real-time application, or accountability.",
    highlight: "without structure, real-time application, or accountability",
  },
  {
    fromSec: 11.7,
    toSec: 22.1,
    text: "At GamatFX, we replaced guesswork with one complete, accountable trading system that takes you from foundational theory to disciplined execution in real markets.",
    highlight: "one complete, accountable trading system",
  },
  {
    fromSec: 22.4,
    toSec: 24.8,
    text: "Here’s how it actually works from day one.",
    highlight: "from day one",
  },
  {
    fromSec: 25.2,
    toSec: 28.1,
    text: "Step One: Enroll and get instant access.",
    highlight: "Step One",
  },
  {
    fromSec: 28.4,
    toSec: 34.0,
    text: "The moment you pick a program and complete enrollment, your entire learning environment unlocks immediately.",
    highlight: "unlocks immediately",
  },
  {
    fromSec: 34.1,
    toSec: 43.4,
    text: "You get full access to structured video modules, downloadable workbooks, trading checklists, and our private trader community—so you’re never left waiting to get started.",
    highlight: "structured video modules, downloadable workbooks",
  },
  {
    fromSec: 43.9,
    toSec: 46.9,
    text: "Step Two: Learn, then apply live.",
    highlight: "Step Two",
  },
  {
    fromSec: 47.2,
    toSec: 56.9,
    text: "Instead of memorizing textbook patterns in isolation, you work through each module at your own pace and then bring those exact concepts into our weekly live market sessions.",
    highlight: "weekly live market sessions",
  },
  {
    fromSec: 57.2,
    toSec: 69.0,
    text: "Together with mentors and fellow students, you watch institutional order flow, liquidity sweeps, and market structure unfold in real time—seeing why a setup qualifies and when to stay out.",
    highlight: "institutional order flow, liquidity sweeps, and market structure",
  },
  {
    fromSec: 69.5,
    toSec: 73.1,
    text: "Step Three: Journal every trade and get reviewed.",
    highlight: "Step Three",
  },
  {
    fromSec: 73.3,
    toSec: 75.6,
    text: "This is where real progress happens.",
    highlight: "real progress",
  },
  {
    fromSec: 75.9,
    toSec: 85.6,
    text: "Every trade you take is logged inside your GamatFX Trade Journal—entry, stop loss, take profit, risk-to-reward, and the reasoning behind your execution.",
    highlight: "GamatFX Trade Journal",
  },
  {
    fromSec: 85.9,
    toSec: 93.9,
    text: "Mentors review your setups and give direct feedback so you catch emotional mistakes early, tighten your rules, and build repeatable habits.",
    highlight: "direct feedback",
  },
  {
    fromSec: 94.4,
    toSec: 97.0,
    text: "Step Four: Scale with accountability.",
    highlight: "Step Four",
  },
  {
    fromSec: 97.3,
    toSec: 105.0,
    text: "As you pass your module quizzes, check in to live workshops, and earn your verified GamatFX certificates, you’re not sent off on your own.",
    highlight: "verified GamatFX certificates",
  },
  {
    fromSec: 105.2,
    toSec: 115.9,
    text: "You graduate to live capital or funded-account challenges with a clear, rules-based trading plan, ongoing mentor support, and a community that holds you to professional risk standards.",
    highlight: "live capital or funded-account challenges",
  },
  {
    fromSec: 116.4,
    toSec: 120.3,
    text: "Inside the academy, everything is built for real-world trading:",
    highlight: "real-world trading",
  },
  {
    fromSec: 120.6,
    toSec: 128.0,
    text: "Inside live market breakdowns, we mark key levels and wait patiently for confirmation before risking a single dollar.",
    highlight: "live market breakdowns",
  },
  {
    fromSec: 128.3,
    toSec: 136.3,
    text: "Reading multi-screen market data, you learn how macro news, higher-timeframe bias, and lower-timeframe execution work together.",
    highlight: "Reading multi-screen market data",
  },
  {
    fromSec: 136.6,
    toSec: 144.1,
    text: "And with analysis on the go, your courses, trade journal, daily outlooks, and community tools stay accessible wherever you are.",
    highlight: "analysis on the go",
  },
  {
    fromSec: 144.4,
    toSec: 151.8,
    text: "Whether you’re starting from scratch or refining an existing strategy, GamatFX gives you the structure, live mentorship, and accountability to trade with confidence.",
    highlight: "structure, live mentorship, and accountability",
  },
  {
    fromSec: 152.0,
    toSec: 160.4,
    text: "Choose your program, step inside the dashboard, and let’s build your edge—the right way.",
    highlight: "let’s build your edge—the right way",
  },
];

/* -------------------------- Shared Top Chrome -------------------------- */

const TopBrandChrome: React.FC<{
  chapterTag: string;
  progressPct: number;
}> = ({ chapterTag, progressPct }) => {
  return (
    <div
      style={{
        position: "absolute",
        top: 28,
        left: 44,
        right: 44,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        zIndex: 40,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          padding: "8px 16px 8px 10px",
          borderRadius: 16,
          backgroundColor: "rgba(17, 19, 23, 0.78)",
          border: "1px solid rgba(255,255,255,0.14)",
          backdropFilter: "blur(12px)",
        }}
      >
        <div
          style={{
            width: 34,
            height: 34,
            borderRadius: 10,
            backgroundColor: "#dc3545",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#ffffff",
            fontWeight: 900,
            fontSize: 17,
            fontFamily: '"Sora", system-ui, sans-serif',
            boxShadow: "0 8px 20px rgba(220,53,69,0.4)",
          }}
        >
          G
        </div>
        <div>
          <div
            style={{
              color: "#ffffff",
              fontWeight: 800,
              fontSize: 15,
              letterSpacing: "-0.02em",
              fontFamily: '"Sora", system-ui, sans-serif',
            }}
          >
            GAMAT <span style={{ color: "#dc3545" }}>Fx</span> Academy
          </div>
          <div
            style={{
              color: "rgba(255,255,255,0.55)",
              fontSize: 10,
              fontWeight: 700,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
            }}
          >
            Official System Walkthrough
          </div>
        </div>
      </div>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 14,
          padding: "9px 18px",
          borderRadius: 999,
          backgroundColor: "rgba(17, 19, 23, 0.78)",
          border: "1px solid rgba(255,255,255,0.14)",
          backdropFilter: "blur(12px)",
        }}
      >
        <span
          style={{
            width: 8,
            height: 8,
            borderRadius: "50%",
            backgroundColor: "#dc3545",
            boxShadow: "0 0 10px #dc3545",
          }}
        />
        <span
          style={{
            color: "#ffffff",
            fontSize: 12,
            fontWeight: 800,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
          }}
        >
          {chapterTag}
        </span>
        <div
          style={{
            width: 72,
            height: 5,
            borderRadius: 999,
            backgroundColor: "rgba(255,255,255,0.15)",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              height: "100%",
              width: `${Math.min(100, Math.max(0, progressPct))}%`,
              backgroundColor: "#dc3545",
            }}
          />
        </div>
      </div>
    </div>
  );
};

/* ------------------------- Synced Caption Bar ------------------------- */

const SubtitleBar: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const currentSec = frame / fps;

  const active = CAPTIONS.find(
    (c) => currentSec >= c.fromSec && currentSec <= c.toSec
  );
  if (!active) return null;

  const fadeIn = interpolate(
    currentSec,
    [active.fromSec, active.fromSec + 0.25],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );
  const fadeOut = interpolate(
    currentSec,
    [active.toSec - 0.25, active.toSec],
    [1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );
  const opacity = Math.min(fadeIn, fadeOut);

  const renderText = () => {
    if (!active.highlight) return active.text;
    const idx = active.text
      .toLowerCase()
      .indexOf(active.highlight.toLowerCase());
    if (idx === -1) return active.text;
    const before = active.text.slice(0, idx);
    const match = active.text.slice(idx, idx + active.highlight.length);
    const after = active.text.slice(idx + active.highlight.length);
    return (
      <>
        {before}
        <span style={{ color: "#ff7583", fontWeight: 800 }}>{match}</span>
        {after}
      </>
    );
  };

  return (
    <div
      style={{
        position: "absolute",
        bottom: 24,
        left: 64,
        right: 64,
        display: "flex",
        justifyContent: "center",
        zIndex: 45,
        opacity,
        transform: `translateY(${interpolate(opacity, [0, 1], [8, 0])}px)`,
      }}
    >
      <div
        style={{
          maxWidth: 1020,
          padding: "12px 24px",
          borderRadius: 16,
          backgroundColor: "rgba(12, 14, 18, 0.88)",
          border: "1px solid rgba(255,255,255,0.14)",
          boxShadow: "0 16px 40px rgba(0,0,0,0.55)",
          color: "rgba(255,255,255,0.95)",
          fontSize: 17.5,
          fontWeight: 600,
          lineHeight: 1.45,
          textAlign: "center",
          fontFamily: '"Inter", system-ui, sans-serif',
        }}
      >
        {renderText()}
      </div>
    </div>
  );
};

/* --------------------- Background Photo / Video Layer --------------------- */

const CinematicBackdrop: React.FC<{
  photoSrc?: string;
  videoSrc?: string;
  dimOpacity?: number;
}> = ({ photoSrc, videoSrc, dimOpacity = 0.72 }) => {
  const frame = useCurrentFrame();
  const scale = interpolate(frame, [0, 600], [1.02, 1.11], {
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill style={{ overflow: "hidden", backgroundColor: "#0e1014" }}>
      {videoSrc ? (
        <video
          src={videoSrc}
          muted
          autoPlay
          loop
          playsInline
          preload="auto"
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            transform: `scale(${scale})`,
          }}
        />
      ) : photoSrc ? (
        <Img
          src={photoSrc}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            transform: `scale(${scale})`,
          }}
        />
      ) : null}

      {/* Dark cinematic gradient overlay */}
      <AbsoluteFill
        style={{
          background: `linear-gradient(115deg, rgba(13,15,19,${Math.min(
            0.94,
            dimOpacity + 0.14
          )}) 0%, rgba(13,15,19,${dimOpacity}) 55%, rgba(13,15,19,${Math.min(
            0.92,
            dimOpacity + 0.1
          )}) 100%)`,
        }}
      />

      {/* Subtle grid texture */}
      <AbsoluteFill
        style={{
          backgroundImage:
            "linear-gradient(to right, rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.03) 1px, transparent 1px)",
          backgroundSize: "64px 64px",
        }}
      />
    </AbsoluteFill>
  );
};

/* ==========================================================================
   SCENE 1 (0s - 11.5s | Frames 0 - 345):
   "Most aspiring traders don't fail because they lack information..."
   ========================================================================== */

const Scene1Problem: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const introIn = spring({ frame, fps, config: { damping: 14 } });

  const painPoints = [
    {
      title: "Random YouTube Rabbit Holes",
      sub: "Conflicting indicators & cherry-picked hindsight charts",
    },
    {
      title: "Zero Structure or Roadmap",
      sub: "Jumping between strategies after every losing trade",
    },
    {
      title: "No Live Application or Accountability",
      sub: "Trading alone without a mentor to audit your execution",
    },
  ];

  return (
    <AbsoluteFill>
      <CinematicBackdrop videoSrc={CLIPS.mainDesk} dimOpacity={0.78} />

      <div
        style={{
          flex: 1,
          display: "grid",
          gridTemplateColumns: "1.05fr 0.95fr",
          alignItems: "center",
          gap: 48,
          padding: "92px 64px 96px 64px",
          zIndex: 10,
        }}
      >
        <div
          style={{
            opacity: introIn,
            transform: `translateY(${interpolate(introIn, [0, 1], [30, 0])}px)`,
          }}
        >
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 10,
              padding: "8px 16px",
              borderRadius: 999,
              backgroundColor: "rgba(220,53,69,0.2)",
              border: "1px solid rgba(220,53,69,0.45)",
              color: "#ff7583",
              fontSize: 13,
              fontWeight: 800,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              marginBottom: 20,
            }}
          >
            <XCircle size={16} /> The Retail Trader Trap
          </div>

          <h1
            style={{
              color: "#ffffff",
              fontFamily: '"Sora", system-ui, sans-serif',
              fontSize: 48,
              fontWeight: 800,
              lineHeight: 1.14,
              margin: 0,
              letterSpacing: "-0.025em",
            }}
          >
            Traders Don’t Fail From a Lack of Info—They Fail From{" "}
            <span style={{ color: "#dc3545" }}>Fragmented Guesswork.</span>
          </h1>

          <p
            style={{
              color: "rgba(255,255,255,0.72)",
              fontSize: 19,
              lineHeight: 1.55,
              marginTop: 18,
            }}
          >
            Piecing together random videos without structure, real-time market
            application, or mentor feedback keeps traders stuck in the cycle.
          </p>
        </div>

        {/* Right: Pain cards */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {painPoints.map((p, idx) => {
            const cardIn = spring({
              frame: frame - 24 - idx * 28,
              fps,
              config: { damping: 14 },
            });
            return (
              <div
                key={p.title}
                style={{
                  opacity: cardIn,
                  transform: `translateX(${interpolate(cardIn, [0, 1], [45, 0])}px)`,
                  padding: "20px 24px",
                  borderRadius: 20,
                  backgroundColor: "rgba(18, 21, 27, 0.86)",
                  border: "1px solid rgba(220,53,69,0.32)",
                  boxShadow: "0 20px 45px rgba(0,0,0,0.45)",
                  display: "flex",
                  alignItems: "flex-start",
                  gap: 16,
                }}
              >
                <div
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 12,
                    backgroundColor: "rgba(220,53,69,0.18)",
                    color: "#ff6b7a",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  <XCircle size={22} />
                </div>
                <div>
                  <div
                    style={{
                      color: "#ffffff",
                      fontWeight: 800,
                      fontSize: 18,
                      fontFamily: '"Sora", system-ui, sans-serif',
                    }}
                  >
                    {p.title}
                  </div>
                  <div
                    style={{
                      color: "rgba(255,255,255,0.62)",
                      fontSize: 14,
                      marginTop: 4,
                    }}
                  >
                    {p.sub}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </AbsoluteFill>
  );
};

/* ==========================================================================
   SCENE 2 (11.5s - 25.0s | Frames 345 - 750):
   "At GamatFX, we replaced guesswork with one complete, accountable trading system..."
   ========================================================================== */

const Scene2SolutionOverview: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const headIn = spring({ frame, fps, config: { damping: 14 } });

  const pillars = [
    { num: "01", title: "Structured Curriculum", img: PHOTOS.campusLab },
    { num: "02", title: "Live Market Sessions", img: PHOTOS.liveWorkshop },
    { num: "03", title: "Trade Journal & Audits", img: PHOTOS.chartReview },
    { num: "04", title: "Accountable Scaling", img: PHOTOS.graduation },
  ];

  return (
    <AbsoluteFill>
      <CinematicBackdrop photoSrc={PHOTOS.tradingFloor} dimOpacity={0.76} />

      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "90px 64px 96px 64px",
          zIndex: 10,
        }}
      >
        <div
          style={{
            textAlign: "center",
            maxWidth: 920,
            margin: "0 auto 34px auto",
            opacity: headIn,
            transform: `translateY(${interpolate(headIn, [0, 1], [28, 0])}px)`,
          }}
        >
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              padding: "7px 18px",
              borderRadius: 999,
              backgroundColor: "rgba(16,185,129,0.18)",
              border: "1px solid rgba(16,185,129,0.45)",
              color: "#34d399",
              fontSize: 13,
              fontWeight: 800,
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              marginBottom: 16,
            }}
          >
            <Sparkles size={15} /> The GAMAT Fx Blueprint
          </div>

          <h2
            style={{
              color: "#ffffff",
              fontFamily: '"Sora", system-ui, sans-serif',
              fontSize: 46,
              fontWeight: 800,
              lineHeight: 1.15,
              margin: 0,
            }}
          >
            One Complete, Accountable System From{" "}
            <span style={{ color: "#dc3545" }}>Theory to Live Execution</span>
          </h2>
        </div>

        {/* 4 Photo Pillar Cards */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            gap: 20,
          }}
        >
          {pillars.map((p, i) => {
            const cardIn = spring({
              frame: frame - 22 - i * 18,
              fps,
              config: { damping: 14 },
            });
            return (
              <div
                key={p.num}
                style={{
                  opacity: cardIn,
                  transform: `translateY(${interpolate(cardIn, [0, 1], [36, 0])}px)`,
                  borderRadius: 22,
                  overflow: "hidden",
                  backgroundColor: "rgba(17,19,23,0.9)",
                  border: "1px solid rgba(255,255,255,0.14)",
                  boxShadow: "0 22px 45px rgba(0,0,0,0.45)",
                }}
              >
                <div style={{ position: "relative", height: 155, overflow: "hidden" }}>
                  <Img
                    src={p.img}
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                    }}
                  />
                  <div
                    style={{
                      position: "absolute",
                      top: 12,
                      left: 12,
                      padding: "4px 10px",
                      borderRadius: 8,
                      backgroundColor: "#dc3545",
                      color: "#ffffff",
                      fontSize: 12,
                      fontWeight: 800,
                      fontFamily: '"Sora", system-ui, sans-serif',
                    }}
                  >
                    STEP {p.num}
                  </div>
                </div>
                <div style={{ padding: "16px 18px" }}>
                  <div
                    style={{
                      color: "#ffffff",
                      fontWeight: 800,
                      fontSize: 17,
                      fontFamily: '"Sora", system-ui, sans-serif',
                    }}
                  >
                    {p.title}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </AbsoluteFill>
  );
};

/* ==========================================================================
   SCENE 3 (25.0s - 43.8s | Frames 750 - 1314):
   "Step one: Enroll and get instant access..."
   ========================================================================== */

const Scene3StepOneEnroll: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const leftIn = spring({ frame, fps, config: { damping: 15 } });
  const rightIn = spring({ frame: frame - 14, fps, config: { damping: 14 } });

  const unlockedItems = [
    {
      code: "MODULES",
      title: "Structured Video Curriculum",
      desc: "Foundational to institutional Smart Money Concepts",
      pct: 100,
    },
    {
      code: "WORKBOOKS",
      title: "Downloadable PDF Workbooks & Checklists",
      desc: "Pre-session Mechanical Execution Checklists",
      pct: 100,
    },
    {
      code: "COMMUNITY",
      title: "Private Student Trading Floor",
      desc: "24/7 peer & mentor chart discussion channels",
      pct: 100,
    },
  ];

  return (
    <AbsoluteFill>
      <CinematicBackdrop photoSrc={PHOTOS.campusLab} dimOpacity={0.78} />

      <div
        style={{
          flex: 1,
          display: "grid",
          gridTemplateColumns: "1fr 1.05fr",
          alignItems: "center",
          gap: 46,
          padding: "92px 64px 96px 64px",
          zIndex: 10,
        }}
      >
        {/* Left: Real campus photo + Step 1 copy */}
        <div
          style={{
            opacity: leftIn,
            transform: `translateX(${interpolate(leftIn, [0, 1], [-36, 0])}px)`,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
            <span
              style={{
                padding: "6px 14px",
                borderRadius: 10,
                backgroundColor: "#dc3545",
                color: "#ffffff",
                fontWeight: 800,
                fontSize: 14,
                fontFamily: '"Sora", system-ui, sans-serif',
              }}
            >
              STEP 01
            </span>
            <span
              style={{
                color: "#ff7583",
                fontWeight: 800,
                fontSize: 14,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
              }}
            >
              Instant Environment Unlock
            </span>
          </div>

          <h2
            style={{
              color: "#ffffff",
              fontFamily: '"Sora", system-ui, sans-serif',
              fontSize: 44,
              fontWeight: 800,
              lineHeight: 1.15,
              margin: 0,
            }}
          >
            Enroll & Get{" "}
            <span style={{ color: "#dc3545" }}>Instant Access</span>
          </h2>

          <p
            style={{
              color: "rgba(255,255,255,0.74)",
              fontSize: 18.5,
              lineHeight: 1.55,
              marginTop: 16,
              marginBottom: 22,
            }}
          >
            Your complete learning environment unlocks the moment you enroll—no
            waiting, no guesswork.
          </p>

          {/* Framed Academy Photo inset */}
          <div
            style={{
              position: "relative",
              height: 190,
              borderRadius: 20,
              overflow: "hidden",
              border: "1px solid rgba(255,255,255,0.18)",
              boxShadow: "0 18px 40px rgba(0,0,0,0.45)",
            }}
          >
            <Img
              src={PHOTOS.community}
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
            <div
              style={{
                position: "absolute",
                inset: 0,
                background:
                  "linear-gradient(to top, rgba(12,14,18,0.88) 0%, rgba(12,14,18,0.15) 65%)",
                display: "flex",
                alignItems: "flex-end",
                padding: "14px 18px",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <Users size={18} color="#34d399" />
                <span style={{ color: "#ffffff", fontWeight: 700, fontSize: 14 }}>
                   GAMAT Fx Student Learning Lab & Private Trader Community
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Interactive Dashboard Unlock Illustration */}
        <div
          style={{
            opacity: rightIn,
            transform: `translateY(${interpolate(rightIn, [0, 1], [30, 0])}px)`,
            borderRadius: 26,
            backgroundColor: "rgba(18, 21, 27, 0.9)",
            border: "1px solid rgba(255,255,255,0.14)",
            padding: 28,
            boxShadow: "0 28px 60px rgba(0,0,0,0.55)",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: 20,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div
                style={{
                  width: 42,
                  height: 42,
                  borderRadius: 12,
                  backgroundColor: "rgba(220,53,69,0.2)",
                  color: "#ff7583",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <BookOpenCheck size={22} />
              </div>
              <div>
                <div style={{ color: "#ffffff", fontWeight: 800, fontSize: 17 }}>
                  GamatFX Student Portal
                </div>
                <div style={{ color: "rgba(255,255,255,0.5)", fontSize: 12.5 }}>
                  Enrollment Verified · All Resources Active
                </div>
              </div>
            </div>
            <span
              style={{
                padding: "6px 12px",
                borderRadius: 999,
                backgroundColor: "rgba(16,185,129,0.18)",
                border: "1px solid rgba(16,185,129,0.45)",
                color: "#34d399",
                fontSize: 11.5,
                fontWeight: 800,
              }}
            >
              ✓ UNLOCKED
            </span>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {unlockedItems.map((item, idx) => {
              const itemIn = spring({
                frame: frame - 35 - idx * 35,
                fps,
                config: { damping: 15 },
              });
              return (
                <div
                  key={item.code}
                  style={{
                    opacity: itemIn,
                    transform: `translateX(${interpolate(itemIn, [0, 1], [28, 0])}px)`,
                    padding: "16px 18px",
                    borderRadius: 18,
                    backgroundColor: "rgba(255,255,255,0.04)",
                    border: "1px solid rgba(255,255,255,0.09)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <span
                        style={{
                          fontSize: 10.5,
                          fontWeight: 800,
                          color: "#ff7583",
                          backgroundColor: "rgba(220,53,69,0.18)",
                          padding: "3px 8px",
                          borderRadius: 6,
                        }}
                      >
                        {item.code}
                      </span>
                      <span style={{ color: "#ffffff", fontWeight: 700, fontSize: 15.5 }}>
                        {item.title}
                      </span>
                    </div>
                    <div
                      style={{
                        color: "rgba(255,255,255,0.55)",
                        fontSize: 13,
                        marginTop: 5,
                      }}
                    >
                      {item.desc}
                    </div>
                  </div>
                  <CheckCircle2 size={22} color="#34d399" />
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};

/* ==========================================================================
   SCENE 4 (43.8s - 69.3s | Frames 1314 - 2079):
   "Step two: Learn, then apply live..."
   ========================================================================== */

const Scene4StepTwoApplyLive: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const leftIn = spring({ frame, fps, config: { damping: 15 } });
  const rightIn = spring({ frame: frame - 12, fps, config: { damping: 14 } });

  const candles = [
    { bull: false, top: 140, height: 48, wickTop: 125, wickBottom: 205 },
    { bull: false, top: 175, height: 55, wickTop: 160, wickBottom: 250 },
    { bull: false, top: 205, height: 42, wickTop: 192, wickBottom: 268 }, // Liquidity sweep wick
    { bull: true, top: 155, height: 75, wickTop: 140, wickBottom: 242 }, // Displacement + BOS
    { bull: true, top: 115, height: 62, wickTop: 100, wickBottom: 190 },
    { bull: false, top: 135, height: 36, wickTop: 125, wickBottom: 182 }, // FVG mitigation
    { bull: true, top: 75, height: 78, wickTop: 60, wickBottom: 162 },
    { bull: true, top: 38, height: 60, wickTop: 22, wickBottom: 112 },
  ];

  const sweepBadge = spring({ frame: frame - 90, fps, config: { damping: 14 } });
  const bosBadge = spring({ frame: frame - 150, fps, config: { damping: 14 } });

  return (
    <AbsoluteFill>
      <CinematicBackdrop videoSrc={CLIPS.liveBreakdown} dimOpacity={0.74} />

      <div
        style={{
          flex: 1,
          display: "grid",
          gridTemplateColumns: "0.95fr 1.05fr",
          alignItems: "center",
          gap: 44,
          padding: "92px 64px 96px 64px",
          zIndex: 10,
        }}
      >
        <div
          style={{
            opacity: leftIn,
            transform: `translateX(${interpolate(leftIn, [0, 1], [-35, 0])}px)`,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
            <span
              style={{
                padding: "6px 14px",
                borderRadius: 10,
                backgroundColor: "#dc3545",
                color: "#ffffff",
                fontWeight: 800,
                fontSize: 14,
                fontFamily: '"Sora", system-ui, sans-serif',
              }}
            >
              STEP 02
            </span>
            <span
              style={{
                color: "#ff7583",
                fontWeight: 800,
                fontSize: 14,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
              }}
            >
              Weekly Live Market Sessions
            </span>
          </div>

          <h2
            style={{
              color: "#ffffff",
              fontFamily: '"Sora", system-ui, sans-serif',
              fontSize: 44,
              fontWeight: 800,
              lineHeight: 1.14,
              margin: 0,
            }}
          >
            Learn the Concept, Then{" "}
            <span style={{ color: "#dc3545" }}>Apply It Live</span>
          </h2>

          <p
            style={{
              color: "rgba(255,255,255,0.74)",
              fontSize: 18,
              lineHeight: 1.55,
              marginTop: 16,
              marginBottom: 20,
            }}
          >
            Watch institutional order flow, liquidity sweeps, and market
            structure unfold live with mentors—knowing when a setup qualifies
            and when to stay out.
          </p>

          {/* Real workshop photograph */}
          <div
            style={{
              position: "relative",
              height: 185,
              borderRadius: 20,
              overflow: "hidden",
              border: "1px solid rgba(255,255,255,0.18)",
            }}
          >
            <Img
              src={PHOTOS.liveWorkshop}
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
            <div
              style={{
                position: "absolute",
                inset: 0,
                background:
                  "linear-gradient(to top, rgba(12,14,18,0.88) 0%, rgba(12,14,18,0.1) 65%)",
                display: "flex",
                alignItems: "flex-end",
                padding: "14px 18px",
              }}
            >
              <span style={{ color: "#ffffff", fontWeight: 700, fontSize: 13.5 }}>
                ● Live Mentor Breakdown · London & New York Sessions
              </span>
            </div>
          </div>
        </div>

        {/* Right: Animated Order Flow & Liquidity Sweep Chart Illustration */}
        <div
          style={{
            opacity: rightIn,
            transform: `translateY(${interpolate(rightIn, [0, 1], [30, 0])}px)`,
            borderRadius: 26,
            backgroundColor: "rgba(15, 18, 23, 0.92)",
            border: "1px solid rgba(255,255,255,0.15)",
            padding: 26,
            boxShadow: "0 28px 60px rgba(0,0,0,0.6)",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 16,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <LineChart size={20} color="#34d399" />
              <span style={{ color: "#ffffff", fontWeight: 800, fontSize: 16 }}>
                XAUUSD · M15 Institutional Order Flow
              </span>
            </div>
            <span
              style={{
                padding: "4px 10px",
                borderRadius: 999,
                backgroundColor: "rgba(16,185,129,0.18)",
                color: "#34d399",
                fontSize: 11.5,
                fontWeight: 800,
              }}
            >
              QUALIFIED A+ SETUP
            </span>
          </div>

          <div
            style={{
              position: "relative",
              height: 295,
              borderRadius: 18,
              backgroundColor: "#0a0c10",
              border: "1px solid rgba(255,255,255,0.08)",
              padding: "20px 24px",
              overflow: "hidden",
            }}
          >
            {/* Liquidity Sweep Zone */}
            <div
              style={{
                position: "absolute",
                left: 20,
                right: 20,
                bottom: 24,
                height: 48,
                borderRadius: 10,
                backgroundColor: "rgba(220,53,69,0.15)",
                border: "1px dashed rgba(220,53,69,0.55)",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "0 14px",
                opacity: sweepBadge,
              }}
            >
              <span style={{ color: "#ff7583", fontSize: 12, fontWeight: 800 }}>
                1. Sell-Side Liquidity Sweep + Demand POI
              </span>
              <span style={{ color: "#ffffff", fontSize: 11, fontWeight: 700 }}>
                2618.50
              </span>
            </div>

            {/* Structure BOS + Target Callout */}
            <div
              style={{
                position: "absolute",
                right: 24,
                top: 20,
                padding: "8px 14px",
                borderRadius: 12,
                backgroundColor: "rgba(16,185,129,0.2)",
                border: "1px solid rgba(16,185,129,0.55)",
                color: "#34d399",
                fontSize: 12.5,
                fontWeight: 800,
                opacity: bosBadge,
                transform: `scale(${bosBadge})`,
              }}
            >
              2. CHoCH / BOS Confirmed · 1:3.5 Target
            </div>

            {/* Animated Candles */}
            <div
              style={{
                display: "flex",
                alignItems: "flex-start",
                justifyContent: "space-around",
                height: "100%",
                position: "relative",
                zIndex: 2,
              }}
            >
              {candles.map((c, idx) => {
                const cIn = spring({
                  frame: frame - 18 - idx * 14,
                  fps,
                  config: { damping: 14 },
                });
                const color = c.bull ? "#10b981" : "#dc3545";
                return (
                  <div
                    key={idx}
                    style={{
                      position: "relative",
                      width: 26,
                      height: "100%",
                      opacity: cIn,
                      transform: `scaleY(${cIn})`,
                    }}
                  >
                    <div
                      style={{
                        position: "absolute",
                        left: 12,
                        top: c.wickTop,
                        height: c.wickBottom - c.wickTop,
                        width: 2,
                        backgroundColor: color,
                      }}
                    />
                    <div
                      style={{
                        position: "absolute",
                        left: 3,
                        top: c.top,
                        height: c.height,
                        width: 20,
                        borderRadius: 5,
                        backgroundColor: color,
                        boxShadow: `0 0 14px ${color}55`,
                      }}
                    />
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};

/* ==========================================================================
   SCENE 5 (69.3s - 94.2s | Frames 2079 - 2826):
   "Step three: Journal every trade and get reviewed..."
   ========================================================================== */

const Scene5StepThreeJournal: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const leftIn = spring({ frame, fps, config: { damping: 15 } });
  const rightIn = spring({ frame: frame - 14, fps, config: { damping: 14 } });
  const feedbackIn = spring({ frame: frame - 260, fps, config: { damping: 14 } });

  return (
    <AbsoluteFill>
      <CinematicBackdrop photoSrc={PHOTOS.chartReview} dimOpacity={0.78} />

      <div
        style={{
          flex: 1,
          display: "grid",
          gridTemplateColumns: "0.95fr 1.05fr",
          alignItems: "center",
          gap: 44,
          padding: "92px 64px 96px 64px",
          zIndex: 10,
        }}
      >
        <div
          style={{
            opacity: leftIn,
            transform: `translateX(${interpolate(leftIn, [0, 1], [-35, 0])}px)`,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
            <span
              style={{
                padding: "6px 14px",
                borderRadius: 10,
                backgroundColor: "#dc3545",
                color: "#ffffff",
                fontWeight: 800,
                fontSize: 14,
                fontFamily: '"Sora", system-ui, sans-serif',
              }}
            >
              STEP 03
            </span>
            <span
              style={{
                color: "#ff7583",
                fontWeight: 800,
                fontSize: 14,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
              }}
            >
              Where Real Progress Happens
            </span>
          </div>

          <h2
            style={{
              color: "#ffffff",
              fontFamily: '"Sora", system-ui, sans-serif',
              fontSize: 44,
              fontWeight: 800,
              lineHeight: 1.14,
              margin: 0,
            }}
          >
            Journal Every Trade &{" "}
            <span style={{ color: "#dc3545" }}>Get Mentor Reviewed</span>
          </h2>

          <p
            style={{
              color: "rgba(255,255,255,0.74)",
              fontSize: 18,
              lineHeight: 1.55,
              marginTop: 16,
              marginBottom: 20,
            }}
          >
            Log entry, stop loss, take profit, risk-to-reward ratio, and setup
            notes so mentors can audit your execution and eliminate emotional
            mistakes early.
          </p>

          <div
            style={{
              position: "relative",
              height: 185,
              borderRadius: 20,
              overflow: "hidden",
              border: "1px solid rgba(255,255,255,0.18)",
            }}
          >
            <Img
              src={PHOTOS.mentorshipSession}
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
            <div
              style={{
                position: "absolute",
                inset: 0,
                background:
                  "linear-gradient(to top, rgba(12,14,18,0.88) 0%, rgba(12,14,18,0.1) 65%)",
                display: "flex",
                alignItems: "flex-end",
                padding: "14px 18px",
              }}
            >
              <span style={{ color: "#ffffff", fontWeight: 700, fontSize: 13.5 }}>
                1-on-1 Chart Audits & Direct Mentor Feedback
              </span>
            </div>
          </div>
        </div>

        {/* Right: Trade Journal UI Illustration */}
        <div
          style={{
            opacity: rightIn,
            transform: `translateY(${interpolate(rightIn, [0, 1], [30, 0])}px)`,
            borderRadius: 26,
            backgroundColor: "rgba(18, 21, 27, 0.94)",
            border: "1px solid rgba(255,255,255,0.14)",
            padding: 26,
            boxShadow: "0 28px 60px rgba(0,0,0,0.6)",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 18,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <BrainCircuit size={22} color="#ff7583" />
              <span style={{ color: "#ffffff", fontWeight: 800, fontSize: 17 }}>
                GamatFX Trade Journal
              </span>
            </div>
            <span
              style={{
                color: "#34d399",
                fontSize: 13,
                fontWeight: 800,
              }}
            >
              Win Rate: 72% · Net +14.5R
            </span>
          </div>

          {/* Trade Parameters Grid */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(4, 1fr)",
              gap: 10,
              marginBottom: 16,
            }}
          >
            {[
              { label: "Entry Price", val: "1.08450" },
              { label: "Stop Loss", val: "1.08250" },
              { label: "Take Profit", val: "1.09050" },
              { label: "Risk : Reward", val: "1 : 3" },
            ].map((field, idx) => {
              const fIn = spring({
                frame: frame - 35 - idx * 22,
                fps,
                config: { damping: 15 },
              });
              return (
                <div
                  key={field.label}
                  style={{
                    opacity: fIn,
                    transform: `scale(${interpolate(fIn, [0, 1], [0.9, 1])})`,
                    padding: "12px 12px",
                    borderRadius: 14,
                    backgroundColor: "rgba(255,255,255,0.05)",
                    border: "1px solid rgba(255,255,255,0.1)",
                  }}
                >
                  <div style={{ color: "rgba(255,255,255,0.5)", fontSize: 11, fontWeight: 600 }}>
                    {field.label}
                  </div>
                  <div
                    style={{
                      color: field.label === "Risk : Reward" ? "#34d399" : "#ffffff",
                      fontSize: 16,
                      fontWeight: 800,
                      marginTop: 4,
                      fontFamily: '"Sora", system-ui, sans-serif',
                    }}
                  >
                    {field.val}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Execution Reasoning */}
          <div
            style={{
              padding: "14px 16px",
              borderRadius: 16,
              backgroundColor: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.08)",
              marginBottom: 16,
            }}
          >
            <div style={{ color: "rgba(255,255,255,0.5)", fontSize: 11.5, fontWeight: 700 }}>
              EXECUTION REASONING & SETUP NOTES
            </div>
            <div style={{ color: "#ffffff", fontSize: 14, marginTop: 6, lineHeight: 1.45 }}>
              London session Asian low liquidity sweep into H1 Order Block + M5
              FVG confirmation entry.
            </div>
          </div>

          {/* Mentor Review Callout */}
          <div
            style={{
              opacity: feedbackIn,
              transform: `translateY(${interpolate(feedbackIn, [0, 1], [18, 0])}px)`,
              padding: "16px 18px",
              borderRadius: 18,
              backgroundColor: "rgba(16,185,129,0.14)",
              border: "1px solid rgba(16,185,129,0.45)",
              display: "flex",
              alignItems: "flex-start",
              gap: 12,
            }}
          >
            <CheckCircle2 size={22} color="#34d399" style={{ flexShrink: 0, marginTop: 2 }} />
            <div>
              <div style={{ color: "#34d399", fontWeight: 800, fontSize: 13.5 }}>
                MENTOR REVIEW · APPROVED EXECUTION
              </div>
              <div style={{ color: "rgba(255,255,255,0.88)", fontSize: 13.5, marginTop: 4 }}>
                “Patience waiting for the M5 closure kept drawdown under 4 pips.
                Repeatable institutional execution.”
              </div>
            </div>
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};

/* ==========================================================================
   SCENE 6 (94.2s - 116.2s | Frames 2826 - 3486):
   "Step four: Scale with accountability..."
   ========================================================================== */

const Scene6StepFourScale: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const leftIn = spring({ frame, fps, config: { damping: 15 } });
  const certIn = spring({ frame: frame - 30, fps, config: { damping: 14 } });
  const scaleIn = spring({ frame: frame - 180, fps, config: { damping: 14 } });

  return (
    <AbsoluteFill>
      <CinematicBackdrop photoSrc={PHOTOS.graduation} dimOpacity={0.76} />

      <div
        style={{
          flex: 1,
          display: "grid",
          gridTemplateColumns: "0.95fr 1.05fr",
          alignItems: "center",
          gap: 44,
          padding: "92px 64px 96px 64px",
          zIndex: 10,
        }}
      >
        <div
          style={{
            opacity: leftIn,
            transform: `translateX(${interpolate(leftIn, [0, 1], [-35, 0])}px)`,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
            <span
              style={{
                padding: "6px 14px",
                borderRadius: 10,
                backgroundColor: "#dc3545",
                color: "#ffffff",
                fontWeight: 800,
                fontSize: 14,
                fontFamily: '"Sora", system-ui, sans-serif',
              }}
            >
              STEP 04
            </span>
            <span
              style={{
                color: "#34d399",
                fontWeight: 800,
                fontSize: 14,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
              }}
            >
              Verified Graduation & Funding
            </span>
          </div>

          <h2
            style={{
              color: "#ffffff",
              fontFamily: '"Sora", system-ui, sans-serif',
              fontSize: 44,
              fontWeight: 800,
              lineHeight: 1.14,
              margin: 0,
            }}
          >
            Scale With{" "}
            <span style={{ color: "#dc3545" }}>Professional Accountability</span>
          </h2>

          <p
            style={{
              color: "rgba(255,255,255,0.74)",
              fontSize: 18,
              lineHeight: 1.55,
              marginTop: 16,
              marginBottom: 22,
            }}
          >
            Pass module quizzes, check into live workshops, earn verified
            GamatFX certificates, and transition to live capital or funded
            challenges with strict risk rules.
          </p>

          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            {["Day 1 ✓", "Day 2 ✓", "Day 3 ✓", "Day 4 ✓", "Quiz Passed ✓"].map(
              (chip, idx) => {
                const cIn = spring({
                  frame: frame - 20 - idx * 14,
                  fps,
                  config: { damping: 14 },
                });
                return (
                  <span
                    key={chip}
                    style={{
                      opacity: cIn,
                      transform: `scale(${cIn})`,
                      padding: "7px 14px",
                      borderRadius: 10,
                      backgroundColor: "rgba(16,185,129,0.18)",
                      border: "1px solid rgba(16,185,129,0.45)",
                      color: "#34d399",
                      fontSize: 13,
                      fontWeight: 800,
                    }}
                  >
                    {chip}
                  </span>
                );
              }
            )}
          </div>
        </div>

        {/* Right: Certificate + Funded Scaling Plan */}
        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          {/* Certificate Card */}
          <div
            style={{
              opacity: certIn,
              transform: `translateY(${interpolate(certIn, [0, 1], [28, 0])}px)`,
              borderRadius: 24,
              backgroundColor: "rgba(18, 21, 27, 0.94)",
              border: "1px solid rgba(255,255,255,0.16)",
              padding: 24,
              boxShadow: "0 24px 50px rgba(0,0,0,0.5)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                <div
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: 14,
                    backgroundColor: "rgba(220,53,69,0.2)",
                    color: "#ff7583",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Award size={26} />
                </div>
                <div>
                  <div
                    style={{
                      color: "#ffffff",
                      fontWeight: 800,
                      fontSize: 18,
                      fontFamily: '"Sora", system-ui, sans-serif',
                    }}
                  >
                    Verified GAMAT Fx Academy Certificate
                  </div>
                  <div style={{ color: "rgba(255,255,255,0.55)", fontSize: 13, marginTop: 3 }}>
                    Quizzes Completed · Live Workshop Check-In Verified
                  </div>
                </div>
              </div>
              <span
                style={{
                  padding: "6px 12px",
                  borderRadius: 8,
                  backgroundColor: "rgba(16,185,129,0.18)",
                  color: "#34d399",
                  fontSize: 11.5,
                  fontWeight: 800,
                }}
              >
                CERTIFIED
              </span>
            </div>
          </div>

          {/* Live / Prop Capital Risk Plan */}
          <div
            style={{
              opacity: scaleIn,
              transform: `translateY(${interpolate(scaleIn, [0, 1], [28, 0])}px)`,
              borderRadius: 24,
              backgroundColor: "rgba(18, 21, 27, 0.94)",
              border: "1px solid rgba(16,185,129,0.4)",
              padding: 24,
              boxShadow: "0 24px 50px rgba(0,0,0,0.5)",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                color: "#34d399",
                fontWeight: 800,
                fontSize: 14,
                letterSpacing: "0.06em",
                textTransform: "uppercase",
                marginBottom: 14,
              }}
            >
              <ShieldCheck size={18} /> Rules-Based Capital Scaling Plan
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
              {[
                { label: "Max Risk / Trade", val: "0.5% – 1.0%" },
                { label: "Daily Drawdown Cap", val: "2.0% Strict" },
                { label: "Target Account", val: "Live & Funded" },
              ].map((stat) => (
                <div
                  key={stat.label}
                  style={{
                    padding: "14px",
                    borderRadius: 14,
                    backgroundColor: "rgba(255,255,255,0.04)",
                    border: "1px solid rgba(255,255,255,0.08)",
                  }}
                >
                  <div style={{ color: "rgba(255,255,255,0.5)", fontSize: 11.5 }}>
                    {stat.label}
                  </div>
                  <div
                    style={{
                      color: "#ffffff",
                      fontWeight: 800,
                      fontSize: 16,
                      marginTop: 4,
                      fontFamily: '"Sora", system-ui, sans-serif',
                    }}
                  >
                    {stat.val}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};

/* ==========================================================================
   SCENE 7 (116.2s - 144.3s | Frames 3486 - 4329):
   "Inside the academy, everything is built for real-world trading:
    - Inside live market breakdowns (116.2s - 128.2s)
    - Reading multi-screen market data (128.2s - 136.5s)
    - Analysis on the go (136.5s - 144.3s)"
   ========================================================================== */

const RealWorldFootageShowcase: React.FC<{
  videoSrc: string;
  badge: string;
  title: string;
  accent: string;
  subtitle: string;
  hudItems: { label: string; value: string }[];
}> = ({ videoSrc, badge, title, accent, subtitle, hudItems }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const cardIn = spring({ frame, fps, config: { damping: 14 } });

  return (
    <AbsoluteFill>
      <CinematicBackdrop videoSrc={videoSrc} dimOpacity={0.48} />

      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          justifyContent: "flex-end",
          padding: "90px 64px 104px 64px",
          zIndex: 10,
        }}
      >
        <div
          style={{
            opacity: cardIn,
            transform: `translateY(${interpolate(cardIn, [0, 1], [30, 0])}px)`,
            display: "flex",
            alignItems: "flex-end",
            justifyContent: "space-between",
            gap: 32,
          }}
        >
          <div
            style={{
              maxWidth: 720,
              padding: "26px 30px",
              borderRadius: 24,
              backgroundColor: "rgba(12, 14, 18, 0.85)",
              border: "1px solid rgba(255,255,255,0.16)",
              backdropFilter: "blur(14px)",
              boxShadow: "0 24px 55px rgba(0,0,0,0.55)",
            }}
          >
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                padding: "5px 12px",
                borderRadius: 999,
                backgroundColor: "rgba(220,53,69,0.22)",
                color: "#ff7583",
                fontSize: 12,
                fontWeight: 800,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                marginBottom: 12,
              }}
            >
              ● {badge}
            </div>
            <h3
              style={{
                color: "#ffffff",
                fontFamily: '"Sora", system-ui, sans-serif',
                fontSize: 36,
                fontWeight: 800,
                lineHeight: 1.15,
                margin: 0,
              }}
            >
              {title} <span style={{ color: "#dc3545" }}>{accent}</span>
            </h3>
            <p
              style={{
                color: "rgba(255,255,255,0.76)",
                fontSize: 16.5,
                lineHeight: 1.5,
                marginTop: 10,
                marginBottom: 0,
              }}
            >
              {subtitle}
            </p>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {hudItems.map((h, i) => {
              const hIn = spring({
                frame: frame - 14 - i * 12,
                fps,
                config: { damping: 14 },
              });
              return (
                <div
                  key={h.label}
                  style={{
                    opacity: hIn,
                    transform: `translateX(${interpolate(hIn, [0, 1], [30, 0])}px)`,
                    padding: "14px 20px",
                    borderRadius: 18,
                    backgroundColor: "rgba(12, 14, 18, 0.88)",
                    border: "1px solid rgba(255,255,255,0.16)",
                    minWidth: 260,
                  }}
                >
                  <div
                    style={{
                      color: "rgba(255,255,255,0.5)",
                      fontSize: 11,
                      fontWeight: 700,
                      textTransform: "uppercase",
                      letterSpacing: "0.06em",
                    }}
                  >
                    {h.label}
                  </div>
                  <div
                    style={{
                      color: "#34d399",
                      fontWeight: 800,
                      fontSize: 16,
                      marginTop: 3,
                      fontFamily: '"Sora", system-ui, sans-serif',
                    }}
                  >
                    {h.value}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};

/* ==========================================================================
   SCENE 8 (144.3s - 160.6s | Frames 4329 - 4818):
   "Whether you're starting from scratch or refining an existing strategy..."
   ========================================================================== */

const Scene8OutroCta: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const cardIn = spring({ frame, fps, config: { damping: 14 } });
  const stepsIn = spring({ frame: frame - 22, fps, config: { damping: 14 } });
  const ctaIn = spring({ frame: frame - 55, fps, config: { damping: 14 } });

  return (
    <AbsoluteFill>
      <CinematicBackdrop photoSrc={PHOTOS.aboutHero} dimOpacity={0.78} />

      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "84px 72px 96px 72px",
          textAlign: "center",
          zIndex: 10,
        }}
      >
        <div
          style={{
            opacity: cardIn,
            transform: `scale(${interpolate(cardIn, [0, 1], [0.92, 1])})`,
            display: "inline-flex",
            alignItems: "center",
            gap: 10,
            padding: "9px 20px",
            borderRadius: 999,
            backgroundColor: "rgba(220,53,69,0.2)",
            border: "1px solid rgba(220,53,69,0.5)",
            color: "#ff7583",
            fontWeight: 800,
            fontSize: 13.5,
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            marginBottom: 18,
          }}
        >
          <TrendingUp size={17} /> Build Your Edge — The Right Way
        </div>

        <h2
          style={{
            opacity: cardIn,
            color: "#ffffff",
            fontFamily: '"Sora", system-ui, sans-serif',
            fontSize: 50,
            fontWeight: 800,
            lineHeight: 1.14,
            margin: 0,
            maxWidth: 960,
          }}
        >
          Structure, Live Mentorship & Accountability to{" "}
          <span style={{ color: "#dc3545" }}>Trade With Confidence</span>
        </h2>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            gap: 16,
            width: "100%",
            marginTop: 32,
            opacity: stepsIn,
            transform: `translateY(${interpolate(stepsIn, [0, 1], [24, 0])}px)`,
          }}
        >
          {[
            { icon: BookOpenCheck, step: "01", title: "Enroll & Unlock", sub: "Instant full workspace" },
            { icon: LineChart, step: "02", title: "Apply Live", sub: "Weekly mentor sessions" },
            { icon: BrainCircuit, step: "03", title: "Journal & Audit", sub: "Direct setup feedback" },
            { icon: ShieldCheck, step: "04", title: "Scale Capital", sub: "Live & funded challenges" },
          ].map((s) => (
            <div
              key={s.step}
              style={{
                padding: "18px",
                borderRadius: 20,
                backgroundColor: "rgba(17, 19, 23, 0.88)",
                border: "1px solid rgba(255,255,255,0.14)",
                textAlign: "left",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div
                  style={{
                    width: 38,
                    height: 38,
                    borderRadius: 10,
                    backgroundColor: "rgba(220,53,69,0.2)",
                    color: "#ff7583",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <s.icon size={20} />
                </div>
                <span
                  style={{
                    color: "rgba(255,255,255,0.25)",
                    fontFamily: '"Sora", system-ui, sans-serif',
                    fontWeight: 800,
                    fontSize: 20,
                  }}
                >
                  {s.step}
                </span>
              </div>
              <div
                style={{
                  color: "#ffffff",
                  fontWeight: 800,
                  fontSize: 17,
                  marginTop: 12,
                  fontFamily: '"Sora", system-ui, sans-serif',
                }}
              >
                {s.title}
              </div>
              <div style={{ color: "rgba(255,255,255,0.6)", fontSize: 13, marginTop: 4 }}>
                {s.sub}
              </div>
            </div>
          ))}
        </div>

        <div
          style={{
            marginTop: 30,
            opacity: ctaIn,
            transform: `scale(${interpolate(ctaIn, [0, 1], [0.92, 1])})`,
            display: "inline-flex",
            alignItems: "center",
            gap: 12,
            padding: "14px 32px",
            borderRadius: 999,
            backgroundColor: "#dc3545",
            color: "#ffffff",
            fontWeight: 800,
            fontSize: 17,
            boxShadow: "0 16px 36px rgba(220,53,69,0.45)",
          }}
        >
          Choose Your Program & Step Inside the Dashboard · gamatfx.com
        </div>
      </div>
    </AbsoluteFill>
  );
};

/* --------------------------- Main Composition --------------------------- */

export const HowGamatWorksVideo: React.FC = () => {
  const frame = useCurrentFrame();
  const progressPct = (frame / HOW_IT_WORKS_DURATION_IN_FRAMES) * 100;

  let chapterTag = "Why Traders Fail";
  if (frame >= 4329) chapterTag = "Build Your Edge";
  else if (frame >= 3486) chapterTag = "Inside The Academy";
  else if (frame >= 2826) chapterTag = "Step 04 · Scale With Accountability";
  else if (frame >= 2079) chapterTag = "Step 03 · Trade Journal & Review";
  else if (frame >= 1314) chapterTag = "Step 02 · Learn & Apply Live";
  else if (frame >= 750) chapterTag = "Step 01 · Enroll & Instant Access";
  else if (frame >= 345) chapterTag = "The GAMAT Fx System";

  return (
    <AbsoluteFill style={{ backgroundColor: "#0e1014" }}>
      {/* Synced Voiceover Audio (48kHz 192kbps stereo MP3, non-interrupting playback) */}
      <Audio
        src="/audio/how-gamatfx-works.mp3"
        acceptableTimeShiftInSeconds={2.5}
        pauseWhenBuffering={false}
      />

      {/* Top Brand Header + Live Progress */}
      <TopBrandChrome chapterTag={chapterTag} progressPct={progressPct} />

      {/* 0.0s - 11.5s: The Retail Trader Problem */}
      <Sequence from={0} durationInFrames={345}>
        <Scene1Problem />
      </Sequence>

      {/* 11.5s - 25.0s: The GAMAT Fx System Overview */}
      <Sequence from={345} durationInFrames={405}>
        <Scene2SolutionOverview />
      </Sequence>

      {/* 25.0s - 43.8s: Step 1 - Enroll & Instant Access */}
      <Sequence from={750} durationInFrames={564}>
        <Scene3StepOneEnroll />
      </Sequence>

      {/* 43.8s - 69.3s: Step 2 - Learn, Then Apply Live */}
      <Sequence from={1314} durationInFrames={765}>
        <Scene4StepTwoApplyLive />
      </Sequence>

      {/* 69.3s - 94.2s: Step 3 - Journal Every Trade & Get Reviewed */}
      <Sequence from={2079} durationInFrames={747}>
        <Scene5StepThreeJournal />
      </Sequence>

      {/* 94.2s - 116.2s: Step 4 - Scale With Accountability */}
      <Sequence from={2826} durationInFrames={660}>
        <Scene6StepFourScale />
      </Sequence>

      {/* 116.2s - 128.2s: Real-World Footage 1 - Live Market Breakdowns */}
      <Sequence from={3486} durationInFrames={360}>
        <RealWorldFootageShowcase
          videoSrc={CLIPS.liveBreakdown}
          badge="Inside The Academy · Live Execution"
          title="Inside Live Market"
          accent="Breakdowns"
          subtitle="We mark key institutional levels and wait patiently for confirmation before risking a single dollar."
          hudItems={[
            { label: "Execution Rule", value: "Wait For HTF POI + LTF Trigger" },
            { label: "Capital Protection", value: "Zero Impulse Entries" },
          ]}
        />
      </Sequence>

      {/* 128.2s - 136.5s: Real-World Footage 2 - Multi-Screen Market Data */}
      <Sequence from={3846} durationInFrames={249}>
        <RealWorldFootageShowcase
          videoSrc={CLIPS.multiScreen}
          badge="Inside The Academy · Multi-Asset Workflow"
          title="Reading Multi-Screen"
          accent="Market Data"
          subtitle="Learn how macro news, higher-timeframe bias, and lower-timeframe execution align into one workflow."
          hudItems={[
            { label: "Top-Down Alignment", value: "Macro News + HTF Order Flow" },
            { label: "Correlated Assets", value: "DXY · EURUSD · XAUUSD · US100" },
          ]}
        />
      </Sequence>

      {/* 136.5s - 144.3s: Real-World Footage 3 - Analysis On The Go */}
      <Sequence from={4095} durationInFrames={234}>
        <RealWorldFootageShowcase
          videoSrc={CLIPS.onTheGo}
          badge="Inside The Academy · Anywhere Access"
          title="Analysis & Tools"
          accent="On The Go"
          subtitle="Your courses, trade journal, daily market outlooks, and community tools stay accessible wherever you are."
          hudItems={[
            { label: "Cloud Synced", value: "Courses · Journal · Daily Outlooks" },
            { label: "Device Ready", value: "Desktop · Tablet · Mobile" },
          ]}
        />
      </Sequence>

      {/* 144.3s - 160.6s: Outro & Call To Action */}
      <Sequence from={4329} durationInFrames={489}>
        <Scene8OutroCta />
      </Sequence>

      {/* Synced Voiceover Subtitles */}
      <SubtitleBar />
    </AbsoluteFill>
  );
};

export default HowGamatWorksVideo;
