/**
 * Cloudflare Worker: Edge Caching Proxy for Supabase Public Storage
 *
 * Caches public Supabase Storage objects (/storage/v1/object/public/*)
 * at Cloudflare's edge so repeat views/downloads do NOT hit Supabase Storage egress.
 *
 * Environment variable to set in Cloudflare Worker Settings -> Variables:
 *   SUPABASE_ORIGIN = https://<your-project-ref>.supabase.co
 */
export default {
  async fetch(request, env, ctx) {
    if (request.method === "OPTIONS") {
      return new Response(null, {
        status: 204,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET, HEAD, OPTIONS",
          "Access-Control-Allow-Headers": "*",
          "Access-Control-Max-Age": "86400",
        },
      });
    }

    if (request.method !== "GET" && request.method !== "HEAD") {
      return new Response("Method Not Allowed", { status: 405 });
    }

    const url = new URL(request.url);
    if (!url.pathname.startsWith("/storage/v1/object/public/")) {
      return new Response("Not Found", { status: 404 });
    }

    const origin = (env.SUPABASE_ORIGIN || "").replace(/\/+$/, "");
    if (!origin) {
      return new Response("Missing SUPABASE_ORIGIN worker variable", { status: 500 });
    }

    const cache = caches.default;
    const cacheKey = new Request(url.toString(), { method: "GET" });
    let response = await cache.match(cacheKey);

    if (!response) {
      const upstreamUrl = `${origin}${url.pathname}${url.search}`;
      const upstream = await fetch(upstreamUrl, {
        cf: {
          cacheEverything: true,
          cacheTtl: 2592000, // 30 days at Cloudflare edge
        },
      });

      if (!upstream.ok) {
        return upstream;
      }

      const headers = new Headers(upstream.headers);
      headers.set("Cache-Control", "public, max-age=31536000, immutable");
      headers.set("Access-Control-Allow-Origin", "*");
      headers.set("X-Media-Cache", "MISS-ORIGIN");

      response = new Response(upstream.body, {
        status: upstream.status,
        statusText: upstream.statusText,
        headers,
      });

      ctx.waitUntil(cache.put(cacheKey, response.clone()));
    } else {
      const headers = new Headers(response.headers);
      headers.set("X-Media-Cache", "HIT-EDGE");
      response = new Response(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers,
      });
    }

    return response;
  },
};
