import { ArrowLeft, ArrowUpRight, Users } from "lucide-react";
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
      window.location.href = `https://gamatfxacademy.com/#${clean}`;
    }
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
      <main className="mx-auto max-w-[1440px] px-4 py-14 sm:px-8 sm:py-20">
        <div className="max-w-2xl">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-brand/15 px-3 py-1 text-xs font-bold text-rose-300">
            <Users className="h-3.5 w-3.5" /> GAMAT Fx Leadership &amp; Mentors
          </span>
          <h1 className="mt-4 font-sans text-3xl font-medium tracking-tight text-white sm:text-5xl">
            Meet the Team
          </h1>
          <p className="mt-4 text-sm leading-relaxed text-white/65 sm:text-base">
            The traders, mentors, educators, and builders driving GAMAT Fx
            Academy forward. Click any profile to explore their full portfolio
            and milestones.
          </p>
        </div>

        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {publishedTeam.map((member) => (
            <div
              key={member.id}
              className="group flex flex-col justify-between rounded-2xl border border-white/10 bg-[#16181d] p-6 transition hover:border-brand/50 hover:bg-[#191c23]"
            >
              <div>
                <div className="flex items-center gap-4">
                  {member.avatar ? (
                    <img
                      src={member.avatar}
                      alt={member.name}
                      className="h-16 w-16 shrink-0 rounded-full object-cover border-2 border-brand/40"
                    />
                  ) : (
                    <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-brand/20 font-display text-lg font-bold text-rose-300 border-2 border-brand/40">
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
                    <p className="truncate text-xs font-semibold text-rose-400">
                      {member.role}
                    </p>
                    {member.focus && (
                      <p className="truncate text-[11px] text-white/50 mt-0.5">
                        {member.focus}
                      </p>
                    )}
                  </div>
                </div>

                <p className="mt-5 text-sm leading-relaxed text-white/70">
                  {member.bio}
                </p>

                {member.expertise && member.expertise.length > 0 && (
                  <div className="mt-4 flex flex-wrap gap-1.5">
                    {member.expertise.slice(0, 4).map((skill) => (
                      <span
                        key={skill}
                        className="rounded-md border border-white/10 bg-white/[0.04] px-2.5 py-0.5 text-[11px] font-medium text-white/75"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div className="mt-6 pt-4 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => goToMainRoute(`/team/${member.slug}`)}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-white group-hover:text-brand transition cursor-pointer"
                >
                  View Full Portfolio <ArrowUpRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          ))}
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
