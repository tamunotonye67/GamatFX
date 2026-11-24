import { useEffect, useState } from "react";

/** Routes are plain paths; dynamic segments are supported (e.g. /courses/price-action). */
export type Route = string;

export const STATIC_ROUTES = [
  "/",
  "/about",
  "/community",
  "/courses",
  "/services",
  "/reviews",
  "/events",
  "/how-it-works",
  "/faq",
  "/terms",
  "/privacy",
  "/contact",
  "/login",
  "/signup",
  "/dashboard",
  "/checkout",
  "/mentorship-survey",
  "/whiteboard",
  "/store",
  "/jobs",
] as const;

export function isJobsSubdomain(): boolean {
  if (typeof window === "undefined") return false;
  const host = window.location.hostname.toLowerCase();
  return host === "jobs" || host.startsWith("jobs.");
}

const ROUTE_SESSION_KEY = "gamat_fx_active_route";
const ROUTE_LOCAL_KEY = "gamat_fx_last_route";

function getSavedRoute(): string | null {
  try {
    return sessionStorage.getItem(ROUTE_SESSION_KEY) || localStorage.getItem(ROUTE_LOCAL_KEY);
  } catch {
    return null;
  }
}

function persistRoute(fullRoute: string) {
  try {
    const normalized = fullRoute.startsWith("/") ? fullRoute : `/${fullRoute}`;
    sessionStorage.setItem(ROUTE_SESSION_KEY, normalized);
    localStorage.setItem(ROUTE_LOCAL_KEY, normalized);
  } catch {}
}

function cleanRoutePath(raw: string): string {
  const withoutQuery = raw.split("?")[0];
  const clean = withoutQuery.replace(/\/+$/, "");
  if (clean === "" || clean === "/index.html") return "/";
  return clean.startsWith("/") ? clean : `/${clean}`;
}

function parse(): string {
  const hash = window.location.hash || "";

  const search = window.location.search || "";
  const rawPath = window.location.pathname || "/";

  // 1. Handle Supabase Auth password recovery redirect (#access_token=...&type=recovery, #reset-password, or /reset-password)
  if (hash.includes("type=recovery") || hash.includes("reset-password") || rawPath.includes("reset-password")) {
    persistRoute("/reset-password");
    return "/reset-password";
  }

  // 2. Handle Supabase Auth email confirmation or invite redirect
  if (hash.includes("access_token=") && (hash.includes("type=signup") || hash.includes("type=invite") || hash.includes("type=email_change"))) {
    persistRoute("/dashboard");
    return "/dashboard";
  }

  // 3. Handle general OAuth login token redirect (#access_token=... with no subpath)
  if (hash.startsWith("#access_token=") && !hash.startsWith("#/")) {
    persistRoute("/dashboard");
    return "/dashboard";
  }

  // 3b. Handle OAuth PKCE callback (?code=... in search params)
  if (search.includes("code=")) {
    if (rawPath.includes("reset-password") || hash.includes("reset-password")) {
      persistRoute("/reset-password");
      return "/reset-password";
    }
    persistRoute("/dashboard");
    return "/dashboard";
  }

  // 3c. Handle OAuth error callback (?error=... or #error=...)
  if (search.includes("error=") || hash.startsWith("#error=")) {
    persistRoute("/dashboard");
    return "/dashboard";
  }

  // 4. Explicit hash route present in URL (e.g. "#/courses", "#/admin", "#/")
  const rawHash = hash.replace(/^#/, "");
  if (rawHash !== "") {
    const fullRoute = rawHash.startsWith("/") ? rawHash : `/${rawHash}`;
    persistRoute(fullRoute);
    return cleanRoutePath(fullRoute);
  }

  // 4b. Dedicated /join referral route handling
  const cleanPath = cleanRoutePath(rawPath);
  if (cleanPath === "/join") {
    const ref = new URLSearchParams(search).get("ref") || "";
    const fullRoute = ref ? `/signup?ref=${encodeURIComponent(ref)}` : "/signup";
    persistRoute(fullRoute);
    try {
      window.history.replaceState(null, "", `#${fullRoute}`);
    } catch {}
    return "/signup";
  }

  // 5. Direct pathname navigation (e.g. "/courses" or "/admin")
  if (cleanPath !== "/") {
    const fullRoute = `${cleanPath}${search}`;
    persistRoute(fullRoute);
    try {
      if (!hash.includes("access_token") && !hash.includes("type=recovery") && !hash.includes("type=signup")) {
        window.history.replaceState(null, "", `#${fullRoute}`);
      }
    } catch {}
    return cleanPath;
  }

  // 6. Empty hash ("") on root "/" — happens on iframe/preview reload or when hash is stripped on refresh.
  // Restore the user's last active route so refreshing a page never dumps them back onto the homepage.
  const saved = getSavedRoute();
  if (saved && saved !== "/") {
    const restoredFull = saved.startsWith("/") ? saved : `/${saved}`;
    try {
      window.history.replaceState(null, "", `#${restoredFull}`);
    } catch {}
    return cleanRoutePath(restoredFull);
  }

  // 7. Default to homepage and ensure "#/" is in the URL so Back-button navigation to Home is explicit
  persistRoute("/");
  try {
    if (window.location.hash !== "#/") {
      window.history.replaceState(null, "", "#/");
    }
  } catch {}
  return "/";
}

const ROUTE_META: Record<string, { title: string; description: string }> = {
  "/": {
    title: "GAMAT Fx Academy | Premier Forex Trading Education & Mentorship",
    description: "GAMAT Fx Academy — premier forex trading education, mentorship, and a results-driven community.",
  },
  "/courses": {
    title: "Trading Courses | GAMAT Fx Academy",
    description: "Master institutional order flow, price action, risk management, and trading psychology with structured courses.",
  },
  "/services": {
    title: "1-on-1 Mentorship & Services | GAMAT Fx Academy",
    description: "Book 1-on-1 mentorship, portfolio reviews, and specialized trader coaching at GAMAT Fx Academy.",
  },
  "/events": {
    title: "Live Events & Bootcamps | GAMAT Fx Academy",
    description: "Register for upcoming trading bootcamps, live workshops, and community meetups.",
  },
  "/forum": {
    title: "Student Forum | GAMAT Fx Academy",
    description: "Discuss charts, share wins and lessons, and connect with mentors and fellow traders.",
  },
  "/outlook": {
    title: "Market Outlooks | GAMAT Fx Academy",
    description: "Weekly institutional market breakdowns, key liquidity levels, and pair outlooks.",
  },
  "/news": {
    title: "Academy News | GAMAT Fx Academy",
    description: "Latest announcements, updates, and articles from GAMAT Fx Academy.",
  },
  "/giveaways": {
    title: "Community Giveaways | GAMAT Fx Academy",
    description: "Funded account challenges, store gear, and scholarship giveaways for GAMAT Fx Academy students.",
  },
  "/verify-certificate": {
    title: "Verify Certificate | GAMAT Fx Academy",
    description: "Verify the authenticity of an official GAMAT Fx Academy course completion certificate.",
  },
  "/store": {
    title: "Academy Store | GAMAT Fx Academy",
    description: "Official GAMAT Fx Academy merchandise, trading journals, and trader gear.",
  },
  "/dashboard": {
    title: "Student Dashboard | GAMAT Fx Academy",
    description: "Track your courses, trade journal, certificates, 1-on-1 bookings, and affiliate earnings.",
  },
  "/admin": {
    title: "Admin Panel | GAMAT Fx Academy",
    description: "GAMAT Fx Academy administration and operations portal.",
  },
};

function setMetaTag(selector: string, content: string) {
  try {
    const el = document.querySelector(selector);
    if (el) el.setAttribute("content", content);
  } catch {}
}

export function syncRouteMeta(route: string) {
  if (typeof document === "undefined") return;
  const base = "/" + (route.split("/").filter(Boolean)[0] || "");
  const meta = ROUTE_META[route] || ROUTE_META[base] || ROUTE_META["/"];
  document.title = meta.title;
  setMetaTag('meta[name="description"]', meta.description);
  setMetaTag('meta[property="og:title"]', meta.title);
  setMetaTag('meta[property="og:description"]', meta.description);
  setMetaTag('meta[name="twitter:title"]', meta.title);
  setMetaTag('meta[name="twitter:description"]', meta.description);
  setMetaTag('meta[property="og:url"]', `https://gamatfxacademy.com/#${route}`);
}

/** Current path, e.g. "/courses/price-action-mastery". */
export function useRoute(): string {
  const [route, setRoute] = useState<string>(() => parse());

  useEffect(() => {
    syncRouteMeta(route);
  }, [route]);

  useEffect(() => {
    const onChange = () => setRoute(parse());
    window.addEventListener("hashchange", onChange);
    window.addEventListener("popstate", onChange);
    return () => {
      window.removeEventListener("hashchange", onChange);
      window.removeEventListener("popstate", onChange);
    };
  }, []);

  return route;
}

/** Navigate to a path and jump to the top of the page. */
export function navigate(route: Route) {
  const normalizedFull = route.startsWith("/") ? route : `/${route}`;
  const targetPath = cleanRoutePath(normalizedFull);
  persistRoute(normalizedFull);

  if (parse() === targetPath && window.location.hash === `#${normalizedFull}`) {
    window.scrollTo({ top: 0, behavior: "smooth" });
  } else {
    window.location.hash = `#${normalizedFull}`;
    window.scrollTo({ top: 0 });
  }
}

/** Split a path into its segments: "/courses/abc" -> ["courses", "abc"]. */
export function segments(path: string): string[] {
  return path.split("/").filter(Boolean);
}

/** Scroll to a section on the home page, routing home first if needed. */
export function goToSection(id: string) {
  const scroll = () => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };
  if (parse() !== "/") {
    persistRoute("/");
    window.location.hash = "#/";
    window.setTimeout(scroll, 80);
  } else {
    scroll();
  }
}
