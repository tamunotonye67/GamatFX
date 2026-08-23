import { useRef, useState } from "react";
import PageHero from "../components/PageHero";
import PageCta from "../components/PageCta";
import { useReveal } from "../lib/useReveal";
import { navigate } from "../lib/router";
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize2,
  BookOpenCheck,
  LineChart,
  BrainCircuit,
  ShieldCheck,
  Clock,
  Users,
  Award,
} from "lucide-react";

const MAIN_VIDEO =
  "https://videos.pexels.com/video-files/38484636/16343740_3840_2160_50fps.mp4";
const MAIN_POSTER =
  "https://images.pexels.com/videos/38484636/bitcoin-crypto-forex-hacker-38484636.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=1080&w=1920";

const clips = [
  {
    title: "Inside a live market breakdown",
    desc: "Watch how our mentors dissect a real setup from fundamentals to entry.",
    src: "https://videos.pexels.com/video-files/38581107/16386444_3840_2160_50fps.mp4",
    poster:
      "https://images.pexels.com/videos/38581107/bitcoin-crypto-forex-hacker-38581107.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=630&w=1200",
    length: "0:19",
  },
  {
    title: "Reading multi-screen market data",
    desc: "How we track correlated pairs, indices and crypto in a single workflow.",
    src: "https://videos.pexels.com/video-files/38358369/16288463_3840_2160_25fps.mp4",
    poster:
      "https://images.pexels.com/videos/38358369/bitcoin-crypto-forex-hacker-38358369.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=630&w=1200",
    length: "0:20",
  },
  {
    title: "Analysis on the go",
    desc: "Reviewing your journal and marking zones between sessions.",
    src: "https://videos.pexels.com/video-files/35606120/15089547_3840_2160_25fps.mp4",
    poster:
      "https://images.pexels.com/videos/35606120/analysis-analytics-bitcoin-business-35606120.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=630&w=1200",
    length: "0:17",
  },
];

const steps = [
  { icon: BookOpenCheck, step: "01", title: "Enroll & get instant access", body: "Pick a program and unlock your full course library, workbooks and the private community immediately." },
  { icon: LineChart, step: "02", title: "Learn, then apply live", body: "Work through structured modules at your pace, then join weekly live sessions where we trade the theory in real markets." },
  { icon: BrainCircuit, step: "03", title: "Journal & get reviewed", body: "Log every trade in our template and submit it for mentor feedback. This is where real progress happens." },
  { icon: ShieldCheck, step: "04", title: "Scale with accountability", body: "Graduate to live capital or a funded challenge with a rules-based plan and ongoing mentor support." },
];

/* ------------------------- Custom video player ------------------------- */

function VideoPlayer() {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(true);
  const [progress, setProgress] = useState(0);

  const toggle = () => {
    const v = videoRef.current;
    if (!v) return;
    if (v.paused) {
      void v.play();
      setPlaying(true);
    } else {
      v.pause();
      setPlaying(false);
    }
  };

  const toggleMute = () => {
    const v = videoRef.current;
    if (!v) return;
    v.muted = !v.muted;
    setMuted(v.muted);
  };

  const goFullscreen = () => {
    void videoRef.current?.requestFullscreen?.();
  };

  return (
    <div className="group relative overflow-hidden rounded-3xl bg-ink shadow-2xl ring-1 ring-white/10">
      <video
        ref={videoRef}
        poster={MAIN_POSTER}
        muted={muted}
        loop
        playsInline
        preload="metadata"
        disablePictureInPicture
        disableRemotePlayback
        controlsList="nodownload noplaybackrate noremoteplayback"
        onContextMenu={(e) => e.preventDefault()}
        onDragStart={(e) => e.preventDefault()}
        onClick={toggle}
        onTimeUpdate={(e) => {
          const v = e.currentTarget;
          setProgress(v.duration ? (v.currentTime / v.duration) * 100 : 0);
        }}
        className="aspect-video w-full cursor-pointer object-cover"
      >
        <source src={MAIN_VIDEO} type="video/mp4" />
        Your browser does not support the video tag.
      </video>

      {/* Big centre play button */}
      {!playing && (
        <button
          type="button"
          onClick={toggle}
          aria-label="Play video"
          className="absolute inset-0 flex items-center justify-center bg-ink/45 transition hover:bg-ink/30"
        >
          <span className="relative flex h-24 w-24 items-center justify-center rounded-full bg-brand text-white shadow-2xl transition hover:scale-105">
            <span className="absolute inset-0 animate-ping rounded-full bg-brand/40" />
            <Play className="relative ml-1 h-10 w-10 fill-white" />
          </span>
        </button>
      )}

      {/* Control bar */}
      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-ink to-transparent p-5 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
        <div className="h-1 w-full overflow-hidden rounded-full bg-white/20">
          <div className="h-full rounded-full bg-brand transition-[width]" style={{ width: `${progress}%` }} />
        </div>
        <div className="mt-3 flex items-center gap-4 text-white">
          <button type="button" onClick={toggle} aria-label={playing ? "Pause" : "Play"} className="transition hover:text-brand">
            {playing ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
          </button>
          <button type="button" onClick={toggleMute} aria-label={muted ? "Unmute" : "Mute"} className="transition hover:text-brand">
            {muted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
          </button>
          <span className="text-xs font-medium text-white/70">
            GAMAT Fx Academy — How It Works
          </span>
          <button type="button" onClick={goFullscreen} aria-label="Fullscreen" className="ml-auto transition hover:text-brand">
            <Maximize2 className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
}

/* ----------------------------- Clip cards ----------------------------- */

function ClipCard({ clip, delay }: { clip: (typeof clips)[number]; delay: number }) {
  const ref = useRef<HTMLVideoElement | null>(null);
  const [playing, setPlaying] = useState(false);

  const toggle = () => {
    const v = ref.current;
    if (!v) return;
    if (v.paused) { void v.play(); setPlaying(true); }
    else { v.pause(); setPlaying(false); }
  };

  return (
    <div
      className="overflow-hidden rounded-3xl border border-line bg-white shadow-[0_18px_50px_-30px_rgba(22,24,28,0.35)] transition-all duration-300 hover:-translate-y-1.5"
      style={{ transitionDelay: `${delay}ms` }}
    >
      <div className="relative">
        <video
          ref={ref}
          poster={clip.poster}
          muted
          loop
          playsInline
          preload="none"
          disablePictureInPicture
          disableRemotePlayback
          controlsList="nodownload noplaybackrate noremoteplayback"
          onContextMenu={(e) => e.preventDefault()}
          onDragStart={(e) => e.preventDefault()}
          onClick={toggle}
          className="aspect-video w-full cursor-pointer object-cover"
        >
          <source src={clip.src} type="video/mp4" />
        </video>
        {!playing && (
          <button
            type="button"
            onClick={toggle}
            aria-label={`Play ${clip.title}`}
            className="absolute inset-0 flex items-center justify-center bg-ink/40 transition hover:bg-ink/25"
          >
            <span className="flex h-14 w-14 items-center justify-center rounded-full bg-brand text-white shadow-lg">
              <Play className="ml-0.5 h-6 w-6 fill-white" />
            </span>
          </button>
        )}
        <span className="absolute bottom-3 right-3 rounded-md bg-ink/85 px-2 py-1 text-xs font-semibold text-white">
          {clip.length}
        </span>
      </div>
      <div className="p-6">
        <h3 className="font-display text-base font-bold text-ink">{clip.title}</h3>
        <p className="mt-2 text-sm leading-relaxed text-muted">{clip.desc}</p>
      </div>
    </div>
  );
}

/* -------------------------------- Page -------------------------------- */

export default function HowItWorksPage() {
  const { ref, visible } = useReveal<HTMLDivElement>();

  return (
    <>
      <PageHero
        crumb="How It Works"
        eyebrow="Watch how it works"
        image="/images/about-hero.jpg"
        title={<>See exactly how we turn beginners into <span className="text-brand">confident traders</span></>}
        subtitle="Press play for a walkthrough of the GAMAT method — how our courses, live sessions, journaling and mentorship fit together into one accountable system."
      />

      {/* Main video */}
      <section className="section bg-cream">
        <div className="container-x">
          <div className="mx-auto max-w-4xl">
            <VideoPlayer />

            <div className="mt-8 grid gap-6 sm:grid-cols-3">
              {[
                { icon: Clock, v: "6 min", l: "Watch time" },
                { icon: Users, v: "4,000+", l: "Traders trained this way" },
                { icon: Award, v: "4.9/5", l: "Student rating" },
              ].map((s) => (
                <div key={s.l} className="rounded-2xl border border-line bg-white p-5 text-center">
                  <s.icon className="mx-auto h-5 w-5 text-brand" />
                  <div className="mt-2 font-display text-xl font-extrabold text-ink">{s.v}</div>
                  <p className="text-xs text-muted">{s.l}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* The 4 steps */}
      <section className="section bg-white">
        <div ref={ref} className="container-x">
          <div className="mx-auto max-w-2xl text-center">
            <span className="eyebrow justify-center">The system</span>
            <h2 className="section-title mt-4">What happens after you join</h2>
            <p className="mt-4 text-muted">
              Four stages that take you from your first lesson to accountable, live execution.
            </p>
          </div>
          <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {steps.map((s, i) => (
              <div key={s.step} className={`card reveal ${visible ? "is-visible" : ""} relative`} style={{ transitionDelay: `${i * 110}ms` }}>
                <span className="absolute right-6 top-6 font-display text-4xl font-extrabold text-brand/10">{s.step}</span>
                <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-light text-brand">
                  <s.icon className="h-6 w-6" />
                </span>
                <h3 className="mt-5 font-display text-lg font-bold text-ink">{s.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted">{s.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* More clips */}
      <section className="section bg-cream">
        <div className="container-x">
          <div className="mx-auto max-w-2xl text-center">
            <span className="eyebrow justify-center">More footage</span>
            <h2 className="section-title mt-4">A closer look inside the academy</h2>
            <p className="mt-4 text-muted">Short clips from our sessions, workflow and daily analysis.</p>
          </div>
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {clips.map((c, i) => (
              <ClipCard key={c.title} clip={c} delay={i * 110} />
            ))}
          </div>
        </div>
      </section>

      {/* Split CTA */}
      <section className="section bg-ink text-white">
        <div className="container-x mx-auto max-w-3xl text-center">
          <h2 className="font-display text-3xl font-extrabold md:text-4xl">
            Seen enough? Let's get you started.
          </h2>
          <p className="mt-4 text-white/70">
            Pick a course, or come and meet us live at the next mentorship intake.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <button type="button" onClick={() => navigate("/courses")} className="btn-primary">
              Browse Courses
            </button>
            <button type="button" onClick={() => navigate("/events")} className="btn-ghost">
              See Upcoming Events
            </button>
          </div>
        </div>
      </section>

      <PageCta
        tone="light"
        title="Still have questions?"
        body="Our FAQ covers everything from capital requirements to how long it takes to become profitable."
        primaryLabel="Read the FAQ"
        primaryTo="/faq"
      />
    </>
  );
}
