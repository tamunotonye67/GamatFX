import { useState } from "react";
import {
  Download,
  Copy,
  Check,
  Share2,
  Sparkles,
  QrCode,
  ExternalLink,
  MessageCircle,
  Send,
  Loader2,
  Quote,
  Sliders,
  CheckCircle2,
  ArrowRight,
  BookOpen,
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
    <div className="flex flex-col lg:flex-row items-start gap-8">
      {/* ================= Left: The Pinterest / Medium Enrollment Card ================= */}
      <div className="w-full max-w-[440px] mx-auto shrink-0">
        <div
          id="student-enrollment-card"
          className="relative overflow-hidden rounded-[2rem] bg-gradient-to-b from-[#090d16] via-[#0f172a] to-[#070b12] p-6 sm:p-7 text-white shadow-[0_25px_60px_-15px_rgba(0,0,0,0.7)] border border-white/10 ring-1 ring-white/5"
        >
          {/* Subtle Ambient Radial Lighting */}
          <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-brand/25 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-emerald-500/20 blur-3xl" />

          {/* Top Brand Header & Verified Enrollment Tag */}
          <div className="relative flex items-center justify-between border-b border-white/10 pb-4">
            <div className="flex items-center gap-2">
              <span className="font-display text-base font-black tracking-wider text-white">
                GAMAT <span className="text-brand">FX</span>
              </span>
              <span className="text-[10px] uppercase font-bold tracking-widest text-white/50">
                Academy
              </span>
            </div>

            <div className="inline-flex items-center gap-1 rounded-full border border-emerald-500/40 bg-emerald-500/10 px-3 py-0.5 text-[10px] font-bold text-emerald-300">
              <CheckCircle2 className="h-3 w-3 text-emerald-400" />
              <span>VERIFIED ENROLLMENT</span>
            </div>
          </div>

          {/* Student Profile Row */}
          <div className="relative mt-5 flex items-center gap-3.5">
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt={profile.userName}
                className="h-14 w-14 rounded-full object-cover ring-2 ring-brand shadow-md"
              />
            ) : (
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-brand to-brand-dark font-display text-lg font-black text-white shadow-md">
                {initials}
              </div>
            )}

            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5">
                <h4 className="font-display text-base font-extrabold text-white truncate">
                  {profile.userName}
                </h4>
                <span className="inline-flex items-center justify-center h-4 w-4 rounded-full bg-sky-500 text-[10px] font-bold text-white">
                  ✓
                </span>
              </div>
              <p className="text-xs font-semibold text-sky-400 truncate">
                Active Student • {courseTitle}
              </p>
              <p className="text-[10px] text-white/50">
                GAMAT Fx Academy Official Cohort
              </p>
            </div>
          </div>

          {/* Medium / Pinterest Style Giant Announcement Hook */}
          <div className="relative mt-5 rounded-2xl border border-brand/40 bg-brand/10 p-5 backdrop-blur-md">
            <Quote className="h-6 w-6 text-brand/60 mb-1" />
            <p className="font-display font-extrabold text-lg sm:text-xl leading-snug text-white">
              "{inviteMessage}"
            </p>
            <div className="mt-3.5 flex items-center justify-between text-xs text-emerald-400 font-bold border-t border-white/10 pt-2.5">
              <span className="flex items-center gap-1">
                <span>🎁</span> 100% Free Beginner Access
              </span>
              <span className="text-[11px] text-white/50 font-normal">No Fees Required</span>
            </div>
          </div>

          {/* Call To Action Box & Direct Referral Pill */}
          <div className="relative mt-5 rounded-2xl bg-white p-4 text-slate-900 shadow-md">
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0 flex-1">
                <p className="text-[10px] uppercase font-bold tracking-wider text-slate-500">
                  Join My Cohort Online
                </p>
                <p className="font-mono text-sm sm:text-base font-black text-brand truncate mt-0.5">
                  CODE: {profile.referralCode}
                </p>
                <p className="mt-1 text-[11px] text-slate-600 line-clamp-1">
                  Scan QR code or click link to claim free access
                </p>
                <p className="text-[11px] font-bold text-sky-600 font-mono">
                  gamatfxacademy.com
                </p>
              </div>

              {/* Dynamic QR Code */}
              <div className="shrink-0 rounded-xl bg-slate-50 p-1.5 border border-slate-200">
                <img
                  src={qrApiUrl}
                  alt="Referral QR Code"
                  className="h-20 w-20 object-contain"
                  loading="lazy"
                />
              </div>
            </div>
          </div>

          {/* Watermark Footer */}
          <div className="mt-4 text-center">
            <p className="text-[10px] text-white/40">
              Share on WhatsApp Status, Instagram, Pinterest, or Twitter
            </p>
          </div>
        </div>
      </div>

      {/* ================= Right: Sharing Toolbar & Invitation Controls ================= */}
      <div className="w-full flex-1 space-y-6">
        {/* Main Action Header Card */}
        <div className="rounded-2xl border border-line bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between gap-4">
            <div>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700">
                <Sparkles className="h-3.5 w-3.5 text-emerald-600" />
                Student Enrollment Invite Card
              </span>
              <h3 className="mt-2 font-display text-xl font-extrabold text-ink">
                Invite Friends to Join Your Course
              </h3>
              <p className="mt-1 text-xs sm:text-sm text-muted leading-relaxed">
                Share this card on WhatsApp, Instagram, Pinterest, or Twitter. When your friends click your link or scan your code to register, you earn a <strong>15% commission</strong> whenever they enroll in paid courses or purchase trading tools!
              </p>
            </div>
          </div>

          {/* Student's Direct Referral Link Bar */}
          <div className="mt-5 rounded-xl border border-line bg-cream p-3 flex flex-col sm:flex-row items-center gap-3">
            <div className="min-w-0 flex-1 text-left">
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

          {/* Quick 1-Click Social Sharing Buttons */}
          <div className="mt-5 space-y-2">
            <p className="text-xs font-bold text-ink">1-Click Share to Your Network:</p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {/* WhatsApp — The #1 channel */}
              <a
                href={`https://api.whatsapp.com/send?text=${encodeURIComponent(shareText)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-3.5 py-2.5 text-xs font-bold text-white hover:bg-emerald-700 transition shadow-sm"
              >
                <MessageCircle className="h-4 w-4" />
                WhatsApp
              </a>

              {/* X / Twitter */}
              <a
                href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 rounded-xl bg-black px-3.5 py-2.5 text-xs font-bold text-white hover:bg-slate-900 transition shadow-sm"
              >
                <XIcon className="h-4 w-4" />
                X (Twitter)
              </a>

              {/* Telegram */}
              <a
                href={`https://t.me/share/url?url=${encodeURIComponent(referralUrl)}&text=${encodeURIComponent(inviteMessage)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 rounded-xl bg-[#229ED9] px-3.5 py-2.5 text-xs font-bold text-white hover:opacity-95 transition shadow-sm"
              >
                <Send className="h-4 w-4" />
                Telegram
              </a>

              {/* Facebook */}
              <a
                href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(referralUrl)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 rounded-xl bg-[#1877F2] px-3.5 py-2.5 text-xs font-bold text-white hover:opacity-95 transition shadow-sm"
              >
                <FacebookIcon className="h-4 w-4" />
                Facebook
              </a>
            </div>
          </div>

          {/* Download Image Card Action */}
          <div className="mt-5 pt-4 border-t border-line flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <button
              type="button"
              onClick={handleDownload}
              disabled={downloading}
              className="flex items-center justify-center gap-2 rounded-xl bg-brand px-5 py-2.5 text-xs font-bold text-white shadow hover:bg-brand-dark transition cursor-pointer disabled:opacity-50"
            >
              {downloading ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  Generating High-Res Image...
                </>
              ) : (
                <>
                  <Download className="h-3.5 w-3.5" />
                  Download Card Image (PNG)
                </>
              )}
            </button>

            <button
              type="button"
              onClick={() => setShowOptions(!showOptions)}
              className="text-xs font-bold text-brand hover:underline cursor-pointer"
            >
              {showOptions ? "Hide Card Options" : "Switch Course / Card Message"}
            </button>
          </div>

          {/* Options Drawer */}
          {showOptions && (
            <div className="mt-4 space-y-4 rounded-xl border border-line bg-cream p-4 text-xs">
              <div>
                <label className="block font-bold text-ink mb-1.5">Select Message Template:</label>
                <div className="space-y-2">
                  {PRESET_INVITE_MESSAGES.map((msg, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        setInviteMessage(msg);
                        onUpdateQuote?.(msg);
                      }}
                      className={`w-full text-left p-2.5 rounded-lg transition cursor-pointer border ${
                        inviteMessage === msg
                          ? "border-brand bg-brand/5 text-ink font-bold"
                          : "border-line bg-white text-muted hover:text-ink"
                      }`}
                    >
                      "{msg}"
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block font-bold text-ink mb-1.5">Or Type Custom Card Note:</label>
                <textarea
                  rows={2}
                  value={inviteMessage}
                  onChange={(e) => {
                    setInviteMessage(e.target.value);
                    onUpdateQuote?.(e.target.value);
                  }}
                  className="w-full rounded-xl border border-line bg-white p-2.5 text-xs text-ink focus:border-brand focus:outline-none"
                  placeholder="e.g. I just enrolled for Forex Foundational course with GAMAT at no costs at all. Click the link to join me"
                />
              </div>
            </div>
          )}
        </div>

        {/* How It Works & Earnings Breakdown */}
        <div className="rounded-2xl border border-line bg-white p-6 shadow-sm">
          <h4 className="font-display text-sm font-bold text-ink">
            How You Earn with Your Invite Link:
          </h4>
          <div className="mt-3 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div className="rounded-xl bg-cream p-3.5">
              <span className="font-bold text-brand block mb-1">1. Share Card / Link</span>
              <p className="text-muted leading-relaxed">
                Post your enrollment card to your WhatsApp status or send your link to friends.
              </p>
            </div>
            <div className="rounded-xl bg-cream p-3.5">
              <span className="font-bold text-brand block mb-1">2. Friends Join Free</span>
              <p className="text-muted leading-relaxed">
                They register and take the Forex Foundations masterclass at zero tuition fee.
              </p>
            </div>
            <div className="rounded-xl bg-cream p-3.5">
              <span className="font-bold text-emerald-700 block mb-1">3. You Get 15% Cash</span>
              <p className="text-muted leading-relaxed">
                When they purchase advanced courses, mentorship, or store bots, you get a 15% commission!
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
