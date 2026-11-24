import { useMemo, useState, useEffect, useRef } from "react";
import { AdminShell, Card, StatCard, Badge, SearchBar, Modal, Empty, exportCsv, fmtDate, useAdminSearchTarget, markAdminNotificationRead } from "./AdminShell";
import { Th, Td, IconBtn } from "./AdminMain";
import { useStore, type ServiceEnquiry } from "../../lib/store";
import { SERVICES } from "../../lib/services";
import {
  Inbox, MailOpen, CheckCircle2, Trash2, Download, Eye, PhoneCall, Video, XCircle,
} from "lucide-react";

export function AdminEnquiries() {
  const { admin } = useStore();
  const [q, setQ] = useAdminSearchTarget();
  const [tab, setTab] = useState<"enquiries" | "mentorship">("enquiries");
  const [status, setStatus] = useState("all");
  const [svc, setSvc] = useState("all");
  const [view, setView] = useState<ServiceEnquiry | null>(null);
  const [confirmTarget, setConfirmTarget] = useState<ServiceEnquiry | null>(null);
  const [meetingLink, setMeetingLink] = useState("");
  const [busyId, setBusyId] = useState<string | null>(null);

  const handleOpenEnquiry = (e: ServiceEnquiry) => {
    const updated = e.status === "new" ? { ...e, status: "read" as const } : e;
    setView(updated);
    if (e.status === "new") {
      admin.setEnquiryStatus(e.id, "read");
    }
    markAdminNotificationRead(`notif_enq_${e.id}`);
  };

  const serviceEnquiries = useMemo(
    () =>
      admin.enquiries.filter(
        (e) => e.serviceSlug !== "sys_discovery_survey" && e.serviceSlug !== "sys_mentorship_booking"
      ),
    [admin.enquiries]
  );

  const mentorshipBookings = useMemo(
    () => admin.enquiries.filter((e) => e.serviceSlug === "sys_mentorship_booking"),
    [admin.enquiries]
  );

  const pendingMentorships = useMemo(
    () =>
      mentorshipBookings.filter(
        (b) => b.budget !== "confirmed" && b.budget !== "declined" && b.status !== "contacted" && b.status !== "closed"
      ).length,
    [mentorshipBookings]
  );

  const lastAutoOpenedQuery = useRef<string | null>(null);
  useEffect(() => {
    if (!q) return;
    const trimmed = q.trim().toLowerCase();
    if (lastAutoOpenedQuery.current === trimmed) return;
    const match = serviceEnquiries.find((e) => e.ref.toLowerCase() === trimmed);
    if (match) {
      lastAutoOpenedQuery.current = trimmed;
      handleOpenEnquiry(match);
    }
  }, [q, serviceEnquiries]);

  const rows = useMemo(() => serviceEnquiries.filter((e) => {
    const mq = `${e.name} ${e.email} ${e.ref} ${e.company ?? ""} ${e.serviceTitle}`.toLowerCase().includes(q.toLowerCase());
    return mq && (status === "all" || e.status === status) && (svc === "all" || e.serviceSlug === svc);
  }), [serviceEnquiries, q, status, svc]);

  const count = (s: ServiceEnquiry["status"]) => serviceEnquiries.filter((e) => e.status === s).length;

  return (
    <AdminShell title="Service Enquiries & 1-on-1s" subtitle="Manage service leads and confirm student 1-on-1 mentorship requests."
      action={
        <button onClick={() => exportCsv("enquiries.csv", rows.map(e => ({
          Ref: e.ref, Name: e.name, Email: e.email, Phone: e.phone, Company: e.company ?? "",
          Service: e.serviceTitle, Package: e.packageName ?? "", Budget: e.budget ?? "",
          Message: e.message, Status: e.status, Date: fmtDate(e.createdAt),
        })))} className="btn-outline-dark !py-2.5">
          <Download className="h-4 w-4" /> Export CSV
        </button>
      }>
      <div className="mb-5 grid grid-cols-1 gap-2 sm:flex sm:flex-wrap">
        <button
          type="button"
          onClick={() => setTab("enquiries")}
          className={`inline-flex items-center justify-center gap-2 rounded-full px-4 py-2.5 sm:py-2 text-xs sm:text-sm font-bold transition cursor-pointer ${
            tab === "enquiries" ? "bg-ink text-white" : "border border-line bg-white text-ink hover:bg-cream"
          }`}
        >
          <Inbox className="h-4 w-4 shrink-0" />
          <span>Service Enquiries ({serviceEnquiries.length})</span>
        </button>
        <button
          type="button"
          onClick={() => setTab("mentorship")}
          className={`inline-flex items-center justify-center gap-2 rounded-full px-4 py-2.5 sm:py-2 text-xs sm:text-sm font-bold transition cursor-pointer ${
            tab === "mentorship" ? "bg-ink text-white" : "border border-line bg-white text-ink hover:bg-cream"
          }`}
        >
          <Video className="h-4 w-4 shrink-0" />
          <span>1-on-1 Mentorship ({mentorshipBookings.length})</span>
          {pendingMentorships > 0 && (
            <span className="rounded-full bg-brand px-2 py-0.5 text-[10px] sm:text-[11px] font-bold text-white shrink-0">
              {pendingMentorships} pending
            </span>
          )}
        </button>
      </div>

      {tab === "mentorship" ? (
        <Card className="overflow-hidden">
          {mentorshipBookings.length ? (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[820px] text-sm">
                <thead className="bg-cream text-left text-xs uppercase tracking-wide text-muted">
                  <tr>
                    <Th>Student</Th>
                    <Th>Topic</Th>
                    <Th>Requested Slot</Th>
                    <Th>Notes</Th>
                    <Th>Status</Th>
                    <Th right>Actions</Th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line">
                  {mentorshipBookings.map((b) => {
                    const isConfirmed = b.budget === "confirmed" || b.status === "contacted";
                    const isDeclined = b.budget === "declined" || b.status === "closed";
                    const isPending = !isConfirmed && !isDeclined;
                    return (
                      <tr key={b.id} className={isPending ? "bg-amber-50/40" : ""}>
                        <Td>
                          <p className="font-semibold text-ink">{b.name}</p>
                          <p className="text-xs text-muted">{b.email}</p>
                        </Td>
                        <Td><span className="font-medium text-ink">{b.serviceTitle}</span></Td>
                        <Td className="whitespace-nowrap"><span className="font-semibold text-ink">{b.packageName} WAT</span></Td>
                        <Td className="max-w-[240px]">
                          <p className="truncate text-xs text-muted">{b.message || "—"}</p>
                          {b.company && (
                            <a href={b.company} target="_blank" rel="noreferrer" className="text-xs font-semibold text-brand hover:underline">
                              Meeting link attached
                            </a>
                          )}
                        </Td>
                        <Td>
                          <Badge tone={isConfirmed ? "green" : isDeclined ? "red" : "amber"}>
                            {isConfirmed ? "Confirmed" : isDeclined ? "Declined" : "Pending"}
                          </Badge>
                        </Td>
                        <Td right>
                          <div className="flex justify-end gap-2">
                            {isPending && (
                              <>
                                <button
                                  type="button"
                                  disabled={busyId === b.id}
                                  onClick={() => {
                                    setConfirmTarget(b);
                                    setMeetingLink("");
                                  }}
                                  className="inline-flex items-center gap-1 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-emerald-700 cursor-pointer disabled:opacity-60"
                                >
                                  <CheckCircle2 className="h-3.5 w-3.5" /> Confirm
                                </button>
                                <button
                                  type="button"
                                  disabled={busyId === b.id}
                                  onClick={async () => {
                                    setBusyId(b.id);
                                    await admin.resolveMentorshipBooking(b.id, "declined");
                                    setBusyId(null);
                                  }}
                                  className="inline-flex items-center gap-1 rounded-lg border border-rose-200 bg-rose-50 px-3 py-1.5 text-xs font-bold text-rose-700 hover:bg-rose-100 cursor-pointer disabled:opacity-60"
                                >
                                  <XCircle className="h-3.5 w-3.5" /> Decline
                                </button>
                              </>
                            )}
                            <IconBtn danger title="Delete" onClick={() => { if (confirm("Delete this booking?")) admin.deleteEnquiry(b.id); }}>
                              <Trash2 className="h-4 w-4" />
                            </IconBtn>
                          </div>
                        </Td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <Empty icon={Video} title="No 1-on-1 requests yet" body="Student 1-on-1 mentorship requests will appear here for confirmation." />
          )}
        </Card>
      ) : (
      <>
      <div className="grid grid-cols-2 gap-3.5 sm:gap-4 lg:grid-cols-4">
        <StatCard icon={Inbox} label="Total enquiries" value={serviceEnquiries.length} />
        <StatCard icon={MailOpen} label="New / unread" value={count("new")} sub={count("new") ? "Needs attention" : undefined} />
        <StatCard icon={PhoneCall} label="Contacted" value={count("contacted")} />
        <StatCard icon={CheckCircle2} label="Closed" value={count("closed")} />
      </div>

      <Card className="mt-6 overflow-hidden">
        <div className="flex flex-wrap items-center gap-3 border-b border-line p-4">
          <SearchBar value={q} onChange={setQ} placeholder="Search name, email, ref…" />
          <select value={svc} onChange={(e) => setSvc(e.target.value)}
            className="rounded-xl border border-line bg-white px-4 py-2.5 text-sm outline-none focus:border-brand">
            <option value="all">All services</option>
            {SERVICES.map((s) => <option key={s.slug} value={s.slug}>{s.title}</option>)}
          </select>
          <select value={status} onChange={(e) => setStatus(e.target.value)}
            className="rounded-xl border border-line bg-white px-4 py-2.5 text-sm outline-none focus:border-brand">
            {["all", "new", "read", "contacted", "closed"].map(s => <option key={s} value={s}>{s === "all" ? "All statuses" : s}</option>)}
          </select>
          <span className="ml-auto text-sm text-muted">{rows.length} enquiry(s)</span>
        </div>

        {rows.length ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[980px] text-sm">
              <thead className="bg-cream text-left text-xs uppercase tracking-wide text-muted">
                <tr>
                  <Th className="whitespace-nowrap">Ref</Th>
                  <Th className="w-[30%] min-w-[220px]">Contact</Th>
                  <Th className="w-[25%] min-w-[200px]">Service</Th>
                  <Th className="whitespace-nowrap">Package</Th>
                  <Th className="whitespace-nowrap">Budget</Th>
                  <Th className="whitespace-nowrap">Status</Th>
                  <Th className="whitespace-nowrap">Date</Th>
                  <Th right>Actions</Th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {rows.map((e) => (
                  <tr key={e.id} className={`transition hover:bg-cream/60 ${e.status === "new" ? "bg-brand-light/40 font-medium" : ""}`}>
                    <Td className="whitespace-nowrap">
                      <button onClick={() => handleOpenEnquiry(e)} className="rounded bg-cream px-2 py-1 text-xs font-bold text-brand hover:underline">
                        {e.ref}
                      </button>
                    </Td>
                    <Td className="min-w-[220px]">
                      <button onClick={() => handleOpenEnquiry(e)} className="text-left font-semibold text-ink hover:text-brand transition">
                        {e.name}
                      </button>
                      <p className="text-xs text-muted truncate">{e.email}</p>
                      {e.company && <p className="text-xs text-muted">{e.company}</p>}
                    </Td>
                    <Td className="min-w-[200px]"><span className="text-ink/80">{e.serviceTitle}</span></Td>
                    <Td className="whitespace-nowrap"><span className="text-muted">{e.packageName ?? "—"}</span></Td>
                    <Td className="whitespace-nowrap"><span className="text-muted">{e.budget ?? "—"}</span></Td>
                    <Td className="whitespace-nowrap"><Badge tone={e.status === "new" ? "red" : e.status === "read" ? "blue" : e.status === "contacted" ? "amber" : "green"}>{e.status}</Badge></Td>
                    <Td className="whitespace-nowrap"><span className="text-muted">{fmtDate(e.createdAt)}</span></Td>
                    <Td right>
                      <div className="flex justify-end gap-1">
                        <IconBtn title="View" onClick={() => handleOpenEnquiry(e)}><Eye className="h-4 w-4" /></IconBtn>
                        {e.status !== "contacted" && e.status !== "closed" && (
                          <IconBtn title="Mark contacted" onClick={() => admin.setEnquiryStatus(e.id, "contacted")}><PhoneCall className="h-4 w-4" /></IconBtn>
                        )}
                        {e.status !== "closed" && (
                          <IconBtn title="Close" onClick={() => admin.setEnquiryStatus(e.id, "closed")}><CheckCircle2 className="h-4 w-4" /></IconBtn>
                        )}
                        <IconBtn danger title="Delete" onClick={() => { if (confirm("Delete this enquiry?")) admin.deleteEnquiry(e.id); }}>
                          <Trash2 className="h-4 w-4" />
                        </IconBtn>
                      </div>
                    </Td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : <Empty icon={Inbox} title="No enquiries yet" body="Leads from your service pages will appear here." />}
      </Card>

      <Modal open={!!view} onClose={() => setView(null)} title="Enquiry details" wide>
        {view && (
          <div className="space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-cream p-5">
              <div>
                <code className="rounded bg-white px-2 py-1 text-xs font-bold text-brand">{view.ref}</code>
                <p className="mt-2 font-display text-lg font-extrabold text-ink">{view.name}</p>
                <p className="text-sm text-muted">{view.email} · {view.phone}</p>
              </div>
              <Badge tone={view.status === "new" ? "red" : view.status === "read" ? "blue" : view.status === "contacted" ? "amber" : "green"}>{view.status}</Badge>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              {[
                ["Service", view.serviceTitle], ["Package", view.packageName ?? "—"],
                ["Budget", view.budget ?? "—"], ["Company", view.company ?? "—"],
                ["Account", view.userId ? "Registered user" : "Guest"],
                ["Submitted", new Date(view.createdAt).toLocaleString()],
              ].map(([l, v]) => (
                <div key={l} className="rounded-xl border border-line p-4">
                  <p className="text-xs font-bold uppercase tracking-wide text-muted">{l}</p>
                  <p className="mt-1 text-sm font-semibold text-ink">{v}</p>
                </div>
              ))}
            </div>

            <div className="rounded-xl border border-line p-5">
              <p className="text-xs font-bold uppercase tracking-wide text-muted">Message</p>
              <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-ink/80">{view.message}</p>
            </div>

            <div className="flex flex-wrap gap-3">
              <a href={`mailto:${view.email}?subject=Re: ${encodeURIComponent(view.serviceTitle)} (${view.ref})`} className="btn-primary !py-2.5">
                <MailOpen className="h-4 w-4" /> Reply by email
              </a>
              <a href={`tel:${view.phone}`} className="btn-outline-dark !py-2.5"><PhoneCall className="h-4 w-4" /> Call</a>
              {view.status !== "contacted" && (
                <button onClick={() => { admin.setEnquiryStatus(view.id, "contacted"); setView(prev => prev ? { ...prev, status: "contacted" } : null); }} className="btn-outline-dark !py-2.5">
                  <PhoneCall className="h-4 w-4" /> Mark contacted
                </button>
              )}
              {view.status !== "closed" && (
                <button onClick={() => { admin.setEnquiryStatus(view.id, "closed"); setView(prev => prev ? { ...prev, status: "closed" } : null); }} className="btn-outline-dark !py-2.5">
                  <CheckCircle2 className="h-4 w-4" /> Mark closed
                </button>
              )}
            </div>
          </div>
        )}
      </Modal>
      </>
      )}

      <Modal open={!!confirmTarget} onClose={() => setConfirmTarget(null)} title="Confirm 1-on-1 Mentorship Session">
        {confirmTarget && (
          <div className="space-y-4">
            <div className="rounded-xl bg-cream p-4 text-sm">
              <p className="font-bold text-ink">{confirmTarget.name} ({confirmTarget.email})</p>
              <p className="mt-1 text-muted">{confirmTarget.serviceTitle} · {confirmTarget.packageName} WAT</p>
              {confirmTarget.message && confirmTarget.message !== "1-on-1 Mentorship Request" && (
                <p className="mt-2 text-xs text-ink/80">Notes: {confirmTarget.message}</p>
              )}
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold text-muted">Meeting Link (Google Meet / Zoom — optional)</label>
              <input
                type="url"
                value={meetingLink}
                onChange={(e) => setMeetingLink(e.target.value)}
                placeholder="https://meet.google.com/..."
                className="w-full rounded-xl border border-line bg-white px-3.5 py-2.5 text-sm outline-none focus:border-brand"
              />
            </div>
            <div className="flex justify-end gap-2">
              <button type="button" onClick={() => setConfirmTarget(null)} className="btn-outline-dark !py-2">Cancel</button>
              <button
                type="button"
                disabled={busyId === confirmTarget.id}
                onClick={async () => {
                  const target = confirmTarget;
                  setBusyId(target.id);
                  await admin.resolveMentorshipBooking(target.id, "confirmed", meetingLink);
                  setBusyId(null);
                  setConfirmTarget(null);
                }}
                className="btn-primary !py-2 disabled:opacity-60"
              >
                <CheckCircle2 className="h-4 w-4" />
                {busyId === confirmTarget.id ? "Sending..." : "Confirm & Email Student"}
              </button>
            </div>
          </div>
        )}
      </Modal>
    </AdminShell>
  );
}
