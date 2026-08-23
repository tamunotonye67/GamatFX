import { useState, useMemo } from "react";
import { AdminShell, Card, StatCard, Badge, SearchBar, Modal, Empty, exportCsv, fmtDate } from "./AdminShell";
import { Th, Td } from "./AdminMain";
import { useStore, type Payment } from "../../lib/store";
import { naira } from "../../lib/courses";
import Logo from "../../components/Logo";
import {
  Receipt, Download, Printer, Plus, FileText, CheckCircle2, ShieldCheck,
  Image, AlertTriangle, Wallet, Upload, X
} from "lucide-react";

/* ========================================================================== */
/*                            1. INVOICES & RECEIPTS                          */
/* ========================================================================== */

export function AdminInvoices() {
  const { admin, recordPayment } = useStore();
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  
  // Modals
  const [activeInvoice, setActiveInvoice] = useState<Payment | null>(null);
  const [activeReceipt, setActiveReceipt] = useState<Payment | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Custom Invoice Form State
  const [customStudentName, setCustomStudentName] = useState("");
  const [customStudentEmail, setCustomStudentEmail] = useState("");
  const [customTitle, setCustomTitle] = useState("1-on-1 Institutional Forex Coaching");
  const [customSubtotal, setCustomSubtotal] = useState("120000");
  const [customDiscount, setCustomDiscount] = useState("0");
  const [customNotes, setCustomNotes] = useState("Payment due within 5 business days via Bank Transfer.");

  const payments = admin.payments || [];

  const rows = useMemo(() => payments.filter((p) => {
    const mq = `${p.ref} ${p.userName} ${p.userEmail} ${p.courseTitle}`.toLowerCase().includes(q.toLowerCase());
    const isMentorship = p.courseId.startsWith("mentorship") || p.courseTitle.toLowerCase().includes("mentorship");
    const matchType = typeFilter === "all" || (typeFilter === "mentorship" ? isMentorship : !isMentorship);
    const matchStatus = status === "all" || p.status === status;
    return mq && matchType && matchStatus;
  }), [payments, q, status, typeFilter]);

  const totalIssued = payments.reduce((acc, p) => acc + p.amount, 0);
  const paidTotal = payments.filter((p) => p.status === "paid").reduce((acc, p) => acc + p.amount, 0);
  const pendingTotal = payments.filter((p) => p.status === "pending").reduce((acc, p) => acc + p.amount, 0);

  const handleCreateCustomInvoice = (e: React.FormEvent) => {
    e.preventDefault();
    const subtotal = Number(customSubtotal) || 0;
    const discount = Number(customDiscount) || 0;
    const vat = Math.round((subtotal - discount) * 0.075);
    const total = subtotal - discount + vat;
    const invRef = `INV-${Date.now().toString().slice(-6)}`;

    recordPayment({
      userId: `user_cust_${Date.now()}`,
      userName: customStudentName || "Client Student",
      userEmail: customStudentEmail || "student@example.com",
      courseId: "custom-invoice",
      courseTitle: customTitle,
      subtotal,
      discount,
      vat,
      amount: total,
      method: "transfer",
    });

    setShowCreateModal(false);
    setCustomStudentName("");
    setCustomStudentEmail("");
    alert(`Custom Invoice ${invRef} generated successfully!`);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <AdminShell
      title="Invoices & Receipts"
      subtitle="Issue, view, and print official academy invoices and payment receipts."
      action={
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setShowCreateModal(true)}
            className="btn-primary !py-2.5 text-xs font-bold"
          >
            <Plus className="h-4 w-4" /> Issue Custom Invoice
          </button>
          <button
            type="button"
            onClick={() =>
              exportCsv(
                "gamat_invoices.csv",
                rows.map((p) => ({
                  InvoiceRef: `INV-${p.ref}`,
                  ReceiptRef: `REC-${p.ref}`,
                  Student: p.userName,
                  Email: p.userEmail,
                  Item: p.courseTitle,
                  Subtotal: p.subtotal,
                  Discount: p.discount,
                  VAT: p.vat,
                  TotalAmount: p.amount,
                  Method: p.method,
                  Status: p.status,
                  Date: fmtDate(p.createdAt),
                }))
              )
            }
            className="btn-outline-dark !py-2.5 text-xs font-bold"
          >
            <Download className="h-4 w-4" /> Export CSV
          </button>
        </div>
      }
    >
      {/* Stat Cards */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard icon={Receipt} label="Total Issued Value" value={naira(totalIssued)} />
        <StatCard icon={CheckCircle2} label="Paid Receipts" value={naira(paidTotal)} />
        <StatCard icon={AlertTriangle} label="Pending Invoices" value={naira(pendingTotal)} />
        <StatCard icon={Wallet} label="Total Documents" value={payments.length} />
      </div>

      {/* Main Invoices Table */}
      <Card className="mt-6 overflow-hidden">
        <div className="flex flex-wrap items-center gap-3 border-b border-line p-4">
          <SearchBar value={q} onChange={setQ} placeholder="Search invoice #, student or item..." />
          
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="rounded-xl border border-line bg-white px-4 py-2.5 text-xs font-semibold text-ink outline-none focus:border-brand"
          >
            <option value="all">All Item Types</option>
            <option value="courses">Video Courses</option>
            <option value="mentorship">Mentorship Packages</option>
          </select>

          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="rounded-xl border border-line bg-white px-4 py-2.5 text-xs font-semibold text-ink outline-none focus:border-brand"
          >
            <option value="all">All Statuses</option>
            <option value="paid">Paid</option>
            <option value="pending">Pending</option>
            <option value="refunded">Refunded</option>
          </select>

          <span className="ml-auto text-xs font-medium text-muted">
            {rows.length} Document(s)
          </span>
        </div>

        {rows.length ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[920px] text-sm">
              <thead className="bg-cream text-left text-xs uppercase tracking-wide text-muted">
                <tr>
                  <Th>Invoice #</Th>
                  <Th>Student / Billed To</Th>
                  <Th>Course / Mentorship Item</Th>
                  <Th>Total Amount</Th>
                  <Th>Payment Status</Th>
                  <Th>Date Issued</Th>
                  <Th right>Official Documents</Th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {rows.map((p) => {
                  const invNo = `INV-${p.ref}`;
                  const recNo = `REC-${p.ref}`;
                  return (
                    <tr key={p.id} className="transition hover:bg-cream/60">
                      <Td>
                        <div className="space-y-0.5">
                          <code className="block rounded bg-cream px-2 py-0.5 text-xs font-bold text-brand">
                            {invNo}
                          </code>
                          <code className="block rounded bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-800">
                            {recNo}
                          </code>
                        </div>
                      </Td>
                      <Td>
                        <p className="font-bold text-ink">{p.userName}</p>
                        <p className="text-xs text-muted">{p.userEmail}</p>
                      </Td>
                      <Td>
                        <span className="font-semibold text-ink/90">{p.courseTitle}</span>
                      </Td>
                      <Td>
                        <span className="font-extrabold text-ink">{naira(p.amount)}</span>
                      </Td>
                      <Td>
                        <Badge tone={p.status === "paid" ? "green" : p.status === "refunded" ? "amber" : "gray"}>
                          {p.status.toUpperCase()}
                        </Badge>
                      </Td>
                      <Td>
                        <span className="text-muted text-xs">{fmtDate(p.createdAt)}</span>
                      </Td>
                      <Td right>
                        <div className="flex items-center justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => setActiveInvoice(p)}
                            className="inline-flex items-center gap-1 rounded-full border border-line bg-white px-3 py-1 text-xs font-bold text-ink transition hover:border-brand hover:text-brand"
                          >
                            <FileText className="h-3.5 w-3.5 text-blue-600" /> Invoice
                          </button>
                          
                          <button
                            type="button"
                            onClick={() => setActiveReceipt(p)}
                            className="inline-flex items-center gap-1 rounded-full border border-line bg-white px-3 py-1 text-xs font-bold text-ink transition hover:border-brand hover:text-brand"
                          >
                            <Receipt className="h-3.5 w-3.5 text-emerald-600" /> Receipt
                          </button>
                        </div>
                      </Td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <Empty icon={Receipt} title="No invoices found" body="Invoices and receipts will appear here as transactions occur." />
        )}
      </Card>

      {/* ------------------------ INVOICE DOCUMENT MODAL ------------------------ */}
      <Modal open={!!activeInvoice} onClose={() => setActiveInvoice(null)} title="Official Tax Invoice">
        {activeInvoice && (
          <div className="space-y-6 text-ink">
            {/* Printable Document Container */}
            <div id="printable-invoice" className="rounded-2xl border border-line bg-white p-6 shadow-sm font-sans space-y-6">
              {/* Header */}
              <div className="flex flex-wrap items-center justify-between gap-4 border-b border-line pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <Logo variant="dark" asDiv />
                  </div>
                  <p className="mt-1 text-xs text-muted">RC No: 1849204 · Tax ID: 29402948-001</p>
                  <p className="text-xs text-muted">12 Institutional Way, Victoria Island, Lagos, Nigeria</p>
                </div>
                <div className="text-right">
                  <span className="inline-block rounded-lg bg-brand/10 px-3 py-1 text-xs font-black uppercase text-brand tracking-widest">
                    Tax Invoice
                  </span>
                  <p className="mt-1 font-mono text-sm font-bold text-ink">INV-{activeInvoice.ref}</p>
                  <p className="text-xs text-muted">Date: {fmtDate(activeInvoice.createdAt)}</p>
                </div>
              </div>

              {/* Billed To */}
              <div className="grid sm:grid-cols-2 gap-4 rounded-xl bg-cream p-4 text-xs">
                <div>
                  <p className="font-bold text-muted uppercase tracking-wider text-[10px]">Billed To (Student):</p>
                  <p className="mt-1 font-extrabold text-ink text-sm">{activeInvoice.userName}</p>
                  <p className="text-muted">{activeInvoice.userEmail}</p>
                </div>
                <div className="text-right sm:text-right">
                  <p className="font-bold text-muted uppercase tracking-wider text-[10px]">Payment Terms:</p>
                  <p className="mt-1 font-bold text-ink">Bank Transfer / Card</p>
                  <Badge tone={activeInvoice.status === "paid" ? "green" : "amber"}>{activeInvoice.status.toUpperCase()}</Badge>
                </div>
              </div>

              {/* Items Table */}
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-line bg-cream/70 text-muted uppercase tracking-wider">
                    <th className="p-2.5">Item Description</th>
                    <th className="p-2.5 text-right">Subtotal</th>
                    <th className="p-2.5 text-right">Discount</th>
                    <th className="p-2.5 text-right">VAT (7.5%)</th>
                    <th className="p-2.5 text-right">Total</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-line/60">
                    <td className="p-2.5 font-bold text-ink">{activeInvoice.courseTitle}</td>
                    <td className="p-2.5 text-right">{naira(activeInvoice.subtotal)}</td>
                    <td className="p-2.5 text-right text-brand">{activeInvoice.discount ? `−${naira(activeInvoice.discount)}` : "—"}</td>
                    <td className="p-2.5 text-right">{naira(activeInvoice.vat)}</td>
                    <td className="p-2.5 text-right font-black text-ink">{naira(activeInvoice.amount)}</td>
                  </tr>
                </tbody>
              </table>

              {/* Invoice Totals */}
              <div className="flex justify-end pt-2">
                <div className="w-full max-w-xs space-y-1.5 text-xs text-right">
                  <div className="flex justify-between border-t border-line pt-2">
                    <span className="font-bold text-ink">Total Due:</span>
                    <span className="font-extrabold text-brand text-base">{naira(activeInvoice.amount)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Print Action */}
            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={handlePrint}
                className="btn-primary w-full !py-3 text-xs font-bold flex items-center justify-center gap-2"
              >
                <Printer className="h-4 w-4" /> Print / Save Official Invoice PDF
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* ------------------------ RECEIPT DOCUMENT MODAL ------------------------ */}
      <Modal open={!!activeReceipt} onClose={() => setActiveReceipt(null)} title="Official Payment Receipt">
        {activeReceipt && (
          <div className="space-y-6 text-ink">
            <div id="printable-receipt" className="rounded-2xl border-2 border-emerald-500/30 bg-white p-6 shadow-sm font-sans space-y-6 relative overflow-hidden">
              {/* Background Seal Watermark */}
              <div className="absolute right-4 bottom-4 opacity-5 pointer-events-none">
                <ShieldCheck className="h-48 w-48 text-emerald-950" />
              </div>

              {/* Header */}
              <div className="flex flex-wrap items-center justify-between gap-4 border-b border-line pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <Logo variant="dark" asDiv />
                  </div>
                  <p className="mt-1 text-xs text-muted">Official Payment Receipt & Proof of Enrolment</p>
                </div>
                <div className="text-right">
                  <span className="inline-block rounded-lg bg-emerald-100 px-3 py-1 text-xs font-black uppercase text-emerald-800 tracking-widest">
                    Official Receipt
                  </span>
                  <p className="mt-1 font-mono text-sm font-bold text-ink">REC-{activeReceipt.ref}</p>
                  <p className="text-xs text-muted">Paid Date: {fmtDate(activeReceipt.createdAt)}</p>
                </div>
              </div>

              {/* Student & Payment Summary */}
              <div className="rounded-xl bg-emerald-50/60 border border-emerald-200 p-4 text-xs space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted">Received From:</span>
                  <strong className="text-ink font-extrabold">{activeReceipt.userName} ({activeReceipt.userEmail})</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted">Item / Description:</span>
                  <strong className="text-ink font-bold">{activeReceipt.courseTitle}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted">Payment Method:</span>
                  <strong className="text-ink uppercase font-bold">{activeReceipt.method}</strong>
                </div>
                <div className="flex justify-between border-t border-emerald-200 pt-2 text-sm">
                  <span className="font-bold text-emerald-900">Total Amount Paid:</span>
                  <strong className="font-black text-emerald-700 text-base">{naira(activeReceipt.amount)}</strong>
                </div>
              </div>

              {/* Seal & Signature */}
              <div className="flex items-end justify-between pt-6 border-t border-line">
                <div className="flex items-center gap-2 text-emerald-700">
                  <ShieldCheck className="h-7 w-7 text-emerald-600" />
                  <div>
                    <p className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-900">Verified Payment Seal</p>
                    <p className="text-[9px] text-muted">GAMAT FX Official Finance Portal</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-script text-lg text-ink italic font-bold">Tonye Taylor</p>
                  <p className="text-[10px] font-bold text-muted border-t border-ink/20 pt-1">Authorized Director</p>
                </div>
              </div>
            </div>

            {/* Print Action */}
            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={handlePrint}
                className="btn-primary w-full !bg-emerald-600 hover:!bg-emerald-700 !py-3 text-xs font-bold flex items-center justify-center gap-2"
              >
                <Printer className="h-4 w-4" /> Print / Save Official Receipt PDF
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* ------------------------ CUSTOM INVOICE CREATION MODAL ------------------------ */}
      <Modal open={showCreateModal} onClose={() => setShowCreateModal(false)} title="Issue Custom Client Invoice">
        <form onSubmit={handleCreateCustomInvoice} className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-ink uppercase tracking-wider mb-1">Student / Client Full Name</label>
            <input
              required
              type="text"
              placeholder="e.g. John Doe"
              value={customStudentName}
              onChange={(e) => setCustomStudentName(e.target.value)}
              className="w-full rounded-xl border border-line bg-cream p-3 text-xs outline-none focus:border-brand"
            />
          </div>

          <div>
            <label className="block font-bold text-ink uppercase tracking-wider mb-1">Student Email Address</label>
            <input
              required
              type="email"
              placeholder="e.g. john@example.com"
              value={customStudentEmail}
              onChange={(e) => setCustomStudentEmail(e.target.value)}
              className="w-full rounded-xl border border-line bg-cream p-3 text-xs outline-none focus:border-brand"
            />
          </div>

          <div>
            <label className="block font-bold text-ink uppercase tracking-wider mb-1">Item Title / Service Description</label>
            <input
              required
              type="text"
              placeholder="e.g. 1-on-1 VIP Institutional Mentorship & Portfolio Audit"
              value={customTitle}
              onChange={(e) => setCustomTitle(e.target.value)}
              className="w-full rounded-xl border border-line bg-cream p-3 text-xs outline-none focus:border-brand"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-ink uppercase tracking-wider mb-1">Subtotal Amount (₦)</label>
              <input
                required
                type="number"
                value={customSubtotal}
                onChange={(e) => setCustomSubtotal(e.target.value)}
                className="w-full rounded-xl border border-line bg-cream p-3 text-xs outline-none focus:border-brand font-bold"
              />
            </div>
            <div>
              <label className="block font-bold text-ink uppercase tracking-wider mb-1">Discount Amount (₦)</label>
              <input
                type="number"
                value={customDiscount}
                onChange={(e) => setCustomDiscount(e.target.value)}
                className="w-full rounded-xl border border-line bg-cream p-3 text-xs outline-none focus:border-brand font-bold"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-ink uppercase tracking-wider mb-1">Invoice Notes / Instructions</label>
            <textarea
              rows={2}
              value={customNotes}
              onChange={(e) => setCustomNotes(e.target.value)}
              className="w-full rounded-xl border border-line bg-cream p-3 text-xs outline-none focus:border-brand"
            />
          </div>

          <button type="submit" className="btn-primary w-full !py-3 text-xs font-bold">
            Generate & Save Official Invoice
          </button>
        </form>
      </Modal>
    </AdminShell>
  );
}

/* ========================================================================== */
/*                      2. COMPANY ASSETS & LETTERHEAD                        */
/* ========================================================================== */

export function AdminCompanyAssets() {
  const [tab, setTab] = useState<"logos" | "letterhead">("logos");

  // Editable Letterhead State
  const [refNo, setRefNo] = useState("GFX/OFF/2026/089");
  const [letterDate, setLetterDate] = useState("17th August 2026");
  const [recipient, setRecipient] = useState("To Whom It May Concern");
  const [subject, setSubject] = useState("OFFICIAL ACCREDITATION & TRADING MENTORSHIP ENROLMENT LETTER");
  const [bodyText, setBodyText] = useState(
    "This letter serves to confirm that GAMAT FX ACADEMY is an accredited financial education institute delivering institutional price action, risk management, and live trading mentorship.\n\n" +
    "Our student mentorship and trading resources are structured according to strict risk controls, proprietary strategy frameworks, and live execution masterclasses."
  );
  const [signatoryName, setSignatoryName] = useState("Tonye Taylor");
  const [signatoryTitle, setSignatoryTitle] = useState("Managing Director & Head of Trading");
  const [signatureUrl, setSignatureUrl] = useState<string | null>(null);

  const handleSignatureUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (evt) => {
        if (evt.target?.result) {
          setSignatureUrl(evt.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const downloadLogoPng = (variant: "dark" | "light" | "icon") => {
    const svgStr = downloadLogoSvgString(variant);
    const img = new window.Image();
    const svgBlob = new Blob([svgStr], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(svgBlob);

    img.onload = () => {
      const canvas = document.createElement("canvas");
      const width = variant === "icon" ? 512 : 960;
      const height = variant === "icon" ? 512 : 200;
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.drawImage(img, 0, 0, width, height);
        const pngUrl = canvas.toDataURL("image/png");
        const a = document.createElement("a");
        a.href = pngUrl;
        a.download = `GAMAT_FX_Logo_${variant.toUpperCase()}.png`;
        a.click();
      }
      URL.revokeObjectURL(url);
    };
    img.src = url;
  };

  const downloadLogoSvgString = (variant: "dark" | "light" | "icon") => {
    if (variant === "icon") {
      return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="512" height="512" fill="none">
  <rect width="32" height="32" rx="10" fill="#dc3545"/>
  <line x1="4" y1="26" x2="28" y2="26" stroke="white" stroke-opacity="0.18" stroke-width="1" />
  <line x1="8.5" y1="7" x2="8.5" y2="24" stroke="white" stroke-opacity="0.55" stroke-width="1.4" stroke-linecap="round" />
  <rect x="6.2" y="10" width="4.6" height="10" rx="1" fill="white" fill-opacity="0.45" />
  <line x1="16" y1="5" x2="16" y2="24" stroke="white" stroke-width="1.6" stroke-linecap="round" />
  <rect x="13.4" y="9" width="5.2" height="12" rx="1.1" fill="white" />
  <line x1="23.5" y1="9" x2="23.5" y2="24" stroke="white" stroke-opacity="0.7" stroke-width="1.4" stroke-linecap="round" />
  <rect x="21.2" y="13" width="4.6" height="8" rx="1" fill="white" fill-opacity="0.75" />
  <path d="M5.5 21.5 C10 18.5, 13 14.5, 16.5 12.5 C20 10.5, 23 9.5, 27 8" stroke="white" stroke-opacity="0.35" stroke-width="1.2" stroke-linecap="round" fill="none" />
</svg>`;
    }
    const isLight = variant === "light";
    const wordFill = isLight ? "#16181C" : "#FFFFFF";
    const subFill = isLight ? "#6C757D" : "rgba(255,255,255,0.7)";
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 50" width="960" height="200">
  <g transform="translate(5, 5)">
    <rect width="40" height="40" rx="12" fill="#dc3545"/>
    <line x1="4" y1="32" x2="36" y2="32" stroke="white" stroke-opacity="0.18" stroke-width="1.2" />
    <line x1="10" y1="9" x2="10" y2="30" stroke="white" stroke-opacity="0.55" stroke-width="1.8" stroke-linecap="round" />
    <rect x="7.5" y="13" width="5" height="13" rx="1.2" fill="white" fill-opacity="0.45" />
    <line x1="20" y1="6" x2="20" y2="30" stroke="white" stroke-width="2" stroke-linecap="round" />
    <rect x="16.8" y="11" width="6.4" height="15" rx="1.4" fill="white" />
    <line x1="30" y1="11" x2="30" y2="30" stroke="white" stroke-opacity="0.7" stroke-width="1.8" stroke-linecap="round" />
    <rect x="27.1" y="16" width="5.8" height="10" rx="1.2" fill="white" fill-opacity="0.75" />
    <path d="M7 27 C12 23, 16 18, 20 16 C25 13, 29 12, 34 10" stroke="white" stroke-opacity="0.35" stroke-width="1.5" stroke-linecap="round" fill="none" />
  </g>
  <text x="56" y="29" font-family="system-ui, -apple-system, sans-serif" font-weight="800" font-size="20" fill="${wordFill}">GAMAT<tspan fill="#dc3545"> Fx</tspan></text>
  <text x="56" y="41" font-family="system-ui, -apple-system, sans-serif" font-weight="600" font-size="9" fill="${subFill}" letter-spacing="2.2">ACADEMY</text>
</svg>`;
  };

  const downloadLogoSvg = (variant: "dark" | "light" | "icon") => {
    const svgContent = downloadLogoSvgString(variant);
    const blob = new Blob([svgContent], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `GAMAT_FX_Logo_${variant.toUpperCase()}.svg`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleDownloadDocxTemplate = () => {
    const content =
      `GAMAT FX ACADEMY LTD\n` +
      `RC: 1849204 | Tax ID: 29402948-001\n` +
      `12 Institutional Way, Victoria Island, Lagos, Nigeria\n` +
      `--------------------------------------------------\n\n` +
      `Ref: ${refNo}\n` +
      `Date: ${letterDate}\n\n` +
      `To: ${recipient}\n\n` +
      `Subject: ${subject}\n\n` +
      `${bodyText}\n\n` +
      `Sincerely,\n` +
      `${signatoryName}\n` +
      `${signatoryTitle}\n` +
      `GAMAT FX ACADEMY LTD`;

    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `GAMAT_FX_Letterhead_${refNo.replace(/\//g, "_")}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handlePrintLetterhead = () => {
    window.print();
  };

  return (
    <AdminShell
      title="Company Assets & Resources"
      subtitle="Official logos, letterhead templates, and brand assets for all team members and workers."
      action={
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setTab("logos")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
              tab === "logos" ? "bg-brand text-white shadow-md" : "bg-white text-ink border border-line"
            }`}
          >
            <Image className="h-3.5 w-3.5 inline mr-1.5" /> Logos & Branding
          </button>
          <button
            type="button"
            onClick={() => setTab("letterhead")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
              tab === "letterhead" ? "bg-brand text-white shadow-md" : "bg-white text-ink border border-line"
            }`}
          >
            <FileText className="h-3.5 w-3.5 inline mr-1.5" /> Letterheaded Paper
          </button>
        </div>
      }
    >
      {tab === "logos" && (
        <div className="space-y-6">
          <div className="rounded-2xl border border-line bg-white p-6 shadow-sm">
            <h3 className="font-display text-lg font-bold text-ink">Official Brand Logo Download Center</h3>
            <p className="text-xs text-muted mt-1">
              Download high-resolution vector SVG and transparent PNG logos for official documents, banners, and media releases.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {/* Logo 1: Main Dark Theme Logo */}
            <div className="rounded-3xl border border-line bg-slate-950 p-6 text-white shadow-lg space-y-4">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <div>
                  <p className="font-bold text-sm text-white">GAMAT FX Main Brand Mark (Dark Theme)</p>
                  <p className="text-[11px] text-white/60">High-Res PNG / Vector SVG</p>
                </div>
                <span className="rounded-full bg-brand/20 px-2.5 py-0.5 text-[10px] font-bold text-brand-light border border-brand/40">
                  Primary
                </span>
              </div>

              {/* Logo Preview */}
              <div className="flex h-32 items-center justify-center rounded-2xl bg-slate-900 border border-white/10 p-6">
                <Logo variant="light" />
              </div>

              {/* Download Actions */}
              <div className="flex flex-wrap gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => downloadLogoPng("dark")}
                  className="btn-primary flex-1 !py-2.5 text-xs font-bold justify-center"
                >
                  <Download className="h-3.5 w-3.5" /> Download PNG
                </button>
                <button
                  type="button"
                  onClick={() => downloadLogoSvg("dark")}
                  className="btn-outline-dark text-white border-white/20 hover:bg-white/10 flex-1 !py-2.5 text-xs font-bold justify-center"
                >
                  <Download className="h-3.5 w-3.5" /> Download SVG
                </button>
              </div>
            </div>

            {/* Logo 2: Light Theme Logo */}
            <div className="rounded-3xl border border-line bg-white p-6 text-ink shadow-lg space-y-4">
              <div className="flex items-center justify-between border-b border-line pb-3">
                <div>
                  <p className="font-bold text-sm text-ink">GAMAT FX Light Theme Logo</p>
                  <p className="text-[11px] text-muted">For white documents & letterheads</p>
                </div>
                <span className="rounded-full bg-cream px-2.5 py-0.5 text-[10px] font-bold text-ink border border-line">
                  Light Theme
                </span>
              </div>

              {/* Logo Preview */}
              <div className="flex h-32 items-center justify-center rounded-2xl bg-cream border border-line p-6">
                <Logo variant="dark" />
              </div>

              {/* Download Actions */}
              <div className="flex flex-wrap gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => downloadLogoPng("light")}
                  className="btn-primary flex-1 !py-2.5 text-xs font-bold justify-center"
                >
                  <Download className="h-3.5 w-3.5" /> Download PNG
                </button>
                <button
                  type="button"
                  onClick={() => downloadLogoSvg("light")}
                  className="btn-outline-dark flex-1 !py-2.5 text-xs font-bold justify-center"
                >
                  <Download className="h-3.5 w-3.5" /> Download SVG
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {tab === "letterhead" && (
        <div className="space-y-6">
          {/* Action Header */}
          <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-line bg-white p-6 shadow-sm">
            <div>
              <h3 className="font-display text-lg font-bold text-ink">Official A4 Letterheaded Paper Generator</h3>
              <p className="text-xs text-muted mt-0.5">
                Customize official company correspondence and print or save as A4 formatted letterhead PDF.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={handlePrintLetterhead}
                className="btn-primary !py-2.5 text-xs font-bold flex items-center gap-2"
              >
                <Printer className="h-4 w-4" /> Print / Save A4 Letterhead PDF
              </button>
              <button
                type="button"
                onClick={handleDownloadDocxTemplate}
                className="btn-outline-dark !py-2.5 text-xs font-bold flex items-center gap-2"
              >
                <Download className="h-4 w-4" /> Download Text Template
              </button>
            </div>
          </div>

          <div className="grid gap-8 lg:grid-cols-[1fr_1.3fr]">
            {/* Form Customizer */}
            <div className="rounded-3xl border border-line bg-white p-6 shadow-sm space-y-4 text-xs">
              <h4 className="font-display text-sm font-bold text-ink border-b border-line pb-2">
                Edit Letter Details
              </h4>

              <div>
                <label className="block font-bold text-ink uppercase tracking-wider mb-1">Reference Number</label>
                <input
                  type="text"
                  value={refNo}
                  onChange={(e) => setRefNo(e.target.value)}
                  className="w-full rounded-xl border border-line bg-cream p-2.5 text-xs font-bold outline-none focus:border-brand"
                />
              </div>

              <div>
                <label className="block font-bold text-ink uppercase tracking-wider mb-1">Document Date</label>
                <input
                  type="text"
                  value={letterDate}
                  onChange={(e) => setLetterDate(e.target.value)}
                  className="w-full rounded-xl border border-line bg-cream p-2.5 text-xs font-semibold outline-none focus:border-brand"
                />
              </div>

              <div>
                <label className="block font-bold text-ink uppercase tracking-wider mb-1">Recipient Name / Title</label>
                <input
                  type="text"
                  value={recipient}
                  onChange={(e) => setRecipient(e.target.value)}
                  className="w-full rounded-xl border border-line bg-cream p-2.5 text-xs font-semibold outline-none focus:border-brand"
                />
              </div>

              <div>
                <label className="block font-bold text-ink uppercase tracking-wider mb-1">Letter Subject</label>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full rounded-xl border border-line bg-cream p-2.5 text-xs font-bold outline-none focus:border-brand"
                />
              </div>

              <div>
                <label className="block font-bold text-ink uppercase tracking-wider mb-1">Letter Content Body</label>
                <textarea
                  rows={6}
                  value={bodyText}
                  onChange={(e) => setBodyText(e.target.value)}
                  className="w-full rounded-xl border border-line bg-cream p-3 text-xs outline-none focus:border-brand leading-relaxed"
                />
              </div>

              {/* Upload Signature Control (Above Signatory Name) */}
              <div>
                <label className="block font-bold text-ink uppercase tracking-wider mb-1">
                  Upload Official Signature
                </label>
                <div className="rounded-xl border border-dashed border-line bg-cream p-3 flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    {signatureUrl ? (
                      <div className="h-10 w-28 rounded border border-line bg-white p-1 flex items-center justify-center overflow-hidden">
                        <img src={signatureUrl} alt="Signature Preview" className="h-full w-full object-contain" />
                      </div>
                    ) : (
                      <span className="text-[10px] text-muted font-medium">No signature file uploaded (using default cursive)</span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <label className="cursor-pointer inline-flex items-center gap-1.5 rounded-lg bg-ink px-3 py-1.5 text-xs font-bold text-white transition hover:bg-brand">
                      <Upload className="h-3.5 w-3.5" /> Upload File
                      <input type="file" accept="image/*" onChange={handleSignatureUpload} className="hidden" />
                    </label>
                    {signatureUrl && (
                      <button
                        type="button"
                        onClick={() => setSignatureUrl(null)}
                        className="rounded-lg border border-line bg-white px-2 py-1.5 text-xs font-bold text-muted hover:text-brand"
                        title="Remove uploaded signature"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-ink uppercase tracking-wider mb-1">Signatory Name</label>
                  <input
                    type="text"
                    value={signatoryName}
                    onChange={(e) => setSignatoryName(e.target.value)}
                    className="w-full rounded-xl border border-line bg-cream p-2.5 text-xs font-bold outline-none focus:border-brand"
                  />
                </div>
                <div>
                  <label className="block font-bold text-ink uppercase tracking-wider mb-1">Signatory Title</label>
                  <input
                    type="text"
                    value={signatoryTitle}
                    onChange={(e) => setSignatoryTitle(e.target.value)}
                    className="w-full rounded-xl border border-line bg-cream p-2.5 text-xs font-semibold outline-none focus:border-brand"
                  />
                </div>
              </div>
            </div>

            {/* Live A4 Letterhead Preview (Printable) */}
            <div
              id="printable-letterhead"
              className="w-full max-w-[210mm] min-h-[297mm] rounded-2xl border-2 border-line bg-white p-[20mm_16mm] shadow-2xl font-sans space-y-6 relative flex flex-col justify-between mx-auto my-0"
            >
              {/* Top Accent Gradient Bar */}
              <div className="absolute top-0 left-0 right-0 h-3 bg-gradient-to-r from-brand via-amber-500 to-brand" />

              <div>
                {/* Header */}
                <div className="flex items-center justify-between border-b-2 border-brand pb-4">
                  <Logo variant="dark" asDiv />
                  <div className="text-right text-[10px] text-muted space-y-0.5">
                    <p className="font-bold text-ink">RC: 1849204</p>
                    <p>Tax ID: 29402948-001</p>
                    <p>www.gamatfx.com</p>
                  </div>
                </div>

                {/* Ref & Date */}
                <div className="flex justify-between text-xs text-muted pt-4">
                  <p><strong className="text-ink font-bold">Ref:</strong> {refNo}</p>
                  <p><strong className="text-ink font-bold">Date:</strong> {letterDate}</p>
                </div>

                {/* Recipient & Subject */}
                <div className="mt-6 space-y-2 text-xs">
                  <p className="font-extrabold text-ink text-sm">{recipient}</p>
                  <p className="font-extrabold text-brand text-xs uppercase tracking-wide border-l-2 border-brand pl-2 py-0.5">
                    {subject}
                  </p>
                </div>

                {/* Body */}
                <div className="mt-6 text-xs text-ink/90 leading-relaxed whitespace-pre-wrap font-sans">
                  {bodyText}
                </div>
              </div>

              {/* Signatory & Footer */}
              <div className="space-y-6 pt-8">
                <div className="text-left space-y-1">
                  <p className="text-xs text-muted font-medium">Sincerely,</p>
                  {signatureUrl ? (
                    <div className="py-1">
                      <img src={signatureUrl} alt="Official Signature" className="h-12 w-auto max-w-[180px] object-contain" />
                    </div>
                  ) : (
                    <p className="font-script text-xl font-bold text-ink italic py-1">{signatoryName}</p>
                  )}
                  <p className="text-xs font-extrabold text-ink">{signatoryName}</p>
                  <p className="text-[11px] text-muted font-semibold">{signatoryTitle}</p>
                </div>

                <div className="border-t border-line pt-3 flex flex-wrap items-center justify-between text-[10px] text-muted">
                  <p>📍 12 Institutional Way, Victoria Island, Lagos, Nigeria</p>
                  <p>📞 +234 800 GAMAT FX · ✉️ support@gamatfx.com</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </AdminShell>
  );
}
