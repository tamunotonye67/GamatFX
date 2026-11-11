/**
 * Bachs.io Payment Gateway Integration
 * Official Docs: https://docs.bachs.io/
 */

export interface BachsConfig {
  apiKey: string;
  environment: "sandbox" | "production";
  activeGateway: "bachs" | "transfer";
  webhookSecret?: string;
  businessName?: string;
}

/**
 * Generates a unique transaction reference string for payments.
 */
export function generateTxRef(prefix = "GFX"): string {
  const ts = Date.now().toString(36).toUpperCase();
  const rand = Math.random().toString(36).substring(2, 7).toUpperCase();
  return `${prefix}_${ts}_${rand}`;
}

const getEnvActiveGateway = () => ((import.meta as any).env?.VITE_BACHS_ACTIVE_GATEWAY || "bachs");

export const DEFAULT_BACHS_CONFIG: BachsConfig = {
  apiKey: "",
  environment: "production",
  activeGateway: (getEnvActiveGateway() === "transfer" ? "transfer" : "bachs"),
  businessName: "GAMAT FX Academy",
};

const STORAGE_KEY = "gamat_bachs_config";

/**
 * Retrieves the current Bachs configuration from localStorage or environment variables.
 */
export function getBachsConfig(): BachsConfig {
  try {
    const envKey = getEnvApiKey();
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return {
        apiKey: envKey,
        environment: envKey.startsWith("sk_live_") ? "production" : "sandbox",
        activeGateway: (getEnvActiveGateway() as any) || "bachs",
        webhookSecret: getEnvWebhookSecret(),
        businessName: DEFAULT_BACHS_CONFIG.businessName,
      };
    }
    const parsed = JSON.parse(raw);
    const resolvedKey = (envKey.startsWith("sk_live_") ? envKey : (parsed.apiKey || envKey || "")).trim();
    return {
      apiKey: resolvedKey,
      environment: resolvedKey.startsWith("sk_live_") ? "production" : "sandbox",
      activeGateway: parsed.activeGateway || (getEnvActiveGateway() as any) || "bachs",
      webhookSecret: parsed.webhookSecret || getEnvWebhookSecret(),
      businessName: parsed.businessName || DEFAULT_BACHS_CONFIG.businessName,
    };
  } catch {
    return { ...DEFAULT_BACHS_CONFIG };
  }
}

/**
 * Saves updated Bachs configuration to localStorage.
 */
export function saveBachsConfig(config: Partial<BachsConfig>): BachsConfig {
  const current = getBachsConfig();
  const updated: BachsConfig = {
    ...current,
    ...config,
  };
  if (updated.apiKey) {
    updated.environment = updated.apiKey.startsWith("sk_live_") ? "production" : "sandbox";
  }
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch (e) {
    console.error("Failed to persist Bachs config", e);
  }
  return updated;
}

export function getBachsBaseUrl(apiKey?: string): string {
  const key = apiKey || getBachsConfig().apiKey;
  return key.startsWith("sk_live_")
    ? "https://api.bachs.io/v1"
    : "https://sandbox-api.bachs.io/v1";
}

export interface BachsCheckoutSessionParams {
  amount: number; // e.g. 25000
  currency?: string; // e.g. "NGN"
  email: string;
  name: string;
  phone?: string;
  reference: string;
  metadata?: Record<string, any>;
  description?: string;
}

export interface BachsCheckoutSessionResult {
  checkout_id: string;
  checkout_url: string;
  amount: string;
  currency: string;
  reference: string;
  status: string;
}

declare global {
  interface Window {
    Bachs?: {
      Initialize: (options?: { baseUrl?: string; onEvent?: (event: any) => void }) => void;
      Checkout: {
        open: (options: {
          checkoutUrl?: string;
          token?: string;
          onEvent?: (event: { type: string; data: any }) => void;
          options?: any;
        }) => Promise<any>;
        close: () => void;
        isOpen: () => boolean;
      };
    };
  }
}

/**
 * Loads the official Bachs Overlay Checkout SDK script if not already present.
 */
export function loadBachsScript(isSandbox: boolean = false): Promise<boolean> {
  return new Promise((resolve) => {
    const scriptSrc = isSandbox
      ? "https://sandbox-checkout.bachs.io/bachs.js"
      : "https://checkout.bachs.io/bachs.js";

    if (window.Bachs && window.Bachs.Checkout) {
      resolve(true);
      return;
    }
    const existing = document.querySelector('script[src*="bachs.js"]');
    if (existing) {
      existing.addEventListener("load", () => resolve(true));
      existing.addEventListener("error", () => resolve(false));
      return;
    }
    const script = document.createElement("script");
    script.src = scriptSrc;
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

/**
 * Tests API connection against Bachs sandbox or live endpoint.
 */
export async function testBachsConnection(apiKey?: string): Promise<{ ok: boolean; message: string }> {
  const config = getBachsConfig();
  const key = (apiKey ?? config.apiKey).trim();
  if (!key) {
    return { ok: false, message: "No Bachs API Key provided." };
  }
  const baseUrl = getBachsBaseUrl(key);

  try {
    const res = await fetch(`${baseUrl}/products?limit=1`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
      },
    });

    if (res.ok) {
      const mode = key.startsWith("sk_live_") ? "Live / Production" : "Sandbox";
      return { ok: true, message: `Connected successfully! Bachs ${mode} API is active and authenticated.` };
    } else {
      const err = await res.json().catch(() => ({}));
      return {
        ok: false,
        message: err.message || `Authentication failed (${res.status} ${res.statusText}). Verify your API key.`,
      };
    }
  } catch (err: any) {
    return { ok: false, message: `Network error connecting to Bachs: ${err?.message || "Check connection"}` };
  }
}

/**
 * Creates a server/client checkout session using the Bachs API.
 * Follows Bachs specification: amount must be a decimal string with ISO currency.
 */
export async function createBachsCheckoutSession(
  params: BachsCheckoutSessionParams
): Promise<BachsCheckoutSessionResult> {
  const formattedAmount = params.amount.toFixed(2);
  const currency = params.currency || "NGN";

  const payload = {
    amount: formattedAmount,
    currency,
    email: params.email,
    name: params.name,
    phone: params.phone,
    reference: params.reference,
    metadata: params.metadata || {},
  };

  // 1. Try serverless endpoint first (runs server-side on Vercel / dev server with zero CORS)
  try {
    const apiRes = await fetch("/api/create-checkout", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (apiRes.ok) {
      const data = await apiRes.json();
      if (data.checkout_url) {
        return {
          checkout_id: data.checkout_id,
          checkout_url: data.checkout_url,
          amount: data.amount || formattedAmount,
          currency: data.currency || currency,
          reference: data.reference || params.reference,
          status: data.status || "open",
        };
      }
    } else {
      const errData = await apiRes.json().catch(() => ({}));
      throw new Error(errData.message || `Checkout session failed (${apiRes.status})`);
    }
  } catch (err: any) {
    const config = getBachsConfig();
    if (!config.apiKey) {
      throw err;
    }
    console.warn("Serverless checkout route failed, attempting direct fallback:", err);
  }

  // 2. Direct fallback (only when local client key is provided)
  const config = getBachsConfig();
  const baseUrl = getBachsBaseUrl(config.apiKey);

  const directResponse = await fetch(`${baseUrl}/checkout-sessions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${config.apiKey.trim()}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      pricing: {
        amount: formattedAmount,
        currency,
      },
      customer: {
        email: params.email,
        name: params.name,
        ...(params.phone ? { phone: params.phone } : {}),
      },
      reference: params.reference,
      metadata: params.metadata || {},
    }),
  });

  if (!directResponse.ok) {
    const errorBody = await directResponse.json().catch(() => null);
    const errorMsg = errorBody?.message || `Checkout error (${directResponse.status})`;
    throw new Error(errorMsg);
  }

  const data = await directResponse.json();
  return {
    checkout_id: data.checkout_id,
    checkout_url: data.checkout_url,
    amount: data.amount || formattedAmount,
    currency: data.currency || currency,
    reference: data.reference || params.reference,
    status: data.status,
  };
}

export interface PayWithBachsParams extends BachsCheckoutSessionParams {
  onSuccess: (session: { reference: string; status: string; checkoutId?: string }) => void;
  onClose?: () => void;
  onError?: (error: Error) => void;
}

/**
 * Launches the Bachs checkout overlay modal or opens checkout window fallback.
 */
export async function payWithBachs(params: PayWithBachsParams): Promise<void> {
  try {
    // 1. Create the checkout session
    const session = await createBachsCheckoutSession(params);

    const isSandbox = session.checkout_url.includes("sandbox-checkout.bachs.io");
    const checkoutOrigin = isSandbox
      ? "https://sandbox-checkout.bachs.io"
      : "https://checkout.bachs.io";

    // 2. Load the Overlay SDK matching the environment
    const scriptLoaded = await loadBachsScript(isSandbox);

    if (scriptLoaded && window.Bachs && window.Bachs.Checkout) {
      let isCompleted = false;

      // Initialize with the exact environment baseUrl so Bachs doesn't reject sandbox URLs
      if (typeof window.Bachs.Initialize === "function") {
        try {
          window.Bachs.Initialize({
            baseUrl: checkoutOrigin,
          });
        } catch (initErr) {
          console.warn("Bachs.Initialize warning:", initErr);
        }
      }

      // Open Modal Overlay directly on page
      try {
        await window.Bachs.Checkout.open({
          checkoutUrl: session.checkout_url,
          onEvent: (event) => {
            if (event.type === "checkout.completed") {
              isCompleted = true;
              params.onSuccess({
                reference: event.data?.reference || session.reference,
                status: event.data?.status || "completed",
                checkoutId: session.checkout_id,
              });
              try {
                window.Bachs?.Checkout.close();
              } catch {}
            } else if (event.type === "checkout.closed") {
              if (!isCompleted && params.onClose) {
                params.onClose();
              }
            } else if (event.type === "checkout.failed") {
              if (params.onError) {
                params.onError(new Error(event.data?.message || "Payment transaction was not completed."));
              }
            }
          },
        });
        return;
      } catch (overlayErr: any) {
        console.warn("Overlay failed to mount, falling back to secure checkout tab:", overlayErr);
      }
    }

    // Graceful fallback: Open the checkout URL in a dedicated secure tab
    const checkoutWindow = window.open(session.checkout_url, "_blank", "width=600,height=750");
    if (!checkoutWindow) {
      window.location.href = session.checkout_url;
      return;
    }

      // Check if user finishes or closes the window
      const checkTimer = setInterval(() => {
        if (checkoutWindow.closed) {
          clearInterval(checkTimer);
          // Prompt user confirmation if payment succeeded
          const confirmed = window.confirm(
            "Did your payment complete successfully? Click OK to confirm your enrollment/order."
          );
          if (confirmed) {
            params.onSuccess({ reference: session.reference, status: "completed", checkoutId: session.checkout_id });
          } else {
            params.onClose?.();
          }
        }
      }, 1500);
  } catch (err: any) {
    if (params.onError) {
      params.onError(err);
    } else {
      alert(`Checkout Error: ${err.message || "Failed to initialize checkout."}`);
    }
    params.onClose?.();
  }
}
