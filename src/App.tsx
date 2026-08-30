import { useEffect } from "react";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import AboutUs from "./pages/AboutUs";
import CommunityPage from "./pages/CommunityPage";
import CoursesPage from "./pages/CoursesPage";
import CourseDetailPage from "./pages/CourseDetailPage";
import CheckoutPage from "./pages/CheckoutPage";
import LearnPage from "./pages/LearnPage";
import DashboardPage from "./pages/DashboardPage";
import ServicesPage from "./pages/ServicesPage";
import ReviewsPage from "./pages/ReviewsPage";
import EventsPage from "./pages/EventsPage";
import HowItWorksPage from "./pages/HowItWorksPage";
import FaqPage from "./pages/FaqPage";
import ContactPage from "./pages/ContactPage";
import { TermsPage, PrivacyPage } from "./pages/LegalPage";
import { LoginPage, SignUpPage, ForgotPasswordPage, ResetPasswordPage } from "./pages/AuthPage";
import { AdminDashboard, AdminStudents, AdminCourses } from "./pages/admin/AdminMain";
import { AdminPayments, AdminEvents, AdminRegistrations, AdminSettings } from "./pages/admin/AdminOps";
import { AdminEnquiries } from "./pages/admin/AdminEnquiries";
import ServiceDetailPage from "./pages/ServiceDetailPage";
import { BlogPage, BlogPostPage } from "./pages/BlogPage";
import { ForumPage, ForumChannelPage, ForumThreadPage } from "./pages/ForumPage";
import { AdminStaff, AdminPosts } from "./pages/admin/AdminStaff";
import QuizPage from "./pages/QuizPage";
import FunZonePage from "./pages/fun/FunZonePage";
import QuizArcadePage from "./pages/fun/QuizArcadePage";
import MillionairePage from "./pages/fun/MillionairePage";
import LiveChartPage from "./pages/fun/LiveChartPage";
import MarketCombatPage from "./pages/fun/MarketCombatPage";
import HistofactPage from "./pages/fun/HistofactPage";
import ClubBuilderPage from "./pages/fun/ClubBuilderPage";
import { NewsPage, NewsDetailPage } from "./pages/NewsPage";
import { OutlookPage, OutlookDetailPage } from "./pages/OutlookPage";
import { AdminNews, AdminOutlooks, AdminCourseManager } from "./pages/admin/AdminUpdates";
import MentorPage from "./pages/MentorPage";
import MentorshipSurveyPage from "./pages/MentorshipSurveyPage";
import { GiveawaysPage, GiveawayDetailPage } from "./pages/GiveawaysPage";
import { AdminGiveaways } from "./pages/admin/AdminGiveaways";
import { TeamPage, TeamMemberPage } from "./pages/TeamPages";
import { AdminTeam } from "./pages/admin/AdminTeam";
import { StudentOfTheWeekPage } from "./pages/fun/StudentOfTheWeekPage";
import { AdminStudentOfTheWeek } from "./pages/admin/AdminStudentOfTheWeek";
import { AdminCoupons } from "./pages/admin/AdminCoupons";
import { AdminAnalytics } from "./pages/admin/AdminAnalytics";
import { AdminInvoices, AdminCompanyAssets } from "./pages/admin/AdminInvoicesAndAssets";
import { AdminWhiteboard } from "./pages/admin/AdminWhiteboard";
import WhiteboardPage from "./pages/WhiteboardPage";
import { useRoute, segments } from "./lib/router";

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
  "/forgot-password": ForgotPasswordPage,
  "/reset-password": ResetPasswordPage,
  "/dashboard": DashboardPage,
  "/mentorship-survey": MentorshipSurveyPage,
  "/whiteboard": WhiteboardPage,
  "/admin": AdminDashboard,
  "/admin/analytics": AdminAnalytics,
  "/admin/students": AdminStudents,
  "/admin/courses": AdminCourses,
  "/admin/whiteboard": AdminWhiteboard,
  "/admin/payments": AdminPayments,
  "/admin/invoices": AdminInvoices,
  "/admin/company-assets": AdminCompanyAssets,
  "/admin/coupons": AdminCoupons,
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
  "/admin/team": AdminTeam,
  "/admin/news": AdminNews,
  "/admin/outlooks": AdminOutlooks,
  "/admin/giveaways": AdminGiveaways,
  "/admin/course-manager": AdminCourseManager,
  "/admin/student-of-the-week": AdminStudentOfTheWeek,
};

/** Routes rendered without the marketing chrome. */
const BARE = ["/login", "/signup", "/forgot-password", "/reset-password", "/checkout", "/learn", "/admin", "/quiz"];

export default function App() {
  const route = useRoute();
  const [first, second] = segments(route);

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
  } else {
    const Page = staticPages[route] ?? Home;
    content = <Page />;
  }

  if (route === "/whiteboard") {
    return <div className="min-h-screen bg-slate-900">{content}</div>;
  }

  const isAdminRoute = route === "/admin" || route.startsWith("/admin/");
  const isAuthRoute = route === "/login" || route === "/signup" || route === "/forgot-password" || route === "/reset-password";
  const bare = BARE.some((b) => route === b || route.startsWith(`${b}/`));

  if (bare) {
    if (isAdminRoute || isAuthRoute) {
      return <div className="min-h-screen bg-cream">{content}</div>;
    }

    return (
      <div className="flex min-h-screen flex-col bg-cream">
        <div className="flex-1">{content}</div>
        <div className="border-t border-line bg-ink px-6 py-5 text-center text-xs text-white/50">
          Copyright © {new Date().getFullYear()}{" "}
          <span className="font-semibold text-white/75">GAMAT Fx Academy</span>. All rights reserved.
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream">
      <Navbar />
      <main key={route} className="animate-[fadeIn_.35s_ease]">
        {content}
      </main>
      <Footer />
    </div>
  );
}
