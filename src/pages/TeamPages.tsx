import PageHero from "../components/PageHero";
import PageCta from "../components/PageCta";
import { useStore } from "../lib/store";
import { navigate } from "../lib/router";
import { useReveal } from "../lib/useReveal";
import {
  Users, ChevronRight, ArrowLeft, ArrowUpRight, CheckCircle2, Quote,
} from "lucide-react";

function initials(name: string) {
  return name.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase();
}

export function TeamPage() {
  const { publishedTeam } = useStore();
  const { ref, visible } = useReveal<HTMLDivElement>();

  return (
    <>
      <PageHero
        crumb="About the Team"
        eyebrow="The people"
        image="/images/about.jpg"
        title={<>Meet the <span className="text-brand">GAMAT team</span></>}
        subtitle="Educators, analysts and mentors who still live in the markets — and build systems so students can too."
      />

      <section className="section bg-cream">
        <div ref={ref} className="container-x">
          <div className="mx-auto max-w-2xl text-center">
            <span className="eyebrow justify-center">About the Team</span>
            <h2 className="section-title mt-4">Click any profile to learn more</h2>
            <p className="mt-4 text-muted">
              Each member page covers their role, expertise and milestones at GAMAT Fx Academy.
            </p>
          </div>

          {!publishedTeam.length ? (
            <div className="mt-12 rounded-3xl border border-dashed border-line bg-white p-14 text-center">
              <Users className="mx-auto h-12 w-12 text-brand/35" />
              <h3 className="mt-5 font-display text-xl font-bold text-ink">Team profiles coming soon</h3>
            </div>
          ) : (
            <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {publishedTeam.map((m, i) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => navigate(`/team/${m.slug}`)}
                  className={`card group text-center transition hover:-translate-y-1.5 reveal ${visible ? "is-visible" : ""}`}
                  style={{ transitionDelay: `${i * 90}ms` }}
                >
                  {m.avatar ? (
                    <img src={m.avatar} alt={m.name} className="mx-auto h-20 w-20 rounded-full object-cover ring-4 ring-brand/15" />
                  ) : (
                    <span className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-brand to-brand-dark font-display text-xl font-extrabold text-white shadow-md">
                      {initials(m.name)}
                    </span>
                  )}
                  <h3 className="mt-4 font-display text-base font-bold text-ink group-hover:text-brand">{m.name}</h3>
                  <p className="mt-1 text-sm font-medium text-brand">{m.role}</p>
                  <p className="mt-2 text-xs text-muted">{m.focus}</p>
                  <span className="mt-4 inline-flex items-center gap-1 text-xs font-bold text-brand">
                    View profile <ArrowUpRight className="h-3.5 w-3.5" />
                  </span>
                </button>
              ))}
            </div>
          )}

          <div className="mt-12 text-center">
            <button type="button" onClick={() => navigate("/about")} className="btn-outline-dark">
              <ArrowLeft className="h-4 w-4" /> Back to About Us
            </button>
          </div>
        </div>
      </section>

      <PageCta
        tone="light"
        title="Learn from the people who built the curriculum"
        body="Explore courses designed and taught by the GAMAT team."
        primaryLabel="Browse Courses"
        primaryTo="/courses"
      />
    </>
  );
}

export function TeamMemberPage({ slug }: { slug: string }) {
  const { publishedTeam } = useStore();
  const member = publishedTeam.find((t) => t.slug === slug);

  if (!member) {
    return (
      <section className="flex min-h-screen flex-col items-center justify-center bg-cream px-6 text-center">
        <h1 className="font-display text-3xl font-extrabold text-ink">Team member not found</h1>
        <button onClick={() => navigate("/team")} className="btn-primary mt-8">Back to Team</button>
      </section>
    );
  }

  return (
    <>
      <section className="relative isolate overflow-hidden bg-ink text-white">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(55%_55%_at_85%_15%,rgba(220,53,69,0.3),transparent_60%)]" />
        <div className="container-x pb-16 pt-36 md:pt-44">
          <nav className="mb-6 flex flex-wrap items-center gap-2 text-sm text-white/55">
            <button onClick={() => navigate("/")} className="hover:text-white">Home</button>
            <ChevronRight className="h-3.5 w-3.5" />
            <button onClick={() => navigate("/about")} className="hover:text-white">About</button>
            <ChevronRight className="h-3.5 w-3.5" />
            <button onClick={() => navigate("/team")} className="hover:text-white">Team</button>
            <ChevronRight className="h-3.5 w-3.5" />
            <span className="text-brand-light">{member.name}</span>
          </nav>

          <div className="grid items-center gap-10 lg:grid-cols-[240px_1fr]">
            {member.avatar ? (
              <img src={member.avatar} alt={member.name} className="mx-auto h-56 w-56 rounded-3xl object-cover shadow-2xl ring-4 ring-white/10 lg:mx-0" />
            ) : (
              <span className="mx-auto flex h-56 w-56 items-center justify-center rounded-3xl bg-gradient-to-br from-brand to-brand-dark font-display text-5xl font-extrabold shadow-2xl lg:mx-0">
                {initials(member.name)}
              </span>
            )}
            <div>
              <span className="eyebrow text-brand-light">Team profile</span>
              <h1 className="mt-3 font-display text-4xl font-extrabold md:text-5xl">{member.name}</h1>
              <p className="mt-2 text-lg font-semibold text-brand-light">{member.role}</p>
              <p className="mt-1 text-sm text-white/55">{member.focus}</p>
              <p className="mt-5 max-w-2xl text-white/75">{member.bio}</p>
            </div>
          </div>
        </div>
      </section>

      <section className="section bg-cream">
        <div className="container-x grid gap-10 lg:grid-cols-[1.2fr_0.8fr]">
          <article className="rounded-3xl border border-line bg-white p-8 shadow-sm md:p-10">
            <h2 className="font-display text-2xl font-bold text-ink">About {member.name.split(" ")[0]}</h2>
            <div className="mt-5 space-y-4 text-[15px] leading-[1.85] text-ink/80">
              {(member.longBio || member.bio).split(/\n{2,}/).map((p, i) => (
                <p key={i}>{p}</p>
              ))}
            </div>
            <Quote className="mt-8 h-7 w-7 text-brand" />
            <p className="mt-2 text-base font-medium text-ink">
              Part of the team building honest, process-first traders at GAMAT Fx Academy.
            </p>
          </article>

          <aside className="space-y-6">
            <div className="rounded-3xl border border-line bg-white p-7 shadow-sm">
              <h3 className="font-display text-lg font-bold text-ink">Expertise</h3>
              <ul className="mt-4 space-y-2.5">
                {(member.expertise.length ? member.expertise : [member.focus]).map((e) => (
                  <li key={e} className="flex items-start gap-2 text-sm text-ink/80">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-brand" /> {e}
                  </li>
                ))}
              </ul>
            </div>

            {member.milestones.length > 0 && (
              <div className="rounded-3xl border border-line bg-white p-7 shadow-sm">
                <h3 className="font-display text-lg font-bold text-ink">Milestones</h3>
                <ul className="mt-4 space-y-4">
                  {member.milestones.map((m) => (
                    <li key={`${m.year}-${m.title}`}>
                      <p className="text-xs font-bold uppercase tracking-wide text-brand">{m.year}</p>
                      <p className="mt-0.5 font-semibold text-ink">{m.title}</p>
                      <p className="mt-1 text-sm text-muted">{m.body}</p>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </aside>
        </div>

        <div className="container-x mt-10 flex flex-wrap gap-3">
          <button type="button" onClick={() => navigate("/team")} className="btn-outline-dark">
            <ArrowLeft className="h-4 w-4" /> All team members
          </button>
          <button type="button" onClick={() => navigate("/mentor")} className="btn-outline-dark">
            About the Founder
          </button>
          <button type="button" onClick={() => navigate("/courses")} className="btn-primary">
            Browse courses
          </button>
        </div>
      </section>
    </>
  );
}
