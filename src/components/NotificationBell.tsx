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
  Flame,
} from "lucide-react";
import { useStore } from "../lib/store";
import { formatAccountName } from "../lib/formatName";
import { navigate } from "../lib/router";

type NotifKind = "forum" | "like" | "mention" | "xp" | "mentorship" | "event" | "cert";

type NotifItem = {
  id: string;
  title: string;
  body: string;
  to: string;
  kind: NotifKind;
  time?: string;
  actorName?: string;
  actorAvatar?: string;
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

function getInitials(name?: string): string {
  if (!name) return "GF";
  const parts = name.trim().split(/\s+/);
  return ((parts[0]?.[0] || "") + (parts[1]?.[0] || "")).toUpperCase() || "GF";
}

export default function NotificationBell({ scrolled }: { scrolled: boolean }) {
  const {
    user,
    myRegistrations = [],
    events = [],
    attempts = [],
    forum,
    admin,
    combat,
    combatLeaderboard = [],
  } = useStore();
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
    const accountById = new Map(accounts.map((a) => [a.id, a]));
    const nameById = new Map(accounts.map((a) => [a.id, formatAccountName(a)]));

    // 1. Forum replies / comments on user's threads
    const myThreads = threads.filter((t) => t.authorId === user.id);
    const myThreadIds = new Set(myThreads.map((t) => t.id));
    const threadTitleById = new Map(threads.map((t) => [t.id, t.title]));

    replies
      .filter((r) => myThreadIds.has(r.threadId) && r.authorId !== user.id)
      .forEach((r) => {
        const actor = accountById.get(r.authorId);
        list.push({
          id: `rep_${r.id}`,
          title: `${r.authorName} replied to "${threadTitleById.get(r.threadId) || "your thread"}"`,
          body: r.body ? r.body.slice(0, 90) : "Attached an image",
          to: "/forum",
          kind: "forum",
          time: r.createdAt,
          actorName: r.authorName,
          actorAvatar: actor?.avatar || r.authorAvatar,
        });
      });

    // 2. Forum likes on user's threads
    myThreads.forEach((t) => {
      const likers = (t.likes || []).filter((id) => id !== user.id);
      if (likers.length > 0) {
        const firstAcc = accountById.get(likers[0]);
        const firstLiker = nameById.get(likers[0]) || "Someone";
        const who =
          likers.length === 1
            ? firstLiker
            : `${firstLiker} & ${likers.length - 1} other${likers.length > 2 ? "s" : ""}`;
        list.push({
          id: `tlike_${t.id}_${likers.length}`,
          title: `${who} liked your thread`,
          body: t.title,
          to: "/forum",
          kind: "like",
          time: t.createdAt,
          actorName: firstLiker,
          actorAvatar: firstAcc?.avatar,
        });
      }
    });

    // 3. Forum likes on user's replies/comments
    replies
      .filter((r) => r.authorId === user.id)
      .forEach((r) => {
        const likers = (r.likes || []).filter((id) => id !== user.id);
        if (likers.length > 0) {
          const firstAcc = accountById.get(likers[0]);
          const firstLiker = nameById.get(likers[0]) || "Someone";
          const who =
            likers.length === 1
              ? firstLiker
              : `${firstLiker} & ${likers.length - 1} other${likers.length > 2 ? "s" : ""}`;
          list.push({
            id: `rlike_${r.id}_${likers.length}`,
            title: `${who} liked your comment`,
            body: r.body ? r.body.slice(0, 90) : "Your forum comment",
            to: "/forum",
            kind: "like",
            time: r.createdAt,
            actorName: firstLiker,
            actorAvatar: firstAcc?.avatar,
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
        const actor = accountById.get(t.authorId);
        list.push({
          id: `tment_${t.id}`,
          title: `${t.authorName} tagged you in "${t.title}"`,
          body: t.body.slice(0, 90),
          to: "/forum",
          kind: "mention",
          time: t.createdAt,
          actorName: t.authorName,
          actorAvatar: actor?.avatar || t.authorAvatar,
        });
      });

    replies
      .filter((r) => r.authorId !== user.id && !myThreadIds.has(r.threadId) && hasMention(r.body))
      .forEach((r) => {
        const actor = accountById.get(r.authorId);
        list.push({
          id: `rment_${r.id}`,
          title: `${r.authorName} tagged you in a reply`,
          body: r.body.slice(0, 90),
          to: "/forum",
          kind: "mention",
          time: r.createdAt,
          actorName: r.authorName,
          actorAvatar: actor?.avatar || r.authorAvatar,
        });
      });

    // 5. XP Ranking / Leaderboard Rivalry Notifications
    if (combatLeaderboard.length > 0) {
      const myXp = combat?.xp ?? 0;
      const myIdx = combatLeaderboard.findIndex((r) => r.userId === user.id);

      // Someone ahead of the user -> "Catch up with [name]!"
      const rival =
        myIdx > 0
          ? combatLeaderboard[myIdx - 1]
          : myIdx === -1
          ? combatLeaderboard.find((r) => r.userId !== user.id)
          : undefined;

      if (rival && rival.xp > myXp) {
        const gap = rival.xp - myXp;
        list.push({
          id: `xp_up_${rival.userId}_${rival.xp}`,
          title: `Catch up with ${rival.name}!`,
          body: `${rival.name} is ${gap} XP ahead (${rival.xp} XP). Join the Arcade & Quizzes to climb the leaderboard!`,
          to: "/fun",
          kind: "xp",
          time: new Date().toISOString(),
          actorName: rival.name,
          actorAvatar: rival.avatar,
        });
      }

      // Someone right behind the user -> "Don't let [name] beat you!"
      const challenger = myIdx >= 0 && myIdx + 1 < combatLeaderboard.length ? combatLeaderboard[myIdx + 1] : undefined;
      if (challenger) {
        const lead = Math.max(0, myXp - challenger.xp);
        list.push({
          id: `xp_def_${challenger.userId}_${challenger.xp}`,
          title: `Don't let ${challenger.name} beat you!`,
          body: `${challenger.name} is only ${lead} XP behind your #${myIdx + 1} rank. Keep your streak alive!`,
          to: "/fun",
          kind: "xp",
          time: new Date().toISOString(),
          actorName: challenger.name,
          actorAvatar: challenger.avatar,
        });
      }
    }

    // 6. 1-on-1 Mentorship updates
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

    // 7. Confirmed event tickets
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

    // 8. Passed course exams / certificates
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
  }, [user, accounts, enquiries, myRegistrations, events, attempts, threads, replies, combat, combatLeaderboard]);

  const unreadCount = items.filter((i) => !readIds.includes(i.id)).length;

  const filteredItems = useMemo(() => {
    if (filter === "unread") return items.filter((i) => !readIds.includes(i.id));
    if (filter === "forum") return items.filter((i) => i.kind === "forum" || i.kind === "like" || i.kind === "mention");
    if (filter === "activity")
      return items.filter((i) => i.kind === "xp" || i.kind === "mentorship" || i.kind === "event" || i.kind === "cert");
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

  const styleFor = (kind: NotifKind) => {
    switch (kind) {
      case "like":
        return {
          Icon: Heart,
          badgeBg: "bg-rose-500 text-white",
          iconBg: "bg-rose-500/10 text-rose-600",
          cardBg: "bg-rose-500/[0.05] hover:bg-rose-500/[0.10]",
          dotBg: "bg-rose-500",
        };
      case "forum":
        return {
          Icon: MessageSquare,
          badgeBg: "bg-sky-500 text-white",
          iconBg: "bg-sky-500/10 text-sky-600",
          cardBg: "bg-sky-500/[0.05] hover:bg-sky-500/[0.10]",
          dotBg: "bg-sky-500",
        };
      case "mention":
        return {
          Icon: AtSign,
          badgeBg: "bg-amber-500 text-white",
          iconBg: "bg-amber-500/10 text-amber-700",
          cardBg: "bg-amber-500/[0.06] hover:bg-amber-500/[0.11]",
          dotBg: "bg-amber-500",
        };
      case "xp":
        return {
          Icon: Flame,
          badgeBg: "bg-purple-600 text-white",
          iconBg: "bg-purple-500/10 text-purple-600",
          cardBg: "bg-purple-500/[0.05] hover:bg-purple-500/[0.10]",
          dotBg: "bg-purple-600",
        };
      case "cert":
        return {
          Icon: Award,
          badgeBg: "bg-purple-600 text-white",
          iconBg: "bg-purple-500/10 text-purple-600",
          cardBg: "bg-purple-500/[0.05] hover:bg-purple-500/[0.10]",
          dotBg: "bg-purple-600",
        };
      case "event":
      case "mentorship":
      default:
        return {
          Icon: kind === "mentorship" ? Video : CalendarDays,
          badgeBg: "bg-emerald-500 text-white",
          iconBg: "bg-emerald-500/10 text-emerald-600",
          cardBg: "bg-emerald-500/[0.05] hover:bg-emerald-500/[0.10]",
          dotBg: "bg-emerald-500",
        };
    }
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
          ["activity", "XP & Sessions"],
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
        <div className="flex-1 overflow-y-auto p-2.5 space-y-1.5 bg-white">
          {filteredItems.map((n) => {
            const unread = !readIds.includes(n.id);
            const { Icon, badgeBg, iconBg, cardBg, dotBg } = styleFor(n.kind);
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
                className={`flex w-full items-start gap-3.5 rounded-2xl px-3.5 py-3 text-left transition cursor-pointer ${
                  unread ? cardBg : "hover:bg-cream/70"
                }`}
              >
                {/* Facebook-style circular avatar with attached corner icon badge */}
                <div className="relative shrink-0 mt-0.5">
                  {n.actorName ? (
                    n.actorAvatar ? (
                      <img
                        src={n.actorAvatar}
                        alt={n.actorName}
                        className="h-11 w-11 rounded-full object-cover ring-2 ring-white shadow-xs"
                      />
                    ) : (
                      <span className="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-ink/85 to-ink text-xs font-bold text-white ring-2 ring-white shadow-xs">
                        {getInitials(n.actorName)}
                      </span>
                    )
                  ) : (
                    <span className={`flex h-11 w-11 items-center justify-center rounded-full ${iconBg}`}>
                      <Icon className="h-5 w-5" />
                    </span>
                  )}
                  {n.actorName && (
                    <span
                      className={`absolute -bottom-0.5 -right-0.5 flex h-5 w-5 items-center justify-center rounded-full ring-2 ring-white shadow-xs ${badgeBg}`}
                    >
                      <Icon className="h-2.5 w-2.5" />
                    </span>
                  )}
                </div>

                <span className="min-w-0 flex-1">
                  <span className="flex items-start justify-between gap-2">
                    <span className="text-xs sm:text-[13px] font-bold text-ink leading-snug">{n.title}</span>
                    {unread && <span className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${dotBg}`} />}
                  </span>
                  <span className="mt-0.5 block line-clamp-2 text-xs text-muted leading-relaxed">{n.body}</span>
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
            Forum replies, likes, @mentions, XP rankings, mentorship confirmations, and certificates will show up here.
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
