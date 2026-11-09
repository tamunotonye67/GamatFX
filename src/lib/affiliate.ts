/**
 * GAMAT Fx Academy — Student Affiliate & Ambassador Engine
 *
 * Powers:
 * 1. Unique student referral links & tracking (clicks, signups, course & store sales).
 * 2. Commission management (configurable percentage, default 15%).
 * 3. Medium & Pinterest-style shareable student cards with high-res PNG export.
 * 4. Payout request management (Bank Transfer, USDT TRC20, PayPal).
 */

export type AffiliateProfile = {
  userId: string;
  userName: string;
  userEmail: string;
  avatar?: string;
  referralCode: string;
  badgeTitle: string; // e.g. "Verified GAMAT Trader", "SMC Cohort Graduate"
  personalQuote: string; // Medium/Pinterest style thesis/quote
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
  defaultCommissionPercent: number; // e.g. 15 for 15%
  minimumPayoutAmount: number; // e.g. 10000 NGN
  affiliateDiscountPercent: number; // e.g. 5% discount for referred friends
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

export const PRESET_QUOTES = [
  "Trading isn't about guessing; it's about institutional liquidity, discipline, and edge. GAMAT FX transformed my journey. Join my trading circle and let's win together.",
  "From blowing accounts to consistent risk management. GAMAT FX Academy gave me the structure and mentorship I needed. Start your trading journey with my personal invite.",
  "Master price action, understand market maker intent, and protect your capital. Proud to be part of the GAMAT FX community. Join today with VIP student access.",
  "The best investment you can make is your trading education. GAMAT FX is building real, profitable African traders. Use my link to claim your bonus.",
];

export const PRESET_BADGES = [
  "Verified GAMAT Trader",
  "Institutional SMC Ambassador",
  "Elite Price Action Student",
  "Funded Account Trader",
  "Certified Technical Analyst",
];

export const INITIAL_PROFILES: AffiliateProfile[] = [
  {
    userId: "usr-amb-001",
    userName: "Emmanuel Okoro",
    userEmail: "emmanuel.okoro@example.com",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80",
    referralCode: "GMT-OKORO99",
    badgeTitle: "Institutional SMC Ambassador",
    personalQuote: "Trading isn't about guessing; it's about institutional liquidity, discipline, and edge. GAMAT FX transformed my journey. Join my trading circle and let's win together.",
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
    badgeTitle: "Verified GAMAT Trader",
    personalQuote: "From blowing accounts to consistent risk management. GAMAT FX Academy gave me the structure and mentorship I needed. Start your trading journey with my personal invite.",
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
    badgeTitle: "Funded Account Trader",
    personalQuote: "Master price action, understand market maker intent, and protect your capital. Proud to be part of the GAMAT FX community. Join today with VIP student access.",
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
  {
    id: "comm-104",
    affiliateUserId: "usr-amb-001",
    affiliateCode: "GMT-OKORO99",
    customerName: "Ibrahim Musa",
    customerEmail: "ibrahim.m@example.com",
    orderType: "course",
    orderTitle: "Institutional Price Action Masterclass",
    orderAmount: 200000,
    commissionRate: 0.15,
    commissionAmount: 30000,
    status: "approved",
    createdAt: "2026-03-04T16:30:00Z",
  },
  {
    id: "comm-105",
    affiliateUserId: "usr-amb-003",
    affiliateCode: "GMT-DAVID77",
    customerName: "Zainab Ahmed",
    customerEmail: "zainab.a@example.com",
    orderType: "store",
    orderTitle: "FVG Radar & Order Block Suite",
    orderAmount: 45000,
    commissionRate: 0.15,
    commissionAmount: 6750,
    status: "approved",
    createdAt: "2026-03-05T12:00:00Z",
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
  {
    id: "payout-004",
    affiliateUserId: "usr-amb-003",
    affiliateName: "David Adeleke",
    affiliateEmail: "david.adeleke@example.com",
    amount: 50000,
    method: "bank",
    details: "Zenith Bank • 2184930211 • David Adeleke",
    status: "pending",
    requestedAt: "2026-03-05T13:20:00Z",
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
    // 1. Check window search
    const searchParams = new URLSearchParams(window.location.search);
    let code = searchParams.get("ref");

    // 2. Check window hash if hash-based routing is used
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

/* ----------------- Pinterest / Medium Card Canvas Renderer ----------------- */

/**
 * Renders the High-Definition Pinterest / Medium-Style card directly onto an offscreen canvas
 * and returns the Data URL for 1-click download as PNG.
 */
export async function exportAffiliateCardAsPng(
  profile: AffiliateProfile,
  avatarUrl?: string
): Promise<string> {
  const width = 1080;
  const height = 1520;
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Could not create canvas context");

  // 1. Deep Obsidian Gradient Background
  const bgGrad = ctx.createLinearGradient(0, 0, width, height);
  bgGrad.addColorStop(0, "#080c14");
  bgGrad.addColorStop(0.5, "#0f172a");
  bgGrad.addColorStop(1, "#0a0f1d");
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, width, height);

  // 2. Subtle luxury radial glow on top-right & bottom-left
  const glow1 = ctx.createRadialGradient(width * 0.85, height * 0.15, 20, width * 0.85, height * 0.15, 450);
  glow1.addColorStop(0, "rgba(220, 53, 69, 0.22)"); // Brand Crimson Glow
  glow1.addColorStop(1, "rgba(0, 0, 0, 0)");
  ctx.fillStyle = glow1;
  ctx.fillRect(0, 0, width, height);

  const glow2 = ctx.createRadialGradient(width * 0.15, height * 0.85, 20, width * 0.15, height * 0.85, 450);
  glow2.addColorStop(0, "rgba(217, 119, 6, 0.18)"); // Gold Glow
  glow2.addColorStop(1, "rgba(0, 0, 0, 0)");
  ctx.fillStyle = glow2;
  ctx.fillRect(0, 0, width, height);

  // 3. Elegant border
  ctx.lineWidth = 4;
  ctx.strokeStyle = "rgba(255, 255, 255, 0.12)";
  ctx.strokeRect(36, 36, width - 72, height - 72);

  ctx.lineWidth = 1.5;
  ctx.strokeStyle = "rgba(220, 53, 69, 0.4)";
  ctx.strokeRect(44, 44, width - 88, height - 88);

  // 4. Header: GAMAT FX ACADEMY + Verified Brand Badge
  ctx.textAlign = "left";
  ctx.font = "900 32px sans-serif";
  ctx.fillStyle = "#ffffff";
  ctx.fillText("GAMAT FX", 90, 130);

  ctx.font = "600 22px sans-serif";
  ctx.fillStyle = "#dc3545";
  ctx.fillText("ACADEMY", 255, 130);

  // Top pill badge: OFFICIAL STUDENT AMBASSADOR
  ctx.textAlign = "right";
  ctx.fillStyle = "rgba(220, 53, 69, 0.16)";
  roundRect(ctx, width - 480, 94, 390, 48, 24);
  ctx.fill();
  ctx.strokeStyle = "rgba(220, 53, 69, 0.45)";
  ctx.lineWidth = 2;
  ctx.stroke();

  ctx.font = "bold 17px sans-serif";
  ctx.fillStyle = "#ffd2d5";
  ctx.fillText("★  OFFICIAL STUDENT AMBASSADOR", width - 110, 125);

  // 5. Profile Spotlight Card (Glassmorphism box)
  ctx.fillStyle = "rgba(255, 255, 255, 0.04)";
  roundRect(ctx, 80, 180, width - 160, 240, 28);
  ctx.fill();
  ctx.strokeStyle = "rgba(255, 255, 255, 0.09)";
  ctx.lineWidth = 2;
  ctx.stroke();

  // Try loading avatar image if provided
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
      ctx.arc(200, 300, 75, 0, Math.PI * 2);
      ctx.closePath();
      ctx.clip();
      ctx.drawImage(img, 125, 225, 150, 150);
      ctx.restore();

      // Outer gold/brand ring
      ctx.beginPath();
      ctx.arc(200, 300, 78, 0, Math.PI * 2);
      ctx.strokeStyle = "#dc3545";
      ctx.lineWidth = 5;
      ctx.stroke();
      avatarLoaded = true;
    } catch {
      avatarLoaded = false;
    }
  }

  if (!avatarLoaded) {
    // Fallback Initial Avatar Circle
    const initGrad = ctx.createLinearGradient(125, 225, 275, 375);
    initGrad.addColorStop(0, "#dc3545");
    initGrad.addColorStop(1, "#8b1523");
    ctx.fillStyle = initGrad;
    ctx.beginPath();
    ctx.arc(200, 300, 75, 0, Math.PI * 2);
    ctx.fill();

    ctx.textAlign = "center";
    ctx.font = "bold 56px sans-serif";
    ctx.fillStyle = "#ffffff";
    const initials = (profile.userName || "TR")
      .split(" ")
      .map((n) => n[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();
    ctx.fillText(initials, 200, 320);
  }

  // Name & Badge inside Spotlight
  ctx.textAlign = "left";
  ctx.font = "900 48px sans-serif";
  ctx.fillStyle = "#ffffff";
  ctx.fillText(profile.userName, 310, 285);

  ctx.font = "600 24px sans-serif";
  ctx.fillStyle = "#38bdf8"; // Sky cyan accent
  ctx.fillText(profile.badgeTitle || "Verified GAMAT Trader", 310, 330);

  // Small rating / verification mark
  ctx.font = "500 20px sans-serif";
  ctx.fillStyle = "rgba(255, 255, 255, 0.6)";
  ctx.fillText("✓ Verified Institutional Trading Cohort", 310, 370);

  // 6. Medium / Pinterest Style Quotation & Trading Thesis
  ctx.fillStyle = "rgba(255, 255, 255, 0.025)";
  roundRect(ctx, 80, 460, width - 160, 520, 32);
  ctx.fill();
  ctx.strokeStyle = "rgba(255, 255, 255, 0.08)";
  ctx.lineWidth = 2;
  ctx.stroke();

  // Quotation mark
  ctx.font = "900 140px serif";
  ctx.fillStyle = "rgba(220, 53, 69, 0.35)";
  ctx.fillText("“", 120, 580);

  // Wrapped Quote text
  ctx.font = "italic 500 36px serif";
  ctx.fillStyle = "#f1f5f9";
  const quote = profile.personalQuote || PRESET_QUOTES[0];
  wrapText(ctx, quote, 130, 620, width - 260, 56);

  // Ambassador Signature Line
  ctx.font = "bold 24px sans-serif";
  ctx.fillStyle = "#fbbf24"; // Gold
  ctx.fillText(`— ${profile.userName}`, 130, 920);

  // 7. Call To Action & QR Code Section
  ctx.fillStyle = "rgba(220, 53, 69, 0.09)";
  roundRect(ctx, 80, 1020, width - 160, 370, 32);
  ctx.fill();
  ctx.strokeStyle = "rgba(220, 53, 69, 0.25)";
  ctx.lineWidth = 2;
  ctx.stroke();

  // Referral Code Pill Box
  ctx.fillStyle = "#ffffff";
  roundRect(ctx, 120, 1070, 480, 80, 18);
  ctx.fill();

  ctx.textAlign = "left";
  ctx.font = "bold 20px sans-serif";
  ctx.fillStyle = "#475569";
  ctx.fillText("INVITE CODE:", 145, 1120);

  ctx.font = "900 34px monospace";
  ctx.fillStyle = "#dc3545";
  ctx.fillText(profile.referralCode, 290, 1122);

  ctx.font = "600 24px sans-serif";
  ctx.fillStyle = "#ffffff";
  ctx.fillText("Scan to join my cohort & claim 5% off", 120, 1210);

  ctx.font = "400 20px sans-serif";
  ctx.fillStyle = "rgba(255, 255, 255, 0.65)";
  ctx.fillText("Official certification & mentorship curriculum", 120, 1248);

  ctx.font = "bold 26px sans-serif";
  ctx.fillStyle = "#38bdf8";
  ctx.fillText("gamatfxacademy.com", 120, 1330);

  // Draw QR Code representation onto the right side of the card
  const qrX = width - 360;
  const qrY = 1060;
  const qrSize = 240;

  // White base for QR
  ctx.fillStyle = "#ffffff";
  roundRect(ctx, qrX, qrY, qrSize, qrSize, 20);
  ctx.fill();

  // Try to load dynamic QR Code image
  const targetUrl = getSignupReferralUrl(profile.referralCode);
  const qrApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&margin=8&data=${encodeURIComponent(targetUrl)}`;

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
    // Stylized Fallback QR Matrix simulation
    ctx.fillStyle = "#000000";
    ctx.fillRect(qrX + 25, qrY + 25, 55, 55);
    ctx.fillRect(qrX + qrSize - 80, qrY + 25, 55, 55);
    ctx.fillRect(qrX + 25, qrY + qrSize - 80, 55, 55);
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(qrX + 37, qrY + 37, 31, 31);
    ctx.fillRect(qrX + qrSize - 68, qrY + 37, 31, 31);
    ctx.fillRect(qrX + 37, qrY + qrSize - 68, 31, 31);
    ctx.fillStyle = "#000000";
    ctx.fillRect(qrX + 45, qrY + 45, 15, 15);
    ctx.fillRect(qrX + qrSize - 60, qrY + 45, 15, 15);
    ctx.fillRect(qrX + 45, qrY + qrSize - 60, 15, 15);

    // Decorative data grid
    for (let r = 0; r < 6; r++) {
      for (let c = 0; c < 6; c++) {
        if ((r + c) % 2 === 0) {
          ctx.fillRect(qrX + 95 + c * 15, qrY + 95 + r * 15, 12, 12);
        }
      }
    }
  }

  // 8. Footer copyright & disclaimer
  ctx.textAlign = "center";
  ctx.font = "400 16px sans-serif";
  ctx.fillStyle = "rgba(255, 255, 255, 0.4)";
  ctx.fillText("GAMAT Fx Academy Ltd. • Regulated Educational Institution • Risk Disclaimer: Trading Forex carries risk.", width / 2, height - 50);

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
