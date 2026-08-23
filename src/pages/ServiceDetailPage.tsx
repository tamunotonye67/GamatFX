import { useState } from "react";
import PageCta from "../components/PageCta";
import { getService, SERVICES } from "../lib/services";
import { useStore } from "../lib/store";
import { navigate } from "../lib/router";
import { useReveal } from "../lib/useReveal";
import { CONTACT } from "../lib/contact";
import {
  GraduationCap, Building2, Briefcase, Megaphone, ChevronRight, BadgeCheck,
  ArrowUpRight, CheckCircle2, Loader2, AlertCircle, Send, Plus, Copy,
} from "lucide-react";

const ICONS = { education: GraduationCap, consultancy: Building2, advisory: Briefcase, marketing: Megaphone };

const BUDGETS = ["Under ₦250,000", "₦250,000 – ₦750,000", "₦750,000 – ₦2,000,000", "Over ₦2,000,000", "Not sure yet"];

export default function ServiceDetailPage({ slug }: { slug: string }) {
  const service = getService(slug);
  const { ref, visible } = useReveal<HTMLDivElement>();
  const [pkg, setPkg] = useState<string>("");
  const [openFaq, setOpenFaq] = useState(0);

  if (!service) {
    return (
      <section className="flex min-h-screen flex-col items-center justify-center bg-cream px-6 text-center">
        <h1 className="font-display text-3xl font-extrabold text-ink">Service not found</h1>
        <button onClick={() => navigate("/services")} className="btn-primary mt-8">Back to Services</button>
      </section>
    );
  }

  const Icon = ICONS[service.icon];
  const others = SERVICES.filter((s) => s.slug !== service.slug);

  const goEnquire = (name?: string) => {
    if (name) setPkg(name);
    document.getElementById("enquire")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <>
      {/* Hero */}
      <section className="relative isolate overflow-hidden bg-ink text-white">
        <div className="absolute inset-0 -z-10">
          <img src={service.hero} alt="" aria-hidden className="h-full w-full object-cover opacity-25" />
          <div className="absolute inset-0 bg-gradient-to-br from-ink via-ink/95 to-[#0c0d10]" />
          <div className="absolute inset-0 bg-[radial-gradient(55%_55%_at_85%_15%,rgba(220,53,69,0.32),transparent_60%)]" />
        </div>

        <div className="container-x pb-20 pt-36 md:pb-24 md:pt-44">
          <nav className="mb-6 flex flex-wrap items-center gap-2 text-sm text-white/55">
            <button onClick={() => navigate("/")} className="hover:text-white">Home</button>
            <ChevronRight className="h-3.5 w-3.5" />
            <button onClick={() => navigate("/services")} className="hover:text-white">Services</button>
            <ChevronRight className="h-3.5 w-3.5" />
            <span className="text-brand-light">{service.title}</span>
          </nav>

          <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand shadow-lg">
            <Icon className="h-7 w-7" />
          </span>
          <h1 className="mt-6 max-w-4xl font-display text-4xl font-extrabold leading-[1.1] md:text-5xl">
            {service.title}
          </h1>
          <p className="mt-5 max-w-2xl text-lg text-white/75">{service.short}</p>

          <div className="mt-9 flex flex-wrap gap-4">
            <button onClick={() => goEnquire()} className="btn-primary">
              Request This Service <ArrowUpRight className="h-4 w-4" />
            </button>
            <button onClick={() => navigate("/contact")} className="btn-ghost">Talk to our team</button>
          </div>

          <div className="mt-12 grid max-w-2xl grid-cols-3 gap-6 border-t border-white/10 pt-7">
            {service.stats.map((s) => (
              <div key={s.l}>
                <p className="font-display text-2xl font-extrabold md:text-3xl">{s.v}</p>
                <p className="mt-1 text-sm text-white/55">{s.l}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Intro */}
      <section className="section bg-cream">
        <div className="container-x grid items-center gap-12 lg:grid-cols-2">
          <div>
            <span className="eyebrow">Overview</span>
            <h2 className="section-title mt-4">What this service covers</h2>
            {service.intro.map((p, i) => (
              <p key={i} className="mt-4 leading-relaxed text-muted">{p}</p>
            ))}
            <button onClick={() => goEnquire()} className="btn-outline-dark mt-7">
              Get a proposal <ArrowUpRight className="h-4 w-4" />
            </button>
          </div>
          <img src={service.image} alt={service.title} className="rounded-3xl shadow-xl" />
        </div>
      </section>

      {/* Features */}
      <section className="section bg-white">
        <div ref={ref} className="container-x">
          <div className="mx-auto max-w-2xl text-center">
            <span className="eyebrow justify-center">What's included</span>
            <h2 className="section-title mt-4">Everything in this service</h2>
          </div>
          <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {service.features.map((f, i) => (
              <div key={f.title} className={`card reveal ${visible ? "is-visible" : ""}`} style={{ transitionDelay: `${(i % 3) * 100}ms` }}>
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-light text-brand">
                  <BadgeCheck className="h-5 w-5" />
                </span>
                <h3 className="mt-4 font-display text-base font-bold text-ink">{f.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted">{f.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Process */}
      <section className="section bg-ink text-white">
        <div className="container-x">
          <div className="mx-auto max-w-2xl text-center">
            <span className="eyebrow justify-center text-brand-light">How it works</span>
            <h2 className="mt-4 font-display text-3xl font-extrabold md:text-4xl">Our delivery process</h2>
          </div>
          <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {service.process.map((p) => (
              <div key={p.step} className="relative rounded-2xl border border-white/10 bg-white/5 p-7 transition hover:-translate-y-1 hover:border-brand/50">
                <span className="absolute right-6 top-5 font-display text-4xl font-extrabold text-white/5">{p.step}</span>
                <p className="font-display text-sm font-extrabold text-brand">{p.step}</p>
                <h3 className="mt-3 font-display text-lg font-bold">{p.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-white/60">{p.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Packages */}
      <section className="section bg-cream">
        <div className="container-x">
          <div className="mx-auto max-w-2xl text-center">
            <span className="eyebrow justify-center">Packages</span>
            <h2 className="section-title mt-4">Choose the level of support you need</h2>
            <p className="mt-4 text-muted">Every engagement is scoped individually — these are typical starting points.</p>
          </div>
          <div className="mt-12 grid gap-6 lg:grid-cols-3">
            {service.packages.map((p) => (
              <div key={p.name} className={`flex flex-col rounded-3xl border bg-white p-8 shadow-[0_18px_50px_-30px_rgba(22,24,28,0.3)] transition hover:-translate-y-1.5 ${p.featured ? "border-brand ring-2 ring-brand/20" : "border-line"}`}>
                {p.featured && <span className="mb-4 w-fit rounded-full bg-brand px-3 py-1 text-xs font-bold text-white">{p.note}</span>}
                {!p.featured && <span className="mb-4 w-fit rounded-full bg-cream px-3 py-1 text-xs font-bold text-muted">{p.note}</span>}
                <h3 className="font-display text-xl font-bold text-ink">{p.name}</h3>
                <p className="mt-2 font-display text-3xl font-extrabold text-brand">{p.price}</p>
                <ul className="mt-6 flex-1 space-y-3">
                  {p.items.map((it) => (
                    <li key={it} className="flex items-start gap-2.5 text-sm text-ink/80">
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-brand" /> {it}
                    </li>
                  ))}
                </ul>
                <button onClick={() => goEnquire(p.name)} className={p.featured ? "btn-primary mt-7 w-full" : "btn-outline-dark mt-7 w-full"}>
                  Request {p.name}
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Enquiry */}
      <EnquiryForm service={service} pkg={pkg} setPkg={setPkg} />

      {/* FAQ */}
      <section className="section bg-white">
        <div className="container-x mx-auto max-w-3xl">
          <div className="text-center">
            <span className="eyebrow justify-center">Questions</span>
            <h2 className="section-title mt-4">Common questions</h2>
          </div>
          <div className="mt-10 space-y-4">
            {service.faqs.map((f, i) => {
              const open = openFaq === i;
              return (
                <div key={f.q} className={`overflow-hidden rounded-2xl border bg-white transition-colors ${open ? "border-brand/40" : "border-line"}`}>
                  <button onClick={() => setOpenFaq(open ? -1 : i)} className="flex w-full items-center justify-between gap-6 px-6 py-5 text-left">
                    <span className="font-display text-base font-bold text-ink">{f.q}</span>
                    <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full transition-all ${open ? "rotate-45 bg-brand text-white" : "bg-brand-light text-brand"}`}>
                      <Plus className="h-4 w-4" />
                    </span>
                  </button>
                  <div className={`grid transition-all duration-300 ${open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}>
                    <div className="overflow-hidden"><p className="px-6 pb-6 text-sm leading-relaxed text-muted">{f.a}</p></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Other services */}
      <section className="section bg-cream">
        <div className="container-x">
          <h2 className="section-title text-center">Other services we offer</h2>
          <div className="mt-10 grid gap-5 md:grid-cols-3">
            {others.map((o) => {
              const OIcon = ICONS[o.icon];
              return (
                <button key={o.slug} onClick={() => navigate(`/services/${o.slug}`)} className="card text-left">
                  <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand text-white">
                    <OIcon className="h-5 w-5" />
                  </span>
                  <h3 className="mt-4 font-display text-base font-bold text-ink">{o.title}</h3>
                  <p className="mt-2 line-clamp-2 text-sm text-muted">{o.short}</p>
                  <span className="mt-4 inline-flex items-center gap-1 text-sm font-bold text-brand">
                    Learn more <ArrowUpRight className="h-4 w-4" />
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      <PageCta tone="red" title="Let's build something together"
        body="Tell us what you're working on and we'll put together a clear, practical proposal."
        primaryLabel="Contact Us" primaryTo="/contact" />
    </>
  );
}

/* --------------------------- Enquiry form --------------------------- */

function EnquiryForm({ service, pkg, setPkg }: {
  service: ReturnType<typeof getService> & object; pkg: string; setPkg: (v: string) => void;
}) {
  const { submitEnquiry, user, isAuthed } = useStore();
  const [f, setF] = useState({
    name: user ? `${user.firstName} ${user.lastName}` : "",
    email: user?.email ?? "", phone: user?.phone ?? "", company: "", budget: BUDGETS[0], message: "",
  });
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [ref, setRefCode] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const set = (k: keyof typeof f) => (v: string) => { setF({ ...f, [k]: v }); setErr(null); };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!f.message.trim()) { setErr("Please tell us a little about your project."); return; }
    setBusy(true);
    window.setTimeout(() => {
      const enq = submitEnquiry({
        serviceSlug: service.slug, serviceTitle: service.title,
        packageName: pkg || undefined,
        name: f.name, email: f.email, phone: f.phone,
        company: f.company || undefined, budget: f.budget, message: f.message,
      });
      setBusy(false);
      setRefCode(enq.ref);
    }, 900);
  };

  return (
    <section id="enquire" className="section bg-ink text-white">
      <div className="container-x grid gap-12 lg:grid-cols-2 lg:items-center">
        <div>
          <span className="eyebrow text-brand-light">Get started</span>
          <h2 className="mt-4 font-display text-3xl font-extrabold leading-tight md:text-4xl">
            Request {service.title}
          </h2>
          <p className="mt-4 text-white/70">
            Tell us about your goals and we'll come back within 24 hours with a clear,
            practical proposal — scope, timeline and transparent pricing.
          </p>
          <ul className="mt-8 space-y-3">
            {["No obligation and no pressure", "A named consultant assigned to you", "Written proposal within 24 hours"].map((p) => (
              <li key={p} className="flex items-start gap-3 text-sm text-white/70">
                <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-brand" /> {p}
              </li>
            ))}
          </ul>
        </div>

        {ref ? (
          <div className="rounded-3xl border border-white/10 bg-white/5 p-8 text-center backdrop-blur-sm">
            <CheckCircle2 className="mx-auto h-14 w-14 text-brand" />
            <h3 className="mt-5 font-display text-2xl font-bold">Enquiry received!</h3>
            <p className="mt-2 text-white/65">
              Thanks {f.name.split(" ")[0]} — our team will contact you at <strong className="text-white">{f.email}</strong> within 24 hours.
            </p>
            <div className="mt-6 rounded-2xl border border-dashed border-brand/50 bg-brand/10 p-6">
              <p className="text-xs uppercase tracking-widest text-white/50">Your reference</p>
              <p className="mt-2 font-display text-3xl font-extrabold tracking-wider text-brand-light">{ref}</p>
              <button onClick={() => { void navigator.clipboard?.writeText(ref); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
                className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-white/70 hover:text-white">
                <Copy className="h-3.5 w-3.5" /> {copied ? "Copied!" : "Copy reference"}
              </button>
            </div>
            <div className="mt-7 flex flex-wrap justify-center gap-3">
              <button onClick={() => navigate("/services")} className="btn-primary">Explore other services</button>
              <button onClick={() => { setRefCode(null); setF({ ...f, message: "" }); setPkg(""); }} className="btn-ghost">
                Send another enquiry
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={submit} className="space-y-4 rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur-sm">
            {err && (
              <div className="flex items-start gap-3 rounded-xl border border-brand/40 bg-brand/15 p-4">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-brand-light" />
                <p className="text-sm text-white/85">{err}</p>
              </div>
            )}

            {pkg && (
              <div className="flex items-center justify-between rounded-xl border border-brand/40 bg-brand/15 px-4 py-3">
                <span className="text-sm text-white/85">Package: <strong className="text-white">{pkg}</strong></span>
                <button type="button" onClick={() => setPkg("")} className="text-xs font-bold text-brand-light hover:underline">Clear</button>
              </div>
            )}

            <div className="grid gap-4 sm:grid-cols-2">
              <In label="Full name" value={f.name} onChange={set("name")} ph="Jane Doe" />
              <In label="Email" type="email" value={f.email} onChange={set("email")} ph="jane@company.com" />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <In label="Phone / WhatsApp" type="tel" value={f.phone} onChange={set("phone")} ph={CONTACT.phone} />
              <In label="Company (optional)" value={f.company} onChange={set("company")} ph="Acme Ltd" req={false} />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-white/60">Estimated budget</label>
              <select value={f.budget} onChange={(e) => set("budget")(e.target.value)}
                className="w-full rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-sm text-white outline-none focus:border-brand focus:bg-white/10">
                {BUDGETS.map((b) => <option key={b} className="bg-ink">{b}</option>)}
              </select>
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-white/60">Tell us about your project</label>
              <textarea rows={4} value={f.message} onChange={(e) => set("message")(e.target.value)}
                placeholder="What are you trying to achieve, and by when?"
                className="w-full resize-none rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-sm text-white placeholder-white/35 outline-none focus:border-brand focus:bg-white/10" />
            </div>
            <button type="submit" disabled={busy} className="btn-primary w-full disabled:opacity-60">
              {busy ? <><Loader2 className="h-4 w-4 animate-spin" /> Sending…</> : <><Send className="h-4 w-4" /> Send Enquiry</>}
            </button>
            <p className="text-center text-xs text-white/40">
              {isAuthed ? "Linked to your account for easy follow-up." : "We reply within 24 hours, Monday to Friday."}
            </p>
          </form>
        )}
      </div>
    </section>
  );
}

function In({ label, value, onChange, ph, type = "text", req = true }: {
  label: string; value: string; onChange: (v: string) => void; ph: string; type?: string; req?: boolean;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-white/60">{label}</label>
      <input required={req} type={type} value={value} placeholder={ph} onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-sm text-white placeholder-white/35 outline-none focus:border-brand focus:bg-white/10" />
    </div>
  );
}
