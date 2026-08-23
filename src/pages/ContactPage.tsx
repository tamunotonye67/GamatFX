import { useState } from "react";
import PageHero from "../components/PageHero";
import { navigate } from "../lib/router";
import { CONTACT } from "../lib/contact";
import {
  Mail,
  Phone,
  MapPin,
  Clock,
  Send,
  CheckCircle2,
  MessageSquare,
} from "lucide-react";

const details = [
  { icon: MapPin, label: "Visit us", value: CONTACT.address },
  { icon: Mail, label: "Email us", value: CONTACT.email },
  { icon: Phone, label: "Call / WhatsApp", value: CONTACT.phone },
  { icon: Clock, label: "Office hours", value: CONTACT.hours },
];

const subjects = [
  "Course enquiry",
  "Mentorship / intake",
  "Consultancy & services",
  "Partnership",
  "Technical support",
  "Something else",
];

export default function ContactPage() {
  const [sent, setSent] = useState(false);

  return (
    <>
      <PageHero
        crumb="Contact"
        eyebrow="Get in touch"
        image="/images/services.jpg"
        title={<>We'd love to <span className="text-brand">hear from you</span></>}
        subtitle="Questions about a course, a partnership or your trading journey? Send us a message and our team will respond within 24 hours."
      />

      <section className="section bg-cream">
        <div className="container-x grid gap-10 lg:grid-cols-[1fr_1.1fr]">
          {/* Details */}
          <div>
            <span className="eyebrow">Contact details</span>
            <h2 className="section-title mt-4">Reach us directly</h2>
            <p className="mt-4 text-muted">
              Prefer to talk? Use any of the channels below — or drop into the academy
              during office hours.
            </p>

            <div className="mt-8 space-y-4">
              {details.map((d) => (
                <div key={d.label} className="flex items-start gap-4 rounded-2xl border border-line bg-white p-5">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand text-white">
                    <d.icon className="h-5 w-5" />
                  </span>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-muted">{d.label}</p>
                    <p className="mt-1 font-medium text-ink">{d.value}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 rounded-2xl bg-gradient-to-br from-brand to-brand-dark p-7 text-white">
              <MessageSquare className="h-8 w-8" />
              <h3 className="mt-4 font-display text-xl font-bold">Fastest response? Telegram.</h3>
              <p className="mt-2 text-sm text-white/85">
                Our community team is active daily and usually replies within minutes.
              </p>
              <a
                href={CONTACT.telegram}
                target="_blank"
                rel="noreferrer"
                className="mt-5 inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-semibold text-brand transition hover:-translate-y-0.5"
              >
                <Send className="h-4 w-4" /> Message us on Telegram
              </a>
            </div>
          </div>

          {/* Form */}
          <div className="rounded-3xl border border-line bg-white p-8 shadow-[0_22px_60px_-32px_rgba(22,24,28,0.4)]">
            {sent ? (
              <div className="flex h-full flex-col items-center justify-center py-16 text-center">
                <CheckCircle2 className="h-16 w-16 text-brand" />
                <h3 className="mt-6 font-display text-2xl font-bold text-ink">Message sent!</h3>
                <p className="mt-2 max-w-sm text-muted">
                  Thanks for reaching out. A member of our team will get back to you
                  within 24 hours.
                </p>
                <div className="mt-8 flex flex-wrap justify-center gap-3">
                  <button type="button" onClick={() => setSent(false)} className="btn-outline-dark">
                    Send another
                  </button>
                  <button type="button" onClick={() => navigate("/courses")} className="btn-primary">
                    Browse Courses
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={(e) => { e.preventDefault(); setSent(true); }} className="space-y-5">
                <div>
                  <h2 className="font-display text-2xl font-bold text-ink">Send a message</h2>
                  <p className="mt-1 text-sm text-muted">All fields are required.</p>
                </div>

                <div className="grid gap-5 sm:grid-cols-2">
                  <Field label="First name" type="text" ph="Jane" />
                  <Field label="Last name" type="text" ph="Doe" />
                </div>
                <Field label="Email address" type="email" ph="jane@example.com" />
                <Field label="Phone / WhatsApp" type="tel" ph={CONTACT.phone} />

                <div>
                  <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-muted">
                    Subject
                  </label>
                  <select
                    required
                    defaultValue=""
                    className="w-full rounded-xl border border-line bg-cream px-4 py-3 text-sm text-ink outline-none transition focus:border-brand focus:bg-white"
                  >
                    <option value="" disabled>Choose a subject…</option>
                    {subjects.map((s) => <option key={s}>{s}</option>)}
                  </select>
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-muted">
                    Message
                  </label>
                  <textarea
                    required
                    rows={5}
                    placeholder="Tell us how we can help…"
                    className="w-full resize-none rounded-xl border border-line bg-cream px-4 py-3 text-sm text-ink placeholder-muted/60 outline-none transition focus:border-brand focus:bg-white"
                  />
                </div>

                <button type="submit" className="btn-primary w-full">
                  <Send className="h-4 w-4" /> Send Message
                </button>
                <p className="text-center text-xs text-muted">
                  By submitting you agree to our{" "}
                  <button type="button" onClick={() => navigate("/privacy")} className="font-semibold text-brand hover:underline">
                    Privacy Policy
                  </button>.
                </p>
              </form>
            )}
          </div>
        </div>
      </section>

      {/* Map placeholder */}
      <section className="pb-24">
        <div className="container-x">
          <div className="relative overflow-hidden rounded-3xl border border-line bg-ink">
            <img src="/images/about-hero.jpg" alt="Academy location" className="h-72 w-full object-cover opacity-40" />
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center text-white">
              <MapPin className="h-10 w-10 text-brand" />
              <h3 className="mt-4 font-display text-2xl font-bold">Visit our Port Harcourt campus</h3>
              <p className="mt-2 max-w-lg text-white/70">{CONTACT.address}</p>
              <p className="mt-1 text-sm text-white/50">Open {CONTACT.hours}</p>
              <a href={CONTACT.whatsappHref} target="_blank" rel="noreferrer"
                className="btn-primary mt-6">Chat on WhatsApp</a>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

function Field({ label, type, ph }: { label: string; type: string; ph: string }) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-muted">
        {label}
      </label>
      <input
        required
        type={type}
        placeholder={ph}
        className="w-full rounded-xl border border-line bg-cream px-4 py-3 text-sm text-ink placeholder-muted/60 outline-none transition focus:border-brand focus:bg-white"
      />
    </div>
  );
}
