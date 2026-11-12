/**
 * GAMAT Fx Academy — Student Referral & Enrollment Invite Engine
 *
 * Powers:
 * 1. Unique student invite links (e.g. gamatfxacademy.com/#/signup?ref=GMT-TONYE82).
 * 2. Medium & Pinterest-style Enrollment Cards:
 *    "I just enrolled for Forex Foundational course with GAMAT at no costs at all. Click the link to join me"
 * 3. 1-click social sharing to WhatsApp, X/Twitter, Facebook, Telegram, and HD PNG export.
 * 4. Automated commissions tracking (15% when invited friends enroll in paid courses or store tools).
 */

export type AffiliateProfile = {
  userId: string;
  userName: string;
  userEmail: string;
  avatar?: string;
  referralCode: string;
  enrolledCourseTitle?: string; // e.g. "Forex Foundations"
  cardDisplayName?: string; // Custom display name chosen by the student specifically for their card
  badgeTitle?: string; // e.g. "Forex Foundations"
  personalQuote: string; // The social hook: "I just enrolled for Forex Foundational course with GAMAT at no costs at all. Click the link to join me"
  payoutMethod?: "bank" | "usdt" | "paypal";
  payoutDetails?: string; // Bank name & account or USDT address
  totalClicks: number;
  totalSignups: number;
  totalConversions: number; // completed paid orders
  totalEarned: number; // total commission earned in NGN
  pendingBalance: number; // available for withdrawal in NGN
  paidOut: number; // total disbursed in NGN
  joinedAt: string;
};

export type AffiliateCommission = {
  id: string;
  affiliateUserId: string;
  affiliateCode: string;
  customerName: string;
  customerEmail: string;
  orderType: "course" | "store" | "mentorship";
  orderTitle: string;
  orderAmount: number;
  commissionRate: number; // e.g. 0.15 for 15%
  commissionAmount: number;
  status: "approved" | "pending" | "paid";
  createdAt: string;
};

export type PayoutRequest = {
  id: string;
  affiliateUserId: string;
  affiliateName: string;
  affiliateEmail: string;
  amount: number;
  method: "bank" | "usdt" | "paypal";
  details: string;
  status: "pending" | "paid" | "rejected";
  requestedAt: string;
  processedAt?: string;
  adminNote?: string;
};

export type AffiliateSettings = {
  defaultCommissionPercent: number; // default 15%
  minimumPayoutAmount: number; // e.g. 10000 NGN
  affiliateDiscountPercent: number; // e.g. 5% discount for friends
  enabled: boolean;
};

const PROFILES_KEY = "gamat_affiliate_profiles";
const COMMISSIONS_KEY = "gamat_affiliate_commissions";
const PAYOUTS_KEY = "gamat_affiliate_payouts";
const SETTINGS_KEY = "gamat_affiliate_settings";
export const REFERRAL_STORAGE_KEY = "gamat_referral_code";

export const DEFAULT_AFFILIATE_SETTINGS: AffiliateSettings = {
  defaultCommissionPercent: 15,
  minimumPayoutAmount: 10000,
  affiliateDiscountPercent: 5,
  enabled: true,
};

export const DEFAULT_INVITE_MESSAGE =
  "I just enrolled for Forex Foundational course at GAMAT Fx Academy! You can register at no cost using my link to join me:";

export const PRESET_INVITE_MESSAGES = [
  "I just enrolled for Forex Foundational course at GAMAT Fx Academy! You can register at no cost using my link to join me:",
  "Join my institutional forex trading cohort at GAMAT Fx Academy! Register at no cost with my link:",
  "Building my trading edge at GAMAT Fx Academy. You can register at no cost today — click my link to join:",
  "I just started the Forex Foundations masterclass at GAMAT Fx Academy. Register at no cost and let's trade together:",
];

// Presets export for compatibility with existing store state
export const PRESET_QUOTES = PRESET_INVITE_MESSAGES;
export const PRESET_BADGES = [
  "Forex Foundations",
  "Institutional Trading Masterclass",
  "Risk Management Specialist",
  "Price Action Prodigy",
];

export const INITIAL_PROFILES: AffiliateProfile[] = [
  {
    userId: "usr-amb-001",
    userName: "Emmanuel Okoro",
    userEmail: "emmanuel.okoro@example.com",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80",
    referralCode: "GMT-OKORO99",
    enrolledCourseTitle: "Forex Foundations",
    personalQuote: "I just enrolled for Forex Foundational course with GAMAT at no costs at all. Click the link to join me!",
    payoutMethod: "bank",
    payoutDetails: "GTBank • 0239485721 • Emmanuel Okoro",
    totalClicks: 214,
    totalSignups: 26,
    totalConversions: 8,
    totalEarned: 185000,
    pendingBalance: 45000,
    paidOut: 140000,
    joinedAt: "2026-01-14T08:30:00Z",
  },
  {
    userId: "usr-amb-002",
    userName: "Aisha Bello",
    userEmail: "aisha.bello@example.com",
    avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=300&q=80",
    referralCode: "GMT-AISHA24",
    enrolledCourseTitle: "Forex Foundations",
    personalQuote: "I just enrolled for Forex Foundational course with GAMAT at no costs at all. Click the link to join me!",
    payoutMethod: "usdt",
    payoutDetails: "TRC20: TYs27F38kdP92mdLm78qZ03kdfk19",
    totalClicks: 142,
    totalSignups: 19,
    totalConversions: 5,
    totalEarned: 112500,
    pendingBalance: 25000,
    paidOut: 87500,
    joinedAt: "2026-02-02T10:15:00Z",
  },
  {
    userId: "usr-amb-003",
    userName: "David Adeleke",
    userEmail: "david.adeleke@example.com",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80",
    referralCode: "GMT-DAVID77",
    enrolledCourseTitle: "Forex Foundations",
    personalQuote: "I just enrolled for Forex Foundational course with GAMAT at no costs at all. Click the link to join me!",
    payoutMethod: "bank",
    payoutDetails: "Zenith Bank • 2184930211 • David Adeleke",
    totalClicks: 98,
    totalSignups: 11,
    totalConversions: 3,
    totalEarned: 67500,
    pendingBalance: 67500,
    paidOut: 0,
    joinedAt: "2026-02-18T14:40:00Z",
  },
];

export const INITIAL_COMMISSIONS: AffiliateCommission[] = [
  {
    id: "comm-101",
    affiliateUserId: "usr-amb-001",
    affiliateCode: "GMT-OKORO99",
    customerName: "Chidi Nnamdi",
    customerEmail: "chidi.n@example.com",
    orderType: "course",
    orderTitle: "Complete Forex Mastery Course",
    orderAmount: 150000,
    commissionRate: 0.15,
    commissionAmount: 22500,
    status: "paid",
    createdAt: "2026-02-28T11:20:00Z",
  },
  {
    id: "comm-102",
    affiliateUserId: "usr-amb-001",
    affiliateCode: "GMT-OKORO99",
    customerName: "Folake Adebayo",
    customerEmail: "folake.a@example.com",
    orderType: "store",
    orderTitle: "Apex Scalper EA Bot (MT4/MT5)",
    orderAmount: 120000,
    commissionRate: 0.15,
    commissionAmount: 18000,
    status: "paid",
    createdAt: "2026-03-01T15:00:00Z",
  },
  {
    id: "comm-103",
    affiliateUserId: "usr-amb-002",
    affiliateCode: "GMT-AISHA24",
    customerName: "Samuel Oladipo",
    customerEmail: "samuel.o@example.com",
    orderType: "course",
    orderTitle: "Smart Money Concepts & Order Blocks",
    orderAmount: 95000,
    commissionRate: 0.15,
    commissionAmount: 14250,
    status: "paid",
    createdAt: "2026-03-02T09:12:00Z",
  },
];

export const INITIAL_PAYOUTS: PayoutRequest[] = [
  {
    id: "payout-001",
    affiliateUserId: "usr-amb-001",
    affiliateName: "Emmanuel Okoro",
    affiliateEmail: "emmanuel.okoro@example.com",
    amount: 140000,
    method: "bank",
    details: "GTBank • 0239485721 • Emmanuel Okoro",
    status: "paid",
    requestedAt: "2026-02-25T10:00:00Z",
    processedAt: "2026-02-26T14:20:00Z",
    adminNote: "Disbursed via GTBank corporate internet banking Ref #TXN99281.",
  },
  {
    id: "payout-002",
    affiliateUserId: "usr-amb-002",
    affiliateName: "Aisha Bello",
    affiliateEmail: "aisha.bello@example.com",
    amount: 87500,
    method: "usdt",
    details: "TRC20: TYs27F38kdP92mdLm78qZ03kdfk19",
    status: "paid",
    requestedAt: "2026-02-28T09:30:00Z",
    processedAt: "2026-03-01T11:00:00Z",
    adminNote: "Paid via Binance USDT TRC20 hash: 88f219ab3c.",
  },
  {
    id: "payout-003",
    affiliateUserId: "usr-amb-001",
    affiliateName: "Emmanuel Okoro",
    affiliateEmail: "emmanuel.okoro@example.com",
    amount: 45000,
    method: "bank",
    details: "GTBank • 0239485721 • Emmanuel Okoro",
    status: "pending",
    requestedAt: "2026-03-05T08:00:00Z",
  },
];

/* --------------------------- Storage Helpers --------------------------- */

export function loadAffiliateProfiles(): AffiliateProfile[] {
  try {
    const raw = localStorage.getItem(PROFILES_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  saveAffiliateProfiles(INITIAL_PROFILES);
  return INITIAL_PROFILES;
}

export function saveAffiliateProfiles(profiles: AffiliateProfile[]) {
  try {
    localStorage.setItem(PROFILES_KEY, JSON.stringify(profiles));
  } catch {}
}

export function loadAffiliateCommissions(): AffiliateCommission[] {
  try {
    const raw = localStorage.getItem(COMMISSIONS_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  saveAffiliateCommissions(INITIAL_COMMISSIONS);
  return INITIAL_COMMISSIONS;
}

export function saveAffiliateCommissions(commissions: AffiliateCommission[]) {
  try {
    localStorage.setItem(COMMISSIONS_KEY, JSON.stringify(commissions));
  } catch {}
}

export function loadPayoutRequests(): PayoutRequest[] {
  try {
    const raw = localStorage.getItem(PAYOUTS_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  savePayoutRequests(INITIAL_PAYOUTS);
  return INITIAL_PAYOUTS;
}

export function savePayoutRequests(payouts: PayoutRequest[]) {
  try {
    localStorage.setItem(PAYOUTS_KEY, JSON.stringify(payouts));
  } catch {}
}

export function loadAffiliateSettings(): AffiliateSettings {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  saveAffiliateSettings(DEFAULT_AFFILIATE_SETTINGS);
  return DEFAULT_AFFILIATE_SETTINGS;
}

export function saveAffiliateSettings(settings: AffiliateSettings) {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch {}
}

/* -------------------------- Unique Code Gen -------------------------- */

export function generateReferralCode(name: string): string {
  const clean = (name || "STUDENT").replace(/[^a-zA-Z]/g, "").slice(0, 5).toUpperCase();
  const rand = Math.floor(100 + Math.random() * 900);
  return `GMT-${clean || "TRADER"}${rand}`;
}

export function getReferralUrl(referralCode: string): string {
  const base = typeof window !== "undefined" ? window.location.origin : "https://gamatfxacademy.com";
  return `${base}/join?ref=${encodeURIComponent(referralCode)}`;
}

export function getSignupReferralUrl(referralCode: string): string {
  const base = typeof window !== "undefined" ? window.location.origin : "https://gamatfxacademy.com";
  return `${base}/join?ref=${encodeURIComponent(referralCode)}`;
}

/* ----------------- Active Referral Tracking (Visitor) ----------------- */

export function captureReferralFromUrl(): string | null {
  if (typeof window === "undefined") return null;

  try {
    const searchParams = new URLSearchParams(window.location.search);
    let code = searchParams.get("ref");

    if (!code && window.location.hash.includes("?")) {
      const hashQuery = window.location.hash.split("?")[1];
      if (hashQuery) {
        const hashParams = new URLSearchParams(hashQuery);
        code = hashParams.get("ref");
      }
    }

    if (code && code.trim()) {
      const clean = code.trim().toUpperCase();
      localStorage.setItem(REFERRAL_STORAGE_KEY, clean);
      return clean;
    }
  } catch {}

  return null;
}

export function getActiveReferralCode(): string | null {
  try {
    return localStorage.getItem(REFERRAL_STORAGE_KEY);
  } catch {
    return null;
  }
}

export function clearActiveReferralCode() {
  try {
    localStorage.removeItem(REFERRAL_STORAGE_KEY);
  } catch {}
}

/* ----------------- Medium / Pinterest Enrollment Card Canvas Renderer ----------------- */

/**
 * Renders the Centered, Minimalist, and Prestigious Official Student Share Card onto an offscreen canvas:
 * Top Center: Logo & Brand + Student Avatar
 * Under: Name + Enrolled Course
 * Under: QR Code + Invitation to join & Invite code
 * Price-free design.
 */
export type AffiliateCardTheme = "red" | "dark";

/**
 * Renders the Centered, Minimalist, and Prestigious Official Student Share Card onto an offscreen canvas.
 * - Top Center: Student Avatar (No top text header or verified pill)
 * - Under Avatar: Student Name + Enrolled Course (Clean text, no pill layer)
 * - Under: "Join Me at" + Actual GAMAT Candlestick Logo & Brand Wordmark
 * - Under: High-Definition QR Code
 * - Under: Personal Invite Code (Clean text, no pill layer) & Website Domain
 * - Price-free design.
 * - Supports "red" (Default website-matching red gradient) and "dark" (Obsidian Dark) themes.
 */
export async function exportAffiliateCardAsPng(
  profile: AffiliateProfile,
  avatarUrl?: string,
  theme: AffiliateCardTheme = "red"
): Promise<string> {
  // Exact 2.76 x 4.75 inches at 300 DPI = 828 x 1425 px
  const width = 828;
  const height = 1425;
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Could not create canvas context");

  const isRed = theme === "red";
  const cardRadius = 60;

  // Clip the canvas to card rounded corners matching live preview (rounded-3xl)
  ctx.save();
  roundRect(ctx, 0, 0, width, height, cardRadius);
  ctx.clip();

  // 1. Background Gradient (strictly top-to-bottom matching live preview)
  if (isRed) {
    const bgGrad = ctx.createLinearGradient(0, 0, 0, height);
    bgGrad.addColorStop(0, "#83141f");
    bgGrad.addColorStop(0.45, "#a52230");
    bgGrad.addColorStop(1, "#4e0911");
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, width, height);

    // Ambient glow top-right
    const topGlow = ctx.createRadialGradient(width, 0, 30, width, 0, 520);
    topGlow.addColorStop(0, "rgba(255, 255, 255, 0.12)");
    topGlow.addColorStop(1, "rgba(0, 0, 0, 0)");
    ctx.fillStyle = topGlow;
    ctx.fillRect(0, 0, width, height);

    // Ambient glow bottom-left
    const btmGlow = ctx.createRadialGradient(0, height, 40, 0, height, 540);
    btmGlow.addColorStop(0, "rgba(0, 0, 0, 0.40)");
    btmGlow.addColorStop(1, "rgba(0, 0, 0, 0)");
    ctx.fillStyle = btmGlow;
    ctx.fillRect(0, 0, width, height);
  } else {
    const bgGrad = ctx.createLinearGradient(0, 0, 0, height);
    bgGrad.addColorStop(0, "#080c14");
    bgGrad.addColorStop(0.5, "#0d1322");
    bgGrad.addColorStop(1, "#070a10");
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, width, height);

    const topGlow = ctx.createRadialGradient(width, 0, 30, width, 0, 480);
    topGlow.addColorStop(0, "rgba(220, 53, 69, 0.20)");
    topGlow.addColorStop(1, "rgba(0, 0, 0, 0)");
    ctx.fillStyle = topGlow;
    ctx.fillRect(0, 0, width, height);

    const btmGlow = ctx.createRadialGradient(0, height, 30, 0, height, 480);
    btmGlow.addColorStop(0, "rgba(56, 189, 248, 0.15)");
    btmGlow.addColorStop(1, "rgba(0, 0, 0, 0)");
    ctx.fillStyle = btmGlow;
    ctx.fillRect(0, 0, width, height);
  }

  // 2. Subtle outer border (matching border-white/20, NO inner perimeter frames!)
  ctx.lineWidth = 3;
  ctx.strokeStyle = isRed ? "rgba(255, 255, 255, 0.22)" : "rgba(255, 255, 255, 0.12)";
  roundRect(ctx, 1.5, 1.5, width - 3, height - 3, cardRadius);
  ctx.stroke();

  // 3. TOP CENTER: Student Profile Avatar
  const avatarCenterX = width / 2;
  const avatarCenterY = 190;
  const avatarRadius = 110;

  let avatarLoaded = false;
  if (avatarUrl) {
    try {
      const img = new Image();
      img.crossOrigin = "anonymous";
      await new Promise<void>((resolve, reject) => {
        img.onload = () => resolve();
        img.onerror = () => reject();
        img.src = avatarUrl;
      });

      ctx.save();
      ctx.beginPath();
      ctx.arc(avatarCenterX, avatarCenterY, avatarRadius, 0, Math.PI * 2);
      ctx.closePath();
      ctx.clip();
      ctx.drawImage(
        img,
        avatarCenterX - avatarRadius,
        avatarCenterY - avatarRadius,
        avatarRadius * 2,
        avatarRadius * 2
      );
      ctx.restore();

      // Outer ring
      ctx.beginPath();
      ctx.arc(avatarCenterX, avatarCenterY, avatarRadius + 3, 0, Math.PI * 2);
      ctx.strokeStyle = isRed ? "rgba(255, 255, 255, 0.95)" : "#dc3545";
      ctx.lineWidth = 10;
      ctx.stroke();
      avatarLoaded = true;
    } catch {
      avatarLoaded = false;
    }
  }

  if (!avatarLoaded) {
    const initGrad = ctx.createLinearGradient(
      avatarCenterX - avatarRadius,
      avatarCenterY - avatarRadius,
      avatarCenterX + avatarRadius,
      avatarCenterY + avatarRadius
    );
    if (isRed) {
      initGrad.addColorStop(0, "rgba(255, 255, 255, 0.25)");
      initGrad.addColorStop(1, "rgba(0, 0, 0, 0.2)");
    } else {
      initGrad.addColorStop(0, "#dc3545");
      initGrad.addColorStop(1, "#8b1523");
    }
    ctx.fillStyle = initGrad;
    ctx.beginPath();
    ctx.arc(avatarCenterX, avatarCenterY, avatarRadius, 0, Math.PI * 2);
    ctx.fill();

    ctx.beginPath();
    ctx.arc(avatarCenterX, avatarCenterY, avatarRadius + 3, 0, Math.PI * 2);
    ctx.strokeStyle = isRed ? "rgba(255, 255, 255, 0.95)" : "#dc3545";
    ctx.lineWidth = 10;
    ctx.stroke();

    ctx.textAlign = "center";
    ctx.font = "900 80px sans-serif";
    ctx.fillStyle = "#ffffff";
    const displayName = (profile.cardDisplayName?.trim() || profile.userName || "TT");
    const initials = displayName
      .split(" ")
      .filter(Boolean)
      .map((n) => n[0])
      .slice(0, 2)
      .join("")
      .toUpperCase() || "TT";
    ctx.fillText(initials, avatarCenterX, avatarCenterY + 28);
  }

  // Active checkmark badge overlay on avatar
  const badgeX = avatarCenterX + 78;
  const badgeY = avatarCenterY + 78;
  const badgeR = 28;

  ctx.beginPath();
  ctx.arc(badgeX, badgeY, badgeR, 0, Math.PI * 2);
  ctx.fillStyle = "#0284c7";
  ctx.fill();
  ctx.strokeStyle = isRed ? "#83141f" : "#080c14";
  ctx.lineWidth = 6;
  ctx.stroke();

  ctx.textAlign = "center";
  ctx.font = "900 28px sans-serif";
  ctx.fillStyle = "#ffffff";
  ctx.fillText("✓", badgeX, badgeY + 10);

  // 4. Student Name (Directly Under Avatar)
  const resolvedDisplayName = (profile.cardDisplayName?.trim() || profile.userName || "Student Trader");
  ctx.textAlign = "center";
  ctx.font = "900 52px sans-serif";
  ctx.fillStyle = "#ffffff";
  ctx.fillText(resolvedDisplayName, width / 2, 360);

  // 5. Enrolled Course
  const courseName = profile.enrolledCourseTitle || "Forex Foundations";
  ctx.font = "600 25px sans-serif";
  ctx.fillStyle = isRed ? "#fecdd3" : "#38bdf8";
  ctx.fillText(`Enrolled in: ${courseName}`, width / 2, 405);

  // 6. Refined Divider
  const divGrad = ctx.createLinearGradient(width / 2 - 240, 442, width / 2 + 240, 442);
  divGrad.addColorStop(0, "rgba(255, 255, 255, 0)");
  divGrad.addColorStop(0.5, isRed ? "rgba(255, 255, 255, 0.35)" : "rgba(255, 255, 255, 0.2)");
  divGrad.addColorStop(1, "rgba(255, 255, 255, 0)");
  ctx.strokeStyle = divGrad;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(width / 2 - 240, 442);
  ctx.lineTo(width / 2 + 240, 442);
  ctx.stroke();

  // 7. "JOIN ME AT" (Uppercase matching live preview)
  ctx.textAlign = "center";
  ctx.font = "bold 21px sans-serif";
  ctx.fillStyle = isRed ? "rgba(255, 255, 255, 0.9)" : "#cbd5e1";
  ctx.fillText("JOIN ME AT", width / 2, 495);

  // 8. Actual GAMAT Logo & Brand Name
  drawGamatLogo(ctx, width / 2, 525, theme);

  // 9. QR Subtitle
  ctx.textAlign = "center";
  ctx.font = "500 20px sans-serif";
  ctx.fillStyle = isRed ? "rgba(255, 228, 230, 0.9)" : "#94a3b8";
  ctx.fillText("Scan the QR code below to connect with my cohort & learn together", width / 2, 655);

  // 10. QR Code Card Container (300 x 300)
  const qrCardW = 300;
  const qrCardH = 300;
  const qrCardX = width / 2 - qrCardW / 2;
  const qrCardY = 690;

  ctx.fillStyle = "#ffffff";
  roundRect(ctx, qrCardX, qrCardY, qrCardW, qrCardH, 24);
  ctx.fill();
  ctx.strokeStyle = isRed ? "rgba(255, 255, 255, 0.4)" : "#e2e8f0";
  ctx.lineWidth = 2;
  ctx.stroke();

  const targetUrl = getSignupReferralUrl(profile.referralCode);
  const qrApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&margin=8&data=${encodeURIComponent(targetUrl)}`;

  try {
    const qrImg = new Image();
    qrImg.crossOrigin = "anonymous";
    await new Promise<void>((resolve, reject) => {
      qrImg.onload = () => resolve();
      qrImg.onerror = () => reject();
      qrImg.src = qrApiUrl;
    });
    ctx.drawImage(qrImg, qrCardX + 25, qrCardY + 25, 250, 250);
  } catch {
    ctx.fillStyle = "#0f172a";
    ctx.fillRect(qrCardX + 40, qrCardY + 40, 60, 60);
    ctx.fillRect(qrCardX + qrCardW - 100, qrCardY + 40, 60, 60);
    ctx.fillRect(qrCardX + 40, qrCardY + qrCardH - 100, 60, 60);
  }

  // 11. Invite Code (Clean typography directly under QR container)
  ctx.textAlign = "center";
  const codeY = 1045;
  ctx.font = "bold 22px sans-serif";
  const inviteLabel = "INVITE CODE:  ";
  const labelMetrics = ctx.measureText(inviteLabel);

  ctx.font = "900 34px monospace";
  const codeMetrics = ctx.measureText(profile.referralCode);

  const totalCodeW = labelMetrics.width + codeMetrics.width;
  const startCodeX = width / 2 - totalCodeW / 2;

  ctx.textAlign = "left";
  ctx.font = "bold 22px sans-serif";
  ctx.fillStyle = isRed ? "rgba(255, 255, 255, 0.8)" : "#94a3b8";
  ctx.fillText(inviteLabel, startCodeX, codeY);

  ctx.font = "900 34px monospace";
  ctx.fillStyle = isRed ? "#ffffff" : "#dc3545";
  ctx.fillText(profile.referralCode, startCodeX + labelMetrics.width, codeY + 2);

  // 12. Official Website URL (Right under Invite Code)
  ctx.textAlign = "center";
  ctx.font = "bold 24px monospace";
  ctx.fillStyle = isRed ? "#fecdd3" : "#38bdf8";
  ctx.fillText("gamatfxacademy.com", width / 2, 1090);

  // 13. Watermark Divider & Footer
  const footerDivGrad = ctx.createLinearGradient(width / 2 - 200, 1340, width / 2 + 200, 1340);
  footerDivGrad.addColorStop(0, "rgba(255, 255, 255, 0)");
  footerDivGrad.addColorStop(0.5, "rgba(255, 255, 255, 0.15)");
  footerDivGrad.addColorStop(1, "rgba(255, 255, 255, 0)");
  ctx.strokeStyle = footerDivGrad;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(width / 2 - 200, 1340);
  ctx.lineTo(width / 2 + 200, 1340);
  ctx.stroke();

  ctx.font = "500 18px sans-serif";
  ctx.fillStyle = "rgba(255, 255, 255, 0.5)";
  ctx.fillText("2.76 × 4.75 in • GAMAT Official Share Card", width / 2, 1375);

  ctx.restore();

  return canvas.toDataURL("image/png");
}

/**
 * Draws the official GAMAT Candlestick Logo Mark and Wordmark lockup on Canvas
 */
function drawGamatLogo(
  ctx: CanvasRenderingContext2D,
  centerX: number,
  y: number,
  theme: "red" | "dark" = "red"
) {
  const isRed = theme === "red";
  const tileSize = 78;
  const gap = 16;

  ctx.font = "900 42px sans-serif";
  const gamatW = ctx.measureText("GAMAT ").width;
  const fxW = ctx.measureText("Fx").width;
  const wordmarkW = gamatW + fxW;
  const totalW = tileSize + gap + wordmarkW;
  const startX = centerX - totalW / 2;

  // 1. Candlestick Logo Tile
  ctx.save();
  ctx.fillStyle = isRed ? "#ffffff" : "#dc3545";
  roundRect(ctx, startX, y, tileSize, tileSize, 18);
  ctx.fill();

  const scale = tileSize / 32;
  const candleColor = isRed ? "#b02a37" : "#ffffff";

  ctx.translate(startX, y);

  // Floor
  ctx.beginPath();
  ctx.moveTo(4 * scale, 26 * scale);
  ctx.lineTo(28 * scale, 26 * scale);
  ctx.strokeStyle = candleColor;
  ctx.globalAlpha = 0.3;
  ctx.lineWidth = 1 * scale;
  ctx.stroke();

  // Bearish candle (left)
  ctx.beginPath();
  ctx.moveTo(8.5 * scale, 7 * scale);
  ctx.lineTo(8.5 * scale, 24 * scale);
  ctx.globalAlpha = 0.75;
  ctx.lineWidth = 1.4 * scale;
  ctx.lineCap = "round";
  ctx.stroke();

  ctx.globalAlpha = 0.65;
  ctx.fillStyle = candleColor;
  roundRect(ctx, 6.2 * scale, 10 * scale, 4.6 * scale, 10 * scale, 1 * scale);
  ctx.fill();

  // Bullish candle (centre)
  ctx.beginPath();
  ctx.moveTo(16 * scale, 5 * scale);
  ctx.lineTo(16 * scale, 24 * scale);
  ctx.globalAlpha = 1.0;
  ctx.lineWidth = 1.6 * scale;
  ctx.stroke();

  ctx.globalAlpha = 1.0;
  roundRect(ctx, 13.4 * scale, 9 * scale, 5.2 * scale, 12 * scale, 1.1 * scale);
  ctx.fill();

  // Bullish candle (right)
  ctx.beginPath();
  ctx.moveTo(23.5 * scale, 9 * scale);
  ctx.lineTo(23.5 * scale, 24 * scale);
  ctx.globalAlpha = 0.8;
  ctx.lineWidth = 1.4 * scale;
  ctx.stroke();

  ctx.globalAlpha = 0.8;
  roundRect(ctx, 21.2 * scale, 13 * scale, 4.6 * scale, 8 * scale, 1 * scale);
  ctx.fill();

  // Trend line
  ctx.beginPath();
  ctx.moveTo(5.5 * scale, 21.5 * scale);
  ctx.bezierCurveTo(
    10 * scale, 18.5 * scale,
    13 * scale, 14.5 * scale,
    16.5 * scale, 12.5 * scale
  );
  ctx.bezierCurveTo(
    20 * scale, 10.5 * scale,
    23 * scale, 9.5 * scale,
    27 * scale, 8 * scale
  );
  ctx.globalAlpha = 0.5;
  ctx.lineWidth = 1.2 * scale;
  ctx.stroke();

  ctx.restore();

  // 2. Wordmark
  const wordmarkX = startX + tileSize + gap;
  ctx.textAlign = "left";

  // GAMAT
  ctx.font = "900 42px sans-serif";
  ctx.fillStyle = "#ffffff";
  ctx.fillText("GAMAT", wordmarkX, y + 42);

  // Fx
  ctx.fillStyle = isRed ? "#fecdd3" : "#dc3545";
  ctx.fillText("Fx", wordmarkX + gamatW, y + 42);

  // ACADEMY
  ctx.font = "800 16px sans-serif";
  ctx.fillStyle = isRed ? "rgba(255, 255, 255, 0.85)" : "rgba(255, 255, 255, 0.7)";
  const academyText = "ACADEMY";
  let letterX = wordmarkX + 2;
  for (let i = 0; i < academyText.length; i++) {
    const ch = academyText[i];
    ctx.fillText(ch, letterX, y + 68);
    letterX += ctx.measureText(ch).width + 6;
  }
}

/* --------------------------- Canvas Helpers --------------------------- */

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  radius: number
) {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + w - radius, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + radius);
  ctx.lineTo(x + w, y + h - radius);
  ctx.quadraticCurveTo(x + w, y + h, x + w - radius, y + h);
  ctx.lineTo(x + radius, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
}

function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number
) {
  const words = text.split(" ");
  let line = "";
  let curY = y;

  for (let n = 0; n < words.length; n++) {
    const testLine = line + words[n] + " ";
    const metrics = ctx.measureText(testLine);
    const testWidth = metrics.width;
    if (testWidth > maxWidth && n > 0) {
      ctx.fillText(line.trim(), x, curY);
      line = words[n] + " ";
      curY += lineHeight;
    } else {
      line = testLine;
    }
  }
  ctx.fillText(line.trim(), x, curY);
}
