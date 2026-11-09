import { useState } from "react";
import {
  Download,
  Copy,
  Check,
  Share2,
  QrCode,
  ExternalLink,
  MessageCircle,
  Send,
  Loader2,
  Quote,
  CheckCircle2,
  ArrowRight,
  BookOpen,
  MousePointerClick,
  SlidersHorizontal,
  ShieldCheck,
  Percent,
} from "lucide-react";
import {
  type AffiliateProfile,
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

type Props = {
  profile: AffiliateProfile;
  avatarUrl?: string;
  onUpdateQuote?: (quote: string) => void;
  onUpdateCourseTitle?: (title: string) => void;
};

export default function AffiliateCard({
  profile,
  avatarUrl,
  onUpdateQuote,
  onUpdateCourseTitle,
}: Props) {
  const [downloading, setDownloading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showOptions, setShowOptions] = useState(false);
  const [inviteMessage, setInviteMessage] = useState(
    profile.personalQuote || DEFAULT_INVITE_MESSAGE
  );
  const [courseTitle, setCourseTitle] = useState(
    profile.enrolledCourseTitle || "Forex Foundations"
  );

  const referralUrl = getSignupReferralUrl(profile.referralCode);
  const qrApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&margin=8&data=${encodeURIComponent(referralUrl)}`;

  const copyLink = () => {
    try {
      navigator.clipboard.writeText(referralUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {}
  };

  const handleDownload = async () => {
    setDownloading(true);
    try {
      const activeProfile: AffiliateProfile = {
        ...profile,
        personalQuote: inviteMessage,
        enrolledCourseTitle: courseTitle,
      };
      const dataUrl = await exportAffiliateCardAsPng(activeProfile, avatarUrl);
      const link = document.createElement("a");
      link.download = `GAMAT-Enrollment-Invite-${profile.referralCode}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error("Failed to download card:", err);
    } finally {
      setDownloading(false);
    }
  };

  const shareText = `${inviteMessage} 👉 ${referralUrl}`;

  const initials = (profile.userName || "ST")
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
      {/* ================= Left: The Pinterest / Medium Enrollment Card (5 Cols) ================= */}
      <div className="lg:col-span-5 w-full space-y-4">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2 text-xs font-bold text-ink">
            <Share2 className="h-4 w-4 text-brand" />
            <span>Enrollment Proof Share Card</span>
          </div>
          <span className="text-[11px] text-muted font-medium">Ready to post</span>
        </div>

        {/* The Visual Social Card */}
        <div
          id="student-enrollment-card"
          className="relative overflow-hidden rounded-3xl bg-[#0c1017] p-6 text-white shadow-xl border border-slate-800"
        >
          {/* Subtle Accent Glow */}
          <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-brand/20 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-16 -left-16 h-48 w-48 rounded-full bg-sky-500/15 blur-3xl" />

          {/* Top Brand Header & Verified Student Tag */}
          <div className="relative flex items-center justify-between border-b border-white/10 pb-4">
            <div className="flex items-center gap-2">
              <span className="font-display text-sm font-black tracking-wider text-white">
                GAMAT <span className="text-brand">FX</span>
              </span>
              <span className="text-[9px] uppercase font-bold tracking-widest text-white/50">
                Academy
              </span>
            </div>

            <div className="inline-flex items-center gap-1 rounded-full border border-emerald-500/40 bg-emerald-500/10 px-2.5 py-0.5 text-[9px] font-bold text-emerald-300">
              <CheckCircle2 className="h-3 w-3 text-emerald-400" />
              <span>VERIFIED ENROLLMENT</span>
            </div>
          </div>

          {/* Student Profile Row */}
          <div className="relative mt-4 flex items-center gap-3">
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt={profile.userName}
                className="h-12 w-12 rounded-full object-cover ring-2 ring-brand shadow-sm"
              />
            ) : (
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-brand to-brand-dark font-display text-sm font-black text-white shadow-sm">
                {initials}
              </div>
            )}

            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5">
                <h4 className="font-display text-sm font-bold text-white truncate">
                  {profile.userName}
                </h4>
                <span className="inline-flex items-center justify-center h-3.5 w-3.5 rounded-full bg-sky-500 text-[9px] font-bold text-white">
                  ✓
                </span>
              </div>
              <p className="text-[11px] font-semibold text-sky-400 truncate">
                Active Student • {courseTitle}
              </p>
              <p className="text-[9px] text-white/50">
                GAMAT Fx Academy Official Cohort
              </p>
            </div>
          </div>

          {/* Medium / Pinterest Style Quote Box */}
          <div className="relative mt-4 rounded-2xl border border-brand/30 bg-brand/10 p-4 backdrop-blur-md">
            <Quote className="h-5 w-5 text-brand/70 mb-1" />
            <p className="font-display font-bold text-base sm:text-lg leading-snug text-white">
              "{inviteMessage}"
            </p>
            <div className="mt-3 flex items-center justify-between text-[11px] text-emerald-400 font-bold border-t border-white/10 pt-2">
              <span>Tuition: 100% Free Beginner Access</span>
              <span className="text-[10px] text-white/50 font-normal">Certificate Included</span>
            </div>
          </div>

          {/* Call To Action Box & Direct Referral Pill */}
          <div className="relative mt-4 rounded-2xl bg-white p-3.5 text-slate-900 shadow-sm">
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0 flex-1">
                <p className="text-[9px] uppercase font-bold tracking-wider text-slate-500">
                  Scan to Join My Cohort
                </p>
                <p className="font-mono text-sm font-black text-brand truncate mt-0.5">
                  INVITE: {profile.referralCode}
                </p>
                <p className="mt-0.5 text-[10px] text-slate-600 truncate">
                  Zero cost • Free access link
                </p>
                <p className="text-[10px] font-bold text-sky-600 font-mono">
                  gamatfxacademy.com
                </p>
              </div>

              {/* Dynamic QR Code */}
              <div className="shrink-0 rounded-lg bg-slate-50 p-1 border border-slate-200">
                <img
                  src={qrApiUrl}
                  alt="Referral QR Code"
                  className="h-16 w-16 object-contain"
                  loading="lazy"
                />
              </div>
            </div>
          </div>

          {/* Card Footer */}
          <div className="mt-3 text-center">
            <p className="text-[9px] text-white/40">
              Share on WhatsApp Status, Instagram Story, or Pinterest
            </p>
          </div>
        </div>

        {/* Action Buttons Directly Under Card */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          <button
            type="button"
            onClick={handleDownload}
            disabled={downloading}
            className="w-full flex items-center justify-center gap-2 rounded-xl bg-brand px-4 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-brand-dark transition cursor-pointer disabled:opacity-50"
          >
            {downloading ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                <span>Rendering PNG...</span>
              </>
            ) : (
              <>
                <Download className="h-3.5 w-3.5" />
                <span>Download PNG Card</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={() => setShowOptions(!showOptions)}
            className="w-full flex items-center justify-center gap-2 rounded-xl border border-line bg-white px-4 py-2.5 text-xs font-bold text-ink hover:bg-slate-50 transition cursor-pointer shadow-sm"
          >
            <SlidersHorizontal className="h-3.5 w-3.5 text-muted" />
            <span>{showOptions ? "Hide Options" : "Edit Message"}</span>
          </button>
        </div>

        {/* Collapsible Message Editor */}
        {showOptions && (
          <div className="rounded-2xl border border-line bg-white p-4 shadow-sm text-xs space-y-3 animate-[fadeIn_.2s_ease]">
            <p className="font-bold text-ink">Choose Announcement Message:</p>
            <div className="space-y-1.5">
              {PRESET_INVITE_MESSAGES.map((msg, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    setInviteMessage(msg);
                    onUpdateQuote?.(msg);
                  }}
                  className={`w-full text-left p-2 rounded-lg transition cursor-pointer border text-[11px] leading-relaxed ${
                    inviteMessage === msg
                      ? "border-brand bg-brand/5 text-ink font-bold"
                      : "border-line bg-cream text-muted hover:text-ink hover:bg-slate-100"
                  }`}
                >
                  "{msg}"
                </button>
              ))}
            </div>

            <div>
              <p className="font-bold text-ink mb-1">Or write your own custom invitation:</p>
              <textarea
                rows={2}
                value={inviteMessage}
                onChange={(e) => {
                  setInviteMessage(e.target.value);
                  onUpdateQuote?.(e.target.value);
                }}
                className="w-full rounded-xl border border-line bg-cream p-2 text-xs text-ink focus:border-brand focus:outline-none"
                placeholder="e.g. I just enrolled for Forex Foundational course with GAMAT at no costs at all. Click the link to join me"
              />
            </div>
          </div>
        )}
      </div>

      {/* ================= Right: Sharing Suite & 15% Program Breakdown (7 Cols) ================= */}
      <div className="lg:col-span-7 space-y-6">
        {/* Card 1: 1-Click Sharing Suite */}
        <div className="rounded-2xl border border-line bg-white p-6 shadow-sm space-y-5">
          <div>
            <div className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-800">
              <Share2 className="h-3.5 w-3.5 text-brand" />
              <span>Instant Social Sharing</span>
            </div>
            <h3 className="mt-2 font-display text-lg font-bold text-ink">
              Share Your Link & Invite Students
            </h3>
            <p className="mt-1 text-xs text-muted leading-relaxed">
              When friends use your link or scan your code to enroll, they get 100% free access to the foundational course, and you earn a <strong>15% commission</strong> whenever they enroll in paid courses or purchase trading tools.
            </p>
          </div>

          {/* Quick Copy Link Box */}
          <div className="rounded-xl border border-line bg-cream p-3 flex flex-col sm:flex-row items-center gap-2.5">
            <div className="min-w-0 flex-1 text-left w-full sm:w-auto">
              <p className="text-[10px] uppercase font-bold text-muted">Your Unique Invite Link</p>
              <p className="font-mono text-xs font-bold text-ink truncate select-all">
                {referralUrl}
              </p>
            </div>

            <button
              type="button"
              onClick={copyLink}
              className="w-full sm:w-auto px-4 py-2 rounded-lg bg-slate-900 text-white font-bold text-xs hover:bg-slate-800 transition cursor-pointer flex items-center justify-center gap-1.5 shrink-0"
            >
              {copied ? (
                <>
                  <Check className="h-3.5 w-3.5 text-emerald-400" />
                  <span>Link Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="h-3.5 w-3.5" />
                  <span>Copy Link</span>
                </>
              )}
            </button>
          </div>

          {/* 1-Click Social Buttons */}
          <div>
            <p className="text-xs font-bold text-ink mb-2">1-Click Share to Channels:</p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {/* WhatsApp */}
              <a
                href={`https://api.whatsapp.com/send?text=${encodeURIComponent(shareText)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-3 py-2.5 text-xs font-bold text-white hover:bg-emerald-700 transition shadow-sm"
              >
                <MessageCircle className="h-4 w-4" />
                <span>WhatsApp</span>
              </a>

              {/* Telegram */}
              <a
                href={`https://t.me/share/url?url=${encodeURIComponent(referralUrl)}&text=${encodeURIComponent(inviteMessage)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 rounded-xl bg-[#229ED9] px-3 py-2.5 text-xs font-bold text-white hover:opacity-95 transition shadow-sm"
              >
                <Send className="h-4 w-4" />
                <span>Telegram</span>
              </a>

              {/* X / Twitter */}
              <a
                href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 rounded-xl bg-black px-3 py-2.5 text-xs font-bold text-white hover:bg-slate-900 transition shadow-sm"
              >
                <XIcon className="h-4 w-4" />
                <span>X (Twitter)</span>
              </a>

              {/* Facebook */}
              <a
                href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(referralUrl)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 rounded-xl bg-[#1877F2] px-3 py-2.5 text-xs font-bold text-white hover:opacity-95 transition shadow-sm"
              >
                <FacebookIcon className="h-4 w-4" />
                <span>Facebook</span>
              </a>
            </div>
          </div>
        </div>

        {/* Card 2: 3-Step 15% Commission Engine */}
        <div className="rounded-2xl border border-line bg-white p-6 shadow-sm">
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
                <p className="font-bold text-ink">Share Card or Link</p>
                <p className="mt-1 text-muted text-[11px] leading-relaxed">
                  Post your enrollment card to your WhatsApp status, Instagram, or send your link directly.
                </p>
              </div>
            </div>

            <div className="rounded-xl bg-cream p-4 border border-line flex flex-col justify-between">
              <div>
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-900 text-[11px] font-bold text-white mb-2">
                  2
                </span>
                <p className="font-bold text-ink">Friends Join Free</p>
                <p className="mt-1 text-muted text-[11px] leading-relaxed">
                  They register and take the Forex Foundations masterclass at zero tuition fee.
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
