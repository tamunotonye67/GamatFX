import { useState } from "react";
import Logo from "../../components/Logo";
import { navigate, useRoute } from "../../lib/router";
import { useStore } from "../../lib/store";
import {
  LayoutDashboard, Users, BookOpen, CreditCard, CalendarDays,
  Ticket, Settings, LogOut, Menu, X, ShieldAlert, ArrowLeft, Search, Inbox,
  FileText, UserCog, Newspaper, Sun, Library, Gift, Contact, Award, Bell,
  Check, Tag, BarChart3, Receipt, FolderDown, Presentation,
} from "lucide-react";

export const nav = [
  { to: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { to: "/admin/analytics", label: "Analytics", icon: BarChart3 },
  { to: "/admin/students", label: "Students", icon: Users },
  { to: "/admin/courses", label: "Courses", icon: BookOpen },
  { to: "/admin/whiteboard", label: "Whiteboard Hub", icon: Presentation },
  { to: "/admin/payments", label: "Payments", icon: CreditCard },
  { to: "/admin/invoices", label: "Invoices & Receipts", icon: Receipt },
  { to: "/admin/company-assets", label: "Company Assets", icon: FolderDown },
  { to: "/admin/coupons", label: "Discount Coupons", icon: Tag },
  { to: "/admin/events", label: "Events", icon: CalendarDays },
  { to: "/admin/registrations", label: "Registrations", icon: Ticket },
  { to: "/admin/enquiries", label: "Enquiries", icon: Inbox },
  { to: "/admin/posts", label: "Blog Articles", icon: FileText },
  { to: "/admin/news", label: "News Events", icon: Newspaper },
  { to: "/admin/outlooks", label: "Daily Outlook", icon: Sun },
  { to: "/admin/student-of-the-week", label: "Student of Week", icon: Award },
  { to: "/admin/giveaways", label: "Giveaways", icon: Gift },
  { to: "/admin/team", label: "Team Pages", icon: Contact },
  { to: "/admin/course-manager", label: "Course Manager", icon: Library },
  { to: "/admin/staff", label: "Staff & Roles", icon: UserCog },
  { to: "/admin/settings", label: "Settings", icon: Settings },
];

/* ============================== Layout ============================== */

export function AdminShell({ title, subtitle, action, children }: {
  title: string; subtitle?: string; action?: React.ReactNode; children: React.ReactNode;
}) {
  const { user, isAdmin, logout, activityNotifications } = useStore();
  const route = useRoute();
  const [open, setOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [readAllTimestamp, setReadAllTimestamp] = useState<number>(() => {
    try {
      return Number(localStorage.getItem("admin_notifs_read_at") || 0);
    } catch {
      return 0;
    }
  });

  if (!isAdmin) {
    return (
      <section className="flex min-h-screen flex-col items-center justify-center bg-cream px-6 text-center">
        <ShieldAlert className="h-16 w-16 text-brand" />
        <h1 className="mt-6 font-display text-3xl font-extrabold text-ink">Admin access required</h1>
        <p className="mt-3 max-w-md text-muted">
          You need an administrator account to view this area.
        </p>
        <div className="mt-6 rounded-2xl border border-line bg-white p-5 text-left text-sm">
          <p className="font-semibold text-ink">Demo admin credentials</p>
          <p className="mt-2 text-muted">Email: <strong className="text-brand">admin@gamatfx.com</strong></p>
          <p className="text-muted">Password: <strong className="text-brand">admin123</strong></p>
        </div>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <button onClick={() => navigate("/login?next=/admin")} className="btn-primary">Log in as admin</button>
          <button onClick={() => navigate("/")} className="btn-outline-dark">Back to site</button>
        </div>
      </section>
    );
  }

  const initials = `${user?.firstName[0] ?? ""}${user?.lastName[0] ?? ""}`.toUpperCase();
  const notifs = activityNotifications || [];
  const unreadNotifs = notifs.filter(
    (item) => new Date(item.timestamp).getTime() > readAllTimestamp
  );
  const unreadCount = unreadNotifs.length;

  const handleMarkAllRead = () => {
    const now = Date.now();
    setReadAllTimestamp(now);
    try {
      localStorage.setItem("admin_notifs_read_at", String(now));
    } catch {}
  };

  return (
    <div className="min-h-screen w-full overflow-x-clip bg-cream">
      {/* Sidebar - Fixed to viewport */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 max-w-[82vw] overflow-y-auto bg-ink text-white transition-transform duration-300 lg:translate-x-0 ${open ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="flex h-[72px] items-center justify-between border-b border-white/10 px-5">
          <Logo variant="light" />
          <button onClick={() => setOpen(false)} className="rounded-lg p-1.5 text-white/80 hover:bg-white/10 hover:text-white lg:hidden" aria-label="Close menu">
            <X className="h-5 w-5" />
          </button>
        </div>

        <p className="px-5 pt-6 text-[10px] font-bold uppercase tracking-[0.2em] text-white/40">Management</p>
        <nav className="mt-3 space-y-1 px-3">
          {nav.map((n) => {
            const active = route === n.to;
            return (
              <button key={n.to} onClick={() => { navigate(n.to); setOpen(false); }}
                className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-semibold transition ${
                  active ? "bg-brand text-white shadow-lg shadow-brand/20" : "text-white/65 hover:bg-white/8 hover:text-white"
                }`}>
                <n.icon className="h-4 w-4 shrink-0" /> <span className="truncate">{n.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="mt-8 space-y-1 border-t border-white/10 px-3 pt-5 pb-8">
          <button onClick={() => navigate("/")}
            className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-semibold text-white/65 transition hover:bg-white/8 hover:text-white">
            <ArrowLeft className="h-4 w-4 shrink-0" /> Back to site
          </button>
          <button onClick={() => { logout(); navigate("/"); }}
            className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-semibold text-white/65 transition hover:bg-white/8 hover:text-white">
            <LogOut className="h-4 w-4 shrink-0" /> Log out
          </button>
        </div>
      </aside>

      {open && <div onClick={() => setOpen(false)} className="fixed inset-0 z-40 bg-ink/50 backdrop-blur-xs lg:hidden" />}

      {/* Fixed Top Navigation Bar */}
      <header className="fixed top-0 right-0 left-0 lg:left-64 z-30 flex h-[72px] items-center justify-between gap-3 border-b border-line bg-white/95 px-4 sm:px-5 backdrop-blur-md shadow-[0_4px_20px_-12px_rgba(22,24,28,0.2)] lg:px-8">
        <div className="flex min-w-0 items-center gap-3">
          <button onClick={() => setOpen(true)} className="shrink-0 rounded-lg p-2 text-ink hover:bg-cream lg:hidden" aria-label="Open menu">
            <Menu className="h-5 w-5" />
          </button>
          <h1 className="truncate font-display text-base sm:text-lg font-extrabold text-ink">{title}</h1>
        </div>
        <div className="ml-auto flex shrink-0 items-center gap-3 sm:gap-4">
          {/* Notification Bell */}
          <div className="relative">
            <button
              onClick={() => setNotifOpen(!notifOpen)}
              className={`relative flex h-10 w-10 items-center justify-center rounded-xl border transition ${
                notifOpen
                  ? "border-brand bg-brand text-white shadow-md shadow-brand/20"
                  : "border-line bg-cream text-ink hover:border-brand hover:bg-white"
              }`}
              title="Activity Center Notifications"
              aria-label="Notifications"
            >
              <Bell className="h-5 w-5" />
              {unreadCount > 0 && (
                <span
                  className={`absolute -top-1 -right-1 flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-[10px] font-black shadow-md ${
                    notifOpen ? "bg-ink text-white" : "bg-brand text-white"
                  }`}
                >
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </button>

            {/* Mobile Backdrop */}
            {notifOpen && (
              <div
                onClick={() => setNotifOpen(false)}
                className="fixed inset-0 top-[72px] z-40 bg-ink/40 backdrop-blur-[2px] sm:hidden"
              />
            )}

            {/* Modern Activity Notifications Panel */}
            {notifOpen && (
              <div className="fixed inset-x-3 top-[80px] z-50 flex max-h-[calc(100dvh-96px)] flex-col overflow-hidden rounded-3xl border border-line bg-white shadow-[0_24px_60px_-15px_rgba(22,24,28,0.35)] sm:absolute sm:inset-x-auto sm:right-0 sm:top-full sm:mt-3 sm:max-h-[460px] sm:w-[380px]">
                {/* Header */}
                <div className="flex items-center justify-between border-b border-line bg-ink px-4 py-3.5 text-white">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-brand/20 text-brand-light">
                      <Bell className="h-4 w-4 text-brand" />
                    </span>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="font-display text-sm font-bold text-white truncate">
                          Activity Center
                        </h3>
                        {unreadCount > 0 && (
                          <span className="rounded-full bg-brand px-2 py-0.5 text-[10px] font-extrabold text-white">
                            {unreadCount} new
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-white/55 truncate">
                        Real-time student &amp; platform updates
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    {unreadCount > 0 && (
                      <button
                        type="button"
                        onClick={handleMarkAllRead}
                        className="inline-flex items-center gap-1 rounded-full bg-white/10 px-2.5 py-1 text-[11px] font-semibold text-white/90 transition hover:bg-white/20"
                      >
                        <Check className="h-3 w-3 text-emerald-400" /> Read all
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => setNotifOpen(false)}
                      aria-label="Close notifications"
                      className="flex h-7 w-7 items-center justify-center rounded-full bg-white/10 text-white/75 transition hover:bg-white/20 hover:text-white"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>

                {/* Notification List */}
                <div className="flex-1 overflow-y-auto divide-y divide-line/70">
                  {notifs.length ? (
                    notifs.slice(0, 12).map((item) => {
                      const isUnread = new Date(item.timestamp).getTime() > readAllTimestamp;
                      const IconComp =
                        item.type === "registration"
                          ? Users
                          : item.type === "payment" || item.type === "refund"
                          ? CreditCard
                          : item.type === "article"
                          ? FileText
                          : item.type === "team_bio"
                          ? UserCog
                          : Award;

                      const badgeTone =
                        item.type === "registration"
                          ? "bg-sky-500/10 text-sky-600"
                          : item.type === "payment"
                          ? "bg-emerald-500/10 text-emerald-600"
                          : item.type === "refund"
                          ? "bg-amber-500/10 text-amber-600"
                          : item.type === "article"
                          ? "bg-purple-500/10 text-purple-600"
                          : "bg-brand-light text-brand";

                      return (
                        <button
                          type="button"
                          key={item.id}
                          onClick={() => {
                            setNotifOpen(false);
                            navigate(item.link);
                          }}
                          className={`group flex w-full items-start gap-3 px-4 py-3.5 text-left transition hover:bg-cream/80 ${
                            isUnread ? "bg-brand/[0.03]" : "bg-white"
                          }`}
                        >
                          <div
                            className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl transition group-hover:scale-105 ${badgeTone}`}
                          >
                            <IconComp className="h-4 w-4" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center justify-between gap-2">
                              <h4
                                className={`text-xs truncate ${
                                  isUnread ? "font-extrabold text-ink" : "font-semibold text-ink/80"
                                }`}
                              >
                                {item.title}
                              </h4>
                              <span className="flex items-center gap-1.5 text-[10px] font-medium text-muted shrink-0">
                                {new Date(item.timestamp).toLocaleTimeString("en-US", {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}
                                {isUnread && (
                                  <span className="h-2 w-2 rounded-full bg-brand" />
                                )}
                              </span>
                            </div>
                            <p className="mt-1 text-[11px] leading-relaxed text-muted line-clamp-2">
                              {item.body}
                            </p>
                          </div>
                        </button>
                      );
                    })
                  ) : (
                    <div className="flex flex-col items-center justify-center px-6 py-10 text-center">
                      <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-cream text-muted">
                        <Bell className="h-5 w-5" />
                      </span>
                      <p className="mt-3 text-xs font-bold text-ink">All caught up!</p>
                      <p className="mt-1 text-[11px] text-muted">
                        New registrations, payments, and updates will appear here.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          <span className="hidden rounded-full bg-brand-light px-3 py-1.5 text-xs font-bold text-brand sm:inline">
            Admin
          </span>
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-brand to-brand-dark text-xs font-bold text-white">
            {initials}
          </span>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="flex min-h-screen w-full min-w-0 flex-col justify-between overflow-x-hidden pt-[72px] lg:pl-64">
        <div className="min-w-0 w-full flex-1">
          <main className="min-w-0 w-full p-4 sm:p-5 lg:p-8">
            <div className="mb-6 sm:mb-7 flex flex-wrap items-end justify-between gap-4">
              <div className="min-w-0">
                <h2 className="font-display text-2xl font-extrabold text-ink lg:text-3xl">{title}</h2>
                {subtitle && <p className="mt-1.5 text-sm text-muted">{subtitle}</p>}
              </div>
              {action}
            </div>
            {children}
          </main>
        </div>

        <footer className="border-t border-line bg-white px-4 sm:px-6 py-4 text-center text-xs text-muted">
          Copyright © {new Date().getFullYear()}{" "}
          <span className="font-semibold text-ink">GAMAT Fx Academy</span>. All rights reserved. — Admin Console
        </footer>
      </div>
    </div>
  );
}

/* ============================ UI helpers ============================ */

export function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`min-w-0 max-w-full rounded-2xl border border-line bg-white shadow-[0_14px_45px_-30px_rgba(22,24,28,0.3)] ${className}`}>
      {children}
    </div>
  );
}

export function StatCard({ icon: Icon, label, value, sub, tone = "brand" }: {
  icon: React.ElementType; label: string; value: string | number; sub?: string; tone?: "brand" | "ink";
}) {
  return (
    <Card className="p-6">
      <span className={`flex h-10 w-10 items-center justify-center rounded-xl ${tone === "brand" ? "bg-brand-light text-brand" : "bg-ink text-white"}`}>
        <Icon className="h-5 w-5" />
      </span>
      <p className="mt-4 font-display text-2xl font-extrabold text-ink lg:text-3xl">{value}</p>
      <p className="mt-0.5 text-sm text-muted">{label}</p>
      {sub && <p className="mt-1 text-xs font-semibold text-brand">{sub}</p>}
    </Card>
  );
}

const toneMap: Record<string, string> = {
  green: "bg-emerald-50 text-emerald-700",
  red: "bg-brand-light text-brand",
  amber: "bg-amber-50 text-amber-700",
  gray: "bg-line/60 text-muted",
  ink: "bg-ink text-white",
};

export function Badge({ children, tone = "gray" }: { children: React.ReactNode; tone?: keyof typeof toneMap }) {
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide ${toneMap[tone]}`}>
      {children}
    </span>
  );
}

export function SearchBar({ value, onChange, placeholder }: {
  value: string; onChange: (v: string) => void; placeholder: string;
}) {
  return (
    <div className="relative w-full sm:max-w-xs">
      <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
      <input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder}
        className="w-full rounded-xl border border-line bg-white py-2.5 pl-10 pr-4 text-sm text-ink placeholder-muted/60 outline-none transition focus:border-brand" />
    </div>
  );
}

export function Modal({ open = true, onClose, title, subtitle, children, wide }: {
  open?: boolean; onClose: () => void; title: string; subtitle?: string; children: React.ReactNode; wide?: boolean;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[70] flex items-start justify-center overflow-y-auto bg-ink/60 p-4 backdrop-blur-sm sm:items-center">
      <div className={`w-full ${wide ? "max-w-3xl" : "max-w-lg"} rounded-3xl border border-line bg-white shadow-2xl`}>
        <div className="flex items-start justify-between border-b border-line px-6 py-4">
          <div>
            <h3 className="font-display text-lg font-bold text-ink">{title}</h3>
            {subtitle && <p className="text-xs text-muted mt-0.5">{subtitle}</p>}
          </div>
          <button onClick={onClose} className="rounded-lg p-1.5 text-muted transition hover:bg-cream hover:text-brand cursor-pointer" aria-label="Close">
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="max-h-[75vh] overflow-y-auto p-6">{children}</div>
      </div>
    </div>
  );
}

export function Field({ label, value, onChange, ph, type = "text" }: {
  label: string; value: string | number; onChange: (v: string) => void; ph?: string; type?: string;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-muted">{label}</label>
      <input type={type} value={value} placeholder={ph} onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-xl border border-line bg-cream px-4 py-2.5 text-sm text-ink placeholder-muted/60 outline-none transition focus:border-brand focus:bg-white" />
    </div>
  );
}

export function Select({ label, value, onChange, options }: {
  label: string; value: string; onChange: (v: string) => void; options: { v: string; l: string }[];
}) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-muted">{label}</label>
      <select value={value} onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-xl border border-line bg-cream px-4 py-2.5 text-sm text-ink outline-none transition focus:border-brand focus:bg-white">
        {options.map((o) => <option key={o.v} value={o.v}>{o.l}</option>)}
      </select>
    </div>
  );
}

export function Empty({ icon: Icon, title, body }: { icon: React.ElementType; title: string; body: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-line bg-white p-14 text-center">
      <Icon className="mx-auto h-12 w-12 text-brand/35" />
      <h3 className="mt-5 font-display text-lg font-bold text-ink">{title}</h3>
      <p className="mx-auto mt-1.5 max-w-sm text-sm text-muted">{body}</p>
    </div>
  );
}

/** Download any array of records as a CSV file. */
export function exportCsv(filename: string, rows: Record<string, unknown>[]) {
  if (!rows.length) return;
  const headers = Object.keys(rows[0]);
  const esc = (v: unknown) => `"${String(v ?? "").replace(/"/g, '""')}"`;
  const csv = [headers.join(","), ...rows.map((r) => headers.map((h) => esc(r[h])).join(","))].join("\n");
  const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8;" }));
  const a = document.createElement("a");
  a.href = url; a.download = filename; a.click();
  URL.revokeObjectURL(url);
}

export const fmtDate = (iso: string) =>
  new Date(iso).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
