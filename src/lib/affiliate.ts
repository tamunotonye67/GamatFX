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
 * Renders the Centered, Minimalist, and Prestigious Official Student Share Card onto an offscreen canvas:
 * Top Center: Logo & Brand + Student Avatar
 * Under: Name + Enrolled Course
 * Under: QR Code + Invitation to join & Invite code
 * Price-free design.
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
  bgGrad.addColorStop(0.5, "#0d1322");
  bgGrad.addColorStop(1, "#070a10");
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, width, height);

  // 2. Radial ambient glows
  const topGlow = ctx.createRadialGradient(width / 2, 280, 20, width / 2, 280, 500);
  topGlow.addColorStop(0, "rgba(220, 53, 69, 0.22)");
  topGlow.addColorStop(1, "rgba(0, 0, 0, 0)");
  ctx.fillStyle = topGlow;
  ctx.fillRect(0, 0, width, height);

  const btmGlow = ctx.createRadialGradient(width / 2, 1000, 20, width / 2, 1000, 480);
  btmGlow.addColorStop(0, "rgba(56, 189, 248, 0.12)");
  btmGlow.addColorStop(1, "rgba(0, 0, 0, 0)");
  ctx.fillStyle = btmGlow;
  ctx.fillRect(0, 0, width, height);

  // 3. Elegant outer perimeter borders
  ctx.lineWidth = 2;
  ctx.strokeStyle = "rgba(255, 255, 255, 0.08)";
  roundRect(ctx, 40, 40, width - 80, height - 80, 40);
  ctx.stroke();

  ctx.lineWidth = 1.5;
  ctx.strokeStyle = "rgba(220, 53, 69, 0.35)";
  roundRect(ctx, 48, 48, width - 96, height - 96, 36);
  ctx.stroke();

  // 4. TOP CENTER: Brand Logo & Verified Student Tag
  ctx.textAlign = "center";
  ctx.font = "900 38px sans-serif";
  ctx.fillStyle = "#ffffff";
  ctx.fillText("GAMAT FX", width / 2 - 82, 125);

  ctx.font = "800 38px sans-serif";
  ctx.fillStyle = "#dc3545";
  ctx.fillText("ACADEMY", width / 2 + 82, 125);

  // Subtle Verified Student Pill
  ctx.fillStyle = "rgba(16, 185, 129, 0.12)";
  roundRect(ctx, width / 2 - 175, 148, 350, 36, 18);
  ctx.fill();
  ctx.strokeStyle = "rgba(16, 185, 129, 0.4)";
  ctx.lineWidth = 1.5;
  ctx.stroke();

  ctx.font = "bold 13px sans-serif";
  ctx.fillStyle = "#6ee7b7";
  ctx.fillText("✓ VERIFIED STUDENT ENROLLMENT", width / 2, 171);

  // 5. TOP CENTER: Student Profile Avatar
  const avatarCenterX = width / 2;
  const avatarCenterY = 300;
  const avatarRadius = 80;

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

      // Outer brand ring
      ctx.beginPath();
      ctx.arc(avatarCenterX, avatarCenterY, avatarRadius + 4, 0, Math.PI * 2);
      ctx.strokeStyle = "#dc3545";
      ctx.lineWidth = 5;
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
    initGrad.addColorStop(0, "#dc3545");
    initGrad.addColorStop(1, "#8b1523");
    ctx.fillStyle = initGrad;
    ctx.beginPath();
    ctx.arc(avatarCenterX, avatarCenterY, avatarRadius, 0, Math.PI * 2);
    ctx.fill();

    ctx.beginPath();
    ctx.arc(avatarCenterX, avatarCenterY, avatarRadius + 4, 0, Math.PI * 2);
    ctx.strokeStyle = "rgba(255, 255, 255, 0.4)";
    ctx.lineWidth = 3;
    ctx.stroke();

    ctx.textAlign = "center";
    ctx.font = "bold 60px sans-serif";
    ctx.fillStyle = "#ffffff";
    const initials = (profile.userName || "ST")
      .split(" ")
      .map((n) => n[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();
    ctx.fillText(initials, avatarCenterX, avatarCenterY + 22);
  }

  // Active checkmark badge overlay on avatar
  ctx.beginPath();
  ctx.arc(avatarCenterX + 56, avatarCenterY + 56, 22, 0, Math.PI * 2);
  ctx.fillStyle = "#0284c7";
  ctx.fill();
  ctx.strokeStyle = "#080c14";
  ctx.lineWidth = 4;
  ctx.stroke();

  ctx.textAlign = "center";
  ctx.font = "bold 20px sans-serif";
  ctx.fillStyle = "#ffffff";
  ctx.fillText("✓", avatarCenterX + 56, avatarCenterY + 63);

  // 6. Student Name & Enrolled Course (Directly Under Avatar)
  ctx.textAlign = "center";
  ctx.font = "900 44px sans-serif";
  ctx.fillStyle = "#ffffff";
  ctx.fillText(profile.userName, width / 2, 435);

  // Enrolled Course Badge Pill (Centered)
  const courseName = profile.enrolledCourseTitle || "Forex Foundations";
  ctx.font = "700 22px sans-serif";
  const courseText = `Enrolled in: ${courseName}`;
  const courseMetrics = ctx.measureText(courseText);
  const pillW = Math.max(360, courseMetrics.width + 56);

  ctx.fillStyle = "rgba(220, 53, 69, 0.12)";
  roundRect(ctx, width / 2 - pillW / 2, 465, pillW, 50, 25);
  ctx.fill();
  ctx.strokeStyle = "rgba(220, 53, 69, 0.4)";
  ctx.lineWidth = 2;
  ctx.stroke();

  ctx.fillStyle = "#fca5a5";
  ctx.fillText(courseText, width / 2, 498);

  // 7. Refined divider
  const divGrad = ctx.createLinearGradient(width / 2 - 240, 550, width / 2 + 240, 550);
  divGrad.addColorStop(0, "rgba(255, 255, 255, 0)");
  divGrad.addColorStop(0.5, "rgba(255, 255, 255, 0.2)");
  divGrad.addColorStop(1, "rgba(255, 255, 255, 0)");
  ctx.strokeStyle = divGrad;
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(width / 2 - 240, 550);
  ctx.lineTo(width / 2 + 240, 550);
  ctx.stroke();

  // 8. Invitation to Join (Centered, NO price mention whatsoever)
  ctx.textAlign = "center";
  ctx.font = "900 36px sans-serif";
  ctx.fillStyle = "#ffffff";
  ctx.fillText("Join Me at GAMAT Fx Academy", width / 2, 615);

  ctx.font = "500 20px sans-serif";
  ctx.fillStyle = "#94a3b8";
  ctx.fillText("Scan the QR code below to connect with my cohort & learn together", width / 2, 660);

  // 9. QR Code Card Container (Centered)
  const qrCardW = 420;
  const qrCardH = 420;
  const qrCardX = width / 2 - qrCardW / 2;
  const qrCardY = 705;

  ctx.fillStyle = "#ffffff";
  roundRect(ctx, qrCardX, qrCardY, qrCardW, qrCardH, 32);
  ctx.fill();
  ctx.strokeStyle = "#e2e8f0";
  ctx.lineWidth = 3;
  ctx.stroke();

  const targetUrl = getSignupReferralUrl(profile.referralCode);
  const qrApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=340x340&margin=8&data=${encodeURIComponent(targetUrl)}`;

  try {
    const qrImg = new Image();
    qrImg.crossOrigin = "anonymous";
    await new Promise<void>((resolve, reject) => {
      qrImg.onload = () => resolve();
      qrImg.onerror = () => reject();
      qrImg.src = qrApiUrl;
    });
    ctx.drawImage(qrImg, qrCardX + 40, qrCardY + 40, 340, 340);
  } catch {
    ctx.fillStyle = "#0f172a";
    ctx.fillRect(qrCardX + 60, qrCardY + 60, 80, 80);
    ctx.fillRect(qrCardX + qrCardW - 140, qrCardY + 60, 80, 80);
    ctx.fillRect(qrCardX + 60, qrCardY + qrCardH - 140, 80, 80);
  }

  // 10. Invite Code Pill (Centered Under QR)
  const codePillW = 500;
  const codePillH = 74;
  const codePillX = width / 2 - codePillW / 2;
  const codePillY = 1170;

  ctx.fillStyle = "rgba(255, 255, 255, 0.05)";
  roundRect(ctx, codePillX, codePillY, codePillW, codePillH, 20);
  ctx.fill();
  ctx.strokeStyle = "rgba(255, 255, 255, 0.12)";
  ctx.lineWidth = 1.5;
  ctx.stroke();

  ctx.font = "bold 18px sans-serif";
  ctx.fillStyle = "#94a3b8";
  ctx.fillText("INVITE CODE:", width / 2 - 110, codePillY + 46);

  ctx.font = "900 32px monospace";
  ctx.fillStyle = "#dc3545";
  ctx.fillText(profile.referralCode, width / 2 + 75, codePillY + 47);

  // 11. Official Website URL & Footer Watermark
  ctx.font = "bold 26px sans-serif";
  ctx.fillStyle = "#38bdf8";
  ctx.fillText("gamatfxacademy.com", width / 2, 1290);

  ctx.font = "500 16px sans-serif";
  ctx.fillStyle = "rgba(255, 255, 255, 0.45)";
  ctx.fillText("GAMAT Fx Academy • Official Student Share Card", width / 2, 1350);

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
