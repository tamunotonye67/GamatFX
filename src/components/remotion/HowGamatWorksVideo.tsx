import React from "react";
import {
  AbsoluteFill,
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
  CheckCircle2,
  LineChart,
  ShieldCheck,
  TrendingUp,
  Users,
} from "lucide-react";

export const HOW_IT_WORKS_FPS = 30;
export const HOW_IT_WORKS_DURATION_IN_FRAMES = 600; // 20 seconds @ 30fps

/* -------------------------- Shared Background -------------------------- */

const StudioBackground: React.FC = () => {
  const frame = useCurrentFrame();
  const driftX = Math.sin(frame / 45) * 28;
  const driftY = Math.cos(frame / 55) * 22;

  return (
    <AbsoluteFill
      style={{
        backgroundColor: "#111317",
        overflow: "hidden",
        fontFamily: '"Inter", system-ui, sans-serif',
      }}
    >
      {/* Subtle radial glow */}
      <div
        style={{
          position: "absolute",
          top: -180 + driftY,
          right: -120 + driftX,
          width: 760,
          height: 760,
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(220,53,69,0.22) 0%, rgba(220,53,69,0) 70%)",
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: -220 - driftY,
          left: -140 - driftX,
          width: 680,
          height: 680,
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(16,185,129,0.12) 0%, rgba(16,185,129,0) 70%)",
        }}
      />

      {/* Institutional chart grid */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage:
            "linear-gradient(to right, rgba(255,255,255,0.035) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.035) 1px, transparent 1px)",
          backgroundSize: "64px 64px",
        }}
      />
    </AbsoluteFill>
  );
};

/* ------------------------------ Top Chrome ------------------------------ */

const TopBrandBar: React.FC<{ stepLabel: string }> = ({ stepLabel }) => {
  return (
    <div
      style={{
        position: "absolute",
        top: 44,
        left: 64,
        right: 64,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        zIndex: 10,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
        <div
          style={{
            width: 42,
            height: 42,
            borderRadius: 12,
            backgroundColor: "#dc3545",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#ffffff",
            fontWeight: 900,
            fontSize: 20,
            fontFamily: '"Sora", system-ui, sans-serif',
            boxShadow: "0 10px 25px rgba(220,53,69,0.35)",
          }}
        >
          G
        </div>
        <div>
          <div
            style={{
              color: "#ffffff",
              fontWeight: 800,
              fontSize: 18,
              letterSpacing: "-0.02em",
              fontFamily: '"Sora", system-ui, sans-serif',
            }}
          >
            GAMAT <span style={{ color: "#dc3545" }}>Fx</span> Academy
          </div>
          <div
            style={{
              color: "rgba(255,255,255,0.5)",
              fontSize: 12,
              fontWeight: 600,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
            }}
          >
            The Institutional Trading Blueprint
          </div>
        </div>
      </div>

      <div
        style={{
          padding: "8px 18px",
          borderRadius: 999,
          backgroundColor: "rgba(255,255,255,0.07)",
          border: "1px solid rgba(255,255,255,0.12)",
          color: "rgba(255,255,255,0.85)",
          fontSize: 13,
          fontWeight: 700,
          letterSpacing: "0.08em",
          textTransform: "uppercase",
        }}
      >
        {stepLabel}
      </div>
    </div>
  );
};

/* ---------------------------- Scene 1: Intro ---------------------------- */

const IntroScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const badgeSpring = spring({ frame, fps, config: { damping: 14 } });
  const titleSpring = spring({ frame: frame - 8, fps, config: { damping: 14 } });
  const subSpring = spring({ frame: frame - 18, fps, config: { damping: 14 } });
  const statsSpring = spring({ frame: frame - 30, fps, config: { damping: 14 } });

  const exitOpacity = interpolate(frame, [95, 115], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill style={{ opacity: exitOpacity }}>
      <TopBrandBar stepLabel="Academy Walkthrough" />

      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "0 110px",
          textAlign: "center",
        }}
      >
        <div
          style={{
            transform: `scale(${badgeSpring})`,
            opacity: badgeSpring,
            display: "inline-flex",
            alignItems: "center",
            gap: 10,
            padding: "10px 22px",
            borderRadius: 999,
            backgroundColor: "rgba(220,53,69,0.16)",
            border: "1px solid rgba(220,53,69,0.45)",
            color: "#ff6b7a",
            fontWeight: 800,
            fontSize: 15,
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            marginBottom: 28,
          }}
        >
          <TrendingUp size={18} /> How GAMAT Fx Works
        </div>

        <h1
          style={{
            transform: `translateY(${interpolate(titleSpring, [0, 1], [35, 0])}px)`,
            opacity: titleSpring,
            color: "#ffffff",
            fontFamily: '"Sora", system-ui, sans-serif',
            fontSize: 64,
            fontWeight: 800,
            lineHeight: 1.12,
            letterSpacing: "-0.03em",
            margin: 0,
            maxWidth: 1020,
          }}
        >
          From First Lesson to{" "}
          <span style={{ color: "#dc3545" }}>Confident, Accountable</span>{" "}
          Execution
        </h1>

        <p
          style={{
            transform: `translateY(${interpolate(subSpring, [0, 1], [25, 0])}px)`,
            opacity: subSpring,
            color: "rgba(255,255,255,0.7)",
            fontSize: 24,
            lineHeight: 1.5,
            maxWidth: 820,
            marginTop: 24,
            marginBottom: 44,
          }}
        >
          One structured system combining curriculum, live market execution,
          trade journaling, and 1-on-1 mentorship.
        </p>

        <div
          style={{
            display: "flex",
            gap: 24,
            opacity: statsSpring,
            transform: `translateY(${interpolate(statsSpring, [0, 1], [24, 0])}px)`,
          }}
        >
          {[
            { label: "Traders Trained", value: "1,000+" },
            { label: "Core Pillars", value: "4 Stages" },
            { label: "Student Rating", value: "4.9 / 5" },
          ].map((stat) => (
            <div
              key={stat.label}
              style={{
                padding: "18px 34px",
                borderRadius: 20,
                backgroundColor: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,255,255,0.1)",
                minWidth: 210,
              }}
            >
              <div
                style={{
                  color: "#ffffff",
                  fontSize: 30,
                  fontWeight: 800,
                  fontFamily: '"Sora", system-ui, sans-serif',
                }}
              >
                {stat.value}
              </div>
              <div
                style={{
                  color: "rgba(255,255,255,0.55)",
                  fontSize: 13,
                  fontWeight: 600,
                  marginTop: 4,
                  textTransform: "uppercase",
                  letterSpacing: "0.06em",
                }}
              >
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </AbsoluteFill>
  );
};

/* ------------------------- Scene 2–4: Step Cards ------------------------- */

type StepSceneProps = {
  stepNumber: string;
  tag: string;
  title: string;
  accentTitle: string;
  description: string;
  bullets: string[];
  visualType: "curriculum" | "chart" | "journal";
};

const StepScene: React.FC<StepSceneProps> = ({
  stepNumber,
  tag,
  title,
  accentTitle,
  description,
  bullets,
  visualType,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const leftIn = spring({ frame, fps, config: { damping: 15 } });
  const rightIn = spring({ frame: frame - 10, fps, config: { damping: 14 } });

  const exitOpacity = interpolate(frame, [100, 118], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill style={{ opacity: exitOpacity }}>
      <TopBrandBar stepLabel={`Stage ${stepNumber} of 04`} />

      <div
        style={{
          flex: 1,
          display: "grid",
          gridTemplateColumns: "1.05fr 0.95fr",
          alignItems: "center",
          gap: 56,
          padding: "90px 72px 40px 72px",
        }}
      >
        {/* Left column */}
        <div
          style={{
            opacity: leftIn,
            transform: `translateX(${interpolate(leftIn, [0, 1], [-40, 0])}px)`,
          }}
        >
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 12,
              marginBottom: 20,
            }}
          >
            <span
              style={{
                padding: "6px 14px",
                borderRadius: 10,
                backgroundColor: "#dc3545",
                color: "#ffffff",
                fontWeight: 800,
                fontSize: 15,
                fontFamily: '"Sora", system-ui, sans-serif',
              }}
            >
              STEP {stepNumber}
            </span>
            <span
              style={{
                color: "#ff6b7a",
                fontWeight: 700,
                fontSize: 15,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
              }}
            >
              {tag}
            </span>
          </div>

          <h2
            style={{
              color: "#ffffff",
              fontFamily: '"Sora", system-ui, sans-serif',
              fontSize: 48,
              fontWeight: 800,
              lineHeight: 1.15,
              margin: 0,
              letterSpacing: "-0.025em",
            }}
          >
            {title}{" "}
            <span style={{ color: "#dc3545" }}>{accentTitle}</span>
          </h2>

          <p
            style={{
              color: "rgba(255,255,255,0.7)",
              fontSize: 21,
              lineHeight: 1.55,
              marginTop: 20,
              marginBottom: 28,
            }}
          >
            {description}
          </p>

          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {bullets.map((b, idx) => {
              const bSpring = spring({
                frame: frame - 16 - idx * 7,
                fps,
                config: { damping: 15 },
              });
              return (
                <div
                  key={b}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 14,
                    opacity: bSpring,
                    transform: `translateX(${interpolate(bSpring, [0, 1], [-20, 0])}px)`,
                  }}
                >
                  <div
                    style={{
                      width: 28,
                      height: 28,
                      borderRadius: "50%",
                      backgroundColor: "rgba(16,185,129,0.18)",
                      border: "1px solid rgba(16,185,129,0.45)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "#34d399",
                      flexShrink: 0,
                    }}
                  >
                    <CheckCircle2 size={16} />
                  </div>
                  <span
                    style={{
                      color: "rgba(255,255,255,0.9)",
                      fontSize: 18,
                      fontWeight: 600,
                    }}
                  >
                    {b}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right visual card */}
        <div
          style={{
            opacity: rightIn,
            transform: `translateY(${interpolate(rightIn, [0, 1], [35, 0])}px) scale(${interpolate(rightIn, [0, 1], [0.95, 1])})`,
          }}
        >
          {visualType === "curriculum" && <CurriculumVisual frame={frame} fps={fps} />}
          {visualType === "chart" && <LiveChartVisual frame={frame} fps={fps} />}
          {visualType === "journal" && <JournalVisual frame={frame} fps={fps} />}
        </div>
      </div>
    </AbsoluteFill>
  );
};

/* -------------------------- Visual 1: Curriculum ------------------------- */

const CurriculumVisual: React.FC<{ frame: number; fps: number }> = ({ frame, fps }) => {
  const modules = [
    { code: "MOD 01", title: "Market Structure & Liquidity", progress: 100 },
    { code: "MOD 02", title: "Institutional Supply & Demand", progress: 100 },
    { code: "MOD 03", title: "Session Timing & Entry Triggers", progress: 82 },
    { code: "MOD 04", title: "Risk Management & Prop Scaling", progress: 65 },
  ];

  return (
    <div
      style={{
        borderRadius: 28,
        backgroundColor: "rgba(255,255,255,0.05)",
        border: "1px solid rgba(255,255,255,0.12)",
        padding: 32,
        boxShadow: "0 28px 60px rgba(0,0,0,0.45)",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 24,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div
            style={{
              width: 42,
              height: 42,
              borderRadius: 12,
              backgroundColor: "rgba(220,53,69,0.2)",
              color: "#ff6b7a",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <BookOpenCheck size={22} />
          </div>
          <div>
            <div style={{ color: "#ffffff", fontWeight: 800, fontSize: 18 }}>
              Student Workspace Unlocked
            </div>
            <div style={{ color: "rgba(255,255,255,0.5)", fontSize: 13 }}>
              Full Course Library · Workbooks · Private Community
            </div>
          </div>
        </div>
        <span
          style={{
            padding: "6px 12px",
            borderRadius: 999,
            backgroundColor: "rgba(16,185,129,0.16)",
            color: "#34d399",
            fontSize: 12,
            fontWeight: 800,
          }}
        >
          INSTANT ACCESS
        </span>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        {modules.map((m, i) => {
          const fill = spring({
            frame: frame - 14 - i * 8,
            fps,
            config: { damping: 18 },
          });
          return (
            <div
              key={m.code}
              style={{
                padding: "16px 20px",
                borderRadius: 18,
                backgroundColor: "rgba(17,19,23,0.75)",
                border: "1px solid rgba(255,255,255,0.08)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: 10,
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span
                    style={{
                      fontSize: 11,
                      fontWeight: 800,
                      color: "#ff6b7a",
                      backgroundColor: "rgba(220,53,69,0.16)",
                      padding: "4px 8px",
                      borderRadius: 6,
                    }}
                  >
                    {m.code}
                  </span>
                  <span style={{ color: "#ffffff", fontWeight: 700, fontSize: 16 }}>
                    {m.title}
                  </span>
                </div>
                <span style={{ color: "rgba(255,255,255,0.65)", fontSize: 13, fontWeight: 700 }}>
                  {Math.round(m.progress * fill)}%
                </span>
              </div>
              <div
                style={{
                  height: 7,
                  borderRadius: 999,
                  backgroundColor: "rgba(255,255,255,0.08)",
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    height: "100%",
                    width: `${m.progress * fill}%`,
                    borderRadius: 999,
                    background: "linear-gradient(90deg, #dc3545, #ff6b7a)",
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

/* ------------------------- Visual 2: Live Chart ------------------------- */

const LiveChartVisual: React.FC<{ frame: number; fps: number }> = ({ frame, fps }) => {
  const candles = [
    { bull: true, top: 140, height: 65, wickTop: 120, wickBottom: 220 },
    { bull: false, top: 160, height: 55, wickTop: 145, wickBottom: 235 },
    { bull: false, top: 195, height: 60, wickTop: 180, wickBottom: 270 },
    { bull: true, top: 165, height: 85, wickTop: 150, wickBottom: 265 },
    { bull: true, top: 120, height: 75, wickTop: 100, wickBottom: 210 },
    { bull: false, top: 135, height: 40, wickTop: 120, wickBottom: 190 },
    { bull: true, top: 80, height: 85, wickTop: 60, wickBottom: 175 },
    { bull: true, top: 45, height: 70, wickTop: 30, wickBottom: 130 },
  ];

  const rrReveal = spring({ frame: frame - 28, fps, config: { damping: 14 } });

  return (
    <div
      style={{
        borderRadius: 28,
        backgroundColor: "rgba(255,255,255,0.05)",
        border: "1px solid rgba(255,255,255,0.12)",
        padding: 30,
        boxShadow: "0 28px 60px rgba(0,0,0,0.45)",
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
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <LineChart size={22} color="#34d399" />
          <span style={{ color: "#ffffff", fontWeight: 800, fontSize: 18 }}>
            EURUSD · M15 London Session Live Breakdown
          </span>
        </div>
        <span
          style={{
            padding: "5px 12px",
            borderRadius: 999,
            backgroundColor: "rgba(220,53,69,0.2)",
            color: "#ff6b7a",
            fontSize: 12,
            fontWeight: 800,
          }}
        >
          ● LIVE MENTOR DESK
        </span>
      </div>

      {/* Chart canvas */}
      <div
        style={{
          position: "relative",
          height: 300,
          borderRadius: 20,
          backgroundColor: "#0d0f13",
          border: "1px solid rgba(255,255,255,0.08)",
          overflow: "hidden",
          padding: "20px 28px",
        }}
      >
        {/* Demand POI Zone */}
        <div
          style={{
            position: "absolute",
            left: 24,
            right: 24,
            bottom: 34,
            height: 54,
            borderRadius: 10,
            backgroundColor: "rgba(220,53,69,0.14)",
            border: "1px dashed rgba(220,53,69,0.5)",
            display: "flex",
            alignItems: "center",
            paddingLeft: 14,
            color: "#ff6b7a",
            fontSize: 12,
            fontWeight: 700,
          }}
        >
          HTF Institutional Demand Zone + FVG Entry
        </div>

        {/* Target Zone */}
        <div
          style={{
            position: "absolute",
            right: 32,
            top: 26,
            padding: "8px 16px",
            borderRadius: 12,
            backgroundColor: "rgba(16,185,129,0.18)",
            border: "1px solid rgba(16,185,129,0.5)",
            color: "#34d399",
            fontWeight: 800,
            fontSize: 14,
            opacity: rrReveal,
            transform: `scale(${rrReveal})`,
          }}
        >
          Target Hit · 1:3.5 Risk : Reward
        </div>

        {/* Candlesticks */}
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
            const cSpring = spring({
              frame: frame - 8 - idx * 4,
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
                  opacity: cSpring,
                  transform: `scaleY(${cSpring})`,
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
                    boxShadow: `0 0 16px ${color}44`,
                  }}
                />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

/* ------------------------- Visual 3: Trade Journal ------------------------ */

const JournalVisual: React.FC<{ frame: number; fps: number }> = ({ frame, fps }) => {
  const rows = [
    { pair: "EURUSD", dir: "Buy", rr: "1:3", pnl: "+$450", status: "Mentor Verified" },
    { pair: "XAUUSD", dir: "Sell", rr: "1:2.5", pnl: "+$380", status: "Setup Approved" },
    { pair: "GBPUSD", dir: "Buy", rr: "1:2", pnl: "+$240", status: "Rule Compliant" },
  ];

  return (
    <div
      style={{
        borderRadius: 28,
        backgroundColor: "rgba(255,255,255,0.05)",
        border: "1px solid rgba(255,255,255,0.12)",
        padding: 32,
        boxShadow: "0 28px 60px rgba(0,0,0,0.45)",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 22,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div
            style={{
              width: 42,
              height: 42,
              borderRadius: 12,
              backgroundColor: "rgba(16,185,129,0.18)",
              color: "#34d399",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <BrainCircuit size={22} />
          </div>
          <div>
            <div style={{ color: "#ffffff", fontWeight: 800, fontSize: 18 }}>
              Trade Journal & Mentor Feedback
            </div>
            <div style={{ color: "rgba(255,255,255,0.5)", fontSize: 13 }}>
              Win Rate: 74% · Net R-Multiple: +14.5R
            </div>
          </div>
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        {rows.map((r, i) => {
          const rSpring = spring({
            frame: frame - 12 - i * 8,
            fps,
            config: { damping: 15 },
          });
          return (
            <div
              key={r.pair}
              style={{
                opacity: rSpring,
                transform: `translateX(${interpolate(rSpring, [0, 1], [30, 0])}px)`,
                padding: "16px 20px",
                borderRadius: 18,
                backgroundColor: "rgba(17,19,23,0.8)",
                border: "1px solid rgba(255,255,255,0.08)",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span style={{ color: "#ffffff", fontWeight: 800, fontSize: 17 }}>
                    {r.pair}
                  </span>
                  <span
                    style={{
                      padding: "3px 9px",
                      borderRadius: 6,
                      fontSize: 12,
                      fontWeight: 800,
                      backgroundColor:
                        r.dir === "Buy"
                          ? "rgba(16,185,129,0.16)"
                          : "rgba(220,53,69,0.18)",
                      color: r.dir === "Buy" ? "#34d399" : "#ff6b7a",
                    }}
                  >
                    {r.dir}
                  </span>
                </div>
                <div
                  style={{
                    color: "rgba(255,255,255,0.5)",
                    fontSize: 13,
                    marginTop: 4,
                  }}
                >
                  {r.status}
                </div>
              </div>

              <div style={{ textAlign: "right" }}>
                <div style={{ color: "#34d399", fontWeight: 800, fontSize: 16 }}>
                  Win ({r.rr})
                </div>
                <div style={{ color: "rgba(255,255,255,0.7)", fontSize: 13, fontWeight: 700 }}>
                  {r.pnl}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

/* ----------------------- Scene 5: Graduate & Scale ----------------------- */

const ScaleOutroScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const cardIn = spring({ frame, fps, config: { damping: 14 } });
  const pillarsIn = spring({ frame: frame - 18, fps, config: { damping: 14 } });

  return (
    <AbsoluteFill>
      <TopBrandBar stepLabel="Stage 04 · Scale With Accountability" />

      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "40px 90px 0 90px",
          textAlign: "center",
        }}
      >
        <div
          style={{
            opacity: cardIn,
            transform: `scale(${interpolate(cardIn, [0, 1], [0.9, 1])})`,
            display: "inline-flex",
            alignItems: "center",
            gap: 10,
            padding: "10px 22px",
            borderRadius: 999,
            backgroundColor: "rgba(16,185,129,0.16)",
            border: "1px solid rgba(16,185,129,0.45)",
            color: "#34d399",
            fontWeight: 800,
            fontSize: 14,
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            marginBottom: 22,
          }}
        >
          <Award size={18} /> STEP 04 · GRADUATE & SCALE
        </div>

        <h2
          style={{
            opacity: cardIn,
            color: "#ffffff",
            fontFamily: '"Sora", system-ui, sans-serif',
            fontSize: 54,
            fontWeight: 800,
            lineHeight: 1.15,
            margin: 0,
            maxWidth: 940,
          }}
        >
          Trade Live Capital & Funded Accounts With{" "}
          <span style={{ color: "#dc3545" }}>Ongoing Mentor Backing</span>
        </h2>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            gap: 20,
            width: "100%",
            marginTop: 42,
            opacity: pillarsIn,
            transform: `translateY(${interpolate(pillarsIn, [0, 1], [30, 0])}px)`,
          }}
        >
          {[
            { icon: BookOpenCheck, step: "01", title: "Enroll & Unlock", sub: "Full library & community" },
            { icon: LineChart, step: "02", title: "Apply Live", sub: "Weekly live market execution" },
            { icon: BrainCircuit, step: "03", title: "Journal & Review", sub: "1-on-1 trade feedback" },
            { icon: ShieldCheck, step: "04", title: "Scale Capital", sub: "Prop & live account rules" },
          ].map((p) => (
            <div
              key={p.step}
              style={{
                padding: "24px 20px",
                borderRadius: 22,
                backgroundColor: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,255,255,0.12)",
                textAlign: "left",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: 14,
                }}
              >
                <div
                  style={{
                    width: 42,
                    height: 42,
                    borderRadius: 12,
                    backgroundColor: "rgba(220,53,69,0.2)",
                    color: "#ff6b7a",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <p.icon size={22} />
                </div>
                <span
                  style={{
                    fontFamily: '"Sora", system-ui, sans-serif',
                    fontSize: 22,
                    fontWeight: 800,
                    color: "rgba(255,255,255,0.22)",
                  }}
                >
                  {p.step}
                </span>
              </div>
              <div
                style={{
                  color: "#ffffff",
                  fontFamily: '"Sora", system-ui, sans-serif',
                  fontSize: 19,
                  fontWeight: 800,
                }}
              >
                {p.title}
              </div>
              <div
                style={{
                  color: "rgba(255,255,255,0.6)",
                  fontSize: 14,
                  marginTop: 6,
                }}
              >
                {p.sub}
              </div>
            </div>
          ))}
        </div>

        <div
          style={{
            marginTop: 38,
            display: "inline-flex",
            alignItems: "center",
            gap: 12,
            padding: "14px 32px",
            borderRadius: 999,
            backgroundColor: "#dc3545",
            color: "#ffffff",
            fontWeight: 800,
            fontSize: 18,
            boxShadow: "0 16px 36px rgba(220,53,69,0.4)",
          }}
        >
          <Users size={20} /> Start Your Trading Journey Today · gamatfx.com
        </div>
      </div>
    </AbsoluteFill>
  );
};

/* --------------------------- Main Composition --------------------------- */

export const HowGamatWorksVideo: React.FC = () => {
  return (
    <AbsoluteFill>
      <StudioBackground />

      {/* 0s - 4s: Intro */}
      <Sequence from={0} durationInFrames={120}>
        <IntroScene />
      </Sequence>

      {/* 4s - 8s: Step 01 */}
      <Sequence from={120} durationInFrames={120}>
        <StepScene
          stepNumber="01"
          tag="Instant Onboarding"
          title="Enroll & Unlock Your"
          accentTitle="Trading Workspace"
          description="Pick your program and unlock the complete GAMAT curriculum, downloadable workbooks, and private student trading floor immediately."
          bullets={[
            "Structured beginner-to-institutional video modules",
            "Interactive SMC whiteboard & risk calculators",
            "Direct access to the private student community",
          ]}
          visualType="curriculum"
        />
      </Sequence>

      {/* 8s - 12s: Step 02 */}
      <Sequence from={240} durationInFrames={120}>
        <StepScene
          stepNumber="02"
          tag="Live Market Execution"
          title="Learn the Theory, Then"
          accentTitle="Trade It Live"
          description="Move beyond pre-recorded theory. Join weekly live London & New York sessions where mentors map liquidity, POIs, and entries in real time."
          bullets={[
            "Live multi-timeframe top-down market breakdowns",
            "High-probability 1:3+ Risk : Reward institutional setups",
            "Session check-ins and recorded replay archive",
          ]}
          visualType="chart"
        />
      </Sequence>

      {/* 12s - 16s: Step 03 */}
      <Sequence from={360} durationInFrames={120}>
        <StepScene
          stepNumber="03"
          tag="Accountability Loop"
          title="Journal Every Trade &"
          accentTitle="Get Mentor Reviews"
          description="Log your entries, exits, and R-multiples directly inside your dashboard Trade Journal and book 1-on-1 review calls to eliminate mistakes."
          bullets={[
            "Built-in Trade Journal tracking Win Rate & Net R",
            "1-on-1 mentorship booking for personalized chart audits",
            "Verified attendance & course completion certificates",
          ]}
          visualType="journal"
        />
      </Sequence>

      {/* 16s - 20s: Step 04 + Summary */}
      <Sequence from={480} durationInFrames={120}>
        <ScaleOutroScene />
      </Sequence>
    </AbsoluteFill>
  );
};

export default HowGamatWorksVideo;
