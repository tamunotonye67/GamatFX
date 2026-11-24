import { useEffect, useState } from "react";
import { PlayCircle, Video, Clock } from "lucide-react";
import {
  fetchGuideVideos,
  getGuideVideosLocal,
  type GuideAudience,
  type GuideVideo,
} from "../lib/guideVideos";
import { getVideoEmbedUrl } from "../lib/videoUrl";

export default function GuideVideoGrid({
  audience,
  emptyHint,
}: {
  audience: GuideAudience;
  emptyHint?: string;
}) {
  const [videos, setVideos] = useState<GuideVideo[]>(() =>
    getGuideVideosLocal().filter((v) => v.audience === audience)
  );

  useEffect(() => {
    let mounted = true;
    fetchGuideVideos().then((all) => {
      if (mounted) {
        setVideos(all.filter((v) => v.audience === audience));
      }
    });
    return () => {
      mounted = false;
    };
  }, [audience]);

  if (videos.length === 0) return null;

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {videos.map((v) => {
        const hasUrl = Boolean(v.videoUrl && v.videoUrl.trim());
        const embedUrl = hasUrl ? getVideoEmbedUrl(v.videoUrl) : null;

        return (
          <div
            key={v.id}
            className="overflow-hidden rounded-2xl border border-line bg-white shadow-xs flex flex-col"
          >
            <div className="relative aspect-video w-full bg-ink">
              {hasUrl ? (
                embedUrl ? (
                  <iframe
                    src={embedUrl}
                    title={v.title}
                    className="h-full w-full border-0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                ) : (
                  <video
                    src={v.videoUrl}
                    controls
                    playsInline
                    preload="metadata"
                    className="h-full w-full object-cover"
                  />
                )
              ) : (
                <div className="flex h-full w-full flex-col items-center justify-center bg-gradient-to-br from-ink via-ink/95 to-brand-dark/50 px-5 text-center text-white">
                  <span className="flex h-12 w-12 items-center justify-center rounded-full bg-brand/20 text-brand-light ring-1 ring-brand/40">
                    <PlayCircle className="h-6 w-6" />
                  </span>
                  <p className="mt-3 text-xs font-bold uppercase tracking-wider text-white/80">
                    Walkthrough Video Slot
                  </p>
                  <p className="mt-1 text-[11px] text-white/55 max-w-xs">
                    {emptyHint || "Video tutorial will appear here once uploaded by an admin."}
                  </p>
                </div>
              )}
            </div>

            <div className="p-4 flex-1 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between gap-2">
                  <span className="inline-flex items-center gap-1 rounded-full bg-cream px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider text-brand">
                    <Video className="h-3 w-3" />{" "}
                    {audience === "staff"
                      ? "Staff Video"
                      : audience === "whiteboard"
                      ? "Whiteboard Video"
                      : "Student Video"}
                  </span>
                  {v.duration && (
                    <span className="inline-flex items-center gap-1 text-[11px] font-medium text-muted">
                      <Clock className="h-3 w-3" /> {v.duration}
                    </span>
                  )}
                </div>
                <h4 className="mt-2 font-display text-sm font-bold text-ink">{v.title}</h4>
                {v.description && (
                  <p className="mt-1 text-xs leading-relaxed text-muted">{v.description}</p>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
