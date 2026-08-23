import { useState, useMemo } from "react";
import { AdminShell, Card, StatCard, Badge, exportCsv } from "./AdminShell";
import { useStore, type Payment } from "../../lib/store";
import { COURSES, totalLessons, naira } from "../../lib/courses";
import {
  BarChart3, Users, CreditCard, BookOpen, Zap, Swords,
  MessageSquare, Calendar, Download, Tag, Activity, Target,
} from "lucide-react";

type TimeRange = "all" | "30days" | "thisMonth" | "thisYear";

export function AdminAnalytics() {
  const {
    admin, enrollments, events, coupons, clubMessages, combat, forum, attempts,
  } = useStore();

  const { accounts, payments, registrations } = admin;
  const { threads, replies } = forum;

  const [range, setRange] = useState<TimeRange>("all");

  // Filter payments by time range
  const filteredPayments = useMemo(() => {
    if (range === "all") return payments;
    const now = Date.now();
    const days30 = 30 * 24 * 60 * 60 * 1000;
    return payments.filter((p: Payment) => {
      const dateStr = p.createdAt || "";
      const t = new Date(dateStr).getTime() || 0;
      if (range === "30days") return now - t <= days30;
      if (range === "thisMonth") {
        const d = new Date(dateStr);
        const curr = new Date();
        return d.getMonth() === curr.getMonth() && d.getFullYear() === curr.getFullYear();
      }
      if (range === "thisYear") {
        return new Date(dateStr).getFullYear() === new Date().getFullYear();
      }
      return true;
    });
  }, [payments, range]);

  // Financial Analytics
  const totalRevenue = useMemo(
    () => filteredPayments.filter((p: Payment) => p.status === "paid").reduce((sum: number, p: Payment) => sum + p.amount, 0),
    [filteredPayments]
  );

  const completedCount = useMemo(
    () => filteredPayments.filter((p: Payment) => p.status === "paid").length,
    [filteredPayments]
  );

  const avgOrderValue = useMemo(
    () => (completedCount ? Math.round(totalRevenue / completedCount) : 0),
    [totalRevenue, completedCount]
  );

  // Revenue by Payment Method
  const methodBreakdown = useMemo(() => {
    const map: Record<string, number> = { card: 0, transfer: 0, ussd: 0 };
    filteredPayments.forEach((p: Payment) => {
      if (p.status === "paid") {
        map[p.method] = (map[p.method] || 0) + p.amount;
      }
    });
    return map;
  }, [filteredPayments]);

  // Course Analytics
  const courseStats = useMemo(() => {
    return COURSES.map((c) => {
      const totLessons = totalLessons(c);
      const count = enrollments.filter((e) => e.courseId === c.id).length;
      const completed = enrollments.filter((e) => e.courseId === c.id && e.completedLessons.length >= totLessons).length;
      const rate = count ? Math.round((completed / count) * 100) : 0;
      const rev = payments
        .filter((p: Payment) => p.courseId === c.id && p.status === "paid")
        .reduce((sum: number, p: Payment) => sum + p.amount, 0);
      return { id: c.id, title: c.title, count, completed, rate, rev };
    }).sort((a, b) => b.count - a.count);
  }, [enrollments, payments]);

  // Quiz Analytics
  const quizMetrics = useMemo(() => {
    const total = attempts.length;
    const passed = attempts.filter((a) => a.passed).length;
    const passRate = total ? Math.round((passed / total) * 100) : 0;
    const avgScore = total ? Math.round(attempts.reduce((sum: number, a) => sum + a.score, 0) / total) : 0;
    return { total, passed, failed: total - passed, passRate, avgScore };
  }, [attempts]);

  // Event Analytics
  const eventMetrics = useMemo(() => {
    const totalEvents = events.length;
    const totalRegs = registrations.length;
    const totalCapacity = events.reduce((sum: number, e) => sum + e.capacity, 0);
    const occupancyRate = totalCapacity ? Math.round((totalRegs / totalCapacity) * 100) : 0;
    return { totalEvents, totalRegs, totalCapacity, occupancyRate };
  }, [events, registrations]);

  // Community Analytics
  const communityMetrics = useMemo(() => {
    const totalThreads = threads.length;
    const totalReplies = replies.length;
    const totalClubMsgs = clubMessages.length;
    const totalPredictions = Object.values(combat || {}).reduce(
      (acc: number, userPreds) => acc + (Array.isArray(userPreds) ? userPreds.length : 0),
      0
    );
    return { totalThreads, totalReplies, totalClubMsgs, totalPredictions };
  }, [threads, replies, clubMessages, combat]);

  // Coupon Analytics
  const couponMetrics = useMemo(() => {
    const totalUsed = coupons.reduce((sum: number, c) => sum + c.usedCount, 0);
    const activeCount = coupons.filter((c) => c.status === "active").length;
    return { totalCoupons: coupons.length, activeCount, totalUsed };
  }, [coupons]);

  const handleExport = () => {
    const reportData = [
      { Metric: "Total Revenue", Value: naira(totalRevenue) },
      { Metric: "Completed Transactions", Value: completedCount },
      { Metric: "Average Order Value", Value: naira(avgOrderValue) },
      { Metric: "Total Registered Students", Value: accounts.length },
      { Metric: "Total Enrollments", Value: enrollments.length },
      { Metric: "Quiz Attempts", Value: quizMetrics.total },
      { Metric: "Quiz Pass Rate", Value: `${quizMetrics.passRate}%` },
      { Metric: "Event Registrations", Value: eventMetrics.totalRegs },
      { Metric: "Event Occupancy Rate", Value: `${eventMetrics.occupancyRate}%` },
      { Metric: "Forum Threads", Value: communityMetrics.totalThreads },
      { Metric: "Forum Replies", Value: communityMetrics.totalReplies },
      { Metric: "Club Discussion Messages", Value: communityMetrics.totalClubMsgs },
      { Metric: "Coupon Redemptions", Value: couponMetrics.totalUsed },
    ];
    exportCsv("gamat_analytics_report.csv", reportData);
  };

  return (
    <AdminShell
      title="Analytics & Intelligence"
      subtitle="Deep real-time performance insights across revenue, enrollments, quizzes, events, and community engagement."
      action={
        <div className="flex flex-wrap items-center gap-3">
          {/* Time Range Filter Selector */}
          <div className="flex items-center rounded-xl border border-line bg-cream p-1 text-xs font-semibold">
            {(["all", "30days", "thisMonth", "thisYear"] as TimeRange[]).map((r) => (
              <button
                key={r}
                onClick={() => setRange(r)}
                className={`rounded-lg px-3 py-1.5 transition-all ${
                  range === r ? "bg-brand text-white shadow-xs font-bold" : "text-muted hover:text-ink"
                }`}
              >
                {r === "all" ? "All Time" : r === "30days" ? "30 Days" : r === "thisMonth" ? "This Month" : "This Year"}
              </button>
            ))}
          </div>

          <button onClick={handleExport} className="btn-primary !py-2.5">
            <Download className="h-4 w-4" /> Export Report
          </button>
        </div>
      }
    >
      {/* KPI Top Cards Grid */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard icon={CreditCard} label="Total Gross Revenue" value={naira(totalRevenue)} sub="Verified completed sales" />
        <StatCard icon={Users} label="Registered Students" value={accounts.length} sub="Active learner profiles" />
        <StatCard icon={BookOpen} label="Total Enrollments" value={enrollments.length} sub="Across all courses & mentorships" />
        <StatCard icon={Activity} label="Avg Order Value" value={naira(avgOrderValue)} sub="Per transaction" />
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-2">
        {/* Revenue & Payment Method Analytics */}
        <Card className="p-6">
          <div className="flex items-center justify-between border-b border-line pb-4">
            <div>
              <h2 className="font-display text-lg font-bold text-ink flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-brand" /> Revenue by Payment Method
              </h2>
              <p className="text-xs text-muted">Distribution of sales across Card, Bank Transfer, and USSD.</p>
            </div>
            <Badge tone="green">Real-time</Badge>
          </div>

          <div className="mt-6 space-y-5">
            {[
              { label: "Debit / Credit Card", method: "card", color: "bg-brand", amount: methodBreakdown.card },
              { label: "Bank Transfer", method: "transfer", color: "bg-blue-600", amount: methodBreakdown.transfer },
              { label: "USSD Code", method: "ussd", color: "bg-amber-500", amount: methodBreakdown.ussd },
            ].map((item) => {
              const pct = totalRevenue ? Math.round((item.amount / totalRevenue) * 100) : 0;
              return (
                <div key={item.method} className="space-y-1.5">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-ink flex items-center gap-2">
                      <span className={`h-2.5 w-2.5 rounded-full ${item.color}`} />
                      {item.label}
                    </span>
                    <span className="font-bold text-ink">
                      {naira(item.amount)} <span className="text-muted font-normal">({pct}%)</span>
                    </span>
                  </div>
                  <div className="h-2.5 w-full overflow-hidden rounded-full bg-cream">
                    <div
                      className={`h-full ${item.color} transition-all duration-500 rounded-full`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-6 rounded-xl border border-line bg-cream p-4 flex items-center justify-between text-xs">
            <span className="text-muted font-medium">Completed Transactions:</span>
            <span className="font-extrabold text-ink text-sm">{completedCount} Sales</span>
          </div>
        </Card>

        {/* Top Courses Leaderboard */}
        <Card className="p-6">
          <div className="flex items-center justify-between border-b border-line pb-4">
            <div>
              <h2 className="font-display text-lg font-bold text-ink flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-brand" /> Course Enrollment Leaderboard
              </h2>
              <p className="text-xs text-muted">Most popular courses and student completion rates.</p>
            </div>
            <Badge tone="gray">{courseStats.length} Courses</Badge>
          </div>

          <div className="mt-6 divide-y divide-line">
            {courseStats.map((c) => (
              <div key={c.id} className="py-3 first:pt-0 last:pb-0 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-ink line-clamp-1">{c.title}</span>
                  <span className="font-extrabold text-brand shrink-0">{c.count} Enrolled</span>
                </div>

                <div className="flex items-center gap-3">
                  <div className="h-2 flex-1 overflow-hidden rounded-full bg-cream">
                    <div
                      className="h-full bg-brand rounded-full transition-all duration-500"
                      style={{ width: `${Math.min(100, c.count * 15)}%` }}
                    />
                  </div>
                  <span className="text-[11px] font-semibold text-muted shrink-0">
                    {c.completed} Finished ({c.rate}%)
                  </span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Quiz, Events & Community Intelligence Row */}
      <div className="mt-8 grid gap-8 lg:grid-cols-3">
        {/* Quiz & Examination Performance */}
        <Card className="p-6">
          <div className="flex items-center justify-between border-b border-line pb-4">
            <h3 className="font-display text-base font-bold text-ink flex items-center gap-2">
              <Zap className="h-5 w-5 text-amber-500" /> Quiz & Assessment Metrics
            </h3>
          </div>

          <div className="mt-6 space-y-4">
            <div className="flex items-center justify-between rounded-xl bg-cream p-3 text-xs">
              <span className="text-muted font-medium">Total Quiz Attempts:</span>
              <span className="font-extrabold text-ink text-sm">{quizMetrics.total}</span>
            </div>
            <div className="flex items-center justify-between rounded-xl bg-cream p-3 text-xs">
              <span className="text-muted font-medium">Pass Rate:</span>
              <span className="font-extrabold text-emerald-600 text-sm">{quizMetrics.passRate}%</span>
            </div>
            <div className="flex items-center justify-between rounded-xl bg-cream p-3 text-xs">
              <span className="text-muted font-medium">Average Score:</span>
              <span className="font-extrabold text-brand text-sm">{quizMetrics.avgScore}%</span>
            </div>

            <div className="space-y-1 pt-2">
              <div className="flex justify-between text-xs text-muted font-semibold">
                <span>Pass vs Fail Ratio</span>
                <span>{quizMetrics.passed} Pass / {quizMetrics.failed} Fail</span>
              </div>
              <div className="flex h-3 w-full overflow-hidden rounded-full bg-rose-100">
                <div
                  className="h-full bg-emerald-500 transition-all duration-500"
                  style={{ width: `${quizMetrics.passRate}%` }}
                />
              </div>
            </div>
          </div>
        </Card>

        {/* Live Events & Workshops Capacity */}
        <Card className="p-6">
          <div className="flex items-center justify-between border-b border-line pb-4">
            <h3 className="font-display text-base font-bold text-ink flex items-center gap-2">
              <Calendar className="h-5 w-5 text-brand" /> Live Event Occupancy
            </h3>
          </div>

          <div className="mt-6 space-y-4">
            <div className="flex items-center justify-between rounded-xl bg-cream p-3 text-xs">
              <span className="text-muted font-medium">Total Workshops & Events:</span>
              <span className="font-extrabold text-ink text-sm">{eventMetrics.totalEvents}</span>
            </div>
            <div className="flex items-center justify-between rounded-xl bg-cream p-3 text-xs">
              <span className="text-muted font-medium">Seats Registered:</span>
              <span className="font-extrabold text-ink text-sm">{eventMetrics.totalRegs}</span>
            </div>
            <div className="flex items-center justify-between rounded-xl bg-cream p-3 text-xs">
              <span className="text-muted font-medium">Total Hall Capacity:</span>
              <span className="font-extrabold text-ink text-sm">{eventMetrics.totalCapacity} Seats</span>
            </div>

            <div className="space-y-1 pt-2">
              <div className="flex justify-between text-xs text-muted font-semibold">
                <span>Seat Occupancy Rate</span>
                <span className="font-bold text-brand">{eventMetrics.occupancyRate}%</span>
              </div>
              <div className="h-3 w-full overflow-hidden rounded-full bg-cream border border-line">
                <div
                  className="h-full bg-gradient-to-r from-brand to-rose-600 transition-all duration-500 rounded-full"
                  style={{ width: `${eventMetrics.occupancyRate}%` }}
                />
              </div>
            </div>
          </div>
        </Card>

        {/* Community & Fun Zone Engagement */}
        <Card className="p-6">
          <div className="flex items-center justify-between border-b border-line pb-4">
            <h3 className="font-display text-base font-bold text-ink flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-purple-600" /> Community Velocity
            </h3>
          </div>

          <div className="mt-6 space-y-3.5">
            <div className="flex items-center justify-between rounded-xl bg-cream p-3 text-xs">
              <span className="text-muted font-medium flex items-center gap-2">
                <MessageSquare className="h-4 w-4 text-brand" /> Forum Threads & Replies:
              </span>
              <span className="font-extrabold text-ink text-sm">
                {communityMetrics.totalThreads} / {communityMetrics.totalReplies}
              </span>
            </div>

            <div className="flex items-center justify-between rounded-xl bg-cream p-3 text-xs">
              <span className="text-muted font-medium flex items-center gap-2">
                <Swords className="h-4 w-4 text-amber-500" /> Club Chat Messages:
              </span>
              <span className="font-extrabold text-ink text-sm">{communityMetrics.totalClubMsgs}</span>
            </div>

            <div className="flex items-center justify-between rounded-xl bg-cream p-3 text-xs">
              <span className="text-muted font-medium flex items-center gap-2">
                <Target className="h-4 w-4 text-emerald-600" /> Market Combat Predictions:
              </span>
              <span className="font-extrabold text-ink text-sm">{communityMetrics.totalPredictions}</span>
            </div>

            <div className="flex items-center justify-between rounded-xl bg-cream p-3 text-xs">
              <span className="text-muted font-medium flex items-center gap-2">
                <Tag className="h-4 w-4 text-amber-500" /> Coupon Redemptions:
              </span>
              <span className="font-extrabold text-ink text-sm">{couponMetrics.totalUsed} Used</span>
            </div>
          </div>
        </Card>
      </div>
    </AdminShell>
  );
}
