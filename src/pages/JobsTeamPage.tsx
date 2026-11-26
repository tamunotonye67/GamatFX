import { ArrowLeft, ArrowUpRight } from "lucide-react";
import Logo from "../components/Logo";
import { navigate } from "../lib/router";
import { useStore } from "../lib/store";

export default function JobsTeamPage() {
  const { publishedTeam, user } = useStore();

  const goToMainRoute = (path: string) => {
    const clean = path.startsWith("/") ? path : `/${path}`;
    if (
      typeof window !== "undefined" &&
      (window.location.hostname === "localhost" ||
        window.location.hostname === "127.0.0.1")
    ) {
      navigate(clean);
    } else {
      window.location.href = `https://gamatfxacademy.com${clean}`;
    }
  };

  return (
    <div className="min-h-screen bg-[#111215] text-white selection:bg-brand selection:text-white">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-white/10 bg-[#111215]/95 backdrop-blur-md">
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
              aria-label="Back to Careers"
              title="Back to Careers"
              className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/20 bg-white/[0.04] text-xs font-semibold text-white/90 hover:bg-white/10 transition cursor-pointer sm:h-auto sm:w-auto sm:gap-1.5 sm:px-4 sm:py-1.5"
            >
              <ArrowLeft className="h-4 w-4 sm:h-3.5 sm:w-3.5" />
              <span className="hidden sm:inline">Back to Careers</span>
            </button>
            <button
              type="button"
              onClick={() => goToMainRoute(user ? "/dashboard" : "/signup")}
              className="rounded-full bg-brand px-4 py-1.5 text-xs font-bold text-white hover:bg-brand-dark transition cursor-pointer"
            >
              {user ? "Dashboard" : "Login"}
            </button>
          </div>
        </div>
      </header>

      {/* Team Showcase */}
      <main className="relative overflow-hidden">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 top-0 h-[420px] bg-[radial-gradient(ellipse_at_top_left,_rgba(220,53,69,0.16),_transparent_55%),radial-gradient(ellipse_at_top_right,_rgba(56,189,248,0.08),_transparent_50%)]"
        />

        <div className="relative mx-auto max-w-[1440px] px-4 py-14 sm:px-8 sm:py-20">
          <div className="max-w-2xl">
            <h1 className="font-sans text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-6xl">
              Meet the{" "}
              <span className="bg-gradient-to-r from-white via-rose-200 to-rose-400 bg-clip-text text-transparent">
                Team
              </span>
            </h1>
            <p className="mt-4 text-sm leading-relaxed text-white/65 sm:text-base">
              The traders, mentors, educators, and builders driving GAMAT Fx
              Academy forward. Select any profile to explore their full
              portfolio and milestones.
            </p>
          </div>

          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {publishedTeam.map((member, idx) => {
              const cardTones = [
                {
                  card: "border-rose-500/20 bg-gradient-to-br from-[#23141a] via-[#17141a] to-[#121318] hover:border-rose-400/50",
                  glow: "from-rose-500/15",
                  avatar: "from-rose-500/30 to-brand/10 border-rose-400/40 text-rose-200",
                },
                {
                  card: "border-sky-500/20 bg-gradient-to-br from-[#131d2b] via-[#141720] to-[#111318] hover:border-sky-400/50",
                  glow: "from-sky-500/15",
                  avatar: "from-sky-500/30 to-indigo-500/10 border-sky-400/40 text-sky-200",
                },
                {
                  card: "border-violet-500/20 bg-gradient-to-br from-[#1f152b] via-[#17141f] to-[#121218] hover:border-violet-400/50",
                  glow: "from-violet-500/15",
                  avatar: "from-violet-500/30 to-fuchsia-500/10 border-violet-400/40 text-violet-200",
                },
                {
                  card: "border-emerald-500/20 bg-gradient-to-br from-[#12241d] via-[#131b18] to-[#101414] hover:border-emerald-400/50",
                  glow: "from-emerald-500/15",
                  avatar: "from-emerald-500/30 to-teal-500/10 border-emerald-400/40 text-emerald-200",
                },
              ];
              const tone = cardTones[idx % cardTones.length];
              return (
                <div
                  key={member.id}
                  onClick={() => goToMainRoute(`/team/${member.slug}`)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      goToMainRoute(`/team/${member.slug}`);
                    }
                  }}
                  className={`group relative flex flex-col justify-between overflow-hidden rounded-3xl border p-6 shadow-xl transition duration-300 hover:-translate-y-1 cursor-pointer ${tone.card}`}
                >
                  {/* Subtle top-right ambient radial glow */}
                  <div
                    aria-hidden="true"
                    className={`pointer-events-none absolute -right-12 -top-12 h-36 w-36 rounded-full bg-gradient-to-br ${tone.glow} to-transparent blur-2xl opacity-70 transition group-hover:opacity-100`}
                  />

                  <div className="relative">
                    <div className="flex items-center gap-4">
                      {member.avatar ? (
                        <img
                          src={member.avatar}
                          alt={member.name}
                          className="h-16 w-16 shrink-0 rounded-2xl object-cover border border-white/20 shadow-md"
                        />
                      ) : (
                        <div
                          className={`flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl border bg-gradient-to-br font-display text-lg font-black shadow-md ${tone.avatar}`}
                        >
                          {member.name
                            .split(" ")
                            .map((n) => n[0])
                            .slice(0, 2)
                            .join("")}
                        </div>
                      )}
                      <div className="min-w-0">
                        <h2 className="truncate font-display text-lg font-bold text-white">
                          {member.name}
                        </h2>
                        <span className="mt-1 inline-block truncate rounded-full bg-white/[0.06] px-2.5 py-0.5 text-[11px] font-bold text-rose-300 border border-white/10">
                          {member.role}
                        </span>
                        {member.focus && (
                          <p className="truncate text-[11px] text-white/50 mt-1">
                            {member.focus}
                          </p>
                        )}
                      </div>
                    </div>

                    <p className="mt-5 text-sm leading-relaxed text-white/75">
                      {member.bio}
                    </p>

                    {member.expertise && member.expertise.length > 0 && (
                      <div className="mt-5 flex flex-wrap gap-1.5">
                        {member.expertise.slice(0, 4).map((skill) => (
                          <span
                            key={skill}
                            className="rounded-lg border border-white/10 bg-white/[0.04] px-2.5 py-1 text-[11px] font-medium text-white/80"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="relative mt-6 flex items-center justify-between pt-4 border-t border-white/10">
                    <span className="text-xs font-bold text-white/85 group-hover:text-white transition">
                      View Full Portfolio
                    </span>
                    <span className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-white/15 bg-white/[0.05] text-white transition group-hover:border-brand group-hover:bg-brand group-hover:translate-x-0.5 group-hover:-translate-y-0.5">
                      <ArrowUpRight className="h-3.5 w-3.5" />
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </main>

      <footer className="border-t border-white/10 bg-[#0b0c0e] py-8 text-white/55">
        <div className="mx-auto flex max-w-[1440px] flex-col items-center justify-between gap-3 px-4 text-xs sm:flex-row sm:px-6">
          <div className="font-semibold text-white/80">
            GAMAT <span className="text-brand">Fx</span> Careers ·
            jobs.gamatfxacademy.com
          </div>
          <div>
            © {new Date().getFullYear()} GAMAT Fx Academy. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
