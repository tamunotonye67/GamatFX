import React, { useEffect, Suspense, lazy, Component, type ErrorInfo, type ReactNode } from "react";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import AboutUs from "./pages/AboutUs";
import CommunityPage from "./pages/CommunityPage";
import CoursesPage from "./pages/CoursesPage";
import CourseDetailPage from "./pages/CourseDetailPage";
import ServicesPage from "./pages/ServicesPage";
import ReviewsPage from "./pages/ReviewsPage";
import EventsPage from "./pages/EventsPage";
import HowItWorksPage from "./pages/HowItWorksPage";
import FaqPage from "./pages/FaqPage";
import ContactPage from "./pages/ContactPage";
import { TermsPage, PrivacyPage } from "./pages/LegalPage";
import { LoginPage, SignUpPage, ForgotPasswordPage, ResetPasswordPage, VerifyEmailPage } from "./pages/AuthPage";
import ServiceDetailPage from "./pages/ServiceDetailPage";
import { captureReferralFromUrl } from "./lib/affiliate";
import { useStore } from "./lib/store";
import { useRoute, segments, isJobsSubdomain } from "./lib/router";
import { findRoleGuideBySlug, ROLE_GUIDES } from "./lib/jobRoleGuides";
import DiscoverySurveyModal from "./components/DiscoverySurveyModal";

function lazyWithRetry<T extends React.ComponentType<any>>(
  importer: () => Promise<{ default: T }>
): React.LazyExoticComponent<T> {
  return lazy(async () => {
    const key = "gamat:chunk_reload";
    try {
      const mod = await importer();
      try { sessionStorage.removeItem(key); } catch {}
      return mod;
    } catch (err: any) {
      const msg = String(err?.message || err || "");
      const isChunkError =
        msg.includes("Failed to fetch dynamically imported module") ||
        msg.includes("Importing a module script failed") ||
        msg.includes("Loading chunk") ||
        msg.includes("Loading CSS chunk");
      if (isChunkError && typeof window !== "undefined") {
        let alreadyReloaded = false;
        try { alreadyReloaded = sessionStorage.getItem(key) === "1"; } catch {}
        if (!alreadyReloaded) {
          try { sessionStorage.setItem(key, "1"); } catch {}
          window.location.reload();
          return new Promise<never>(() => {});
        }
      }
      throw err;
    }
  });
}

const CheckoutPage = lazyWithRetry(() => import("./pages/CheckoutPage"));
const LearnPage = lazyWithRetry(() => import("./pages/LearnPage"));
const DashboardPage = lazyWithRetry(() => import("./pages/DashboardPage"));
const QuizPage = lazyWithRetry(() => import("./pages/QuizPage"));
const VerifyCertificatePage = lazyWithRetry(() => import("./pages/VerifyCertificatePage"));
const WhiteboardPage = lazyWithRetry(() => import("./pages/WhiteboardPage"));
const StorePage = lazyWithRetry(() => import("./pages/StorePage"));
const MentorPage = lazyWithRetry(() => import("./pages/MentorPage"));
const MentorshipSurveyPage = lazyWithRetry(() => import("./pages/MentorshipSurveyPage"));

const BlogPage = lazyWithRetry(() => import("./pages/BlogPage").then((m) => ({ default: m.BlogPage })));
const BlogPostPage = lazyWithRetry(() => import("./pages/BlogPage").then((m) => ({ default: m.BlogPostPage })));
const ForumPage = lazyWithRetry(() => import("./pages/ForumPage").then((m) => ({ default: m.ForumPage })));
const ForumChannelPage = lazyWithRetry(() => import("./pages/ForumPage").then((m) => ({ default: m.ForumChannelPage })));
const ForumThreadPage = lazyWithRetry(() => import("./pages/ForumPage").then((m) => ({ default: m.ForumThreadPage })));
const NewsPage = lazyWithRetry(() => import("./pages/NewsPage").then((m) => ({ default: m.NewsPage })));
const NewsDetailPage = lazyWithRetry(() => import("./pages/NewsPage").then((m) => ({ default: m.NewsDetailPage })));
const OutlookPage = lazyWithRetry(() => import("./pages/OutlookPage").then((m) => ({ default: m.OutlookPage })));
const OutlookDetailPage = lazyWithRetry(() => import("./pages/OutlookPage").then((m) => ({ default: m.OutlookDetailPage })));
const GiveawaysPage = lazyWithRetry(() => import("./pages/GiveawaysPage").then((m) => ({ default: m.GiveawaysPage })));
const GiveawayDetailPage = lazyWithRetry(() => import("./pages/GiveawaysPage").then((m) => ({ default: m.GiveawayDetailPage })));
const TeamPage = lazyWithRetry(() => import("./pages/TeamPages").then((m) => ({ default: m.TeamPage })));
const TeamMemberPage = lazyWithRetry(() => import("./pages/TeamPages").then((m) => ({ default: m.TeamMemberPage })));

const FunZonePage = lazyWithRetry(() => import("./pages/fun/FunZonePage"));
const QuizArcadePage = lazyWithRetry(() => import("./pages/fun/QuizArcadePage"));
const MillionairePage = lazyWithRetry(() => import("./pages/fun/MillionairePage"));
const LiveChartPage = lazyWithRetry(() => import("./pages/fun/LiveChartPage"));
const MarketCombatPage = lazyWithRetry(() => import("./pages/fun/MarketCombatPage"));
const HistofactPage = lazyWithRetry(() => import("./pages/fun/HistofactPage"));
const ClubBuilderPage = lazyWithRetry(() => import("./pages/fun/ClubBuilderPage"));
const StudentOfTheWeekPage = lazyWithRetry(() => import("./pages/fun/StudentOfTheWeekPage").then((m) => ({ default: m.StudentOfTheWeekPage })));

const AdminDashboard = lazyWithRetry(() => import("./pages/admin/AdminMain").then((m) => ({ default: m.AdminDashboard })));
const AdminStudents = lazyWithRetry(() => import("./pages/admin/AdminMain").then((m) => ({ default: m.AdminStudents })));
const AdminCourses = lazyWithRetry(() => import("./pages/admin/AdminMain").then((m) => ({ default: m.AdminCourses })));
const AdminPayments = lazyWithRetry(() => import("./pages/admin/AdminOps").then((m) => ({ default: m.AdminPayments })));
const AdminEvents = lazyWithRetry(() => import("./pages/admin/AdminOps").then((m) => ({ default: m.AdminEvents })));
const AdminRegistrations = lazyWithRetry(() => import("./pages/admin/AdminOps").then((m) => ({ default: m.AdminRegistrations })));
const AdminSettings = lazyWithRetry(() => import("./pages/admin/AdminOps").then((m) => ({ default: m.AdminSettings })));
const AdminEnquiries = lazyWithRetry(() => import("./pages/admin/AdminEnquiries").then((m) => ({ default: m.AdminEnquiries })));
const AdminStaff = lazyWithRetry(() => import("./pages/admin/AdminStaff").then((m) => ({ default: m.AdminStaff })));
const AdminPosts = lazyWithRetry(() => import("./pages/admin/AdminStaff").then((m) => ({ default: m.AdminPosts })));
const AdminBroadcast = lazyWithRetry(() => import("./pages/admin/AdminBroadcast").then((m) => ({ default: m.AdminBroadcast })));
const AdminNews = lazyWithRetry(() => import("./pages/admin/AdminUpdates").then((m) => ({ default: m.AdminNews })));
const AdminOutlooks = lazyWithRetry(() => import("./pages/admin/AdminUpdates").then((m) => ({ default: m.AdminOutlooks })));
const AdminCourseManager = lazyWithRetry(() => import("./pages/admin/AdminUpdates").then((m) => ({ default: m.AdminCourseManager })));
const AdminGiveaways = lazyWithRetry(() => import("./pages/admin/AdminGiveaways").then((m) => ({ default: m.AdminGiveaways })));
const AdminTeam = lazyWithRetry(() => import("./pages/admin/AdminTeam").then((m) => ({ default: m.AdminTeam })));
const AdminStudentOfTheWeek = lazyWithRetry(() => import("./pages/admin/AdminStudentOfTheWeek").then((m) => ({ default: m.AdminStudentOfTheWeek })));
const AdminCoupons = lazyWithRetry(() => import("./pages/admin/AdminCoupons").then((m) => ({ default: m.AdminCoupons })));
const AdminAnalytics = lazyWithRetry(() => import("./pages/admin/AdminAnalytics").then((m) => ({ default: m.AdminAnalytics })));
const AdminInvoices = lazyWithRetry(() => import("./pages/admin/AdminInvoicesAndAssets").then((m) => ({ default: m.AdminInvoices })));
const AdminCompanyAssets = lazyWithRetry(() => import("./pages/admin/AdminInvoicesAndAssets").then((m) => ({ default: m.AdminCompanyAssets })));
const AdminWhiteboard = lazyWithRetry(() => import("./pages/admin/AdminWhiteboard").then((m) => ({ default: m.AdminWhiteboard })));
const AdminStore = lazyWithRetry(() => import("./pages/admin/AdminStore").then((m) => ({ default: m.AdminStore })));
const AdminAffiliates = lazyWithRetry(() => import("./pages/admin/AdminAffiliates").then((m) => ({ default: m.AdminAffiliates })));
const AdminGallery = lazyWithRetry(() => import("./pages/admin/AdminGallery").then((m) => ({ default: m.AdminGallery })));
const AdminJobs = lazyWithRetry(() => import("./pages/admin/AdminJobs").then((m) => ({ default: m.AdminJobs })));
const GalleryPage = lazyWithRetry(() => import("./pages/GalleryPage"));
const JobsPage = lazyWithRetry(() => import("./pages/JobsPage"));
const JobRoleDetailPage = lazyWithRetry(() => import("./pages/JobRoleDetailPage"));

function PageLoader() {
  return (
    <div className="flex min-h-[50vh] items-center justify-center p-8">
      <div className="flex flex-col items-center gap-3">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-brand border-t-transparent" />
        <span className="text-xs font-medium text-muted">Loading...</span>
      </div>
    </div>
  );
}

export class ErrorBoundary extends Component<{ children?: ReactNode }, { hasError: boolean; error: Error | null }> {
  public state = {
    hasError: false,
    error: null as Error | null,
  };

  public static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("App ErrorBoundary caught:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center p-6 text-center select-none">
          <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl space-y-4">
            <div className="h-12 w-12 rounded-2xl bg-rose-500/20 text-rose-400 flex items-center justify-center mx-auto text-xl font-bold">
              ⚠️
            </div>
            <h2 className="text-lg font-bold text-white">Something went wrong</h2>
            <p className="text-xs text-slate-400 bg-slate-950 p-3 rounded-xl font-mono text-left overflow-auto max-h-36">
              {this.state.error?.message || "An unexpected error occurred while rendering this page."}
            </p>
            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  try {
                    localStorage.removeItem("gamat_fx_saved_drafts");
                    localStorage.removeItem("gamat_fx_trashed_tabs");
                  } catch {}
                  window.location.reload();
                }}
                className="flex-1 py-2.5 rounded-xl bg-brand text-white text-xs font-bold hover:bg-brand-dark transition cursor-pointer"
              >
                Reset & Reload
              </button>
              <button
                type="button"
                onClick={() => {
                  window.location.hash = "#/";
                  window.location.reload();
                }}
                className="flex-1 py-2.5 rounded-xl border border-white/20 bg-white/10 text-xs font-bold hover:bg-white/20 transition cursor-pointer"
              >
                Go Home
              </button>
            </div>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

const staticPages: Record<string, React.ComponentType> = {
  "/": Home,
  "/about": AboutUs,
  "/community": CommunityPage,
  "/courses": CoursesPage,
  "/services": ServicesPage,
  "/reviews": ReviewsPage,
  "/events": EventsPage,
  "/how-it-works": HowItWorksPage,
  "/faq": FaqPage,
  "/terms": TermsPage,
  "/privacy": PrivacyPage,
  "/contact": ContactPage,
  "/login": LoginPage,
  "/signup": SignUpPage,
  "/verify-email": VerifyEmailPage,
  "/forgot-password": ForgotPasswordPage,
  "/reset-password": ResetPasswordPage,
  "/dashboard": DashboardPage,
  "/mentorship-survey": MentorshipSurveyPage,
  "/whiteboard": WhiteboardPage,
  "/store": StorePage,
  "/admin": AdminDashboard,
  "/admin/analytics": AdminAnalytics,
  "/admin/students": AdminStudents,
  "/admin/courses": AdminCourses,
  "/admin/whiteboard": AdminWhiteboard,
  "/admin/payments": AdminPayments,
  "/admin/invoices": AdminInvoices,
  "/admin/company-assets": AdminCompanyAssets,
  "/admin/coupons": AdminCoupons,
  "/admin/store": AdminStore,
  "/admin/affiliates": AdminAffiliates,
  "/admin/events": AdminEvents,
  "/admin/registrations": AdminRegistrations,
  "/admin/enquiries": AdminEnquiries,
  "/admin/staff": AdminStaff,
  "/admin/posts": AdminPosts,
  "/admin/settings": AdminSettings,
  "/blog": BlogPage,
  "/forum": ForumPage,
  "/fun": FunZonePage,
  "/fun/quiz": QuizArcadePage,
  "/fun/millionaire": MillionairePage,
  "/fun/live-chart": LiveChartPage,
  "/fun/market-combat": MarketCombatPage,
  "/fun/histofact": HistofactPage,
  "/fun/clubs": ClubBuilderPage,
  "/fun/student-of-the-week": StudentOfTheWeekPage,
  "/news": NewsPage,
  "/outlook": OutlookPage,
  "/mentor": MentorPage,
  "/giveaways": GiveawaysPage,
  "/team": TeamPage,
  "/gallery": GalleryPage,
  "/jobs": JobsPage,
  "/admin/team": AdminTeam,
  "/admin/gallery": AdminGallery,
  "/admin/jobs": AdminJobs,
  "/admin/news": AdminNews,
  "/admin/outlooks": AdminOutlooks,
  "/admin/giveaways": AdminGiveaways,
  "/admin/course-manager": AdminCourseManager,
  "/admin/student-of-the-week": AdminStudentOfTheWeek,
  "/admin/broadcast": AdminBroadcast,
  "/verify-certificate": VerifyCertificatePage,
};

/** Routes rendered without the marketing chrome. */
const BARE = ["/login", "/signup", "/forgot-password", "/reset-password", "/verify-email", "/checkout", "/learn", "/admin", "/quiz"];

/** Interactive & workspace routes that keep the Navbar but use a slim 1-line copyright bar instead of the full marketing Footer. */
const SLIM_FOOTER = ["/fun", "/dashboard", "/mentorship-survey", "/forum", "/store"];

export default function App() {
  const route = useRoute();
  const [first, second] = segments(route);
  const { recordReferralClick } = useStore();

  useEffect(() => {
    const code = captureReferralFromUrl();
    if (code) {
      recordReferralClick(code);
    }
  }, [recordReferralClick]);

  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, [route]);

  let content: React.ReactNode;

  if (first === "courses" && second) {
    content = <CourseDetailPage id={second} />;
  } else if (first === "services" && second) {
    content = <ServiceDetailPage slug={second} />;
  } else if (first === "blog" && second) {
    content = <BlogPostPage slug={second} />;
  } else if (first === "forum" && second) {
    const third = segments(route)[2];
    content = third ? <ForumThreadPage threadId={third} /> : <ForumChannelPage channelId={second} />;
  } else if (first === "news" && second) {
    content = <NewsDetailPage id={second} />;
  } else if (first === "outlook" && second) {
    content = <OutlookDetailPage id={second} />;
  } else if (first === "giveaways" && second) {
    content = <GiveawayDetailPage id={second} />;
  } else if (first === "team" && second) {
    content = <TeamMemberPage slug={second} />;
  } else if (first === "checkout" && second) {
    content = <CheckoutPage id={second} />;
  } else if (first === "quiz" && second) {
    content = <QuizPage courseId={second} />;
  } else if (first === "learn" && second) {
    content = <LearnPage id={second} />;
  } else if (first === "store") {
    content = <StorePage categoryParam={second} />;
  } else if (first === "jobs" && second) {
    const guide = findRoleGuideBySlug(second) || ROLE_GUIDES[0];
    content = <JobRoleDetailPage guide={guide} />;
  } else if (route === "/" && isJobsSubdomain()) {
    content = <JobsPage />;
  } else {
    const Page = staticPages[route] ?? Home;
    content = <Page />;
  }

  const suspendedContent = <Suspense fallback={<PageLoader />}>{content}</Suspense>;

  if (route === "/whiteboard") {
    return (
      <ErrorBoundary>
        <div className="min-h-screen bg-slate-900">{suspendedContent}</div>
      </ErrorBoundary>
    );
  }

  const isJobsView =
    route === "/jobs" ||
    route.startsWith("/jobs/") ||
    (route === "/" && isJobsSubdomain());
  if (isJobsView) {
    return (
      <ErrorBoundary>
        <div className="min-h-screen bg-cream">{suspendedContent}</div>
      </ErrorBoundary>
    );
  }

  const isAdminRoute = route === "/admin" || route.startsWith("/admin/");
  const isAuthRoute = route === "/login" || route === "/signup" || route === "/forgot-password" || route === "/reset-password" || route === "/verify-email";
  const bare = BARE.some((b) => route === b || route.startsWith(`${b}/`));
  const slimFooter = SLIM_FOOTER.some((p) => route === p || route.startsWith(`${p}/`));

  if (bare) {
    if (isAdminRoute || isAuthRoute) {
      return (
        <ErrorBoundary>
          <div className="min-h-screen bg-cream">{suspendedContent}</div>
        </ErrorBoundary>
      );
    }

    if (route.startsWith("/learn")) {
      return (
        <ErrorBoundary>
          <div className="h-dvh w-full overflow-hidden bg-ink">{suspendedContent}</div>
        </ErrorBoundary>
      );
    }

    return (
      <ErrorBoundary>
        <div className="flex min-h-screen flex-col bg-cream overflow-x-clip w-full max-w-full">
          <div className="flex-1 w-full max-w-full overflow-x-clip">{suspendedContent}</div>
          <div className="border-t border-line bg-ink px-4 sm:px-6 py-4 text-center text-[11px] sm:text-xs text-white/50">
            Copyright © {new Date().getFullYear()}{" "}
            <span className="font-semibold text-white/75">GAMAT Fx Academy</span>. All rights reserved.
          </div>
        </div>
      </ErrorBoundary>
    );
  }

  return (
    <ErrorBoundary>
      <div className="flex min-h-screen flex-col bg-cream overflow-x-clip w-full max-w-full">
        <Navbar />
        <main key={route} className="flex-1 w-full max-w-full overflow-x-clip animate-[fadeIn_.35s_ease]">
          {suspendedContent}
        </main>
        {route === "/verify-email" ? null : slimFooter ? (
          <footer className="border-t border-white/10 bg-ink px-4 sm:px-6 py-4 text-center text-[11px] sm:text-xs text-white/50">
            Copyright © {new Date().getFullYear()}{" "}
            <span className="font-semibold text-white/75">GAMAT Fx Academy</span>. All rights reserved.
          </footer>
        ) : (
          <Footer />
        )}
        <DiscoverySurveyModal />
      </div>
    </ErrorBoundary>
  );
}
