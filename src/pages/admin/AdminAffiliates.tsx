import { useState, useEffect } from "react";
import { AdminShell } from "./AdminShell";
import { useStore } from "../../lib/store";
import {
  type AffiliateProfile,
  type PayoutRequest,
  type AffiliateCommission,
  type AffiliateSettings,
  getSignupReferralUrl,
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
  Eye,
  Copy,
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
  const [copiedDetails, setCopiedDetails] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  useEffect(() => {
    setSettingsForm(affiliateSettings);
  }, [affiliateSettings]);

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
        <div className="flex gap-2 w-full sm:w-auto overflow-x-auto no-scrollbar touch-pan-x pb-1 sm:pb-0">
          <button
            type="button"
            onClick={() => setTab("ambassadors")}
            className={`px-3.5 sm:px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer whitespace-nowrap shrink-0 ${
              tab === "ambassadors" ? "bg-ink text-white" : "bg-white border border-line text-ink hover:bg-slate-50"
            }`}
          >
            Ambassadors ({affiliateProfiles.length})
          </button>
          <button
            type="button"
            onClick={() => setTab("payouts")}
            className={`px-3.5 sm:px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer relative whitespace-nowrap shrink-0 ${
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
            className={`px-3.5 sm:px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer whitespace-nowrap shrink-0 ${
              tab === "ledger" ? "bg-ink text-white" : "bg-white border border-line text-ink hover:bg-slate-50"
            }`}
          >
            Commission Ledger ({affiliateCommissions.length})
          </button>
          <button
            type="button"
            onClick={() => setTab("settings")}
            className={`px-3.5 sm:px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer whitespace-nowrap shrink-0 ${
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
                  <th className="py-3 px-4 text-right whitespace-nowrap w-[140px] min-w-[140px]">Action</th>
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
                            <p className="font-bold text-ink truncate">
                              {p.cardDisplayName || p.userName}
                              {p.cardDisplayName && p.cardDisplayName !== p.userName && (
                                <span className="ml-1 text-[10px] font-normal text-muted">({p.userName})</span>
                              )}
                            </p>
                            <p className="text-[11px] text-muted truncate">{p.userEmail}</p>
                            {p.enrolledCourseTitle && (
                              <span className="inline-block mt-0.5 rounded bg-cream px-1.5 py-0.5 text-[10px] font-semibold text-slate-600 border border-line truncate max-w-[200px]">
                                {p.enrolledCourseTitle}
                              </span>
                            )}
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
                      <td className="py-3.5 px-4 text-right whitespace-nowrap w-[140px] min-w-[140px]">
                        <button
                          type="button"
                          onClick={() => setSelectedProfile(p)}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-line text-xs font-bold text-ink hover:bg-slate-100 hover:border-brand/40 transition cursor-pointer whitespace-nowrap"
                        >
                          <Eye className="h-3.5 w-3.5 text-brand" /> View Details
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
                  <th className="py-3 px-4 whitespace-nowrap">Commission ({affiliateSettings.defaultCommissionPercent || 15}%)</th>
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

      {/* Bottom-to-Top Flyout: Ambassador Details */}
      {selectedProfile && (
        <div className="fixed inset-0 z-50 flex items-end justify-center">
          {/* Backdrop */}
          <div
            aria-hidden="true"
            onClick={() => setSelectedProfile(null)}
            className="fixed inset-0 bg-ink/50 backdrop-blur-xs transition-opacity duration-300"
          />

          {/* Bottom Sheet Flyout */}
          <div className="relative z-10 w-full rounded-t-3xl border-t border-line bg-white shadow-[0_-20px_50px_-15px_rgba(22,24,28,0.25)] flex flex-col max-h-[85vh]">
            {/* Grab handle */}
            <div className="pt-3 pb-1 flex justify-center">
              <div className="w-10 h-1 rounded-full bg-slate-300" />
            </div>

            {/* Header matching website style */}
            <div className="flex items-center justify-between border-b border-line px-6 py-4">
              <div className="flex items-center gap-3 min-w-0">
                {selectedProfile.avatar ? (
                  <img
                    src={selectedProfile.avatar}
                    alt=""
                    className="h-11 w-11 shrink-0 rounded-full object-cover ring-1 ring-line"
                  />
                ) : (
                  <div className="h-11 w-11 shrink-0 rounded-full bg-brand text-white font-bold flex items-center justify-center text-xs">
                    {(selectedProfile.cardDisplayName || selectedProfile.userName).slice(0, 2).toUpperCase()}
                  </div>
                )}
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h4 className="font-display text-base font-bold text-ink truncate">
                      {selectedProfile.cardDisplayName || selectedProfile.userName}
                    </h4>
                    <span className="rounded-full bg-cream border border-line px-2 py-0.5 text-[10px] font-semibold text-muted">
                      {selectedProfile.enrolledCourseTitle || "Forex Foundations"}
                    </span>
                  </div>
                  <p className="text-xs text-muted truncate">{selectedProfile.userEmail}</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    const url = getSignupReferralUrl(selectedProfile.referralCode);
                    navigator.clipboard.writeText(url);
                    setCopiedLink(true);
                    setTimeout(() => setCopiedLink(false), 2000);
                  }}
                  className="hidden sm:inline-flex items-center gap-1.5 rounded-full border border-line bg-cream px-3 py-1.5 text-xs font-semibold text-ink hover:text-brand hover:border-brand transition cursor-pointer"
                >
                  {copiedLink ? (
                    <>
                      <Check className="h-3.5 w-3.5 text-emerald-600" /> Copied Link
                    </>
                  ) : (
                    <>
                      <Copy className="h-3.5 w-3.5 text-brand" /> Copy Link
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedProfile(null)}
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-line bg-white text-muted hover:text-ink hover:bg-cream transition cursor-pointer"
                  aria-label="Close"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Content matching website design */}
            <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6 max-w-4xl mx-auto w-full">
              {/* Financial Balances & Referral Code Strip */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="rounded-2xl border border-line bg-white p-4 shadow-xs">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-muted">Total Earned</p>
                  <p className="font-display text-2xl font-extrabold text-ink mt-1">
                    {naira(selectedProfile.totalEarned)}
                  </p>
                  <p className="text-[11px] text-muted mt-0.5">Accrued referral earnings</p>
                </div>

                <div className="rounded-2xl border border-line bg-white p-4 shadow-xs">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-muted">Available Balance</p>
                  <p className="font-display text-2xl font-extrabold text-brand mt-1">
                    {naira(selectedProfile.pendingBalance)}
                  </p>
                  <p className="text-[11px] text-muted mt-0.5">Pending disbursement</p>
                </div>

                <div className="rounded-2xl border border-line bg-cream p-4 shadow-xs flex flex-col justify-between">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-muted">Referral Code</p>
                    <p className="font-mono text-base font-bold text-ink mt-1">
                      {selectedProfile.referralCode}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      const url = getSignupReferralUrl(selectedProfile.referralCode);
                      navigator.clipboard.writeText(url);
                      setCopiedLink(true);
                      setTimeout(() => setCopiedLink(false), 2000);
                    }}
                    className="mt-2 sm:hidden inline-flex items-center justify-center gap-1.5 rounded-full border border-line bg-white px-3 py-1.5 text-xs font-semibold text-ink"
                  >
                    {copiedLink ? "Copied!" : "Copy Link"}
                  </button>
                </div>
              </div>

              {/* Performance Metrics: Clean 4-Column Bar */}
              <div className="rounded-2xl border border-line bg-white p-4 shadow-xs">
                <p className="text-[11px] font-bold uppercase tracking-wider text-muted mb-3">
                  Referral Performance
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 divide-y sm:divide-y-0 sm:divide-x divide-line/70">
                  <div className="pt-2 sm:pt-0 sm:px-3 text-center sm:text-left">
                    <p className="text-xs text-muted">Total Clicks</p>
                    <p className="font-display text-xl font-bold text-ink mt-1">{selectedProfile.totalClicks}</p>
                  </div>
                  <div className="pt-2 sm:pt-0 sm:px-3 text-center sm:text-left">
                    <p className="text-xs text-muted">Signups</p>
                    <p className="font-display text-xl font-bold text-ink mt-1">{selectedProfile.totalSignups}</p>
                  </div>
                  <div className="pt-2 sm:pt-0 sm:px-3 text-center sm:text-left">
                    <p className="text-xs text-muted">Paid Orders</p>
                    <p className="font-display text-xl font-bold text-emerald-600 mt-1">{selectedProfile.totalConversions}</p>
                  </div>
                  <div className="pt-2 sm:pt-0 sm:px-3 text-center sm:text-left">
                    <p className="text-xs text-muted">Conversion Rate</p>
                    <p className="font-display text-xl font-bold text-ink mt-1">
                      {selectedProfile.totalClicks > 0
                        ? `${((selectedProfile.totalConversions / selectedProfile.totalClicks) * 100).toFixed(1)}%`
                        : "0%"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Payout Destination */}
              <div className="rounded-2xl border border-line bg-white p-4 shadow-xs">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <CreditCard className="h-4 w-4 text-brand" />
                    <p className="font-bold text-ink text-xs sm:text-sm">Disbursement Account Details</p>
                  </div>
                  {selectedProfile.payoutDetails && (
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard.writeText(selectedProfile.payoutDetails || "");
                        setCopiedDetails(true);
                        setTimeout(() => setCopiedDetails(false), 2000);
                      }}
                      className="inline-flex items-center gap-1 text-xs font-semibold text-brand hover:underline cursor-pointer"
                    >
                      {copiedDetails ? (
                        <>
                          <Check className="h-3.5 w-3.5 text-emerald-600" /> Copied!
                        </>
                      ) : (
                        <>
                          <Copy className="h-3.5 w-3.5" /> Copy Details
                        </>
                      )}
                    </button>
                  )}
                </div>
                <div className="font-mono text-xs sm:text-sm text-ink font-semibold bg-cream p-3 rounded-xl border border-line select-all">
                  {selectedProfile.payoutDetails || "No payout method configured by student yet."}
                </div>
              </div>

              {/* Quote if present */}
              {selectedProfile.personalQuote && (
                <div className="rounded-xl border border-line/60 bg-cream/30 p-3 text-center text-xs text-muted italic">
                  "{selectedProfile.personalQuote}"
                </div>
              )}
            </div>

            {/* Bottom Bar */}
            <div className="border-t border-line bg-cream px-6 py-3.5 flex items-center justify-end">
              <button
                type="button"
                onClick={() => setSelectedProfile(null)}
                className="rounded-full bg-ink px-6 py-2 text-xs font-bold text-white hover:bg-slate-800 transition cursor-pointer"
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
