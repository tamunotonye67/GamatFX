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
  "I just enrolled for Forex Foundational course with GAMAT at no costs at all. Click the link to join me!";

export const PRESET_INVITE_MESSAGES = [
  "I just enrolled for Forex Foundational course with GAMAT at no costs at all. Click the link to join me!",
  "I'm learning institutional forex trading with GAMAT Fx Academy for free. Click the link to join me!",
  "I just started the Forex Foundations masterclass with GAMAT. Zero cost to start — click my link to join me!",
  "Building my trading edge and consistency at GAMAT Fx Academy. Join my cohort today at no cost at all!",
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
  return `${base}/#/?ref=${encodeURIComponent(referralCode)}`;
}

export function getSignupReferralUrl(referralCode: string): string {
  const base = typeof window !== "undefined" ? window.location.origin : "https://gamatfxacademy.com";
  return `${base}/#/signup?ref=${encodeURIComponent(referralCode)}`;
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
 * Renders the High-Definition Pinterest / Medium-Style Enrollment Card directly onto an offscreen canvas:
 * "I just enrolled for Forex Foundational course with GAMAT at no costs at all. Click the link to join me"
 */
export async function exportAffiliateCardAsPng(
  profile: AffiliateProfile,
  avatarUrl?: string
): Promise<string> {
  const width = 1080;
  const height = 1440;
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Could not create canvas context");

  // 1. Deep Obsidian Background
  const bgGrad = ctx.createLinearGradient(0, 0, width, height);
  bgGrad.addColorStop(0, "#080c14");
  bgGrad.addColorStop(0.5, "#0f172a");
  bgGrad.addColorStop(1, "#070b12");
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, width, height);

  // 2. Radial ambient lighting
  const glow1 = ctx.createRadialGradient(width * 0.85, height * 0.15, 20, width * 0.85, height * 0.15, 450);
  glow1.addColorStop(0, "rgba(220, 53, 69, 0.25)");
  glow1.addColorStop(1, "rgba(0, 0, 0, 0)");
  ctx.fillStyle = glow1;
  ctx.fillRect(0, 0, width, height);

  const glow2 = ctx.createRadialGradient(width * 0.15, height * 0.85, 20, width * 0.15, height * 0.85, 450);
  glow2.addColorStop(0, "rgba(16, 185, 129, 0.2)");
  glow2.addColorStop(1, "rgba(0, 0, 0, 0)");
  ctx.fillStyle = glow2;
  ctx.fillRect(0, 0, width, height);

  // 3. Card perimeter borders
  ctx.lineWidth = 3;
  ctx.strokeStyle = "rgba(255, 255, 255, 0.1)";
  ctx.strokeRect(36, 36, width - 72, height - 72);

  ctx.lineWidth = 1.5;
  ctx.strokeStyle = "rgba(220, 53, 69, 0.4)";
  ctx.strokeRect(44, 44, width - 88, height - 88);

  // 4. Header: GAMAT FX ACADEMY Logo & Verified Badge
  ctx.textAlign = "left";
  ctx.font = "900 32px sans-serif";
  ctx.fillStyle = "#ffffff";
  ctx.fillText("GAMAT FX", 90, 125);

  ctx.font = "700 22px sans-serif";
  ctx.fillStyle = "#dc3545";
  ctx.fillText("ACADEMY", 255, 125);

  ctx.textAlign = "right";
  ctx.fillStyle = "rgba(16, 185, 129, 0.15)";
  roundRect(ctx, width - 420, 92, 330, 48, 24);
  ctx.fill();
  ctx.strokeStyle = "rgba(16, 185, 129, 0.5)";
  ctx.lineWidth = 2;
  ctx.stroke();

  ctx.font = "bold 16px sans-serif";
  ctx.fillStyle = "#6ee7b7";
  ctx.fillText("✓ VERIFIED STUDENT ENROLLMENT", width - 110, 123);

  // 5. Student Profile Header (Avatar + Name)
  ctx.fillStyle = "rgba(255, 255, 255, 0.04)";
  roundRect(ctx, 80, 180, width - 160, 160, 24);
  ctx.fill();
  ctx.strokeStyle = "rgba(255, 255, 255, 0.08)";
  ctx.lineWidth = 1.5;
  ctx.stroke();

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
      ctx.arc(170, 260, 55, 0, Math.PI * 2);
      ctx.closePath();
      ctx.clip();
      ctx.drawImage(img, 115, 205, 110, 110);
      ctx.restore();

      ctx.beginPath();
      ctx.arc(170, 260, 57, 0, Math.PI * 2);
      ctx.strokeStyle = "#dc3545";
      ctx.lineWidth = 4;
      ctx.stroke();
      avatarLoaded = true;
    } catch {
      avatarLoaded = false;
    }
  }

  if (!avatarLoaded) {
    const initGrad = ctx.createLinearGradient(115, 205, 225, 315);
    initGrad.addColorStop(0, "#dc3545");
    initGrad.addColorStop(1, "#8b1523");
    ctx.fillStyle = initGrad;
    ctx.beginPath();
    ctx.arc(170, 260, 55, 0, Math.PI * 2);
    ctx.fill();

    ctx.textAlign = "center";
    ctx.font = "bold 44px sans-serif";
    ctx.fillStyle = "#ffffff";
    const initials = (profile.userName || "ST")
      .split(" ")
      .map((n) => n[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();
    ctx.fillText(initials, 170, 276);
  }

  // Name & Status
  ctx.textAlign = "left";
  ctx.font = "900 38px sans-serif";
  ctx.fillStyle = "#ffffff";
  ctx.fillText(profile.userName, 255, 250);

  ctx.font = "600 20px sans-serif";
  ctx.fillStyle = "#38bdf8";
  ctx.fillText(`Active Student • ${profile.enrolledCourseTitle || "Forex Foundations"}`, 255, 285);

  // 6. Giant Medium / Pinterest Headline Card
  ctx.fillStyle = "rgba(220, 53, 69, 0.08)";
  roundRect(ctx, 80, 380, width - 160, 480, 32);
  ctx.fill();
  ctx.strokeStyle = "rgba(220, 53, 69, 0.35)";
  ctx.lineWidth = 2.5;
  ctx.stroke();

  // Quotation mark
  ctx.font = "900 130px serif";
  ctx.fillStyle = "rgba(220, 53, 69, 0.4)";
  ctx.fillText("“", 120, 490);

  // The Exact Social Hook Headline:
  ctx.font = "900 46px sans-serif";
  ctx.fillStyle = "#ffffff";
  const headline = profile.personalQuote || DEFAULT_INVITE_MESSAGE;
  wrapText(ctx, headline, 130, 540, width - 260, 68);

  // Course Details Pill Box inside card
  ctx.fillStyle = "rgba(255, 255, 255, 0.06)";
  roundRect(ctx, 130, 720, width - 260, 100, 18);
  ctx.fill();
  ctx.strokeStyle = "rgba(255, 255, 255, 0.1)";
  ctx.lineWidth = 1;
  ctx.stroke();

  ctx.font = "bold 20px sans-serif";
  ctx.fillStyle = "#6ee7b7";
  ctx.fillText("TUITION: 100% FREE BEGINNER ACCESS", 160, 762);

  ctx.font = "500 18px sans-serif";
  ctx.fillStyle = "rgba(255, 255, 255, 0.75)";
  ctx.fillText("Includes full video lessons, quizzes, & official certificate", 160, 796);

  // 7. Call To Action & QR Section
  ctx.fillStyle = "#ffffff";
  roundRect(ctx, 80, 900, width - 160, 390, 32);
  ctx.fill();

  ctx.textAlign = "left";
  ctx.font = "900 36px sans-serif";
  ctx.fillStyle = "#0f172a";
  ctx.fillText("Claim Your Free Spot & Join Me", 130, 970);

  ctx.font = "500 22px sans-serif";
  ctx.fillStyle = "#475569";
  ctx.fillText("Scan the QR code or use my personal invite code below:", 130, 1015);

  // Invite Code Pill
  ctx.fillStyle = "#f1f5f9";
  roundRect(ctx, 130, 1060, 460, 80, 18);
  ctx.fill();
  ctx.strokeStyle = "#cbd5e1";
  ctx.lineWidth = 1.5;
  ctx.stroke();

  ctx.font = "bold 18px sans-serif";
  ctx.fillStyle = "#64748b";
  ctx.fillText("INVITE CODE:", 155, 1110);

  ctx.font = "900 32px monospace";
  ctx.fillStyle = "#dc3545";
  ctx.fillText(profile.referralCode, 290, 1112);

  ctx.font = "bold 24px sans-serif";
  ctx.fillStyle = "#0284c7";
  ctx.fillText("gamatfxacademy.com", 130, 1200);

  ctx.font = "500 18px sans-serif";
  ctx.fillStyle = "#64748b";
  ctx.fillText("No credit card required. Start learning immediately.", 130, 1240);

  // Draw QR Code on the right side
  const qrX = width - 360;
  const qrY = 945;
  const qrSize = 250;

  ctx.fillStyle = "#ffffff";
  roundRect(ctx, qrX, qrY, qrSize, qrSize, 20);
  ctx.fill();
  ctx.strokeStyle = "#e2e8f0";
  ctx.lineWidth = 2;
  ctx.stroke();

  const targetUrl = getSignupReferralUrl(profile.referralCode);
  const qrApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&margin=8&data=${encodeURIComponent(targetUrl)}`;

  try {
    const qrImg = new Image();
    qrImg.crossOrigin = "anonymous";
    await new Promise<void>((resolve, reject) => {
      qrImg.onload = () => resolve();
      qrImg.onerror = () => reject();
      qrImg.src = qrApiUrl;
    });
    ctx.drawImage(qrImg, qrX + 15, qrY + 15, qrSize - 30, qrSize - 30);
  } catch {
    ctx.fillStyle = "#0f172a";
    ctx.fillRect(qrX + 30, qrY + 30, 60, 60);
    ctx.fillRect(qrX + qrSize - 90, qrY + 30, 60, 60);
    ctx.fillRect(qrX + 30, qrY + qrSize - 90, 60, 60);
  }

  // 8. Watermark Footer
  ctx.textAlign = "center";
  ctx.font = "500 16px sans-serif";
  ctx.fillStyle = "rgba(255, 255, 255, 0.4)";
  ctx.fillText("GAMAT Fx Academy • Official Student Share Card • gamatfxacademy.com", width / 2, height - 55);

  return canvas.toDataURL("image/png");
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
