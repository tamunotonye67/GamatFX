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
} from "lucide-react";

function XIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" {...props}>
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

function LinkedinIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" {...props}>
      <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 8.76a1.64 1.64 0 1 0 0-3.28 1.64 1.64 0 0 0 0 3.28M7.86 18.5V10.13H5.07V18.5h2.79z" />
    </svg>
  );
}
import {
  type AffiliateProfile,
  PRESET_QUOTES,
  PRESET_BADGES,
  getSignupReferralUrl,
  exportAffiliateCardAsPng,
} from "../lib/affiliate";

type Props = {
  profile: AffiliateProfile;
  avatarUrl?: string;
  onUpdateQuote?: (quote: string) => void;
  onUpdateBadge?: (badge: string) => void;
};

export default function AffiliateCard({
  profile,
  avatarUrl,
  onUpdateQuote,
  onUpdateBadge,
}: Props) {
  const [downloading, setDownloading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showCustomizer, setShowCustomizer] = useState(false);
  const [customQuote, setCustomQuote] = useState(profile.personalQuote || PRESET_QUOTES[0]);
  const [selectedBadge, setSelectedBadge] = useState(profile.badgeTitle || PRESET_BADGES[0]);

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
        personalQuote: customQuote,
        badgeTitle: selectedBadge,
      };
      const dataUrl = await exportAffiliateCardAsPng(activeProfile, avatarUrl);
      const link = document.createElement("a");
      link.download = `GAMAT-Ambassador-${profile.referralCode}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error("Failed to download card:", err);
    } finally {
      setDownloading(false);
    }
  };

  const shareText = `Join me at GAMAT Fx Academy! Learn institutional price action, master risk, and get certified. Use my invite code "${profile.referralCode}" for VIP cohort access and 5% off:`;

  const initials = (profile.userName || "TR")
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <div className="flex flex-col lg:flex-row items-start gap-8">
      {/* Left / Center: The Pinterest / Medium-Style Card */}
      <div className="w-full max-w-[460px] mx-auto shrink-0">
        <div
          id="affiliate-share-card"
          className="relative overflow-hidden rounded-[2.2rem] bg-gradient-to-b from-[#090e17] via-[#0f172a] to-[#080c14] p-6 sm:p-7 text-white shadow-[0_25px_70px_-15px_rgba(0,0,0,0.7)] border border-white/10 ring-1 ring-white/5"
        >
          {/* Subtle Ambient Radial Lighting */}
          <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-brand/20 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-amber-500/15 blur-3xl" />

          {/* Top Brand & Ambassador Tag */}
          <div className="relative flex items-center justify-between border-b border-white/10 pb-4">
            <div className="flex items-center gap-2">
              <span className="font-display text-lg font-black tracking-wider text-white">
                GAMAT <span className="text-brand">FX</span>
              </span>
              <span className="text-[10px] uppercase font-bold tracking-widest text-white/50">
                Academy
              </span>
            </div>

            <div className="inline-flex items-center gap-1.5 rounded-full border border-brand/40 bg-brand/10 px-3 py-1 text-[11px] font-bold text-red-200">
              <Sparkles className="h-3 w-3 text-amber-300" />
              <span>AMBASSADOR</span>
            </div>
          </div>

          {/* Student Profile Spotlight Header */}
          <div className="relative mt-5 flex items-center gap-4 rounded-2xl border border-white/10 bg-white/[0.04] p-3.5 backdrop-blur-md">
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt={profile.userName}
                className="h-16 w-16 rounded-2xl object-cover ring-2 ring-brand/60 shadow-lg"
              />
            ) : (
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-brand to-brand-dark font-display text-xl font-black text-white shadow-lg">
                {initials}
              </div>
            )}

            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5">
                <h4 className="font-display text-lg font-extrabold text-white truncate">
                  {profile.userName}
                </h4>
                <span className="inline-flex items-center justify-center h-4 w-4 rounded-full bg-sky-500 text-[10px] font-bold text-white">
                  ✓
                </span>
              </div>
              <p className="text-xs font-semibold text-sky-400 truncate">
                {selectedBadge}
              </p>
              <p className="mt-0.5 text-[11px] text-white/50 truncate">
                Official Institutional Trading Cohort
              </p>
            </div>
          </div>

          {/* Medium / Pinterest Style Quote Box */}
          <div className="relative mt-5 rounded-2xl border border-white/10 bg-white/[0.03] p-5 backdrop-blur-sm">
            <Quote className="h-7 w-7 text-brand/40 mb-1" />
            <p className="font-serif italic text-base sm:text-lg leading-relaxed text-slate-100">
              "{customQuote}"
            </p>
            <div className="mt-4 flex items-center justify-between text-xs text-amber-400 font-semibold border-t border-white/5 pt-3">
              <span>— {profile.userName}</span>
              <span className="text-[11px] text-white/40">Price Action & Risk Edge</span>
            </div>
          </div>

          {/* QR Code & Referral Code Footer */}
          <div className="relative mt-5 rounded-2xl border border-brand/30 bg-gradient-to-br from-brand/10 to-brand/5 p-4">
            <div className="flex items-center justify-between gap-4">
              <div className="min-w-0 flex-1">
                <p className="text-[10px] uppercase font-bold tracking-wider text-white/60">
                  Unique Invite Code
                </p>
                <p className="font-mono text-xl sm:text-2xl font-black text-white tracking-wider mt-0.5">
                  {profile.referralCode}
                </p>
                <p className="mt-2 text-xs font-medium text-emerald-400 flex items-center gap-1">
                  <span>🎁</span> Scan or visit to claim 5% off
                </p>
                <p className="mt-0.5 text-[11px] font-mono text-sky-300">
                  gamatfxacademy.com
                </p>
              </div>

              {/* QR Code */}
              <div className="shrink-0 rounded-xl bg-white p-2 shadow-md">
                <img
                  src={qrApiUrl}
                  alt="Referral QR Code"
                  className="h-24 w-24 object-contain"
                  loading="lazy"
                  onError={(e) => {
                    // Fallback to stylized icon if offline
                    e.currentTarget.style.display = "none";
                  }}
                />
              </div>
            </div>
          </div>

          {/* Watermark Footer */}
          <div className="mt-4 text-center">
            <p className="text-[10px] text-white/40">
              GAMAT Fx Academy Ltd. • Verified Student Ambassador Card
            </p>
          </div>
        </div>
      </div>

      {/* Right Column: Actions, Customization, & Social Sharing */}
      <div className="w-full flex-1 space-y-6">
        {/* Card Header & Intro */}
        <div className="rounded-2xl border border-line bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between gap-4">
            <div>
              <span className="inline-flex items-center gap-1 rounded-full bg-brand/10 px-3 py-1 text-xs font-bold text-brand">
                <Sparkles className="h-3.5 w-3.5" />
                Pinterest & Medium Style Share Card
              </span>
              <h3 className="mt-2 font-display text-xl font-extrabold text-ink">
                Your Ambassador Showcase Card
              </h3>
              <p className="mt-1 text-sm text-muted">
                Share this card on your social media status, Twitter, Pinterest, or WhatsApp. Anyone who scans or registers with your code earns you a <strong>15% commission</strong>.
              </p>
            </div>
          </div>

          {/* Quick Action Buttons */}
          <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button
              type="button"
              onClick={handleDownload}
              disabled={downloading}
              className="flex items-center justify-center gap-2 rounded-xl bg-brand px-5 py-3 text-sm font-bold text-white shadow-md hover:bg-brand-dark transition cursor-pointer disabled:opacity-50"
            >
              {downloading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Generating HD PNG...
                </>
              ) : (
                <>
                  <Download className="h-4 w-4" />
                  Download Card (PNG)
                </>
              )}
            </button>

            <button
              type="button"
              onClick={copyLink}
              className="flex items-center justify-center gap-2 rounded-xl border border-line bg-cream px-5 py-3 text-sm font-bold text-ink hover:bg-slate-100 transition cursor-pointer"
            >
              {copied ? (
                <>
                  <Check className="h-4 w-4 text-emerald-600" />
                  <span className="text-emerald-700">Invite Link Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4 text-muted" />
                  Copy Invite Link
                </>
              )}
            </button>
          </div>

          {/* Customize Card Button */}
          <div className="mt-4 pt-4 border-t border-line flex items-center justify-between">
            <button
              type="button"
              onClick={() => setShowCustomizer(!showCustomizer)}
              className="inline-flex items-center gap-2 text-xs font-bold text-brand hover:text-brand-dark cursor-pointer"
            >
              <Sliders className="h-3.5 w-3.5" />
              {showCustomizer ? "Hide Customization" : "Customize Quote & Badge on Card"}
            </button>
            <span className="text-xs text-muted">HD 1080×1520px Export</span>
          </div>

          {/* Live Customizer Drawer */}
          {showCustomizer && (
            <div className="mt-4 space-y-4 rounded-xl border border-line bg-cream p-4">
              <div>
                <label className="block text-xs font-bold text-ink mb-1.5">
                  Select Ambassador Badge
                </label>
                <div className="flex flex-wrap gap-2">
                  {PRESET_BADGES.map((b) => (
                    <button
                      key={b}
                      type="button"
                      onClick={() => {
                        setSelectedBadge(b);
                        onUpdateBadge?.(b);
                      }}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                        selectedBadge === b
                          ? "bg-brand text-white shadow"
                          : "bg-white border border-line text-ink hover:bg-slate-50"
                      }`}
                    >
                      {b}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-ink mb-1.5">
                  Select or Write Card Quote
                </label>
                <div className="space-y-2 mb-3">
                  {PRESET_QUOTES.map((q, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        setCustomQuote(q);
                        onUpdateQuote?.(q);
                      }}
                      className={`w-full text-left p-2.5 rounded-lg text-xs transition cursor-pointer border ${
                        customQuote === q
                          ? "border-brand bg-brand/5 text-ink font-medium"
                          : "border-line bg-white text-muted hover:text-ink"
                      }`}
                    >
                      "{q}"
                    </button>
                  ))}
                </div>

                <textarea
                  value={customQuote}
                  onChange={(e) => {
                    setCustomQuote(e.target.value);
                    onUpdateQuote?.(e.target.value);
                  }}
                  rows={3}
                  className="w-full rounded-xl border border-line bg-white p-3 text-xs text-ink placeholder:text-muted focus:border-brand focus:outline-none"
                  placeholder="Or type your own personal trading quote/thesis..."
                />
              </div>
            </div>
          )}
        </div>

        {/* 1-Click Social Sharing */}
        <div className="rounded-2xl border border-line bg-white p-6 shadow-sm">
          <h4 className="font-display text-sm font-bold text-ink flex items-center gap-2">
            <Share2 className="h-4 w-4 text-brand" />
            1-Click Social Share
          </h4>
          <p className="mt-1 text-xs text-muted">
            Share directly with your followers and friends with pre-filled invitations.
          </p>

          <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {/* WhatsApp */}
            <a
              href={`https://api.whatsapp.com/send?text=${encodeURIComponent(`${shareText} ${referralUrl}`)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-3.5 py-2.5 text-xs font-bold text-white hover:bg-emerald-700 transition"
            >
              <MessageCircle className="h-4 w-4" />
              WhatsApp
            </a>

            {/* X / Twitter */}
            <a
              href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(`${shareText} ${referralUrl}`)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 rounded-xl bg-black px-3.5 py-2.5 text-xs font-bold text-white hover:bg-slate-900 transition"
            >
              <XIcon className="h-4 w-4" />
              X (Twitter)
            </a>

            {/* Telegram */}
            <a
              href={`https://t.me/share/url?url=${encodeURIComponent(referralUrl)}&text=${encodeURIComponent(shareText)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 rounded-xl bg-[#229ED9] px-3.5 py-2.5 text-xs font-bold text-white hover:opacity-95 transition"
            >
              <Send className="h-4 w-4" />
              Telegram
            </a>

            {/* LinkedIn */}
            <a
              href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(referralUrl)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 rounded-xl bg-[#0077b5] px-3.5 py-2.5 text-xs font-bold text-white hover:opacity-95 transition"
            >
              <LinkedinIcon className="h-4 w-4" />
              LinkedIn
            </a>
          </div>
        </div>

        {/* How It Works Mini-Guide */}
        <div className="rounded-2xl border border-line bg-white p-6 shadow-sm">
          <h4 className="font-display text-sm font-bold text-ink">
            How Student Affiliate Commissions Work
          </h4>
          <div className="mt-3 grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="rounded-xl bg-cream p-3.5">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-brand text-[11px] font-bold text-white mb-2">
                1
              </span>
              <p className="text-xs font-bold text-ink">Share Your Card / Link</p>
              <p className="mt-1 text-[11px] text-muted">
                Post your visual card or link on WhatsApp, Pinterest, X, or Telegram.
              </p>
            </div>

            <div className="rounded-xl bg-cream p-3.5">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-brand text-[11px] font-bold text-white mb-2">
                2
              </span>
              <p className="text-xs font-bold text-ink">Friend Gets 5% Off</p>
              <p className="mt-1 text-[11px] text-muted">
                Your invite automatically applies a 5% discount for them at registration.
              </p>
            </div>

            <div className="rounded-xl bg-cream p-3.5">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-brand text-[11px] font-bold text-white mb-2">
                3
              </span>
              <p className="text-xs font-bold text-ink">Earn 15% Cash</p>
              <p className="mt-1 text-[11px] text-muted">
                Receive 15% instant commission into your balance, withdrawable to your bank or USDT.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
