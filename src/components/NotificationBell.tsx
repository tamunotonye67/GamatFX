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
  Trophy,
  Users,
  BookOpen,
  TrendingUp,
  ShoppingBag,
  Wallet,
  ShieldCheck,
  Gift,
  Cake,
  Search,
} from "lucide-react";
import { useStore } from "../lib/store";
import { getCourse } from "../lib/courses";
import { formatAccountName } from "../lib/formatName";
import { getSecurityActivities } from "../lib/securityNotifs";
import { sendBirthdayEmail } from "../lib/email";
import { getNotifPrefs, playNotificationChime, type NotifPrefs } from "../lib/notifPrefs";
import { navigate } from "../lib/router";

type NotifKind =
  | "forum"
  | "like"
  | "mention"
  | "xp"
  | "mentorship"
  | "event"
  | "cert"
  | "club"
  | "course"
  | "news"
  | "giveaway"
  | "sotw"
  | "affiliate"
  | "store"
  | "account"
  | "birthday";

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
    enrollments = [],
    forum,
    admin,
    combat,
    combatLeaderboard = [],
    userClub,
    clubMessages = [],
    publishedOutlooks = [],
    publishedNews = [],
    publishedGiveaways = [],
    studentOfTheWeek,
    affiliateCommissions = [],
    payoutRequests = [],
    myStorePurchases = [],
    teamBios = [],
    myPosts = [],
    hasPassedQuiz,
  } = useStore();
  const threads = forum?.threads ?? [];
  const replies = forum?.replies ?? [];
  const accounts = admin?.accounts ?? [];
  const enquiries = admin?.enquiries ?? [];

  const [open, setOpen] = useState(false);
  const [visibleCount, setVisibleCount] = useState(6);
  const [unreadOnly, setUnreadOnly] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
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
    if (!open) {
      setVisibleCount(6);
      return;
    }
    const isMobile = typeof window !== "undefined" && window.innerWidth < 640;
    const prevOverflow = document.body.style.overflow;
    if (isMobile) {
      document.body.style.overflow = "hidden";
    }
    return () => {
      if (isMobile) {
        document.body.style.overflow = prevOverflow;
      }
    };
  }, [open]);

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

  const [prefs, setPrefs] = useState<NotifPrefs>(() => getNotifPrefs(user?.id));
  const seenAnnouncedRef = useRef<Set<string> | null>(null);

  useEffect(() => {
    setPrefs(getNotifPrefs(user?.id));
    seenAnnouncedRef.current = null;
  }, [user?.id]);

  useEffect(() => {
    const onPrefsChanged = () => setPrefs(getNotifPrefs(user?.id));
    window.addEventListener("gamat-notif-prefs-changed", onPrefsChanged);
    return () => window.removeEventListener("gamat-notif-prefs-changed", onPrefsChanged);
  }, [user?.id]);

  useEffect(() => {
    if (!user?.birthday || !user?.email || !prefs.emailBirthdays) return;
    const now = new Date();
    const mm = String(now.getMonth() + 1).padStart(2, "0");
    const dd = String(now.getDate()).padStart(2, "0");
    const todayMmDd = `${mm}-${dd}`;
    const match = String(user.birthday).trim().match(/^\d{4}-(\d{2}-\d{2})/);
    if (!match || match[1] !== todayMmDd) return;

    const year = now.getFullYear();
    const sentKey = `gamat.bday_emailed.${user.id}.${year}`;
    try {
      if (localStorage.getItem(sentKey)) return;
      localStorage.setItem(sentKey, "1");
    } catch {}

    sendBirthdayEmail({
      to: user.email,
      name: user.firstName || formatAccountName(user),
    }).catch(() => {});
  }, [user, prefs.emailBirthdays]);

  const items = useMemo<NotifItem[]>(() => {
    if (!user) return [];
    const list: NotifItem[] = [];
    const accountById = new Map(accounts.map((a) => [a.id, a]));
    const nameById = new Map(accounts.map((a) => [a.id, formatAccountName(a)]));

    // 1. Forum replies / comments on user's threads
    const myThreads = threads.filter((t) => t.authorId === user.id);
    const myThreadIds = new Set(myThreads.map((t) => t.id));
    const threadById = new Map(threads.map((t) => [t.id, t]));
    const threadTitleById = new Map(threads.map((t) => [t.id, t.title]));

    replies
      .filter((r) => myThreadIds.has(r.threadId) && r.authorId !== user.id)
      .forEach((r) => {
        const actor = accountById.get(r.authorId);
        const parent = threadById.get(r.threadId);
        list.push({
          id: `rep_${r.id}`,
          title: `${r.authorName} replied to "${threadTitleById.get(r.threadId) || "your thread"}"`,
          body: r.body ? r.body.slice(0, 90) : "Attached an image",
          to: parent ? `/forum/${parent.channelId}/${parent.id}` : "/forum",
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
          to: `/forum/${t.channelId}/${t.id}`,
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
          const parent = threadById.get(r.threadId);
          const who =
            likers.length === 1
              ? firstLiker
              : `${firstLiker} & ${likers.length - 1} other${likers.length > 2 ? "s" : ""}`;
          list.push({
            id: `rlike_${r.id}_${likers.length}`,
            title: `${who} liked your comment`,
            body: r.body ? r.body.slice(0, 90) : "Your forum comment",
            to: parent ? `/forum/${parent.channelId}/${parent.id}` : "/forum",
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
          to: `/forum/${t.channelId}/${t.id}`,
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
        const parent = threadById.get(r.threadId);
        list.push({
          id: `rment_${r.id}`,
          title: `${r.authorName} tagged you in a reply`,
          body: r.body.slice(0, 90),
          to: parent ? `/forum/${parent.channelId}/${parent.id}` : "/forum",
          kind: "mention",
          time: r.createdAt,
          actorName: r.authorName,
          actorAvatar: actor?.avatar || r.authorAvatar,
        });
      });

    // 5. Trading Club Activity (messages, direct replies, likes & @mentions in user's club)
    if (userClub) {
      const myClubMsgIds = new Set(
        clubMessages.filter((m) => m.clubId === userClub.id && m.userId === user.id).map((m) => m.id)
      );
      clubMessages
        .filter((m) => m.clubId === userClub.id && m.userId !== user.id)
        .slice(0, 4)
        .forEach((m) => {
          const actor = accountById.get(m.userId);
          const mentioned = hasMention(m.content);
          const isDirectReply = Boolean(m.replyToId && myClubMsgIds.has(m.replyToId));
          list.push({
            id: `club_${m.id}`,
            title: mentioned
              ? `${m.userName} tagged you in ${userClub.name}`
              : isDirectReply
              ? `${m.userName} replied to you in ${userClub.name}`
              : `New message in ${userClub.name}`,
            body: `${m.userName}: ${m.content ? m.content.slice(0, 80) : "Shared an image"}`,
            to: `/fun/clubs?club=${userClub.id}`,
            kind: mentioned ? "mention" : "club",
            time: m.createdAt,
            actorName: m.userName,
            actorAvatar: actor?.avatar || m.userAvatar,
          });
        });

      clubMessages
        .filter((m) => m.clubId === userClub.id && m.userId === user.id)
        .forEach((m) => {
          const likers = (m.likes || []).filter((id) => id !== user.id);
          if (likers.length > 0) {
            const firstAcc = accountById.get(likers[0]);
            const firstLiker = nameById.get(likers[0]) || "Someone";
            const who =
              likers.length === 1
                ? firstLiker
                : `${firstLiker} & ${likers.length - 1} other${likers.length > 2 ? "s" : ""}`;
            list.push({
              id: `club_like_${m.id}_${likers.length}`,
              title: `${who} liked your message in ${userClub.name}`,
              body: m.content ? m.content.slice(0, 80) : "Your club message",
              to: `/fun/clubs?club=${userClub.id}`,
              kind: "like",
              time: m.createdAt,
              actorName: firstLiker,
              actorAvatar: firstAcc?.avatar,
            });
          }
        });
    }

    // 6. XP Ranking / Leaderboard Rivalry Notifications
    if (prefs.inAppRivalry && combatLeaderboard.length > 0) {
      const myXp = combat?.xp ?? 0;
      const myIdx = combatLeaderboard.findIndex((r) => r.userId === user.id);

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
          to: "/fun/market-combat",
          kind: "xp",
          actorName: rival.name,
          actorAvatar: rival.avatar,
        });
      }

      const challenger = myIdx >= 0 && myIdx + 1 < combatLeaderboard.length ? combatLeaderboard[myIdx + 1] : undefined;
      if (challenger) {
        const lead = Math.max(0, myXp - challenger.xp);
        list.push({
          id: `xp_def_${challenger.userId}_${challenger.xp}`,
          title: `Don't let ${challenger.name} beat you!`,
          body: `${challenger.name} is only ${lead} XP behind your #${myIdx + 1} rank. Keep your streak alive!`,
          to: "/fun/market-combat",
          kind: "xp",
          actorName: challenger.name,
          actorAvatar: challenger.avatar,
        });
      }
    }

    // 7. 1-on-1 Mentorship updates
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
          to: "/dashboard?tab=booking",
          kind: "mentorship",
          time: b.createdAt,
        });
      });

    // 8. Course & Lesson Updates + Onboarding prompt
    enrollments.slice(0, 3).forEach((enr) => {
      const course = getCourse(enr.courseId);
      if (course) {
        list.push({
          id: `course_${enr.id}`,
          title: `Course Unlocked: ${course.title}`,
          body: `${enr.completedLessons.length} lesson${enr.completedLessons.length === 1 ? "" : "s"} completed — continue learning`,
          to: `/learn/${course.id}`,
          kind: "course",
          time: enr.enrolledAt,
        });
      }
    });

    if ((combat?.xp ?? 0) === 0 && attempts.length === 0) {
      list.push({
        id: `onboard_${user.id}`,
        title: "Complete your first quiz to earn XP!",
        body: "Jump into the Quiz & Trading Arcade to get ranked on the student leaderboard.",
        to: "/fun/quiz",
        kind: "xp",
      });
    }

    // 9. Market Outlooks & Academy News
    publishedOutlooks.slice(0, 2).forEach((o) => {
      list.push({
        id: `outlook_${o.id}`,
        title: `New Market Outlook: ${o.pair}`,
        body: `${o.bias} · ${o.title}`,
        to: `/outlook/${o.id}`,
        kind: "news",
        time: o.createdAt,
      });
    });

    publishedNews.slice(0, 2).forEach((n) => {
      list.push({
        id: `news_${n.id}`,
        title: `Academy News: ${n.title}`,
        body: n.summary || "Read the latest update from GAMAT Fx Academy",
        to: `/news/${n.id}`,
        kind: "news",
        time: n.publishedAt,
      });
    });

    // 10. Giveaways & Student of the Week
    publishedGiveaways.slice(0, 2).forEach((g) => {
      const iWon = (g.winners || []).some(
        (w) => w.userId === user.id || w.name.toLowerCase() === formatAccountName(user).toLowerCase()
      );
      const firstWinner = g.winners?.[0];
      list.push({
        id: `giveaway_${g.id}`,
        title: iWon ? `You Won a Giveaway: ${g.title}!` : `Giveaway Winners: ${g.title}`,
        body: iWon
          ? `Reward: ${g.reward} — Check your Giveaway details!`
          : `Reward: ${g.reward}${firstWinner ? ` · Congrats to ${firstWinner.name}!` : ""}`,
        to: `/giveaways/${g.id}`,
        kind: "giveaway",
        time: g.announcedAt || g.createdAt,
        actorName: firstWinner?.name,
        actorAvatar: firstWinner?.avatar,
      });
    });

    if (studentOfTheWeek && studentOfTheWeek.studentName) {
      const isMe = studentOfTheWeek.studentId === user.id;
      list.push({
        id: `sotw_${studentOfTheWeek.id}_${studentOfTheWeek.weekPeriod}`,
        title: isMe
          ? "You're Student of the Week!"
          : `Student of the Week: ${studentOfTheWeek.studentName}`,
        body: `${studentOfTheWeek.track} · ${studentOfTheWeek.weekPeriod}`,
        to: "/fun/student-of-the-week",
        kind: "sotw",
        time: studentOfTheWeek.createdAt,
        actorName: studentOfTheWeek.studentName,
        actorAvatar: studentOfTheWeek.avatar,
      });
    }

    // 11. Affiliate Commissions & Payouts
    affiliateCommissions
      .filter((c) => c.affiliateUserId === user.id)
      .slice(0, 3)
      .forEach((c) => {
        list.push({
          id: `aff_${c.id}`,
          title: `Affiliate Commission Earned (+₦${c.commissionAmount.toLocaleString()})`,
          body: `${c.referredUserName} enrolled via your referral link`,
          to: "/dashboard?tab=affiliate",
          kind: "affiliate",
          time: c.createdAt,
        });
      });

    payoutRequests
      .filter((p) => p.affiliateUserId === user.id)
      .slice(0, 3)
      .forEach((p) => {
        list.push({
          id: `payreq_${p.id}_${p.status}`,
          title:
            p.status === "paid"
              ? `Payout Sent (₦${p.amount.toLocaleString()})`
              : p.status === "rejected"
              ? "Payout Request Declined"
              : `Payout Requested (₦${p.amount.toLocaleString()})`,
          body: `Status: ${p.status.toUpperCase()}`,
          to: "/dashboard?tab=affiliate",
          kind: "affiliate",
          time: p.resolvedAt || p.createdAt,
        });
      });

    // 12. Store & Order Updates
    myStorePurchases.slice(0, 3).forEach((ord) => {
      list.push({
        id: `store_${ord.id}`,
        title: `Store Order Confirmed: ${ord.courseTitle}`,
        body: `₦${ord.amount.toLocaleString()} · Ref ${ord.ref}`,
        to: "/dashboard?tab=billing",
        kind: "store",
        time: ord.createdAt,
      });
    });

    // 13. Confirmed event tickets
    myRegistrations
      .filter((r) => r.status === "confirmed")
      .forEach((r) => {
        const ev = events.find((e) => e.id === r.eventId);
        if (ev) {
          list.push({
            id: `ev_${r.id}`,
            title: `Ticket Confirmed: ${ev.title}`,
            body: `${ev.date} · Ticket ${r.ticketCode}`,
            to: "/dashboard?tab=events",
            kind: "event",
            time: r.createdAt,
          });
        }
      });

    // 14. Passed course exams / certificates
    attempts
      .filter((a) => a.passed)
      .forEach((a) => {
        list.push({
          id: `cert_${a.id}`,
          title: "Course Exam Passed!",
          body: `Score ${a.score}% — Check your Certificates tab`,
          to: "/dashboard?tab=certificates",
          kind: "cert",
          time: a.submittedAt,
        });
      });

    // 15. Account & Role Promotion
    if (user.role === "staff" || user.role === "admin") {
      list.push({
        id: `role_${user.id}_${user.role}`,
        title: user.role === "admin" ? "Admin Access Active" : "Staff Role Active",
        body: "You have elevated team permissions on GAMAT Fx Academy.",
        to: "/admin",
        kind: "account",
      });
    }

    // 16. Security & Login / Password Alerts
    getSecurityActivities(user.id).forEach((sec) => {
      list.push({
        id: sec.id,
        title: sec.title,
        body: sec.body,
        to: sec.to,
        kind: "account",
        time: sec.time,
      });
    });

    // 17. Team Bio Submission Status
    teamBios
      .filter((b) => b.userId === user.id && (b.status === "approved" || b.status === "rejected"))
      .forEach((b) => {
        list.push({
          id: `teambio_${b.id}_${b.status}`,
          title: b.status === "approved" ? "Team Bio Approved & Published!" : "Team Bio Needs Updates",
          body:
            b.status === "approved"
              ? "Your mentor/staff profile is now live on the Team page."
              : b.adminNote || "Please review admin feedback and resubmit your Team Bio.",
          to: "/dashboard?tab=team-bio",
          kind: "account",
          time: b.reviewedAt || b.createdAt,
        });
      });

    // 18. 100% Lessons Completed (Exam Ready) & Quiz Retake Nudge
    enrollments.forEach((enr) => {
      const course = getCourse(enr.courseId);
      if (!course || !course.lessons?.length) return;
      const passed = hasPassedQuiz ? hasPassedQuiz(course.id) : false;
      if (!passed && enr.completedLessons.length >= course.lessons.length) {
        list.push({
          id: `exam_ready_${course.id}`,
          title: `Exam Ready: ${course.title}`,
          body: "You completed all lessons! Take your final exam to earn your certificate.",
          to: `/quiz/${course.id}`,
          kind: "cert",
          time: enr.enrolledAt,
        });
      }
    });

    const latestFailedByCourse = new Map<string, (typeof attempts)[number]>();
    attempts.forEach((a) => {
      if (!a.passed && !(hasPassedQuiz && hasPassedQuiz(a.courseId))) {
        const prev = latestFailedByCourse.get(a.courseId);
        if (!prev || +new Date(a.submittedAt) > +new Date(prev.submittedAt)) {
          latestFailedByCourse.set(a.courseId, a);
        }
      }
    });
    latestFailedByCourse.forEach((a) => {
      const course = getCourse(a.courseId);
      list.push({
        id: `retake_${a.id}`,
        title: `Almost there (${a.score}%) — Retake Exam`,
        body: `Review ${course?.title || a.courseId} and try again to unlock your certificate.`,
        to: `/quiz/${a.courseId}`,
        kind: "course",
        time: a.submittedAt,
      });
    });

    // 19. Upcoming Event Countdown (within next 48 hours)
    const nowMs = Date.now();
    myRegistrations
      .filter((r) => r.status === "confirmed")
      .forEach((r) => {
        const ev = events.find((e) => e.id === r.eventId);
        if (!ev) return;
        const evMs = +new Date(ev.date);
        if (!Number.isNaN(evMs) && evMs > nowMs && evMs - nowMs <= 48 * 3600 * 1000) {
          list.push({
            id: `ev_soon_${r.id}`,
            title: `Starts Soon: ${ev.title}`,
            body: `Happening ${ev.date} · Keep your ticket (${r.ticketCode}) ready!`,
            to: "/dashboard?tab=events",
            kind: "event",
            time: r.createdAt,
          });
        }
      });

    // 20. Wallet Balance Activity
    if ((user.walletBalance ?? 0) > 0) {
      list.push({
        id: `wallet_${user.id}_${user.walletBalance}`,
        title: `Wallet Balance: ₦${(user.walletBalance ?? 0).toLocaleString()}`,
        body: "Use your wallet balance toward courses, store gear, or payouts.",
        to: "/dashboard?tab=wallet",
        kind: "affiliate",
      });
    }

    // 21. Trade Journal Milestones & 7-Day Reminder
    try {
      const rawJournal = localStorage.getItem(`gamat.trade_journal.${user.id}`);
      const journalTrades = rawJournal ? (JSON.parse(rawJournal) as { id: string; date?: string; createdAt?: string }[]) : [];
      const count = journalTrades.length;
      const milestone = count >= 25 ? 25 : count >= 10 ? 10 : count >= 5 ? 5 : 0;
      if (milestone > 0) {
        list.push({
          id: `journal_ms_${user.id}_${milestone}`,
          title: `Trade Journal Milestone: ${milestone}+ Trades Logged!`,
          body: "Consistency builds edge. Review your win rate and RRR in your Trade Journal.",
          to: "/dashboard?tab=journal",
          kind: "course",
        });
      }
      if (count > 0) {
        const latestMs = Math.max(
          ...journalTrades.map((t) => +new Date(t.createdAt || t.date || 0)).filter((n) => !Number.isNaN(n))
        );
        if (latestMs > 0 && nowMs - latestMs > 7 * 24 * 3600 * 1000) {
          list.push({
            id: `journal_nudge_${user.id}_${Math.floor(latestMs / 86400000)}`,
            title: "Time to update your Trade Journal",
            body: "You haven't logged a trade in over 7 days — keep your trading log current.",
            to: "/dashboard?tab=journal",
            kind: "course",
          });
        }
      }
    } catch {}

    // 22. New Referral Sign-Ups (even before purchase)
    accounts
      .filter(
        (a) =>
          a.id !== user.id &&
          a.referredBy &&
          (a.referredBy === user.id || (user.affiliateCode && a.referredBy === user.affiliateCode))
      )
      .slice(0, 4)
      .forEach((refAcc) => {
        const refName = formatAccountName(refAcc);
        list.push({
          id: `ref_signup_${refAcc.id}`,
          title: `New Referral Sign-Up: ${refName}`,
          body: `${refName} joined GAMAT Fx Academy using your referral link!`,
          to: "/dashboard?tab=affiliate",
          kind: "affiliate",
          time: refAcc.createdAt,
          actorName: refName,
          actorAvatar: refAcc.avatar,
        });
      });

    // 23. Staff Post Updates
    myPosts
      .filter((p) => p.status === "published" || p.status === "rejected")
      .slice(0, 3)
      .forEach((p) => {
        list.push({
          id: `post_${p.id}_${p.status}`,
          title: p.status === "published" ? `Post Published: ${p.title}` : `Post Needs Edits: ${p.title}`,
          body:
            p.status === "published"
              ? "Your article is now live on GAMAT Fx Academy."
              : "Check your Posts tab for status updates.",
          to: "/dashboard?tab=posts",
          kind: "news",
          time: p.updatedAt || p.createdAt,
        });
      });

    // 24. Birthday Notifications (user's own birthday + community members' birthdays)
    if (prefs.inAppBirthdays) {
      const bdayNow = new Date();
      const todayYear = bdayNow.getFullYear();
      const todayMmDd = `${String(bdayNow.getMonth() + 1).padStart(2, "0")}-${String(bdayNow.getDate()).padStart(2, "0")}`;
      const todayStartIso = new Date(todayYear, bdayNow.getMonth(), bdayNow.getDate()).toISOString();

      const userBdayMatch = user.birthday ? String(user.birthday).trim().match(/^\d{4}-(\d{2}-\d{2})/) : null;
      if (userBdayMatch && userBdayMatch[1] === todayMmDd) {
        const first = user.firstName || formatAccountName(user);
        list.push({
          id: `bday_self_${user.id}_${todayYear}`,
          title: `Happy Birthday, ${first}! 🎉`,
          body: "Wishing you a joyful birthday and winning trades from everyone at GAMAT FX Academy!",
          to: "/dashboard?tab=profile",
          kind: "birthday",
          time: todayStartIso,
          actorName: formatAccountName(user),
          actorAvatar: user.avatar,
        });
      }

      accounts
        .filter((a) => {
          if (a.id === user.id || !a.birthday) return false;
          if (a.status && a.status !== "active") return false;
          const m = String(a.birthday).trim().match(/^\d{4}-(\d{2}-\d{2})/);
          return m ? m[1] === todayMmDd : false;
        })
        .slice(0, 5)
        .forEach((bAcc) => {
          const bName = formatAccountName(bAcc);
          list.push({
            id: `bday_peer_${bAcc.id}_${todayYear}`,
            title: `Today is ${bName}'s Birthday! 🎂`,
            body: "Wish them a happy birthday in the Student Forum!",
            to: "/forum",
            kind: "birthday",
            time: todayStartIso,
            actorName: bName,
            actorAvatar: bAcc.avatar,
          });
        });
    }

    return list
      .sort((a, b) => {
        const ta = a.time ? +new Date(a.time) : Number.MAX_SAFE_INTEGER;
        const tb = b.time ? +new Date(b.time) : Number.MAX_SAFE_INTEGER;
        return tb - ta;
      })
      .slice(0, 40);
  }, [
    user,
    open,
    accounts,
    enquiries,
    myRegistrations,
    events,
    attempts,
    enrollments,
    threads,
    replies,
    combat,
    combatLeaderboard,
    userClub,
    clubMessages,
    publishedOutlooks,
    publishedNews,
    publishedGiveaways,
    studentOfTheWeek,
    affiliateCommissions,
    payoutRequests,
    myStorePurchases,
    teamBios,
    myPosts,
    hasPassedQuiz,
    prefs.inAppRivalry,
    prefs.inAppBirthdays,
  ]);

  const [liveToast, setLiveToast] = useState<NotifItem | null>(null);

  useEffect(() => {
    if (!liveToast) return;
    const t = window.setTimeout(() => setLiveToast(null), 6000);
    return () => window.clearTimeout(t);
  }, [liveToast]);

  useEffect(() => {
    if (!user) return;
    const currentIds = items.map((i) => i.id);
    if (seenAnnouncedRef.current === null) {
      seenAnnouncedRef.current = new Set(currentIds);
      return;
    }
    const newlyArrived = items.filter((i) => !seenAnnouncedRef.current!.has(i.id) && !readIds.includes(i.id));
    currentIds.forEach((id) => seenAnnouncedRef.current!.add(id));
    if (newlyArrived.length === 0) return;

    const top = newlyArrived[0];
    if (!open) {
      setLiveToast(top);
    }

    if (prefs.soundEnabled) {
      playNotificationChime();
    }
    if (
      prefs.browserNotifications &&
      typeof Notification !== "undefined" &&
      Notification.permission === "granted"
    ) {
      try {
        const notif = new Notification(top.title, {
          body: top.body,
          tag: top.id,
        });
        notif.onclick = () => {
          window.focus();
          navigate(top.to);
          notif.close();
        };
      } catch {}
    }
  }, [items, readIds, user, open, prefs.soundEnabled, prefs.browserNotifications]);

  const unreadCount = items.filter((i) => !readIds.includes(i.id)).length;
  const filteredItems = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return items.filter((i) => {
      if (unreadOnly && readIds.includes(i.id)) return false;
      if (q) {
        const hay = `${i.title} ${i.body} ${i.actorName || ""}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [items, readIds, unreadOnly, searchQuery]);
  const visibleItems = filteredItems.slice(0, visibleCount);
  const remainingCount = Math.max(0, filteredItems.length - visibleCount);

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
      case "birthday":
        return {
          Icon: Cake,
          badgeBg: "bg-gradient-to-br from-rose-500 to-amber-500 text-white",
          iconBg: "bg-rose-500/12 text-rose-600",
          cardBg: "bg-rose-500/[0.06] hover:bg-rose-500/[0.11]",
          dotBg: "bg-rose-500",
        };
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
      case "club":
        return {
          Icon: Users,
          badgeBg: "bg-indigo-500 text-white",
          iconBg: "bg-indigo-500/10 text-indigo-600",
          cardBg: "bg-indigo-500/[0.05] hover:bg-indigo-500/[0.10]",
          dotBg: "bg-indigo-500",
        };
      case "mention":
      case "news":
        return {
          Icon: kind === "news" ? TrendingUp : AtSign,
          badgeBg: "bg-amber-500 text-white",
          iconBg: "bg-amber-500/10 text-amber-700",
          cardBg: "bg-amber-500/[0.06] hover:bg-amber-500/[0.11]",
          dotBg: "bg-amber-500",
        };
      case "xp":
      case "cert":
      case "giveaway":
      case "sotw":
      case "account":
        return {
          Icon:
            kind === "xp"
              ? Flame
              : kind === "giveaway"
              ? Gift
              : kind === "sotw"
              ? Trophy
              : kind === "account"
              ? ShieldCheck
              : Award,
          badgeBg: "bg-purple-600 text-white",
          iconBg: "bg-purple-500/10 text-purple-600",
          cardBg: "bg-purple-500/[0.05] hover:bg-purple-500/[0.10]",
          dotBg: "bg-purple-600",
        };
      case "course":
      case "affiliate":
      case "store":
      case "event":
      case "mentorship":
      default:
        return {
          Icon:
            kind === "course"
              ? BookOpen
              : kind === "affiliate"
              ? Wallet
              : kind === "store"
              ? ShoppingBag
              : kind === "mentorship"
              ? Video
              : CalendarDays,
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
      <div className="flex items-center justify-between border-b border-line bg-cream px-5 py-4 shrink-0">
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

      {/* Search & Unread Filter */}
      <div className="flex items-center gap-2 border-b border-line bg-white px-4 py-2.5 shrink-0">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search notifications…"
            className="w-full rounded-full border border-line bg-cream/60 py-1.5 pl-8 pr-7 text-xs text-ink placeholder-muted/70 outline-none focus:border-brand focus:bg-white transition"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              aria-label="Clear search"
              className="absolute right-2 top-1/2 -translate-y-1/2 text-muted hover:text-ink cursor-pointer"
            >
              <X className="h-3 w-3" />
            </button>
          )}
        </div>
        <button
          type="button"
          onClick={() => setUnreadOnly((v) => !v)}
          className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-bold border transition cursor-pointer ${
            unreadOnly
              ? "border-brand bg-brand text-white"
              : "border-line bg-cream/60 text-ink hover:bg-cream"
          }`}
        >
          Unread{unreadCount > 0 ? ` (${unreadCount})` : ""}
        </button>
      </div>

      {/* Notification List */}
      {visibleItems.length ? (
        <div className="flex-1 overflow-y-auto overscroll-contain divide-y divide-line/60 bg-white">
          {visibleItems.map((n) => {
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
                className={`flex w-full items-start gap-3.5 px-5 py-3.5 text-left transition cursor-pointer ${
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

          {remainingCount > 0 && (
            <div className="p-3 bg-white">
              <button
                type="button"
                onClick={() => setVisibleCount((c) => c + 10)}
                className="w-full rounded-xl border border-line bg-cream/70 py-2.5 text-xs font-bold text-ink hover:bg-cream transition cursor-pointer"
              >
                Show previous notifications ({remainingCount} more)
              </button>
            </div>
          )}
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

      {/* Live in-app toast popup */}
      {liveToast &&
        !open &&
        typeof document !== "undefined" &&
        createPortal(
          (() => {
            const { Icon, badgeBg, iconBg } = styleFor(liveToast.kind);
            return (
              <div
                role="status"
                className="fixed bottom-4 right-4 left-4 sm:left-auto sm:w-[360px] z-[110] rounded-2xl border border-line bg-white p-3.5 shadow-[0_20px_50px_-15px_rgba(22,24,28,0.3)] flex items-start gap-3 animate-in fade-in slide-in-from-bottom-3"
              >
                <button
                  type="button"
                  onClick={() => {
                    markOneRead(liveToast.id);
                    const target = liveToast.to;
                    setLiveToast(null);
                    navigate(target);
                  }}
                  className="flex flex-1 items-start gap-3 text-left min-w-0 cursor-pointer"
                >
                  <div className="relative shrink-0 mt-0.5">
                    {liveToast.actorName ? (
                      liveToast.actorAvatar ? (
                        <img
                          src={liveToast.actorAvatar}
                          alt={liveToast.actorName}
                          className="h-10 w-10 rounded-full object-cover ring-2 ring-white"
                        />
                      ) : (
                        <span className="flex h-10 w-10 items-center justify-center rounded-full bg-ink text-xs font-bold text-white">
                          {getInitials(liveToast.actorName)}
                        </span>
                      )
                    ) : (
                      <span className={`flex h-10 w-10 items-center justify-center rounded-full ${iconBg}`}>
                        <Icon className="h-5 w-5" />
                      </span>
                    )}
                    {liveToast.actorName && (
                      <span className={`absolute -bottom-0.5 -right-0.5 flex h-4.5 w-4.5 items-center justify-center rounded-full ring-2 ring-white ${badgeBg}`}>
                        <Icon className="h-2.5 w-2.5" />
                      </span>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-extrabold text-ink leading-snug line-clamp-1">{liveToast.title}</p>
                    <p className="mt-0.5 text-xs text-muted line-clamp-2 leading-relaxed">{liveToast.body}</p>
                  </div>
                </button>
                <button
                  type="button"
                  aria-label="Dismiss notification"
                  onClick={() => setLiveToast(null)}
                  className="shrink-0 rounded-full p-1 text-muted hover:bg-cream hover:text-ink transition cursor-pointer"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            );
          })(),
          document.body
        )}
    </div>
  );
}
