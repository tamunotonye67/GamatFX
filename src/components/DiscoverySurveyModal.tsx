import { useEffect, useState } from "react";
import {
  CheckCircle2,
  Compass,
  Globe,
  MessageCircle,
  Mic2,
  Search,
  Share2,
  Sparkles,
  Tv,
  Users,
  Video,
  X,
} from "lucide-react";
import { useStore } from "../lib/store";
import { useRoute } from "../lib/router";
import { formatAccountName } from "../lib/formatName";
import {
  DISCOVERY_OPTIONS,
  consumeJustRegisteredFlag,
  dismissDiscoveryForSession,
  hasCompletedDiscoverySurvey,
  isDiscoveryDismissedForSession,
  saveDiscoveryResponse,
  type DiscoverySourceId,
} from "../lib/discoverySurvey";

function SourceIcon({ id, active }: { id: DiscoverySourceId; active: boolean }) {
  const cls = `h-4 w-4 transition-transform duration-200 ${active ? "scale-110 text-white" : "text-ink/80 group-hover:text-brand"}`;
  switch (id) {
    case "instagram":
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={cls}>
          <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
          <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
          <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
        </svg>
      );
    case "youtube":
      return <Tv className={cls} />;
    case "tiktok":
      return <Video className={cls} />;
    case "friend_referral":
      return <Users className={cls} />;
    case "whatsapp_telegram":
      return <MessageCircle className={cls} />;
    case "twitter":
      return <Share2 className={cls} />;
    case "google_search":
      return <Search className={cls} />;
    case "live_event":
      return <Mic2 className={cls} />;
    case "facebook_linkedin":
      return <Globe className={cls} />;
    case "other":
    default:
      return <Compass className={cls} />;
  }
}

export default function DiscoverySurveyModal() {
  const { user } = useStore();
  const isAuthed = Boolean(user);
  const pathname = useRoute();

  const [open, setOpen] = useState(false);
  const [isNewStudentContext, setIsNewStudentContext] = useState(false);
  const [selectedId, setSelectedId] = useState<DiscoverySourceId | null>(null);
  const [detail, setDetail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    // Never interrupt focused workspaces, admin, or auth credential screens
    const isExcludedVisitorRoute =
      pathname.startsWith("/admin") ||
      pathname.startsWith("/login") ||
      pathname.startsWith("/signup") ||
      pathname.startsWith("/forgot-password") ||
      pathname.startsWith("/reset-password") ||
      pathname.startsWith("/whiteboard") ||
      pathname.startsWith("/learn") ||
      pathname.startsWith("/quiz") ||
      pathname.startsWith("/checkout");

    const checkAndOpen = (forceNewStudent = false) => {
      if (hasCompletedDiscoverySurvey(user?.id, user?.email)) {
        return;
      }

      const justReg = forceNewStudent || consumeJustRegisteredFlag();

      // Check if this authenticated student joined very recently (< 10 minutes ago) and hasn't answered
      const isRecentSignup =
        isAuthed &&
        user?.joined &&
        Date.now() - new Date(user.joined).getTime() < 10 * 60 * 1000;

      if (justReg || (isRecentSignup && !isDiscoveryDismissedForSession())) {
        setIsNewStudentContext(true);
        setOpen(true);
        return;
      }

      if (isExcludedVisitorRoute || pathname.startsWith("/dashboard")) {
        return;
      }

      if (!isDiscoveryDismissedForSession()) {
        setIsNewStudentContext(false);
        setOpen(true);
      }
    };

    const justRegNow = consumeJustRegisteredFlag();
    const isRecentSignup =
      isAuthed &&
      user?.joined &&
      Date.now() - new Date(user.joined).getTime() < 10 * 60 * 1000;

    let timer: ReturnType<typeof setTimeout> | null = null;

    if (!hasCompletedDiscoverySurvey(user?.id, user?.email)) {
      if (justRegNow || (isRecentSignup && !isDiscoveryDismissedForSession())) {
        timer = setTimeout(() => checkAndOpen(true), 750);
      } else if (!isExcludedVisitorRoute && !pathname.startsWith("/dashboard") && !isDiscoveryDismissedForSession()) {
        timer = setTimeout(() => checkAndOpen(false), 4500);
      }
    }

    const onTrigger = () => {
      if (timer) clearTimeout(timer);
      timer = setTimeout(() => checkAndOpen(true), 600);
    };

    window.addEventListener("gamat:discovery-trigger", onTrigger);
    return () => {
      if (timer) clearTimeout(timer);
      window.removeEventListener("gamat:discovery-trigger", onTrigger);
    };
  }, [pathname, isAuthed, user?.id, user?.email, user?.joined]);

  if (!open) return null;

  const selectedOption = DISCOVERY_OPTIONS.find((o) => o.id === selectedId);

  const handleDismiss = () => {
    dismissDiscoveryForSession();
    setOpen(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedId) return;

    saveDiscoveryResponse({
      sourceId: selectedId,
      detail: detail.trim() || undefined,
      userId: user?.id,
      userName: user ? formatAccountName(user) : undefined,
      userEmail: user?.email,
      route: pathname,
    });

    setSubmitted(true);
    setTimeout(() => {
      setOpen(false);
      setSubmitted(false);
    }, 1400);
  };

  return (
    <div
      className="fixed inset-0 z-[110] flex items-end sm:items-center justify-center bg-ink/75 backdrop-blur-md p-3 sm:p-5 animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-labelledby="discovery-survey-title"
    >
      <div
        className="relative w-full max-w-xl overflow-hidden rounded-3xl bg-white shadow-2xl border border-line/80 transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top luxury brand header */}
        <div className="relative overflow-hidden bg-ink px-6 pt-6 pb-5 text-white">
          <div
            className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full opacity-35 blur-2xl"
            style={{ background: "radial-gradient(circle, #dc3545 0%, transparent 70%)" }}
          />
          <div
            className="pointer-events-none absolute -left-16 -bottom-16 h-40 w-40 rounded-full opacity-20 blur-2xl"
            style={{ background: "radial-gradient(circle, #dc3545 0%, transparent 70%)" }}
          />

          <div className="relative flex items-start justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 rounded-full bg-brand/20 border border-brand/40 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-brand">
                <Sparkles className="h-3 w-3" />
                {isNewStudentContext || isAuthed ? "Welcome to the Trading Desk" : "GAMAT Fx Community Pulse"}
              </div>
              <h2
                id="discovery-survey-title"
                className="mt-2.5 font-display text-xl sm:text-2xl font-bold tracking-tight text-white"
              >
                {user?.firstName
                  ? `${user.firstName}, how did you hear about GAMAT Fx?`
                  : "How did you first hear about GAMAT Fx?"}
              </h2>
              <p className="mt-1 text-xs sm:text-sm text-white/70 max-w-md">
                {isNewStudentContext || isAuthed
                  ? "Help us personalize your academy experience and reward the community channels bringing traders in."
                  : "We’d love to know what brought you to our trading academy today — it only takes one tap."}
              </p>
            </div>

            <button
              type="button"
              onClick={handleDismiss}
              aria-label="Close survey"
              className="shrink-0 inline-flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-white/70 hover:bg-white/20 hover:text-white transition"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Body */}
        {submitted ? (
          <div className="px-6 py-12 text-center bg-cream/40">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 shadow-sm">
              <CheckCircle2 className="h-8 w-8" />
            </div>
            <h3 className="mt-4 font-display text-xl font-bold text-ink">
              Thank you for sharing!
            </h3>
            <p className="mt-1.5 text-sm text-muted max-w-sm mx-auto">
              Your feedback helps us grow the strongest institutional trading community. Let’s get to the charts.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-5 sm:p-6 bg-cream/30">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-[52vh] overflow-y-auto pr-0.5">
              {DISCOVERY_OPTIONS.map((opt) => {
                const active = selectedId === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setSelectedId(opt.id)}
                    className={`group relative flex items-center gap-3 rounded-2xl border p-3 text-left transition-all duration-150 ${
                      active
                        ? "border-brand bg-brand/[0.06] ring-2 ring-brand/25 shadow-sm"
                        : "border-line bg-white hover:border-ink/30 hover:bg-cream/60"
                    }`}
                  >
                    <div
                      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl transition-colors ${
                        active
                          ? "bg-brand text-white shadow-sm"
                          : "bg-cream text-ink group-hover:bg-brand/10"
                      }`}
                    >
                      <SourceIcon id={opt.id} active={active} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-1.5">
                        <span
                          className={`text-xs sm:text-sm font-bold truncate ${
                            active ? "text-brand" : "text-ink"
                          }`}
                        >
                          {opt.label}
                        </span>
                        <span
                          className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full border transition ${
                            active
                              ? "border-brand bg-brand text-white"
                              : "border-line bg-white group-hover:border-ink/40"
                          }`}
                        >
                          {active && (
                            <span className="h-1.5 w-1.5 rounded-full bg-white" />
                          )}
                        </span>
                      </div>
                      <p className="text-[11px] text-muted truncate mt-0.5">
                        {opt.sub}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Optional detail input when Friend Referral or Other is chosen */}
            {selectedOption && (selectedOption.promptPlaceholder || selectedId === "friend_referral" || selectedId === "other") && (
              <div className="mt-3.5 animate-in fade-in slide-in-from-top-1 duration-150">
                <input
                  type="text"
                  value={detail}
                  onChange={(e) => setDetail(e.target.value)}
                  placeholder={
                    selectedOption.promptPlaceholder ||
                    "Add any optional detail (e.g. creator name or referral code)..."
                  }
                  className="w-full rounded-xl border border-line bg-white px-3.5 py-2.5 text-xs sm:text-sm text-ink placeholder:text-muted/70 focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/15"
                />
              </div>
            )}

            {/* Footer actions */}
            <div className="mt-5 flex items-center justify-between gap-3 pt-3 border-t border-line/70">
              <button
                type="button"
                onClick={handleDismiss}
                className="text-xs font-semibold text-muted hover:text-ink transition px-2 py-1.5"
              >
                Maybe later
              </button>

              <button
                type="submit"
                disabled={!selectedId}
                className={`inline-flex items-center justify-center gap-2 rounded-full px-6 py-2.5 text-xs sm:text-sm font-bold transition-all ${
                  selectedId
                    ? "bg-brand text-white shadow-md hover:bg-brand-dark cursor-pointer"
                    : "bg-line text-muted cursor-not-allowed"
                }`}
              >
                Submit Response
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
