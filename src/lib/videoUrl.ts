/** Detects embeddable video URLs (Cloudflare Stream, YouTube, Vimeo) and returns an iframe-ready URL, or null for direct media files (.mp4, .webm, R2, etc.). */
export function getVideoEmbedUrl(raw?: string): string | null {
  if (!raw) return null;
  const url = raw.trim();
  if (!url || url.startsWith("data:") || url.startsWith("blob:")) return null;

  try {
    const parsed = new URL(url);
    const host = parsed.hostname.toLowerCase();
    const path = parsed.pathname;

    // Cloudflare Stream:
    // - https://customer-<code >.cloudflarestream.com/<videoId>/iframe
    // - https://customer-<code >.cloudflarestream.com/<videoId>/watch
    // - https://watch.cloudflarestream.com/<videoId>
    // - https://iframe.videodelivery.net/<videoId>
    if (host.endsWith("cloudflarestream.com") || host.endsWith("videodelivery.net")) {
      if (path.endsWith(".mp4") || path.endsWith(".m3u8")) return null;
      if (host.startsWith("watch.")) {
        const id = path.replace(/^\/+|\/+$/g, "");
        return id ? `https://iframe.videodelivery.net/${id}` : url;
      }
      if (path.endsWith("/watch")) {
        return url.replace(/\/watch(\?.*)?$/, "/iframe$1");
      }
      if (path.endsWith("/iframe") || host.startsWith("iframe.")) {
        return url;
      }
      // Bare https://customer-xxx.cloudflarestream.com/<id>
      const id = path.replace(/^\/+|\/+$/g, "").split("/")[0];
      if (id && !id.includes(".")) {
        return `${parsed.origin}/${id}/iframe`;
      }
    }

    // YouTube
    if (host.includes("youtube.com")) {
      const v = parsed.searchParams.get("v");
      if (v) return `https://www.youtube.com/embed/${v}`;
      if (path.startsWith("/embed/")) return url;
    }
    if (host === "youtu.be") {
      const id = path.replace(/^\/+/, "").split("/")[0];
      if (id) return `https://www.youtube.com/embed/${id}`;
    }

    // Vimeo
    if (host.includes("vimeo.com") && !host.includes("player.vimeo.com")) {
      const id = path.replace(/^\/+/, "").split("/")[0];
      if (id && /^\d+$/.test(id)) return `https://player.vimeo.com/video/${id}`;
    }
    if (host.includes("player.vimeo.com")) {
      return url;
    }

    if (path.endsWith("/iframe") || path.endsWith("/embed")) {
      return url;
    }
  } catch {
    return null;
  }

  return null;
}
