import React, { useState, useEffect } from "react";

export const DEFAULT_FALLBACK_IMAGES = {
  course: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&w=1200&q=80",
  product: "https://images.unsplash.com/photo-1642543492481-44e81e3914a7?auto=format&fit=crop&w=1000&q=80",
  avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80",
  news: "https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?auto=format&fit=crop&w=1200&q=80",
  event: "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=1200&q=80",
  ebook: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=1000&q=80",
  bot: "https://images.unsplash.com/photo-1642790106117-e829e14a795f?auto=format&fit=crop&w=1000&q=80",
  indicator: "https://images.unsplash.com/photo-1642543492481-44e81e3914a7?auto=format&fit=crop&w=1000&q=80",
};

/**
 * Normalizes any user-pasted or stored image URL so it renders properly in an <img> tag.
 * Automatically fixes:
 * - Google Drive share links (converts /file/d/ID/view to direct image embed)
 * - Dropbox share links (converts ?dl=0 to direct download or ?raw=1)
 * - Imgur page URLs (converts to direct .jpg)
 * - URLs missing protocol (prepends https://)
 * - Empty/whitespace URLs (replaces with fallback)
 */
export function normalizeImageUrl(url?: string | null, fallback?: string): string {
  if (!url || typeof url !== "string") {
    return fallback || "";
  }
  let clean = url.trim();
  if (!clean) {
    return fallback || "";
  }

  // Preserve local assets and data URLs
  if (clean.startsWith("data:") || clean.startsWith("/") || clean.startsWith("./")) {
    return clean;
  }

  // Fix protocol if missing
  if (clean.startsWith("//")) {
    clean = "https:" + clean;
  } else if (!clean.startsWith("http://") && !clean.startsWith("https://")) {
    clean = "https://" + clean;
  }

  // 1. Google Drive share link conversion
  // e.g. https://drive.google.com/file/d/1A2B3C4D5E/view?usp=sharing
  // or https://drive.google.com/open?id=1A2B3C4D5E
  // or https://drive.google.com/uc?id=1A2B3C4D5E
  const gDriveFileMatch = clean.match(/drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)/);
  if (gDriveFileMatch && gDriveFileMatch[1]) {
    return `https://lh3.googleusercontent.com/d/${gDriveFileMatch[1]}`;
  }
  const gDriveIdMatch = clean.match(/drive\.google\.com\/(?:open|uc)\?.*id=([a-zA-Z0-9_-]+)/);
  if (gDriveIdMatch && gDriveIdMatch[1]) {
    return `https://lh3.googleusercontent.com/d/${gDriveIdMatch[1]}`;
  }

  // 2. Dropbox share link conversion (dl=0 -> dl.dropboxusercontent.com or ?raw=1)
  if (clean.includes("dropbox.com")) {
    clean = clean.replace("www.dropbox.com", "dl.dropboxusercontent.com").replace("?dl=0", "").replace("&dl=0", "");
    if (!clean.includes("dl.dropboxusercontent.com") && !clean.includes("raw=1")) {
      clean += (clean.includes("?") ? "&" : "?") + "raw=1";
    }
    return clean;
  }

  // 3. Imgur page URL conversion (imgur.com/ID -> i.imgur.com/ID.jpg)
  const imgurMatch = clean.match(/^https?:\/\/(?:www\.)?imgur\.com\/([a-zA-Z0-9]+)$/);
  if (imgurMatch && imgurMatch[1]) {
    return `https://i.imgur.com/${imgurMatch[1]}.jpg`;
  }

  return clean;
}

/**
 * Image onError handler to cleanly replace a broken image with a fallback placeholder.
 */
export function handleImageError(fallbackUrl: string = DEFAULT_FALLBACK_IMAGES.product) {
  return (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    const target = e.currentTarget;
    if (target.src !== fallbackUrl) {
      target.onerror = null; // Prevent recursion
      target.src = fallbackUrl;
    }
  };
}

export interface SafeImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  fallback?: string;
}

/**
 * Drop-in replacement for <img> that automatically normalizes URLs (Google Drive, Dropbox, etc.)
 * and falls back gracefully to a clean placeholder on any loading error.
 */
export function SafeImage({ src, alt, fallback = DEFAULT_FALLBACK_IMAGES.product, className, ...props }: SafeImageProps) {
  const [currentSrc, setCurrentSrc] = useState<string>(() => normalizeImageUrl(src, fallback) || fallback);

  useEffect(() => {
    setCurrentSrc(normalizeImageUrl(src, fallback) || fallback);
  }, [src, fallback]);

  return (
    <img
      src={currentSrc}
      alt={alt || ""}
      className={className}
      onError={() => {
        if (currentSrc !== fallback) {
          setCurrentSrc(fallback);
        }
      }}
      {...props}
    />
  );
}
