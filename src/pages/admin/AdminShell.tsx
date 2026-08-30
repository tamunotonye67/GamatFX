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
    <div className="min-h-screen bg-cream">
      {/* Sidebar - Fixed to viewport */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 overflow-y-auto bg-ink text-white transition-transform lg:translate-x-0 ${open ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="flex h-[72px] items-center justify-between border-b border-white/10 px-5">
          <Logo variant="light" />
          <button onClick={() => setOpen(false)} className="lg:hidden" aria-label="Close menu">
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
                <n.icon className="h-4 w-4" /> {n.label}
              </button>
            );
          })}
        </nav>

        <div className="mt-8 space-y-1 border-t border-white/10 px-3 pt-5 pb-8">
          <button onClick={() => navigate("/")}
            className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-semibold text-white/65 transition hover:bg-white/8 hover:text-white">
            <ArrowLeft className="h-4 w-4" /> Back to site
          </button>
          <button onClick={() => { logout(); navigate("/"); }}
            className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-semibold text-white/65 transition hover:bg-white/8 hover:text-white">
            <LogOut className="h-4 w-4" /> Log out
          </button>
        </div>
      </aside>

      {open && <div onClick={() => setOpen(false)} className="fixed inset-0 z-40 bg-ink/50 lg:hidden" />}

      {/* Main Content Area */}
      <div className="flex min-h-screen min-w-0 flex-col justify-between lg:pl-64">
        <div>
          <header className="sticky top-0 z-30 flex h-[72px] items-center justify-between gap-4 border-b border-line bg-white/90 px-5 backdrop-blur lg:px-8">
            <button onClick={() => setOpen(true)} className="rounded-lg p-2 text-ink lg:hidden" aria-label="Open menu">
              <Menu className="h-5 w-5" />
            </button>
            <div className="hidden min-w-0 lg:block">
              <h1 className="truncate font-display text-lg font-extrabold text-ink">{title}</h1>
            </div>
            <div className="ml-auto flex items-center gap-4">
              {/* Notification Bell */}
              <div className="relative">
                <button
                  onClick={() => setNotifOpen(!notifOpen)}
                  className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-line bg-cream text-ink transition hover:border-brand hover:bg-white"
                  title="Activity Center Notifications"
                >
                  <Bell className="h-5 w-5" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-brand px-1.5 text-[10px] font-black text-white shadow-md animate-pulse">
                      {unreadCount > 9 ? "9+" : unreadCount}
                    </span>
                  )}
                </button>

                {/* Floating Activity Notifications Panel */}
                {notifOpen && (
                  <div className="absolute right-0 top-full mt-3 w-[calc(100vw-32px)] max-w-sm sm:w-96 rounded-2xl border border-line bg-white p-4 shadow-2xl z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="flex items-center justify-between border-b border-line pb-3 mb-3">
                      <div className="flex items-center gap-2">
                        <Bell className="h-4 w-4 text-brand" />
                        <h3 className="font-bold text-ink text-sm">Site Activity Notifications</h3>
                      </div>
                      {unreadCount > 0 && (
                        <button
                          onClick={handleMarkAllRead}
                          className="text-[11px] font-semibold text-brand hover:underline flex items-center gap-1"
                        >
                          <Check className="h-3 w-3" /> Mark all read
                        </button>
                      )}
                    </div>

                    <div className="max-h-80 overflow-y-auto divide-y divide-line pr-1 space-y-2">
                      {notifs.length ? (
                        notifs.slice(0, 10).map((item) => {
                          const icon =
                            item.type === "registration" ? Users :
                            item.type === "payment" || item.type === "refund" ? CreditCard :
                            item.type === "article" ? FileText :
                            item.type === "team_bio" ? UserCog : Award;
                          const IconComp = icon;

                          return (
                            <div
                              key={item.id}
                              onClick={() => {
                                setNotifOpen(false);
                                navigate(item.link);
                              }}
                              className="group flex gap-3 p-2.5 rounded-xl transition hover:bg-cream cursor-pointer"
                            >
                              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-brand-light text-brand group-hover:bg-brand group-hover:text-white transition">
                                <IconComp className="h-4 w-4" />
                              </div>
                              <div className="min-w-0 flex-1">
                                <div className="flex items-center justify-between gap-2">
                                  <h4 className="text-xs font-bold text-ink truncate">{item.title}</h4>
                                  <span className="text-[10px] text-muted shrink-0">
                                    {new Date(item.timestamp).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}
                                  </span>
                                </div>
                                <p className="text-[11px] text-muted line-clamp-2 mt-0.5">{item.body}</p>
                              </div>
                            </div>
                          );
                        })
                      ) : (
                        <div className="py-6 text-center text-xs text-muted">No recent activity</div>
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

          <main className="p-5 lg:p-8">
            <div className="mb-7 flex flex-wrap items-end justify-between gap-4">
              <div>
                <h2 className="font-display text-2xl font-extrabold text-ink lg:text-3xl">{title}</h2>
                {subtitle && <p className="mt-1.5 text-sm text-muted">{subtitle}</p>}
              </div>
              {action}
            </div>
            {children}
          </main>
        </div>

        <footer className="border-t border-line bg-white px-6 py-4 text-center text-xs text-muted">
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
    <div className={`rounded-2xl border border-line bg-white shadow-[0_14px_45px_-30px_rgba(22,24,28,0.3)] ${className}`}>
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
