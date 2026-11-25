import { useEffect, useState } from "react";
import { Download, Flame, X } from "lucide-react";
import { useStore } from "../lib/store";
import {
  getStreakTier,
  loadStreakState,
  openStreakModal,
  type DailyStreakState,
  type StreakTier,
} from "../lib/streaks";

export function StreakFlamePill({
  scrolled = true,
  className = "",
}: {
  scrolled?: boolean;
  className?: string;
}) {
  const { user, sessionId } = useStore();
  const uid = user?.id || sessionId;
  const [state, setState] = useState<DailyStreakState>(() => loadStreakState(uid));

  useEffect(() => {
    setState(loadStreakState(uid));
    const onUpdate = () => setState(loadStreakState(uid));
    window.addEventListener("gamat:streak-updated", onUpdate);
    window.addEventListener("storage", onUpdate);
    return () => {
      window.removeEventListener("gamat:streak-updated", onUpdate);
      window.removeEventListener("storage", onUpdate);
    };
  }, [uid]);

  if (!uid) return null;
  const tier = getStreakTier(state.currentStreak);

  return (
    <button
      type="button"
      onClick={openStreakModal}
      title={`${state.currentStreak}-day streak (${tier.name}) — click to view badge`}
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-extrabold transition hover:scale-105 active:scale-95 cursor-pointer ${
        scrolled
          ? "border border-line bg-cream text-ink hover:border-brand/40"
          : "border border-white/20 bg-white/10 text-white hover:bg-white/20"
      } ${className}`}
    >
      <Flame
        className="h-3.5 w-3.5 shrink-0"
        style={{
          color: state.currentStreak > 0 ? tier.accent : scrolled ? "#64748b" : "#cbd5e1",
          fill: state.currentStreak > 0 ? tier.flameFrom : "none",
        }}
      />
      <span className="tabular-nums">{state.currentStreak}</span>
    </button>
  );
}

function downloadStreakCardPng({
  handle,
  initials,
  state,
  tier,
  isUpgrade,
}: {
  handle: string;
  initials: string;
  state: DailyStreakState;
  tier: StreakTier;
  isUpgrade: boolean;
}) {
  const canvas = document.createElement("canvas");
  canvas.width = 900;
  canvas.height = 1280;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  // Background gradient
  const grad = ctx.createLinearGradient(0, 0, 0, canvas.height);
  grad.addColorStop(0, tier.cardBg);
  grad.addColorStop(1, "#ffffff");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Confetti accents
  const confetti = [
    { x: 95, y: 340, c: "#facc15", w: 22, h: 10, r: -0.3 },
    { x: 780, y: 310, c: "#ec4899", w: 22, h: 10, r: 0.4 },
    { x: 115, y: 580, c: "#fb7185", w: 20, h: 10, r: 0.2 },
    { x: 765, y: 590, c: "#38bdf8", w: 20, h: 10, r: -0.25 },
  ];
  for (const cf of confetti) {
    ctx.save();
    ctx.translate(cf.x, cf.y);
    ctx.rotate(cf.r);
    ctx.fillStyle = cf.c;
    ctx.fillRect(-cf.w / 2, -cf.h / 2, cf.w, cf.h);
    ctx.restore();
  }

  // Title
  ctx.fillStyle = tier.badgeText;
  ctx.font = "800 44px system-ui, -apple-system, sans-serif";
  ctx.textAlign = "left";
  ctx.fillText(
    isUpgrade ? "We've upgraded our" : "GAMAT Fx Daily",
    68,
    130
  );
  ctx.fillText(isUpgrade ? "Streak badge" : "Streak badge", 68, 185);

  ctx.fillStyle = "#111215";
  ctx.font = "900 54px system-ui, -apple-system, sans-serif";
  ctx.fillText(`@${handle}`, 68, 255);

  // Flame mascot body
  ctx.save();
  ctx.translate(450, 465);
  // Shadow
  ctx.fillStyle = "rgba(17,18,21,0.12)";
  ctx.beginPath();
  ctx.ellipse(0, 150, 105, 18, 0, 0, Math.PI * 2);
  ctx.fill();

  // Arms
  ctx.strokeStyle = "#111215";
  ctx.lineWidth = 11;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(-60, 20);
  ctx.quadraticCurveTo(-140, 25, -195, -55);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(60, 20);
  ctx.quadraticCurveTo(140, 25, 195, -55);
  ctx.stroke();

  // Legs
  ctx.beginPath();
  ctx.moveTo(-25, 85);
  ctx.lineTo(-65, 145);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(25, 85);
  ctx.lineTo(65, 145);
  ctx.stroke();

  // Flame shape
  const fGrad = ctx.createLinearGradient(0, -130, 0, 100);
  fGrad.addColorStop(0, tier.flameFrom);
  fGrad.addColorStop(1, tier.flameTo);
  ctx.fillStyle = fGrad;
  ctx.strokeStyle = "#111215";
  ctx.lineWidth = 10;
  ctx.beginPath();
  ctx.moveTo(0, -130);
  ctx.bezierCurveTo(65, -75, 95, -10, 75, 50);
  ctx.bezierCurveTo(55, 100, -55, 100, -75, 50);
  ctx.bezierCurveTo(-95, -10, -55, -70, 0, -130);
  ctx.fill();
  ctx.stroke();

  // Inner flame
  ctx.fillStyle = "rgba(255,255,255,0.45)";
  ctx.beginPath();
  ctx.moveTo(0, -35);
  ctx.bezierCurveTo(28, -5, 34, 35, 0, 62);
  ctx.bezierCurveTo(-34, 35, -28, -5, 0, -35);
  ctx.fill();

  // Left held badge (initials)
  ctx.fillStyle = "#111215";
  ctx.beginPath();
  ctx.arc(-205, -75, 74, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#ffffff";
  ctx.beginPath();
  ctx.arc(-205, -75, 65, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#111215";
  ctx.font = "900 40px system-ui, sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(initials, -205, -73);

  // Right held badge (Tier)
  ctx.fillStyle = "#111215";
  ctx.beginPath();
  ctx.arc(205, -75, 74, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = tier.accent;
  ctx.beginPath();
  ctx.arc(205, -75, 65, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#ffffff";
  ctx.font = "900 24px system-ui, sans-serif";
  ctx.fillText(tier.name.toUpperCase(), 205, -73);
  ctx.restore();

  // Cloud bubble
  ctx.save();
  ctx.fillStyle = "rgba(255,255,255,0.72)";
  ctx.strokeStyle = "#111215";
  ctx.lineWidth = 8;
  ctx.beginPath();
  ctx.arc(285, 860, 125, 0, Math.PI * 2);
  ctx.arc(450, 815, 155, 0, Math.PI * 2);
  ctx.arc(615, 865, 125, 0, Math.PI * 2);
  ctx.arc(450, 965, 175, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Big streak number
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.font = "900 185px system-ui, sans-serif";
  ctx.lineWidth = 16;
  ctx.strokeStyle = "#111215";
  ctx.strokeText(String(state.currentStreak), 450, 885);
  ctx.fillStyle = tier.flameFrom;
  ctx.fillText(String(state.currentStreak), 450, 885);

  // Top tilted tag
  ctx.save();
  ctx.translate(250, 725);
  ctx.rotate(-0.07);
  ctx.fillStyle = "#111215";
  ctx.fillRect(-135, -24, 270, 48);
  ctx.fillStyle = "#ffffff";
  ctx.font = "800 24px system-ui, sans-serif";
  ctx.fillText("Ongoing streak days", 0, 2);
  ctx.restore();

  // Bottom left stat
  const activityCount =
    state.gamesPlayed + state.lessonsCompleted + state.forumMessages;
  ctx.save();
  ctx.translate(245, 1055);
  ctx.rotate(-0.05);
  ctx.fillStyle = "#111215";
  ctx.fillRect(-115, -20, 230, 40);
  ctx.fillStyle = "#ffffff";
  ctx.font = "800 21px system-ui, sans-serif";
  ctx.fillText("Games & activity", 0, 1);
  ctx.restore();
  ctx.font = "900 58px system-ui, sans-serif";
  ctx.lineWidth = 10;
  ctx.strokeStyle = "#111215";
  ctx.strokeText(String(activityCount), 245, 1125);
  ctx.fillStyle = tier.flameFrom;
  ctx.fillText(String(activityCount), 245, 1125);

  // Bottom right stat
  ctx.save();
  ctx.translate(650, 1055);
  ctx.rotate(-0.05);
  ctx.fillStyle = "#111215";
  ctx.fillRect(-100, -20, 200, 40);
  ctx.fillStyle = "#ffffff";
  ctx.font = "800 21px system-ui, sans-serif";
  ctx.fillText("Best streak", 0, 1);
  ctx.restore();
  ctx.font = "900 58px system-ui, sans-serif";
  ctx.lineWidth = 10;
  ctx.strokeStyle = "#111215";
  ctx.strokeText(String(state.bestStreak), 650, 1125);
  ctx.fillStyle = tier.flameFrom;
  ctx.fillText(String(state.bestStreak), 650, 1125);
  ctx.restore();

  // Footer
  ctx.fillStyle = "rgba(17,18,21,0.55)";
  ctx.font = "700 22px system-ui, sans-serif";
  ctx.textAlign = "center";
  ctx.fillText("gamatfxacademy.com", 450, 1235);

  const link = document.createElement("a");
  link.download = `gamatfx-streak-${state.currentStreak}d.png`;
  link.href = canvas.toDataURL("image/png");
  link.click();
}

export function StreakCelebrationHost() {
  const { user, sessionId } = useStore();
  const uid = user?.id || sessionId;
  const [open, setOpen] = useState(false);
  const [isUpgrade, setIsUpgrade] = useState(false);
  const [state, setState] = useState<DailyStreakState>(() => loadStreakState(uid));

  useEffect(() => {
    setState(loadStreakState(uid));
  }, [uid]);

  useEffect(() => {
    const onUpdated = (e: Event) => {
      const detail = (e as CustomEvent<{
        userId: string;
        state: DailyStreakState;
        upgradedTier: StreakTier | null;
      }>).detail;
      if (!detail) return;
      setState(detail.state);
      if (detail.upgradedTier) {
        setIsUpgrade(true);
        setOpen(true);
      }
    };

    const onOpen = () => {
      setState(loadStreakState(uid));
      setIsUpgrade(false);
      setOpen(true);
    };

    window.addEventListener("gamat:streak-updated", onUpdated);
    window.addEventListener("gamat:open-streak-modal", onOpen);
    return () => {
      window.removeEventListener("gamat:streak-updated", onUpdated);
      window.removeEventListener("gamat:open-streak-modal", onOpen);
    };
  }, [uid]);

  if (!open || !uid) return null;

  const tier = getStreakTier(state.currentStreak);
  const handle = user?.firstName
    ? `${user.firstName}${user.lastName ? user.lastName[0] : ""}`
    : "Trader";
  const initials = `${user?.firstName?.[0] ?? "G"}${user?.lastName?.[0] ?? "F"}`.toUpperCase();
  const totalActivity =
    state.gamesPlayed + state.lessonsCompleted + state.forumMessages;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm">
      <div className="relative w-full max-w-sm">
        {/* Close button */}
        <button
          type="button"
          onClick={() => setOpen(false)}
          aria-label="Close streak badge"
          className="absolute -top-3 -right-3 z-30 flex h-9 w-9 items-center justify-center rounded-full border border-white/20 bg-ink text-white shadow-lg hover:bg-brand cursor-pointer"
        >
          <X className="h-4 w-4" />
        </button>

        {/* TikTok-style Streak Card */}
        <div
          className="relative overflow-hidden rounded-[28px] border-2 border-ink/90 p-6 shadow-2xl"
          style={{
            background: `linear-gradient(180deg, ${tier.cardBg} 0%, #ffffff 100%)`,
          }}
        >
          {/* Floating confetti */}
          <span className="pointer-events-none absolute left-5 top-28 h-2.5 w-4 -rotate-12 rounded-xs bg-amber-400" />
          <span className="pointer-events-none absolute right-6 top-24 h-2.5 w-4 rotate-12 rounded-xs bg-pink-500" />
          <span className="pointer-events-none absolute left-7 top-52 h-2.5 w-4 rotate-12 rounded-xs bg-rose-400" />
          <span className="pointer-events-none absolute right-7 top-56 h-2.5 w-4 -rotate-12 rounded-xs bg-sky-400" />

          {/* Header */}
          <div className="relative z-10">
            <p
              className="font-display text-xl font-extrabold leading-tight"
              style={{ color: tier.badgeText }}
            >
              {isUpgrade ? "We've upgraded our" : "GAMAT Fx Daily"}
              <br />
              {isUpgrade ? "Streak badge" : "Streak badge"}
            </p>
            <div className="mt-1 flex items-center gap-2">
              <span className="font-display text-2xl font-black text-ink">
                @{handle}
              </span>
              <span
                className="rounded-full px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider text-white"
                style={{ backgroundColor: tier.accent }}
              >
                {tier.name}
              </span>
            </div>
          </div>

          {/* Cute Flame Mascot holding Avatar + Tier */}
          <div className="relative z-10 my-4 flex items-center justify-center">
            <svg
              viewBox="0 0 320 175"
              className="h-40 w-full max-w-[290px] drop-shadow-sm animate-[bounce_3s_ease-in-out_infinite]"
              aria-hidden="true"
            >
              <defs>
                <linearGradient id="gamatFlameGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={tier.flameFrom} />
                  <stop offset="100%" stopColor={tier.flameTo} />
                </linearGradient>
              </defs>
              {/* Ground shadow */}
              <ellipse cx="160" cy="162" rx="54" ry="8" fill="rgba(17,18,21,0.14)" />

              {/* Left & Right arms */}
              <path
                d="M126 102 Q90 105 64 70"
                fill="none"
                stroke="#111215"
                strokeWidth="5"
                strokeLinecap="round"
              />
              <path
                d="M194 102 Q230 105 256 70"
                fill="none"
                stroke="#111215"
                strokeWidth="5"
                strokeLinecap="round"
              />

              {/* Legs */}
              <path
                d="M148 134 L132 160 M172 134 L188 160"
                fill="none"
                stroke="#111215"
                strokeWidth="5"
                strokeLinecap="round"
              />

              {/* Flame Body */}
              <path
                d="M160 18 C192 48 208 82 196 114 C186 138 134 138 124 114 C112 82 128 48 160 18 Z"
                fill="url(#gamatFlameGrad)"
                stroke="#111215"
                strokeWidth="5"
                strokeLinejoin="round"
              />
              {/* Inner highlight flame */}
              <path
                d="M160 68 C174 84 176 104 160 118 C144 104 146 84 160 68 Z"
                fill="rgba(255,255,255,0.45)"
              />

              {/* Left held circle: User Avatar / Initials */}
              <circle cx="56" cy="58" r="34" fill="#ffffff" stroke="#111215" strokeWidth="5" />
              <text
                x="56"
                y="63"
                textAnchor="middle"
                fill="#111215"
                fontWeight="900"
                fontSize="20"
                fontFamily="system-ui, sans-serif"
              >
                {initials}
              </text>

              {/* Right held circle: GAMAT Fx Tier */}
              <circle cx="264" cy="58" r="34" fill={tier.accent} stroke="#111215" strokeWidth="5" />
              <text
                x="264"
                y="62"
                textAnchor="middle"
                fill="#ffffff"
                fontWeight="900"
                fontSize="11"
                fontFamily="system-ui, sans-serif"
              >
                {tier.name.toUpperCase()}
              </text>
            </svg>
          </div>

          {/* Comic Cloud Day Counter */}
          <div className="relative z-10 mt-1 rounded-[26px] border-[3px] border-ink bg-white/85 px-4 pb-5 pt-6 text-center shadow-sm">
            <span className="inline-block -rotate-3 bg-ink px-2.5 py-0.5 text-[11px] font-extrabold text-white">
              Ongoing streak days
            </span>

            <div
              className="mt-1 font-display text-7xl font-black leading-none tracking-tight tabular-nums"
              style={{
                color: tier.flameFrom,
                WebkitTextStroke: "3px #111215",
                textShadow: "0 4px 0 #111215",
              }}
            >
              {state.currentStreak}
            </div>

            <div className="mt-4 grid grid-cols-2 gap-3">
              <div>
                <span className="inline-block -rotate-2 bg-ink px-2 py-0.5 text-[10px] font-bold text-white">
                  Games &amp; activity
                </span>
                <p
                  className="mt-1 font-display text-2xl font-black tabular-nums"
                  style={{
                    color: tier.flameFrom,
                    WebkitTextStroke: "1.5px #111215",
                  }}
                >
                  {totalActivity}
                </p>
              </div>
              <div>
                <span className="inline-block -rotate-2 bg-ink px-2 py-0.5 text-[10px] font-bold text-white">
                  Best streak
                </span>
                <p
                  className="mt-1 font-display text-2xl font-black tabular-nums"
                  style={{
                    color: tier.flameFrom,
                    WebkitTextStroke: "1.5px #111215",
                  }}
                >
                  {state.bestStreak}
                </p>
              </div>
            </div>
          </div>

          <p className="mt-3 text-center text-[11px] font-semibold text-ink/60">
            Play any Fun Zone game, finish a lesson, or post in Forum daily to keep your flame alive!
          </p>
        </div>

        {/* Action buttons */}
        <div className="mt-3 flex items-center gap-2.5">
          <button
            type="button"
            onClick={() =>
              downloadStreakCardPng({
                handle,
                initials,
                state,
                tier,
                isUpgrade,
              })
            }
            className="inline-flex flex-1 items-center justify-center gap-2 rounded-full bg-white py-3 text-xs font-extrabold text-ink shadow-lg hover:bg-cream cursor-pointer"
          >
            <Download className="h-4 w-4" /> Save / Share Card
          </button>
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="rounded-full bg-brand px-5 py-3 text-xs font-extrabold text-white shadow-lg hover:bg-brand-dark cursor-pointer"
          >
            Keep Going
          </button>
        </div>
      </div>
    </div>
  );
}
