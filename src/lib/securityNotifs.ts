export type SecurityActivity = {
  id: string;
  title: string;
  body: string;
  to: string;
  time: string;
};

export function getDeviceSummary(): string {
  if (typeof navigator === "undefined") return "Web browser";
  const ua = navigator.userAgent || "";
  const browser = /Edg/i.test(ua)
    ? "Edge"
    : /Chrome/i.test(ua) && !/Chromium/i.test(ua)
    ? "Chrome"
    : /Safari/i.test(ua) && !/Chrome/i.test(ua)
    ? "Safari"
    : /Firefox/i.test(ua)
    ? "Firefox"
    : "Web browser";
  const os = /iPhone|iPad/i.test(ua)
    ? "iOS"
    : /Android/i.test(ua)
    ? "Android"
    : /Mac OS/i.test(ua)
    ? "macOS"
    : /Windows/i.test(ua)
    ? "Windows"
    : /Linux/i.test(ua)
    ? "Linux"
    : "Device";
  return `${browser} on ${os}`;
}

export function getSecurityActivities(userId?: string): SecurityActivity[] {
  if (!userId || typeof localStorage === "undefined") return [];
  try {
    const raw = localStorage.getItem(`gamat.security_notifs.${userId}`);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function recordSecurityActivity(
  userId: string,
  item: Omit<SecurityActivity, "id" | "time"> & { id?: string }
): void {
  if (!userId || typeof localStorage === "undefined") return;
  try {
    const existing = getSecurityActivities(userId);
    const entry: SecurityActivity = {
      id: item.id || `sec_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      title: item.title,
      body: item.body,
      to: item.to,
      time: new Date().toISOString(),
    };
    const next = [entry, ...existing].slice(0, 12);
    localStorage.setItem(`gamat.security_notifs.${userId}`, JSON.stringify(next));
  } catch {}
}
