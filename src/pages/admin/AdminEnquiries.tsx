import { useMemo, useState } from "react";
import { AdminShell, Card, StatCard, Badge, SearchBar, Modal, Empty, exportCsv, fmtDate } from "./AdminShell";
import { Th, Td, IconBtn } from "./AdminMain";
import { useStore, type ServiceEnquiry } from "../../lib/store";
import { SERVICES } from "../../lib/services";
import {
  Inbox, MailOpen, CheckCircle2, Trash2, Download, Eye, PhoneCall,
} from "lucide-react";

export function AdminEnquiries() {
  const { admin } = useStore();
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("all");
  const [svc, setSvc] = useState("all");
  const [view, setView] = useState<ServiceEnquiry | null>(null);

  const rows = useMemo(() => admin.enquiries.filter((e) => {
    const mq = `${e.name} ${e.email} ${e.ref} ${e.company ?? ""} ${e.serviceTitle}`.toLowerCase().includes(q.toLowerCase());
    return mq && (status === "all" || e.status === status) && (svc === "all" || e.serviceSlug === svc);
  }), [admin.enquiries, q, status, svc]);

  const count = (s: ServiceEnquiry["status"]) => admin.enquiries.filter((e) => e.status === s).length;

  return (
    <AdminShell title="Service Enquiries" subtitle="Leads submitted through your service pages."
      action={
        <button onClick={() => exportCsv("enquiries.csv", rows.map(e => ({
          Ref: e.ref, Name: e.name, Email: e.email, Phone: e.phone, Company: e.company ?? "",
          Service: e.serviceTitle, Package: e.packageName ?? "", Budget: e.budget ?? "",
          Message: e.message, Status: e.status, Date: fmtDate(e.createdAt),
        })))} className="btn-outline-dark !py-2.5">
          <Download className="h-4 w-4" /> Export CSV
        </button>
      }>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard icon={Inbox} label="Total enquiries" value={admin.enquiries.length} />
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
            {["all", "new", "contacted", "closed"].map(s => <option key={s} value={s}>{s === "all" ? "All statuses" : s}</option>)}
          </select>
          <span className="ml-auto text-sm text-muted">{rows.length} enquiry(s)</span>
        </div>

        {rows.length ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[980px] text-sm">
              <thead className="bg-cream text-left text-xs uppercase tracking-wide text-muted">
                <tr><Th>Ref</Th><Th>Contact</Th><Th>Service</Th><Th>Package</Th><Th>Budget</Th><Th>Status</Th><Th>Date</Th><Th right>Actions</Th></tr>
              </thead>
              <tbody className="divide-y divide-line">
                {rows.map((e) => (
                  <tr key={e.id} className={`transition hover:bg-cream/60 ${e.status === "new" ? "bg-brand-light/40" : ""}`}>
                    <Td><code className="rounded bg-cream px-2 py-1 text-xs font-bold text-brand">{e.ref}</code></Td>
                    <Td>
                      <p className="font-semibold text-ink">{e.name}</p>
                      <p className="text-xs text-muted">{e.email}</p>
                      {e.company && <p className="text-xs text-muted">{e.company}</p>}
                    </Td>
                    <Td><span className="text-ink/80">{e.serviceTitle}</span></Td>
                    <Td><span className="text-muted">{e.packageName ?? "—"}</span></Td>
                    <Td><span className="text-muted">{e.budget ?? "—"}</span></Td>
                    <Td><Badge tone={e.status === "new" ? "red" : e.status === "contacted" ? "amber" : "green"}>{e.status}</Badge></Td>
                    <Td><span className="text-muted">{fmtDate(e.createdAt)}</span></Td>
                    <Td right>
                      <div className="flex justify-end gap-1">
                        <IconBtn title="View" onClick={() => setView(e)}><Eye className="h-4 w-4" /></IconBtn>
                        {e.status === "new" && (
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
              <Badge tone={view.status === "new" ? "red" : view.status === "contacted" ? "amber" : "green"}>{view.status}</Badge>
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
              {view.status !== "closed" && (
                <button onClick={() => { admin.setEnquiryStatus(view.id, "closed"); setView(null); }} className="btn-outline-dark !py-2.5">
                  <CheckCircle2 className="h-4 w-4" /> Mark closed
                </button>
              )}
            </div>
          </div>
        )}
      </Modal>
    </AdminShell>
  );
}
