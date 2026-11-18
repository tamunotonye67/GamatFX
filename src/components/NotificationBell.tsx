import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
  Bell,
  CalendarDays,
  Award,
  MessageSquare,
  CheckCheck,
  Heart,
  AtSign,
  Video,
  X,
  Inbox,
} from "lucide-react";
import { useStore } from "../lib/store";
import { formatAccountName } from "../lib/formatName";
import { navigate } from "../lib/router";

type NotifKind = "forum" | "like" | "mention" | "mentorship" | "event" | "cert";

type NotifItem = {
  id: string;
  title: string;
  body: string;
  to: string;
  kind: NotifKind;
  time?: string;
};

type FilterTab = "all" | "unread" | "forum" | "activity";

function timeAgo(iso?: string): string {
  if (!iso) return "";
  const diff = Date.now() - new Date(iso).getTime();
  if (Number.isNaN(diff) || diff < 0) return "";
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

export default function NotificationBell({ scrolled }: { scrolled: boolean }) {
  const { user, myRegistrations = [], events = [], attempts = [], forum, admin } = useStore();
  const threads = forum?.threads ?? [];
  const replies = forum?.replies ?? [];
  const accounts = admin?.accounts ?? [];
  const enquiries = admin?.enquiries ?? [];

  const [open, setOpen] = useState(false);
  const [filter, setFilter] = useState<FilterTab>("all");
  const ref = useRef<HTMLDivElement | null>(null);
  const mobilePanelRef = useRef<HTMLDivElement | null>(null);

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
    if (!readKey) {
      setReadIds([]);
      return;
    }
    try {
      const raw = localStorage.getItem(readKey);
      setReadIds(raw ? JSON.parse(raw) : []);
    } catch {
      setReadIds([]);
    }
  }, [readKey]);

  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      const target = e.target as Node;
      if (
        ref.current &&
        !ref.current.contains(target) &&
        (!mobilePanelRef.current || !mobilePanelRef.current.contains(target))
      ) {
        setOpen(false);
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  const items = useMemo<NotifItem[]>(() => {
    if (!user) return [];
    const list: NotifItem[] = [];
    const nameById = new Map(accounts.map((a) => [a.id, formatAccountName(a)]));

    // 1. Forum replies / comments on user's threads
    const myThreads = threads.filter((t) => t.authorId === user.id);
    const myThreadIds = new Set(myThreads.map((t) => t.id));
    const threadTitleById = new Map(threads.map((t) => [t.id, t.title]));

    replies
      .filter((r) => myThreadIds.has(r.threadId) && r.authorId !== user.id)
      .forEach((r) => {
        list.push({
          id: `rep_${r.id}`,
          title: `${r.authorName} replied to "${threadTitleById.get(r.threadId) || "your thread"}"`,
          body: r.body ? r.body.slice(0, 90) : "Attached an image",
          to: "/forum",
          kind: "forum",
          time: r.createdAt,
        });
      });

    // 2. Forum likes on user's threads
    myThreads.forEach((t) => {
      const likers = (t.likes || []).filter((id) => id !== user.id);
      if (likers.length > 0) {
        const firstLiker = nameById.get(likers[0]) || "Someone";
        const who = likers.length === 1 ? firstLiker : `${firstLiker} & ${likers.length - 1} other${likers.length > 2 ? "s" : ""}`;
        list.push({
          id: `tlike_${t.id}_${likers.length}`,
          title: `${who} liked your thread`,
          body: t.title,
          to: "/forum",
          kind: "like",
          time: t.createdAt,
        });
      }
    });

    // 3. Forum likes on user's replies/comments
    replies
      .filter((r) => r.authorId === user.id)
      .forEach((r) => {
        const likers = (r.likes || []).filter((id) => id !== user.id);
        if (likers.length > 0) {
          const firstLiker = nameById.get(likers[0]) || "Someone";
          const who = likers.length === 1 ? firstLiker : `${firstLiker} & ${likers.length - 1} other${likers.length > 2 ? "s" : ""}`;
          list.push({
            id: `rlike_${r.id}_${likers.length}`,
            title: `${who} liked your comment`,
            body: r.body ? r.body.slice(0, 90) : "Your forum comment",
            to: "/forum",
            kind: "like",
            time: r.createdAt,
          });
        }
      });

    // 4. Forum @mentions of current user
    const myHandles = new Set(
      [
        user.nickname || "",
        `${user.firstName || ""}${user.lastName || ""}`,
        user.firstName || "",
      ]
        .map((s) => s.replace(/\s+/g, "").toLowerCase())
        .filter(Boolean)
    );
    const hasMention = (text?: string) => {
      if (!text) return false;
      for (const m of text.matchAll(/@([a-zA-Z0-9._-]+)/g)) {
        if (myHandles.has(m[1].toLowerCase())) return true;
      }
      return false;
    };

    threads
      .filter((t) => t.authorId !== user.id && hasMention(t.body))
      .forEach((t) => {
        list.push({
          id: `tment_${t.id}`,
          title: `${t.authorName} tagged you in "${t.title}"`,
          body: t.body.slice(0, 90),
          to: "/forum",
          kind: "mention",
          time: t.createdAt,
        });
      });

    replies
      .filter((r) => r.authorId !== user.id && !myThreadIds.has(r.threadId) && hasMention(r.body))
      .forEach((r) => {
        list.push({
          id: `rment_${r.id}`,
          title: `${r.authorName} tagged you in a reply`,
          body: r.body.slice(0, 90),
          to: "/forum",
          kind: "mention",
          time: r.createdAt,
        });
      });

    // 5. 1-on-1 Mentorship updates
    const emailLower = user.email.toLowerCase();
    enquiries
      .filter(
        (e) =>
          e.serviceSlug === "sys_mentorship_booking" &&
          (e.userId === user.id || e.email.toLowerCase() === emailLower) &&
          (e.budget === "confirmed" || e.budget === "declined" || e.status === "contacted" || e.status === "closed")
      )
      .forEach((b) => {
        const confirmed = b.budget === "confirmed" || b.status === "contacted";
        list.push({
          id: `ment_${b.id}_${confirmed ? "ok" : "no"}`,
          title: confirmed ? "1-on-1 Mentorship Confirmed" : "1-on-1 Slot Unavailable",
          body: `${b.serviceTitle} · ${b.packageName} WAT`,
          to: "/dashboard",
          kind: "mentorship",
          time: b.createdAt,
        });
      });

    // 6. Confirmed event tickets
    myRegistrations
      .filter((r) => r.status === "confirmed")
      .forEach((r) => {
        const ev = events.find((e) => e.id === r.eventId);
        if (ev) {
          list.push({
            id: `ev_${r.id}`,
            title: `Ticket Confirmed: ${ev.title}`,
            body: `${ev.date} · Ticket ${r.ticketCode}`,
            to: "/dashboard",
            kind: "event",
            time: r.createdAt,
          });
        }
      });

    // 7. Passed course exams / certificates
    attempts
      .filter((a) => a.passed)
      .forEach((a) => {
        list.push({
          id: `cert_${a.id}`,
          title: "Course Exam Passed!",
          body: `Score ${a.score}% — Check your Certificates tab`,
          to: "/dashboard",
          kind: "cert",
          time: a.submittedAt,
        });
      });

    return list
      .sort((a, b) => (+new Date(b.time || 0)) - (+new Date(a.time || 0)))
      .slice(0, 25);
  }, [user, accounts, enquiries, myRegistrations, events, attempts, threads, replies]);

  const unreadCount = items.filter((i) => !readIds.includes(i.id)).length;

  const filteredItems = useMemo(() => {
    if (filter === "unread") return items.filter((i) => !readIds.includes(i.id));
    if (filter === "forum") return items.filter((i) => i.kind === "forum" || i.kind === "like" || i.kind === "mention");
    if (filter === "activity") return items.filter((i) => i.kind === "mentorship" || i.kind === "event" || i.kind === "cert");
    return items;
  }, [items, filter, readIds]);

  const persistRead = (next: string[]) => {
    setReadIds(next);
    if (readKey) {
      try {
        localStorage.setItem(readKey, JSON.stringify(next));
      } catch {}
    }
  };

  const markOneRead = (id: string) => {
    if (!readIds.includes(id)) {
      persistRead([...readIds, id]);
    }
  };

  const markAllRead = () => {
    persistRead(items.map((i) => i.id));
  };

  if (!user) return null;

  const iconFor = (kind: NotifKind) => {
    if (kind === "like") return { Icon: Heart, bg: "bg-rose-50 text-rose-600" };
    if (kind === "mention") return { Icon: AtSign, bg: "bg-amber-50 text-amber-700" };
    if (kind === "mentorship") return { Icon: Video, bg: "bg-indigo-50 text-indigo-600" };
    if (kind === "event") return { Icon: CalendarDays, bg: "bg-emerald-50 text-emerald-700" };
    if (kind === "cert") return { Icon: Award, bg: "bg-purple-50 text-purple-700" };
    return { Icon: MessageSquare, bg: "bg-brand-light text-brand" };
  };

  const panelContent = (
    <>
      {/* Header */}
      <div className="flex items-center justify-between border-b border-line bg-cream/80 px-5 py-4 backdrop-blur-sm shrink-0">
        <div className="flex items-center gap-2.5">
          <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-brand text-white">
            <Bell className="h-4 w-4" />
          </span>
          <div>
            <h3 className="font-display text-base font-extrabold text-ink leading-none">Notifications</h3>
            <p className="mt-1 text-[11px] font-medium text-muted">
              {unreadCount > 0 ? `${unreadCount} unread update${unreadCount === 1 ? "" : "s"}` : "You're all caught up"}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <button
              type="button"
              onClick={markAllRead}
              className="inline-flex items-center gap-1 rounded-full bg-white px-3 py-1.5 text-xs font-bold text-brand border border-line hover:bg-brand-light transition cursor-pointer"
            >
              <CheckCheck className="h-3.5 w-3.5" /> Mark all read
            </button>
          )}
          <button
            type="button"
            onClick={() => setOpen(false)}
            aria-label="Close notifications"
            className="flex h-8 w-8 items-center justify-center rounded-full border border-line bg-white text-ink hover:bg-cream transition cursor-pointer sm:hidden"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Filter Pills */}
      <div className="flex items-center gap-1.5 border-b border-line bg-white px-4 py-2.5 overflow-x-auto shrink-0">
        {([
          ["all", "All"],
          ["unread", "Unread"],
          ["forum", "Forum"],
          ["activity", "Sessions & Certs"],
        ] as [FilterTab, string][]).map(([key, label]) => (
          <button
            key={key}
            type="button"
            onClick={() => setFilter(key)}
            className={`whitespace-nowrap rounded-full px-3 py-1 text-xs font-bold transition cursor-pointer ${
              filter === key
                ? "bg-ink text-white"
                : "bg-cream text-muted hover:text-ink"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Notification List */}
      {filteredItems.length ? (
        <div className="flex-1 overflow-y-auto divide-y divide-line">
          {filteredItems.map((n) => {
            const unread = !readIds.includes(n.id);
            const { Icon, bg } = iconFor(n.kind);
            const ago = timeAgo(n.time);
            return (
              <button
                key={n.id}
                type="button"
                onClick={() => {
                  markOneRead(n.id);
                  setOpen(false);
                  navigate(n.to);
                }}
                className={`flex w-full items-start gap-3.5 px-5 py-4 text-left transition hover:bg-cream/60 cursor-pointer ${
                  unread ? "bg-brand-light/20" : ""
                }`}
              >
                <span className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${bg}`}>
                  <Icon className="h-4 w-4" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="flex items-start justify-between gap-2">
                    <span className="text-xs sm:text-[13px] font-bold text-ink leading-snug">{n.title}</span>
                    {unread && <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-brand" />}
                  </span>
                  <span className="mt-1 block line-clamp-2 text-xs text-muted leading-relaxed">{n.body}</span>
                  {ago && <span className="mt-1 block text-[10px] font-semibold text-muted/80">{ago}</span>}
                </span>
              </button>
            );
          })}
        </div>
      ) : (
        <div className="flex flex-1 flex-col items-center justify-center p-10 text-center">
          <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-cream text-muted">
            <Inbox className="h-6 w-6" />
          </span>
          <p className="mt-3 font-display text-sm font-bold text-ink">No notifications here</p>
          <p className="mt-1 text-xs text-muted">
            Forum replies, likes, @mentions, mentorship confirmations, and certificates will show up here.
          </p>
        </div>
      )}
    </>
  );

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label="Notifications"
        aria-expanded={open}
        className={`relative flex h-9 w-9 items-center justify-center rounded-full transition cursor-pointer ${
          scrolled ? "text-ink hover:bg-cream" : "text-white hover:bg-white/10"
        }`}
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-brand px-1 text-[10px] font-bold text-white shadow-sm">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {/* Desktop popover */}
      {open && (
        <div
          className="hidden sm:flex sm:flex-col sm:absolute sm:right-0 sm:top-full sm:mt-3 sm:w-[400px] sm:max-h-[540px] sm:rounded-2xl sm:border sm:border-line sm:bg-white sm:shadow-[0_24px_60px_-15px_rgba(22,24,28,0.28)] z-[70] overflow-hidden"
          role="dialog"
          aria-label="Notifications"
        >
          {panelContent}
        </div>
      )}

      {/* Mobile full-screen drawer portaled to document.body to escape header transform-gpu */}
      {open &&
        typeof document !== "undefined" &&
        createPortal(
          <div
            ref={mobilePanelRef}
            className="fixed inset-0 z-[100] flex flex-col bg-white sm:hidden overflow-hidden"
            role="dialog"
            aria-label="Notifications"
          >
            {panelContent}
          </div>,
          document.body
        )}
    </div>
  );
}
