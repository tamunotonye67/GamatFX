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
  User,
  RotateCcw,
  Edit3,
  Palette,
  CheckCircle,
  ChevronDown,
  Printer,
} from "lucide-react";
import {
  type AffiliateProfile,
  type AffiliateCardTheme,
  DEFAULT_INVITE_MESSAGE,
  PRESET_INVITE_MESSAGES,
  getSignupReferralUrl,
  exportAffiliateCardAsPng,
} from "../lib/affiliate";

function WhatsAppIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" {...props}>
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.82 11.82 0 00-3.48-8.413z" />
    </svg>
  );
}

function TelegramIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" {...props}>
      <path d="m20.665 3.717-17.73 6.837c-1.21.486-1.203 1.161-.222 1.462l4.552 1.42 10.532-6.645c.498-.303.953-.14.579.192l-8.533 7.701h-.002l-.313 4.674c.459 0 .661-.21.916-.459l2.199-2.138 4.573 3.378c.843.464 1.448.225 1.658-.785l3-14.135c.307-1.23-.469-1.785-1.407-1.328z" />
    </svg>
  );
}

function XIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" width="15" height="15" fill="currentColor" {...props}>
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

function FacebookIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" {...props}>
      <path d="M14 13.5h2.5l.5-3.5h-3V7.5c0-.9.4-1.5 1.5-1.5h1.5V2.3c-.6-.1-1.6-.3-2.7-.3-2.8 0-4.8 1.7-4.8 4.8V10H6v3.5h3.5V22h4.5v-8.5z" />
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
  commissionPercent?: number;
  minimumPayoutAmount?: number;
  onUpdateQuote?: (quote: string) => void;
  onUpdateCourseTitle?: (title: string) => void;
  onUpdateDisplayName?: (name: string) => void;
};

export default function AffiliateCard({
  profile,
  avatarUrl,
  enrolledCourses = [],
  availableCourses = [],
  commissionPercent = 15,
  minimumPayoutAmount = 10000,
  onUpdateQuote,
  onUpdateCourseTitle,
  onUpdateDisplayName,
}: Props) {
  const [cardTheme, setCardTheme] = useState<AffiliateCardTheme>("red");
  const [downloading, setDownloading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
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

  // Collapsible dropdown toggles
  const [courseDropdownOpen, setCourseDropdownOpen] = useState(false);
  const [captionCollapsibleOpen, setCaptionCollapsibleOpen] = useState(false);

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

  const copyCode = () => {
    try {
      navigator.clipboard.writeText(profile.referralCode);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2500);
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
    <div className="space-y-8">
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
            <button
              type="button"
              onClick={copyCode}
              title="Click to copy invite code"
              className="mt-2 flex items-center justify-center gap-1.5 text-xs cursor-pointer group transition"
            >
              <span
                className={`text-[10px] font-bold tracking-wider uppercase ${
                  cardTheme === "red" ? "text-white/80" : "text-slate-400"
                }`}
              >
                INVITE CODE:
              </span>
              <span
                className={`font-mono text-sm sm:text-base font-black group-hover:underline ${
                  cardTheme === "red" ? "text-white" : "text-brand"
                }`}
              >
                {profile.referralCode}
              </span>
              {copiedCode ? (
                <span className="text-[10px] font-bold text-emerald-300 ml-1 print:hidden">Copied!</span>
              ) : (
                <Copy className="h-3 w-3 opacity-60 group-hover:opacity-100 transition print:hidden" />
              )}
            </button>

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
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={handleDownload}
              disabled={downloading}
              className="flex items-center justify-center gap-1.5 rounded-xl bg-brand px-3 py-2.5 text-xs sm:text-sm font-bold text-white shadow-md shadow-brand/25 hover:bg-brand-dark transition cursor-pointer disabled:opacity-50"
            >
              {downloading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Generating...</span>
                </>
              ) : (
                <>
                  <Download className="h-4 w-4" />
                  <span>Download PNG</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={() => window.print()}
              title="Print official share card (2.76 x 4.75 in)"
              className="btn-outline-dark !py-2.5 !text-xs sm:!text-sm flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
            >
              <Printer className="h-4 w-4" />
              <span>Print Card</span>
            </button>
          </div>

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
                <WhatsAppIcon className="h-4.5 w-4.5" />
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
                <TelegramIcon className="h-4.5 w-4.5 -translate-x-0.5" />
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
                <FacebookIcon className="h-4.5 w-4.5" />
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
          <div className="border-b border-line pb-3.5">
            <h3 className="font-display text-base sm:text-lg font-extrabold text-ink">
              Card Details
            </h3>
            <p className="mt-0.5 text-xs text-muted">
              Customize the name, course, and invite caption displayed on your official share card.
            </p>
          </div>

          {/* 1. Name to Show on Card Input */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-ink flex items-center gap-1.5">
                <User className="h-3.5 w-3.5 text-brand" />
                <span>Name on Card</span>
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
                  <RotateCcw className="h-3 w-3" /> Reset
                </button>
              )}
            </div>
            <input
              type="text"
              value={cardDisplayName}
              onChange={(e) => {
                const val = e.target.value;
                setCardDisplayName(val);
                onUpdateDisplayName?.(val);
              }}
              placeholder="e.g. Tonye Taylor"
              className="w-full rounded-xl border border-line bg-cream/50 px-3.5 py-2.5 text-xs sm:text-sm font-semibold text-ink placeholder-muted/60 focus:bg-white focus:border-brand focus:outline-none transition"
            />
            <p className="text-[11px] text-muted">
              Choose your full name, preferred name, or trading alias.
            </p>
          </div>

          {/* 2. Enrolled & Paid Course Selection Section (Single Clean Dropdown) */}
          <div className="space-y-1.5 pt-3 border-t border-line">
            <label className="text-xs font-bold text-ink flex items-center gap-1.5">
              <BookOpen className="h-3.5 w-3.5 text-brand" />
              <span>Course on Card</span>
            </label>

            {/* Clean Dropdown Trigger */}
            <button
              type="button"
              onClick={() => setCourseDropdownOpen(!courseDropdownOpen)}
              className="w-full flex items-center justify-between p-3 rounded-xl border border-line bg-cream/50 hover:bg-cream hover:border-brand/40 transition cursor-pointer text-left"
            >
              <div className="min-w-0 flex-1 pr-3">
                <p className="font-bold text-xs sm:text-sm text-ink truncate">{courseTitle}</p>
                <div className="flex items-center gap-2 mt-1">
                  {isCustomCourse ? (
                    <span className="px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider bg-amber-50 text-amber-700 border border-amber-200 shrink-0">
                      Custom Title
                    </span>
                  ) : enrolledCourses.some(
                      (c) => c.title.toLowerCase() === courseTitle.toLowerCase() && c.isPaid
                    ) ? (
                    <span className="px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider bg-purple-50 text-purple-700 border border-purple-200 shrink-0">
                      Paid Enrollment
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200 shrink-0">
                      Enrolled
                    </span>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-1.5 text-xs font-bold text-muted shrink-0">
                <span>{courseDropdownOpen ? "Done" : "Change"}</span>
                <ChevronDown
                  className={`h-4 w-4 transition-transform duration-200 ${
                    courseDropdownOpen ? "rotate-180 text-brand" : ""
                  }`}
                />
              </div>
            </button>

            {/* Dropdown Menu Options */}
            {courseDropdownOpen && (
              <div className="mt-2 rounded-xl border border-line bg-white p-2.5 shadow-sm space-y-1.5">
                <p className="text-[10px] font-bold uppercase tracking-wider text-muted px-1 py-0.5">
                  Select a course:
                </p>
                <div className="space-y-1 max-h-52 overflow-y-auto pr-1">
                  {(enrolledCourses.length > 0 ? enrolledCourses : fallbackCatalogCourses).map((c) => {
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
                          setCourseDropdownOpen(false);
                        }}
                        className={`w-full text-left p-2.5 rounded-lg border transition cursor-pointer flex items-center justify-between gap-2 ${
                          isSelected
                            ? "border-brand bg-brand/5 text-brand font-bold"
                            : "border-transparent bg-white hover:bg-cream text-ink font-medium"
                        }`}
                      >
                        <span className="truncate text-xs">{c.title}</span>
                        {isSelected && <Check className="h-3.5 w-3.5 shrink-0 text-brand" />}
                      </button>
                    );
                  })}
                </div>

                {/* Custom Course Option */}
                <div className="pt-2 border-t border-line">
                  {!isCustomCourse ? (
                    <button
                      type="button"
                      onClick={() => {
                        setIsCustomCourse(true);
                        setCustomCourseText(courseTitle);
                      }}
                      className="text-[11px] font-semibold text-brand hover:underline inline-flex items-center gap-1 cursor-pointer px-1"
                    >
                      <Edit3 className="h-3 w-3" /> Type a custom title instead
                    </button>
                  ) : (
                    <div className="flex items-center gap-2 pt-1">
                      <input
                        type="text"
                        value={customCourseText}
                        onChange={(e) => {
                          setCustomCourseText(e.target.value);
                          setCourseTitle(e.target.value);
                          onUpdateCourseTitle?.(e.target.value);
                        }}
                        placeholder="Enter course title"
                        className="flex-1 rounded-lg border border-line bg-cream/50 px-3 py-1.5 text-xs font-semibold text-ink focus:bg-white focus:border-brand focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setIsCustomCourse(false);
                          const fallback = enrolledCourses[0]?.title || "Forex Foundations";
                          setCourseTitle(fallback);
                          onUpdateCourseTitle?.(fallback);
                        }}
                        className="text-xs font-bold text-muted hover:text-ink px-2 py-1.5 cursor-pointer"
                      >
                        Reset
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* 3. Marketing Share Message / Hook */}
          <div className="space-y-1.5 pt-3 border-t border-line">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-ink flex items-center gap-1.5">
                <SlidersHorizontal className="h-3.5 w-3.5 text-brand" />
                <span>Invite Caption</span>
              </label>
              <button
                type="button"
                onClick={() => setCaptionCollapsibleOpen(!captionCollapsibleOpen)}
                className="text-[11px] font-semibold text-muted hover:text-brand inline-flex items-center gap-1 transition cursor-pointer"
              >
                <span>{captionCollapsibleOpen ? "Hide Templates" : "Browse Templates (4)"}</span>
                <ChevronDown
                  className={`h-3 w-3 transition-transform duration-200 ${
                    captionCollapsibleOpen ? "rotate-180" : ""
                  }`}
                />
              </button>
            </div>

            {/* Collapsible Templates List */}
            {captionCollapsibleOpen && (
              <div className="rounded-xl border border-line bg-cream/50 p-2.5 space-y-1.5 animate-in fade-in duration-150">
                <p className="text-[10px] font-bold uppercase tracking-wider text-muted px-1">
                  Click a template to use:
                </p>
                <div className="space-y-1 max-h-48 overflow-y-auto pr-1">
                  {PRESET_INVITE_MESSAGES.map((msg, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        setInviteMessage(msg);
                        onUpdateQuote?.(msg);
                        setCaptionCollapsibleOpen(false);
                      }}
                      className={`w-full text-left p-2 rounded-lg transition cursor-pointer border text-xs leading-relaxed ${
                        inviteMessage === msg
                          ? "border-brand bg-white text-ink font-bold shadow-xs"
                          : "border-transparent bg-white/70 text-muted hover:text-ink hover:bg-white"
                      }`}
                    >
                      "{msg}"
                    </button>
                  ))}
                </div>
              </div>
            )}

            <textarea
              rows={2}
              value={inviteMessage}
              onChange={(e) => {
                setInviteMessage(e.target.value);
                onUpdateQuote?.(e.target.value);
              }}
              placeholder="Write your custom invitation message..."
              className="w-full rounded-xl border border-line bg-cream/50 p-3 text-xs text-ink placeholder-muted/60 focus:border-brand focus:bg-white focus:outline-none transition leading-relaxed"
            />
            <p className="text-[11px] text-muted">
              Included automatically when sharing or copying your link.
            </p>
          </div>
        </div>

        {/* CARD 2: 1-Click Sharing Suite & Unique Invite Link */}
        <div className="rounded-2xl border border-line bg-white p-5 sm:p-6 shadow-sm space-y-4">
          <div className="border-b border-line pb-3.5">
            <h3 className="font-display text-base sm:text-lg font-extrabold text-ink">
              Share Your Card &amp; Link
            </h3>
            <p className="mt-0.5 text-xs text-muted leading-relaxed">
              When friends use your link or scan your card code, they can register at no cost. You earn a <strong>{commissionPercent}% commission</strong> whenever they enroll in paid courses or purchase trading tools.
            </p>
          </div>

          {/* Quick Copy Link & Caption Box */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-ink">
              Your Referral Link
            </label>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
              <div className="relative flex-1 min-w-0">
                <input
                  type="text"
                  readOnly
                  value={referralUrl}
                  onClick={() => copyLink()}
                  title="Click to copy link"
                  className="w-full rounded-xl border border-line bg-cream/50 px-3.5 py-2.5 text-xs font-mono font-semibold text-ink outline-none select-all truncate focus:bg-white focus:border-brand cursor-pointer transition"
                />
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={copyLink}
                  className="btn-primary !py-2.5 !px-4 !text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-sm flex-1 sm:flex-initial"
                >
                  {copied ? (
                    <>
                      <Check className="h-4 w-4" />
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4" />
                      <span>Copy Link</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={copyCaption}
                  title="Copy ready-to-post message and invite link"
                  className="btn-outline-dark !py-2.5 !px-3.5 !text-xs flex items-center justify-center gap-1.5 cursor-pointer flex-1 sm:flex-initial"
                >
                  {copiedCaption ? (
                    <>
                      <Check className="h-4 w-4 text-emerald-600" />
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <MessageCircle className="h-4 w-4 text-brand" />
                      <span>Copy Message</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

        </div>
      </div>

      {/* CARD 3: Full-Width 3-Step Commission Explainer */}
      <div className="rounded-2xl border border-line bg-white p-5 sm:p-6 shadow-sm space-y-5">
        <div className="border-b border-line pb-3.5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h3 className="font-display text-base sm:text-lg font-extrabold text-ink">
              How the {commissionPercent}% Commission Works
            </h3>
            <p className="mt-0.5 text-xs text-muted">
              Three simple steps to earn cash commission on referred student enrollments.
            </p>
          </div>
          <span className="self-start sm:self-center rounded-full bg-brand-light px-3 py-1 text-xs font-bold text-brand shrink-0">
            {commissionPercent}% Cash Payout
          </span>
        </div>

        {/* 3 Spacious Columns across the full width */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-5">
          {/* Step 1 */}
          <div className="rounded-xl border border-line bg-cream/40 p-4 sm:p-5 flex flex-col justify-between space-y-3">
            <div className="space-y-2">
              <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-ink text-xs font-bold text-white shadow-xs">
                01
              </span>
              <h4 className="font-bold text-ink text-sm sm:text-base">Share Your Card &amp; Invite Link</h4>
              <p className="text-xs text-muted leading-relaxed">
                Post your customized flyer to WhatsApp or social media, or share your invite link directly with friends.
              </p>
            </div>
          </div>

          {/* Step 2 */}
          <div className="rounded-xl border border-line bg-cream/40 p-4 sm:p-5 flex flex-col justify-between space-y-3">
            <div className="space-y-2">
              <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-ink text-xs font-bold text-white shadow-xs">
                02
              </span>
              <h4 className="font-bold text-ink text-sm sm:text-base">Friends Register at No Cost</h4>
              <p className="text-xs text-muted leading-relaxed">
                They register using your unique link or scan your card QR code at zero cost to start learning.
              </p>
            </div>
          </div>

          {/* Step 3 */}
          <div className="rounded-xl border border-brand/20 bg-brand/5 p-4 sm:p-5 flex flex-col justify-between space-y-3">
            <div className="space-y-2">
              <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-brand text-xs font-bold text-white shadow-xs">
                03
              </span>
              <h4 className="font-bold text-brand text-sm sm:text-base">Earn {commissionPercent}% Cash Commission</h4>
              <p className="text-xs text-muted leading-relaxed">
                You receive an instant {commissionPercent}% cash payout whenever they enroll in paid courses or trading tools.
              </p>
            </div>
          </div>
        </div>

        {/* Program Terms & Payout Info */}
        <div className="pt-3.5 border-t border-line flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2.5 text-xs text-muted">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-emerald-600 shrink-0" />
            <span className="text-[11px] sm:text-xs">
              Disbursed via Nigerian Bank Transfer, USDT (TRC-20), or PayPal
            </span>
          </div>
          <div className="text-[11px] sm:text-xs font-semibold text-ink sm:self-center">
            Min. Payout: <span className="font-bold text-brand">₦{minimumPayoutAmount.toLocaleString()}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
