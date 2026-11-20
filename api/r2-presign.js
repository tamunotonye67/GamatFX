import crypto from "node:crypto";

/**
 * Generates an AWS SigV4 presigned PUT URL for Cloudflare R2 (zero-egress storage).
 * Returns { ok: false, configured: false } cleanly if R2 env vars are not set yet.
 */
function hmac(key, data) {
  return crypto.createHmac("sha256", key).update(data).digest();
}

function sha256Hex(data) {
  return crypto.createHash("sha256").update(data).digest("hex");
}

function encodeRfc3986(str) {
  return encodeURIComponent(str).replace(/[!'()*]/g, (c) => "%" + c.charCodeAt(0).toString(16).toUpperCase());
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ ok: false, message: "Method not allowed" });
  }

  const accountId = (process.env.R2_ACCOUNT_ID || "").trim();
  const accessKeyId = (process.env.R2_ACCESS_KEY_ID || "").trim();
  const secretAccessKey = (process.env.R2_SECRET_ACCESS_KEY || "").trim();
  const bucket = (process.env.R2_BUCKET || "").trim();
  const publicBase = (process.env.R2_PUBLIC_URL || "").trim().replace(/\/+$/, "");

  if (!accountId || !accessKeyId || !secretAccessKey || !bucket || !publicBase) {
    return res.status(200).json({
      ok: false,
      configured: false,
      message: "Cloudflare R2 is not configured yet.",
    });
  }

  try {
    const body = typeof req.body === "string" ? JSON.parse(req.body || "{}") : req.body || {};
    const rawKey = String(body.key || "").replace(/^\/+/, "");
    const contentType = String(body.contentType || "application/octet-stream");

    if (!rawKey || rawKey.includes("..")) {
      return res.status(400).json({ ok: false, message: "Invalid object key" });
    }

    const host = `${accountId}.r2.cloudflarestorage.com`;
    const region = "auto";
    const service = "s3";
    const expires = 300; // 5 minutes

    const now = new Date();
    const amzDate = now.toISOString().replace(/[:-]|\.\d{3}/g, "");
    const dateStamp = amzDate.slice(0, 8);
    const credentialScope = `${dateStamp}/${region}/${service}/aws4_request`;

    const encodedKey = rawKey.split("/").map(encodeRfc3986).join("/");
    const canonicalUri = `/${encodeRfc3986(bucket)}/${encodedKey}`;

    const queryParams = {
      "X-Amz-Algorithm": "AWS4-HMAC-SHA256",
      "X-Amz-Credential": `${accessKeyId}/${credentialScope}`,
      "X-Amz-Date": amzDate,
      "X-Amz-Expires": String(expires),
      "X-Amz-SignedHeaders": "host",
    };

    const canonicalQueryString = Object.keys(queryParams)
      .sort()
      .map((k) => `${encodeRfc3986(k)}=${encodeRfc3986(queryParams[k])}`)
      .join("&");

    const canonicalHeaders = `host:${host}\n`;
    const canonicalRequest = [
      "PUT",
      canonicalUri,
      canonicalQueryString,
      canonicalHeaders,
      "host",
      "UNSIGNED-PAYLOAD",
    ].join("\n");

    const stringToSign = [
      "AWS4-HMAC-SHA256",
      amzDate,
      credentialScope,
      sha256Hex(canonicalRequest),
    ].join("\n");

    const kDate = hmac(`AWS4${secretAccessKey}`, dateStamp);
    const kRegion = hmac(kDate, region);
    const kService = hmac(kRegion, service);
    const kSigning = hmac(kService, "aws4_request");
    const signature = crypto.createHmac("sha256", kSigning).update(stringToSign).digest("hex");

    const uploadUrl = `https://${host}${canonicalUri}?${canonicalQueryString}&X-Amz-Signature=${signature}`;
    const publicUrl = `${publicBase}/${encodedKey}`;

    return res.status(200).json({
      ok: true,
      configured: true,
      uploadUrl,
      publicUrl,
      contentType,
    });
  } catch (err) {
    return res.status(500).json({
      ok: false,
      message: err?.message || "Failed to generate R2 presigned URL",
    });
  }
}
