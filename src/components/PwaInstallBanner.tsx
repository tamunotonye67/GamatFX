import { useState } from "react";
import { Bell, Download, Share, Smartphone, X } from "lucide-react";
import { usePwaInstall } from "../lib/pwa";
import { isPushSupported, subscribeToPush } from "../lib/push";

const DISMISS_INSTALL_KEY = "gamat_pwa_banner_dismissed_v1";
const DISMISS_PUSH_KEY = "gamat_push_banner_dismissed_v1";
const INSTALL_REPROMPT_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

function isInstallSnoozed(): boolean {
  try {
    const raw = localStorage.getItem(DISMISS_INSTALL_KEY);
    if (!raw || raw === "1") return false;
    const ts = Number(raw);
    return Number.isFinite(ts) && Date.now() - ts < INSTALL_REPROMPT_MS;
  } catch {
    return false;
  }
}

/** Subtle, dashboard-only banner for PWA installation and phone push opt-in. */
export default function PwaInstallBanner({ userId }: { userId?: string }) {
  const { canInstall, isIos, isStandalone, promptInstall } = usePwaInstall();
  const [installDismissed, setInstallDismissed] = useState<boolean>(() => isInstallSnoozed());
  const [pushDismissed, setPushDismissed] = useState<boolean>(() => {
    try {
      return localStorage.getItem(DISMISS_PUSH_KEY) === "1";
    } catch {
      return false;
    }
  });
  const [showIosSteps, setShowIosSteps] = useState(false);
  const [enablingPush, setEnablingPush] = useState(false);
  const [pushEnabled, setPushEnabled] = useState(false);

  const showInstall = !isStandalone && !installDismissed && (canInstall || isIos);
  const canPromptPush =
    Boolean(userId) &&
    !pushDismissed &&
    !pushEnabled &&
    isPushSupported() &&
    typeof Notification !== "undefined" &&
    Notification.permission === "default";

  // Show install card first if available; otherwise show one-tap push opt-in
  if (!showInstall && !canPromptPush) return null;

  const dismissInstall = () => {
    setInstallDismissed(true);
    try {
      localStorage.setItem(DISMISS_INSTALL_KEY, String(Date.now()));
    } catch {}
  };

  const dismissPush = () => {
    setPushDismissed(true);
    try {
      localStorage.setItem(DISMISS_PUSH_KEY, "1");
    } catch {}
  };

  const handleInstall = async () => {
    if (canInstall) {
      const outcome = await promptInstall();
      if (outcome === "accepted") dismissInstall();
    } else if (isIos) {
      setShowIosSteps((v) => !v);
    }
  };

  const handleEnablePush = async () => {
    if (!userId || enablingPush) return;
    setEnablingPush(true);
    const res = await subscribeToPush(userId);
    setEnablingPush(false);
    if (res.ok) {
      setPushEnabled(true);
    } else if (Notification.permission === "denied") {
      dismissPush();
    }
  };

  if (showInstall) {
    return (
      <div className="mb-5 rounded-2xl border border-line bg-white p-3.5 sm:p-4 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-start sm:items-center gap-3 min-w-0">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-brand/10 text-brand">
              <Smartphone className="h-4.5 w-4.5" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="font-display text-xs sm:text-sm font-bold text-ink">
                Install GAMAT Fx on your phone
              </p>
              <p className="text-[11px] sm:text-xs text-muted">
                Quick home-screen access to your courses, trade journal &amp; live sessions.
              </p>
            </div>
            <button
              type="button"
              onClick={dismissInstall}
              aria-label="Dismiss install prompt"
              className="flex sm:hidden h-8 w-8 shrink-0 items-center justify-center rounded-lg text-muted transition hover:bg-cream hover:text-ink cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <button
              type="button"
              onClick={handleInstall}
              className="inline-flex w-full sm:w-auto min-h-[38px] items-center justify-center gap-1.5 rounded-xl bg-brand px-3.5 py-2 text-xs font-semibold text-white shadow-2xs transition hover:bg-brand-dark cursor-pointer"
            >
              {canInstall ? (
                <>
                  <Download className="h-3.5 w-3.5" /> Install App
                </>
              ) : (
                <>
                  <Share className="h-3.5 w-3.5" /> Add to Home
                </>
              )}
            </button>
            <button
              type="button"
              onClick={dismissInstall}
              aria-label="Dismiss install prompt"
              className="hidden sm:flex h-8 w-8 items-center justify-center rounded-lg text-muted transition hover:bg-cream hover:text-ink cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {isIos && showIosSteps && !canInstall && (
          <div className="mt-3 rounded-xl bg-cream px-3 py-2 text-[11px] sm:text-xs text-ink/80">
            In Safari, tap the <span className="font-semibold">Share</span> button at the bottom of your screen, then choose{" "}
            <span className="font-semibold">Add to Home Screen</span>.
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="mb-5 rounded-2xl border border-line bg-white p-3.5 sm:p-4 shadow-xs">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-start sm:items-center gap-3 min-w-0">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-brand/10 text-brand">
            <Bell className="h-4.5 w-4.5" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="font-display text-xs sm:text-sm font-bold text-ink">
              Turn on phone notifications
            </p>
            <p className="text-[11px] sm:text-xs text-muted">
              Get instant alerts for live sessions, academy broadcasts &amp; updates.
            </p>
          </div>
          <button
            type="button"
            onClick={dismissPush}
            aria-label="Dismiss notification prompt"
            className="flex sm:hidden h-8 w-8 shrink-0 items-center justify-center rounded-lg text-muted transition hover:bg-cream hover:text-ink cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <button
            type="button"
            disabled={enablingPush}
            onClick={handleEnablePush}
            className="inline-flex w-full sm:w-auto min-h-[38px] items-center justify-center gap-1.5 rounded-xl bg-brand px-3.5 py-2 text-xs font-semibold text-white shadow-2xs transition hover:bg-brand-dark disabled:opacity-60 cursor-pointer"
          >
            <Bell className="h-3.5 w-3.5" /> {enablingPush ? "Enabling..." : "Enable"}
          </button>
          <button
            type="button"
            onClick={dismissPush}
            aria-label="Dismiss notification prompt"
            className="hidden sm:flex h-8 w-8 items-center justify-center rounded-lg text-muted transition hover:bg-cream hover:text-ink cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
