import { createClient } from "@supabase/supabase-js";

const metaEnv = (import.meta as unknown as { env: Record<string, string> }).env || {};
export const supabaseUrl = metaEnv.VITE_SUPABASE_URL || "https://pbbtiazbpolvajjsqirs.supabase.co";
export const supabaseKey = metaEnv.VITE_SUPABASE_ANON_KEY || "sb_publishable_FnEN-7WZtC0_qvoNApQNSw__c9KqANV";

const COOKIE_CHUNK_SIZE = 3400;
const COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 365; // 1 year

function getSharedCookieDomain(): string | null {
  if (typeof window === "undefined") return null;
  const host = window.location.hostname.toLowerCase();
  if (host === "gamatfxacademy.com" || host.endsWith(".gamatfxacademy.com")) {
    return ".gamatfxacademy.com";
  }
  return null;
}

function readCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const prefix = `${encodeURIComponent(name)}=`;
  const parts = document.cookie ? document.cookie.split("; ") : [];
  for (const part of parts) {
    if (part.startsWith(prefix)) {
      return decodeURIComponent(part.slice(prefix.length));
    }
  }
  return null;
}

function writeCookie(name: string, value: string, domain: string, maxAge: number) {
  if (typeof document === "undefined") return;
  const secure =
    typeof window !== "undefined" && window.location.protocol === "https:"
      ? "; Secure"
      : "";
  document.cookie = `${encodeURIComponent(name)}=${encodeURIComponent(
    value
  )}; Domain=${domain}; Path=/; Max-Age=${maxAge}; SameSite=Lax${secure}`;
}

function clearChunkedCookie(key: string, domain: string) {
  const countRaw = readCookie(`${key}.chunks`);
  const count = countRaw ? parseInt(countRaw, 10) : 0;
  writeCookie(key, "", domain, 0);
  writeCookie(`${key}.chunks`, "", domain, 0);
  const maxClear = Number.isFinite(count) && count > 0 ? Math.min(count, 20) : 8;
  for (let i = 0; i < maxClear; i++) {
    writeCookie(`${key}.${i}`, "", domain, 0);
  }
}

function writeChunkedCookie(key: string, value: string, domain: string) {
  clearChunkedCookie(key, domain);
  // Split after URI-encoding so each cookie stays safely under 4KB
  const encoded = encodeURIComponent(value);
  const chunks: string[] = [];
  for (let i = 0; i < encoded.length; i += COOKIE_CHUNK_SIZE) {
    chunks.push(encoded.slice(i, i + COOKIE_CHUNK_SIZE));
  }
  writeCookie(`${key}.chunks`, String(chunks.length), domain, COOKIE_MAX_AGE_SECONDS);
  chunks.forEach((chunk, idx) => {
    if (typeof document === "undefined") return;
    const secure =
      typeof window !== "undefined" && window.location.protocol === "https:"
        ? "; Secure"
        : "";
    document.cookie = `${encodeURIComponent(`${key}.${idx}`)}=${chunk}; Domain=${domain}; Path=/; Max-Age=${COOKIE_MAX_AGE_SECONDS}; SameSite=Lax${secure}`;
  });
}

function readChunkedCookie(key: string): string | null {
  const countRaw = readCookie(`${key}.chunks`);
  if (countRaw) {
    const count = parseInt(countRaw, 10);
    if (Number.isFinite(count) && count > 0) {
      let encoded = "";
      for (let i = 0; i < count; i++) {
        const prefix = `${encodeURIComponent(`${key}.${i}`)}=`;
        const parts = document.cookie ? document.cookie.split("; ") : [];
        const match = parts.find((p) => p.startsWith(prefix));
        if (!match) return null;
        encoded += match.slice(prefix.length);
      }
      try {
        return decodeURIComponent(encoded);
      } catch {
        return null;
      }
    }
  }
  return readCookie(key);
}

/**
 * Cross-subdomain Supabase auth storage:
 * - On *.gamatfxacademy.com, persists session in chunked .gamatfxacademy.com cookies
 *   so users signed in on the main site are automatically signed in on jobs.gamatfxacademy.com
 *   with zero extra Supabase API calls / egress.
 * - Falls back to localStorage on localhost/preview domains.
 */
const crossSubdomainAuthStorage = {
  getItem(key: string): string | null {
    const domain = getSharedCookieDomain();
    if (domain) {
      const fromCookie = readChunkedCookie(key);
      if (fromCookie !== null) return fromCookie;
      // Seamless one-time migration from existing localStorage session
      try {
        const legacy = window.localStorage.getItem(key);
        if (legacy) {
          writeChunkedCookie(key, legacy, domain);
          return legacy;
        }
      } catch {}
      return null;
    }
    try {
      return window.localStorage.getItem(key);
    } catch {
      return null;
    }
  },
  setItem(key: string, value: string): void {
    try {
      window.localStorage.setItem(key, value);
    } catch {}
    const domain = getSharedCookieDomain();
    if (domain) {
      writeChunkedCookie(key, value, domain);
    }
  },
  removeItem(key: string): void {
    try {
      window.localStorage.removeItem(key);
    } catch {}
    const domain = getSharedCookieDomain();
    if (domain) {
      clearChunkedCookie(key, domain);
    }
  },
};

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    storage: crossSubdomainAuthStorage,
    detectSessionInUrl: true,
    persistSession: true,
    autoRefreshToken: true,
  },
});
