import { useEffect, useMemo, useRef, useState } from "react";
import { Bell, CalendarDays, Award, MessageSquare, CheckCheck } from "lucide-react";
import { useStore } from "../lib/store";
import { navigate } from "../lib/router";

type NotifItem = {
  id: string;
  title: string;
  body: string;
  to: string;
  kind: "event" | "cert" | "forum";
};

export default function NotificationBell({ scrolled }: { scrolled: boolean }) {
  const { user, myRegistrations = [], events = [], attempts = [], forum } = useStore();
  const threads = forum?.threads ?? [];
  const replies = forum?.replies ?? [];
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement | null>(null);

  const readKey = user ? `gamat.notif_read.${user.id}` : "";
  const [readIds, setReadIds] = useState<string[]>(() => {
    if (!readKey) return [];
    try {
      const raw = localStorage.getItem(readKey);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  const items = useMemo<NotifItem[]>(() => {
    if (!user) return [];
    const list: NotifItem[] = [];

    myRegistrations
      .filter((r) => r.status === "confirmed")
      .slice(0, 3)
      .forEach((r) => {
        const ev = events.find((e) => e.id === r.eventId);
        if (ev) {
          list.push({
            id: `ev_${r.id}`,
            title: `Ticket Confirmed: ${ev.title}`,
            body: `${ev.date} · Ticket ${r.ticketCode}`,
            to: "/dashboard",
            kind: "event",
          });
        }
      });

    attempts
      .filter((a) => a.passed)
      .slice(0, 3)
      .forEach((a) => {
        list.push({
          id: `cert_${a.id}`,
          title: "Course Exam Passed!",
          body: `Score ${a.score}% — Check your Certificates tab`,
          to: "/dashboard",
          kind: "cert",
        });
      });

    const myThreadIds = new Set(threads.filter((t) => t.authorId === user.id).map((t) => t.id));
    replies
      .filter((r) => myThreadIds.has(r.threadId) && r.authorId !== user.id)
      .slice(0, 3)
      .forEach((r) => {
        list.push({
          id: `rep_${r.id}`,
          title: `New Forum Reply from ${r.authorName}`,
          body: r.body.slice(0, 70),
          to: "/forum",
          kind: "forum",
        });
      });

    return list.slice(0, 8);
  }, [user, myRegistrations, events, attempts, threads, replies]);

  const unreadCount = items.filter((i) => !readIds.includes(i.id)).length;

  const markAllRead = () => {
    const all = items.map((i) => i.id);
    setReadIds(all);
    if (readKey) {
      try {
        localStorage.setItem(readKey, JSON.stringify(all));
      } catch {}
    }
  };

  if (!user) return null;

  return (
    <div ref={ref} className="relative hidden sm:block">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label="Notifications"
        className={`relative flex h-9 w-9 items-center justify-center rounded-full transition cursor-pointer ${
          scrolled ? "text-ink hover:bg-cream" : "text-white hover:bg-white/10"
        }`}
      >
        <Bell className="h-4.5 w-4.5" />
        {unreadCount > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-brand px-1 text-[10px] font-bold text-white">
            {unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-3 w-80 origin-top-right overflow-hidden rounded-2xl border border-line bg-white shadow-[0_30px_70px_-25px_rgba(22,24,28,0.45)] z-50">
          <div className="flex items-center justify-between border-b border-line bg-cream px-4 py-3">
            <span className="font-display text-sm font-bold text-ink">Notifications</span>
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={markAllRead}
                className="inline-flex items-center gap-1 text-xs font-semibold text-brand hover:underline cursor-pointer"
              >
                <CheckCheck className="h-3.5 w-3.5" /> Mark all read
              </button>
            )}
          </div>
          {items.length ? (
            <div className="max-h-72 overflow-y-auto divide-y divide-line">
              {items.map((n) => {
                const unread = !readIds.includes(n.id);
                const Icon = n.kind === "event" ? CalendarDays : n.kind === "cert" ? Award : MessageSquare;
                return (
                  <button
                    key={n.id}
                    type="button"
                    onClick={() => {
                      setOpen(false);
                      navigate(n.to);
                    }}
                    className={`flex w-full items-start gap-3 px-4 py-3 text-left transition hover:bg-cream/60 cursor-pointer ${
                      unread ? "bg-brand-light/25" : ""
                    }`}
                  >
                    <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-brand-light text-brand">
                      <Icon className="h-4 w-4" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-xs font-bold text-ink">{n.title}</span>
                      <span className="mt-0.5 block truncate text-[11px] text-muted">{n.body}</span>
                    </span>
                  </button>
                );
              })}
            </div>
          ) : (
            <p className="p-6 text-center text-xs text-muted">No new notifications yet.</p>
          )}
        </div>
      )}
    </div>
  );
}
