# Cloudflare Setup Guide for GAMAT Fx Academy

This repository is pre-wired for all three Cloudflare optimizations. They are **opt-in via environment variables** so nothing breaks before you configure Cloudflare.

---

## 1. Cloudflare Worker Caching Proxy (Caches Existing Supabase Storage URLs)

1. Go to **Cloudflare Dashboard → Workers & Pages → Create → Create Worker**.
2. Paste the contents of `cloudflare/supabase-media-worker.js` and deploy.
3. In the Worker's **Settings → Variables & Secrets**, add:
   - `SUPABASE_ORIGIN` = `https://<your-project-ref>.supabase.co`
4. Under **Settings → Triggers → Custom Domains**, attach `media.gamatfxacademy.com`.
5. In **Vercel → Project Settings → Environment Variables**, add:
   - `VITE_CLOUDFLARE_MEDIA_URL` = `https://media.gamatfxacademy.com`
6. Redeploy on Vercel. All existing and new `*.supabase.co/storage/v1/object/public/*` URLs will automatically route through Cloudflare's edge cache.

---

## 2. Cloudflare R2 ($0 Egress for New Uploads)

1. Go to **Cloudflare Dashboard → R2 Object Storage → Create bucket** (e.g. `gamatfx-media`).
2. Under the bucket's **Settings → Public Access → Custom Domains**, connect `cdn.gamatfxacademy.com`.
3. Under **Settings → CORS Policy**, add:
   ```json
   [
     {
       "AllowedOrigins": ["https://gamatfxacademy.com", "https://*.vercel.app", "http://localhost:5173"],
       "AllowedMethods": ["GET", "PUT", "HEAD"],
       "AllowedHeaders": ["*"],
       "MaxAgeSeconds": 3600
     }
   ]
   ```
4. In **R2 → Manage R2 API Tokens**, create an **Object Read & Write** token for your bucket.
5. Add these Environment Variables in **Vercel**:
   - `R2_ACCOUNT_ID` = your Cloudflare Account ID
   - `R2_ACCESS_KEY_ID` = R2 Access Key ID
   - `R2_SECRET_ACCESS_KEY` = R2 Secret Access Key
   - `R2_BUCKET` = `gamatfx-media`
   - `R2_PUBLIC_URL` = `https://cdn.gamatfxacademy.com`
6. Redeploy on Vercel. All new uploads (avatars, course videos/assets, store files, company assets) will automatically upload to R2 via `/api/r2-presign` with **$0 egress fees**.

---

## 3. Cloudflare DNS + Bot Protection in front of `gamatfxacademy.com`

1. Add `gamatfxacademy.com` to Cloudflare and update your registrar's nameservers to Cloudflare's.
2. In **DNS**, keep your Vercel `A` / `CNAME` records **Proxied (Orange Cloud)**.
3. In **SSL/TLS → Overview**, set encryption mode to **Full (strict)** (prevents redirect loops with Vercel).
4. In **Security → Bots**, enable **Bot Fight Mode** to stop scrapers from loading the app and triggering unnecessary Supabase queries.
