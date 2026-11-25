import { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Briefcase,
  CheckCircle2,
  Clock,
  Lock,
  MapPin,
  Pause,
  Play,
  Search,
  Send,
  Volume2,
  X,
} from "lucide-react";
import Logo from "../components/Logo";
import {
  fetchSupabaseJobRoles,
  loadJobApplications,
  loadJobRoles,
  saveJobApplications,
  submitSupabaseJobApplication,
  type JobApplication,
  type JobDepartment,
  type JobRole,
} from "../lib/jobs";
import { navigate } from "../lib/router";
import { useStore } from "../lib/store";

const DEPARTMENTS: Array<"All" | JobDepartment> = [
  "All",
  "Dev & IT",
  "Trading & Analysis",
  "Design & Creative",
  "Marketing",
  "Admin & Support",
  "Writing & Content",
];

const DEPARTMENT_THUMBNAILS: Record<JobDepartment, string> = {
  "Dev & IT":
    "https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=900&q=80",
  "Trading & Analysis":
    "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&w=900&q=80",
  "Design & Creative":
    "https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?auto=format&fit=crop&w=900&q=80",
  Marketing:
    "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=900&q=80",
  "Admin & Support":
    "https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=900&q=80",
  "Writing & Content":
    "https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&w=900&q=80",
};

function getRoleThumbnail(role: JobRole): string {
  return role.image || DEPARTMENT_THUMBNAILS[role.department];
}

const WAVEFORM_BARS = [
  24, 42, 30, 62, 84, 48, 32, 74, 92, 54, 36, 68, 82, 46, 28, 60, 88, 64, 40,
  76, 94, 52, 34, 66, 80, 48, 38, 72, 56, 36, 62, 44, 30, 50, 36, 24,
];

const SKILL_SHOWCASE: Array<{
  label: string;
  dept: JobDepartment;
  image: string;
}> = [
  {
    label: "Dev & IT",
    dept: "Dev & IT",
    image:
      "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80",
  },
  {
    label: "Trading",
    dept: "Trading & Analysis",
    image:
      "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=400&q=80",
  },
  {
    label: "Design",
    dept: "Design & Creative",
    image:
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80",
  },
  {
    label: "Marketing",
    dept: "Marketing",
    image:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80",
  },
  {
    label: "Support",
    dept: "Admin & Support",
    image:
      "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=400&q=80",
  },
  {
    label: "Writing",
    dept: "Writing & Content",
    image:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80",
  },
];
const FOUNDER_WELCOME_DURATION = 18;
const FOUNDER_WELCOME_SCRIPT =
  "Welcome onboard to GAMAT Fx. Whether you are a trader, engineer, designer, or community builder, we are excited to have you explore our open volunteer and fellowship tracks below.";

function formatAudioTime(sec: number): string {
  const s = Math.max(0, Math.floor(sec));
  const mins = Math.floor(s / 60);
  const rem = s % 60;
  return `${mins}:${rem.toString().padStart(2, "0")}`;
}

export default function JobsOpportunitiesPage() {
  const { user } = useStore();
  const [roles, setRoles] = useState<JobRole[]>(() => loadJobRoles());
  const [dept, setDept] = useState<"All" | JobDepartment>("All");
  const [query, setQuery] = useState("");
  const [selectedRole, setSelectedRole] = useState<JobRole | null>(null);

  // Founder welcome audio player state
  const [isPlayingWelcome, setIsPlayingWelcome] = useState(false);
  const [welcomeProgress, setWelcomeProgress] = useState(0); // 0..1
  const [welcomeDuration, setWelcomeDuration] = useState(FOUNDER_WELCOME_DURATION);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const timerRef = useRef<number | null>(null);
  const usingSpeechRef = useRef(false);
  const waveBarRefs = useRef<Array<HTMLButtonElement | null>>([]);

  useEffect(() => {
    if (!isPlayingWelcome) {
      WAVEFORM_BARS.forEach((h, i) => {
        const bar = waveBarRefs.current[i];
        if (bar) bar.style.height = `${h}%`;
      });
      return;
    }

    let rafId = 0;
    const start = performance.now();
    const animateWave = (now: number) => {
      const t = (now - start) / 1000;
      WAVEFORM_BARS.forEach((base, i) => {
        const bar = waveBarRefs.current[i];
        if (!bar) return;
        const wave =
          Math.sin(t * 7.5 + i * 0.45) * 26 +
          Math.cos(t * 4.8 - i * 0.28) * 18;
        const nextHeight = Math.max(16, Math.min(100, base + wave));
        bar.style.height = `${nextHeight.toFixed(1)}%`;
      });
      rafId = requestAnimationFrame(animateWave);
    };
    rafId = requestAnimationFrame(animateWave);
    return () => cancelAnimationFrame(rafId);
  }, [isPlayingWelcome]);

  const stopTimer = () => {
    if (timerRef.current !== null) {
      window.clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  useEffect(() => {
    return () => {
      stopTimer();
      audioRef.current?.pause();
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const startFallbackPlayback = (fromProgress: number) => {
    usingSpeechRef.current = true;
    const startProg = fromProgress >= 0.99 ? 0 : fromProgress;
    setWelcomeProgress(startProg);
    setIsPlayingWelcome(true);

    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      const utter = new SpeechSynthesisUtterance(FOUNDER_WELCOME_SCRIPT);
      utter.rate = 0.98;
      utter.pitch = 1.0;
      utter.onend = () => {
        stopTimer();
        setIsPlayingWelcome(false);
        setWelcomeProgress(1);
      };
      window.speechSynthesis.speak(utter);
    }

    stopTimer();
    const startedAt = Date.now() - startProg * FOUNDER_WELCOME_DURATION * 1000;
    timerRef.current = window.setInterval(() => {
      const elapsed = (Date.now() - startedAt) / 1000;
      const next = Math.min(1, elapsed / FOUNDER_WELCOME_DURATION);
      setWelcomeProgress(next);
      if (next >= 1) {
        stopTimer();
        setIsPlayingWelcome(false);
      }
    }, 80);
  };

  const toggleWelcomeAudio = async () => {
    if (isPlayingWelcome) {
      stopTimer();
      audioRef.current?.pause();
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
      setIsPlayingWelcome(false);
      return;
    }

    const audio = audioRef.current;
    if (audio && !usingSpeechRef.current) {
      try {
        if (welcomeProgress >= 0.99) {
          audio.currentTime = 0;
        }
        await audio.play();
        setIsPlayingWelcome(true);
        return;
      } catch {
        // Fallback to Web Speech API / visual waveform playback
      }
    }

    startFallbackPlayback(welcomeProgress);
  };

  const seekWelcomeAudio = (ratio: number) => {
    const clamped = Math.max(0, Math.min(1, ratio));
    setWelcomeProgress(clamped);
    const audio = audioRef.current;
    if (audio && !usingSpeechRef.current && Number.isFinite(audio.duration) && audio.duration > 0) {
      audio.currentTime = clamped * audio.duration;
    } else if (isPlayingWelcome) {
      startFallbackPlayback(clamped);
    }
  };

  // Application form state
  const [name, setName] = useState(
    user ? `${user.firstName} ${user.lastName}`.trim() : ""
  );
  const [email, setEmail] = useState(user?.email || "");
  const [phone, setPhone] = useState("");
  const [portfolioUrl, setPortfolioUrl] = useState("");
  const [experience, setExperience] = useState("");
  const [coverNote, setCoverNote] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submittedRef, setSubmittedRef] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    void fetchSupabaseJobRoles().then((remote) => {
      if (remote.length > 0) setRoles(remote);
    });
  }, []);

  const allOpenRoles = useMemo(() => roles.filter((r) => r.open), [roles]);

  const openRoles = useMemo(() => {
    const q = query.trim().toLowerCase();
    return allOpenRoles.filter((r) => {
      const matchDept = dept === "All" || r.department === dept;
      const matchQuery =
        !q ||
        r.title.toLowerCase().includes(q) ||
        r.department.toLowerCase().includes(q) ||
        r.location.toLowerCase().includes(q) ||
        r.summary.toLowerCase().includes(q);
      return matchDept && matchQuery;
    });
  }, [allOpenRoles, dept, query]);

  const goToMainRoute = (path: string) => {
    const clean = path.startsWith("/") ? path : `/${path}`;
    if (
      typeof window !== "undefined" &&
      (window.location.hostname === "localhost" ||
        window.location.hostname === "127.0.0.1")
    ) {
      navigate(clean);
    } else {
      window.location.href = `https://gamatfxacademy.com/#${clean}`;
    }
  };

  const openModal = (role: JobRole) => {
    setSelectedRole(role);
    setSubmittedRef(null);
    setErrorMsg("");
  };

  const handleApply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRole) return;
    if (!name.trim() || !email.trim() || !phone.trim()) {
      setErrorMsg(
        "Please fill in your full name, email address, and phone number."
      );
      return;
    }

    setSubmitting(true);
    setErrorMsg("");
    const refCode = `JOB-${Math.random().toString(36).slice(2, 7).toUpperCase()}`;
    const app: JobApplication = {
      id: `jobapp_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      ref: refCode,
      jobId: selectedRole.id,
      jobTitle: selectedRole.title,
      name: name.trim(),
      email: email.trim(),
      phone: phone.trim(),
      portfolioUrl: portfolioUrl.trim(),
      experience: experience.trim(),
      coverNote: coverNote.trim(),
      status: "new",
      createdAt: new Date().toISOString(),
    };

    const existing = loadJobApplications();
    saveJobApplications([app, ...existing]);
    await submitSupabaseJobApplication(app);

    setSubmitting(false);
    setSubmittedRef(refCode);
    setPhone("");
    setPortfolioUrl("");
    setExperience("");
    setCoverNote("");
  };

  return (
    <div className="min-h-screen bg-[#111215] text-white selection:bg-brand selection:text-white">
      {/* Header */}
      <header className="border-b border-white/10 bg-[#111215]">
        <div className="mx-auto flex min-h-[84px] max-w-[1440px] items-center justify-between px-4 py-4 sm:px-6">
          <button
            type="button"
            onClick={() => navigate("/jobs")}
            className="cursor-pointer"
          >
            <Logo variant="light" size="md" asDiv />
          </button>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={() => navigate("/jobs")}
              className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/[0.04] px-4 py-1.5 text-xs font-semibold text-white/90 hover:bg-white/10 transition cursor-pointer"
            >
              <ArrowLeft className="h-3.5 w-3.5" /> Back to Careers
            </button>
            {user && (
              <button
                type="button"
                onClick={() => goToMainRoute("/dashboard")}
                className="rounded-full bg-brand px-4 py-1.5 text-xs font-bold text-white hover:bg-brand-dark transition cursor-pointer"
              >
                Dashboard
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Sign-in Gate if not logged in */}
      {!user ? (
        <main className="mx-auto flex min-h-[75vh] max-w-xl flex-col items-center justify-center px-4 py-16 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-brand/40 bg-brand/15 text-brand">
            <Lock className="h-6 w-6" />
          </div>
          <h1 className="mt-6 font-sans text-3xl font-semibold tracking-tight text-white sm:text-4xl">
            Sign in to Explore Opportunities
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-white/65 sm:text-base">
            Open positions and direct role applications are reserved for
            registered GAMAT Fx members. Sign up or log in to view all live
            opportunities.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => goToMainRoute("/signup")}
              className="inline-flex items-center gap-2 rounded-full bg-brand px-7 py-3 text-sm font-bold text-white shadow-lg shadow-brand/30 hover:bg-brand-dark transition cursor-pointer"
            >
              Create Account / Login <ArrowRight className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => navigate("/jobs")}
              className="rounded-full border border-white/20 bg-white/[0.04] px-6 py-3 text-sm font-semibold text-white/90 hover:bg-white/10 transition cursor-pointer"
            >
              Back to Careers
            </button>
          </div>
        </main>
      ) : (
        <main className="mx-auto max-w-[1440px] px-4 py-14 sm:px-8">
          {/* Welcome, onboard! heading above the audio player card */}
          <section className="mb-12">
            <div className="mb-4 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h2 className="font-sans text-2xl sm:text-3xl font-semibold tracking-tight text-white">
                  Welcome, onboard!
                </h2>
                <p className="mt-1 text-sm text-white/60">
                  Listen to a quick welcome note from our founder before exploring
                  open roles.
                </p>
              </div>
              <div className="inline-flex items-center gap-1.5 text-xs font-medium text-white/50">
                <Volume2 className="h-3.5 w-3.5 text-brand" />
                <span>Founder Audio Message</span>
              </div>
            </div>

            {/* One unified card: Left = Play button on top of live waveform, Right = 6 tall slim portrait skill cards */}
            <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-r from-[#16181d] via-[#181b22] to-[#13151a] p-5 sm:p-7 shadow-2xl">
              <audio
                ref={audioRef}
                src="/audio/founder-welcome.mp3"
                preload="metadata"
                onLoadedMetadata={(e) => {
                  const dur = e.currentTarget.duration;
                  if (Number.isFinite(dur) && dur > 0) setWelcomeDuration(dur);
                }}
                onTimeUpdate={(e) => {
                  const dur = e.currentTarget.duration || welcomeDuration;
                  if (dur > 0)
                    setWelcomeProgress(e.currentTarget.currentTime / dur);
                }}
                onEnded={() => {
                  setIsPlayingWelcome(false);
                  setWelcomeProgress(1);
                }}
                onError={() => {
                  usingSpeechRef.current = true;
                }}
              />

              <div className="grid grid-cols-1 gap-7 lg:grid-cols-12 lg:items-center">
                {/* Left part: Waveform signature with Play/Pause button on top of it */}
                <div className="flex flex-col justify-center lg:col-span-5">
                  <div className="mb-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-gradient-to-br from-brand to-rose-700 text-xs font-bold text-white shadow-inner">
                        TT
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-white">
                          Tonye S. Taylor
                        </div>
                        <div className="text-[11px] text-white/55">
                          Founder · Welcome Voice Note
                        </div>
                      </div>
                    </div>
                    <div className="font-mono text-xs text-white/60">
                      {formatAudioTime(welcomeProgress * welcomeDuration)} /{" "}
                      {formatAudioTime(welcomeDuration)}
                    </div>
                  </div>

                  {/* Waveform signature with Play/Pause button overlaid on top */}
                  <div className="relative flex h-24 items-center justify-center rounded-2xl border border-white/10 bg-[#111215]/90 px-4">
                    {/* Live animated waveform signature */}
                    <div
                      className="flex h-16 w-full items-center justify-between gap-[3px]"
                      role="slider"
                      aria-label="Founder welcome message waveform"
                      aria-valuemin={0}
                      aria-valuemax={100}
                      aria-valuenow={Math.round(welcomeProgress * 100)}
                    >
                      {WAVEFORM_BARS.map((heightPct, idx) => {
                        const barRatio = (idx + 1) / WAVEFORM_BARS.length;
                        const isActive = barRatio <= welcomeProgress;
                        return (
                          <button
                            key={idx}
                            ref={(el) => {
                              waveBarRefs.current[idx] = el;
                            }}
                            type="button"
                            onClick={() =>
                              seekWelcomeAudio(idx / WAVEFORM_BARS.length)
                            }
                            aria-label={`Seek to ${Math.round(
                              (idx / WAVEFORM_BARS.length) * 100
                            )}%`}
                            style={{
                              height: `${heightPct}%`,
                            }}
                            className={`w-[3px] rounded-full transition-colors duration-150 cursor-pointer ${
                              isActive
                                ? "bg-brand"
                                : "bg-white/25 hover:bg-white/50"
                            }`}
                          />
                        );
                      })}
                    </div>

                    {/* Play/Pause button centered right on top of the waveform */}
                    <button
                      type="button"
                      onClick={toggleWelcomeAudio}
                      aria-label={
                        isPlayingWelcome
                          ? "Pause founder welcome message"
                          : "Play founder welcome message"
                      }
                      className="absolute z-10 flex h-14 w-14 items-center justify-center rounded-full border-2 border-white/30 bg-brand text-white shadow-[0_0_28px_rgba(220,53,69,0.65)] transition hover:scale-105 hover:bg-brand-dark active:scale-95 cursor-pointer"
                    >
                      {isPlayingWelcome ? (
                        <Pause className="h-6 w-6 fill-current" />
                      ) : (
                        <Play className="h-6 w-6 translate-x-[1.5px] fill-current" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Right part: 6 tall slim vertical portrait cards with red gradient lines */}
                <div className="lg:col-span-7">
                  <div className="flex h-48 sm:h-56 items-stretch gap-1.5 sm:gap-2">
                    {SKILL_SHOWCASE.map((item, idx) => {
                      const cardGradients = [
                        "from-amber-400 via-amber-500 to-amber-700",
                        "from-purple-700 via-violet-800 to-indigo-950",
                        "from-rose-500 via-pink-600 to-rose-800",
                        "from-violet-600 via-purple-800 to-indigo-950",
                        "from-amber-400 via-amber-500 to-amber-700",
                        "from-rose-500 via-brand to-rose-900",
                      ];
                      const grad = cardGradients[idx % cardGradients.length];
                      return (
                        <div
                          key={item.label}
                          className="flex flex-1 min-w-0 items-stretch gap-1.5 sm:gap-2"
                        >
                          <button
                            type="button"
                            onClick={() => setDept(item.dept)}
                            title={`Filter ${item.dept} roles`}
                            className={`group relative flex-1 min-w-0 overflow-hidden rounded-xl sm:rounded-2xl bg-gradient-to-b ${grad} shadow-lg cursor-pointer`}
                          >
                            {/* Top skill label */}
                            <div className="relative z-10 px-1.5 pt-2.5 sm:pt-3 text-left">
                              <span className="block truncate text-[9px] sm:text-[10px] font-extrabold uppercase tracking-wider text-white drop-shadow">
                                {item.label}
                              </span>
                            </div>

                            {/* Portrait image filling lower portion */}
                            <img
                              src={item.image}
                              alt={item.label}
                              loading="lazy"
                              className="absolute inset-x-0 bottom-0 h-[76%] w-full object-cover object-top transition duration-500 group-hover:scale-105"
                            />
                            <div
                              aria-hidden="true"
                              className="pointer-events-none absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-black/45 to-transparent"
                            />
                          </button>

                          {idx < SKILL_SHOWCASE.length - 1 && (
                            <div
                              aria-hidden="true"
                              className="w-[2px] shrink-0 self-stretch bg-gradient-to-b from-transparent via-brand to-rose-400/20"
                            />
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          </section>

          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4 mb-6">
            <div>
              <h1 className="font-sans text-3xl sm:text-4xl font-medium tracking-tight text-white">
                Open Positions ({openRoles.length})
              </h1>
              <p className="text-sm text-white/55 mt-1">
                Welcome back, {user.firstName}. Select a role below to submit
                your application.
              </p>
            </div>

            <div className="relative w-full lg:w-72">
              <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search roles..."
                className="w-full rounded-xl border border-white/15 bg-[#16181d] py-2.5 pl-10 pr-4 text-sm text-white placeholder:text-white/40 outline-none focus:border-brand"
              />
            </div>
          </div>

          {/* Department filter */}
          <div className="flex flex-wrap gap-1.5 mb-8">
            {DEPARTMENTS.map((d) => (
              <button
                key={d}
                type="button"
                onClick={() => setDept(d)}
                className={`rounded-full px-4 py-2 text-xs font-semibold transition cursor-pointer ${
                  dept === d
                    ? "bg-brand text-white"
                    : "border border-white/15 bg-[#16181d] text-white/70 hover:border-white/30 hover:text-white"
                }`}
              >
                {d}
              </button>
            ))}
          </div>

          {/* Role rows with left-side picture thumbnails */}
          {openRoles.length > 0 ? (
            <div className="space-y-4">
              {openRoles.map((role) => (
                <article
                  key={role.id}
                  className="group rounded-2xl border border-white/10 bg-[#16181d] p-4 sm:p-5 transition hover:border-brand/50"
                >
                  <div className="flex flex-col md:flex-row md:items-center gap-5">
                    {/* Left thumbnail picture */}
                    <div className="relative h-44 w-full shrink-0 overflow-hidden rounded-xl bg-[#0e1014] md:h-36 md:w-52 lg:h-40 lg:w-60">
                      <img
                        src={getRoleThumbnail(role)}
                        alt={role.title}
                        loading="lazy"
                        className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                      />
                      <div
                        aria-hidden="true"
                        className="absolute inset-0 bg-gradient-to-t from-black/35 via-transparent to-transparent"
                      />
                    </div>

                    {/* Center role details */}
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2 mb-2.5">
                        <span className="rounded-md bg-brand/15 px-2.5 py-0.5 text-[11px] font-bold text-rose-300">
                          {role.department}
                        </span>
                        <span className="inline-flex items-center gap-1 rounded-md border border-white/10 bg-white/[0.03] px-2.5 py-0.5 text-[11px] font-medium text-white/70">
                          <MapPin className="h-3 w-3 text-brand" />{" "}
                          {role.location}
                        </span>
                        <span className="inline-flex items-center gap-1 rounded-md border border-white/10 bg-white/[0.03] px-2.5 py-0.5 text-[11px] font-medium text-white/70">
                          <Clock className="h-3 w-3 text-brand" /> {role.type}
                        </span>
                        {role.compensation && (
                          <span className="inline-flex items-center rounded-md bg-emerald-500/15 px-2.5 py-0.5 text-[11px] font-bold text-emerald-300">
                            {role.compensation}
                          </span>
                        )}
                      </div>

                      <h3 className="font-display text-lg sm:text-xl font-bold text-white">
                        {role.title}
                      </h3>
                      <p className="mt-2 text-sm leading-relaxed text-white/65">
                        {role.summary}
                      </p>
                      {role.requirements && (
                        <p className="mt-2 text-xs leading-relaxed text-white/50">
                          <strong className="text-white/80">
                            Requirements:
                          </strong>{" "}
                          {role.requirements}
                        </p>
                      )}
                    </div>

                    {/* Right CTA */}
                    <div className="shrink-0">
                      <button
                        type="button"
                        onClick={() => openModal(role)}
                        className="inline-flex w-full md:w-auto items-center justify-center gap-2 rounded-full bg-white px-6 py-2.5 text-xs font-bold text-ink transition hover:bg-cream cursor-pointer"
                      >
                        Apply Now <ArrowRight className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-white/10 bg-[#16181d] p-10 text-center">
              <Briefcase className="mx-auto h-8 w-8 text-white/30" />
              <p className="mt-3 font-display text-base font-bold text-white">
                No matching open roles right now
              </p>
              <p className="mt-1 text-sm text-white/55">
                Try another department or clear your search filter.
              </p>
            </div>
          )}
        </main>
      )}

      {/* Application Modal */}
      {selectedRole && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-xs">
          <div className="relative max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-3xl border border-white/15 bg-[#16181d] p-6 sm:p-8 text-white shadow-2xl">
            <button
              type="button"
              onClick={() => setSelectedRole(null)}
              aria-label="Close modal"
              className="absolute right-5 top-5 rounded-full p-2 text-white/50 hover:bg-white/10 hover:text-white cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>

            {submittedRef ? (
              <div className="py-6 text-center">
                <CheckCircle2 className="mx-auto h-12 w-12 text-emerald-400" />
                <h3 className="mt-4 font-display text-xl font-bold text-white">
                  Application Received!
                </h3>
                <p className="mt-2 text-sm text-white/65 leading-relaxed">
                  Thank you for applying for{" "}
                  <strong className="text-white">{selectedRole.title}</strong>.
                  Our hiring team will review your profile and reach out via
                  email.
                </p>
                <div className="mt-4 inline-block rounded-xl border border-dashed border-brand/50 bg-brand/10 px-4 py-2">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-white/55 block">
                    Reference ID
                  </span>
                  <span className="font-display text-sm font-extrabold text-rose-300">
                    {submittedRef}
                  </span>
                </div>
                <div className="mt-6">
                  <button
                    type="button"
                    onClick={() => setSelectedRole(null)}
                    className="w-full rounded-full bg-white py-3 text-sm font-bold text-ink hover:bg-cream cursor-pointer"
                  >
                    Done
                  </button>
                </div>
              </div>
            ) : (
              <>
                <span className="inline-block rounded-md bg-brand/15 px-2.5 py-1 text-[11px] font-bold text-rose-300">
                  {selectedRole.department}
                </span>
                <h3 className="mt-2 font-display text-xl font-bold text-white pr-8">
                  Apply for {selectedRole.title}
                </h3>
                <p className="mt-1 text-xs text-white/55">
                  {selectedRole.location} · {selectedRole.type}
                </p>

                <form onSubmit={handleApply} className="mt-5 space-y-4">
                  <div>
                    <label className="mb-1 block text-xs font-semibold text-white/70">
                      Full Name *
                    </label>
                    <input
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Your full name"
                      className="w-full rounded-xl border border-white/15 bg-white/5 px-3.5 py-2.5 text-sm text-white placeholder:text-white/35 outline-none focus:border-brand"
                    />
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className="mb-1 block text-xs font-semibold text-white/70">
                        Email Address *
                      </label>
                      <input
                        required
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="you@example.com"
                        className="w-full rounded-xl border border-white/15 bg-white/5 px-3.5 py-2.5 text-sm text-white placeholder:text-white/35 outline-none focus:border-brand"
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-xs font-semibold text-white/70">
                        Phone / WhatsApp *
                      </label>
                      <input
                        required
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="+234 800 000 0000"
                        className="w-full rounded-xl border border-white/15 bg-white/5 px-3.5 py-2.5 text-sm text-white placeholder:text-white/35 outline-none focus:border-brand"
                      />
                    </div>
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className="mb-1 block text-xs font-semibold text-white/70">
                        CV / Portfolio / LinkedIn URL
                      </label>
                      <input
                        value={portfolioUrl}
                        onChange={(e) => setPortfolioUrl(e.target.value)}
                        placeholder="https://..."
                        className="w-full rounded-xl border border-white/15 bg-white/5 px-3.5 py-2.5 text-sm text-white placeholder:text-white/35 outline-none focus:border-brand"
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-xs font-semibold text-white/70">
                        Years of Experience
                      </label>
                      <input
                        value={experience}
                        onChange={(e) => setExperience(e.target.value)}
                        placeholder="e.g. 3 years"
                        className="w-full rounded-xl border border-white/15 bg-white/5 px-3.5 py-2.5 text-sm text-white placeholder:text-white/35 outline-none focus:border-brand"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-semibold text-white/70">
                      Why GAMAT Fx &amp; Relevant Experience
                    </label>
                    <textarea
                      rows={4}
                      value={coverNote}
                      onChange={(e) => setCoverNote(e.target.value)}
                      placeholder="Tell us about your background, track record, or links to work you're proud of..."
                      className="w-full rounded-xl border border-white/15 bg-white/5 px-3.5 py-2.5 text-sm text-white placeholder:text-white/35 outline-none focus:border-brand"
                    />
                  </div>

                  {errorMsg && (
                    <p className="text-xs font-semibold text-rose-400">
                      {errorMsg}
                    </p>
                  )}

                  <button
                    type="submit"
                    disabled={submitting}
                    className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-brand py-3 text-sm font-bold text-white shadow-lg shadow-brand/25 transition hover:bg-brand-dark cursor-pointer"
                  >
                    <Send className="h-4 w-4" />
                    {submitting ? "Submitting..." : "Submit Application"}
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
