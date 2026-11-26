import { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowUpRight,
  Bot,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Gift,
  HelpCircle,
  Home,
  Map,
  MessageCircle,
  MessageSquare,
  Search,
  Send,
  X,
} from "lucide-react";
import { COURSES } from "../lib/courses";
import { navigate } from "../lib/router";
import { useStore } from "../lib/store";
import {
  getConfiguredUserJotId,
  identifyUserJotUser,
  initUserJot,
} from "../lib/userjot";

type WidgetTab = "home" | "messages" | "whatsnew";
type WhatsNewSubTab = "updates" | "roadmap" | "feedback";

type HelpArticle = {
  id: string;
  q: string;
  a: string;
  actionLabel?: string;
  actionTo?: string;
};

const HELP_ARTICLES: HelpArticle[] = [
  {
    id: "verify-cert",
    q: "How do I verify a GAMAT Fx certificate?",
    a: "Visit our Certificate Verification portal and enter any Course Certificate code (GMX-...) or Volunteer Fellowship Certificate code (GMX-FEL-...) to view the holder's verified status and issue date.",
    actionLabel: "Verify Certificate",
    actionTo: "/verify-certificate",
  },
  {
    id: "daily-streak",
    q: "How do Daily Streaks & badge tiers work?",
    a: "Play any Fun Zone game, complete a course lesson, or post in the Forum each day to keep your flame alive. Your streak syncs across devices automatically and unlocks tiers from Spark (1d) up to Legend (100d).",
    actionLabel: "Open Fun Zone",
    actionTo: "/fun",
  },
  {
    id: "enroll-courses",
    q: "How do I enroll in a course or mentorship?",
    a: "Browse our structured forex and order-flow courses, choose a track, and complete checkout. Enrolled lessons unlock immediately inside your Student Dashboard.",
    actionLabel: "Browse Courses",
    actionTo: "/courses",
  },
  {
    id: "fellowship-jobs",
    q: "How do I apply for open roles or fellowships?",
    a: "Head to Careers > Opportunities, pick your department track, attach your CV (PDF/DOCX) or portfolio link, and track your application status live under My Applications.",
    actionLabel: "View Open Roles",
    actionTo: "/jobs/opportunities",
  },
  {
    id: "affiliate-program",
    q: "How do I earn with the Affiliate Ambassador card?",
    a: "Generate your personalized referral card and share link from your Dashboard. Every confirmed student signup and purchase using your code earns tracked commissions.",
    actionLabel: "Go to Dashboard",
    actionTo: "/dashboard",
  },
];

type ChangelogEntry = {
  id: string;
  date: string;
  isNew?: boolean;
  title: string;
  summary: string;
  tag: string;
  previewTitle: string;
  previewSubtitle: string;
  gradient: string;
  to?: string;
};

const CHANGELOG_UPDATES: ChangelogEntry[] = [
  {
    id: "upd-streak-sync",
    date: "NOV 25",
    isNew: true,
    title: "Cross-Device Daily Streaks & 3× HD Badges",
    summary:
      "Your daily play, learning, and forum streaks now sync automatically across all phones and browsers, with 3× high-res downloadable badge cards.",
    tag: "Gamification",
    previewTitle: "Daily Streak Badges",
    previewSubtitle:
      "Unlock Spark, Ignite, Blaze, and Legend tiers with avatar-personalized badge exports.",
    gradient: "from-rose-100 via-amber-50 to-white",
    to: "/fun",
  },
  {
    id: "upd-fellowship-certs",
    date: "NOV 24",
    isNew: true,
    title: "Careers Portal, CV Upload & Fellowship Certificates",
    summary:
      "Apply directly with PDF/DOCX CVs, track your application status live, and verify GMX-FEL- Volunteer Fellowship certificates publicly.",
    tag: "Careers",
    previewTitle: "GAMAT Fx Careers & Fellowships",
    previewSubtitle:
      "Live status tracking, instant shareable job links, and verifiable fellowship credentials.",
    gradient: "from-sky-100 via-indigo-50 to-white",
    to: "/jobs/opportunities",
  },
  {
    id: "upd-3d-globe",
    date: "NOV 22",
    title: "Interactive Global Hubs & Certificate Portal",
    summary:
      "Spin and flick our 3D global network across Lagos, LDN, and NY, and verify academy or fellowship certificates in seconds.",
    tag: "Platform",
    previewTitle: "Global Network & Verification",
    previewSubtitle: "Fast public certificate verification and interactive career hubs.",
    gradient: "from-emerald-100 via-teal-50 to-white",
    to: "/verify-certificate",
  },
];

const ROADMAP_ITEMS = [
  {
    status: "Shipped",
    color: "bg-emerald-100 text-emerald-800",
    title: "Cross-device Daily Streak Sync & HD Cards",
    desc: "Streaks sync via Supabase across phones and export at 2484×4275px.",
  },
  {
    status: "In Progress",
    color: "bg-sky-100 text-sky-800",
    title: "Market Combat Cross-Device Leaderboard",
    desc: "Syncing live prediction XP and win streaks across every signed-in device.",
  },
  {
    status: "Planned",
    color: "bg-amber-100 text-amber-800",
    title: "Live Cohort Mentor Office Hours",
    desc: "Real-time weekly Q&A rooms inside the Student Dashboard.",
  },
];

type ChatMsg = {
  id: string;
  role: "assistant" | "user";
  text: string;
  actionLabel?: string;
  actionTo?: string;
};

const LAST_SEEN_UPDATE_KEY = "gamat.uj_last_seen_update.v1";

export default function GamatAssistantWidget() {
  const { user, news, submitEnquiry } = useStore();
  const externalUserJotId = useMemo(() => getConfiguredUserJotId(), []);

  const mergedUpdates = useMemo<ChangelogEntry[]>(() => {
    const dynamicEntries: ChangelogEntry[] = (news || []).slice(0, 4).map((n, i) => ({
      id: `news_${n.id}`,
      date: (n.publishedAt || "").slice(0, 10) || "UPDATE",
      isNew: i === 0,
      title: n.title,
      summary: n.summary,
      tag: n.tag || "Announcement",
      previewTitle: n.title,
      previewSubtitle: n.summary,
      gradient: "from-rose-50 via-amber-50/70 to-white",
      to: "/news",
    }));
    return [...dynamicEntries, ...CHANGELOG_UPDATES];
  }, [news]);

  // If external UserJot Project ID is configured, activate official UserJot SDK v3
  useEffect(() => {
    if (!externalUserJotId) return;
    initUserJot(externalUserJotId);
  }, [externalUserJotId]);

  useEffect(() => {
    if (!externalUserJotId || !user?.id) return;
    identifyUserJotUser({
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      avatar: user.avatar,
    });
  }, [externalUserJotId, user]);

  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<WidgetTab>("home");
  const [whatsNewSub, setWhatsNewSub] = useState<WhatsNewSubTab>("updates");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedArticle, setSelectedArticle] = useState<HelpArticle | null>(null);
  const [hasUnreadUpdate, setHasUnreadUpdate] = useState<boolean>(() => {
    try {
      return localStorage.getItem(LAST_SEEN_UPDATE_KEY) !== CHANGELOG_UPDATES[0].id;
    } catch {
      return true;
    }
  });

  // AI Chat Agent state
  const [messages, setMessages] = useState<ChatMsg[]>(() => [
    {
      id: "welcome",
      role: "assistant",
      text: "Hi! I'm the GAMAT Fx AI Assistant. Ask me about courses, mentorship, streaks, certificate verification, or careers.",
    },
  ]);
  const [chatInput, setChatInput] = useState("");
  const [escalated, setEscalated] = useState(false);
  const chatEndRef = useRef<HTMLDivElement | null>(null);

  // Feedback form state
  const [feedbackTitle, setFeedbackTitle] = useState("");
  const [feedbackBody, setFeedbackBody] = useState("");
  const [feedbackSent, setFeedbackSent] = useState(false);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, tab, open]);

  if (externalUserJotId) return null;

  const firstName = user?.firstName?.trim() || "Trader";
  const openCoursesCount = COURSES.length;

  const filteredArticles = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return HELP_ARTICLES;
    return HELP_ARTICLES.filter(
      (a) => a.q.toLowerCase().includes(q) || a.a.toLowerCase().includes(q)
    );
  }, [searchQuery]);

  const markUpdatesSeen = () => {
    setHasUnreadUpdate(false);
    try {
      localStorage.setItem(LAST_SEEN_UPDATE_KEY, CHANGELOG_UPDATES[0].id);
    } catch {}
  };

  const handleOpenTab = (next: WidgetTab) => {
    setTab(next);
    if (next === "whatsnew") markUpdatesSeen();
  };

  const generateAiReply = (prompt: string): Omit<ChatMsg, "id" | "role"> => {
    const q = prompt.toLowerCase();
    if (q.includes("cert") || q.includes("verify") || q.includes("gmx")) {
      return {
        text: "You can verify any GAMAT Fx Course Certificate (GMX-...) or Volunteer Fellowship Certificate (GMX-FEL-...) on our public Verification Portal.",
        actionLabel: "Open Verify Certificate",
        actionTo: "/verify-certificate",
      };
    }
    if (q.includes("streak") || q.includes("badge") || q.includes("flame") || q.includes("fun")) {
      return {
        text: "Daily Streaks track your active days across Fun Zone games, completed lessons, and Forum posts. They sync automatically across devices and unlock 7 badge tiers up to Legend!",
        actionLabel: "Open Fun Zone",
        actionTo: "/fun",
      };
    }
    if (q.includes("job") || q.includes("career") || q.includes("fellow") || q.includes("intern") || q.includes("apply")) {
      return {
        text: "Our Careers & Fellowship tracks are open across Dev & IT, Trading & Analysis, Design, Marketing, Support, and Writing. You can upload a PDF/DOCX CV and track status in My Applications.",
        actionLabel: "Explore Opportunities",
        actionTo: "/jobs/opportunities",
      };
    }
    if (q.includes("course") || q.includes("mentor") || q.includes("learn") || q.includes("price") || q.includes("enroll")) {
      return {
        text: `We currently offer ${openCoursesCount} structured trading courses covering Forex Foundations, Smart Money Concepts, and Risk Management, plus 1-on-1 mentorship.`,
        actionLabel: "Browse Courses",
        actionTo: "/courses",
      };
    }
    if (q.includes("affiliate") || q.includes("refer") || q.includes("commission") || q.includes("withdraw") || q.includes("payout")) {
      return {
        text: "Generate your Ambassador Card and referral code inside your Student Dashboard. Track clicks, signups, and payouts directly from your Affiliate tab.",
        actionLabel: "Open Dashboard",
        actionTo: "/dashboard",
      };
    }
    if (q.includes("human") || q.includes("support") || q.includes("agent") || q.includes("help")) {
      return {
        text: "Got it! Click 'Send to Human Support' below to forward your question directly to our team, or visit our Contact page.",
        actionLabel: "Contact Page",
        actionTo: "/contact",
      };
    }
    return {
      text: "I can help with courses, mentorship, certificate verification, daily streaks, affiliate payouts, or careers & fellowships. What would you like to check?",
    };
  };

  const handleSendChat = (textOverride?: string) => {
    const raw = (textOverride ?? chatInput).trim();
    if (!raw) return;
    const userMsg: ChatMsg = { id: `u_${Date.now()}`, role: "user", text: raw };
    const reply = generateAiReply(raw);
    const botMsg: ChatMsg = {
      id: `a_${Date.now() + 1}`,
      role: "assistant",
      ...reply,
    };
    setMessages((prev) => [...prev, userMsg, botMsg]);
    if (!textOverride) setChatInput("");
    setEscalated(false);
  };

  const handleEscalateToSupport = () => {
    const summary = messages
      .filter((m) => m.role === "user")
      .map((m) => m.text)
      .slice(-3)
      .join(" | ");
    submitEnquiry({
      serviceSlug: "ai-chat-support",
      serviceTitle: "AI Chat Support Escalation",
      name: user ? `${user.firstName} ${user.lastName}`.trim() : "Website Visitor",
      email: user?.email || "visitor@gamatfxacademy.com",
      phone: user?.phone || "-",
      message: summary || "Requested human support via AI Chat Widget.",
    });
    setEscalated(true);
    setMessages((prev) => [
      ...prev,
      {
        id: `sys_${Date.now()}`,
        role: "assistant",
        text: "Sent to our support team! We've logged your request and will follow up shortly.",
      },
    ]);
  };

  const handleFeedbackSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!feedbackTitle.trim() && !feedbackBody.trim()) return;
    submitEnquiry({
      serviceSlug: "sys_user_feedback",
      serviceTitle: "Product Feedback",
      name: user ? `${user.firstName} ${user.lastName}`.trim() : "Community Member",
      email: user?.email || "feedback@gamatfxacademy.com",
      phone: "-",
      message: `${feedbackTitle.trim()}${feedbackBody.trim() ? ` — ${feedbackBody.trim()}` : ""}`,
    });
    setFeedbackTitle("");
    setFeedbackBody("");
    setFeedbackSent(true);
    window.setTimeout(() => setFeedbackSent(false), 3500);
  };

  return (
    <>
      {/* Floating Launcher Button */}
      <button
        type="button"
        onClick={() => {
          const next = !open;
          setOpen(next);
          if (next && tab === "whatsnew") markUpdatesSeen();
        }}
        aria-label={open ? "Close assistant and updates" : "Open AI assistant and What's New"}
        className="fixed bottom-4 right-4 sm:bottom-5 sm:right-5 z-40 inline-flex items-center gap-2 rounded-full bg-brand px-4 py-3 text-xs font-extrabold text-white shadow-[0_12px_32px_rgba(220,53,69,0.45)] transition hover:scale-105 hover:bg-brand-dark active:scale-95 cursor-pointer"
      >
        {open ? <X className="h-4 w-4" /> : <MessageCircle className="h-4 w-4" />}
        <span className="hidden sm:inline">{open ? "Close" : "Help & Updates"}</span>
        {!open && hasUnreadUpdate && (
          <span className="h-2.5 w-2.5 rounded-full bg-emerald-400 ring-2 ring-white animate-pulse" />
        )}
      </button>

      {/* Widget Panel */}
      {open && (
        <div
          role="dialog"
          aria-label="GAMAT Fx Assistant and What's New"
          className="fixed inset-x-3 bottom-20 sm:inset-x-auto sm:right-5 sm:bottom-20 z-50 flex h-[76dvh] max-h-[600px] sm:w-[390px] flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white text-slate-900 shadow-2xl"
        >
          {/* TAB 1: HOME (Matches screenshot 2 style) */}
          {tab === "home" && (
            <div className="flex flex-1 flex-col overflow-y-auto bg-slate-50">
              {/* Branded Greeting Header */}
              <div className="relative bg-gradient-to-br from-[#83141f] via-[#b02a37] to-[#dc3545] px-5 pb-12 pt-5 text-white">
                <div className="flex items-center justify-between">
                  <div className="flex items-center -space-x-2">
                    <span className="flex h-9 w-9 items-center justify-center rounded-full border-2 border-white/25 bg-slate-950 text-xs font-black text-white">
                      G
                    </span>
                    <span className="flex h-9 w-9 items-center justify-center rounded-full border-2 border-white/25 bg-slate-900 text-xs font-black text-rose-300">
                      AI
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setOpen(false)}
                    aria-label="Close"
                    className="rounded-full p-1.5 text-white/80 hover:bg-white/15 hover:text-white cursor-pointer"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>

                <h2 className="mt-5 font-display text-2xl font-extrabold leading-tight">
                  Hi {firstName} 👋
                  <br />
                  How can we help?
                </h2>
              </div>

              <div className="-mt-7 space-y-3 px-4 pb-4">
                {/* Send us a message CTA */}
                <button
                  type="button"
                  onClick={() => handleOpenTab("messages")}
                  className="flex w-full items-center justify-between rounded-2xl border border-slate-200 bg-white px-4 py-3.5 text-left shadow-sm transition hover:border-brand/40 hover:shadow-md cursor-pointer"
                >
                  <div>
                    <p className="text-sm font-bold text-slate-900">Send us a message</p>
                    <p className="text-xs text-slate-500">Ask our AI agent or reach support</p>
                  </div>
                  <Send className="h-4 w-4 text-brand" />
                </button>

                {/* What's New quick banner */}
                <button
                  type="button"
                  onClick={() => handleOpenTab("whatsnew")}
                  className="flex w-full items-center justify-between rounded-2xl border border-slate-200 bg-white px-4 py-3 text-left shadow-sm transition hover:border-brand/40 cursor-pointer"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                      <Gift className="h-4 w-4" />
                    </span>
                    <div>
                      <p className="text-xs font-extrabold text-slate-900 flex items-center gap-1.5">
                        What&apos;s New
                        {hasUnreadUpdate && (
                          <span className="rounded-full bg-emerald-500 px-1.5 py-0.5 text-[9px] font-black text-white">
                            NEW
                          </span>
                        )}
                      </p>
                      <p className="text-[11px] text-slate-500 line-clamp-1">
                        {mergedUpdates[0].title}
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="h-4 w-4 text-slate-400" />
                </button>

                {/* Search for help card */}
                <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                  {selectedArticle ? (
                    <div className="p-4">
                      <button
                        type="button"
                        onClick={() => setSelectedArticle(null)}
                        className="inline-flex items-center gap-1 text-xs font-bold text-brand hover:underline cursor-pointer"
                      >
                        <ChevronLeft className="h-3.5 w-3.5" /> All help topics
                      </button>
                      <h3 className="mt-2.5 text-sm font-extrabold text-slate-900">
                        {selectedArticle.q}
                      </h3>
                      <p className="mt-2 text-xs leading-relaxed text-slate-600">
                        {selectedArticle.a}
                      </p>
                      {selectedArticle.actionTo && (
                        <button
                          type="button"
                          onClick={() => {
                            setOpen(false);
                            navigate(selectedArticle.actionTo!);
                          }}
                          className="mt-3 inline-flex items-center gap-1 rounded-full bg-brand px-3.5 py-1.5 text-xs font-bold text-white hover:bg-brand-dark cursor-pointer"
                        >
                          {selectedArticle.actionLabel}
                          <ArrowUpRight className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </div>
                  ) : (
                    <>
                      <div className="flex items-center gap-2 border-b border-slate-100 px-3.5 py-2.5">
                        <input
                          type="text"
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          placeholder="Search for help"
                          className="w-full bg-transparent text-xs font-medium text-slate-800 placeholder:text-slate-400 outline-none"
                        />
                        <Search className="h-4 w-4 shrink-0 text-slate-500" />
                      </div>
                      <div className="divide-y divide-slate-100">
                        {filteredArticles.length > 0 ? (
                          filteredArticles.map((art) => (
                            <button
                              key={art.id}
                              type="button"
                              onClick={() => setSelectedArticle(art)}
                              className="flex w-full items-center justify-between gap-2 px-4 py-3 text-left text-xs font-medium text-slate-700 hover:bg-slate-50 cursor-pointer"
                            >
                              <span>{art.q}</span>
                              <ChevronRight className="h-3.5 w-3.5 shrink-0 text-slate-400" />
                            </button>
                          ))
                        ) : (
                          <p className="px-4 py-4 text-xs text-slate-400">
                            No matching articles. Try asking our AI agent in Messages!
                          </p>
                        )}
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: AI CHAT AGENT */}
          {tab === "messages" && (
            <div className="flex flex-1 flex-col overflow-hidden bg-slate-50">
              <div className="flex items-center justify-between border-b border-slate-200 bg-white px-4 py-3">
                <div className="flex items-center gap-2.5">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-brand text-white">
                    <Bot className="h-4 w-4" />
                  </span>
                  <div>
                    <p className="text-xs font-extrabold text-slate-900">
                      GAMAT Fx AI Agent
                    </p>
                    <p className="text-[10px] font-semibold text-emerald-600">
                      Online · Instant Answers
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  aria-label="Close"
                  className="rounded-full p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 cursor-pointer"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="flex-1 space-y-3 overflow-y-auto p-4">
                {messages.map((m) => (
                  <div
                    key={m.id}
                    className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-xs leading-relaxed ${
                        m.role === "user"
                          ? "bg-brand text-white rounded-br-sm"
                          : "border border-slate-200 bg-white text-slate-800 rounded-bl-sm shadow-2xs"
                      }`}
                    >
                      <p>{m.text}</p>
                      {m.actionTo && (
                        <button
                          type="button"
                          onClick={() => {
                            setOpen(false);
                            navigate(m.actionTo!);
                          }}
                          className="mt-2 inline-flex items-center gap-1 rounded-full bg-slate-900 px-3 py-1 text-[11px] font-bold text-white hover:bg-brand cursor-pointer"
                        >
                          {m.actionLabel}
                          <ArrowUpRight className="h-3 w-3" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
                <div ref={chatEndRef} />
              </div>

              {/* Quick suggestion chips */}
              <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar border-t border-slate-100 bg-white px-3 py-2">
                {[
                  "Verify a certificate",
                  "Daily streaks",
                  "Open fellowships",
                  "Courses & pricing",
                ].map((chip) => (
                  <button
                    key={chip}
                    type="button"
                    onClick={() => handleSendChat(chip)}
                    className="shrink-0 rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-[11px] font-semibold text-slate-700 hover:border-brand/40 hover:text-brand cursor-pointer"
                  >
                    {chip}
                  </button>
                ))}
                {!escalated && messages.some((m) => m.role === "user") && (
                  <button
                    type="button"
                    onClick={handleEscalateToSupport}
                    className="shrink-0 rounded-full bg-slate-900 px-2.5 py-1 text-[11px] font-bold text-white hover:bg-brand cursor-pointer"
                  >
                    Send to Human Support
                  </button>
                )}
              </div>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendChat();
                }}
                className="flex items-center gap-2 border-t border-slate-200 bg-white p-3"
              >
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  placeholder="Ask anything about GAMAT Fx..."
                  className="flex-1 rounded-full border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs text-slate-900 placeholder:text-slate-400 outline-none focus:border-brand"
                />
                <button
                  type="submit"
                  aria-label="Send message"
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand text-white hover:bg-brand-dark cursor-pointer"
                >
                  <Send className="h-3.5 w-3.5" />
                </button>
              </form>
            </div>
          )}

          {/* TAB 3: WHAT'S NEW (Matches screenshot 1 UserJot style) */}
          {tab === "whatsnew" && (
            <div className="flex flex-1 flex-col overflow-hidden bg-white">
              <div className="flex items-start justify-between border-b border-slate-100 px-5 pb-3 pt-4">
                <div>
                  <h2 className="font-display text-xl font-extrabold text-slate-900">
                    What&apos;s New
                  </h2>
                  <p className="text-xs text-slate-500">
                    Latest updates and improvements
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  aria-label="Close"
                  className="rounded-full border border-slate-200 p-1.5 text-slate-500 hover:bg-slate-100 cursor-pointer"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Sub-nav: Updates / Roadmap / Feedback */}
              <div className="grid grid-cols-3 border-b border-slate-100 bg-slate-50/60 text-[11px] font-bold">
                {(
                  [
                    { id: "updates", label: "Updates", icon: Gift },
                    { id: "roadmap", label: "Roadmap", icon: Map },
                    { id: "feedback", label: "Feedback", icon: MessageSquare },
                  ] as const
                ).map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => setWhatsNewSub(s.id)}
                    className={`flex items-center justify-center gap-1.5 py-2.5 transition cursor-pointer ${
                      whatsNewSub === s.id
                        ? "border-b-2 border-brand text-slate-900 bg-white"
                        : "text-slate-500 hover:text-slate-800"
                    }`}
                  >
                    <s.icon className="h-3.5 w-3.5" />
                    {s.label}
                  </button>
                ))}
              </div>

              <div className="flex-1 overflow-y-auto p-5">
                {whatsNewSub === "updates" && (
                  <div className="relative space-y-6 border-l border-dashed border-slate-200 pl-4">
                    {mergedUpdates.map((entry) => (
                      <div key={entry.id} className="relative">
                        <span
                          className={`absolute -left-[21px] top-1 h-2.5 w-2.5 rounded-full ring-4 ring-white ${
                            entry.isNew ? "bg-emerald-500" : "bg-slate-900"
                          }`}
                        />
                        <div className="flex items-center gap-2 text-[11px] font-bold tracking-wider text-slate-500">
                          <span>{entry.date}</span>
                          {entry.isNew && (
                            <span className="text-emerald-600">• NEW</span>
                          )}
                        </div>
                        <h3 className="mt-1 font-display text-base font-extrabold text-slate-900">
                          {entry.title}
                        </h3>
                        <p className="mt-1 text-xs leading-relaxed text-slate-600">
                          {entry.summary}
                        </p>

                        <button
                          type="button"
                          onClick={() => {
                            if (entry.to) {
                              setOpen(false);
                              navigate(entry.to);
                            }
                          }}
                          className={`mt-3 block w-full overflow-hidden rounded-2xl border border-slate-200 bg-gradient-to-br ${entry.gradient} p-4 text-left transition hover:shadow-md cursor-pointer`}
                        >
                          <span className="text-[10px] font-extrabold uppercase tracking-wider text-brand">
                            {entry.tag}
                          </span>
                          <p className="mt-1 font-display text-sm font-extrabold text-slate-900">
                            {entry.previewTitle}
                          </p>
                          <p className="mt-0.5 text-[11px] text-slate-600">
                            {entry.previewSubtitle}
                          </p>
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {whatsNewSub === "roadmap" && (
                  <div className="space-y-3">
                    {ROADMAP_ITEMS.map((item) => (
                      <div
                        key={item.title}
                        className="rounded-2xl border border-slate-200 bg-slate-50/70 p-3.5"
                      >
                        <span
                          className={`inline-block rounded-full px-2 py-0.5 text-[10px] font-extrabold ${item.color}`}
                        >
                          {item.status}
                        </span>
                        <h4 className="mt-2 text-xs font-extrabold text-slate-900">
                          {item.title}
                        </h4>
                        <p className="mt-1 text-[11px] leading-relaxed text-slate-600">
                          {item.desc}
                        </p>
                      </div>
                    ))}
                  </div>
                )}

                {whatsNewSub === "feedback" && (
                  <form onSubmit={handleFeedbackSubmit} className="space-y-3">
                    <p className="text-xs text-slate-600">
                      Have a feature request or spotted something to improve? Send it directly to the GAMAT Fx team.
                    </p>
                    <input
                      type="text"
                      value={feedbackTitle}
                      onChange={(e) => setFeedbackTitle(e.target.value)}
                      placeholder="Short summary..."
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-900 outline-none focus:border-brand"
                      required
                    />
                    <textarea
                      rows={4}
                      value={feedbackBody}
                      onChange={(e) => setFeedbackBody(e.target.value)}
                      placeholder="Tell us more details..."
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-900 outline-none focus:border-brand"
                    />
                    <button
                      type="submit"
                      className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-brand py-2.5 text-xs font-bold text-white hover:bg-brand-dark cursor-pointer"
                    >
                      Submit Feedback
                    </button>
                    {feedbackSent && (
                      <p className="flex items-center gap-1.5 text-xs font-semibold text-emerald-600">
                        <CheckCircle2 className="h-4 w-4" /> Thanks! Your feedback has been submitted.
                      </p>
                    )}
                  </form>
                )}
              </div>
            </div>
          )}

          {/* Bottom 3-Tab Navigation Bar */}
          <nav className="grid grid-cols-3 border-t border-slate-200 bg-white">
            <button
              type="button"
              onClick={() => handleOpenTab("home")}
              className={`flex flex-col items-center justify-center gap-0.5 py-2.5 text-[11px] font-bold transition cursor-pointer ${
                tab === "home" ? "text-slate-900" : "text-slate-400 hover:text-slate-700"
              }`}
            >
              <Home className="h-4 w-4" />
              <span>Home</span>
            </button>
            <button
              type="button"
              onClick={() => handleOpenTab("messages")}
              className={`flex flex-col items-center justify-center gap-0.5 py-2.5 text-[11px] font-bold transition cursor-pointer ${
                tab === "messages" ? "text-slate-900" : "text-slate-400 hover:text-slate-700"
              }`}
            >
              <MessageSquare className="h-4 w-4" />
              <span>Messages</span>
            </button>
            <button
              type="button"
              onClick={() => handleOpenTab("whatsnew")}
              className={`relative flex flex-col items-center justify-center gap-0.5 py-2.5 text-[11px] font-bold transition cursor-pointer ${
                tab === "whatsnew" ? "text-slate-900" : "text-slate-400 hover:text-slate-700"
              }`}
            >
              <HelpCircle className="h-4 w-4" />
              <span>What&apos;s New</span>
              {hasUnreadUpdate && (
                <span className="absolute right-8 top-2 h-2 w-2 rounded-full bg-emerald-500" />
              )}
            </button>
          </nav>
        </div>
      )}
    </>
  );
}
