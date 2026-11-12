import { useState } from "react";
import {
  Download,
  Copy,
  Check,
  Share2,
  ExternalLink,
  MessageCircle,
  Send,
  Loader2,
  CheckCircle2,
  ArrowRight,
  BookOpen,
  SlidersHorizontal,
  ShieldCheck,
  Percent,
  User,
  RotateCcw,
  Edit3,
  Palette,
  CheckCircle,
} from "lucide-react";
import {
  type AffiliateProfile,
  type AffiliateCardTheme,
  DEFAULT_INVITE_MESSAGE,
  PRESET_INVITE_MESSAGES,
  getSignupReferralUrl,
  exportAffiliateCardAsPng,
} from "../lib/affiliate";

function XIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" {...props}>
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

function FacebookIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" {...props}>
      <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" />
    </svg>
  );
}

export type EnrolledCourseItem = {
  id: string;
  title: string;
  isPaid?: boolean;
  enrolledAt?: string;
};

export type AvailableCourseItem = {
  id: string;
  title: string;
  price?: number;
};

type Props = {
  profile: AffiliateProfile;
  avatarUrl?: string;
  enrolledCourses?: EnrolledCourseItem[];
  availableCourses?: AvailableCourseItem[];
  onUpdateQuote?: (quote: string) => void;
  onUpdateCourseTitle?: (title: string) => void;
  onUpdateDisplayName?: (name: string) => void;
};

export default function AffiliateCard({
  profile,
  avatarUrl,
  enrolledCourses = [],
  availableCourses = [],
  onUpdateQuote,
  onUpdateCourseTitle,
  onUpdateDisplayName,
}: Props) {
  const [cardTheme, setCardTheme] = useState<AffiliateCardTheme>("red");
  const [downloading, setDownloading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [copiedCaption, setCopiedCaption] = useState(false);

  // Student card personalization
  const [cardDisplayName, setCardDisplayName] = useState(
    profile.cardDisplayName || profile.userName || "Student Trader"
  );
  const [courseTitle, setCourseTitle] = useState(() => {
    if (profile.enrolledCourseTitle) return profile.enrolledCourseTitle;
    if (enrolledCourses.length > 0) return enrolledCourses[0].title;
    return "Forex Foundations";
  });

  const [isCustomCourse, setIsCustomCourse] = useState(false);
  const [customCourseText, setCustomCourseText] = useState("");

  const [inviteMessage, setInviteMessage] = useState(
    profile.personalQuote || DEFAULT_INVITE_MESSAGE
  );

  const referralUrl = getSignupReferralUrl(profile.referralCode);
  const qrApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&margin=8&data=${encodeURIComponent(referralUrl)}`;

  const activeDisplayName = cardDisplayName.trim() || profile.userName || "Student Trader";
  const initials = activeDisplayName
    .split(" ")
    .filter(Boolean)
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase() || "ST";

  const copyLink = () => {
    try {
      navigator.clipboard.writeText(referralUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {}
  };

  const copyCaption = () => {
    try {
      navigator.clipboard.writeText(shareText);
      setCopiedCaption(true);
      setTimeout(() => setCopiedCaption(false), 2500);
    } catch {}
  };

  const handleDownload = async () => {
    setDownloading(true);
    try {
      const activeProfile: AffiliateProfile = {
        ...profile,
        cardDisplayName: activeDisplayName,
        userName: profile.userName,
        personalQuote: inviteMessage,
        enrolledCourseTitle: courseTitle,
      };
      const dataUrl = await exportAffiliateCardAsPng(activeProfile, avatarUrl, cardTheme);
      const link = document.createElement("a");
      link.download = `GAMAT-Enrollment-Invite-${profile.referralCode}-${cardTheme}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error("Failed to download card:", err);
    } finally {
      setDownloading(false);
    }
  };

  const shareText = `${inviteMessage} 👉 ${referralUrl} (Invite Code: ${profile.referralCode})`;

  const fallbackCatalogCourses: AvailableCourseItem[] =
    availableCourses.length > 0
      ? availableCourses
      : [
          { id: "forex-foundations", title: "Forex Foundations Masterclass", price: 0 },
          { id: "fundamental-supply-demand", title: "Fundamental & Supply and Demand", price: 45000 },
          { id: "price-action", title: "Price Action Mastery", price: 65000 },
          { id: "institutional-orderflow", title: "Institutional Order Flow & Liquidity", price: 85000 },
        ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
      {/* ================= Left: The Visual Share Card & Instant Action Buttons (5 Cols) ================= */}
      <div className="lg:col-span-5 w-full flex flex-col items-center space-y-4">
        {/* Top Header & Theme Switcher */}
        <div className="w-full max-w-[360px] flex items-center justify-between px-1">
          <div className="flex items-center gap-2 text-xs font-bold text-ink">
            <Share2 className="h-4 w-4 text-brand" />
            <span>Enrollment Share Card</span>
          </div>

          {/* Theme Switcher Toggle */}
          <div className="flex items-center gap-1.5 bg-white border border-line p-1 rounded-full shadow-xs">
            <button
              type="button"
              onClick={() => setCardTheme("red")}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold transition cursor-pointer ${
                cardTheme === "red"
                  ? "bg-brand text-white shadow-xs"
                  : "text-muted hover:text-ink"
              }`}
              title="Crimson Theme"
            >
              <span className="h-2.5 w-2.5 rounded-full bg-red-400 border border-white" />
              <span>Red</span>
            </button>
            <button
              type="button"
              onClick={() => setCardTheme("dark")}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold transition cursor-pointer ${
                cardTheme === "dark"
                  ? "bg-slate-900 text-white shadow-xs"
                  : "text-muted hover:text-ink"
              }`}
              title="Dark Theme"
            >
              <span className="h-2.5 w-2.5 rounded-full bg-slate-700 border border-white/40" />
              <span>Dark</span>
            </button>
          </div>
        </div>

        {/* The Visual Social Card (Exact 2.76 x 4.75 in Aspect Ratio) */}
        <div
          id="student-enrollment-card"
          style={{ aspectRatio: "2.76 / 4.75" }}
          className={`relative overflow-hidden rounded-3xl p-5 sm:p-6 text-white shadow-2xl transition-all duration-300 w-full max-w-[360px] mx-auto flex flex-col justify-between ${
            cardTheme === "red"
              ? "bg-gradient-to-b from-[#83141f] via-[#a52230] to-[#4e0911] border border-white/20"
              : "bg-gradient-to-b from-[#080c14] via-[#0d1322] to-[#070a10] border border-white/10"
          }`}
        >
          {/* Ambient Glows */}
          {cardTheme === "red" ? (
            <>
              <div className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-white/10 blur-3xl" />
              <div className="pointer-events-none absolute -bottom-16 -left-16 h-56 w-56 rounded-full bg-black/35 blur-3xl" />
            </>
          ) : (
            <>
              <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-brand/20 blur-3xl" />
              <div className="pointer-events-none absolute -bottom-16 -left-16 h-48 w-48 rounded-full bg-sky-500/15 blur-3xl" />
            </>
          )}

          {/* 1. TOP CENTER: Student Profile Avatar (Enlarged) */}
          <div className="relative pt-1 flex flex-col items-center">
            <div className="relative">
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt={activeDisplayName}
                  className={`h-24 w-24 sm:h-28 sm:w-28 rounded-full object-cover shadow-xl ${
                    cardTheme === "red" ? "ring-4 sm:ring-[5px] ring-white/95" : "ring-4 sm:ring-[5px] ring-brand"
                  }`}
                />
              ) : (
                <div
                  className={`flex h-24 w-24 sm:h-28 sm:w-28 shrink-0 items-center justify-center rounded-full font-display text-2xl sm:text-3xl font-black text-white shadow-xl ${
                    cardTheme === "red"
                      ? "bg-gradient-to-br from-white/25 to-black/20 ring-4 sm:ring-[5px] ring-white/95"
                      : "bg-gradient-to-br from-brand to-brand-dark ring-4 sm:ring-[5px] ring-brand"
                  }`}
                >
                  {initials}
                </div>
              )}
              {/* Checkmark overlay */}
              <div
                className={`absolute bottom-0.5 right-0.5 flex h-6 w-6 sm:h-7 sm:w-7 items-center justify-center rounded-full bg-sky-600 text-white text-xs sm:text-sm font-black shadow-md ${
                  cardTheme === "red" ? "ring-2 ring-[#83141f]" : "ring-2 ring-[#080c14]"
                }`}
              >
                ✓
              </div>
            </div>

            {/* 2. Student Name on Card (Enlarged) */}
            <h4 className="mt-2.5 font-display text-xl sm:text-2xl font-black text-white text-center truncate max-w-[300px] tracking-tight leading-tight">
              {activeDisplayName}
            </h4>

            {/* 3. Selected Enrolled Course */}
            <p
              className={`mt-0.5 text-xs font-semibold text-center truncate max-w-[280px] ${
                cardTheme === "red" ? "text-rose-200" : "text-sky-400"
              }`}
            >
              Enrolled in: {courseTitle}
            </p>
          </div>

          {/* 4. Elegant Tapering Divider */}
          <div
            className={`my-2 sm:my-2.5 h-px w-full bg-gradient-to-r from-transparent to-transparent ${
              cardTheme === "red" ? "via-white/30" : "via-white/20"
            }`}
          />

          {/* 5. "Join Me at" + GAMAT Logo & Wordmark (Enlarged) */}
          <div className="relative flex flex-col items-center text-center">
            <p
              className={`font-display font-bold text-[10px] uppercase tracking-wider ${
                cardTheme === "red" ? "text-white/90" : "text-slate-300"
              }`}
            >
              Join Me at
            </p>

            {/* Enlarged GAMAT Candlestick Logo Tile + Wordmark */}
            <div className="flex items-center justify-center gap-2.5 mt-1.5">
              <span
                className={`flex h-11 w-11 sm:h-12 sm:w-12 shrink-0 items-center justify-center rounded-xl shadow-md ${
                  cardTheme === "red" ? "bg-white" : "bg-[#dc3545]"
                }`}
              >
                <svg width="28" height="28" viewBox="0 0 32 32" fill="none" aria-hidden="true">
                  <line
                    x1="4"
                    y1="26"
                    x2="28"
                    y2="26"
                    stroke={cardTheme === "red" ? "#b02a37" : "white"}
                    strokeOpacity="0.3"
                    strokeWidth="1"
                  />
                  <line
                    x1="8.5"
                    y1="7"
                    x2="8.5"
                    y2="24"
                    stroke={cardTheme === "red" ? "#b02a37" : "white"}
                    strokeOpacity="0.75"
                    strokeWidth="1.4"
                    strokeLinecap="round"
                  />
                  <rect
                    x="6.2"
                    y="10"
                    width="4.6"
                    height="10"
                    rx="1"
                    fill={cardTheme === "red" ? "#b02a37" : "white"}
                    fillOpacity="0.6"
                  />
                  <line
                    x1="16"
                    y1="5"
                    x2="16"
                    y2="24"
                    stroke={cardTheme === "red" ? "#b02a37" : "white"}
                    strokeWidth="1.6"
                    strokeLinecap="round"
                  />
                  <rect
                    x="13.4"
                    y="9"
                    width="5.2"
                    height="12"
                    rx="1.1"
                    fill={cardTheme === "red" ? "#b02a37" : "white"}
                  />
                  <line
                    x1="23.5"
                    y1="9"
                    x2="23.5"
                    y2="24"
                    stroke={cardTheme === "red" ? "#b02a37" : "white"}
                    strokeOpacity="0.8"
                    strokeWidth="1.4"
                    strokeLinecap="round"
                  />
                  <rect
                    x="21.2"
                    y="13"
                    width="4.6"
                    height="8"
                    rx="1"
                    fill={cardTheme === "red" ? "#b02a37" : "white"}
                    fillOpacity="0.8"
                  />
                  <path
                    d="M5.5 21.5 C10 18.5, 13 14.5, 16.5 12.5 C20 10.5, 23 9.5, 27 8"
                    stroke={cardTheme === "red" ? "#b02a37" : "white"}
                    strokeOpacity="0.45"
                    strokeWidth="1.2"
                    strokeLinecap="round"
                    fill="none"
                  />
                </svg>
              </span>
              <span className="flex flex-col items-start justify-center leading-none text-left">
                <span className="block font-display font-black text-lg sm:text-xl text-white">
                  GAMAT<span className={cardTheme === "red" ? "text-rose-200" : "text-brand"}>&nbsp;Fx</span>
                </span>
                <span
                  className={`block text-[9.5px] sm:text-[10.5px] font-extrabold uppercase tracking-[0.25em] mt-0.5 ${
                    cardTheme === "red" ? "text-white/80" : "text-white/70"
                  }`}
                >
                  Academy
                </span>
              </span>
            </div>

            <p
              className={`mt-2 text-[10px] max-w-[250px] leading-tight ${
                cardTheme === "red" ? "text-rose-100/90" : "text-slate-400"
              }`}
            >
              Scan the QR code below to connect with my cohort &amp; learn together
            </p>

            {/* QR Code Container (Slightly Reduced as Requested) */}
            <div className="mt-2 rounded-xl bg-white p-2 shadow-md border border-slate-200">
              <img
                src={qrApiUrl}
                alt="Referral QR Code"
                className="h-20 w-20 sm:h-22 sm:w-22 object-contain"
                loading="lazy"
              />
            </div>

            {/* Invite Code */}
            <div className="mt-2 flex items-center justify-center gap-1.5 text-xs">
              <span
                className={`text-[10px] font-bold tracking-wider uppercase ${
                  cardTheme === "red" ? "text-white/80" : "text-slate-400"
                }`}
              >
                INVITE CODE:
              </span>
              <span
                className={`font-mono text-sm sm:text-base font-black ${
                  cardTheme === "red" ? "text-white" : "text-brand"
                }`}
              >
                {profile.referralCode}
              </span>
            </div>

            {/* Domain */}
            <p
              className={`mt-0.5 text-[11px] font-bold font-mono tracking-wide ${
                cardTheme === "red" ? "text-rose-200" : "text-sky-400"
              }`}
            >
              gamatfxacademy.com
            </p>
          </div>

          {/* Watermark Footer */}
          <div className="mt-2 text-center border-t border-white/10 pt-1.5">
            <p className="text-[9px] text-white/50">
              2.76 × 4.75 in • GAMAT Official Share Card
            </p>
          </div>
        </div>

        {/* Action Controls Directly Under Card */}
        <div className="w-full max-w-[360px] space-y-2.5">
          <button
            type="button"
            onClick={handleDownload}
            disabled={downloading}
            className="w-full flex items-center justify-center gap-2 rounded-xl bg-brand px-4 py-3 text-xs sm:text-sm font-bold text-white shadow-md shadow-brand/25 hover:bg-brand-dark transition cursor-pointer disabled:opacity-50"
          >
            {downloading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Generating High-Res PNG...</span>
              </>
            ) : (
              <>
                <Download className="h-4 w-4" />
                <span>Download Share Card PNG</span>
              </>
            )}
          </button>

          {/* 1-Click Social Channel Share Icons */}
          <div className="rounded-xl border border-line bg-white p-3 shadow-xs flex items-center justify-between gap-2">
            <span className="text-[11px] font-bold text-ink">Share Now:</span>
            <div className="flex items-center gap-2">
              {/* WhatsApp */}
              <a
                href={`https://api.whatsapp.com/send?text=${encodeURIComponent(shareText)}`}
                target="_blank"
                rel="noopener noreferrer"
                title="Share on WhatsApp"
                aria-label="Share on WhatsApp"
                className="flex h-9 w-9 items-center justify-center rounded-full bg-[#25D366] text-white shadow-sm transition hover:scale-110"
              >
                <MessageCircle className="h-4.5 w-4.5 stroke-[2.2]" />
              </a>

              {/* Telegram */}
              <a
                href={`https://t.me/share/url?url=${encodeURIComponent(referralUrl)}&text=${encodeURIComponent(shareText)}`}
                target="_blank"
                rel="noopener noreferrer"
                title="Share on Telegram"
                aria-label="Share on Telegram"
                className="flex h-9 w-9 items-center justify-center rounded-full bg-[#229ED9] text-white shadow-sm transition hover:scale-110"
              >
                <Send className="h-4 w-4 stroke-[2.2] -translate-x-0.5 -translate-y-0.5" />
              </a>

              {/* X / Twitter */}
              <a
                href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}`}
                target="_blank"
                rel="noopener noreferrer"
                title="Share on X"
                aria-label="Share on X"
                className="flex h-9 w-9 items-center justify-center rounded-full bg-black text-white shadow-sm transition hover:scale-110"
              >
                <XIcon className="h-4 w-4" />
              </a>

              {/* Facebook */}
              <a
                href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(referralUrl)}`}
                target="_blank"
                rel="noopener noreferrer"
                title="Share on Facebook"
                aria-label="Share on Facebook"
                className="flex h-9 w-9 items-center justify-center rounded-full bg-[#1877F2] text-white shadow-sm transition hover:scale-110"
              >
                <FacebookIcon className="h-4 w-4" />
              </a>

              {/* Copy Link */}
              <button
                type="button"
                onClick={copyLink}
                title="Copy Invite Link"
                className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-900 text-white shadow-sm transition hover:scale-110 cursor-pointer"
              >
                {copied ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ================= Right: Card Customization Studio & Sharing Suite (7 Cols) ================= */}
      <div className="lg:col-span-7 space-y-6">
        {/* CARD 1: Interactive Card Personalization & Enrolled Course Selector */}
        <div className="rounded-2xl border border-line bg-white p-5 sm:p-6 shadow-sm space-y-5">
          <div className="flex items-center justify-between border-b border-line pb-4">
            <div>
              <div className="inline-flex items-center gap-1.5 rounded-full bg-brand-light px-3 py-1 text-xs font-bold text-brand">
                <SlidersHorizontal className="h-3.5 w-3.5" />
                <span>Card Personalization Studio</span>
              </div>
              <h3 className="mt-2 font-display text-lg font-bold text-ink">
                Customize What Appears on Your Card
              </h3>
              <p className="mt-0.5 text-xs text-muted">
                Choose the exact name and course displayed on your official share card.
              </p>
            </div>
            <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full">
              <CheckCircle className="h-3 w-3" /> Real-Time Preview
            </span>
          </div>

          {/* 1. Name to Show on Card Input */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-ink flex items-center gap-1.5">
                <User className="h-3.5 w-3.5 text-brand" />
                <span>Name to Show on Card</span>
              </label>
              {cardDisplayName !== profile.userName && (
                <button
                  type="button"
                  onClick={() => {
                    setCardDisplayName(profile.userName);
                    onUpdateDisplayName?.(profile.userName);
                  }}
                  className="text-[11px] font-semibold text-muted hover:text-brand flex items-center gap-1 transition cursor-pointer"
                >
                  <RotateCcw className="h-3 w-3" /> Reset to "{profile.userName}"
                </button>
              )}
            </div>
            <div className="relative">
              <input
                type="text"
                value={cardDisplayName}
                onChange={(e) => {
                  const val = e.target.value;
                  setCardDisplayName(val);
                  onUpdateDisplayName?.(val);
                }}
                placeholder="e.g. Tonye Taylor or Lead Trader Tonye"
                className="w-full rounded-xl border border-line bg-white px-3.5 py-2.5 text-xs sm:text-sm font-semibold text-ink placeholder-muted/60 outline-none transition focus:border-brand shadow-xs"
              />
            </div>
            <p className="text-[11px] text-muted">
              You decide the full name, preferred name, or trading alias that prints on your official card.
            </p>
          </div>

          {/* 2. Enrolled & Paid Course Selection Section */}
          <div className="space-y-2 pt-2 border-t border-line/70">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-ink flex items-center gap-1.5">
                <BookOpen className="h-3.5 w-3.5 text-brand" />
                <span>Enrolled &amp; Paid Courses</span>
              </label>
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted">
                {enrolledCourses.length > 0
                  ? `${enrolledCourses.length} Enrolled Course(s)`
                  : "Catalog Selection"}
              </span>
            </div>

            {enrolledCourses.length > 0 ? (
              <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                {enrolledCourses.map((c) => {
                  const isSelected =
                    !isCustomCourse && courseTitle.toLowerCase() === c.title.toLowerCase();
                  return (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => {
                        setIsCustomCourse(false);
                        setCourseTitle(c.title);
                        onUpdateCourseTitle?.(c.title);
                      }}
                      className={`w-full text-left p-3 rounded-xl border transition cursor-pointer flex items-center justify-between gap-3 ${
                        isSelected
                          ? "border-brand bg-brand/5 shadow-xs ring-1 ring-brand/20"
                          : "border-line bg-white hover:border-slate-300 hover:bg-slate-50"
                      }`}
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-bold text-xs sm:text-sm text-ink truncate">{c.title}</p>
                          {c.isPaid ? (
                            <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-purple-50 text-purple-700 border border-purple-200 shrink-0">
                              PAID ENROLLMENT
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200 shrink-0">
                              ENROLLED
                            </span>
                          )}
                        </div>
                        {c.enrolledAt && (
                          <p className="text-[10px] text-muted mt-0.5">
                            Enrolled: {new Date(c.enrolledAt).toLocaleDateString()}
                          </p>
                        )}
                      </div>

                      <span
                        className={`h-5 w-5 rounded-full border flex items-center justify-center shrink-0 transition ${
                          isSelected
                            ? "border-brand bg-brand text-white"
                            : "border-slate-300 bg-white"
                        }`}
                      >
                        {isSelected && <Check className="h-3 w-3 stroke-[3]" />}
                      </span>
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="rounded-xl border border-amber-200/80 bg-amber-50/50 p-3.5 space-y-2.5">
                <p className="text-[11px] text-amber-900 font-medium">
                  You haven't enrolled in a paid course yet. Select from our flagship programs below to feature on your card:
                </p>
                <div className="space-y-1.5">
                  {fallbackCatalogCourses.map((c) => {
                    const isSelected =
                      !isCustomCourse && courseTitle.toLowerCase() === c.title.toLowerCase();
                    return (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => {
                          setIsCustomCourse(false);
                          setCourseTitle(c.title);
                          onUpdateCourseTitle?.(c.title);
                        }}
                        className={`w-full text-left px-3 py-2 rounded-lg border text-xs font-semibold transition cursor-pointer flex items-center justify-between ${
                          isSelected
                            ? "border-brand bg-brand text-white shadow-xs"
                            : "border-line bg-white text-ink hover:bg-slate-50"
                        }`}
                      >
                        <span className="truncate">{c.title}</span>
                        {isSelected && <Check className="h-3.5 w-3.5 shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Custom Course Name Option */}
            <div className="pt-1 flex items-center justify-between">
              {!isCustomCourse ? (
                <button
                  type="button"
                  onClick={() => {
                    setIsCustomCourse(true);
                    setCustomCourseText(courseTitle);
                  }}
                  className="text-[11px] font-semibold text-brand hover:underline inline-flex items-center gap-1 cursor-pointer"
                >
                  <Edit3 className="h-3 w-3" /> Or type a custom course title
                </button>
              ) : (
                <div className="w-full space-y-1.5 pt-1">
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={customCourseText}
                      onChange={(e) => {
                        setCustomCourseText(e.target.value);
                        setCourseTitle(e.target.value);
                        onUpdateCourseTitle?.(e.target.value);
                      }}
                      placeholder="e.g. Institutional Order Flow & Liquidity Playbook"
                      className="flex-1 rounded-xl border border-line bg-white px-3 py-2 text-xs font-semibold text-ink focus:border-brand outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setIsCustomCourse(false);
                        const fallback = enrolledCourses[0]?.title || "Forex Foundations";
                        setCourseTitle(fallback);
                        onUpdateCourseTitle?.(fallback);
                      }}
                      className="text-xs font-bold text-muted hover:text-ink px-2.5 py-2 cursor-pointer"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* 3. Marketing Share Message / Hook */}
          <div className="space-y-2 pt-2 border-t border-line/70">
            <label className="text-xs font-bold text-ink flex items-center gap-1.5">
              <SlidersHorizontal className="h-3.5 w-3.5 text-brand" />
              <span>Marketing Share Caption</span>
            </label>
            <div className="space-y-1.5">
              {PRESET_INVITE_MESSAGES.map((msg, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    setInviteMessage(msg);
                    onUpdateQuote?.(msg);
                  }}
                  className={`w-full text-left p-2.5 rounded-lg transition cursor-pointer border text-[11px] leading-relaxed ${
                    inviteMessage === msg
                      ? "border-brand bg-brand/5 text-ink font-bold"
                      : "border-line bg-cream text-muted hover:text-ink hover:bg-slate-100"
                  }`}
                >
                  "{msg}"
                </button>
              ))}
            </div>

            <textarea
              rows={2}
              value={inviteMessage}
              onChange={(e) => {
                setInviteMessage(e.target.value);
                onUpdateQuote?.(e.target.value);
              }}
              placeholder="Or write your own custom invitation hook..."
              className="mt-1 w-full rounded-xl border border-line bg-cream p-2 text-xs text-ink focus:border-brand focus:outline-none"
            />
          </div>
        </div>

        {/* CARD 2: 1-Click Sharing Suite & Unique Invite Link */}
        <div className="rounded-2xl border border-line bg-white p-5 sm:p-6 shadow-sm space-y-4">
          <div>
            <div className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-800">
              <Share2 className="h-3.5 w-3.5 text-brand" />
              <span>Instant Social Sharing</span>
            </div>
            <h3 className="mt-2 font-display text-lg font-bold text-ink">
              Share Your Card &amp; Invite Link
            </h3>
            <p className="mt-1 text-xs text-muted leading-relaxed">
              When friends use your link or scan your card code, they can register at no cost. You earn a <strong>15% commission</strong> whenever they enroll in paid courses or purchase trading tools.
            </p>
          </div>

          {/* Quick Copy Link & Caption Box */}
          <div className="rounded-xl border border-line bg-cream p-3 flex flex-col sm:flex-row items-center gap-2.5">
            <div className="min-w-0 flex-1 text-left w-full sm:w-auto">
              <p className="text-[10px] uppercase font-bold text-muted">Your Unique Invite Link</p>
              <p className="font-mono text-xs font-bold text-ink truncate select-all">
                {referralUrl}
              </p>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                type="button"
                onClick={copyLink}
                className="flex-1 sm:flex-initial px-3.5 py-2 rounded-lg bg-slate-900 text-white font-bold text-xs hover:bg-slate-800 transition cursor-pointer flex items-center justify-center gap-1.5 shrink-0"
              >
                {copied ? (
                  <>
                    <Check className="h-3.5 w-3.5 text-emerald-400" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-3.5 w-3.5" />
                    <span>Copy Link</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={copyCaption}
                title="Copy marketing caption and link together"
                className="flex-1 sm:flex-initial px-3.5 py-2 rounded-lg border border-line bg-white text-ink font-bold text-xs hover:bg-slate-50 transition cursor-pointer flex items-center justify-center gap-1.5 shrink-0 shadow-sm"
              >
                {copiedCaption ? (
                  <>
                    <Check className="h-3.5 w-3.5 text-emerald-600" />
                    <span>Copied Text!</span>
                  </>
                ) : (
                  <>
                    <MessageCircle className="h-3.5 w-3.5 text-brand" />
                    <span>Copy Text + Link</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* CARD 3: 3-Step 15% Commission Engine Explainer */}
        <div className="rounded-2xl border border-line bg-white p-5 sm:p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <Percent className="h-4 w-4 text-brand" />
            <h4 className="font-display text-sm font-bold text-ink">
              How the 15% Commission Program Works
            </h4>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div className="rounded-xl bg-cream p-4 border border-line flex flex-col justify-between">
              <div>
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-brand text-[11px] font-bold text-white mb-2">
                  1
                </span>
                <p className="font-bold text-ink">Share Card &amp; Link</p>
                <p className="mt-1 text-muted text-[11px] leading-relaxed">
                  Post your enrollment card to your WhatsApp status, Instagram, or share your link directly.
                </p>
              </div>
            </div>

            <div className="rounded-xl bg-cream p-4 border border-line flex flex-col justify-between">
              <div>
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-900 text-[11px] font-bold text-white mb-2">
                  2
                </span>
                <p className="font-bold text-ink">Friends Register</p>
                <p className="mt-1 text-muted text-[11px] leading-relaxed">
                  They register using your link or QR code at no cost to start learning with you.
                </p>
              </div>
            </div>

            <div className="rounded-xl bg-emerald-50/60 p-4 border border-emerald-200/60 flex flex-col justify-between">
              <div>
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-600 text-[11px] font-bold text-white mb-2">
                  3
                </span>
                <p className="font-bold text-emerald-950">Earn 15% Cash</p>
                <p className="mt-1 text-emerald-800 text-[11px] leading-relaxed">
                  When they purchase paid mentorship or store trading tools, you receive an instant 15% cash payout!
                </p>
              </div>
            </div>
          </div>

          {/* Program Terms Pill */}
          <div className="mt-4 rounded-xl bg-slate-50 p-3 border border-slate-200 text-[11px] text-muted flex flex-wrap items-center justify-between gap-2">
            <span className="flex items-center gap-1.5 font-medium">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
              <span>Withdrawals paid via Nigerian Bank Transfer, USDT (TRC20), or PayPal</span>
            </span>
            <span className="font-bold text-slate-700">Minimum Payout: ₦10,000</span>
          </div>
        </div>
      </div>
    </div>
  );
}
