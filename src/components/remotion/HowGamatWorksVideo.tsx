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
  aboutHero: "/images/about-hero.jpg",
  community: "/images/community.jpg",
  campusLab: "/images/gallery/campus-lab.jpg",
  chartReview: "/images/gallery/chart-review.jpg",
  graduation: "/images/gallery/graduation.jpg",
  liveWorkshop: "/images/gallery/live-workshop.jpg",
  mentorshipSession: "/images/gallery/mentorship-session.jpg",
  tradingFloor: "/images/gallery/trading-floor.jpg",
};

/* ----------------------- Continuous Camera Motion Layer ----------------------- */

const CameraBackdrop: React.FC<{
  videoSrc?: string;
  photoSrc?: string;
  panX?: [number, number];
  panY?: [number, number];
  zoom?: [number, number];
  dim?: number;
}> = ({
  videoSrc,
  photoSrc,
  panX = [0, -28],
  panY = [0, -14],
  zoom = [1.04, 1.14],
  dim = 0.62,
}) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();

  const progress = interpolate(frame, [0, durationInFrames], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const scale = interpolate(progress, [0, 1], zoom);
  const tx = interpolate(progress, [0, 1], panX);
  const ty = interpolate(progress, [0, 1], panY);

  return (
    <AbsoluteFill style={{ overflow: "hidden", backgroundColor: "#0d0f13" }}>
      <div
        style={{
          width: "100%",
          height: "100%",
          transform: `translate3d(${tx}px, ${ty}px, 0) scale(${scale})`,
          transformOrigin: "center center",
        }}
      >
        {videoSrc ? (
          <video
            src={videoSrc}
            muted
            autoPlay
            loop
            playsInline
            preload="auto"
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
        ) : photoSrc ? (
          <Img
            src={photoSrc}
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
        ) : null}
      </div>

      {/* Smooth cinematic vignette */}
      <AbsoluteFill
        style={{
          background: `radial-gradient(circle at 50% 45%, rgba(13,15,19,${
            dim - 0.14
          }) 0%, rgba(13,15,19,${Math.min(0.94, dim + 0.18)}) 100%)`,
        }}
      />
    </AbsoluteFill>
  );
};

/* ------------------------- Minimalist Top Watermark ------------------------- */

const MinimalBrandWatermark: React.FC = () => {
  return (
    <div
      style={{
        position: "absolute",
        top: 30,
        left: 44,
        display: "flex",
        alignItems: "center",
        gap: 10,
        zIndex: 40,
        opacity: 0.9,
      }}
    >
      <div
        style={{
          width: 30,
          height: 30,
          borderRadius: 9,
          backgroundColor: "#dc3545",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#ffffff",
          fontWeight: 900,
          fontSize: 15,
          fontFamily: '"Sora", system-ui, sans-serif',
        }}
      >
        G
      </div>
      <span
        style={{
          color: "#ffffff",
          fontWeight: 800,
          fontSize: 15,
          letterSpacing: "-0.02em",
          fontFamily: '"Sora", system-ui, sans-serif',
          textShadow: "0 2px 12px rgba(0,0,0,0.6)",
        }}
      >
        GAMAT <span style={{ color: "#dc3545" }}>Fx</span>
      </span>
    </div>
  );
};

/* ------------------------- Realistic Dashboard Cursor ------------------------- */

type CursorKeyframe = {
  frame: number;
  x: number;
  y: number;
  click?: boolean;
};

const AnimatedMouseCursor: React.FC<{
  keyframes: CursorKeyframe[];
}> = ({ keyframes }) => {
  const frame = useCurrentFrame();

  if (keyframes.length === 0) return null;

  let x = keyframes[0].x;
  let y = keyframes[0].y;

  for (let i = 0; i < keyframes.length - 1; i++) {
    const a = keyframes[i];
    const b = keyframes[i + 1];
    if (frame >= a.frame && frame <= b.frame) {
      const t = interpolate(frame, [a.frame, b.frame], [0, 1], {
        easing: Easing.bezier(0.25, 0.1, 0.25, 1),
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
      });
      x = a.x + (b.x - a.x) * t;
      y = a.y + (b.y - a.y) * t;
      break;
    } else if (frame > b.frame) {
      x = b.x;
      y = b.y;
    }
  }

  // Click ripple effect
  const activeClick = keyframes.find(
    (k) => k.click && frame >= k.frame && frame <= k.frame + 18
  );
  const clickProgress = activeClick
    ? interpolate(frame, [activeClick.frame, activeClick.frame + 18], [0, 1], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
      })
    : 0;
  const cursorScale = activeClick
    ? interpolate(
        frame,
        [activeClick.frame, activeClick.frame + 5, activeClick.frame + 12],
        [1, 0.86, 1],
        { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
      )
    : 1;

  return (
    <div
      style={{
        position: "absolute",
        left: 0,
        top: 0,
        transform: `translate3d(${x}px, ${y}px, 0)`,
        zIndex: 50,
        pointerEvents: "none",
      }}
    >
      {activeClick && (
        <div
          style={{
            position: "absolute",
            left: -14,
            top: -14,
            width: 34,
            height: 34,
            borderRadius: "50%",
            border: "2.5px solid #dc3545",
            transform: `scale(${0.4 + clickProgress * 1.4})`,
            opacity: 1 - clickProgress,
          }}
        />
      )}
      <svg
        width="26"
        height="26"
        viewBox="0 0 24 24"
        style={{
          transform: `scale(${cursorScale})`,
          filter: "drop-shadow(0 4px 8px rgba(0,0,0,0.45))",
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

/* ==========================================================================
   SCENE 1 (0.0s - 11.5s | Frames 0 - 345):
   "Most aspiring traders don't fail because they lack information..."
   ========================================================================== */

const Scene1Problem: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const titleIn = spring({ frame, fps, config: { damping: 16 } });
  const drift = interpolate(frame, [0, 345], [0, -18]);
  const fadeOut = interpolate(frame, [320, 345], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill style={{ opacity: fadeOut }}>
      <CameraBackdrop
        videoSrc={CLIPS.mainDesk}
        panX={[15, -25]}
        panY={[8, -10]}
        zoom={[1.03, 1.12]}
        dim={0.66}
      />

      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "0 96px",
          maxWidth: 980,
          zIndex: 10,
          transform: `translateY(${drift}px)`,
        }}
      >
        <div
          style={{
            opacity: titleIn,
            transform: `translateY(${interpolate(titleIn, [0, 1], [28, 0])}px)`,
          }}
        >
          <p
            style={{
              color: "#ff7583",
              fontSize: 14,
              fontWeight: 800,
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              marginBottom: 18,
            }}
          >
            Why Most Traders Struggle
          </p>
          <h1
            style={{
              color: "#ffffff",
              fontFamily: '"Sora", system-ui, sans-serif',
              fontSize: 58,
              fontWeight: 800,
              lineHeight: 1.12,
              margin: 0,
              letterSpacing: "-0.03em",
              textShadow: "0 10px 30px rgba(0,0,0,0.45)",
            }}
          >
            Information isn’t the problem.{" "}
            <span style={{ color: "#dc3545" }}>Lack of structure</span> is.
          </h1>
          <p
            style={{
              color: "rgba(255,255,255,0.78)",
              fontSize: 22,
              lineHeight: 1.5,
              marginTop: 22,
              maxWidth: 720,
            }}
          >
            Random videos without real-time application or mentor accountability
            keep aspiring traders stuck in guesswork.
          </p>
        </div>
      </div>
    </AbsoluteFill>
  );
};

/* ==========================================================================
   SCENE 2 (11.5s - 25.0s | Frames 345 - 750):
   "At GamatFX, we replaced guesswork with one complete, accountable trading system..."
   ========================================================================== */

const Scene2SystemIntro: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const headIn = spring({ frame, fps, config: { damping: 16 } });
  const cameraFloat = interpolate(frame, [0, 405], [14, -14]);
  const fadeOut = interpolate(frame, [380, 405], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill style={{ opacity: fadeOut }}>
      <CameraBackdrop
        photoSrc={PHOTOS.tradingFloor}
        panX={[-20, 20]}
        panY={[10, -12]}
        zoom={[1.05, 1.16]}
        dim={0.64}
      />

      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
          padding: "0 110px",
          zIndex: 10,
          transform: `translateY(${cameraFloat}px)`,
        }}
      >
        <div
          style={{
            opacity: headIn,
            transform: `scale(${interpolate(headIn, [0, 1], [0.95, 1])})`,
          }}
        >
          <p
            style={{
              color: "#34d399",
              fontSize: 14,
              fontWeight: 800,
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              marginBottom: 16,
            }}
          >
            The GAMAT Fx Method
          </p>
          <h2
            style={{
              color: "#ffffff",
              fontFamily: '"Sora", system-ui, sans-serif',
              fontSize: 56,
              fontWeight: 800,
              lineHeight: 1.13,
              margin: 0,
              letterSpacing: "-0.03em",
              maxWidth: 960,
            }}
          >
            One Complete System From{" "}
            <span style={{ color: "#dc3545" }}>Theory to Live Execution</span>
          </h2>
          <p
            style={{
              color: "rgba(255,255,255,0.78)",
              fontSize: 22,
              lineHeight: 1.5,
              marginTop: 20,
              maxWidth: 760,
              marginLeft: "auto",
              marginRight: "auto",
            }}
          >
            Here’s how it actually works from day one.
          </p>
        </div>
      </div>
    </AbsoluteFill>
  );
};

/* ==========================================================================
   SCENE 3 (25.0s - 43.8s | Frames 750 - 1314):
   Step 1: Enroll & Get Instant Access + Dashboard Mouse Motion
   ========================================================================== */

const Scene3StepOneDashboard: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const textIn = spring({ frame, fps, config: { damping: 16 } });
  const uiIn = spring({ frame: frame - 18, fps, config: { damping: 16 } });
  const fadeOut = interpolate(frame, [535, 564], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Camera gentle pan across the workspace
  const uiPanX = interpolate(frame, [0, 564], [12, -10]);
  const uiScale = interpolate(frame, [0, 564], [0.98, 1.03]);

  // Dashboard interactive state driven by mouse clicks
  const activeTab = frame >= 150 ? "courses" : "overview";
  const workbookDownloaded = frame >= 360;

  const cursorKeyframes: CursorKeyframe[] = [
    { frame: 40, x: 460, y: 260 },
    { frame: 140, x: 105, y: 158, click: true }, // Click "My Courses"
    { frame: 250, x: 350, y: 175 }, // Hover Module 1
    { frame: 350, x: 485, y: 292, click: true }, // Click "Download Workbook"
    { frame: 470, x: 340, y: 365 }, // Hover Community channel
  ];

  return (
    <AbsoluteFill style={{ opacity: fadeOut }}>
      <CameraBackdrop
        photoSrc={PHOTOS.campusLab}
        panX={[-15, 18]}
        panY={[6, -10]}
        zoom={[1.04, 1.13]}
        dim={0.72}
      />

      <div
        style={{
          flex: 1,
          display: "grid",
          gridTemplateColumns: "0.85fr 1.15fr",
          alignItems: "center",
          gap: 48,
          padding: "0 64px",
          zIndex: 10,
        }}
      >
        {/* Clean Left Copy */}
        <div
          style={{
            opacity: textIn,
            transform: `translateY(${interpolate(textIn, [0, 1], [24, 0])}px)`,
          }}
        >
          <span
            style={{
              color: "#dc3545",
              fontSize: 13,
              fontWeight: 800,
              letterSpacing: "0.14em",
              textTransform: "uppercase",
            }}
          >
            Step 01
          </span>
          <h2
            style={{
              color: "#ffffff",
              fontFamily: '"Sora", system-ui, sans-serif',
              fontSize: 46,
              fontWeight: 800,
              lineHeight: 1.14,
              margin: "12px 0 0 0",
            }}
          >
            Enroll & Get Instant Access
          </h2>
          <p
            style={{
              color: "rgba(255,255,255,0.75)",
              fontSize: 19,
              lineHeight: 1.55,
              marginTop: 18,
            }}
          >
            Your full dashboard unlocks immediately—structured modules,
            workbooks, checklists, and the private community.
          </p>
        </div>

        {/* Right: Clean GamatFX Dashboard Window with Live Mouse Motion */}
        <div
          style={{
            opacity: uiIn,
            transform: `translateX(${uiPanX}px) scale(${uiScale})`,
            position: "relative",
            borderRadius: 22,
            backgroundColor: "#f8fafc",
            boxShadow: "0 35px 80px rgba(0,0,0,0.6)",
            overflow: "hidden",
            border: "1px solid rgba(255,255,255,0.2)",
            height: 430,
          }}
        >
          <AnimatedMouseCursor keyframes={cursorKeyframes} />

          {/* Browser / App Top Bar */}
          <div
            style={{
              height: 40,
              backgroundColor: "#ffffff",
              borderBottom: "1px solid #e2e8f0",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "0 18px",
            }}
          >
            <div style={{ display: "flex", gap: 7 }}>
              <span style={{ width: 10, height: 10, borderRadius: "50%", backgroundColor: "#ef4444" }} />
              <span style={{ width: 10, height: 10, borderRadius: "50%", backgroundColor: "#f59e0b" }} />
              <span style={{ width: 10, height: 10, borderRadius: "50%", backgroundColor: "#10b981" }} />
            </div>
            <span style={{ fontSize: 11.5, fontWeight: 700, color: "#64748b" }}>
              gamatfx.com/dashboard
            </span>
            <span style={{ fontSize: 11, fontWeight: 700, color: "#10b981" }}>
              ● Enrolled
            </span>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "185px 1fr", height: 390 }}>
            {/* Soft Ash Sidebar matching our real app */}
            <div
              style={{
                backgroundColor: "#f1f5f9",
                borderRight: "1px solid #e2e8f0",
                padding: 14,
                display: "flex",
                flexDirection: "column",
                gap: 6,
              }}
            >
              {[
                { id: "overview", label: "Overview", icon: LayoutDashboard },
                { id: "courses", label: "My Courses", icon: BookOpenCheck },
                { id: "journal", label: "Trade Journal", icon: TrendingUp },
                { id: "events", label: "My Events", icon: CalendarCheck },
                { id: "certs", label: "Certificates", icon: Award },
              ].map((item) => {
                const isActive = activeTab === item.id;
                return (
                  <div
                    key={item.id}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 9,
                      padding: "9px 11px",
                      borderRadius: 10,
                      backgroundColor: isActive ? "#dc3545" : "transparent",
                      color: isActive ? "#ffffff" : "#334155",
                      fontSize: 12.5,
                      fontWeight: 700,
                    }}
                  >
                    <item.icon size={15} />
                    <span>{item.label}</span>
                  </div>
                );
              })}
            </div>

            {/* Dashboard Main Panel */}
            <div style={{ padding: 22, backgroundColor: "#ffffff" }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: 16,
                }}
              >
                <div>
                  <div style={{ fontSize: 16, fontWeight: 800, color: "#16181c" }}>
                    {activeTab === "courses" ? "My Courses & Workbooks" : "Student Workspace"}
                  </div>
                  <div style={{ fontSize: 12, color: "#64748b", marginTop: 2 }}>
                    Institutional Forex Mentorship · Full Access
                  </div>
                </div>
                <span
                  style={{
                    padding: "5px 10px",
                    borderRadius: 999,
                    backgroundColor: "#ecfdf5",
                    color: "#059669",
                    fontSize: 11,
                    fontWeight: 800,
                  }}
                >
                  Unlocked
                </span>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                <div
                  style={{
                    padding: "14px 16px",
                    borderRadius: 14,
                    border: "1px solid #e2e8f0",
                    backgroundColor: "#f8fafc",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <div>
                    <div style={{ fontSize: 13.5, fontWeight: 800, color: "#16181c" }}>
                      Module 01 · Market Structure & Liquidity
                    </div>
                    <div style={{ fontSize: 11.5, color: "#64748b", marginTop: 2 }}>
                      12 HD Lessons · Video Stream Ready
                    </div>
                  </div>
                  <span style={{ fontSize: 12, fontWeight: 800, color: "#dc3545" }}>
                    Watch →
                  </span>
                </div>

                <div
                  style={{
                    padding: "14px 16px",
                    borderRadius: 14,
                    border: workbookDownloaded ? "1px solid #10b981" : "1px solid #e2e8f0",
                    backgroundColor: workbookDownloaded ? "#ecfdf5" : "#f8fafc",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <div>
                    <div style={{ fontSize: 13.5, fontWeight: 800, color: "#16181c" }}>
                      PDF Workbooks & Pre-Trade Checklists
                    </div>
                    <div style={{ fontSize: 11.5, color: "#64748b", marginTop: 2 }}>
                      Institutional Execution Playbook
                    </div>
                  </div>
                  <span
                    style={{
                      padding: "6px 12px",
                      borderRadius: 8,
                      backgroundColor: workbookDownloaded ? "#10b981" : "#16181c",
                      color: "#ffffff",
                      fontSize: 11.5,
                      fontWeight: 700,
                    }}
                  >
                    {workbookDownloaded ? "Downloaded ✓" : "Download PDF"}
                  </span>
                </div>

                <div
                  style={{
                    padding: "14px 16px",
                    borderRadius: 14,
                    border: "1px solid #e2e8f0",
                    backgroundColor: "#f8fafc",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <div>
                    <div style={{ fontSize: 13.5, fontWeight: 800, color: "#16181c" }}>
                      Private Trader Community Floor
                    </div>
                    <div style={{ fontSize: 11.5, color: "#64748b", marginTop: 2 }}>
                      Daily markups & live Q&A channels
                    </div>
                  </div>
                  <span style={{ fontSize: 11.5, fontWeight: 800, color: "#059669" }}>
                    Active ●
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};

/* ==========================================================================
   SCENE 4 (43.8s - 69.3s | Frames 1314 - 2079):
   Step 2: Learn, Then Apply Live (Realistic live market footage + clean callout)
   ========================================================================== */

const Scene4StepTwoLive: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const copyIn = spring({ frame, fps, config: { damping: 16 } });
  const workshopIn = spring({ frame: frame - 180, fps, config: { damping: 16 } });
  const fadeOut = interpolate(frame, [735, 765], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill style={{ opacity: fadeOut }}>
      {/* First half: Realistic live trading footage; Second half: Real academy workshop */}
      {frame < 380 ? (
        <CameraBackdrop
          videoSrc={CLIPS.liveBreakdown}
          panX={[-20, 22]}
          panY={[8, -8]}
          zoom={[1.04, 1.15]}
          dim={0.58}
        />
      ) : (
        <CameraBackdrop
          photoSrc={PHOTOS.liveWorkshop}
          panX={[18, -22]}
          panY={[-8, 10]}
          zoom={[1.04, 1.16]}
          dim={0.6}
        />
      )}

      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          justifyContent: "flex-end",
          padding: "0 72px 76px 72px",
          zIndex: 10,
        }}
      >
        <div
          style={{
            maxWidth: 780,
            opacity: copyIn,
            transform: `translateY(${interpolate(copyIn, [0, 1], [24, 0])}px)`,
          }}
        >
          <span
            style={{
              color: "#dc3545",
              fontSize: 13,
              fontWeight: 800,
              letterSpacing: "0.14em",
              textTransform: "uppercase",
            }}
          >
            Step 02 · Weekly Live Sessions
          </span>
          <h2
            style={{
              color: "#ffffff",
              fontFamily: '"Sora", system-ui, sans-serif',
              fontSize: 48,
              fontWeight: 800,
              lineHeight: 1.14,
              margin: "10px 0 0 0",
              textShadow: "0 8px 28px rgba(0,0,0,0.6)",
            }}
          >
            Learn, Then Apply Live
          </h2>
          <p
            style={{
              color: "rgba(255,255,255,0.85)",
              fontSize: 20,
              lineHeight: 1.5,
              marginTop: 14,
              textShadow: "0 4px 16px rgba(0,0,0,0.6)",
            }}
          >
            Watch institutional order flow, liquidity sweeps, and market
            structure unfold in real time—knowing why a setup qualifies and when
            to stay out.
          </p>

          <div
            style={{
              marginTop: 20,
              display: "inline-flex",
              alignItems: "center",
              gap: 12,
              padding: "10px 18px",
              borderRadius: 999,
              backgroundColor: "rgba(13,15,19,0.78)",
              border: "1px solid rgba(255,255,255,0.18)",
              opacity: workshopIn,
            }}
          >
            <LineChart size={18} color="#34d399" />
            <span style={{ color: "#ffffff", fontSize: 14, fontWeight: 700 }}>
              Live Mentor Breakdowns · London & New York Sessions
            </span>
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};

/* ==========================================================================
   SCENE 5 (69.3s - 94.2s | Frames 2079 - 2826):
   Step 3: Journal Every Trade & Get Reviewed (Interactive Journal + Mouse Motion)
   ========================================================================== */

const Scene5StepThreeJournal: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const textIn = spring({ frame, fps, config: { damping: 16 } });
  const uiIn = spring({ frame: frame - 16, fps, config: { damping: 16 } });
  const fadeOut = interpolate(frame, [718, 747], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const uiPan = interpolate(frame, [0, 747], [-10, 12]);
  const tradeLogged = frame >= 360;
  const mentorFeedbackVisible = frame >= 470;

  const cursorKeyframes: CursorKeyframe[] = [
    { frame: 40, x: 420, y: 120 },
    { frame: 140, x: 125, y: 165, click: true }, // Select Entry
    { frame: 230, x: 380, y: 165, click: true }, // Select Risk : Reward 1:3
    { frame: 350, x: 465, y: 245, click: true }, // Click "Log Trade"
    { frame: 480, x: 280, y: 345 }, // Hover Mentor Feedback
  ];

  return (
    <AbsoluteFill style={{ opacity: fadeOut }}>
      <CameraBackdrop
        photoSrc={PHOTOS.chartReview}
        panX={[16, -20]}
        panY={[-6, 10]}
        zoom={[1.04, 1.14]}
        dim={0.74}
      />

      <div
        style={{
          flex: 1,
          display: "grid",
          gridTemplateColumns: "0.85fr 1.15fr",
          alignItems: "center",
          gap: 48,
          padding: "0 64px",
          zIndex: 10,
        }}
      >
        <div
          style={{
            opacity: textIn,
            transform: `translateY(${interpolate(textIn, [0, 1], [24, 0])}px)`,
          }}
        >
          <span
            style={{
              color: "#dc3545",
              fontSize: 13,
              fontWeight: 800,
              letterSpacing: "0.14em",
              textTransform: "uppercase",
            }}
          >
            Step 03
          </span>
          <h2
            style={{
              color: "#ffffff",
              fontFamily: '"Sora", system-ui, sans-serif',
              fontSize: 46,
              fontWeight: 800,
              lineHeight: 1.14,
              margin: "12px 0 0 0",
            }}
          >
            Journal Every Trade & Get Reviewed
          </h2>
          <p
            style={{
              color: "rgba(255,255,255,0.75)",
              fontSize: 19,
              lineHeight: 1.55,
              marginTop: 18,
            }}
          >
            Log entry, stop loss, take profit, and risk-to-reward inside your
            Trade Journal so mentors can audit your setups and sharpen your
            habits.
          </p>
        </div>

        {/* Right: Trade Journal Dashboard with Mouse Motion */}
        <div
          style={{
            opacity: uiIn,
            transform: `translateX(${uiPan}px)`,
            position: "relative",
            borderRadius: 22,
            backgroundColor: "#ffffff",
            boxShadow: "0 35px 80px rgba(0,0,0,0.6)",
            overflow: "hidden",
            border: "1px solid rgba(255,255,255,0.2)",
            padding: 24,
          }}
        >
          <AnimatedMouseCursor keyframes={cursorKeyframes} />

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              paddingBottom: 14,
              borderBottom: "1px solid #e2e8f0",
              marginBottom: 18,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <BrainCircuit size={20} color="#dc3545" />
              <span style={{ fontSize: 16, fontWeight: 800, color: "#16181c" }}>
                GamatFX Trade Journal
              </span>
            </div>
            <span style={{ fontSize: 12, fontWeight: 700, color: "#059669" }}>
              Win Rate: 74% · +14.5R
            </span>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(4, 1fr)",
              gap: 10,
              marginBottom: 14,
            }}
          >
            {[
              { label: "Pair", val: "EURUSD · Buy" },
              { label: "Entry", val: "1.08450" },
              { label: "Stop / Target", val: "20p / 60p" },
              { label: "Risk : Reward", val: "1:3" },
            ].map((f) => (
              <div
                key={f.label}
                style={{
                  padding: "10px 12px",
                  borderRadius: 12,
                  backgroundColor: "#f8fafc",
                  border: "1px solid #e2e8f0",
                }}
              >
                <div style={{ fontSize: 10.5, fontWeight: 700, color: "#64748b" }}>
                  {f.label}
                </div>
                <div style={{ fontSize: 13.5, fontWeight: 800, color: "#16181c", marginTop: 3 }}>
                  {f.val}
                </div>
              </div>
            ))}
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "12px 14px",
              borderRadius: 12,
              backgroundColor: "#f8fafc",
              border: "1px solid #e2e8f0",
              marginBottom: 16,
            }}
          >
            <span style={{ fontSize: 12.5, color: "#475569", fontWeight: 600 }}>
              Setup: London sweep + M5 FVG mitigation
            </span>
            <span
              style={{
                padding: "7px 14px",
                borderRadius: 9,
                backgroundColor: tradeLogged ? "#10b981" : "#dc3545",
                color: "#ffffff",
                fontSize: 12,
                fontWeight: 800,
              }}
            >
              {tradeLogged ? "Logged ✓" : "+ Log Trade"}
            </span>
          </div>

          <div
            style={{
              opacity: mentorFeedbackVisible ? 1 : 0.25,
              transform: `translateY(${mentorFeedbackVisible ? 0 : 8}px)`,
              transition: "all 0.3s ease",
              padding: "14px 16px",
              borderRadius: 14,
              backgroundColor: "#ecfdf5",
              border: "1px solid #a7f3d0",
              display: "flex",
              alignItems: "flex-start",
              gap: 12,
            }}
          >
            <CheckCircle2 size={20} color="#059669" style={{ flexShrink: 0, marginTop: 2 }} />
            <div>
              <div style={{ fontSize: 12.5, fontWeight: 800, color: "#065f46" }}>
                Mentor Audit · Approved Execution
              </div>
              <div style={{ fontSize: 12.5, color: "#047857", marginTop: 3 }}>
                “Clean confirmation entry. Risk stayed strictly at 1% with zero
                emotional chasing.”
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
   Step 4: Scale With Accountability (Certificate & Check-in Dashboard Motion)
   ========================================================================== */

const Scene6StepFourScale: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const textIn = spring({ frame, fps, config: { damping: 16 } });
  const uiIn = spring({ frame: frame - 16, fps, config: { damping: 16 } });
  const fadeOut = interpolate(frame, [632, 660], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const certOpened = frame >= 320;
  const cursorKeyframes: CursorKeyframe[] = [
    { frame: 50, x: 420, y: 260 },
    { frame: 180, x: 210, y: 145 }, // Hover workshop check-in
    { frame: 310, x: 410, y: 215, click: true }, // Click "Attendance Certificate"
    { frame: 480, x: 290, y: 310 },
  ];

  return (
    <AbsoluteFill style={{ opacity: fadeOut }}>
      <CameraBackdrop
        photoSrc={PHOTOS.graduation}
        panX={[-18, 22]}
        panY={[8, -10]}
        zoom={[1.04, 1.15]}
        dim={0.72}
      />

      <div
        style={{
          flex: 1,
          display: "grid",
          gridTemplateColumns: "0.85fr 1.15fr",
          alignItems: "center",
          gap: 48,
          padding: "0 64px",
          zIndex: 10,
        }}
      >
        <div
          style={{
            opacity: textIn,
            transform: `translateY(${interpolate(textIn, [0, 1], [24, 0])}px)`,
          }}
        >
          <span
            style={{
              color: "#34d399",
              fontSize: 13,
              fontWeight: 800,
              letterSpacing: "0.14em",
              textTransform: "uppercase",
            }}
          >
            Step 04
          </span>
          <h2
            style={{
              color: "#ffffff",
              fontFamily: '"Sora", system-ui, sans-serif',
              fontSize: 46,
              fontWeight: 800,
              lineHeight: 1.14,
              margin: "12px 0 0 0",
            }}
          >
            Scale With Accountability
          </h2>
          <p
            style={{
              color: "rgba(255,255,255,0.75)",
              fontSize: 19,
              lineHeight: 1.55,
              marginTop: 18,
            }}
          >
            Earn verified GamatFX certificates and graduate to live capital or
            funded-account challenges backed by ongoing mentor support.
          </p>
        </div>

        {/* Right: Clean Certification & Scaling Card with Mouse Motion */}
        <div
          style={{
            opacity: uiIn,
            transform: `translateX(${interpolate(frame, [0, 660], [10, -10])}px)`,
            position: "relative",
            borderRadius: 22,
            backgroundColor: "#ffffff",
            boxShadow: "0 35px 80px rgba(0,0,0,0.6)",
            padding: 26,
          }}
        >
          <AnimatedMouseCursor keyframes={cursorKeyframes} />

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 16,
            }}
          >
            <span style={{ fontSize: 15, fontWeight: 800, color: "#16181c" }}>
              Workshop Check-In & Certification
            </span>
            <span
              style={{
                padding: "4px 10px",
                borderRadius: 999,
                backgroundColor: "#ecfdf5",
                color: "#059669",
                fontSize: 11,
                fontWeight: 800,
              }}
            >
              Attended ✓
            </span>
          </div>

          <div style={{ display: "flex", gap: 8, marginBottom: 18 }}>
            {["Day 1 ✓", "Day 2 ✓", "Day 3 ✓", "Day 4 ✓", "Quiz Passed ✓"].map(
              (d) => (
                <span
                  key={d}
                  style={{
                    padding: "5px 10px",
                    borderRadius: 8,
                    backgroundColor: "#f0fdf4",
                    border: "1px solid #bbf7d0",
                    color: "#15803d",
                    fontSize: 11.5,
                    fontWeight: 700,
                  }}
                >
                  {d}
                </span>
              )
            )}
          </div>

          <div
            style={{
              padding: "16px 18px",
              borderRadius: 16,
              backgroundColor: certOpened ? "#ecfdf5" : "#f8fafc",
              border: certOpened ? "1px solid #10b981" : "1px solid #e2e8f0",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: 16,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <Award size={26} color="#dc3545" />
              <div>
                <div style={{ fontSize: 14, fontWeight: 800, color: "#16181c" }}>
                  Verified GAMAT Fx Certificate
                </div>
                <div style={{ fontSize: 11.5, color: "#64748b" }}>
                  Serial: EVT-GX-SSTR-EIQJ
                </div>
              </div>
            </div>
            <span
              style={{
                padding: "7px 12px",
                borderRadius: 9,
                backgroundColor: certOpened ? "#059669" : "#16181c",
                color: "#ffffff",
                fontSize: 11.5,
                fontWeight: 700,
              }}
            >
              {certOpened ? "Certificate Ready ✓" : "View Certificate"}
            </span>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10 }}>
            {[
              { label: "Max Risk / Trade", val: "1.0%" },
              { label: "Drawdown Cap", val: "2.0% Daily" },
              { label: "Capital Track", val: "Live & Funded" },
            ].map((item) => (
              <div
                key={item.label}
                style={{
                  padding: "12px",
                  borderRadius: 12,
                  backgroundColor: "#f8fafc",
                  border: "1px solid #e2e8f0",
                }}
              >
                <div style={{ fontSize: 10.5, color: "#64748b", fontWeight: 600 }}>
                  {item.label}
                </div>
                <div style={{ fontSize: 14, fontWeight: 800, color: "#16181c", marginTop: 3 }}>
                  {item.val}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};

/* ==========================================================================
   SCENE 7 (116.2s - 144.3s | Frames 3486 - 4329):
   Inside the Academy — 3 Pure Cinematic Real-World Footage Clips with Camera Motion
   ========================================================================== */

const CinematicFootageClip: React.FC<{
  videoSrc: string;
  eyebrow: string;
  title: string;
  subtitle: string;
  panX: [number, number];
}> = ({ videoSrc, eyebrow, title, subtitle, panX }) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  const textIn = spring({ frame, fps, config: { damping: 16 } });
  const fadeOut = interpolate(
    frame,
    [durationInFrames - 22, durationInFrames],
    [1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  return (
    <AbsoluteFill style={{ opacity: fadeOut }}>
      <CameraBackdrop
        videoSrc={videoSrc}
        panX={panX}
        panY={[6, -8]}
        zoom={[1.05, 1.15]}
        dim={0.44}
      />

      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          justifyContent: "flex-end",
          padding: "0 72px 72px 72px",
          zIndex: 10,
        }}
      >
        <div
          style={{
            maxWidth: 740,
            opacity: textIn,
            transform: `translateY(${interpolate(textIn, [0, 1], [24, 0])}px)`,
          }}
        >
          <span
            style={{
              color: "#ff7583",
              fontSize: 13,
              fontWeight: 800,
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              textShadow: "0 2px 10px rgba(0,0,0,0.65)",
            }}
          >
            {eyebrow}
          </span>
          <h3
            style={{
              color: "#ffffff",
              fontFamily: '"Sora", system-ui, sans-serif',
              fontSize: 44,
              fontWeight: 800,
              lineHeight: 1.14,
              margin: "10px 0 0 0",
              textShadow: "0 8px 26px rgba(0,0,0,0.65)",
            }}
          >
            {title}
          </h3>
          <p
            style={{
              color: "rgba(255,255,255,0.88)",
              fontSize: 19,
              lineHeight: 1.5,
              marginTop: 12,
              textShadow: "0 4px 16px rgba(0,0,0,0.65)",
            }}
          >
            {subtitle}
          </p>
        </div>
      </div>
    </AbsoluteFill>
  );
};

/* ==========================================================================
   SCENE 8 (144.3s - 160.6s | Frames 4329 - 4818):
   Clean Closing CTA with Smooth Camera Zoom
   ========================================================================== */

const Scene8Outro: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const titleIn = spring({ frame, fps, config: { damping: 16 } });
  const ctaIn = spring({ frame: frame - 35, fps, config: { damping: 16 } });
  const drift = interpolate(frame, [0, 489], [10, -10]);

  return (
    <AbsoluteFill>
      <CameraBackdrop
        photoSrc={PHOTOS.aboutHero}
        panX={[-18, 18]}
        panY={[10, -10]}
        zoom={[1.04, 1.15]}
        dim={0.7}
      />

      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
          padding: "0 96px",
          zIndex: 10,
          transform: `translateY(${drift}px)`,
        }}
      >
        <div style={{ opacity: titleIn }}>
          <p
            style={{
              color: "#ff7583",
              fontSize: 14,
              fontWeight: 800,
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              marginBottom: 16,
            }}
          >
            GamatFX Academy
          </p>
          <h2
            style={{
              color: "#ffffff",
              fontFamily: '"Sora", system-ui, sans-serif',
              fontSize: 54,
              fontWeight: 800,
              lineHeight: 1.13,
              margin: 0,
              maxWidth: 920,
            }}
          >
            Build Your Edge—<span style={{ color: "#dc3545" }}>The Right Way.</span>
          </h2>
          <p
            style={{
              color: "rgba(255,255,255,0.78)",
              fontSize: 21,
              lineHeight: 1.5,
              marginTop: 18,
              maxWidth: 720,
              marginLeft: "auto",
              marginRight: "auto",
            }}
          >
            Structure, live mentorship, and accountability to trade with
            confidence.
          </p>
        </div>

        <div
          style={{
            marginTop: 34,
            opacity: ctaIn,
            transform: `scale(${interpolate(ctaIn, [0, 1], [0.94, 1])})`,
            padding: "15px 36px",
            borderRadius: 999,
            backgroundColor: "#dc3545",
            color: "#ffffff",
            fontWeight: 800,
            fontSize: 18,
            boxShadow: "0 18px 40px rgba(220,53,69,0.45)",
          }}
        >
          Choose Your Program · gamatfx.com
        </div>
      </div>
    </AbsoluteFill>
  );
};

/* --------------------------- Main Composition --------------------------- */

export const HowGamatWorksVideo: React.FC = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: "#0d0f13" }}>
      <Audio
        src="/audio/how-gamatfx-works.mp3"
        acceptableTimeShiftInSeconds={2.5}
        pauseWhenBuffering={false}
      />

      <MinimalBrandWatermark />

      {/* 0.0s - 11.5s */}
      <Sequence from={0} durationInFrames={345}>
        <Scene1Problem />
      </Sequence>

      {/* 11.5s - 25.0s */}
      <Sequence from={345} durationInFrames={405}>
        <Scene2SystemIntro />
      </Sequence>

      {/* 25.0s - 43.8s: Dashboard + Mouse Motion */}
      <Sequence from={750} durationInFrames={564}>
        <Scene3StepOneDashboard />
      </Sequence>

      {/* 43.8s - 69.3s: Realistic Live Market & Workshop Footage */}
      <Sequence from={1314} durationInFrames={765}>
        <Scene4StepTwoLive />
      </Sequence>

      {/* 69.3s - 94.2s: Trade Journal + Mouse Motion */}
      <Sequence from={2079} durationInFrames={747}>
        <Scene5StepThreeJournal />
      </Sequence>

      {/* 94.2s - 116.2s: Check-In & Certificate + Mouse Motion */}
      <Sequence from={2826} durationInFrames={660}>
        <Scene6StepFourScale />
      </Sequence>

      {/* 116.2s - 128.2s */}
      <Sequence from={3486} durationInFrames={360}>
        <CinematicFootageClip
          videoSrc={CLIPS.liveBreakdown}
          eyebrow="Inside The Academy"
          title="Live Market Breakdowns"
          subtitle="We mark key levels and wait patiently for confirmation before risking a single dollar."
          panX={[-15, 22]}
        />
      </Sequence>

      {/* 128.2s - 136.5s */}
      <Sequence from={3846} durationInFrames={249}>
        <CinematicFootageClip
          videoSrc={CLIPS.multiScreen}
          eyebrow="Inside The Academy"
          title="Reading Multi-Screen Market Data"
          subtitle="Macro news, higher-timeframe bias, and lower-timeframe execution working together."
          panX={[18, -18]}
        />
      </Sequence>

      {/* 136.5s - 144.3s */}
      <Sequence from={4095} durationInFrames={234}>
        <CinematicFootageClip
          videoSrc={CLIPS.onTheGo}
          eyebrow="Inside The Academy"
          title="Analysis On The Go"
          subtitle="Courses, trade journal, daily outlooks, and community tools accessible wherever you are."
          panX={[-18, 16]}
        />
      </Sequence>

      {/* 144.3s - 160.6s */}
      <Sequence from={4329} durationInFrames={489}>
        <Scene8Outro />
      </Sequence>
    </AbsoluteFill>
  );
};

export default HowGamatWorksVideo;
