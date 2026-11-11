import crypto from "crypto";
import { createClient } from "@supabase/supabase-js";

/**
 * Bachs Webhook Endpoint: /api/webhooks/bachs
 * Fulfills student course enrollments and digital store purchases upon verified payment.
 */

// Disable body parser in Vercel so we can read the raw request body for signature verification
export const config = {
  api: {
    bodyParser: false,
  },
};

async function getRawBody(req) {
  const chunks = [];
  for await (const chunk of req) {
    chunks.push(typeof chunk === "string" ? Buffer.from(chunk) : chunk);
  }
  return Buffer.concat(chunks).toString("utf8");
}

function verifyBachsSignature(rawBody, headers, secret) {
  if (!secret) {
    // If no secret configured yet, warn but accept during initial sandbox configuration
    console.warn("[Bachs Webhook] No BACHS_WEBHOOK_SECRET configured. Skipping verification.");
    return true;
  }

  const sigV2 = headers["x-bachs-signature-v2"];
  const sigV1 = headers["x-bachs-signature"];
  const timestamp = headers["x-bachs-timestamp"];

  if (sigV2) {
    // Format: t=1610000000,v1=abc123...
    const parts = sigV2.split(",").reduce((acc, part) => {
      const [k, v] = part.split("=");
      if (k && v) {
        if (!acc[k]) acc[k] = [];
        acc[k].push(v);
      }
      return acc;
    }, {});

    const ts = parts.t?.[0];
    if (!ts) return false;

    // Check 300 second timestamp tolerance
    const nowSec = Math.floor(Date.now() / 1000);
    if (Math.abs(nowSec - parseInt(ts, 10)) > 300) {
      console.warn("[Bachs Webhook] Timestamp outside 300s tolerance window");
      return false;
    }

    const expected = crypto
      .createHmac("sha256", secret.trim())
      .update(`${ts}.${rawBody}`)
      .digest("hex");

    const signatures = parts.v1 || [];
    return signatures.some((sig) => {
      try {
        return crypto.timingSafeEqual(Buffer.from(expected, "hex"), Buffer.from(sig, "hex"));
      } catch {
        return false;
      }
    });
  }

  if (sigV1 && timestamp) {
    const expected = crypto
      .createHmac("sha256", secret.trim())
      .update(`${timestamp}.${rawBody}`)
      .digest("hex");
    try {
      return crypto.timingSafeEqual(Buffer.from(expected, "hex"), Buffer.from(sigV1, "hex"));
    } catch {
      return false;
    }
  }

  return false;
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  let rawBody = "";
  try {
    rawBody = await getRawBody(req);
  } catch (err) {
    return res.status(400).json({ message: "Could not read request body" });
  }

  const webhookSecret = (process.env.BACHS_WEBHOOK_SECRET || "").trim();

  // Verify signature
  const isValid = verifyBachsSignature(rawBody, req.headers, webhookSecret);
  if (!isValid) {
    console.error("[Bachs Webhook] Invalid signature rejected");
    return res.status(400).json({ message: "Invalid signature" });
  }

  let event;
  try {
    event = JSON.parse(rawBody);
  } catch (err) {
    return res.status(400).json({ message: "Invalid JSON payload" });
  }

  console.log(`[Bachs Webhook] Processing event: ${event.type} (${event.id})`);

  // Handle successful checkout & collection events
  if (event.type === "checkout.completed" || event.type === "collection.succeeded") {
    const data = event.data || {};
    const metadata = data.metadata || {};
    const reference = data.reference || metadata.reference || `GFX-${Date.now()}`;
    const studentEmail = data.customer?.email || metadata.student_email || "";
    const studentName = data.customer?.name || metadata.student_name || "Student";
    const courseId = metadata.course_id || "";
    const courseTitle = metadata.course_title || "Enrolled Course";
    const amountVal = parseFloat(data.amount || "0") || 0;

    // Fulfill via Supabase if configured
    const supabaseUrl = process.env.VITE_SUPABASE_URL || "https://pbbtiazbpolvajjsqirs.supabase.co";
    const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || "sb_publishable_FnEN-7WZtC0_qvoNApQNSw__c9KqANV";

    if (supabaseUrl && supabaseKey) {
      try {
        const supabase = createClient(supabaseUrl, supabaseKey);

        // Record payment in payments table
        await supabase.from("payments").upsert(
          {
            ref: reference,
            user_name: studentName,
            user_email: studentEmail,
            course_id: courseId,
            course_title: courseTitle,
            amount: amountVal,
            method: "card",
            status: "paid",
            created_at: new Date().toISOString(),
          },
          { onConflict: "ref" }
        );

        // If it's a course enrollment, record in enrollments table
        if (courseId && studentEmail) {
          await supabase.from("enrollments").upsert(
            {
              course_id: courseId,
              user_email: studentEmail,
              status: "active",
              enrolled_at: new Date().toISOString(),
            },
            { onConflict: "course_id,user_email" }
          );
        }

        console.log(`[Bachs Webhook] Successfully fulfilled order ${reference} for ${studentEmail}`);
      } catch (dbErr) {
        console.error("[Bachs Webhook] Supabase fulfillment error:", dbErr);
        // Still return 200 to acknowledge receipt of event so Bachs does not retry endlessly
      }
    }
  }

  return res.status(200).json({ received: true, type: event.type, id: event.id });
}
