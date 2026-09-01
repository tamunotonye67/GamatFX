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
] as const;

function parse(): string {
  const hash = window.location.hash || "";

  // 1. Handle Supabase Auth password recovery redirect (#access_token=...&type=recovery or #reset-password)
  if (hash.includes("type=recovery") || hash.includes("reset-password")) {
    return "/reset-password";
  }

  // 2. Handle Supabase Auth email confirmation or invite redirect
  if (hash.includes("access_token=") && (hash.includes("type=signup") || hash.includes("type=invite") || hash.includes("type=email_change"))) {
    return "/dashboard";
  }

  // 3. Handle general OAuth login token redirect (#access_token=... with no subpath)
  if (hash.startsWith("#access_token=") && !hash.includes("/")) {
    return "/dashboard";
  }

  // 4. Standard hash route parsing
  if (hash) {
    const raw = hash.replace(/^#/, "").split("?")[0];
    const clean = raw.replace(/\/+$/, "");
    if (clean === "") return "/";
    return clean.startsWith("/") ? clean : `/${clean}`;
  }

  const pathname = window.location.pathname.replace(/\/+$/, "");
  return pathname === "" ? "/" : pathname;
}

/** Current path, e.g. "/courses/price-action-mastery". */
export function useRoute(): string {
  const [route, setRoute] = useState<string>(() => parse());

  useEffect(() => {
    const onChange = () => setRoute(parse());
    window.addEventListener("hashchange", onChange);
    return () => window.removeEventListener("hashchange", onChange);
  }, []);

  return route;
}

/** Navigate to a path and jump to the top of the page. */
export function navigate(route: Route) {
  if (parse() === route) {
    window.scrollTo({ top: 0, behavior: "smooth" });
  } else {
    window.location.hash = `#${route}`;
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
    window.location.hash = "#/";
    window.setTimeout(scroll, 80);
  } else {
    scroll();
  }
}
