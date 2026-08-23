import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { COURSES, getCourse, totalLessons } from "./courses";
import { fetchSupabaseCourses, saveSupabaseCourse, deleteSupabaseCourse } from "./supabaseCourses";
import { signUpSupabaseUser, signInSupabaseUser, signOutSupabaseUser, fetchSupabaseAccounts, saveSupabaseAccount, deleteSupabaseAccount } from "./supabaseAuth";
import {
  fetchSupabaseEnrollments, saveSupabaseEnrollment, deleteSupabaseEnrollment,
  fetchSupabasePayments, saveSupabasePayment, deleteSupabasePayment,
  fetchSupabaseEvents, saveSupabaseEvent, deleteSupabaseEvent,
  fetchSupabaseRegistrations, saveSupabaseRegistration,
  fetchSupabaseThreads, saveSupabaseThread, deleteSupabaseThread,
  fetchSupabaseReplies, saveSupabaseReply, deleteSupabaseReply,
  fetchSupabaseClubs, fetchSupabaseClubMessages,
  fetchSupabaseNews, saveSupabaseNews, deleteSupabaseNews,
  fetchSupabaseOutlooks, saveSupabaseOutlook, deleteSupabaseOutlook,
  fetchSupabaseEnquiries, saveSupabaseEnquiry,
  fetchSupabaseCoupons,
  fetchSupabaseGiveaways,
  fetchSupabaseSOTW, saveSupabaseSOTW,
  fetchSupabaseReviews, saveSupabaseReview,
} from "./supabaseServices";
import { seedSupabaseDatabaseIfEmpty, subscribeToSupabaseRealtime } from "./supabaseSync";
import { getQuiz } from "./quizzes";
import { SCENARIOS, pointsFor, outcomeOf, type CombatPrediction } from "./combat";

/* ================================ Types ================================ */

export type Role = "student" | "staff" | "admin";

/** Staff seniority. Higher levels inherit everything below them. */
export type StaffLevel = "author" | "editor" | "manager";

export type Permission =
  | "posts:write"       // create & edit their OWN drafts
  | "posts:publish"     // publish / unpublish any post
  | "posts:manage"      // edit & delete ANY post
  | "events:manage"
  | "enquiries:manage"
  | "registrations:manage"
  | "students:manage"
  | "courses:manage"
  | "payments:manage"
  | "settings:manage";

export const LEVEL_PERMISSIONS: Record<StaffLevel, Permission[]> = {
  author: ["posts:write"],
  editor: ["posts:write", "posts:publish", "posts:manage"],
  manager: [
    "posts:write", "posts:publish", "posts:manage",
    "events:manage", "enquiries:manage", "registrations:manage",
  ],
};

export const ALL_PERMISSIONS: Permission[] = [
  "posts:write", "posts:publish", "posts:manage", "events:manage",
  "enquiries:manage", "registrations:manage", "students:manage",
  "courses:manage", "payments:manage", "settings:manage",
];

export const LEVEL_LABELS: Record<StaffLevel, string> = {
  author: "Author — writes drafts only",
  editor: "Editor — writes & publishes posts",
  manager: "Manager — posts, events & enquiries",
};

export type Account = {
  id: string;
  firstName: string;
  /** Optional. */
  middleName?: string;
  lastName: string;
  email: string;
  password: string;
  phone?: string;
  country?: string;
  bio?: string;
  /** Base64 data URL of the uploaded profile picture. */
  avatar?: string;
  nickname?: string;
  /** ISO yyyy-mm-dd. The YEAR is private to the owner and admins. */
  birthday?: string;
  role: Role;
  /** Only meaningful when role === "staff". */
  staffLevel?: StaffLevel;
  /** Extra permissions granted on top of the level. */
  extraPermissions?: Permission[];
  jobTitle?: string;
  status: "active" | "suspended";
  joined: string;
};

/* --------------------------- Quiz attempts --------------------------- */

export type QuizAttempt = {
  id: string;
  userId: string;
  courseId: string;
  score: number;      // percentage
  correct: number;
  total: number;
  passed: boolean;
  answers: Record<string, number>;
  createdAt: string;
};

/* ------------------------- Staff blog posts ------------------------- */

export type StaffPost = {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  body: string;
  image?: string;
  tags: string[];
  authorId: string;
  authorName: string;
  status: "draft" | "pending" | "published";
  createdAt: string;
  updatedAt: string;
};

/* --------------------------- Market updates --------------------------- */

export type NewsItem = {
  id: string;
  title: string;
  summary: string;
  body: string;
  source?: string;
  impact: "low" | "medium" | "high";
  pair?: string;
  status: "draft" | "published";
  authorId?: string;
  authorName?: string;
  image?: string;
  publishedAt: string;
  createdAt: string;
};

export type OutlookItem = {
  id: string;
  date: string; // yyyy-mm-dd
  title: string;
  bias: "bullish" | "bearish" | "neutral" | "mixed";
  pairs: string[];
  summary: string;
  body: string;
  levels?: string;
  status: "draft" | "published";
  authorId?: string;
  authorName?: string;
  createdAt: string;
};

/* ------------------------ Admin-managed courses ------------------------ */

export type ManagedLesson = {
  id: string;
  title: string;
  duration: string;
  /** Remote URL and/or local data-URL / object URL uploaded in-browser. */
  videoUrl?: string;
  videoFileName?: string;
  free?: boolean;
};

export type ManagedModule = {
  id: string;
  title: string;
  lessons: ManagedLesson[];
};

/* --------------------------- Market Combat --------------------------- */

export type CombatStats = {
  xp: number;
  wins: number;
  losses: number;
  streak: number;
  bestStreak: number;
  predictions: import("./combat").CombatPrediction[];
};

/* ------------------------------ Giveaways ------------------------------ */

export type GiveawayWinner = {
  userId?: string;
  name: string;
  nickname?: string;
  avatar?: string;
  note?: string;
};

export type Giveaway = {
  id: string;
  title: string;
  summary: string;
  body: string;
  reward: string;
  image?: string;
  taggedClubId?: string;
  taggedClubName?: string;
  status: "draft" | "published";
  winners: GiveawayWinner[];
  announcedAt: string;
  createdAt: string;
  authorId?: string;
  authorName?: string;
};

/* ----------------------------- Club Messages ----------------------------- */

export type ClubMessage = {
  id: string;
  clubId: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  userRole: "lead" | "member";
  content: string;
  image?: string;
  likes: string[];
  dislikes: string[];
  emojis: Record<string, string[]>;
  replyToId?: string;
  replyToName?: string;
  createdAt: string;
};

export const SEED_CLUB_MESSAGES: ClubMessage[] = [
  {
    id: "cm_1",
    clubId: "club_apex",
    userId: "tm_tonye",
    userName: "Tonye S. Taylor",
    userAvatar: "/images/team-tonye.jpg",
    userRole: "lead",
    content: "Team, EURUSD has just swept the London Open high liquidity pool at 1.0845. Watch for a clean 15m Fair Value Gap rejection before we enter short positions.",
    image: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&w=800&q=80",
    likes: ["u_demo_1", "u_demo_2", "u_demo_3"],
    dislikes: [],
    emojis: { "🚀": ["u_demo_1", "u_demo_2"], "🎯": ["u_demo_3"] },
    createdAt: "2026-08-13T10:15:00Z",
  },
  {
    id: "cm_2",
    clubId: "club_apex",
    userId: "u_demo_1",
    userName: "Kelechi Okafor",
    userAvatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80",
    userRole: "member",
    content: "Spot on Tonye! I caught the 1:3 RRR drop down to 1.0810. Execution aligned perfectly with our London session plan.",
    likes: ["tm_tonye", "u_demo_2"],
    dislikes: [],
    emojis: { "🔥": ["tm_tonye", "u_demo_4"], "👏": ["u_demo_2"] },
    replyToId: "cm_1",
    replyToName: "Tonye S. Taylor",
    createdAt: "2026-08-13T10:45:00Z",
  },
  {
    id: "cm_3",
    clubId: "club_satoshi",
    userId: "tm_amara",
    userName: "Amara Okonkwo",
    userAvatar: "/images/team-amara.jpg",
    userRole: "lead",
    content: "Bitcoin on-chain metrics show miners accumulating. Keep eyes on the $62,500 key support zone ahead of the weekly close.",
    likes: ["u_demo_7", "u_demo_8"],
    dislikes: [],
    emojis: { "📈": ["u_demo_7"], "💎": ["u_demo_8"] },
    createdAt: "2026-08-12T15:30:00Z",
  },
];

/* ------------------------------- Coupons ------------------------------- */

export type Coupon = {
  id: string;
  code: string;
  discountPercent: number;
  maxUses: number;
  usedCount: number;
  expiryDate?: string;
  applicableTo: "all" | "courses" | "services" | "events";
  status: "active" | "disabled";
  createdAt: string;
};

export const SEED_COUPONS: Coupon[] = [
  {
    id: "cp_1",
    code: "WELCOME10",
    discountPercent: 10,
    maxUses: 500,
    usedCount: 34,
    expiryDate: "2026-12-31",
    applicableTo: "all",
    status: "active",
    createdAt: "2026-08-01T00:00:00Z",
  },
  {
    id: "cp_2",
    code: "GAMATVIP20",
    discountPercent: 20,
    maxUses: 100,
    usedCount: 18,
    expiryDate: "2026-10-31",
    applicableTo: "courses",
    status: "active",
    createdAt: "2026-08-05T00:00:00Z",
  },
  {
    id: "cp_3",
    code: "DESK50",
    discountPercent: 50,
    maxUses: 50,
    usedCount: 5,
    expiryDate: "2026-12-31",
    applicableTo: "services",
    status: "active",
    createdAt: "2026-08-10T00:00:00Z",
  },
];

/* ---------------------------- Public team ---------------------------- */

export type TeamProfile = {
  id: string;
  /** Optional link to a staff/admin account that submitted a bio. */
  userId?: string;
  slug: string;
  name: string;
  role: string;
  focus: string;
  bio: string;
  longBio: string;
  expertise: string[];
  milestones: { year: string; title: string; body: string }[];
  avatar?: string;
  order: number;
  published: boolean;
  updatedAt: string;
  createdAt: string;
};

/** Bio draft submitted by a team member from their dashboard. */
export type TeamBioSubmission = {
  id: string;
  userId: string;
  name: string;
  email: string;
  role: string;
  focus: string;
  bio: string;
  longBio: string;
  expertiseText: string;
  milestonesText: string;
  avatar?: string;
  status: "pending" | "approved" | "rejected";
  createdAt: string;
  reviewedAt?: string;
};

/* ----------------------------- Trading Clubs ----------------------------- */

export type ClubMember = {
  userId: string;
  name: string;
  nickname?: string;
  avatar?: string;
  role: "lead" | "member";
  joinedAt: string;
};

export type TradingClub = {
  id: string;
  name: string;
  tagline: string;
  description: string;
  focus: string;
  emblem: string;
  color: string;
  leaderId: string;
  leaderName: string;
  leaderAvatar?: string;
  maxMembers: 10;
  members: ClubMember[];
  createdAt: string;
};

export const SEED_CLUBS: TradingClub[] = [
  {
    id: "club_apex",
    name: "Apex Scalpers Guild",
    tagline: "High-frequency precision on London & NY Open sessions",
    description: "A tight-knit collective of price-action scalpers focused on EURUSD, GBPUSD, and Gold. We trade live together and enforce strict 1:3 RRR discipline.",
    focus: "Scalping & Price Action",
    emblem: "Zap",
    color: "#dc3545",
    leaderId: "tm_tonye",
    leaderName: "Tonye S. Taylor",
    leaderAvatar: "/images/team-tonye.jpg",
    maxMembers: 10,
    members: [
      { userId: "tm_tonye", name: "Tonye S. Taylor", role: "lead", joinedAt: "2026-01-10T08:00:00Z" },
      { userId: "u_demo_1", name: "Kelechi Okafor", role: "member", joinedAt: "2026-01-15T10:30:00Z" },
      { userId: "u_demo_2", name: "Sarah Jenkins", role: "member", joinedAt: "2026-01-20T14:15:00Z" },
      { userId: "u_demo_3", name: "David Alabi", role: "member", joinedAt: "2026-02-01T09:00:00Z" },
      { userId: "u_demo_4", name: "Fatima Bello", role: "member", joinedAt: "2026-02-05T11:45:00Z" },
      { userId: "u_demo_5", name: "Michael Chen", role: "member", joinedAt: "2026-02-10T16:20:00Z" },
      { userId: "u_demo_6", name: "Emmanuel Vance", role: "member", joinedAt: "2026-02-12T13:00:00Z" },
    ],
    createdAt: "2026-01-10T08:00:00Z",
  },
  {
    id: "club_satoshi",
    name: "Satoshi Pioneers",
    tagline: "Navigating Crypto liquidity, Bitcoin halving cycles & DeFi",
    description: "Dedicated to analyzing macro crypto trends, Bitcoin supply dynamics, and emerging altcoin structures. We share weekly on-chain insights.",
    focus: "Crypto & On-Chain",
    emblem: "Coins",
    color: "#f59e0b",
    leaderId: "tm_amara",
    leaderName: "Amara Okonkwo",
    leaderAvatar: "/images/team-amara.jpg",
    maxMembers: 10,
    members: [
      { userId: "tm_amara", name: "Amara Okonkwo", role: "lead", joinedAt: "2026-01-12T09:00:00Z" },
      { userId: "u_demo_7", name: "Tunde Bakare", role: "member", joinedAt: "2026-01-18T15:00:00Z" },
      { userId: "u_demo_8", name: "Chloe Adams", role: "member", joinedAt: "2026-01-25T11:20:00Z" },
      { userId: "u_demo_9", name: "Ibrahim Sani", role: "member", joinedAt: "2026-02-02T10:10:00Z" },
    ],
    createdAt: "2026-01-12T09:00:00Z",
  },
  {
    id: "club_bretton",
    name: "Bretton Macro Syndicate",
    tagline: "Central bank interest rates, inflation data & swing positioning",
    description: "Focuses on high-tier fundamental drivers — NFP, CPI, interest rate differentials, and global macroeconomic shifts.",
    focus: "Fundamental & Swing",
    emblem: "Landmark",
    color: "#10b981",
    leaderId: "tm_chima",
    leaderName: "Chima Nwadike",
    leaderAvatar: "/images/team-chima.jpg",
    maxMembers: 10,
    members: [
      { userId: "tm_chima", name: "Chima Nwadike", role: "lead", joinedAt: "2026-01-14T10:00:00Z" },
      { userId: "u_demo_10", name: "Grace Danjuma", role: "member", joinedAt: "2026-01-22T16:30:00Z" },
      { userId: "u_demo_11", name: "Victor Eze", role: "member", joinedAt: "2026-02-04T12:00:00Z" },
    ],
    createdAt: "2026-01-14T10:00:00Z",
  },
];

export type ManagedCourse = {
  id: string;
  title: string;
  short: string;
  desc: string;
  tag: string;
  level: string;
  duration: string;
  price: number;
  oldPrice?: number;
  poster?: string;
  video?: string;
  /** Lucide icon key used on listings. */
  icon?: string;
  /** Hex or tailwind-friendly colour for the icon tile. */
  iconColor?: string;
  outcomes: string[];
  requirements: string[];
  modules: ManagedModule[];
  published: boolean;
  featured?: boolean;
  createdAt: string;
  updatedAt: string;
};

export type ServiceEnquiry = {
  id: string;
  ref: string;
  serviceSlug: string;
  serviceTitle: string;
  packageName?: string;
  name: string;
  email: string;
  phone: string;
  company?: string;
  budget?: string;
  message: string;
  userId?: string;
  status: "new" | "contacted" | "closed";
  createdAt: string;
};

export type StudentOfTheWeek = {
  id: string;
  studentId?: string;
  studentName: string;
  avatar?: string;
  track: string;
  weekPeriod: string;
  winRate: string;
  quizXP: string;
  combatRank: string;
  weeklyReturn: string;
  performanceReview: string;
  mentorQuote?: string;
  createdAt: string;
};

export const DEFAULT_STUDENT_OF_WEEK: StudentOfTheWeek = {
  id: "sotw_active",
  studentId: "u_demo_1",
  studentName: "Kelechi Okafor",
  avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80",
  track: "Advanced Technicals & Price Action",
  weekPeriod: "Week of August 10 – August 16, 2026",
  winRate: "91.2%",
  quizXP: "1,240 XP",
  combatRank: "Apex Sovereign (Tier 7)",
  weeklyReturn: "+28.4% Return",
  performanceReview: "Kelechi demonstrated exceptional discipline during the London-NY session overlaps, executing 14 consecutive win trades on EURUSD and Gold with strict 1:3 RRR management. She also topped the Quiz Arcade leaderboard for two straight weeks.",
  mentorQuote: "Consistency isn't luck; it's adhering to your trading plan when emotion urges you to break rules. Kelechi nailed execution flawlessly.",
  createdAt: "2026-08-10T09:00:00Z",
};

export const SEED_SOTW_HISTORY: StudentOfTheWeek[] = [
  DEFAULT_STUDENT_OF_WEEK,
  {
    id: "sotw_past_1",
    studentId: "u_demo_2",
    studentName: "David Alabi",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=600&q=80",
    track: "Crypto & Macro Analysis",
    weekPeriod: "Week of August 03 – August 09, 2026",
    winRate: "86.0%",
    quizXP: "1,050 XP",
    combatRank: "Grandmaster (Tier 6)",
    weeklyReturn: "+19.8% Return",
    performanceReview: "David correctly anticipated the US Dollar index liquidity sweep ahead of NFP data, securing clean swing long positions on GBPUSD.",
    mentorQuote: "David's macro outlook research on the student forum was spot-on and helped his syndicate members position safely.",
    createdAt: "2026-08-03T09:00:00Z",
  },
  {
    id: "sotw_past_2",
    studentId: "u_demo_3",
    studentName: "Sarah Jenkins",
    avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=600&q=80",
    track: "Forex Foundations & Risk Control",
    weekPeriod: "Week of July 27 – August 02, 2026",
    winRate: "84.5%",
    quizXP: "960 XP",
    combatRank: "Master (Tier 5)",
    weeklyReturn: "+16.2% Return",
    performanceReview: "Sarah maintained a 100% pass mark across all foundation quizzes and demonstrated textbook risk-per-trade control under 1% total exposure.",
    mentorQuote: "Risk preservation is the first law of trading longevity. Sarah exemplifies our academy core values.",
    createdAt: "2026-07-27T09:00:00Z",
  },
];

/* ------------------------------- Student Reviews ------------------------------- */

export type ReviewItem = {
  id: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  userLocation: string;
  targetType: "course" | "mentorship" | "service" | "event";
  targetId: string;
  targetTitle: string;
  rating: number;
  comment: string;
  createdAt: string;
};

export const SEED_REVIEWS: ReviewItem[] = [
  {
    id: "rev_1",
    userId: "u_demo_1",
    userName: "Kelechi Okafor",
    userAvatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80",
    userLocation: "Lagos, Nigeria",
    targetType: "course",
    targetId: "price-action",
    targetTitle: "Price Action Mastery",
    rating: 5,
    comment: "The Market Structure & Order Block modules completely eliminated my guesswork on Gold. Joined the 100k funded challenge and passed in 2 weeks!",
    createdAt: "2026-08-10T10:00:00Z",
  },
  {
    id: "rev_2",
    userId: "u_demo_2",
    userName: "David Mensah",
    userAvatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=600&q=80",
    userLocation: "Accra, Ghana",
    targetType: "mentorship",
    targetId: "pro-trader",
    targetTitle: "Pro Trader Mentorship",
    rating: 5,
    comment: "The 1-on-1 weekly trade reviews with the lead mentors were life changing. Having a professional critique my entries corrected my over-leveraging habit.",
    createdAt: "2026-08-08T14:30:00Z",
  },
  {
    id: "rev_3",
    userId: "u_demo_3",
    userName: "Sarah Jenkins",
    userAvatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=600&q=80",
    userLocation: "London, UK",
    targetType: "service",
    targetId: "desk-execution",
    targetTitle: "Institutional Trading Blueprint",
    rating: 5,
    comment: "Outstanding institutional desk execution & macroeconomic insights. GAMAT's daily bias analysis aligns perfectly with London open volatility.",
    createdAt: "2026-08-05T09:15:00Z",
  },
  {
    id: "rev_4",
    userId: "u_demo_4",
    userName: "Emeka Nnamdi",
    userAvatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=600&q=80",
    userLocation: "Abuja, Nigeria",
    targetType: "event",
    targetId: "ev_1",
    targetTitle: "West Africa Forex Summit 2026",
    rating: 5,
    comment: "Attending the live workshop in Lagos was worth every penny. Live market breakdown on EURUSD and networking with top traders was top-notch.",
    createdAt: "2026-08-01T16:00:00Z",
  },
];

export type ActivityNotification = {
  id: string;
  type: "registration" | "payment" | "refund" | "article" | "team_bio" | "certificate";
  title: string;
  body: string;
  timestamp: string;
  link: string;
  read: boolean;
};

export type User = Omit<Account, "password">;

export type Enrollment = {
  id: string;
  userId: string;
  courseId: string;
  enrolledAt: string;
  completedLessons: string[];
  lastLessonId?: string;
};

export type Payment = {
  id: string;
  ref: string;
  userId: string;
  userName: string;
  userEmail: string;
  courseId: string;
  courseTitle: string;
  subtotal: number;
  vat: number;
  discount: number;
  amount: number;
  method: "card" | "transfer" | "ussd" | "manual";
  coupon?: string;
  status: "paid" | "pending" | "refunded" | "failed";
  createdAt: string;
};

export type EventItem = {
  id: string;
  title: string;
  description: string;
  type: "Physical" | "Online" | "Hybrid";
  month: string;
  day: string;
  year: string;
  time: string;
  location: string;
  capacity: number;
  price: number;
  status: "published" | "draft";
  featured?: boolean;
};

export type Registration = {
  id: string;
  eventId: string;
  eventTitle: string;
  eventDate: string;
  userId?: string;
  name: string;
  email: string;
  phone: string;
  ticket: string;
  status: "confirmed" | "cancelled";
  createdAt: string;
};

export type CourseSetting = { price?: number; published?: boolean };

/* ------------------------------ Forum ------------------------------ */

export type ForumChannel = {
  id: string;
  name: string;
  description: string;
  icon: "intro" | "questions" | "analysis" | "psychology" | "wins" | "resources";
};

export type ForumReply = {
  id: string;
  threadId: string;
  authorId: string;
  authorName: string;
  authorAvatar?: string;
  authorRole: Role;
  body: string;
  /** Optional image attached with the comment (data URL or remote URL). */
  image?: string;
  likes: string[];
  createdAt: string;
};

export type ForumThread = {
  id: string;
  channelId: string;
  title: string;
  body: string;
  /** Optional image attached with the original post. */
  image?: string;
  authorId: string;
  authorName: string;
  authorAvatar?: string;
  authorRole: Role;
  likes: string[];
  pinned?: boolean;
  createdAt: string;
};

export const FORUM_CHANNELS: ForumChannel[] = [
  { id: "introductions", name: "Introductions", description: "New here? Say hello and tell us where you're trading from.", icon: "intro" },
  { id: "ask-anything", name: "Ask Anything", description: "Stuck on a concept? No question is too basic.", icon: "questions" },
  { id: "chart-analysis", name: "Chart & Analysis", description: "Share your setups and get feedback from peers and mentors.", icon: "analysis" },
  { id: "psychology", name: "Mindset & Psychology", description: "Discipline, journaling and the mental side of trading.", icon: "psychology" },
  { id: "wins-losses", name: "Wins & Lessons", description: "Celebrate progress and share what a loss taught you.", icon: "wins" },
  { id: "resources", name: "Resources", description: "Books, tools, templates and useful links.", icon: "resources" },
];

const SEED_THREADS: ForumThread[] = [
  {
    id: "t_seed1", channelId: "introductions", title: "Welcome to the GAMAT Forum — start here 👋",
    body: "This is our student community space. A few ground rules:\n\n• Be respectful — everyone here started somewhere.\n• No signal selling, account management or referral links.\n• Ask real questions and share real charts.\n• Mentors check in daily, so tag your questions clearly.\n\nIntroduce yourself below: where are you trading from, how long have you been at it, and what are you working on right now?",
    authorId: "u_admin", authorName: "Tonye S. Taylor", authorRole: "admin",
    likes: [], pinned: true, createdAt: new Date(Date.now() - 864e5 * 12).toISOString(),
  },
  {
    id: "t_seed2", channelId: "ask-anything", title: "How many pairs should a beginner actually watch?",
    body: "I keep adding pairs to my watchlist and now I'm tracking fourteen. It feels productive but I think it's making me worse. How many did you settle on when you started?",
    authorId: "u_seed2", authorName: "Chinaza Okoro", authorRole: "student",
    likes: [], createdAt: new Date(Date.now() - 864e5 * 4).toISOString(),
  },
  {
    id: "t_seed3", channelId: "psychology", title: "Journaling finally clicked for me this month",
    body: "I resisted journaling for a year because it felt like homework. Started writing one sentence after every loss like the course suggests and within three weeks I could see the pattern — almost all my losses were trades taken in the first 20 minutes after another loss.\n\nIf you're skipping the journal, don't.",
    authorId: "u_seed3", authorName: "Samuel Adeyemi", authorRole: "student",
    likes: [], createdAt: new Date(Date.now() - 864e5 * 2).toISOString(),
  },
];

const SEED_NEWS: NewsItem[] = [
  {
    id: "n_seed1",
    title: "US CPI cools more than expected — dollar softens across majors",
    summary: "Core CPI printed below consensus, feeding rate-cut bets and weighing on the greenback into the London close.",
    body: "US consumer prices rose less than economists expected last month, with core CPI coming in below the consensus print. Markets quickly priced a higher probability of Federal Reserve easing later this year.\n\nEURUSD and GBPUSD both extended higher through the New York session, while USDJPY pulled back from multi-week highs. Gold also caught a bid as real yields eased.\n\nKey takeaway for traders: the immediate reaction favoured risk and non-dollar currencies, but the broader path still depends on upcoming labour data and Fed speak. Manage exposure into high-impact releases and avoid chasing the first spike.",
    source: "GAMAT Market Desk",
    impact: "high",
    pair: "USD",
    status: "published",
    authorName: "Market Desk",
    publishedAt: new Date(Date.now() - 864e5 * 1).toISOString(),
    createdAt: new Date(Date.now() - 864e5 * 1).toISOString(),
  },
  {
    id: "n_seed2",
    title: "ECB holds rates steady; Lagarde keeps a data-dependent tone",
    summary: "No change from Frankfurt. Markets focus on the press conference language around growth and inflation persistence.",
    body: "The European Central Bank left policy rates unchanged, matching market expectations. In the press conference, President Lagarde reiterated a data-dependent approach and avoided locking the Governing Council into a preset path.\n\nEUR pairs initially sold the headline then recovered as the tone was read as less hawkish than feared. Liquidity around the decision was thin — classic conditions for stop runs both ways.\n\nFor the week ahead, watch Eurozone PMIs and any follow-up speeches from Governing Council members.",
    source: "GAMAT Market Desk",
    impact: "high",
    pair: "EUR",
    status: "published",
    authorName: "Market Desk",
    publishedAt: new Date(Date.now() - 864e5 * 3).toISOString(),
    createdAt: new Date(Date.now() - 864e5 * 3).toISOString(),
  },
  {
    id: "n_seed3",
    title: "Gold holds above key support as real yields ease",
    summary: "XAUUSD continues to respect the rising demand zone after a shallow pullback.",
    body: "Spot gold remains constructive while US real yields drift lower. Price action continues to respect a well-defined demand zone on the daily chart, with buyers stepping in on dips.\n\nMomentum is not one-way — expect chop around round numbers — but the higher-timeframe structure stays bullish while the zone holds. Invalidation sits on a daily close beneath the most recent demand base.",
    source: "GAMAT Market Desk",
    impact: "medium",
    pair: "XAUUSD",
    status: "published",
    authorName: "Market Desk",
    publishedAt: new Date(Date.now() - 864e5 * 5).toISOString(),
    createdAt: new Date(Date.now() - 864e5 * 5).toISOString(),
  },
];

const SEED_TEAM: TeamProfile[] = [
  {
    id: "tm_tonye",
    slug: "tonye-s-taylor",
    name: "Tonye S. Taylor",
    role: "Founder & Lead Mentor",
    focus: "Fundamentals · Supply & Demand",
    bio: "Founder of GAMAT Fx Academy. Builds traders who can think for themselves through fundamentals, institutional zones and disciplined risk.",
    longBio: "Tonye S. Taylor is the founder of GAMAT Fx Academy and the architect of its education system. Based in Port Harcourt, Nigeria, he teaches forex fundamentals, supply and demand, price action and professional risk management.\n\nHis approach rejects signal culture. Students learn to build bias from macro drivers, map where institutions leave orders, and execute with rules they can defend in a journal.\n\nUnder his leadership GAMAT has trained thousands of traders, grown a large free community and expanded into academy consultancy and corporate financial literacy.",
    expertise: [
      "Forex fundamentals & central-bank bias",
      "Institutional supply and demand",
      "Price action & market structure",
      "Risk, expectancy and drawdown control",
      "Mentorship systems & curriculum design",
    ],
    milestones: [
      { year: "2018", title: "Full-time markets", body: "Began trading currencies seriously after years of private study." },
      { year: "2021", title: "Academy founded", body: "Turned private mentoring into organised cohorts and recorded programmes." },
      { year: "2024", title: "Scale & systems", body: "Expanded into consultancy, corporate training and multi-programme education." },
    ],
    order: 1,
    published: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "tm_amara",
    slug: "amara-okonkwo",
    name: "Amara Okonkwo",
    role: "Secretary & Head of Education",
    focus: "Curriculum · Administration",
    bio: "Leads curriculum design and price-action modules. Obsessed with clean structure and student comprehension.",
    longBio: "Amara Okonkwo oversees GAMAT’s education quality — from module sequencing to live classroom standards. She specialises in market structure, liquidity concepts and turning advanced ideas into lessons beginners can actually use.\n\nBefore joining the academy full-time she coached retail traders privately and built assessment frameworks that measure process, not just P&L.",
    expertise: ["Curriculum architecture", "Price action & liquidity", "Tutor training", "Student assessments"],
    milestones: [
      { year: "2022", title: "Joined GAMAT", body: "Took ownership of curriculum standards and live class quality." },
      { year: "2024", title: "Education lead", body: "Scaled multi-track programmes across fundamentals and technicals." },
    ],
    order: 2,
    published: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "tm_tunde",
    slug: "tunde-bello",
    name: "Tunde Bello",
    role: "Senior Market Analyst",
    focus: "Indices · Crypto",
    bio: "Desk analyst covering indices and crypto with a risk-first lens. Publishes session notes and scenario planning.",
    longBio: "Tunde Bello is GAMAT’s senior market analyst with a focus on indices, synthetic markets and crypto beta. He is known for calm scenario planning around high-impact events and for teaching students how to stand aside when the tape is noise.\n\nHis desk notes feed the academy’s Daily Outlook and live breakdown sessions.",
    expertise: ["Index & crypto analysis", "Event risk planning", "Session liquidity", "Desk commentary"],
    milestones: [
      { year: "2023", title: "Analyst desk", body: "Formalised GAMAT’s multi-asset commentary workflow." },
    ],
    order: 3,
    published: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "tm_ngozi",
    slug: "ngozi-eze",
    name: "Ngozi Eze",
    role: "Student Success Lead",
    focus: "Mentorship · Accountability",
    bio: "Keeps students accountable to journals, reviews and healthy trading routines.",
    longBio: "Ngozi Eze leads student success at GAMAT — onboarding, accountability pods and mentorship follow-through. She helps traders build routines that survive drawdowns: journaling, review cadence and emotional circuit-breakers.\n\nHer work is why many students finish programmes instead of disappearing after week two.",
    expertise: ["Student onboarding", "Accountability systems", "Trading psychology habits", "Cohort operations"],
    milestones: [
      { year: "2023", title: "Success systems", body: "Built GAMAT’s review and accountability playbooks." },
    ],
    order: 4,
    published: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

const SEED_GIVEAWAYS: Giveaway[] = [
  {
    id: "gv_seed1",
    title: "February Consistency Champions",
    summary: "Three students who journaled every session and hit their process goals this month.",
    body: "Process beats prediction. This month we celebrated traders who showed up, journaled and stuck to risk rules — not just those who posted a lucky win.\n\nEach winner receives a free month of community coaching calls and a GAMAT merch pack. Keep stacking clean sessions.",
    reward: "1 month coaching calls + merch pack",
    status: "published",
    winners: [
      { name: "Chinaza Okoro", nickname: "ChizCharts", note: "28/28 journal days" },
      { name: "Samuel Adeyemi", nickname: "RiskFirst", note: "Zero revenge trades all month" },
      { name: "Grace Nwankwo", note: "Best risk-adjusted demo stretch" },
    ],
    announcedAt: new Date(Date.now() - 864e5 * 4).toISOString(),
    createdAt: new Date(Date.now() - 864e5 * 4).toISOString(),
    authorName: "GAMAT Desk",
  },
];

const SEED_OUTLOOKS: OutlookItem[] = [
  {
    id: "o_seed1",
    date: new Date().toISOString().slice(0, 10),
    title: "Daily Outlook — majors lean risk-on into the US session",
    bias: "mixed",
    pairs: ["EURUSD", "GBPUSD", "USDJPY", "XAUUSD"],
    summary: "Soft dollar tone overnight keeps EUR and GBP constructive, while USDJPY remains range-bound. Gold holds its demand zone.",
    body: "Overnight price action kept a mild risk-on tone after softer US data. European majors are supported while the dollar index sits under local resistance.\n\nEURUSD: Bullish while above the overnight low. Look for pullbacks into prior supply-turned-demand rather than chasing highs.\n\nGBPUSD: Similar structure. Avoid buying into the London open spike; wait for the first 15-minute close.\n\nUSDJPY: Neutral-to-bearish. Range conditions favour fading extremes until a clean break of structure.\n\nXAUUSD: Bullish while the daily demand zone holds. Prefer longs on dips with tight invalidation.\n\nRisk note: A high-impact US release is due later — cut size or stand aside 30 minutes either side.",
    levels: "EURUSD support 1.0820 / resistance 1.0910\nGBPUSD support 1.2610 / resistance 1.2720\nXAUUSD support 2325 / resistance 2368",
    status: "published",
    authorName: "Market Desk",
    createdAt: new Date().toISOString(),
  },
  {
    id: "o_seed2",
    date: new Date(Date.now() - 864e5).toISOString().slice(0, 10),
    title: "Daily Outlook — caution into data; prefer confirmation",
    bias: "neutral",
    pairs: ["EURUSD", "GBPJPY", "AUDUSD"],
    summary: "Thin conviction ahead of the print. Wait for the first reaction candle to close before committing.",
    body: "With a Tier-1 release on the calendar, the desk preference is patience. Spreads will widen and the first move is often a liquidity grab.\n\nPlan: mark pre-release ranges, stand aside into the number, then trade only if price reclaims or rejects a clear level after the first 15-minute close.\n\nNo forced trades today — capital preservation over action.",
    levels: "Focus on session highs/lows into the release rather than fixed targets.",
    status: "published",
    authorName: "Market Desk",
    createdAt: new Date(Date.now() - 864e5).toISOString(),
  },
];

const SEED_REPLIES: ForumReply[] = [
  {
    id: "r_seed1", threadId: "t_seed2", authorId: "u_admin", authorName: "Amara Okonkwo", authorRole: "admin",
    body: "Three. Seriously. Pick three pairs that share a session and learn how they actually behave. You'll spot repeatable patterns far faster than someone spreading attention across fourteen.",
    likes: [], createdAt: new Date(Date.now() - 864e5 * 3).toISOString(),
  },
  {
    id: "r_seed2", threadId: "t_seed2", authorId: "u_seed4", authorName: "Grace Nwankwo", authorRole: "student",
    body: "I went from 10 down to 2 (GBPUSD and XAUUSD) and my win rate improved almost immediately. Less noise, more familiarity.",
    likes: [], createdAt: new Date(Date.now() - 864e5 * 2.5).toISOString(),
  },
];

/* ============================ Default data ============================ */

const DEFAULT_EVENTS: EventItem[] = [
  {
    id: "ev-aug-mentorship",
    title: "Forex Mentorship Class — August 2026 Intake",
    description:
      "Our flagship in-person mentorship cohort. Twelve weeks of structured teaching, live trading floor sessions and weekly one-on-one reviews with our mentors.",
    type: "Physical",
    month: "August", day: "10", year: "2026",
    time: "9:00 AM – 3:00 PM WAT",
    location: "Skillerville Gleetech, Rumuologu, Choba-Ozouba Road, Port Harcourt",
    capacity: 40, price: 0, status: "published", featured: true,
  },
  {
    id: "ev-aug-webinar",
    title: "Free Webinar: Reading the Economic Calendar",
    description:
      "A practical two-hour session on interpreting NFP, CPI and central bank decisions — and positioning around them without gambling.",
    type: "Online",
    month: "August", day: "24", year: "2026",
    time: "7:00 PM – 9:00 PM WAT",
    location: "Zoom (link sent on registration)",
    capacity: 500, price: 0, status: "published",
  },
  {
    id: "ev-sep-workshop",
    title: "Live Market Breakdown Workshop",
    description:
      "Trade the London open live with our analysts. Bring your charts, your journal and your questions.",
    type: "Hybrid",
    month: "September", day: "07", year: "2026",
    time: "8:00 AM – 12:00 PM WAT",
    location: "Port Harcourt + Live stream",
    capacity: 60, price: 15000, status: "published",
  },
  {
    id: "ev-sep-propclinic",
    title: "Prop Firm Challenge Clinic",
    description:
      "A focused clinic on passing funded-account evaluations: drawdown rules, consistency scoring and payout discipline.",
    type: "Online",
    month: "September", day: "21", year: "2026",
    time: "6:00 PM – 8:30 PM WAT",
    location: "Zoom (link sent on registration)",
    capacity: 200, price: 5000, status: "published",
  },
];

/* ============================ Persistence ============================ */

const K = {
  accounts: "gamat.accounts.v2",
  session: "gamat.session.v2",
  enrollments: "gamat.enrollments.v2",
  payments: "gamat.payments.v2",
  events: "gamat.events.v2",
  registrations: "gamat.registrations.v2",
  courseSettings: "gamat.courseSettings.v2",
  enquiries: "gamat.enquiries.v2",
  threads: "gamat.threads.v2",
  replies: "gamat.replies.v2",
  attempts: "gamat.attempts.v2",
  posts: "gamat.posts.v2",
  news: "gamat.news.v2",
  outlooks: "gamat.outlooks.v2",
  managedCourses: "gamat.managedCourses.v2",
  combat: "gamat.combat.v2",
  giveaways: "gamat.giveaways.v2",
  teamProfiles: "gamat.teamProfiles.v2",
  teamBios: "gamat.teamBios.v2",
  clubs: "gamat.clubs.v1",
  clubMessages: "gamat.clubMessages.v1",
  studentOfTheWeek: "gamat.sotw.v1",
  sotwHistory: "gamat.sotwHistory.v1",
  coupons: "gamat.coupons.v1",
};

function read<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}
function write(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* ignore */
  }
}

const uid = (p: string) => `${p}_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;
const ticketCode = () =>
  `GX-${Math.random().toString(36).slice(2, 6).toUpperCase()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;

/** Seeds a default admin account the first time the app runs. */
function seedAccounts(): Account[] {
  const existing = read<Account[]>(K.accounts, []);
  if (existing.some((a) => a.role === "admin")) return existing;
  const admin: Account = {
    id: "u_admin",
    firstName: "Tonye",
    lastName: "Taylor",
    email: "admin@gamatfx.com",
    password: "admin123",
    role: "admin",
    status: "active",
    country: "Nigeria",
    phone: "+234 806 194 9891",
    joined: new Date().toISOString(),
  };
  const next = [admin, ...existing];
  write(K.accounts, next);
  return next;
}

/* ============================== Context ============================== */

type Ctx = {
  /* session */
  user: User | null;
  isAuthed: boolean;
  isAdmin: boolean;
  login: (email: string, password: string) => { ok: boolean; error?: string };
  signup: (d: { firstName: string; lastName: string; email: string; password: string; phone?: string; country?: string }) => { ok: boolean; error?: string };
  logout: () => void;
  updateProfile: (patch: Partial<User>) => void;

  /* learning (current user) */
  enrollments: Enrollment[];
  isEnrolled: (courseId: string) => boolean;
  getEnrollment: (courseId: string) => Enrollment | undefined;
  enroll: (courseId: string) => void;
  toggleLesson: (courseId: string, lessonId: string) => void;
  setLastLesson: (courseId: string, lessonId: string) => void;
  progressOf: (courseId: string) => number;
  stats: { enrolled: number; completed: number; lessonsDone: number; hours: number };

  /* pricing */
  priceOf: (courseId: string) => number;
  courseSettings: Record<string, CourseSetting>;

  /* payments */
  recordPayment: (p: Omit<Payment, "id" | "ref" | "createdAt" | "status">) => Payment;
  myPayments: Payment[];

  /* events */
  events: EventItem[];
  allEvents: EventItem[];
  seatsLeft: (eventId: string) => number;
  registerForEvent: (d: { eventId: string; name: string; email: string; phone: string }) =>
    { ok: boolean; error?: string; registration?: Registration };
  myRegistrations: Registration[];
  cancelRegistration: (id: string) => void;

  /* permissions */
  isStaff: boolean;
  can: (p: Permission) => boolean;
  permissions: Permission[];

  /* quizzes */
  attempts: QuizAttempt[];
  submitAttempt: (courseId: string, answers: Record<string, number>) => QuizAttempt;
  bestAttempt: (courseId: string) => QuizAttempt | undefined;
  hasPassedQuiz: (courseId: string) => boolean;

  /* staff posts */
  posts: StaffPost[];
  myPosts: StaffPost[];
  publishedPosts: StaffPost[];
  savePost: (p: Omit<StaffPost, "id" | "authorId" | "authorName" | "createdAt" | "updatedAt"> & { id?: string }) => { ok: boolean; error?: string };
  deletePost: (id: string) => void;
  setPostStatus: (id: string, status: StaffPost["status"]) => void;

  /* news & outlooks */
  news: NewsItem[];
  publishedNews: NewsItem[];
  saveNews: (n: Omit<NewsItem, "id" | "createdAt" | "authorId" | "authorName" | "publishedAt"> & { id?: string }) => { ok: boolean; error?: string };
  deleteNews: (id: string) => void;
  outlooks: OutlookItem[];
  publishedOutlooks: OutlookItem[];
  saveOutlook: (o: Omit<OutlookItem, "id" | "createdAt" | "authorId" | "authorName"> & { id?: string }) => { ok: boolean; error?: string };
  deleteOutlook: (id: string) => void;

  /* admin-managed courses */
  managedCourses: ManagedCourse[];
  saveManagedCourse: (c: Omit<ManagedCourse, "id" | "createdAt" | "updatedAt"> & { id?: string }) => { ok: boolean; error?: string };
  deleteManagedCourse: (id: string) => void;

  /* market combat */
  combat: CombatStats;
  placeCombatPrediction: (scenarioId: string, direction: "up" | "down") => { ok: boolean; error?: string };
  resolveCombatPredictions: () => void;
  combatLeaderboard: { userId: string; name: string; avatar?: string; xp: number; wins: number; losses: number }[];

  /* giveaways */
  giveaways: Giveaway[];
  publishedGiveaways: Giveaway[];
  saveGiveaway: (g: Omit<Giveaway, "id" | "createdAt" | "authorId" | "authorName" | "announcedAt"> & { id?: string }) => { ok: boolean; error?: string };
  deleteGiveaway: (id: string) => void;

  /* team pages */
  teamProfiles: TeamProfile[];
  publishedTeam: TeamProfile[];
  saveTeamProfile: (t: Omit<TeamProfile, "id" | "createdAt" | "updatedAt" | "slug"> & { id?: string; slug?: string }) => { ok: boolean; error?: string };
  deleteTeamProfile: (id: string) => void;
  teamBios: TeamBioSubmission[];
  submitTeamBio: (b: Omit<TeamBioSubmission, "id" | "createdAt" | "status" | "userId" | "name" | "email" | "avatar" | "reviewedAt">) => { ok: boolean; error?: string };
  reviewTeamBio: (id: string, status: "approved" | "rejected", publish?: boolean) => void;
  deleteTeamBio: (id: string) => void;

  /* service enquiries */
  submitEnquiry: (d: Omit<ServiceEnquiry, "id" | "ref" | "status" | "createdAt" | "userId">) => ServiceEnquiry;

  /* trading clubs */
  clubs: TradingClub[];
  userClub?: TradingClub;
  createClub: (d: { name: string; tagline: string; description: string; focus: string; emblem?: string; color?: string }) => { ok: boolean; error?: string; club?: TradingClub };
  joinClub: (clubId: string) => { ok: boolean; error?: string };
  leaveClub: (clubId: string) => { ok: boolean; error?: string };
  clubMessages: ClubMessage[];
  sendClubMessage: (d: { clubId: string; content: string; image?: string; replyToId?: string; replyToName?: string }) => { ok: boolean; error?: string };
  toggleClubMessageVote: (messageId: string, vote: "like" | "dislike") => void;
  toggleClubMessageEmoji: (messageId: string, emoji: string) => void;

  /* student of the week */
  studentOfTheWeek: StudentOfTheWeek;
  studentOfTheWeekHistory: StudentOfTheWeek[];
  saveStudentOfTheWeek: (s: Omit<StudentOfTheWeek, "id" | "createdAt"> & { id?: string }) => { ok: boolean; error?: string };

  /* student reviews & ratings */
  reviews: ReviewItem[];
  addReview: (d: { targetType: "course" | "mentorship" | "service" | "event"; targetId: string; targetTitle: string; rating: number; comment: string; userLocation?: string }) => { ok: boolean; error?: string; review?: ReviewItem };

  /* activity notifications */
  activityNotifications: ActivityNotification[];

  /* coupons */
  coupons: Coupon[];
  saveCoupon: (c: Omit<Coupon, "id" | "createdAt" | "usedCount"> & { id?: string }) => { ok: boolean; error?: string };
  deleteCoupon: (id: string) => void;
  validateCoupon: (code: string, target?: "all" | "courses" | "services" | "events") => { ok: boolean; coupon?: Coupon; discountPercent?: number; error?: string };

  /* forum */
  forum: {
    channels: ForumChannel[];
    threads: ForumThread[];
    replies: ForumReply[];
    createThread: (d: { channelId: string; title: string; body: string; image?: string }) => { ok: boolean; error?: string; id?: string };
    createReply: (threadId: string, body: string, image?: string) => { ok: boolean; error?: string };
    toggleThreadLike: (id: string) => void;
    toggleReplyLike: (id: string) => void;
    deleteThread: (id: string) => void;
    deleteReply: (id: string) => void;
    togglePin: (id: string) => void;
    repliesOf: (threadId: string) => ForumReply[];
    threadsOf: (channelId: string) => ForumThread[];
  };

  /* admin */
  admin: {
    accounts: Account[];
    enrollments: Enrollment[];
    payments: Payment[];
    registrations: Registration[];
    posts: StaffPost[];
    enquiries: ServiceEnquiry[];
    setEnquiryStatus: (id: string, status: ServiceEnquiry["status"]) => void;
    deleteEnquiry: (id: string) => void;
    kpis: {
      students: number; admins: number; revenue: number; refunded: number;
      enrollments: number; registrations: number; events: number; avgOrder: number;
    };
    revenueByMonth: { label: string; value: number }[];
    updateAccount: (id: string, patch: Partial<Account>) => void;
    deleteAccount: (id: string) => void;
    createAccount: (d: Omit<Account, "id" | "joined">) => { ok: boolean; error?: string };
    enrollUser: (userId: string, courseId: string) => void;
    removeEnrollment: (id: string) => void;
    setPaymentStatus: (id: string, status: Payment["status"]) => void;
    deletePayment: (id: string) => void;
    saveEvent: (e: EventItem) => void;
    deleteEvent: (id: string) => void;
    setRegistrationStatus: (id: string, status: Registration["status"]) => void;
    deleteRegistration: (id: string) => void;
    setCourseSetting: (courseId: string, patch: CourseSetting) => void;
    resetDemoData: () => void;
  };
};

const StoreContext = createContext<Ctx | null>(null);

/* ============================== Provider ============================== */

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [accounts, setAccounts] = useState<Account[]>(() => seedAccounts());
  const [sessionId, setSessionId] = useState<string | null>(() => read<string | null>(K.session, null));
  const [allEnrollments, setAllEnrollments] = useState<Enrollment[]>(() => read<Enrollment[]>(K.enrollments, []));
  const [payments, setPayments] = useState<Payment[]>(() => read<Payment[]>(K.payments, []));
  const [events, setEvents] = useState<EventItem[]>(() => read<EventItem[]>(K.events, DEFAULT_EVENTS));
  const [registrations, setRegistrations] = useState<Registration[]>(() => read<Registration[]>(K.registrations, []));
  const [courseSettings, setCourseSettings] = useState<Record<string, CourseSetting>>(() =>
    read<Record<string, CourseSetting>>(K.courseSettings, {})
  );
  const [enquiries, setEnquiries] = useState<ServiceEnquiry[]>(() => read<ServiceEnquiry[]>(K.enquiries, []));
  const [threads, setThreads] = useState<ForumThread[]>(() => read<ForumThread[]>(K.threads, SEED_THREADS));
  const [replies, setReplies] = useState<ForumReply[]>(() => read<ForumReply[]>(K.replies, SEED_REPLIES));
  const [attempts, setAttempts] = useState<QuizAttempt[]>(() => read<QuizAttempt[]>(K.attempts, []));
  const [posts, setPosts] = useState<StaffPost[]>(() => read<StaffPost[]>(K.posts, []));
  const [news, setNews] = useState<NewsItem[]>(() => read<NewsItem[]>(K.news, SEED_NEWS));
  const [outlooks, setOutlooks] = useState<OutlookItem[]>(() => read<OutlookItem[]>(K.outlooks, SEED_OUTLOOKS));
  const [managedCourses, setManagedCourses] = useState<ManagedCourse[]>(() => read<ManagedCourse[]>(K.managedCourses, []));
  const [combatByUser, setCombatByUser] = useState<Record<string, CombatStats>>(() => read(K.combat, {}));
  const [giveaways, setGiveaways] = useState<Giveaway[]>(() => read(K.giveaways, SEED_GIVEAWAYS));
  const [teamProfiles, setTeamProfiles] = useState<TeamProfile[]>(() => read<TeamProfile[]>(K.teamProfiles, SEED_TEAM));
  const [teamBios, setTeamBios] = useState<TeamBioSubmission[]>(() => read<TeamBioSubmission[]>(K.teamBios, []));
  const [clubs, setClubs] = useState<TradingClub[]>(() => read<TradingClub[]>(K.clubs, SEED_CLUBS));
  const [clubMessages, setClubMessages] = useState<ClubMessage[]>(() =>
    read<ClubMessage[]>(K.clubMessages, SEED_CLUB_MESSAGES)
  );
  const [studentOfTheWeek, setStudentOfTheWeek] = useState<StudentOfTheWeek>(() =>
    read<StudentOfTheWeek>(K.studentOfTheWeek, DEFAULT_STUDENT_OF_WEEK)
  );
  const [studentOfTheWeekHistory, setStudentOfTheWeekHistory] = useState<StudentOfTheWeek[]>(() =>
    read<StudentOfTheWeek[]>(K.sotwHistory, SEED_SOTW_HISTORY)
  );
  const [coupons, setCoupons] = useState<Coupon[]>(() => read<Coupon[]>(K.coupons, SEED_COUPONS));
  const [reviews, setReviews] = useState<ReviewItem[]>(() => read<ReviewItem[]>("gamat_reviews_v1", SEED_REVIEWS));

  /* persist */
  useEffect(() => write(K.accounts, accounts), [accounts]);
  useEffect(() => write(K.session, sessionId), [sessionId]);
  useEffect(() => write(K.enrollments, allEnrollments), [allEnrollments]);
  useEffect(() => write(K.payments, payments), [payments]);
  useEffect(() => write(K.events, events), [events]);
  useEffect(() => write(K.registrations, registrations), [registrations]);
  useEffect(() => write(K.courseSettings, courseSettings), [courseSettings]);
  useEffect(() => write(K.enquiries, enquiries), [enquiries]);
  useEffect(() => write(K.threads, threads), [threads]);
  useEffect(() => write(K.replies, replies), [replies]);
  useEffect(() => write(K.attempts, attempts), [attempts]);
  useEffect(() => write(K.posts, posts), [posts]);
  useEffect(() => write(K.news, news), [news]);
  useEffect(() => write(K.outlooks, outlooks), [outlooks]);
  useEffect(() => write(K.managedCourses, managedCourses), [managedCourses]);
  useEffect(() => write(K.combat, combatByUser), [combatByUser]);
  useEffect(() => write(K.giveaways, giveaways), [giveaways]);
  useEffect(() => write(K.teamProfiles, teamProfiles), [teamProfiles]);
  useEffect(() => write(K.teamBios, teamBios), [teamBios]);
  useEffect(() => write(K.clubs, clubs), [clubs]);
  useEffect(() => write(K.clubMessages, clubMessages), [clubMessages]);
  useEffect(() => write(K.studentOfTheWeek, studentOfTheWeek), [studentOfTheWeek]);
  useEffect(() => write(K.sotwHistory, studentOfTheWeekHistory), [studentOfTheWeekHistory]);
  useEffect(() => write(K.coupons, coupons), [coupons]);
  useEffect(() => write("gamat_reviews_v1", reviews), [reviews]);

  /* Load and sync accounts from Supabase database */
  useEffect(() => {
    fetchSupabaseAccounts().then((supaAccounts) => {
      if (supaAccounts && supaAccounts.length > 0) {
        setAccounts((prev) => {
          const map = new Map<string, Account>();
          prev.forEach((a) => map.set(a.id, a));
          supaAccounts.forEach((a) => map.set(a.id, a));
          return Array.from(map.values());
        });
      }
    });
  }, []);
  useEffect(() => {
    fetchSupabaseCourses().then((supabaseCourses) => {
      if (supabaseCourses && supabaseCourses.length > 0) {
        setManagedCourses((prev) => {
          const map = new Map<string, ManagedCourse>();
          prev.forEach((c) => map.set(c.id, c));
          supabaseCourses.forEach((c) => {
            const mc: ManagedCourse = {
              id: c.id,
              title: c.title,
              short: c.short,
              desc: c.desc,
              tag: c.tag,
              level: c.level,
              duration: c.duration,
              price: c.price,
              oldPrice: c.oldPrice,
              poster: c.poster,
              video: c.video,
              outcomes: c.outcomes,
              requirements: c.requirements,
              modules: c.modules.map((m, mi) => ({
                id: (m as any).id || `${c.id}-mod-${mi}`,
                title: m.title,
                lessons: m.lessons.map((l, li) => ({
                  id: l.id || `${c.id}-les-${mi}-${li}`,
                  title: l.title,
                  duration: l.duration,
                  free: l.free,
                  videoUrl: (l as any).videoUrl,
                })),
              })),
              published: (c as any).published ?? true,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            };
            map.set(c.id, mc);
          });
          return Array.from(map.values());
        });
      }
    });
  }, []);

  /* Load all entities from Supabase database, auto-seed if empty & subscribe to Realtime events */
  useEffect(() => {
    const refreshAllFromSupabase = () => {
      fetchSupabaseAccounts().then((r) => r.length && setAccounts(r));
      fetchSupabaseEnrollments().then((r) => r.length && setAllEnrollments(r));
      fetchSupabasePayments().then((r) => r.length && setPayments(r));
      fetchSupabaseEvents().then((r) => r.length && setEvents(r));
      fetchSupabaseRegistrations().then((r) => r.length && setRegistrations(r));
      fetchSupabaseThreads().then((r) => r.length && setThreads(r));
      fetchSupabaseReplies().then((r) => r.length && setReplies(r));
      fetchSupabaseClubs().then((r) => r.length && setClubs(r));
      fetchSupabaseClubMessages().then((r) => r.length && setClubMessages(r));
      fetchSupabaseNews().then((r) => r.length && setNews(r));
      fetchSupabaseOutlooks().then((r) => r.length && setOutlooks(r));
      fetchSupabaseEnquiries().then((r) => r.length && setEnquiries(r));
      fetchSupabaseCoupons().then((r) => r.length && setCoupons(r));
      fetchSupabaseGiveaways().then((r) => r.length && setGiveaways(r));
      fetchSupabaseSOTW().then((r) => r && setStudentOfTheWeek(r));
      fetchSupabaseReviews().then((r) => r.length && setReviews(r));
    };

    // 1. Fetch initial records
    refreshAllFromSupabase();

    // 2. Auto-seed Supabase database if tables are empty
    seedSupabaseDatabaseIfEmpty({
      courses: managedCourses,
      accounts,
      news,
      events,
      reviews,
      sotw: studentOfTheWeek,
      giveaways,
    });

    // 3. Subscribe to live Realtime database updates
    const unsubscribe = subscribeToSupabaseRealtime((_table) => {
      refreshAllFromSupabase();
    });

    return () => {
      unsubscribe();
    };
  }, []);

  const account = useMemo(() => accounts.find((a) => a.id === sessionId) ?? null, [accounts, sessionId]);
  const user: User | null = useMemo(() => {
    if (!account) return null;
    const { password: _p, ...rest } = account;
    return rest;
  }, [account]);

  const userClub = useMemo(
    () => (user ? clubs.find((c) => c.members.some((m) => m.userId === user.id)) : undefined),
    [clubs, user]
  );

  /* ------------------------------ Auth ------------------------------ */

  const signup: Ctx["signup"] = useCallback((d) => {
    const email = d.email.trim().toLowerCase();
    if (!d.firstName.trim() || !d.lastName.trim()) return { ok: false, error: "Please enter your full name." };
    if (accounts.some((a) => a.email === email)) return { ok: false, error: "An account with this email already exists." };
    if (d.password.length < 6) return { ok: false, error: "Password must be at least 6 characters." };

    const newAccData = {
      firstName: d.firstName.trim(),
      lastName: d.lastName.trim(),
      email,
      password: d.password,
      phone: d.phone ? d.phone.trim() : undefined,
      country: d.country?.trim() || "Nigeria",
      role: "student" as const,
      status: "active" as const,
    };

    const acc: Account = {
      ...newAccData,
      id: uid("u"),
      joined: new Date().toISOString(),
    };

    setAccounts((p) => [...p, acc]);
    setSessionId(acc.id);

    // Sync user signup to Supabase Auth & Database
    saveSupabaseAccount(acc);
    signUpSupabaseUser(email, d.password, newAccData);

    return { ok: true };
  }, [accounts]);

  const login: Ctx["login"] = useCallback((email, password) => {
    const cleanEmail = email.trim().toLowerCase();
    const found = accounts.find((a) => a.email === cleanEmail);

    if (found) {
      if (found.password !== password) return { ok: false, error: "Incorrect password. Please try again." };
      if (found.status === "suspended") return { ok: false, error: "This account has been suspended. Contact support." };
      setSessionId(found.id);
      signInSupabaseUser(cleanEmail, password);
      return { ok: true };
    }

    // Try Supabase auth login directly
    signInSupabaseUser(cleanEmail, password).then((res) => {
      if (res.ok && res.account) {
        setAccounts((p) => (p.some((a) => a.id === res.account!.id) ? p : [...p, res.account!]));
        setSessionId(res.account.id);
      }
    });

    return { ok: false, error: "No account found with that email." };
  }, [accounts]);

  const logout = useCallback(() => {
    setSessionId(null);
    signOutSupabaseUser();
  }, []);

  const updateProfile: Ctx["updateProfile"] = useCallback((patch) => {
    if (!sessionId) return;
    setAccounts((p) => {
      const updatedAccounts = p.map((a) => (a.id === sessionId ? { ...a, ...patch } : a));
      const current = updatedAccounts.find((a) => a.id === sessionId);
      if (current) {
        saveSupabaseAccount(current);
        if (patch.avatar !== undefined || patch.firstName || patch.lastName || patch.nickname) {
          const newName = current.nickname?.trim() || `${current.firstName} ${current.lastName}`.trim();
          const newAvatar = current.avatar;
          setThreads((prev) =>
            prev.map((t) => (t.authorId === sessionId ? { ...t, authorName: newName, authorAvatar: newAvatar } : t))
          );
          setReplies((prev) =>
            prev.map((r) => (r.authorId === sessionId ? { ...r, authorName: newName, authorAvatar: newAvatar } : r))
          );
          setClubMessages((prev) =>
            prev.map((cm) => (cm.userId === sessionId ? { ...cm, userName: newName, userAvatar: newAvatar } : cm))
          );
          setTeamProfiles((prev) =>
            prev.map((t) => (t.userId === sessionId ? { ...t, avatar: newAvatar, updatedAt: new Date().toISOString() } : t))
          );
          setTeamBios((prev) =>
            prev.map((b) => (b.userId === sessionId && b.status === "pending" ? { ...b, avatar: newAvatar } : b))
          );
        }
      }
      return updatedAccounts;
    });
  }, [sessionId]);

  /* --------------------------- Enrollments --------------------------- */

  const myEnrollments = useMemo(
    () => allEnrollments.filter((e) => e.userId === sessionId),
    [allEnrollments, sessionId]
  );

  const enroll: Ctx["enroll"] = useCallback((courseId) => {
    if (!sessionId) return;
    const newEnr: Enrollment = { id: uid("en"), userId: sessionId, courseId, enrolledAt: new Date().toISOString(), completedLessons: [] };
    setAllEnrollments((p) => {
      if (p.some((e) => e.userId === sessionId && e.courseId === courseId)) return p;
      return [...p, newEnr];
    });
    saveSupabaseEnrollment(newEnr);
  }, [sessionId]);

  const isEnrolled: Ctx["isEnrolled"] = useCallback(
    (courseId) => myEnrollments.some((e) => e.courseId === courseId), [myEnrollments]
  );
  const getEnrollment: Ctx["getEnrollment"] = useCallback(
    (courseId) => myEnrollments.find((e) => e.courseId === courseId), [myEnrollments]
  );

  const toggleLesson: Ctx["toggleLesson"] = useCallback((courseId, lessonId) => {
    setAllEnrollments((p) => p.map((e) => {
      if (e.userId !== sessionId || e.courseId !== courseId) return e;
      const has = e.completedLessons.includes(lessonId);
      const updated: Enrollment = { ...e, completedLessons: has ? e.completedLessons.filter((l) => l !== lessonId) : [...e.completedLessons, lessonId] };
      saveSupabaseEnrollment(updated);
      return updated;
    }));
  }, [sessionId]);

  const setLastLesson: Ctx["setLastLesson"] = useCallback((courseId, lessonId) => {
    setAllEnrollments((p) => p.map((e) => {
      if (e.userId === sessionId && e.courseId === courseId) {
        const updated: Enrollment = { ...e, lastLessonId: lessonId };
        saveSupabaseEnrollment(updated);
        return updated;
      }
      return e;
    }));
  }, [sessionId]);

  const progressOf: Ctx["progressOf"] = useCallback((courseId) => {
    const e = myEnrollments.find((x) => x.courseId === courseId);
    const c = getCourse(courseId);
    if (!e || !c) return 0;
    const t = totalLessons(c);
    return t ? Math.round((e.completedLessons.length / t) * 100) : 0;
  }, [myEnrollments]);

  const stats = useMemo(() => {
    let lessonsDone = 0, completed = 0, minutes = 0;
    myEnrollments.forEach((e) => {
      const c = getCourse(e.courseId);
      if (!c) return;
      lessonsDone += e.completedLessons.length;
      if (e.completedLessons.length >= totalLessons(c)) completed += 1;
      minutes += e.completedLessons.length * 18;
    });
    return { enrolled: myEnrollments.length, completed, lessonsDone, hours: Math.round(minutes / 60) };
  }, [myEnrollments]);

  /* ----------------------------- Pricing ----------------------------- */

  const priceOf: Ctx["priceOf"] = useCallback((courseId) => {
    const override = courseSettings[courseId]?.price;
    if (typeof override === "number") return override;
    return getCourse(courseId)?.price ?? 0;
  }, [courseSettings]);

  /* ---------------------------- Payments ---------------------------- */

  const recordPayment: Ctx["recordPayment"] = useCallback((p) => {
    const payment: Payment = {
      ...p,
      id: uid("pay"),
      ref: `GMT${Date.now().toString().slice(-8)}`,
      status: "paid",
      createdAt: new Date().toISOString(),
    };
    setPayments((prev) => [payment, ...prev]);
    saveSupabasePayment(payment);
    return payment;
  }, []);

  const myPayments = useMemo(
    () => payments.filter((p) => p.userId === sessionId), [payments, sessionId]
  );

  /* ------------------------------ Events ------------------------------ */

  const publicEvents = useMemo(() => events.filter((e) => e.status === "published"), [events]);

  const seatsLeft: Ctx["seatsLeft"] = useCallback((eventId) => {
    const ev = events.find((e) => e.id === eventId);
    if (!ev) return 0;
    const taken = registrations.filter((r) => r.eventId === eventId && r.status === "confirmed").length;
    return Math.max(0, ev.capacity - taken);
  }, [events, registrations]);

  const registerForEvent: Ctx["registerForEvent"] = useCallback((d) => {
    const ev = events.find((e) => e.id === d.eventId);
    if (!ev) return { ok: false, error: "That event could not be found." };
    const email = d.email.trim().toLowerCase();
    const dup = registrations.some(
      (r) => r.eventId === d.eventId && r.status === "confirmed" && r.email.toLowerCase() === email
    );
    if (dup) return { ok: false, error: "This email is already registered for that event." };
    const taken = registrations.filter((r) => r.eventId === d.eventId && r.status === "confirmed").length;
    if (taken >= ev.capacity) return { ok: false, error: "Sorry — this event is fully booked." };

    const reg: Registration = {
      id: uid("reg"),
      eventId: ev.id,
      eventTitle: ev.title,
      eventDate: `${ev.month} ${ev.day}, ${ev.year}`,
      userId: sessionId ?? undefined,
      name: d.name.trim(),
      email,
      phone: d.phone.trim(),
      ticket: ticketCode(),
      status: "confirmed",
      createdAt: new Date().toISOString(),
    };
    setRegistrations((p) => [reg, ...p]);
    saveSupabaseRegistration(reg);
    return { ok: true, registration: reg };
  }, [events, registrations, sessionId]);

  const myRegistrations = useMemo(
    () => registrations.filter((r) => (sessionId && r.userId === sessionId) || (user && r.email === user.email)),
    [registrations, sessionId, user]
  );

  const cancelRegistration: Ctx["cancelRegistration"] = useCallback((id) => {
    setRegistrations((p) => p.map((r) => {
      if (r.id === id) {
        const updated: Registration = { ...r, status: "cancelled" };
        saveSupabaseRegistration(updated);
        return updated;
      }
      return r;
    }));
  }, []);

  /* -------------------------- Permissions -------------------------- */

  const permissions = useMemo<Permission[]>(() => {
    if (!user) return [];
    if (user.role === "admin") return ALL_PERMISSIONS;
    if (user.role === "staff") {
      const base = LEVEL_PERMISSIONS[user.staffLevel ?? "author"] ?? [];
      return Array.from(new Set([...base, ...(user.extraPermissions ?? [])]));
    }
    return [];
  }, [user]);

  const can = useCallback((p: Permission) => permissions.includes(p), [permissions]);

  /* ---------------------------- Quizzes ---------------------------- */

  const submitAttempt: Ctx["submitAttempt"] = useCallback((courseId, answers) => {
    const quiz = getQuiz(courseId);
    const total = quiz?.questions.length ?? 0;
    const correct = quiz
      ? quiz.questions.reduce((n, q) => n + (answers[q.id] === q.answer ? 1 : 0), 0)
      : 0;
    const score = total ? Math.round((correct / total) * 100) : 0;
    const attempt: QuizAttempt = {
      id: uid("qa"),
      userId: sessionId ?? "anon",
      courseId, score, correct, total,
      passed: score >= (quiz?.passMark ?? 70),
      answers,
      createdAt: new Date().toISOString(),
    };
    setAttempts((p) => [attempt, ...p]);
    return attempt;
  }, [sessionId]);

  const myAttempts = useMemo(
    () => attempts.filter((a) => a.userId === sessionId), [attempts, sessionId]
  );

  const bestAttempt: Ctx["bestAttempt"] = useCallback((courseId) => {
    const mine = myAttempts.filter((a) => a.courseId === courseId);
    if (!mine.length) return undefined;
    return mine.reduce((best, a) => (a.score > best.score ? a : best), mine[0]);
  }, [myAttempts]);

  const hasPassedQuiz: Ctx["hasPassedQuiz"] = useCallback(
    (courseId) => myAttempts.some((a) => a.courseId === courseId && a.passed),
    [myAttempts]
  );

  /* --------------------------- Staff posts --------------------------- */

  const savePost: Ctx["savePost"] = useCallback((p) => {
    if (!user) return { ok: false, error: "You must be signed in." };
    if (!p.title.trim()) return { ok: false, error: "Please add a title." };
    if (p.body.trim().length < 40) return { ok: false, error: "Article body is too short." };

    const canPublish = user.role === "admin" ||
      (user.role === "staff" && (LEVEL_PERMISSIONS[user.staffLevel ?? "author"].includes("posts:publish")
        || (user.extraPermissions ?? []).includes("posts:publish")));

    // Authors cannot self-publish — their work goes to "pending".
    const status: StaffPost["status"] =
      p.status === "published" && !canPublish ? "pending" : p.status;

    const now = new Date().toISOString();
    const slug = p.slug?.trim() ||
      p.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 60);

    setPosts((prev) => {
      if (p.id && prev.some((x) => x.id === p.id)) {
        return prev.map((x) => x.id === p.id
          ? { ...x, ...p, slug, status, updatedAt: now } as StaffPost
          : x);
      }
      const created: StaffPost = {
        ...p,
        id: p.id || uid("post"),
        slug, status,
        authorId: user.id,
        authorName: [user.firstName, user.lastName].filter(Boolean).join(" "),
        createdAt: now, updatedAt: now,
      };
      return [created, ...prev];
    });
    return { ok: true };
  }, [user]);

  const deletePost: Ctx["deletePost"] = useCallback((id) => {
    setPosts((p) => p.filter((x) => x.id !== id));
  }, []);

  const setPostStatus: Ctx["setPostStatus"] = useCallback((id, status) => {
    setPosts((p) => p.map((x) => (x.id === id ? { ...x, status, updatedAt: new Date().toISOString() } : x)));
  }, []);

  const myPosts = useMemo(() => posts.filter((p) => p.authorId === sessionId), [posts, sessionId]);
  const publishedPosts = useMemo(() => posts.filter((p) => p.status === "published"), [posts]);

  /* ------------------------- News & Outlooks ------------------------- */

  const saveNews: Ctx["saveNews"] = useCallback((n) => {
    if (!n.title.trim()) return { ok: false, error: "Title is required." };
    if (!n.summary.trim()) return { ok: false, error: "Summary is required." };
    const now = new Date().toISOString();
    let targetNews: NewsItem;
    setNews((prev) => {
      if (n.id && prev.some((x) => x.id === n.id)) {
        return prev.map((x) => {
          if (x.id === n.id) {
            targetNews = {
              ...x,
              ...n,
              title: n.title.trim(),
              summary: n.summary.trim(),
              body: n.body.trim(),
              publishedAt: n.status === "published" ? x.publishedAt || now : x.publishedAt,
            };
            return targetNews;
          }
          return x;
        });
      }
      targetNews = {
        ...n,
        id: n.id || uid("n"),
        title: n.title.trim(),
        summary: n.summary.trim(),
        body: n.body.trim(),
        authorId: sessionId ?? undefined,
        authorName: user ? `${user.firstName} ${user.lastName}` : "Market Desk",
        publishedAt: n.status === "published" ? now : "",
        createdAt: now,
      };
      return [targetNews, ...prev];
    });
    if (targetNews!) saveSupabaseNews(targetNews);
    return { ok: true };
  }, [sessionId, user]);

  const deleteNews: Ctx["deleteNews"] = useCallback((id) => {
    setNews((p) => p.filter((x) => x.id !== id));
    deleteSupabaseNews(id);
  }, []);

  const publishedNews = useMemo(
    () => news.filter((n) => n.status === "published").sort((a, b) => +new Date(b.publishedAt) - +new Date(a.publishedAt)),
    [news]
  );

  const saveOutlook: Ctx["saveOutlook"] = useCallback((o) => {
    if (!o.title.trim()) return { ok: false, error: "Title is required." };
    if (!o.summary.trim()) return { ok: false, error: "Summary is required." };
    const now = new Date().toISOString();
    let targetOutlook: OutlookItem;
    setOutlooks((prev) => {
      if (o.id && prev.some((x) => x.id === o.id)) {
        return prev.map((x) => {
          if (x.id === o.id) {
            targetOutlook = { ...x, ...o, title: o.title.trim(), summary: o.summary.trim(), body: o.body.trim() };
            return targetOutlook;
          }
          return x;
        });
      }
      targetOutlook = {
        ...o,
        id: o.id || uid("o"),
        title: o.title.trim(),
        summary: o.summary.trim(),
        body: o.body.trim(),
        pairs: o.pairs ?? [],
        authorId: sessionId ?? undefined,
        authorName: user ? `${user.firstName} ${user.lastName}` : "Market Desk",
        createdAt: now,
      };
      return [targetOutlook, ...prev];
    });
    if (targetOutlook!) saveSupabaseOutlook(targetOutlook);
    return { ok: true };
  }, [sessionId, user]);

  const deleteOutlook: Ctx["deleteOutlook"] = useCallback((id) => {
    setOutlooks((p) => p.filter((x) => x.id !== id));
    deleteSupabaseOutlook(id);
  }, []);

  const publishedOutlooks = useMemo(
    () => outlooks.filter((o) => o.status === "published").sort((a, b) => b.date.localeCompare(a.date)),
    [outlooks]
  );

  /* ---------------------- Managed courses (admin) ---------------------- */

  const saveManagedCourse: Ctx["saveManagedCourse"] = useCallback((c) => {
    if (!c.title.trim()) return { ok: false, error: "Course title is required." };
    if (c.price < 0) return { ok: false, error: "Price cannot be negative." };
    const now = new Date().toISOString();
    let targetCourse: ManagedCourse;

    setManagedCourses((prev) => {
      if (c.id && prev.some((x) => x.id === c.id)) {
        return prev.map((x) => {
          if (x.id === c.id) {
            targetCourse = { ...x, ...c, title: c.title.trim(), short: c.short.trim(), desc: c.desc.trim(), updatedAt: now };
            return targetCourse;
          }
          return x;
        });
      }
      targetCourse = {
        ...c,
        id: c.id || uid("mc"),
        title: c.title.trim(),
        short: c.short.trim(),
        desc: c.desc.trim(),
        outcomes: c.outcomes ?? [],
        requirements: c.requirements ?? [],
        modules: c.modules ?? [],
        icon: c.icon,
        iconColor: c.iconColor,
        createdAt: now,
        updatedAt: now,
      };
      return [targetCourse, ...prev];
    });

    // Save to Supabase DB asynchronously
    if (targetCourse!) {
      saveSupabaseCourse(targetCourse);
    }
    return { ok: true };
  }, []);

  const deleteManagedCourse: Ctx["deleteManagedCourse"] = useCallback((id) => {
    setManagedCourses((p) => p.filter((x) => x.id !== id));
    deleteSupabaseCourse(id);
  }, []);

  /* ------------------------- Market Combat ------------------------- */

  const emptyCombat = (): CombatStats => ({
    xp: 0, wins: 0, losses: 0, streak: 0, bestStreak: 0, predictions: [],
  });

  const combat: CombatStats = sessionId
    ? (combatByUser[sessionId] ?? emptyCombat())
    : emptyCombat();

  const placeCombatPrediction: Ctx["placeCombatPrediction"] = useCallback((scenarioId, direction) => {
    if (!sessionId) return { ok: false, error: "Sign in to lock a prediction." };
    const sc = SCENARIOS.find((s) => s.id === scenarioId);
    if (!sc) return { ok: false, error: "Scenario not found." };

    const current = combatByUser[sessionId] ?? emptyCombat();
    if (current.predictions.some((p) => p.scenarioId === scenarioId && p.status === "open")) {
      return { ok: false, error: "You already have an open call on this scenario." };
    }

    const pred: CombatPrediction = {
      id: uid("cp"),
      scenarioId,
      pair: sc.pair,
      direction,
      createdAt: new Date().toISOString(),
      resolvesAt: new Date(Date.now() + sc.horizonHours * 3600_000).toISOString(),
      status: "open",
      points: 0,
    };

    setCombatByUser((prev) => ({
      ...prev,
      [sessionId]: { ...current, predictions: [pred, ...current.predictions] },
    }));
    return { ok: true };
  }, [sessionId, combatByUser]);

  const resolveCombatPredictions: Ctx["resolveCombatPredictions"] = useCallback(() => {
    if (!sessionId) return;
    setCombatByUser((prev) => {
      const current = prev[sessionId] ?? emptyCombat();
      let xp = current.xp;
      let wins = current.wins;
      let losses = current.losses;
      let streak = current.streak;
      let bestStreak = current.bestStreak;
      const now = Date.now();

      const predictions = current.predictions.map((p) => {
        if (p.status !== "open") return p;
        if (+new Date(p.resolvesAt) > now) return p;
        const sc = SCENARIOS.find((s) => s.id === p.scenarioId);
        if (!sc) return { ...p, status: "lost" as const, points: 0 };
        const actual = outcomeOf(sc);
        const won = p.direction === actual;
        const pts = pointsFor(sc.difficulty, won);
        if (won) {
          wins += 1;
          streak += 1;
          bestStreak = Math.max(bestStreak, streak);
          xp += pts;
        } else {
          losses += 1;
          streak = 0;
        }
        return { ...p, status: won ? "won" as const : "lost" as const, points: pts };
      });

      return {
        ...prev,
        [sessionId]: { xp, wins, losses, streak, bestStreak, predictions },
      };
    });
  }, [sessionId]);

  const combatLeaderboard = useMemo(() => {
    return Object.entries(combatByUser)
      .map(([userId, stats]) => {
        const acc = accounts.find((a) => a.id === userId);
        return {
          userId,
          name: acc
            ? (acc.nickname || `${acc.firstName} ${acc.lastName}`.trim())
            : "Trader",
          avatar: acc?.avatar,
          xp: stats.xp,
          wins: stats.wins,
          losses: stats.losses,
        };
      })
      .filter((r) => r.xp > 0 || r.wins + r.losses > 0)
      .sort((a, b) => b.xp - a.xp)
      .slice(0, 20);
  }, [combatByUser, accounts]);

  /* ---------------------------- Giveaways ---------------------------- */

  const saveGiveaway: Ctx["saveGiveaway"] = useCallback((g) => {
    if (!g.title.trim()) return { ok: false, error: "Title is required." };
    if (!g.reward.trim()) return { ok: false, error: "Reward description is required." };
    if (!g.winners?.length) return { ok: false, error: "Add at least one winner." };
    const now = new Date().toISOString();
    setGiveaways((prev) => {
      if (g.id && prev.some((x) => x.id === g.id)) {
        return prev.map((x) =>
          x.id === g.id
            ? {
                ...x,
                ...g,
                title: g.title.trim(),
                summary: g.summary.trim(),
                body: g.body.trim(),
                reward: g.reward.trim(),
                winners: g.winners,
                announcedAt: g.status === "published" ? (x.announcedAt || now) : x.announcedAt,
              }
            : x
        );
      }
      const created: Giveaway = {
        ...g,
        id: g.id || uid("gv"),
        title: g.title.trim(),
        summary: g.summary.trim(),
        body: g.body.trim(),
        reward: g.reward.trim(),
        winners: g.winners,
        authorId: sessionId ?? undefined,
        authorName: user ? `${user.firstName} ${user.lastName}` : "GAMAT Desk",
        announcedAt: g.status === "published" ? now : "",
        createdAt: now,
      };
      return [created, ...prev];
    });
    return { ok: true };
  }, [sessionId, user]);

  const deleteGiveaway: Ctx["deleteGiveaway"] = useCallback((id) => {
    setGiveaways((p) => p.filter((x) => x.id !== id));
  }, []);

  const publishedGiveaways = useMemo(
    () => giveaways.filter((g) => g.status === "published")
      .sort((a, b) => +new Date(b.announcedAt || b.createdAt) - +new Date(a.announcedAt || a.createdAt)),
    [giveaways]
  );

  /* ---------------------------- Trading Clubs ---------------------------- */

  const createClub: Ctx["createClub"] = useCallback(
    (d) => {
      if (!user) return { ok: false, error: "Please log in or sign up to create a club." };
      if (!d.name.trim()) return { ok: false, error: "Club name is required." };
      if (!d.tagline.trim()) return { ok: false, error: "Tagline is required." };
      if (userClub) return { ok: false, error: "You are already a member of a club. Each student can belong to only 1 club unit." };

      const newClub: TradingClub = {
        id: uid("club"),
        name: d.name.trim(),
        tagline: d.tagline.trim(),
        description: d.description.trim() || d.tagline.trim(),
        focus: d.focus || "General Trading",
        emblem: d.emblem || "Zap",
        color: d.color || "#dc3545",
        leaderId: user.id,
        leaderName: `${user.firstName} ${user.lastName}`,
        leaderAvatar: user.avatar,
        maxMembers: 10,
        members: [
          {
            userId: user.id,
            name: `${user.firstName} ${user.lastName}`,
            avatar: user.avatar,
            role: "lead",
            joinedAt: new Date().toISOString(),
          },
        ],
        createdAt: new Date().toISOString(),
      };

      setClubs((prev) => [newClub, ...prev]);
      return { ok: true, club: newClub };
    },
    [user, userClub]
  );

  const joinClub: Ctx["joinClub"] = useCallback(
    (clubId) => {
      if (!user) return { ok: false, error: "Please log in or sign up to join a club." };
      if (userClub) return { ok: false, error: "You are already in a club. Each student can join only 1 club unit." };

      let err: string | undefined;
      setClubs((prev) =>
        prev.map((c) => {
          if (c.id !== clubId) return c;
          if (c.members.length >= 10) {
            err = "This club is full! Maximum capacity is 10 members.";
            return c;
          }
          if (c.members.some((m) => m.userId === user.id)) {
            err = "You are already in this club.";
            return c;
          }
          const updatedMembers: ClubMember[] = [
            ...c.members,
            {
              userId: user.id,
              name: `${user.firstName} ${user.lastName}`,
              avatar: user.avatar,
              role: "member",
              joinedAt: new Date().toISOString(),
            },
          ];
          return { ...c, members: updatedMembers };
        })
      );

      if (err) return { ok: false, error: err };
      return { ok: true };
    },
    [user, userClub]
  );

  const leaveClub: Ctx["leaveClub"] = useCallback(
    (clubId) => {
      if (!user) return { ok: false, error: "You must be logged in to leave a club." };

      setClubs((prev) =>
        prev
          .map((c) => {
            if (c.id !== clubId) return c;
            const remaining = c.members.filter((m) => m.userId !== user.id);
            if (remaining.length === 0) return null;

            const wasLead = c.leaderId === user.id;
            const nextLead = wasLead ? remaining[0] : null;
            const updatedMembers = remaining.map((m, idx) =>
              wasLead && idx === 0 ? { ...m, role: "lead" as const } : m
            );

            return {
              ...c,
              leaderId: nextLead ? nextLead.userId : c.leaderId,
              leaderName: nextLead ? nextLead.name : c.leaderName,
              leaderAvatar: nextLead ? nextLead.avatar : c.leaderAvatar,
              members: updatedMembers,
            };
          })
          .filter(Boolean) as TradingClub[]
      );

      return { ok: true };
    },
    [user]
  );

  /* ----------------------------- Team pages ----------------------------- */

  const slugify = (s: string) =>
    s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 60);

  const saveTeamProfile: Ctx["saveTeamProfile"] = useCallback((t) => {
    if (!t.name.trim()) return { ok: false, error: "Name is required." };
    if (!t.role.trim()) return { ok: false, error: "Role is required." };
    const now = new Date().toISOString();
    const slug = (t.slug || slugify(t.name)) || uid("tm");
    const isFounder = /founder|lead mentor/i.test(t.role);
    const isSecretary = /secretary/i.test(t.role);

    setTeamProfiles((prev) => {
      const sanitizedPrev = prev.map((x) => {
        if (x.id === t.id) return x;
        let newRole = x.role;
        if (isFounder && /founder|lead mentor/i.test(x.role)) {
          newRole = x.role.replace(/founder|lead mentor/gi, "Mentor").trim() || "Senior Mentor";
        }
        if (isSecretary && /secretary/i.test(x.role)) {
          newRole = x.role.replace(/secretary/gi, "Officer").replace(/&|\s{2,}/g, " ").trim() || "Head of Operations";
        }
        return newRole !== x.role ? { ...x, role: newRole, updatedAt: now } : x;
      });

      if (t.id && sanitizedPrev.some((x) => x.id === t.id)) {
        return sanitizedPrev.map((x) =>
          x.id === t.id
            ? {
                ...x,
                ...t,
                name: t.name.trim(),
                role: t.role.trim(),
                focus: t.focus.trim(),
                bio: t.bio.trim(),
                longBio: t.longBio.trim(),
                expertise: t.expertise ?? [],
                milestones: t.milestones ?? [],
                slug,
                updatedAt: now,
              }
            : x
        );
      }
      const created: TeamProfile = {
        ...t,
        id: t.id || uid("tm"),
        slug,
        name: t.name.trim(),
        role: t.role.trim(),
        focus: t.focus.trim(),
        bio: t.bio.trim(),
        longBio: t.longBio.trim(),
        expertise: t.expertise ?? [],
        milestones: t.milestones ?? [],
        order: t.order ?? prev.length + 1,
        published: t.published !== false,
        createdAt: now,
        updatedAt: now,
      };
      return [...prev, created].sort((a, b) => a.order - b.order);
    });
    return { ok: true };
  }, []);

  const deleteTeamProfile: Ctx["deleteTeamProfile"] = useCallback((id) => {
    setTeamProfiles((p) => p.filter((x) => x.id !== id));
  }, []);

  const publishedTeam = useMemo(
    () => teamProfiles.filter((t) => t.published).sort((a, b) => a.order - b.order),
    [teamProfiles]
  );

  const submitTeamBio: Ctx["submitTeamBio"] = useCallback((b) => {
    if (!sessionId || !user) return { ok: false, error: "Sign in required." };
    if (user.role === "student") return { ok: false, error: "Only staff and admin can submit team bios." };
    if (!b.bio.trim() || !b.role.trim()) return { ok: false, error: "Role and short bio are required." };

    const submission: TeamBioSubmission = {
      id: uid("tb"),
      userId: sessionId,
      name: `${user.firstName} ${user.lastName}`.trim(),
      email: user.email,
      avatar: user.avatar,
      role: b.role.trim(),
      focus: b.focus.trim(),
      bio: b.bio.trim(),
      longBio: b.longBio.trim(),
      expertiseText: b.expertiseText.trim(),
      milestonesText: b.milestonesText.trim(),
      status: "pending",
      createdAt: new Date().toISOString(),
    };
    setTeamBios((prev) => [submission, ...prev.filter((x) => !(x.userId === sessionId && x.status === "pending"))]);
    return { ok: true };
  }, [sessionId, user]);

  const reviewTeamBio: Ctx["reviewTeamBio"] = useCallback((id, status, publish = true) => {
    const sub = teamBios.find((b) => b.id === id);
    if (!sub) return;
    const now = new Date().toISOString();
    setTeamBios((prev) => prev.map((b) => (b.id === id ? { ...b, status, reviewedAt: now } : b)));

    if (status === "approved" && publish) {
      const expertise = sub.expertiseText.split("\n").map((s) => s.trim()).filter(Boolean);
      const milestones = sub.milestonesText.split("\n").map((line) => {
        const [year, ...rest] = line.split("—");
        const titleBody = rest.join("—").trim();
        const [title, ...bodyParts] = titleBody.split(":");
        return {
          year: (year || "").trim() || "—",
          title: (title || "Milestone").trim(),
          body: (bodyParts.join(":") || titleBody || "").trim(),
        };
      }).filter((m) => m.title);

      const existing = teamProfiles.find((t) => t.userId === sub.userId || t.name === sub.name);
      void saveTeamProfile({
        id: existing?.id,
        userId: sub.userId,
        slug: existing?.slug,
        name: sub.name,
        role: sub.role,
        focus: sub.focus,
        bio: sub.bio,
        longBio: sub.longBio || sub.bio,
        expertise: expertise.length ? expertise : existing?.expertise || [],
        milestones: milestones.length ? milestones : existing?.milestones || [],
        avatar: sub.avatar || existing?.avatar,
        order: existing?.order ?? teamProfiles.length + 1,
        published: true,
      });
    }
  }, [teamBios, teamProfiles, saveTeamProfile]);

  const deleteTeamBio: Ctx["deleteTeamBio"] = useCallback((id) => {
    setTeamBios((p) => p.filter((x) => x.id !== id));
  }, []);

  /* --------------------------- Enquiries --------------------------- */

  const submitEnquiry: Ctx["submitEnquiry"] = useCallback((d) => {
    const enq: ServiceEnquiry = {
      ...d,
      id: uid("enq"),
      ref: `ENQ${Date.now().toString().slice(-6)}`,
      userId: sessionId ?? undefined,
      status: "new",
      createdAt: new Date().toISOString(),
    };
    setEnquiries((p) => [enq, ...p]);
    saveSupabaseEnquiry(enq);
    return enq;
  }, [sessionId]);

  /* ------------------------------ Forum ------------------------------ */

  const displayName = useCallback(
    () => (user ? user.nickname?.trim() || `${user.firstName} ${user.lastName}`.trim() : ""),
    [user]
  );

  const rehydratedThreads = useMemo(() => {
    return threads.map((t) => {
      const acc = accounts.find((a) => a.id === t.authorId);
      if (!acc) return t;
      const currentName = acc.nickname?.trim() || `${acc.firstName} ${acc.lastName}`.trim();
      const currentAvatar = acc.avatar;
      if (t.authorName === currentName && t.authorAvatar === currentAvatar) return t;
      return { ...t, authorName: currentName, authorAvatar: currentAvatar };
    });
  }, [threads, accounts]);

  const rehydratedReplies = useMemo(() => {
    return replies.map((r) => {
      const acc = accounts.find((a) => a.id === r.authorId);
      if (!acc) return r;
      const currentName = acc.nickname?.trim() || `${acc.firstName} ${acc.lastName}`.trim();
      const currentAvatar = acc.avatar;
      if (r.authorName === currentName && r.authorAvatar === currentAvatar) return r;
      return { ...r, authorName: currentName, authorAvatar: currentAvatar };
    });
  }, [replies, accounts]);

  const forum: Ctx["forum"] = {
    channels: FORUM_CHANNELS,
    threads: rehydratedThreads,
    replies: rehydratedReplies,
    threadsOf: (channelId) =>
      rehydratedThreads
        .filter((t) => t.channelId === channelId)
        .sort((a, b) => (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0) || +new Date(b.createdAt) - +new Date(a.createdAt)),
    repliesOf: (threadId) =>
      rehydratedReplies.filter((r) => r.threadId === threadId).sort((a, b) => +new Date(a.createdAt) - +new Date(b.createdAt)),
    createThread: ({ channelId, title, body, image }) => {
      if (!user) return { ok: false, error: "You need an account to post." };
      if (title.trim().length < 5) return { ok: false, error: "Please write a longer title." };
      if (body.trim().length < 2 && !image) return { ok: false, error: "Add a message or an image." };
      const t: ForumThread = {
        id: uid("t"), channelId, title: title.trim(), body: body.trim(),
        image: image || undefined,
        authorId: user.id, authorName: displayName(), authorAvatar: user.avatar,
        authorRole: user.role, likes: [], createdAt: new Date().toISOString(),
      };
      setThreads((p) => [t, ...p]);
      saveSupabaseThread(t);
      return { ok: true, id: t.id };
    },
    createReply: (threadId, body, image) => {
      if (!user) return { ok: false, error: "You need an account to reply." };
      if (body.trim().length < 1 && !image) return { ok: false, error: "Write a reply or attach an image." };
      const r: ForumReply = {
        id: uid("r"), threadId, authorId: user.id, authorName: displayName(),
        authorAvatar: user.avatar, authorRole: user.role, body: body.trim(),
        image: image || undefined,
        likes: [], createdAt: new Date().toISOString(),
      };
      setReplies((p) => [...p, r]);
      saveSupabaseReply(r);
      return { ok: true };
    },
    toggleThreadLike: (id) => {
      if (!user) return;
      setThreads((p) => p.map((t) => {
        if (t.id !== id) return t;
        const updated = {
          ...t, likes: t.likes.includes(user.id) ? t.likes.filter((x) => x !== user.id) : [...t.likes, user.id],
        };
        saveSupabaseThread(updated);
        return updated;
      }));
    },
    toggleReplyLike: (id) => {
      if (!user) return;
      setReplies((p) => p.map((r) => {
        if (r.id !== id) return r;
        const updated = {
          ...r, likes: r.likes.includes(user.id) ? r.likes.filter((x) => x !== user.id) : [...r.likes, user.id],
        };
        saveSupabaseReply(updated);
        return updated;
      }));
    },
    deleteThread: (id) => {
      setThreads((p) => p.filter((t) => t.id !== id));
      setReplies((p) => p.filter((r) => r.threadId !== id));
      deleteSupabaseThread(id);
    },
    deleteReply: (id) => {
      setReplies((p) => p.filter((r) => r.id !== id));
      deleteSupabaseReply(id);
    },
    togglePin: (id) => setThreads((p) => p.map((t) => {
      if (t.id === id) {
        const updated = { ...t, pinned: !t.pinned };
        saveSupabaseThread(updated);
        return updated;
      }
      return t;
    })),
  };

  /* ------------------------------ Admin ------------------------------ */

  const kpis = useMemo(() => {
    const paid = payments.filter((p) => p.status === "paid");
    const revenue = paid.reduce((s, p) => s + p.amount, 0);
    const refunded = payments.filter((p) => p.status === "refunded").reduce((s, p) => s + p.amount, 0);
    return {
      students: accounts.filter((a) => a.role === "student").length,
      admins: accounts.filter((a) => a.role === "admin").length,
      revenue,
      refunded,
      enrollments: allEnrollments.length,
      registrations: registrations.filter((r) => r.status === "confirmed").length,
      events: events.length,
      avgOrder: paid.length ? Math.round(revenue / paid.length) : 0,
    };
  }, [accounts, payments, allEnrollments, registrations, events]);

  const revenueByMonth = useMemo(() => {
    const out: { label: string; value: number }[] = [];
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const label = d.toLocaleString("en", { month: "short" });
      const value = payments
        .filter((p) => {
          const pd = new Date(p.createdAt);
          return p.status === "paid" && pd.getMonth() === d.getMonth() && pd.getFullYear() === d.getFullYear();
        })
        .reduce((s, p) => s + p.amount, 0);
      out.push({ label, value });
    }
    return out;
  }, [payments]);

  const admin: Ctx["admin"] = {
    accounts,
    enrollments: allEnrollments,
    payments,
    registrations,
    posts,
    enquiries,
    setEnquiryStatus: (id, status) => setEnquiries((p) => p.map((e) => (e.id === id ? { ...e, status } : e))),
    deleteEnquiry: (id) => setEnquiries((p) => p.filter((e) => e.id !== id)),
    kpis,
    revenueByMonth,
    updateAccount: (id, patch) => {
      setAccounts((p) => {
        const updated = p.map((a) => (a.id === id ? { ...a, ...patch } : a));
        const acc = updated.find((a) => a.id === id);
        if (acc) saveSupabaseAccount(acc);
        return updated;
      });
    },
    deleteAccount: (id) => {
      setAccounts((p) => p.filter((a) => a.id !== id));
      setAllEnrollments((p) => p.filter((e) => e.userId !== id));
      if (sessionId === id) setSessionId(null);
      deleteSupabaseAccount(id);
    },
    createAccount: (d) => {
      const email = d.email.trim().toLowerCase();
      if (accounts.some((a) => a.email === email)) return { ok: false, error: "Email already in use." };
      const newAcc: Account = { ...d, email, id: uid("u"), joined: new Date().toISOString() };
      setAccounts((p) => [...p, newAcc]);
      saveSupabaseAccount(newAcc);
      if (d.password) signUpSupabaseUser(email, d.password, d);
      return { ok: true };
    },
    enrollUser: (userId, courseId) => {
      const newEnr: Enrollment = { id: uid("en"), userId, courseId, enrolledAt: new Date().toISOString(), completedLessons: [] };
      setAllEnrollments((p) => {
        if (p.some((e) => e.userId === userId && e.courseId === courseId)) return p;
        return [...p, newEnr];
      });
      saveSupabaseEnrollment(newEnr);
    },
    removeEnrollment: (id) => {
      setAllEnrollments((p) => p.filter((e) => e.id !== id));
      deleteSupabaseEnrollment(id);
    },
    setPaymentStatus: (id, status) => {
      setPayments((prev) => {
        const paymentToUpdate = prev.find((x) => x.id === id);
        if (paymentToUpdate) {
          const updatedPay: Payment = { ...paymentToUpdate, status };
          saveSupabasePayment(updatedPay);
          if (status === "refunded") {
            setAllEnrollments((enr) => {
              const toRemove = enr.filter((e) => e.userId === paymentToUpdate.userId && e.courseId === paymentToUpdate.courseId);
              toRemove.forEach((e) => deleteSupabaseEnrollment(e.id));
              return enr.filter((e) => !(e.userId === paymentToUpdate.userId && e.courseId === paymentToUpdate.courseId));
            });
          }
        }
        return prev.map((x) => (x.id === id ? { ...x, status } : x));
      });
    },
    deletePayment: (id) => {
      setPayments((p) => p.filter((x) => x.id !== id));
      deleteSupabasePayment(id);
    },
    saveEvent: (e) => {
      setEvents((p) => (p.some((x) => x.id === e.id) ? p.map((x) => (x.id === e.id ? e : x)) : [e, ...p]));
      saveSupabaseEvent(e);
    },
    deleteEvent: (id) => {
      setEvents((p) => p.filter((e) => e.id !== id));
      setRegistrations((p) => p.filter((r) => r.eventId !== id));
      deleteSupabaseEvent(id);
    },
    setRegistrationStatus: (id, status) => setRegistrations((p) => p.map((r) => (r.id === id ? { ...r, status } : r))),
    deleteRegistration: (id) => setRegistrations((p) => p.filter((r) => r.id !== id)),
    setCourseSetting: (courseId, patch) =>
      setCourseSettings((p) => ({ ...p, [courseId]: { ...p[courseId], ...patch } })),
    resetDemoData: () => {
      setAllEnrollments([]); setPayments([]); setRegistrations([]); setEnquiries([]);
      setEvents(DEFAULT_EVENTS); setCourseSettings({});
      setThreads(SEED_THREADS); setReplies(SEED_REPLIES);
      setAttempts([]); setPosts([]);
      setNews(SEED_NEWS); setOutlooks(SEED_OUTLOOKS); setManagedCourses([]);
      setGiveaways(SEED_GIVEAWAYS);
      setTeamProfiles(SEED_TEAM);
      setTeamBios([]);
      setAccounts((p) => p.filter((a) => a.role === "admin"));
    },
  };

  const saveStudentOfTheWeek: Ctx["saveStudentOfTheWeek"] = useCallback((s) => {
    if (!s.studentName.trim()) return { ok: false, error: "Student name is required." };
    if (!s.track.trim()) return { ok: false, error: "Course track is required." };
    const now = new Date().toISOString();
    const updated: StudentOfTheWeek = {
      ...s,
      id: s.id || uid("sotw"),
      studentName: s.studentName.trim(),
      track: s.track.trim(),
      weekPeriod: s.weekPeriod || `Week of ${new Date().toLocaleDateString("en-US", { month: "short", day: "numeric" })}, 2026`,
      winRate: s.winRate || "88.0%",
      quizXP: s.quizXP || "1,000 XP",
      combatRank: s.combatRank || "Apex Master",
      weeklyReturn: s.weeklyReturn || "+20.0%",
      performanceReview: s.performanceReview || "Exceptional market analysis and execution consistency.",
      createdAt: now,
    };
    setStudentOfTheWeek(updated);
    setStudentOfTheWeekHistory((prev) => [updated, ...prev.filter((x) => x.id !== updated.id)]);
    saveSupabaseSOTW(updated);
    return { ok: true };
  }, []);

  const activityNotifications: ActivityNotification[] = useMemo(() => {
    const list: ActivityNotification[] = [];

    // 1. Registrations
    accounts.forEach((a) => {
      list.push({
        id: `notif_reg_${a.id}`,
        type: "registration",
        title: "New Student Registered",
        body: `${a.firstName} ${a.lastName} (${a.email}) created an account.`,
        timestamp: a.joined,
        link: "/admin/students",
        read: false,
      });
    });

    // 2. Payments & Refunds
    payments.forEach((p) => {
      const isRefund = p.status === "refunded";
      list.push({
        id: `notif_pay_${p.id}`,
        type: isRefund ? "refund" : "payment",
        title: isRefund ? "Payment Refunded" : "Payment Received",
        body: `${p.userName} paid ₦${p.amount.toLocaleString()} for ${p.courseTitle}.`,
        timestamp: p.createdAt,
        link: "/admin/payments",
        read: false,
      });
    });

    // 3. Blog submissions
    posts.forEach((p) => {
      list.push({
        id: `notif_post_${p.id}`,
        type: "article",
        title: p.status === "published" ? "Blog Article Published" : "New Article Draft",
        body: `"${p.title}" by ${p.authorName}.`,
        timestamp: p.createdAt,
        link: "/admin/posts",
        read: false,
      });
    });

    // 4. Team bios
    teamBios.forEach((b) => {
      list.push({
        id: `notif_bio_${b.id}`,
        type: "team_bio",
        title: "Team Member Bio Submission",
        body: `${b.name} submitted bio draft for review.`,
        timestamp: b.createdAt,
        link: "/admin/team",
        read: false,
      });
    });

    // Sort by timestamp descending
    return list.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }, [accounts, payments, posts, teamBios]);

  const sendClubMessage: Ctx["sendClubMessage"] = useCallback(({ clubId, content, image, replyToId, replyToName }) => {
    if (!sessionId || !user) return { ok: false, error: "Sign in required to chat." };
    if (!content.trim() && !image) return { ok: false, error: "Write a message or upload an image." };
    const club = clubs.find((c) => c.id === clubId);
    if (!club) return { ok: false, error: "Club not found." };
    const member = club.members.find((m) => m.userId === user.id);
    if (!member) return { ok: false, error: "You must be a member of this club to participate in discussions." };

    const msg: ClubMessage = {
      id: uid("cm"),
      clubId,
      userId: user.id,
      userName: `${user.firstName} ${user.lastName}`,
      userAvatar: user.avatar,
      userRole: member.role,
      content: content.trim(),
      image: image || undefined,
      likes: [],
      dislikes: [],
      emojis: {},
      replyToId,
      replyToName,
      createdAt: new Date().toISOString(),
    };
    setClubMessages((prev) => [msg, ...prev]);
    return { ok: true };
  }, [sessionId, user, clubs]);

  const toggleClubMessageVote: Ctx["toggleClubMessageVote"] = useCallback((messageId, vote) => {
    if (!sessionId) return;
    setClubMessages((prev) =>
      prev.map((msg) => {
        if (msg.id !== messageId) return msg;
        const hasLiked = msg.likes.includes(sessionId);
        const hasDisliked = msg.dislikes.includes(sessionId);
        let nextLikes = msg.likes;
        let nextDislikes = msg.dislikes;

        if (vote === "like") {
          nextLikes = hasLiked ? msg.likes.filter((id) => id !== sessionId) : [...msg.likes, sessionId];
          nextDislikes = msg.dislikes.filter((id) => id !== sessionId);
        } else {
          nextDislikes = hasDisliked ? msg.dislikes.filter((id) => id !== sessionId) : [...msg.dislikes, sessionId];
          nextLikes = msg.likes.filter((id) => id !== sessionId);
        }
        return { ...msg, likes: nextLikes, dislikes: nextDislikes };
      })
    );
  }, [sessionId]);

  const toggleClubMessageEmoji: Ctx["toggleClubMessageEmoji"] = useCallback((messageId, emoji) => {
    if (!sessionId) return;
    setClubMessages((prev) =>
      prev.map((msg) => {
        if (msg.id !== messageId) return msg;
        const currentList = msg.emojis[emoji] ?? [];
        const hasEmoji = currentList.includes(sessionId);
        const nextList = hasEmoji
          ? currentList.filter((id) => id !== sessionId)
          : [...currentList, sessionId];
        return {
          ...msg,
          emojis: { ...msg.emojis, [emoji]: nextList },
        };
      })
    );
  }, [sessionId]);

  const saveCoupon: Ctx["saveCoupon"] = useCallback((c) => {
    const code = c.code.trim().toUpperCase();
    if (!code) return { ok: false, error: "Coupon code is required." };
    if (c.discountPercent <= 0 || c.discountPercent > 100) return { ok: false, error: "Discount must be between 1% and 100%." };

    setCoupons((prev) => {
      const exists = prev.some((x) => x.id === c.id);
      if (exists) {
        return prev.map((x) => (x.id === c.id ? { ...x, ...c, code } : x));
      }
      const newCoupon: Coupon = {
        ...c,
        id: uid("cp"),
        code,
        usedCount: 0,
        createdAt: new Date().toISOString(),
      };
      return [newCoupon, ...prev];
    });
    return { ok: true };
  }, []);

  const deleteCoupon: Ctx["deleteCoupon"] = useCallback((id) => {
    setCoupons((prev) => prev.filter((c) => c.id !== id));
  }, []);

  const validateCoupon: Ctx["validateCoupon"] = useCallback((code, target = "all") => {
    const clean = code.trim().toUpperCase();
    if (!clean) return { ok: false, error: "Enter a coupon code." };
    const found = coupons.find((c) => c.code === clean);
    if (!found) return { ok: false, error: "Invalid coupon code." };
    if (found.status !== "active") return { ok: false, error: "This coupon is no longer active." };
    if (found.usedCount >= found.maxUses) return { ok: false, error: "This coupon has reached its maximum redemptions." };
    if (found.expiryDate && new Date(found.expiryDate).getTime() < Date.now()) {
      return { ok: false, error: "This coupon has expired." };
    }
    if (found.applicableTo !== "all" && target !== "all" && found.applicableTo !== target) {
      return { ok: false, error: `This coupon is only valid for ${found.applicableTo}.` };
    }
    return { ok: true, coupon: found, discountPercent: found.discountPercent };
  }, [coupons]);

  const addReview: Ctx["addReview"] = useCallback((d) => {
    if (!user) return { ok: false, error: "Please log in or create an account to post a review." };
    if (!d.comment.trim()) return { ok: false, error: "Please write a comment for your review." };

    const defaultLoc = user.country ? `${user.country}` : "Lagos, Nigeria";
    const rev: ReviewItem = {
      id: uid("rev"),
      userId: user.id,
      userName: user.nickname?.trim() || `${user.firstName} ${user.lastName}`.trim(),
      userAvatar: user.avatar,
      userLocation: d.userLocation?.trim() || defaultLoc,
      targetType: d.targetType,
      targetId: d.targetId,
      targetTitle: d.targetTitle,
      rating: Math.min(5, Math.max(1, d.rating)),
      comment: d.comment.trim(),
      createdAt: new Date().toISOString(),
    };

    setReviews((prev) => [rev, ...prev]);
    saveSupabaseReview(rev);
    return { ok: true, review: rev };
  }, [user]);

  const value: Ctx = {
    user, isAuthed: !!user, isAdmin: user?.role === "admin",
    login, signup, logout, updateProfile,
    enrollments: myEnrollments, isEnrolled, getEnrollment, enroll,
    toggleLesson, setLastLesson, progressOf, stats,
    priceOf, courseSettings,
    recordPayment, myPayments,
    events: publicEvents, allEvents: events, seatsLeft, registerForEvent,
    myRegistrations, cancelRegistration,
    isStaff: user?.role === "staff",
    can, permissions,
    attempts: myAttempts, submitAttempt, bestAttempt, hasPassedQuiz,
    posts, myPosts, publishedPosts, savePost, deletePost, setPostStatus,
    news, publishedNews, saveNews, deleteNews,
    outlooks, publishedOutlooks, saveOutlook, deleteOutlook,
    managedCourses, saveManagedCourse, deleteManagedCourse,
    combat, placeCombatPrediction, resolveCombatPredictions, combatLeaderboard,
    giveaways, publishedGiveaways, saveGiveaway, deleteGiveaway,
    teamProfiles, publishedTeam, saveTeamProfile, deleteTeamProfile,
    teamBios, submitTeamBio, reviewTeamBio, deleteTeamBio,
    submitEnquiry,
    clubs, userClub, createClub, joinClub, leaveClub,
    clubMessages, sendClubMessage, toggleClubMessageVote, toggleClubMessageEmoji,
    studentOfTheWeek, studentOfTheWeekHistory, saveStudentOfTheWeek,
    reviews, addReview,
    activityNotifications,
    coupons, saveCoupon, deleteCoupon, validateCoupon,
    forum,
    admin,
  };

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore(): Ctx {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used within StoreProvider");
  return ctx;
}

export { COURSES, DEFAULT_EVENTS };
