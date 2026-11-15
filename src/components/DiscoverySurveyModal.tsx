import { useEffect, useState } from "react";
import { CheckCircle2, Sparkles, X } from "lucide-react";
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
  const cls = `h-4 w-4 shrink-0 transition-colors duration-150 ${
    active ? "text-white" : "text-ink"
  }`;

  switch (id) {
    case "instagram":
      return (
        <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className={cls}>
          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zm0 10.162a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z" />
        </svg>
      );
    case "youtube":
      return (
        <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className={cls}>
          <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
        </svg>
      );
    case "tiktok":
      return (
        <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className={cls}>
          <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
        </svg>
      );
    case "twitter":
      return (
        <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className={cls}>
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
      );
    case "whatsapp_telegram":
      return (
        <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className={cls}>
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z" />
        </svg>
      );
    case "google_search":
      return (
        <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className={cls}>
          <path d="M21.35 11.1h-9.17v2.73h6.51c-.33 3.81-3.5 5.44-6.5 5.44C8.36 19.27 5 16.25 5 12c0-4.1 3.2-7.27 7.2-7.27 3.09 0 4.9 1.97 4.9 1.97L19 4.72S16.56 2 12.1 2C6.42 2 2.03 6.8 2.03 12c0 5.05 4.13 10 10.22 10 5.35 0 9.25-3.67 9.25-9.09 0-1.15-.15-1.81-.15-1.81Z" />
        </svg>
      );
    case "facebook_linkedin":
      return (
        <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className={cls}>
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
        </svg>
      );
    case "friend_referral":
      return (
        <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className={cls}>
          <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z" />
        </svg>
      );
    case "live_event":
      return (
        <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className={cls}>
          <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm5.91-3c-.49 0-.9.36-.98.85C16.52 14.2 14.47 16 12 16s-4.52-1.8-4.93-4.15a.998.998 0 0 0-.98-.85c-.61 0-1.09.54-1 1.14.49 3 2.89 5.35 5.91 5.78V20H8c-.55 0-1 .45-1 1s.45 1 1 1h8c.55 0 1-.45 1-1s-.45-1-1-1h-3v-2.08c3.02-.43 5.42-2.78 5.91-5.78.1-.6-.39-1.14-1-1.14z" />
        </svg>
      );
    case "other":
    default:
      return (
        <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className={cls}>
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm2.19 12.19L6 18l3.81-8.19L18 6l-3.81 8.19zM12 10.9c-.61 0-1.1.49-1.1 1.1s.49 1.1 1.1 1.1 1.1-.49 1.1-1.1-.49-1.1-1.1-1.1z" />
        </svg>
      );
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

  // Lock background page scroll while modal is open so scrolling never shakes or chains to body
  useEffect(() => {
    if (!open) return;
    const prevHtmlOverflow = document.documentElement.style.overflow;
    const prevBodyOverflow = document.body.style.overflow;
    const prevOverscroll = document.body.style.overscrollBehavior;
    document.documentElement.style.overflow = "hidden";
    document.body.style.overflow = "hidden";
    document.body.style.overscrollBehavior = "contain";
    return () => {
      document.documentElement.style.overflow = prevHtmlOverflow;
      document.body.style.overflow = prevBodyOverflow;
      document.body.style.overscrollBehavior = prevOverscroll;
    };
  }, [open]);

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
      className="fixed inset-0 z-[110] flex items-center justify-center bg-ink/80 p-3 sm:p-5 overscroll-contain touch-none"
      role="dialog"
      aria-modal="true"
      aria-labelledby="discovery-survey-title"
    >
      <div
        className="relative flex flex-col w-full max-w-xl max-h-[85vh] sm:max-h-[88vh] overflow-hidden rounded-3xl bg-white shadow-2xl border border-line/80 transform-gpu touch-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top luxury brand header */}
        <div
          className="relative shrink-0 overflow-hidden bg-ink px-5 sm:px-6 pt-5 pb-4 text-white"
          style={{
            backgroundImage:
              "radial-gradient(circle at 92% 12%, rgba(220, 53, 69, 0.24) 0%, transparent 55%)",
          }}
        >
          <div className="relative flex items-start justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 rounded-full bg-white/10 border border-white/15 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-white/90">
                <Sparkles className="h-3 w-3 text-brand" />
                {isNewStudentContext || isAuthed ? "Welcome to the Trading Desk" : "GAMAT Fx Community Pulse"}
              </div>
              <h2
                id="discovery-survey-title"
                className="mt-2 font-display text-lg sm:text-2xl font-bold tracking-tight text-white"
              >
                {user?.firstName
                  ? `${user.firstName}, how did you hear about GAMAT Fx?`
                  : "How did you first hear about GAMAT Fx?"}
              </h2>
              <p className="mt-1 text-xs sm:text-sm text-white/70 max-w-md">
                {isNewStudentContext || isAuthed
                  ? "Help us personalize your academy experience and credit the channel that brought you in."
                  : "We’d love to know what brought you to our trading academy today — it only takes one tap."}
              </p>
            </div>

            <button
              type="button"
              onClick={handleDismiss}
              aria-label="Close survey"
              className="shrink-0 inline-flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-white/70 hover:bg-white/20 hover:text-white transition-colors"
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
          <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0 bg-cream/30">
            <div className="flex-1 overflow-y-auto overscroll-contain touch-pan-y p-4 sm:p-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {DISCOVERY_OPTIONS.map((opt) => {
                  const active = selectedId === opt.id;
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => setSelectedId(opt.id)}
                      className={`group relative flex items-center gap-3 rounded-2xl border p-3 text-left transition-colors duration-150 ${
                        active
                          ? "border-ink bg-ink/[0.04] shadow-sm"
                          : "border-line bg-white hover:border-ink/30"
                      }`}
                    >
                      <div
                        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl transition-colors duration-150 ${
                          active
                            ? "bg-ink text-white"
                            : "bg-ink/[0.06] text-ink group-hover:bg-ink/10"
                        }`}
                      >
                        <SourceIcon id={opt.id} active={active} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-1.5">
                          <span
                            className={`text-xs sm:text-sm font-bold truncate ${
                              active ? "text-ink" : "text-ink/90"
                            }`}
                          >
                            {opt.label}
                          </span>
                          <span
                            className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full border transition-colors ${
                              active
                                ? "border-brand bg-brand text-white"
                                : "border-line bg-white"
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
                <div className="mt-3.5">
                  <input
                    type="text"
                    value={detail}
                    onChange={(e) => setDetail(e.target.value)}
                    placeholder={
                      selectedOption.promptPlaceholder ||
                      "Add any optional detail (e.g. creator name or referral code)..."
                    }
                    className="w-full rounded-xl border border-line bg-white px-3.5 py-2.5 text-xs sm:text-sm text-ink placeholder:text-muted/70 focus:border-ink focus:outline-none"
                  />
                </div>
              )}
            </div>

            {/* Footer actions (pinned outside scroll container so it never shifts) */}
            <div className="shrink-0 flex items-center justify-between gap-3 px-4 sm:px-6 py-3.5 border-t border-line/80 bg-white">
              <button
                type="button"
                onClick={handleDismiss}
                className="text-xs font-semibold text-muted hover:text-ink transition-colors px-2 py-1.5"
              >
                Maybe later
              </button>

              <button
                type="submit"
                disabled={!selectedId}
                className={`inline-flex items-center justify-center gap-2 rounded-full px-6 py-2.5 text-xs sm:text-sm font-bold transition-colors ${
                  selectedId
                    ? "bg-brand text-white shadow-sm hover:bg-brand-dark cursor-pointer"
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
