/**
 * Vercel Serverless Function: Create Bachs Checkout Session
 * Handles session creation securely on the server with zero CORS issues.
 */

export default async function handler(req, res) {
  // CORS headers
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS,PATCH,DELETE,POST,PUT");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization"
  );

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    const apiKey = (
      process.env.BACHS_API_KEY ||
      process.env.VITE_BACHS_API_KEY ||
      "sk_sandbox_9f8fb85e_zfe4AAk2KQqAPiqlB8gA6d4vNua8k5ATdaBRsdBfkEw"
    ).trim();

    const baseUrl = apiKey.startsWith("sk_live_")
      ? "https://api.bachs.io/v1"
      : "https://sandbox-api.bachs.io/v1";

    const body = typeof req.body === "string" ? JSON.parse(req.body) : (req.body || {});
    const { amount, currency = "NGN", email, name, phone, reference, metadata } = body;

    if (!amount || !email) {
      return res.status(400).json({ message: "Missing required fields (amount, email)" });
    }

    const formattedAmount = Number(amount).toFixed(2);

    const payload = {
      pricing: {
        amount: formattedAmount,
        currency,
      },
      customer: {
        email,
        name: name || "Student",
        ...(phone ? { phone } : {}),
      },
      reference: reference || `GFX-${Date.now()}`,
      metadata: metadata || {},
    };

    const response = await fetch(`${baseUrl}/checkout-sessions`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      return res.status(response.status).json(data);
    }

    return res.status(200).json({
      checkout_id: data.checkout_id,
      checkout_url: data.checkout_url,
      amount: data.amount || formattedAmount,
      currency: data.currency || currency,
      reference: data.reference || payload.reference,
      status: data.status,
    });
  } catch (err) {
    return res.status(500).json({ message: err.message || "Failed to create checkout session" });
  }
}
