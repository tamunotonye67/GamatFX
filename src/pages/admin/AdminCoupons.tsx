import { useMemo, useState } from "react";
import { AdminShell, Card, StatCard, Badge, SearchBar, Modal, Field, Select, Empty, exportCsv, fmtDate } from "./AdminShell";
import { Th, Td, IconBtn } from "./AdminMain";
import { useStore, type Coupon } from "../../lib/store";
import { COURSES, naira } from "../../lib/courses";
import { SEED_STORE_PRODUCTS } from "../../lib/storeProducts";
import {
  Tag, Plus, Pencil, Trash2, Download, CheckCircle2, Percent, Copy, Check, Calendar, Ticket,
  Box, BookOpen,
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
  const { coupons, saveCoupon, deleteCoupon, storeProducts, managedCourses } = useStore();
  const [q, setQ] = useState("");
  const [edit, setEdit] = useState<Draft | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Available store products & courses for single-product coupon targeting
  const allStoreProducts = useMemo(() => {
    return storeProducts && storeProducts.length ? storeProducts : SEED_STORE_PRODUCTS;
  }, [storeProducts]);

  const allCourses = useMemo(() => {
    const base = COURSES;
    const custom = (managedCourses || []).filter((mc) => !base.some((b) => b.id === mc.id));
    return [...base, ...custom];
  }, [managedCourses]);

  const allSelectableProducts = useMemo(() => {
    return [
      ...allStoreProducts.map((p) => ({ id: p.id, title: p.title, type: "Store Tool", price: p.price, isFree: p.isFree })),
      ...allCourses.map((c) => ({ id: c.id, title: c.title, type: "Course / Mentorship", price: c.price, isFree: false })),
    ];
  }, [allStoreProducts, allCourses]);

  const rows = useMemo(() => {
    return (coupons || []).filter((c) =>
      `${c.code} ${c.applicableTo} ${c.targetProductTitle ?? ""} ${c.targetProductId ?? ""} ${c.discountPercent}%`
        .toLowerCase()
        .includes(q.toLowerCase())
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

    if (edit.applicableTo === "single_product" && !edit.targetProductId) {
      setErr("Please select a specific product or course for this single-product coupon.");
      return;
    }

    const res = saveCoupon({
      id: edit.id,
      code: edit.code ?? "",
      discountPercent: Number(edit.discountPercent) || 10,
      maxUses: Number(edit.maxUses) || 100,
      expiryDate: edit.expiryDate || undefined,
      applicableTo: edit.applicableTo || "all",
      targetProductId: edit.applicableTo === "single_product" ? edit.targetProductId : undefined,
      targetProductTitle: edit.applicableTo === "single_product" ? edit.targetProductTitle : undefined,
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
                  Target: c.applicableTo === "single_product"
                    ? `Single Product: ${c.targetProductTitle || c.targetProductId || "Unknown"}`
                    : c.applicableTo === "store"
                    ? "Store Products"
                    : c.applicableTo,
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
      <div className="grid grid-cols-2 gap-3.5 sm:gap-4 lg:grid-cols-4">
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
                  <Th className="whitespace-nowrap">Coupon Code</Th>
                  <Th className="whitespace-nowrap">Discount</Th>
                  <Th className="whitespace-nowrap">Applicable Target</Th>
                  <Th className="whitespace-nowrap">Redemptions</Th>
                  <Th className="whitespace-nowrap">Expiry Date</Th>
                  <Th className="whitespace-nowrap">Status</Th>
                  <Th right>Actions</Th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {rows.map((c) => (
                  <tr key={c.id} className="transition hover:bg-cream/60">
                    <Td className="whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <span className="rounded-lg bg-slate-950 font-mono text-xs font-bold text-amber-400 px-2.5 py-1 tracking-wider border border-amber-500/30 whitespace-nowrap">
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
                    <Td className="whitespace-nowrap">
                      <span className="font-extrabold text-brand text-base whitespace-nowrap">{c.discountPercent}% OFF</span>
                    </Td>
                    <Td className="whitespace-nowrap">
                      {c.applicableTo === "single_product" ? (
                        <div className="flex flex-col gap-0.5">
                          <span className="inline-flex items-center gap-1 rounded-full bg-brand-light border border-brand/20 px-2.5 py-0.5 text-[11px] font-bold text-brand whitespace-nowrap w-fit">
                            <Tag className="h-3 w-3" />
                            <span>Single Product</span>
                          </span>
                          <span
                            className="text-xs font-semibold text-ink max-w-[240px] truncate"
                            title={c.targetProductTitle || c.targetProductId}
                          >
                            {c.targetProductTitle || c.targetProductId}
                          </span>
                        </div>
                      ) : (
                        <span className="rounded-full bg-cream border border-line px-2.5 py-1 text-xs font-bold capitalize text-ink whitespace-nowrap">
                          {c.applicableTo === "store" ? "Store Products" : c.applicableTo}
                        </span>
                      )}
                    </Td>
                    <Td className="whitespace-nowrap">
                      <span className="text-xs font-semibold text-ink whitespace-nowrap">
                        {c.usedCount} / {c.maxUses} used
                      </span>
                    </Td>
                    <Td className="whitespace-nowrap">
                      <span className="text-xs text-muted flex items-center gap-1 whitespace-nowrap">
                        <Calendar className="h-3.5 w-3.5 shrink-0" /> {c.expiryDate ? fmtDate(c.expiryDate) : "No Expiry"}
                      </span>
                    </Td>
                    <Td className="whitespace-nowrap">
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
                onChange={(v) => {
                  const target = v as Coupon["applicableTo"];
                  setEdit({
                    ...edit,
                    applicableTo: target,
                    targetProductId: target === "single_product" ? (edit.targetProductId || allSelectableProducts[0]?.id) : undefined,
                    targetProductTitle: target === "single_product" ? (edit.targetProductTitle || allSelectableProducts[0]?.title) : undefined,
                  });
                }}
                options={[
                  { v: "all", l: "All Products, Tools & Courses" },
                  { v: "single_product", l: "Single Specific Product / Course" },
                  { v: "courses", l: "All Courses & Mentorship Programs" },
                  { v: "store", l: "All Store Tools & Products" },
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

            {/* Single Product Selector */}
            {edit.applicableTo === "single_product" && (
              <div className="rounded-2xl border border-brand/30 bg-brand-light/30 p-4 space-y-3">
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-bold uppercase tracking-wide text-ink flex items-center gap-1.5">
                      <Tag className="h-3.5 w-3.5 text-brand" />
                      <span>Select Discounted Product or Course *</span>
                    </label>
                  </div>

                  <select
                    value={edit.targetProductId ?? ""}
                    onChange={(e) => {
                      const selectedId = e.target.value;
                      const found = allSelectableProducts.find((p) => p.id === selectedId);
                      setEdit({
                        ...edit,
                        targetProductId: selectedId,
                        targetProductTitle: found?.title || selectedId,
                      });
                    }}
                    className="w-full rounded-xl border border-line bg-white px-3.5 py-2.5 text-xs sm:text-sm font-semibold text-ink outline-none transition focus:border-brand shadow-xs"
                    required
                  >
                    <option value="" disabled>-- Choose a single product or course --</option>
                    <optgroup label="Store Tools & Trading Products">
                      {allStoreProducts.map((p) => (
                        <option key={p.id} value={p.id}>
                          [Store Tool] {p.title} ({p.isFree ? "Free" : naira(p.price)})
                        </option>
                      ))}
                    </optgroup>
                    <optgroup label="Courses & Mentorship Programs">
                      {allCourses.map((c) => (
                        <option key={c.id} value={c.id}>
                          [Course] {c.title} ({naira(c.price)})
                        </option>
                      ))}
                    </optgroup>
                  </select>
                </div>

                <div className="flex items-start gap-2 text-[11px] text-muted leading-relaxed">
                  <span className="font-bold text-brand shrink-0">Rule:</span>
                  <span>
                    This coupon will apply <strong>strictly to this selected product</strong>. Students cannot apply it to any other course or store item.
                  </span>
                </div>
              </div>
            )}

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
