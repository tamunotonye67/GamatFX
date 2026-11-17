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
