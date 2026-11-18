/**
 * Client-side helpers to trigger Resend emails via /api/send-email
 * Fails silently (non-blocking) so user flows never break in offline/preview environments.
 */

export async function sendReceiptEmail(params: {
  to: string;
  name: string;
  itemTitle: string;
  amount: number;
  reference: string;
  method?: string;
  category?: string;
  downloadUrl?: string;
  isPreorder?: boolean;
  releaseDate?: string;
}): Promise<void> {
  if (!params.to) return;
  try {
    await fetch("/api/send-email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: "receipt", ...params }),
    });
  } catch {
    // Non-blocking
  }
}

export async function sendEnquiryEmail(params: {
  to: string;
  name: string;
  phone?: string;
  serviceTitle: string;
  packageName?: string;
  budget?: string;
  company?: string;
  message: string;
  ref?: string;
}): Promise<void> {
  if (!params.to) return;
  try {
    await fetch("/api/send-email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: "enquiry", ...params }),
    });
  } catch {
    // Non-blocking
  }
}

export async function sendAffiliateEmail(params: {
  to: string;
  affiliateName: string;
  eventKind: "signup" | "commission";
  referralCode: string;
  referredName?: string;
  itemTitle?: string;
  commissionAmount?: number;
}): Promise<void> {
  if (!params.to) return;
  try {
    await fetch("/api/send-email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: "affiliate", ...params }),
    });
  } catch {
    // Non-blocking
  }
}

export async function sendWelcomeEmail(params: { to: string; name: string }): Promise<void> {
  if (!params.to) return;
  try {
    await fetch("/api/send-email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: "welcome", ...params }),
    });
  } catch {
    // Non-blocking
  }
}

export async function sendPayoutEmail(params: {
  to: string;
  affiliateName: string;
  eventKind: "requested" | "paid" | "rejected";
  amount: number;
  method: string;
  details?: string;
  note?: string;
}): Promise<void> {
  try {
    await fetch("/api/send-email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: "payout", ...params }),
    });
  } catch {
    // Non-blocking
  }
}

export async function sendQuizPassedEmail(params: {
  to: string;
  name: string;
  courseTitle: string;
  score: number;
  courseId: string;
}): Promise<void> {
  if (!params.to) return;
  try {
    await fetch("/api/send-email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: "quiz_passed", ...params }),
    });
  } catch {
    // Non-blocking
  }
}

export async function sendGiveawayWinnerEmail(params: {
  to: string;
  name: string;
  giveawayTitle: string;
  reward: string;
}): Promise<void> {
  if (!params.to) return;
  try {
    await fetch("/api/send-email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: "giveaway_winner", ...params }),
    });
  } catch {
    // Non-blocking
  }
}

export async function sendEventCancelledEmail(params: {
  to: string;
  name: string;
  eventTitle: string;
  eventDate?: string;
  ticket?: string;
}): Promise<void> {
  if (!params.to) return;
  try {
    await fetch("/api/send-email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: "event_cancelled", ...params }),
    });
  } catch {
    // Non-blocking
  }
}

export async function sendMentorshipSurveyEmail(params: {
  userEmail?: string;
  userName: string;
  courseOrPlan: string;
  experienceLevel?: string;
  tradingPath: string;
  challenges: string;
  longTermGoals: string;
  availability: string;
}): Promise<void> {
  try {
    await fetch("/api/send-email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: "mentorship_survey", ...params }),
    });
  } catch {
    // Non-blocking
  }
}

export async function sendTeamBioEmail(params: {
  to?: string;
  name: string;
  role: string;
  eventKind: "submitted" | "approved" | "rejected";
}): Promise<void> {
  try {
    await fetch("/api/send-email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: "team_bio", ...params }),
    });
  } catch {
    // Non-blocking
  }
}

export async function sendForumReplyEmail(params: {
  to: string;
  authorName: string;
  replierName: string;
  threadTitle: string;
  replyPreview: string;
}): Promise<void> {
  if (!params.to) return;
  try {
    await fetch("/api/send-email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: "forum_reply", ...params }),
    });
  } catch {
    // Non-blocking
  }
}

export async function sendReviewSubmittedEmail(params: {
  userName: string;
  userEmail?: string;
  targetType: string;
  targetTitle: string;
  rating: number;
  comment: string;
}): Promise<void> {
  try {
    await fetch("/api/send-email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: "review_submitted", ...params }),
    });
  } catch {
    // Non-blocking
  }
}

export async function sendDiscoverySurveyEmail(params: {
  sourceId: string;
  detail?: string;
  userName?: string;
  userEmail?: string;
  route?: string;
}): Promise<void> {
  try {
    await fetch("/api/send-email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: "discovery_survey", ...params }),
    });
  } catch {
    // Non-blocking
  }
}

export async function sendVerificationEmail(params: {
  to: string;
  name?: string;
  origin?: string;
}): Promise<{ ok: boolean; error?: string }> {
  const controller = typeof AbortController !== "undefined" ? new AbortController() : null;
  const timer = controller ? setTimeout(() => controller.abort(), 12000) : null;
  try {
    const res = await fetch("/api/send-email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      signal: controller?.signal,
      body: JSON.stringify({
        type: "email_verification",
        to: params.to,
        name: params.name,
        origin:
          params.origin ||
          (typeof window !== "undefined" ? window.location.origin : undefined),
      }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok || data.ok === false) {
      return { ok: false, error: data.message || "Could not send verification email." };
    }
    return { ok: true };
  } catch (err: any) {
    if (err?.name === "AbortError") {
      return { ok: false, error: "Verification email request timed out. Please try again." };
    }
    return { ok: false, error: err?.message || "Network error sending verification email." };
  } finally {
    if (timer) clearTimeout(timer);
  }
}

export async function sendBroadcastEmail(params: {
  recipients: string[];
  subject: string;
  message: string;
  ctaLabel?: string;
  ctaUrl?: string;
}): Promise<{ ok: boolean; sent?: number; failed?: number; error?: string }> {
  try {
    const res = await fetch("/api/send-email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: "broadcast", ...params }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok || data.ok === false) {
      return { ok: false, error: data.message || "Failed to send broadcast." };
    }
    return { ok: true, sent: data.sent ?? params.recipients.length, failed: data.failed ?? 0 };
  } catch (err: any) {
    return { ok: false, error: err?.message || "Network error sending broadcast." };
  }
}

export async function sendMentorshipBookingEmail(params: {
  to: string;
  name: string;
  date: string;
  timeSlot: string;
  topic: string;
  notes?: string;
  mode?: "request" | "confirmed" | "declined";
  meetingLink?: string;
}): Promise<{ ok: boolean; error?: string }> {
  try {
    const res = await fetch("/api/send-email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: "mentorship_booking", ...params }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok || data.ok === false) {
      return { ok: false, error: data.message || "Failed to send booking confirmation." };
    }
    return { ok: true };
  } catch (err: any) {
    return { ok: false, error: err?.message || "Network error sending booking confirmation." };
  }
}

export async function sendMentionEmail(params: {
  to: string;
  mentionedName: string;
  senderName: string;
  contextTitle: string;
  preview: string;
  url?: string;
}): Promise<{ ok: boolean; error?: string }> {
  try {
    const res = await fetch("/api/send-email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: "mention_notification", ...params }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok || data.ok === false) {
      return { ok: false, error: data.message || "Failed to send mention notification." };
    }
    return { ok: true };
  } catch (err: any) {
    return { ok: false, error: err?.message || "Network error sending mention notification." };
  }
}
