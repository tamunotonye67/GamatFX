import { useState } from "react";
import Logo from "../components/Logo";
import { navigate } from "../lib/router";
import { useStore } from "../lib/store";
import { signInWithGoogleSupabase, resetPasswordForEmailSupabase, updatePasswordSupabase } from "../lib/supabaseAuth";
import {
  AlertCircle,
  Mail,
  Lock,
  User,
  Eye,
  EyeOff,
  ArrowLeft,
  CheckCircle2,
  BadgeCheck,
  ArrowUpRight,
  Phone,
} from "lucide-react";

const benefits = [
  "Lifetime access to every course you enroll in",
  "Weekly live market breakdown sessions",
  "Private trader community and mentor support",
  "Personal progress tracking and trade journal reviews",
];

const COUNTRIES = [
  { name: "Nigeria", code: "+234", flag: "🇳🇬" },
  { name: "United States", code: "+1", flag: "🇺🇸" },
  { name: "United Kingdom", code: "+44", flag: "🇬🇧" },
  { name: "Canada", code: "+1", flag: "🇨🇦" },
  { name: "South Africa", code: "+27", flag: "🇿🇦" },
  { name: "Ghana", code: "+233", flag: "🇬🇭" },
  { name: "Kenya", code: "+254", flag: "🇰🇪" },
  { name: "UAE", code: "+971", flag: "🇦🇪" },
  { name: "Australia", code: "+61", flag: "🇦🇺" },
  { name: "Germany", code: "+49", flag: "🇩🇪" },
  { name: "France", code: "+33", flag: "🇫🇷" },
  { name: "India", code: "+91", flag: "🇮🇳" },
  { name: "Brazil", code: "+55", flag: "🇧🇷" },
  { name: "Singapore", code: "+65", flag: "🇸🇬" },
];

/* ---------------------------- Shared shell ---------------------------- */

function AuthShell({
  mode,
  children,
}: {
  mode: "login" | "signup";
  children: React.ReactNode;
}) {
  const isLogin = mode === "login";

  return (
    <div className="h-screen w-full overflow-hidden bg-cream">
      <div className="grid h-full w-full lg:grid-cols-2">
        {/* Left — brand panel (FIXED & IMMOVABLE) */}
        <div className="relative hidden h-full w-full overflow-hidden bg-ink lg:block">
          <img
            src="/images/hero.jpg"
            alt=""
            aria-hidden
            className="absolute inset-0 h-full w-full object-cover opacity-30"
          />
          <div className="absolute inset-0 bg-[radial-gradient(60%_50%_at_30%_20%,rgba(220,53,69,0.35),transparent_65%)]" />
          <div className="relative flex h-full flex-col justify-between p-12 text-white">
            <Logo variant="light" />

            <div>
              <h2 className="font-display text-4xl font-extrabold leading-tight">
                {isLogin ? (
                  <>
                    Welcome back to <span className="text-brand">GAMAT Fx</span>
                  </>
                ) : (
                  <>
                    Start trading with <span className="text-brand">real confidence</span>
                  </>
                )}
              </h2>
              <p className="mt-4 max-w-md text-white/70">
                {isLogin
                  ? "Pick up right where you left off — your courses, journal and community are waiting."
                  : "Create your free account and join 4,000+ traders learning the GAMAT method."}
              </p>

              <ul className="mt-8 space-y-3">
                {benefits.map((b) => (
                  <li key={b} className="flex items-start gap-3 text-sm text-white/75">
                    <BadgeCheck className="mt-0.5 h-5 w-5 shrink-0 text-brand" /> {b}
                  </li>
                ))}
              </ul>
            </div>

            <div className="flex items-center gap-8 border-t border-white/10 pt-6">
              {[
                { v: "4K+", l: "Students" },
                { v: "40K+", l: "Community" },
                { v: "4.9/5", l: "Rating" },
              ].map((s) => (
                <div key={s.l}>
                  <p className="font-display text-2xl font-extrabold">{s.v}</p>
                  <p className="text-xs text-white/50">{s.l}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right — ONLY THIS PANEL SCROLLS */}
        <div className="flex h-full w-full flex-col justify-between overflow-y-auto bg-cream px-6 py-10 lg:py-14">
          <div className="mx-auto my-auto w-full max-w-md">
            <button
              type="button"
              onClick={() => navigate("/")}
              className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-muted transition hover:text-brand"
            >
              <ArrowLeft className="h-4 w-4" /> Back to home
            </button>
            {children}
          </div>

          {/* Right Div Anchored Copyright Footer */}
          <div className="mt-10 pb-4 text-center text-xs text-muted">
            Copyright © {new Date().getFullYear()}{" "}
            <span className="font-semibold text-ink">GAMAT Fx Academy</span>. All rights reserved.
          </div>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------ Google Auth Button ------------------------------ */

function GoogleAuthButton({ label }: { label: string }) {
  const [loading, setLoading] = useState(false);
  const [googleErr, setGoogleErr] = useState<string | null>(null);

  const handleGoogleAuth = async () => {
    setLoading(true);
    setGoogleErr(null);
    const res = await signInWithGoogleSupabase();
    setLoading(false);
    if (!res.ok) {
      setGoogleErr(res.error || "Google authentication failed.");
    }
  };

  return (
    <div className="w-full">
      {googleErr && (
        <div className="mb-3 text-xs text-brand text-center">{googleErr}</div>
      )}
      <button
        type="button"
        onClick={handleGoogleAuth}
        disabled={loading}
        className="flex w-full items-center justify-center gap-3 rounded-xl border border-line bg-white py-3 px-4 text-sm font-semibold text-ink shadow-sm transition hover:bg-neutral-50 hover:border-muted/50 disabled:opacity-50"
      >
        <svg className="h-5 w-5 shrink-0" viewBox="0 0 24 24">
          <path
            fill="#4285F4"
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
          />
          <path
            fill="#34A853"
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
          />
          <path
            fill="#FBBC05"
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
          />
          <path
            fill="#EA4335"
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
          />
        </svg>
        {loading ? "Connecting Google..." : label}
      </button>

      <div className="relative my-6 flex items-center justify-center">
        <div className="w-full border-t border-line" />
        <span className="absolute bg-white px-3 text-[11px] font-semibold uppercase tracking-wider text-muted">
          Or continue with email
        </span>
      </div>
    </div>
  );
}

/* ------------------------------ Inputs ------------------------------ */

function Input({
  label,
  type,
  ph,
  icon: Icon,
  value,
  onChange,
}: {
  label: string;
  type: string;
  ph: string;
  icon: React.ElementType;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-muted">
        {label}
      </label>
      <div className="relative">
        <Icon className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
        <input
          required
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={ph}
          className="w-full rounded-xl border border-line bg-white py-3 pl-11 pr-4 text-sm text-ink placeholder-muted/60 outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/15"
        />
      </div>
    </div>
  );
}

function PhoneInput({
  value,
  selectedCountry,
  onPhoneChange,
  onCountryChange,
}: {
  value: string;
  selectedCountry: string;
  onPhoneChange: (phone: string) => void;
  onCountryChange: (country: string) => void;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-muted">
        Phone Number
      </label>
      <div className="flex gap-2">
        <div className="relative shrink-0">
          <select
            value={selectedCountry}
            onChange={(e) => onCountryChange(e.target.value)}
            className="h-11 rounded-xl border border-line bg-white pl-3 pr-8 text-sm text-ink outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/15 cursor-pointer appearance-none"
          >
            {COUNTRIES.map((c) => (
              <option key={c.name} value={c.name}>
                {c.flag} {c.code}
              </option>
            ))}
          </select>
          <span className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-muted">
            ▼
          </span>
        </div>

        <div className="relative flex-1">
          <Phone className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
          <input
            type="tel"
            value={value}
            onChange={(e) => onPhoneChange(e.target.value)}
            placeholder="801 234 5678"
            className="w-full rounded-xl border border-line bg-white py-3 pl-10 pr-4 text-sm text-ink placeholder-muted/60 outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/15"
          />
        </div>
      </div>
    </div>
  );
}

function PasswordInput({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  const [show, setShow] = useState(false);
  return (
    <div>
      <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-muted">
        {label}
      </label>
      <div className="relative">
        <Lock className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
        <input
          required
          type={show ? "text" : "password"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="••••••••"
          className="w-full rounded-xl border border-line bg-white py-3 pl-11 pr-11 text-sm text-ink placeholder-muted/60 outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/15"
        />
        <button
          type="button"
          onClick={() => setShow((v) => !v)}
          aria-label={show ? "Hide password" : "Show password"}
          className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-muted transition hover:text-brand"
        >
          {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      </div>
    </div>
  );
}

function ErrorBox({ msg }: { msg: string }) {
  return (
    <div className="flex items-start gap-3 rounded-xl border border-brand/30 bg-brand-light p-4">
      <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-brand" />
      <p className="text-sm text-ink/80">{msg}</p>
    </div>
  );
}

function nextTarget(): string {
  const q = window.location.hash.split("?")[1] ?? "";
  const next = new URLSearchParams(q).get("next");
  return next || "/dashboard";
}

function Success({
  title,
  body,
  cta,
  to,
}: {
  title: string;
  body: string;
  cta: string;
  to: string;
}) {
  return (
    <div className="rounded-3xl border border-line bg-white p-10 text-center shadow-[0_22px_60px_-35px_rgba(22,24,28,0.35)]">
      <CheckCircle2 className="mx-auto h-16 w-16 text-brand" />
      <h2 className="mt-6 font-display text-2xl font-bold text-ink">{title}</h2>
      <p className="mt-2 text-sm text-muted">{body}</p>
      <button type="button" onClick={() => navigate(to)} className="btn-primary mt-8 w-full">
        {cta} <ArrowUpRight className="h-4 w-4" />
      </button>
    </div>
  );
}

/* ------------------------------- Pages ------------------------------- */

export function LoginPage() {
  const { login, isAuthed } = useStore();
  const [view, setView] = useState<"login" | "forgot" | "sent">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (isAuthed) {
    return (
      <AuthShell mode="login">
        <Success
          title="You're already signed in"
          body="Head to your dashboard to pick up where you left off."
          cta="Go to Dashboard"
          to="/dashboard"
        />
      </AuthShell>
    );
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await login(email, password);
      if (!res.ok) {
        setError(res.error ?? "Unable to log in.");
        setLoading(false);
        return;
      }
      navigate(nextTarget());
    } catch {
      setError("An unexpected error occurred during login. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleForgotSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      setError("Please enter your email address.");
      return;
    }
    setLoading(true);
    setError(null);
    const res = await resetPasswordForEmailSupabase(email);
    setLoading(false);
    if (!res.ok) {
      setError(res.error || "Failed to send password reset email.");
      return;
    }
    setView("sent");
  };

  return (
    <AuthShell mode="login">
      <div className="rounded-3xl border border-line bg-white p-8 shadow-[0_22px_60px_-35px_rgba(22,24,28,0.35)]">
        {view === "sent" ? (
          <div className="text-center py-2">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-brand/10 text-brand">
              <Mail className="h-8 w-8" />
            </div>
            <h1 className="mt-5 font-display text-2xl font-extrabold text-ink">Check your email inbox</h1>
            <p className="mt-2.5 text-sm text-muted leading-relaxed">
              We sent a password reset link to <span className="font-semibold text-ink">{email}</span>. Open your mailbox and click the link to reset your password.
            </p>
            <div className="mt-8 space-y-3">
              <button
                type="button"
                onClick={() => setView("login")}
                className="btn-primary w-full"
              >
                Back to Log In
              </button>
              <button
                type="button"
                onClick={handleForgotSubmit}
                disabled={loading}
                className="w-full text-xs font-semibold text-brand hover:underline py-2"
              >
                {loading ? "Resending email..." : "Didn't get the email? Resend link"}
              </button>
            </div>
          </div>
        ) : view === "forgot" ? (
          <div>
            <h1 className="font-display text-2xl font-extrabold text-ink">Reset your password</h1>
            <p className="mt-1.5 text-sm text-muted">
              Enter your email address and we'll send a password reset link to your inbox.
            </p>

            <form onSubmit={handleForgotSubmit} className="mt-7 space-y-5">
              {error && <ErrorBox msg={error} />}
              <Input
                label="Email address"
                type="email"
                ph="you@example.com"
                icon={Mail}
                value={email}
                onChange={(v) => {
                  setEmail(v);
                  setError(null);
                }}
              />

              <button type="submit" disabled={loading} className="btn-primary w-full">
                {loading ? "Sending link..." : "Send Reset Link"}
              </button>
            </form>

            <p className="mt-6 text-center text-xs text-muted">
              Remembered your password?{" "}
              <button
                type="button"
                onClick={() => {
                  setView("login");
                  setError(null);
                }}
                className="font-semibold text-brand hover:underline"
              >
                Back to Log In
              </button>
            </p>
          </div>
        ) : (
          <div>
            <h1 className="font-display text-2xl font-extrabold text-ink">Log in to your account</h1>
            <p className="mt-1.5 text-sm text-muted">
              New here?{" "}
              <button
                type="button"
                onClick={() => navigate("/signup")}
                className="font-semibold text-brand hover:underline"
              >
                Create an account
              </button>
            </p>

            <div className="mt-7">
              <GoogleAuthButton label="Sign in with Google" />

              <form onSubmit={handleLogin} className="space-y-5">
                {error && <ErrorBox msg={error} />}
                <Input
                  label="Email address"
                  type="email"
                  ph="you@example.com"
                  icon={Mail}
                  value={email}
                  onChange={(v) => {
                    setEmail(v);
                    setError(null);
                  }}
                />
                <PasswordInput
                  label="Password"
                  value={password}
                  onChange={(v) => {
                    setPassword(v);
                    setError(null);
                  }}
                />

                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2 text-sm text-muted cursor-pointer">
                    <input
                      type="checkbox"
                      defaultChecked
                      className="h-4 w-4 rounded border-line accent-[#dc3545]"
                    />
                    Remember me
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setView("forgot");
                      setError(null);
                    }}
                    className="text-sm font-semibold text-brand hover:underline"
                  >
                    Forgot password?
                  </button>
                </div>

                <button type="submit" className="btn-primary w-full">
                  Log In
                </button>
              </form>
            </div>

            <p className="mt-6 text-center text-xs text-muted">
              Protected by our{" "}
              <button
                type="button"
                onClick={() => navigate("/privacy")}
                className="font-semibold text-brand hover:underline"
              >
                Privacy Policy
              </button>
              .
            </p>
          </div>
        )}
      </div>
    </AuthShell>
  );
}

export function SignUpPage() {
  const { signup, isAuthed } = useStore();
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    phone: "",
    country: "Nigeria",
  });
  const [error, setError] = useState<string | null>(null);

  if (isAuthed) {
    return (
      <AuthShell mode="signup">
        <Success
          title="You're already signed in"
          body="Head to your dashboard to continue learning."
          cta="Go to Dashboard"
          to="/dashboard"
        />
      </AuthShell>
    );
  }

  const set = (k: keyof typeof form) => (v: string) => {
    setForm({ ...form, [k]: v });
    setError(null);
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const selectedCountry = COUNTRIES.find((c) => c.name === form.country) || COUNTRIES[0];
    const fullPhone = form.phone.trim() ? `${selectedCountry.code} ${form.phone.trim()}` : undefined;

    const res = await signup({
      ...form,
      phone: fullPhone,
    });
    if (!res.ok) {
      setError(res.error ?? "Unable to create account.");
      return;
    }
    navigate(nextTarget());
  };

  return (
    <AuthShell mode="signup">
      <div className="rounded-3xl border border-line bg-white p-8 shadow-[0_22px_60px_-35px_rgba(22,24,28,0.35)]">
        <h1 className="font-display text-2xl font-extrabold text-ink">Create your free account</h1>
        <p className="mt-1.5 text-sm text-muted">
          Already registered?{" "}
          <button
            type="button"
            onClick={() => navigate("/login")}
            className="font-semibold text-brand hover:underline"
          >
            Log in
          </button>
        </p>

        <div className="mt-7">
          <GoogleAuthButton label="Sign up with Google" />

          <form onSubmit={submit} className="space-y-5">
            {error && <ErrorBox msg={error} />}
            <div className="grid gap-5 sm:grid-cols-2">
              <Input
                label="First name"
                type="text"
                ph="Jane"
                icon={User}
                value={form.firstName}
                onChange={set("firstName")}
              />
              <Input
                label="Last name"
                type="text"
                ph="Doe"
                icon={User}
                value={form.lastName}
                onChange={set("lastName")}
              />
            </div>

            <Input
              label="Email address"
              type="email"
              ph="you@example.com"
              icon={Mail}
              value={form.email}
              onChange={set("email")}
            />

            <PhoneInput
              value={form.phone}
              selectedCountry={form.country}
              onPhoneChange={set("phone")}
              onCountryChange={set("country")}
            />

            <div>
              <PasswordInput label="Password" value={form.password} onChange={set("password")} />
              <p className="mt-1 text-xs text-muted">Must be at least 6 characters.</p>
            </div>

            <label className="flex items-start gap-2.5 text-sm text-muted">
              <input
                required
                type="checkbox"
                className="mt-0.5 h-4 w-4 shrink-0 rounded border-line accent-[#dc3545]"
              />
              <span>
                I agree to the{" "}
                <button
                  type="button"
                  onClick={() => navigate("/terms")}
                  className="font-semibold text-brand hover:underline"
                >
                  Terms of Service
                </button>{" "}
                and{" "}
                <button
                  type="button"
                  onClick={() => navigate("/privacy")}
                  className="font-semibold text-brand hover:underline"
                >
                  Privacy Policy
                </button>
                .
              </span>
            </label>

            <button type="submit" className="btn-primary w-full">
              Create Account
            </button>
          </form>
        </div>
      </div>
    </AuthShell>
  );
}

export function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setLoading(true);
    setError(null);
    const res = await resetPasswordForEmailSupabase(email);
    setLoading(false);
    if (!res.ok) {
      setError(res.error || "Failed to send password reset email.");
      return;
    }
    setSent(true);
  };

  return (
    <AuthShell mode="login">
      <div className="rounded-3xl border border-line bg-white p-8 shadow-[0_22px_60px_-35px_rgba(22,24,28,0.35)]">
        {sent ? (
          <div className="text-center">
            <CheckCircle2 className="mx-auto h-14 w-14 text-brand" />
            <h1 className="mt-4 font-display text-2xl font-extrabold text-ink">Check your inbox</h1>
            <p className="mt-2 text-sm text-muted">
              We sent a password reset link to <span className="font-semibold text-ink">{email}</span>. Click the link in your email to set your new password.
            </p>
            <button
              type="button"
              onClick={() => navigate("/login")}
              className="btn-primary mt-8 w-full"
            >
              Return to Log In
            </button>
          </div>
        ) : (
          <>
            <h1 className="font-display text-2xl font-extrabold text-ink">Reset your password</h1>
            <p className="mt-1.5 text-sm text-muted">
              Enter your email address and we'll send you a link to reset your password.
            </p>

            <form onSubmit={submit} className="mt-7 space-y-5">
              {error && <ErrorBox msg={error} />}
              <Input
                label="Email address"
                type="email"
                ph="you@example.com"
                icon={Mail}
                value={email}
                onChange={(v) => {
                  setEmail(v);
                  setError(null);
                }}
              />

              <button type="submit" disabled={loading} className="btn-primary w-full">
                {loading ? "Sending link..." : "Send Reset Link"}
              </button>
            </form>

            <p className="mt-6 text-center text-xs text-muted">
              Remembered your password?{" "}
              <button
                type="button"
                onClick={() => navigate("/login")}
                className="font-semibold text-brand hover:underline"
              >
                Back to Log In
              </button>
            </p>
          </>
        )}
      </div>
    </AuthShell>
  );
}

export function ResetPasswordPage() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match. Please re-enter.");
      return;
    }
    setLoading(true);
    setError(null);
    const res = await updatePasswordSupabase(password);
    setLoading(false);
    if (!res.ok) {
      setError(res.error || "Failed to update password.");
      return;
    }
    setSuccess(true);
  };

  return (
    <AuthShell mode="login">
      <div className="rounded-3xl border border-line bg-white p-8 shadow-[0_22px_60px_-35px_rgba(22,24,28,0.35)]">
        {success ? (
          <div className="text-center">
            <CheckCircle2 className="mx-auto h-14 w-14 text-brand" />
            <h1 className="mt-4 font-display text-2xl font-extrabold text-ink">Password updated</h1>
            <p className="mt-2 text-sm text-muted">
              Your password has been reset successfully. You can now log in with your new password.
            </p>
            <button
              type="button"
              onClick={() => navigate("/login")}
              className="btn-primary mt-8 w-full"
            >
              Log In Now
            </button>
          </div>
        ) : (
          <>
            <h1 className="font-display text-2xl font-extrabold text-ink">Create new password</h1>
            <p className="mt-1.5 text-sm text-muted">
              Please enter your new password below.
            </p>

            <form onSubmit={submit} className="mt-7 space-y-5">
              {error && <ErrorBox msg={error} />}
              <PasswordInput
                label="New Password"
                value={password}
                onChange={(v) => {
                  setPassword(v);
                  setError(null);
                }}
              />
              <PasswordInput
                label="Confirm New Password"
                value={confirmPassword}
                onChange={(v) => {
                  setConfirmPassword(v);
                  setError(null);
                }}
              />

              <button type="submit" disabled={loading} className="btn-primary w-full">
                {loading ? "Updating password..." : "Update Password"}
              </button>
            </form>
          </>
        )}
      </div>
    </AuthShell>
  );
}
