import { useState } from "react";
import { Download, Share, Smartphone, X } from "lucide-react";
import { usePwaInstall } from "../lib/pwa";

const DISMISS_KEY = "gamat_pwa_banner_dismissed_v1";

/** Subtle, dashboard-only install prompt for mobile/desktop PWA installation. */
export default function PwaInstallBanner() {
  const { canInstall, isIos, isStandalone, promptInstall } = usePwaInstall();
  const [dismissed, setDismissed] = useState<boolean>(() => {
    try {
      return localStorage.getItem(DISMISS_KEY) === "1";
    } catch {
      return false;
    }
  });
  const [showIosSteps, setShowIosSteps] = useState(false);

  if (isStandalone || dismissed) return null;
  if (!canInstall && !isIos) return null;

  const dismiss = () => {
    setDismissed(true);
    try {
      localStorage.setItem(DISMISS_KEY, "1");
    } catch {}
  };

  const handleInstall = async () => {
    if (canInstall) {
      const outcome = await promptInstall();
      if (outcome === "accepted") dismiss();
    } else if (isIos) {
      setShowIosSteps((v) => !v);
    }
  };

  return (
    <div className="mb-5 rounded-2xl border border-line bg-white p-3.5 sm:p-4 shadow-xs">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-brand/10 text-brand">
            <Smartphone className="h-4.5 w-4.5" />
          </span>
          <div className="min-w-0">
            <p className="font-display text-xs sm:text-sm font-bold text-ink truncate">
              Install GAMAT Fx on your phone
            </p>
            <p className="text-[11px] sm:text-xs text-muted truncate">
              Quick home-screen access to your courses, trade journal &amp; live sessions.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <button
            type="button"
            onClick={handleInstall}
            className="inline-flex items-center gap-1.5 rounded-xl bg-brand px-3 py-1.5 text-xs font-semibold text-white shadow-2xs transition hover:bg-brand-dark cursor-pointer"
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
            onClick={dismiss}
            aria-label="Dismiss install prompt"
            className="flex h-7 w-7 items-center justify-center rounded-lg text-muted transition hover:bg-cream hover:text-ink cursor-pointer"
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
