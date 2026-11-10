import { useState } from "react";
import { AdminShell } from "./AdminShell";
import { useStore } from "../../lib/store";
import {
  type AffiliateProfile,
  type PayoutRequest,
  type AffiliateCommission,
  type AffiliateSettings,
} from "../../lib/affiliate";
import {
  Users,
  DollarSign,
  TrendingUp,
  CreditCard,
  Search,
  CheckCircle2,
  XCircle,
  Clock,
  Download,
  Sliders,
  ExternalLink,
  Tag,
  ShieldCheck,
  Check,
  AlertCircle,
} from "lucide-react";
import { naira } from "../../lib/courses";

type Tab = "ambassadors" | "payouts" | "ledger" | "settings";

export function AdminAffiliates() {
  const {
    affiliateProfiles,
    payoutRequests,
    affiliateCommissions,
    affiliateSettings,
    approvePayoutRequest,
    rejectPayoutRequest,
    updateAffiliateSettings,
  } = useStore();

  const [tab, setTab] = useState<Tab>("ambassadors");
  const [search, setSearch] = useState("");
  const [payoutFilter, setPayoutFilter] = useState<"all" | "pending" | "paid" | "rejected">("all");
  const [selectedProfile, setSelectedProfile] = useState<AffiliateProfile | null>(null);
  const [settingsForm, setSettingsForm] = useState<AffiliateSettings>(affiliateSettings);
  const [settingsSaved, setSettingsSaved] = useState(false);
  const [processingId, setProcessingId] = useState<string | null>(null);

  // Stats calculations
  const totalAffiliateRevenue = affiliateCommissions.reduce((sum, c) => sum + (c.orderAmount || 0), 0);
  const totalCommissionsEarned = affiliateCommissions.reduce((sum, c) => sum + (c.commissionAmount || 0), 0);
  const totalPaidOut = payoutRequests
    .filter((p) => p.status === "paid")
    .reduce((sum, p) => sum + (p.amount || 0), 0);
  const pendingPayouts = payoutRequests.filter((p) => p.status === "pending");
  const pendingPayoutsAmount = pendingPayouts.reduce((sum, p) => sum + (p.amount || 0), 0);

  // Filtered ambassadors
  const filteredProfiles = affiliateProfiles.filter((p) => {
    const q = search.toLowerCase();
    return (
      p.userName.toLowerCase().includes(q) ||
      p.userEmail.toLowerCase().includes(q) ||
      p.referralCode.toLowerCase().includes(q)
    );
  });

  // Filtered payouts
  const filteredPayouts = payoutRequests.filter((p) => {
    if (payoutFilter !== "all" && p.status !== payoutFilter) return false;
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      p.affiliateName.toLowerCase().includes(q) ||
      p.affiliateEmail.toLowerCase().includes(q) ||
      p.details.toLowerCase().includes(q)
    );
  });

  // Handle Payout actions
  const handleApprove = async (payout: PayoutRequest) => {
    const note = window.prompt("Optional transaction reference or payout note:", "Disbursed via online banking");
    if (note === null) return;
    setProcessingId(payout.id);
    try {
      approvePayoutRequest(payout.id, note);
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (payout: PayoutRequest) => {
    const note = window.prompt("Reason for rejection:", "Incorrect bank account or details");
    if (note === null) return;
    setProcessingId(payout.id);
    try {
      rejectPayoutRequest(payout.id, note);
    } finally {
      setProcessingId(null);
    }
  };

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    updateAffiliateSettings(settingsForm);
    setSettingsSaved(true);
    setTimeout(() => setSettingsSaved(false), 2500);
  };

  // Export CSV
  const exportCsv = () => {
    const headers = ["Ambassador", "Email", "Code", "Clicks", "Signups", "Conversions", "Total Earned", "Pending Balance", "Paid Out"];
    const rows = affiliateProfiles.map((p) => [
      p.userName,
      p.userEmail,
      p.referralCode,
      p.totalClicks,
      p.totalSignups,
      p.totalConversions,
      p.totalEarned,
      p.pendingBalance,
      p.paidOut,
    ]);
    const csvContent = "data:text/csv;charset=utf-8," + [headers, ...rows].map((e) => e.join(",")).join("\n");
    const encoded = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encoded);
    link.setAttribute("download", `gamat-affiliates-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <AdminShell
      title="Affiliate & Ambassador Engine"
      subtitle="Track student referrals, commission percentages, Pinterest/Medium share cards, and withdrawal payouts."
      action={
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={exportCsv}
            className="flex items-center gap-2 rounded-xl border border-line bg-white px-4 py-2.5 text-xs font-bold text-ink hover:bg-slate-50 transition cursor-pointer"
          >
            <Download className="h-4 w-4" />
            Export CSV
          </button>
        </div>
      }
    >
      {/* Top Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="rounded-2xl border border-line bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between text-muted">
            <span className="text-xs font-bold uppercase tracking-wider">Referral Sales Revenue</span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand/10 text-brand">
              <TrendingUp className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3">
            <span className="font-display text-2xl font-extrabold text-ink">
              {naira(totalAffiliateRevenue)}
            </span>
          </div>
          <p className="mt-1 text-xs text-muted">Gross student enrollments & store sales</p>
        </div>

        <div className="rounded-2xl border border-line bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between text-muted">
            <span className="text-xs font-bold uppercase tracking-wider">Commissions Paid</span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
              <CheckCircle2 className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3">
            <span className="font-display text-2xl font-extrabold text-ink">
              {naira(totalPaidOut)}
            </span>
          </div>
          <p className="mt-1 text-xs text-muted">Disbursed to student bank / USDT accounts</p>
        </div>

        <div className="rounded-2xl border border-line bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between text-muted">
            <span className="text-xs font-bold uppercase tracking-wider">Pending Payouts</span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
              <Clock className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3">
            <span className="font-display text-2xl font-extrabold text-ink">
              {naira(pendingPayoutsAmount)}
            </span>
          </div>
          <p className="mt-1 text-xs text-muted">
            {pendingPayouts.length} withdrawal request{pendingPayouts.length === 1 ? "" : "s"} awaiting approval
          </p>
        </div>

        <div className="rounded-2xl border border-line bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between text-muted">
            <span className="text-xs font-bold uppercase tracking-wider">Active Ambassadors</span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
              <Users className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3">
            <span className="font-display text-2xl font-extrabold text-ink">
              {affiliateProfiles.length}
            </span>
          </div>
          <p className="mt-1 text-xs text-muted">Default rate: {affiliateSettings.defaultCommissionPercent}% commission</p>
        </div>
      </div>

      {/* Main Tabs Navigation */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4 border-b border-line pb-4">
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setTab("ambassadors")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
              tab === "ambassadors" ? "bg-ink text-white" : "bg-white border border-line text-ink hover:bg-slate-50"
            }`}
          >
            Ambassadors ({affiliateProfiles.length})
          </button>
          <button
            type="button"
            onClick={() => setTab("payouts")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer relative ${
              tab === "payouts" ? "bg-ink text-white" : "bg-white border border-line text-ink hover:bg-slate-50"
            }`}
          >
            Payout Requests
            {pendingPayouts.length > 0 && (
              <span className="ml-1.5 inline-flex items-center justify-center rounded-full bg-amber-500 px-1.5 py-0.5 text-[10px] font-black text-white">
                {pendingPayouts.length}
              </span>
            )}
          </button>
          <button
            type="button"
            onClick={() => setTab("ledger")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
              tab === "ledger" ? "bg-ink text-white" : "bg-white border border-line text-ink hover:bg-slate-50"
            }`}
          >
            Commission Ledger ({affiliateCommissions.length})
          </button>
          <button
            type="button"
            onClick={() => setTab("settings")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
              tab === "settings" ? "bg-ink text-white" : "bg-white border border-line text-ink hover:bg-slate-50"
            }`}
          >
            Affiliate Settings
          </button>
        </div>

        {tab !== "settings" && (
          <div className="relative min-w-[240px]">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted" />
            <input
              type="text"
              placeholder="Search ambassadors or codes..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-xl border border-line bg-white py-2 pl-9 pr-4 text-xs text-ink focus:border-brand focus:outline-none"
            />
          </div>
        )}
      </div>

      {/* TAB 1: Ambassadors List */}
      {tab === "ambassadors" && (
        <div className="rounded-2xl border border-line bg-white overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs min-w-[960px]">
              <thead className="border-b border-line bg-cream font-bold text-muted">
                <tr>
                  <th className="py-3 px-4 min-w-[220px]">Ambassador</th>
                  <th className="py-3 px-4 whitespace-nowrap">Invite Code</th>
                  <th className="py-3 px-4 whitespace-nowrap">Clicks</th>
                  <th className="py-3 px-4 whitespace-nowrap">Signups</th>
                  <th className="py-3 px-4 whitespace-nowrap">Conversions</th>
                  <th className="py-3 px-4 whitespace-nowrap">Total Earned</th>
                  <th className="py-3 px-4 whitespace-nowrap">Balance</th>
                  <th className="py-3 px-4 whitespace-nowrap">Payout Account</th>
                  <th className="py-3 px-4 text-right whitespace-nowrap w-[120px] min-w-[120px]">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {filteredProfiles.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="py-12 text-center text-muted">
                      No ambassadors found.
                    </td>
                  </tr>
                ) : (
                  filteredProfiles.map((p) => (
                    <tr key={p.userId} className="hover:bg-slate-50/80 transition">
                      <td className="py-3.5 px-4 min-w-[220px]">
                        <div className="flex items-center gap-3">
                          {p.avatar ? (
                            <img src={p.avatar} alt="" className="h-8 w-8 shrink-0 aspect-square rounded-full object-cover ring-1 ring-line" />
                          ) : (
                            <div className="h-8 w-8 shrink-0 aspect-square rounded-full bg-brand/10 text-brand font-bold flex items-center justify-center text-xs">
                              {p.userName.slice(0, 2).toUpperCase()}
                            </div>
                          )}
                          <div className="min-w-0">
                            <p className="font-bold text-ink truncate">{p.userName}</p>
                            <p className="text-[11px] text-muted truncate">{p.userEmail}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 font-mono font-bold text-brand whitespace-nowrap">
                        {p.referralCode}
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-ink whitespace-nowrap">{p.totalClicks}</td>
                      <td className="py-3.5 px-4 font-semibold text-ink whitespace-nowrap">{p.totalSignups}</td>
                      <td className="py-3.5 px-4 font-semibold text-emerald-600 whitespace-nowrap">
                        {p.totalConversions}
                      </td>
                      <td className="py-3.5 px-4 font-bold text-ink whitespace-nowrap">
                        {naira(p.totalEarned)}
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 text-amber-700">
                          {naira(p.pendingBalance)}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 max-w-[200px] truncate text-muted whitespace-nowrap" title={p.payoutDetails || "None"}>
                        {p.payoutDetails || "—"}
                      </td>
                      <td className="py-3.5 px-4 text-right whitespace-nowrap w-[120px] min-w-[120px]">
                        <button
                          type="button"
                          onClick={() => setSelectedProfile(p)}
                          className="px-2.5 py-1 rounded-lg border border-line text-xs font-bold text-ink hover:bg-slate-100 transition cursor-pointer whitespace-nowrap"
                        >
                          View Card
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: Payout Requests */}
      {tab === "payouts" && (
        <div className="space-y-4">
          {/* Subfilter */}
          <div className="flex gap-2">
            {(["all", "pending", "paid", "rejected"] as const).map((f) => (
              <button
                key={f}
                type="button"
                onClick={() => setPayoutFilter(f)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition cursor-pointer ${
                  payoutFilter === f ? "bg-brand text-white" : "bg-white border border-line text-ink hover:bg-slate-50"
                }`}
              >
                {f}
              </button>
            ))}
          </div>

          <div className="rounded-2xl border border-line bg-white overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs min-w-[1020px]">
                <thead className="border-b border-line bg-cream font-bold text-muted">
                  <tr>
                    <th className="py-3 px-4 min-w-[200px]">Ambassador</th>
                    <th className="py-3 px-4 whitespace-nowrap">Amount</th>
                    <th className="py-3 px-4 whitespace-nowrap">Method</th>
                    <th className="py-3 px-4 min-w-[200px]">Disbursement Destination</th>
                    <th className="py-3 px-4 whitespace-nowrap">Requested At</th>
                    <th className="py-3 px-4 whitespace-nowrap">Status</th>
                    <th className="py-3 px-4 text-right whitespace-nowrap w-[180px] min-w-[180px]">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line">
                  {filteredPayouts.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-muted">
                        No payout requests found.
                      </td>
                    </tr>
                  ) : (
                    filteredPayouts.map((p) => (
                      <tr key={p.id} className="hover:bg-slate-50/80 transition">
                        <td className="py-3.5 px-4 min-w-[200px]">
                          <p className="font-bold text-ink">{p.affiliateName}</p>
                          <p className="text-[11px] text-muted">{p.affiliateEmail}</p>
                        </td>
                        <td className="py-3.5 px-4 font-display text-sm font-extrabold text-ink whitespace-nowrap">
                          {naira(p.amount)}
                        </td>
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <span className="uppercase text-[11px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                            {p.method}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 font-mono text-[11px] text-ink min-w-[200px]">
                          {p.details}
                          {p.adminNote && (
                            <p className="text-[10px] text-muted font-sans mt-0.5">{p.adminNote}</p>
                          )}
                        </td>
                        <td className="py-3.5 px-4 text-muted whitespace-nowrap">
                          {new Date(p.requestedAt).toLocaleDateString()}
                        </td>
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          {p.status === "paid" && (
                            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-[11px] font-bold text-emerald-700">
                              <CheckCircle2 className="h-3 w-3" /> Paid
                            </span>
                          )}
                          {p.status === "pending" && (
                            <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-0.5 text-[11px] font-bold text-amber-700">
                              <Clock className="h-3 w-3" /> Pending
                            </span>
                          )}
                          {p.status === "rejected" && (
                            <span className="inline-flex items-center gap-1 rounded-full bg-red-50 px-2.5 py-0.5 text-[11px] font-bold text-red-700">
                              <XCircle className="h-3 w-3" /> Rejected
                            </span>
                          )}
                        </td>
                        <td className="py-3.5 px-4 text-right whitespace-nowrap w-[180px] min-w-[180px]">
                          {p.status === "pending" ? (
                            <div className="flex items-center justify-end gap-2 whitespace-nowrap">
                              <button
                                type="button"
                                disabled={processingId === p.id}
                                onClick={() => handleApprove(p)}
                                className="inline-flex items-center justify-center px-3 py-1.5 rounded-lg bg-emerald-600 text-white font-bold text-xs hover:bg-emerald-700 transition cursor-pointer whitespace-nowrap shrink-0"
                              >
                                Mark Paid
                              </button>
                              <button
                                type="button"
                                disabled={processingId === p.id}
                                onClick={() => handleReject(p)}
                                className="inline-flex items-center justify-center px-3 py-1.5 rounded-lg border border-line text-xs font-bold text-red-600 hover:bg-red-50 transition cursor-pointer whitespace-nowrap shrink-0"
                              >
                                Reject
                              </button>
                            </div>
                          ) : (
                            <span className="text-xs text-muted font-medium whitespace-nowrap">Processed</span>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: Commission Ledger */}
      {tab === "ledger" && (
        <div className="rounded-2xl border border-line bg-white overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs min-w-[920px]">
              <thead className="border-b border-line bg-cream font-bold text-muted">
                <tr>
                  <th className="py-3 px-4 whitespace-nowrap">Date</th>
                  <th className="py-3 px-4 whitespace-nowrap">Ambassador Code</th>
                  <th className="py-3 px-4 min-w-[200px]">Customer</th>
                  <th className="py-3 px-4 min-w-[220px]">Item Purchased</th>
                  <th className="py-3 px-4 whitespace-nowrap">Order Value</th>
                  <th className="py-3 px-4 whitespace-nowrap">Commission (15%)</th>
                  <th className="py-3 px-4 whitespace-nowrap">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {affiliateCommissions.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-muted">
                      No referral commissions recorded yet.
                    </td>
                  </tr>
                ) : (
                  affiliateCommissions.map((c) => (
                    <tr key={c.id} className="hover:bg-slate-50/80 transition">
                      <td className="py-3.5 px-4 text-muted whitespace-nowrap">
                        {new Date(c.createdAt).toLocaleDateString()}
                      </td>
                      <td className="py-3.5 px-4 font-mono font-bold text-brand whitespace-nowrap">
                        {c.affiliateCode}
                      </td>
                      <td className="py-3.5 px-4 min-w-[200px]">
                        <p className="font-bold text-ink">{c.customerName}</p>
                        <p className="text-[11px] text-muted">{c.customerEmail}</p>
                      </td>
                      <td className="py-3.5 px-4 min-w-[220px]">
                        <span className="capitalize text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 mr-1.5 whitespace-nowrap">
                          {c.orderType}
                        </span>
                        <span className="font-medium text-ink">{c.orderTitle}</span>
                      </td>
                      <td className="py-3.5 px-4 font-bold text-ink whitespace-nowrap">
                        {naira(c.orderAmount)}
                      </td>
                      <td className="py-3.5 px-4 font-display font-extrabold text-emerald-600 whitespace-nowrap">
                        {naira(c.commissionAmount)}
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className="capitalize px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700">
                          {c.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 4: Affiliate Settings */}
      {tab === "settings" && (
        <div className="max-w-2xl rounded-2xl border border-line bg-white p-6 sm:p-8 shadow-sm">
          <h3 className="font-display text-lg font-extrabold text-ink">
            Affiliate Program Configuration
          </h3>
          <p className="mt-1 text-xs text-muted">
            Configure commission percentages, minimum payout limits, and friend discounts.
          </p>

          <form onSubmit={handleSaveSettings} className="mt-6 space-y-5">
            <div>
              <label className="block text-xs font-bold text-ink mb-1">
                Ambassador Commission Percentage (%)
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="number"
                  min={1}
                  max={50}
                  value={settingsForm.defaultCommissionPercent}
                  onChange={(e) =>
                    setSettingsForm({ ...settingsForm, defaultCommissionPercent: Number(e.target.value) })
                  }
                  className="w-32 rounded-xl border border-line bg-cream p-2.5 text-sm font-bold text-ink focus:border-brand focus:outline-none"
                />
                <span className="text-xs text-muted">
                  Default: 15% (e.g. ₦15,000 on a ₦100,000 course sale)
                </span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-ink mb-1">
                Friend / Referred Student Welcome Discount (%)
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="number"
                  min={0}
                  max={30}
                  value={settingsForm.affiliateDiscountPercent}
                  onChange={(e) =>
                    setSettingsForm({ ...settingsForm, affiliateDiscountPercent: Number(e.target.value) })
                  }
                  className="w-32 rounded-xl border border-line bg-cream p-2.5 text-sm font-bold text-ink focus:border-brand focus:outline-none"
                />
                <span className="text-xs text-muted">
                  Applied automatically at checkout when referred by an ambassador
                </span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-ink mb-1">
                Minimum Withdrawal Payout Threshold (₦)
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="number"
                  step={1000}
                  min={1000}
                  value={settingsForm.minimumPayoutAmount}
                  onChange={(e) =>
                    setSettingsForm({ ...settingsForm, minimumPayoutAmount: Number(e.target.value) })
                  }
                  className="w-40 rounded-xl border border-line bg-cream p-2.5 text-sm font-bold text-ink focus:border-brand focus:outline-none"
                />
                <span className="text-xs text-muted">
                  Students can only request payout once balance reaches this threshold
                </span>
              </div>
            </div>

            <div className="pt-4 border-t border-line flex items-center justify-between">
              <button
                type="submit"
                className="rounded-xl bg-brand px-6 py-2.5 text-xs font-bold text-white hover:bg-brand-dark transition cursor-pointer"
              >
                Save Settings
              </button>

              {settingsSaved && (
                <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-600">
                  <Check className="h-4 w-4" /> Settings updated successfully
                </span>
              )}
            </div>
          </form>
        </div>
      )}

      {/* Modal: View Ambassador Card */}
      {selectedProfile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="relative w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-line pb-3">
              <h4 className="font-display text-base font-bold text-ink">
                Ambassador Card: {selectedProfile.userName}
              </h4>
              <button
                type="button"
                onClick={() => setSelectedProfile(null)}
                className="rounded-lg p-1 text-muted hover:bg-slate-100 hover:text-ink cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="mt-4 space-y-3 text-xs">
              <div className="rounded-2xl bg-ink p-5 text-white">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 shrink-0 aspect-square rounded-xl bg-brand text-white font-extrabold flex items-center justify-center text-sm">
                    {selectedProfile.userName.slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <h5 className="font-bold text-white text-sm">{selectedProfile.userName}</h5>
                    <p className="text-[11px] text-sky-400">{selectedProfile.badgeTitle}</p>
                    <p className="text-[10px] text-white/50">Code: {selectedProfile.referralCode}</p>
                  </div>
                </div>
                <blockquote className="mt-3 italic text-white/90 border-l-2 border-brand pl-3">
                  "{selectedProfile.personalQuote}"
                </blockquote>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-2">
                <div className="rounded-xl bg-cream p-3">
                  <p className="text-muted">Total Clicks</p>
                  <p className="text-sm font-bold text-ink">{selectedProfile.totalClicks}</p>
                </div>
                <div className="rounded-xl bg-cream p-3">
                  <p className="text-muted">Conversions</p>
                  <p className="text-sm font-bold text-emerald-600">{selectedProfile.totalConversions}</p>
                </div>
              </div>

              <div className="rounded-xl bg-cream p-3">
                <p className="text-muted">Disbursement Account Details</p>
                <p className="font-mono text-xs text-ink font-semibold mt-0.5">
                  {selectedProfile.payoutDetails || "No payout method set by student yet"}
                </p>
              </div>
            </div>

            <div className="mt-5 text-right">
              <button
                type="button"
                onClick={() => setSelectedProfile(null)}
                className="rounded-xl bg-ink px-4 py-2 text-xs font-bold text-white hover:bg-slate-800 cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminShell>
  );
}
