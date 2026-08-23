import { useMemo, useState } from "react";
import { AdminShell, Card, StatCard, Badge, SearchBar, Modal, Field, Select, Empty, exportCsv, fmtDate } from "./AdminShell";
import { Th, Td, IconBtn } from "./AdminMain";
import { useStore, type Coupon } from "../../lib/store";
import {
  Tag, Plus, Pencil, Trash2, Download, CheckCircle2, Percent, Copy, Check, Calendar, Ticket,
} from "lucide-react";

type Draft = Partial<Coupon>;

const blank = (): Draft => ({
  code: "",
  discountPercent: 10,
  maxUses: 100,
  expiryDate: "",
  applicableTo: "all",
  status: "active",
});

export function AdminCoupons() {
  const { coupons, saveCoupon, deleteCoupon } = useStore();
  const [q, setQ] = useState("");
  const [edit, setEdit] = useState<Draft | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const rows = useMemo(() => {
    return (coupons || []).filter((c) =>
      `${c.code} ${c.applicableTo} ${c.discountPercent}%`.toLowerCase().includes(q.toLowerCase())
    );
  }, [coupons, q]);

  const openEdit = (c?: Coupon) => {
    setErr(null);
    setEdit(c ? { ...c } : blank());
  };

  const handleCopy = (code: string, id: string) => {
    try {
      navigator.clipboard.writeText(code);
    } catch {
      /* ignore fallback */
    }
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!edit) return;
    const res = saveCoupon({
      id: edit.id,
      code: edit.code ?? "",
      discountPercent: Number(edit.discountPercent) || 10,
      maxUses: Number(edit.maxUses) || 100,
      expiryDate: edit.expiryDate || undefined,
      applicableTo: edit.applicableTo || "all",
      status: edit.status || "active",
    });
    if (!res.ok) {
      setErr(res.error ?? "Could not save coupon.");
      return;
    }
    setEdit(null);
  };

  const totalRedemptions = useMemo(
    () => (coupons || []).reduce((sum, c) => sum + (c.usedCount || 0), 0),
    [coupons]
  );

  return (
    <AdminShell
      title="Discount Coupons"
      subtitle="Create and manage discount codes for courses, mentorship, events, and services."
      action={
        <div className="flex flex-wrap gap-3">
          <button
            onClick={() =>
              exportCsv(
                "coupons.csv",
                rows.map((c) => ({
                  Code: c.code,
                  Discount: `${c.discountPercent}%`,
                  Target: c.applicableTo,
                  MaxUses: c.maxUses,
                  Used: c.usedCount,
                  Status: c.status,
                  Expiry: c.expiryDate || "No Expiry",
                }))
              )
            }
            className="btn-outline-dark !py-2.5"
          >
            <Download className="h-4 w-4" /> Export
          </button>
          <button onClick={() => openEdit()} className="btn-primary !py-2.5">
            <Plus className="h-4 w-4" /> Create Coupon
          </button>
        </div>
      }
    >
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard icon={Tag} label="Total coupons" value={coupons.length} />
        <StatCard icon={CheckCircle2} label="Active coupons" value={coupons.filter((c) => c.status === "active").length} />
        <StatCard icon={Ticket} label="Total redemptions" value={totalRedemptions} />
        <StatCard
          icon={Percent}
          label="Highest discount"
          value={coupons.length ? `${Math.max(...coupons.map((c) => c.discountPercent))}%` : "0%"}
        />
      </div>

      <Card className="mt-6 overflow-hidden">
        <div className="flex flex-wrap items-center gap-3 border-b border-line p-4">
          <SearchBar value={q} onChange={setQ} placeholder="Search coupon code or target…" />
          <span className="ml-auto text-sm text-muted">{rows.length} coupon(s)</span>
        </div>

        {rows.length ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] text-sm">
              <thead className="bg-cream text-left text-xs uppercase tracking-wide text-muted">
                <tr>
                  <Th>Coupon Code</Th>
                  <Th>Discount</Th>
                  <Th>Applicable Target</Th>
                  <Th>Redemptions</Th>
                  <Th>Expiry Date</Th>
                  <Th>Status</Th>
                  <Th right>Actions</Th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {rows.map((c) => (
                  <tr key={c.id} className="transition hover:bg-cream/60">
                    <Td>
                      <div className="flex items-center gap-2">
                        <span className="rounded-lg bg-slate-950 font-mono text-xs font-bold text-amber-400 px-2.5 py-1 tracking-wider border border-amber-500/30">
                          {c.code}
                        </span>
                        <button
                          onClick={() => handleCopy(c.code, c.id)}
                          title="Copy code"
                          className="text-muted hover:text-brand transition"
                        >
                          {copiedId === c.id ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
                        </button>
                      </div>
                    </Td>
                    <Td>
                      <span className="font-extrabold text-brand text-base">{c.discountPercent}% OFF</span>
                    </Td>
                    <Td>
                      <span className="rounded-full bg-cream border border-line px-2.5 py-1 text-xs font-bold capitalize text-ink">
                        {c.applicableTo}
                      </span>
                    </Td>
                    <Td>
                      <span className="text-xs font-semibold text-ink">
                        {c.usedCount} / {c.maxUses} used
                      </span>
                    </Td>
                    <Td>
                      <span className="text-xs text-muted flex items-center gap-1">
                        <Calendar className="h-3.5 w-3.5" /> {c.expiryDate ? fmtDate(c.expiryDate) : "No Expiry"}
                      </span>
                    </Td>
                    <Td>
                      <Badge tone={c.status === "active" ? "green" : "gray"}>{c.status}</Badge>
                    </Td>
                    <Td right>
                      <div className="flex justify-end gap-1">
                        <IconBtn title="Edit" onClick={() => openEdit(c)}>
                          <Pencil className="h-4 w-4" />
                        </IconBtn>
                        <IconBtn
                          danger
                          title="Delete"
                          onClick={() => {
                            if (confirm(`Delete coupon code ${c.code}?`)) deleteCoupon(c.id);
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </IconBtn>
                      </div>
                    </Td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <Empty icon={Tag} title="No coupons found" body="Create your first promotional discount coupon code for students." />
        )}
      </Card>

      <Modal open={!!edit} onClose={() => setEdit(null)} title={edit?.id ? "Edit coupon" : "Create new coupon"}>
        {edit && (
          <form onSubmit={submit} className="space-y-4">
            {err && <p className="rounded-xl border border-brand/30 bg-brand-light p-3 text-sm text-ink/80">{err}</p>}

            <Field
              label="Coupon Code"
              value={edit.code ?? ""}
              onChange={(v) => setEdit({ ...edit, code: v.toUpperCase() })}
              ph="WELCOME10"
            />

            <div className="grid gap-4 sm:grid-cols-2">
              <Field
                label="Discount Percent (%)"
                value={String(edit.discountPercent ?? 10)}
                onChange={(v) => setEdit({ ...edit, discountPercent: Number(v) || 0 })}
                ph="10"
              />
              <Field
                label="Max Uses"
                value={String(edit.maxUses ?? 100)}
                onChange={(v) => setEdit({ ...edit, maxUses: Number(v) || 1 })}
                ph="100"
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <Select
                label="Applicable Target"
                value={edit.applicableTo ?? "all"}
                onChange={(v) => setEdit({ ...edit, applicableTo: v as Coupon["applicableTo"] })}
                options={[
                  { v: "all", l: "All Products & Services" },
                  { v: "courses", l: "Courses & Programs" },
                  { v: "services", l: "Consulting & Desk Services" },
                  { v: "events", l: "Live Events & Workshops" },
                ]}
              />
              <Select
                label="Status"
                value={edit.status ?? "active"}
                onChange={(v) => setEdit({ ...edit, status: v as Coupon["status"] })}
                options={[
                  { v: "active", l: "Active" },
                  { v: "disabled", l: "Disabled" },
                ]}
              />
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-muted">
                Expiry Date (Optional)
              </label>
              <input
                type="date"
                value={edit.expiryDate ?? ""}
                onChange={(e) => setEdit({ ...edit, expiryDate: e.target.value })}
                className="w-full rounded-xl border border-line bg-cream px-4 py-2.5 text-sm outline-none focus:border-brand focus:bg-white text-ink"
              />
            </div>

            <div className="flex justify-end gap-3 border-t border-line pt-4">
              <button type="button" onClick={() => setEdit(null)} className="btn-outline-dark !py-2.5">
                Cancel
              </button>
              <button type="submit" className="btn-primary !py-2.5">
                Save Coupon
              </button>
            </div>
          </form>
        )}
      </Modal>
    </AdminShell>
  );
}
