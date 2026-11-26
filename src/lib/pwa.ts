import { useEffect, useState } from "react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
}

let deferredPrompt: BeforeInstallPromptEvent | null = null;
const listeners = new Set<() => void>();
let initialized = false;

function notify() {
  listeners.forEach((fn) => fn());
}

/** Captures beforeinstallprompt globally and registers the service worker once. */
export function initPwa() {
  if (initialized || typeof window === "undefined") return;
  initialized = true;

  window.addEventListener("beforeinstallprompt", (e) => {
    e.preventDefault();
    deferredPrompt = e as BeforeInstallPromptEvent;
    notify();
  });

  window.addEventListener("appinstalled", () => {
    deferredPrompt = null;
    notify();
  });

  const isProd = (import.meta as ImportMeta & { env?: { PROD?: boolean } }).env?.PROD;
  if ("serviceWorker" in navigator && isProd) {
    window.addEventListener("load", () => {
      navigator.serviceWorker.register("/sw.js").catch(() => undefined);
    });
  }
}

function checkStandalone(): boolean {
  if (typeof window === "undefined") return false;
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    (window.navigator as Navigator & { standalone?: boolean }).standalone === true
  );
}

function checkIos(): boolean {
  if (typeof navigator === "undefined") return false;
  return (
    /iPad|iPhone|iPod/.test(navigator.userAgent) &&
    !(window as Window & { MSStream?: unknown }).MSStream
  );
}

export function usePwaInstall() {
  const [canInstall, setCanInstall] = useState<boolean>(() => Boolean(deferredPrompt));
  const [isStandalone, setIsStandalone] = useState<boolean>(() => checkStandalone());
  const [isIos] = useState<boolean>(() => checkIos());

  useEffect(() => {
    initPwa();
    const sync = () => {
      setCanInstall(Boolean(deferredPrompt));
      setIsStandalone(checkStandalone());
    };
    listeners.add(sync);
    sync();

    const mq = window.matchMedia("(display-mode: standalone)");
    mq.addEventListener?.("change", sync);
    return () => {
      listeners.delete(sync);
      mq.removeEventListener?.("change", sync);
    };
  }, []);

  const promptInstall = async (): Promise<"accepted" | "dismissed" | "unavailable"> => {
    if (!deferredPrompt) return "unavailable";
    try {
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === "accepted") {
        deferredPrompt = null;
        notify();
      }
      return outcome;
    } catch {
      return "dismissed";
    }
  };

  return { canInstall, isIos, isStandalone, promptInstall };
}
