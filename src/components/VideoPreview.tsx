import { useRef, useState } from "react";
import { Play, ArrowUpRight, Clock } from "lucide-react";
import { useReveal } from "../lib/useReveal";
import { navigate } from "../lib/router";

const PREVIEW_SRC =
  "https://videos.pexels.com/video-files/38484636/16343740_3840_2160_50fps.mp4";
const PREVIEW_POSTER =
  "https://images.pexels.com/videos/38484636/bitcoin-crypto-forex-hacker-38484636.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=1080&w=1920";

/** Home-page teaser that autoplays muted and links to the full How It Works page. */
export default function VideoPreview() {
  const { ref, visible } = useReveal<HTMLDivElement>();
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [hovered, setHovered] = useState(false);

  const onEnter = () => {
    setHovered(true);
    void videoRef.current?.play();
  };
  const onLeave = () => {
    setHovered(false);
    videoRef.current?.pause();
  };

  return (
    <section id="how-it-works" className="section bg-ink text-white">
      <div ref={ref} className="container-x grid items-center gap-12 lg:grid-cols-2">
        {/* Copy */}
        <div className={`reveal ${visible ? "is-visible" : ""}`}>
          <span className="eyebrow text-brand-light">See it in action</span>
          <h2 className="mt-4 font-display text-3xl font-extrabold leading-tight md:text-4xl">
            Watch how it <span className="text-brand">actually works</span>
          </h2>
          <p className="mt-5 max-w-lg text-white/70">
            A short walkthrough of the GAMAT method — how our courses, weekly live
            sessions, trade journaling and mentor reviews combine into one accountable
            system that builds real traders.
          </p>

          <ul className="mt-7 space-y-3">
            {[
              "Enroll and get instant course access",
              "Apply what you learn in weekly live markets",
              "Journal every trade and get mentor feedback",
              "Scale up with a rules-based plan",
            ].map((s, i) => (
              <li key={s} className="flex items-start gap-3 text-sm text-white/75">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand text-xs font-bold">
                  {i + 1}
                </span>
                {s}
              </li>
            ))}
          </ul>

          <button
            type="button"
            onClick={() => navigate("/how-it-works")}
            className="btn-primary mt-9"
          >
            Watch the Full Video <ArrowUpRight className="h-4 w-4" />
          </button>
        </div>

        {/* Video card */}
        <div
          onMouseEnter={onEnter}
          onMouseLeave={onLeave}
          onClick={() => navigate("/how-it-works")}
          className="group relative cursor-pointer overflow-hidden rounded-3xl shadow-2xl ring-1 ring-white/10 transition-transform duration-300 hover:-translate-y-1.5"
        >
          <video
            ref={videoRef}
            poster={PREVIEW_POSTER}
            muted
            loop
            playsInline
            preload="none"
            disablePictureInPicture
            disableRemotePlayback
            controlsList="nodownload noplaybackrate noremoteplayback"
            onContextMenu={(e) => e.preventDefault()}
            onDragStart={(e) => e.preventDefault()}
            className="aspect-video w-full object-cover"
          >
            <source src={PREVIEW_SRC} type="video/mp4" />
          </video>

          <div
            className={`absolute inset-0 transition-colors duration-300 ${
              hovered ? "bg-ink/25" : "bg-ink/50"
            }`}
          />

          {/* Play button */}
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="relative flex h-20 w-20 items-center justify-center rounded-full bg-brand text-white shadow-2xl transition-transform duration-300 group-hover:scale-110">
              <span className="absolute inset-0 animate-ping rounded-full bg-brand/40" />
              <Play className="relative ml-1 h-8 w-8 fill-white" />
            </span>
          </div>

          {/* Caption bar */}
          <div className="absolute inset-x-0 bottom-0 flex items-center justify-between gap-4 bg-gradient-to-t from-ink to-transparent p-6">
            <div>
              <p className="font-display text-base font-bold">How GAMAT Fx Academy works</p>
              <p className="mt-0.5 text-xs text-white/60">Full walkthrough · click to watch</p>
            </div>
            <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-white/15 px-3 py-1.5 text-xs font-semibold backdrop-blur-sm">
              <Clock className="h-3.5 w-3.5" /> 6 min
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
