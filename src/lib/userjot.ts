export type UserJotUser = {
  id: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  avatar?: string;
};

type UserJotSDK = {
  init: (
    projectId: string,
    options?: {
      widget?: boolean;
      trigger?: "default" | "custom";
      position?: "bottom-right" | "bottom-left";
      theme?: "auto" | "light" | "dark";
      locale?: string;
    }
  ) => void;
  identify: (user: UserJotUser) => void;
  open?: (opts?: { to?: "feedback" | "roadmap" | "updates" | "messages"; compose?: boolean }) => void;
  setWidgetEnabled?: (enabled: boolean) => void;
  redirect?: (opts?: { to?: "feedback" | "roadmap" | "updates"; openFeedback?: boolean; newTab?: boolean }) => void;
};

declare global {
  interface Window {
    uj?: UserJotSDK;
    $ujq?: Array<[string, ...unknown[]]>;
  }
}

const USERJOT_PROJECT_STORAGE_KEY = "gamat.userjot_project_id.v1";
const USERJOT_SDK_URL = "https://cdn.userjot.com/sdk/v3/uj.js";

export function getConfiguredUserJotId(): string {
  const metaEnv = (import.meta as unknown as { env?: Record<string, string> }).env || {};
  const fromEnv = (metaEnv.VITE_USERJOT_PROJECT_ID || "").trim();
  if (fromEnv) return fromEnv;
  if (typeof window !== "undefined") {
    try {
      return (window.localStorage.getItem(USERJOT_PROJECT_STORAGE_KEY) || "").trim();
    } catch {}
  }
  return "";
}

let sdkLoaded = false;

export function initUserJot(projectId: string) {
  if (typeof window === "undefined" || !projectId) return;

  if (!window.uj) {
    window.$ujq = window.$ujq || [];
    window.uj = new Proxy({} as UserJotSDK, {
      get: (_target, prop: string) => {
        return (...args: unknown[]) => {
          window.$ujq?.push([prop, ...args]);
        };
      },
    });
  }

  if (!sdkLoaded && !document.querySelector(`script[src="${USERJOT_SDK_URL}"]`)) {
    sdkLoaded = true;
    const script = document.createElement("script");
    script.src = USERJOT_SDK_URL;
    script.type = "module";
    script.async = true;
    document.head.appendChild(script);
  }

  window.uj.init(projectId, {
    widget: true,
    position: "bottom-right",
    theme: "auto",
  });
}

export function identifyUserJotUser(user: UserJotUser | null | undefined) {
  if (typeof window === "undefined" || !window.uj || !user?.id) return;
  window.uj.identify({
    id: user.id,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    avatar: user.avatar,
  });
}
