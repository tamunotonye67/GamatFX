import { supabase } from "./supabase";
import type {
  Enrollment,
  Payment,
  EventItem,
  Registration,
  ForumThread,
  ForumReply,
  TradingClub,
  ClubMessage,
  NewsItem,
  OutlookItem,
  ServiceEnquiry,
  Coupon,
  Giveaway,
  StudentOfTheWeek,
  ReviewItem,
} from "./store";

/* ============================================================================
 * 1. ENROLLMENTS & PAYMENTS
 * ============================================================================ */

export async function fetchSupabaseEnrollments(): Promise<Enrollment[]> {
  try {
    const { data, error } = await supabase.from("enrollments").select("*");
    if (error || !data) return [];
    return data.map((r: any) => ({
      id: r.id,
      userId: r.user_id,
      courseId: r.course_id,
      enrolledAt: r.enrolled_at || new Date().toISOString(),
      completedLessons: Array.isArray(r.completed_lessons) ? r.completed_lessons : [],
      lastLessonId: r.last_lesson_id || undefined,
    }));
  } catch {
    return [];
  }
}

export async function saveSupabaseEnrollment(e: Enrollment): Promise<void> {
  try {
    await supabase.from("enrollments").upsert({
      id: e.id,
      user_id: e.userId,
      course_id: e.courseId,
      enrolled_at: e.enrolledAt,
      completed_lessons: e.completedLessons ?? [],
      last_lesson_id: e.lastLessonId ?? null,
    }, { onConflict: "id" });
  } catch (err) {
    console.warn("Supabase enrollment save notice:", err);
  }
}

export async function deleteSupabaseEnrollment(id: string): Promise<void> {
  try {
    await supabase.from("enrollments").delete().eq("id", id);
  } catch (err) {
    console.warn("Supabase enrollment delete notice:", err);
  }
}

export async function fetchSupabasePayments(): Promise<Payment[]> {
  try {
    const { data, error } = await supabase.from("payments").select("*").order("created_at", { ascending: false });
    if (error || !data) return [];
    return data.map((r: any) => ({
      id: r.id,
      ref: r.ref,
      userId: r.user_id,
      userName: r.user_name || "Student",
      userEmail: r.user_email || "",
      courseId: r.course_id,
      courseTitle: r.course_title || "",
      subtotal: Number(r.subtotal || r.amount || 0),
      vat: Number(r.vat || 0),
      discount: Number(r.discount || 0),
      amount: Number(r.amount || 0),
      method: r.method || "card",
      coupon: r.coupon || undefined,
      status: r.status || "paid",
      createdAt: r.created_at || new Date().toISOString(),
    }));
  } catch {
    return [];
  }
}

export async function saveSupabasePayment(p: Payment): Promise<void> {
  try {
    await supabase.from("payments").upsert({
      id: p.id,
      ref: p.ref,
      user_id: p.userId,
      user_name: p.userName,
      user_email: p.userEmail,
      course_id: p.courseId,
      course_title: p.courseTitle,
      subtotal: p.subtotal,
      vat: p.vat,
      discount: p.discount,
      amount: p.amount,
      method: p.method,
      coupon: p.coupon ?? null,
      status: p.status,
      created_at: p.createdAt,
    }, { onConflict: "id" });
  } catch (err) {
    console.warn("Supabase payment save notice:", err);
  }
}

export async function deleteSupabasePayment(id: string): Promise<void> {
  try {
    await supabase.from("payments").delete().eq("id", id);
  } catch (err) {
    console.warn("Supabase payment delete notice:", err);
  }
}

/* ============================================================================
 * 2. EVENTS & REGISTRATIONS
 * ============================================================================ */

export async function fetchSupabaseEvents(): Promise<EventItem[]> {
  try {
    const { data, error } = await supabase.from("events").select("*");
    if (error || !data) return [];
    return data.map((r: any) => ({
      id: r.id,
      title: r.title,
      description: r.description || "",
      type: r.type || "Online",
      month: r.month || "August",
      day: r.day || "10",
      year: r.year || "2026",
      time: r.time || "",
      location: r.location || "",
      capacity: Number(r.capacity || 100),
      price: Number(r.price || 0),
      status: r.status || "published",
      featured: !!r.featured,
    }));
  } catch {
    return [];
  }
}

export async function saveSupabaseEvent(e: EventItem): Promise<void> {
  try {
    await supabase.from("events").upsert({
      id: e.id,
      title: e.title,
      description: e.description,
      type: e.type,
      month: e.month,
      day: e.day,
      year: e.year,
      time: e.time,
      location: e.location,
      capacity: e.capacity,
      price: e.price,
      status: e.status,
      featured: !!e.featured,
    }, { onConflict: "id" });
  } catch (err) {
    console.warn("Supabase event save notice:", err);
  }
}

export async function deleteSupabaseEvent(id: string): Promise<void> {
  try {
    await supabase.from("events").delete().eq("id", id);
  } catch (err) {
    console.warn("Supabase event delete notice:", err);
  }
}

export async function fetchSupabaseRegistrations(): Promise<Registration[]> {
  try {
    const { data, error } = await supabase.from("registrations").select("*");
    if (error || !data) return [];
    return data.map((r: any) => ({
      id: r.id,
      eventId: r.event_id,
      eventTitle: r.event_title || "",
      eventDate: r.event_date || "",
      userId: r.user_id || undefined,
      name: r.name || "",
      email: r.email || "",
      phone: r.phone || "",
      ticket: r.ticket || "General",
      status: r.status || "confirmed",
      createdAt: r.created_at || new Date().toISOString(),
    }));
  } catch {
    return [];
  }
}

export async function saveSupabaseRegistration(reg: Registration): Promise<void> {
  try {
    await supabase.from("registrations").upsert({
      id: reg.id,
      event_id: reg.eventId,
      event_title: reg.eventTitle,
      event_date: reg.eventDate,
      user_id: reg.userId ?? null,
      name: reg.name,
      email: reg.email,
      phone: reg.phone,
      ticket: reg.ticket,
      status: reg.status,
      created_at: reg.createdAt,
    }, { onConflict: "id" });
  } catch (err) {
    console.warn("Supabase registration save notice:", err);
  }
}

/* ============================================================================
 * 3. FORUM THREADS & REPLIES
 * ============================================================================ */

export async function fetchSupabaseThreads(): Promise<ForumThread[]> {
  try {
    const { data, error } = await supabase.from("forum_threads").select("*").order("created_at", { ascending: false });
    if (error || !data) return [];
    return data.map((r: any) => ({
      id: r.id,
      channelId: r.channel_id,
      title: r.title,
      body: r.body,
      image: r.image || undefined,
      authorId: r.author_id,
      authorName: r.author_name,
      authorAvatar: r.author_avatar || undefined,
      authorRole: r.author_role || "student",
      likes: Array.isArray(r.likes) ? r.likes : [],
      pinned: !!r.pinned,
      createdAt: r.created_at || new Date().toISOString(),
    }));
  } catch {
    return [];
  }
}

export async function saveSupabaseThread(t: ForumThread): Promise<void> {
  try {
    await supabase.from("forum_threads").upsert({
      id: t.id,
      channel_id: t.channelId,
      title: t.title,
      body: t.body,
      image: t.image ?? null,
      author_id: t.authorId,
      author_name: t.authorName,
      author_avatar: t.authorAvatar ?? null,
      author_role: t.authorRole,
      likes: t.likes ?? [],
      pinned: !!t.pinned,
      created_at: t.createdAt,
    }, { onConflict: "id" });
  } catch (err) {
    console.warn("Supabase thread save notice:", err);
  }
}

export async function deleteSupabaseThread(id: string): Promise<void> {
  try {
    await supabase.from("forum_threads").delete().eq("id", id);
  } catch (err) {
    console.warn("Supabase thread delete notice:", err);
  }
}

export async function fetchSupabaseReplies(): Promise<ForumReply[]> {
  try {
    const { data, error } = await supabase.from("forum_replies").select("*").order("created_at", { ascending: true });
    if (error || !data) return [];
    return data.map((r: any) => ({
      id: r.id,
      threadId: r.thread_id,
      authorId: r.author_id,
      authorName: r.author_name,
      authorAvatar: r.author_avatar || undefined,
      authorRole: r.author_role || "student",
      body: r.body,
      image: r.image || undefined,
      likes: Array.isArray(r.likes) ? r.likes : [],
      createdAt: r.created_at || new Date().toISOString(),
    }));
  } catch {
    return [];
  }
}

export async function saveSupabaseReply(r: ForumReply): Promise<void> {
  try {
    await supabase.from("forum_replies").upsert({
      id: r.id,
      thread_id: r.threadId,
      author_id: r.authorId,
      author_name: r.authorName,
      author_avatar: r.authorAvatar ?? null,
      author_role: r.authorRole,
      body: r.body,
      image: r.image ?? null,
      likes: r.likes ?? [],
      created_at: r.createdAt,
    }, { onConflict: "id" });
  } catch (err) {
    console.warn("Supabase reply save notice:", err);
  }
}

export async function deleteSupabaseReply(id: string): Promise<void> {
  try {
    await supabase.from("forum_replies").delete().eq("id", id);
  } catch (err) {
    console.warn("Supabase reply delete notice:", err);
  }
}

/* ============================================================================
 * 4. TRADING CLUBS & CLUB MESSAGES
 * ============================================================================ */

export async function fetchSupabaseClubs(): Promise<TradingClub[]> {
  try {
    const { data, error } = await supabase.from("trading_clubs").select("*");
    if (error || !data) return [];
    return data.map((r: any) => ({
      id: r.id,
      name: r.name,
      tagline: r.tagline || "",
      description: r.description || "",
      focus: r.focus || "Trading",
      emblem: r.emblem || "Shield",
      color: r.color || "#dc3545",
      leaderId: r.leader_id,
      leaderName: r.leader_name,
      leaderAvatar: r.leader_avatar || undefined,
      maxMembers: 10,
      members: Array.isArray(r.members) ? r.members : [],
      createdAt: r.created_at || new Date().toISOString(),
    }));
  } catch {
    return [];
  }
}

export async function saveSupabaseClub(c: TradingClub): Promise<void> {
  try {
    await supabase.from("trading_clubs").upsert({
      id: c.id,
      name: c.name,
      tagline: c.tagline,
      description: c.description,
      focus: c.focus,
      emblem: c.emblem,
      color: c.color,
      leader_id: c.leaderId,
      leader_name: c.leaderName,
      leader_avatar: c.leaderAvatar ?? null,
      members: c.members ?? [],
      created_at: c.createdAt,
    }, { onConflict: "id" });
  } catch (err) {
    console.warn("Supabase club save notice:", err);
  }
}

export async function fetchSupabaseClubMessages(): Promise<ClubMessage[]> {
  try {
    const { data, error } = await supabase.from("club_messages").select("*").order("created_at", { ascending: true });
    if (error || !data) return [];
    return data.map((r: any) => ({
      id: r.id,
      clubId: r.club_id,
      userId: r.user_id,
      userName: r.user_name,
      userAvatar: r.user_avatar || undefined,
      userRole: r.user_role || "member",
      content: r.content,
      image: r.image || undefined,
      likes: Array.isArray(r.likes) ? r.likes : [],
      dislikes: Array.isArray(r.dislikes) ? r.dislikes : [],
      emojis: r.emojis || {},
      replyToId: r.reply_to_id || undefined,
      replyToName: r.reply_to_name || undefined,
      createdAt: r.created_at || new Date().toISOString(),
    }));
  } catch {
    return [];
  }
}

export async function saveSupabaseClubMessage(m: ClubMessage): Promise<void> {
  try {
    await supabase.from("club_messages").upsert({
      id: m.id,
      club_id: m.clubId,
      user_id: m.userId,
      user_name: m.userName,
      user_avatar: m.userAvatar ?? null,
      user_role: m.userRole,
      content: m.content,
      image: m.image ?? null,
      likes: m.likes ?? [],
      dislikes: m.dislikes ?? [],
      emojis: m.emojis ?? {},
      reply_to_id: m.replyToId ?? null,
      reply_to_name: m.replyToName ?? null,
      created_at: m.createdAt,
    }, { onConflict: "id" });
  } catch (err) {
    console.warn("Supabase club message save notice:", err);
  }
}

/* ============================================================================
 * 5. NEWS & OUTLOOKS
 * ============================================================================ */

export async function fetchSupabaseNews(): Promise<NewsItem[]> {
  try {
    const { data, error } = await supabase.from("news").select("*").order("created_at", { ascending: false });
    if (error || !data) return [];
    return data.map((r: any) => ({
      id: r.id,
      title: r.title,
      summary: r.summary,
      body: r.body,
      source: r.source || "GAMAT Market Desk",
      impact: r.impact || "medium",
      pair: r.pair || undefined,
      status: r.status || "published",
      authorId: r.author_id || undefined,
      authorName: r.author_name || undefined,
      image: r.image || undefined,
      publishedAt: r.published_at || r.created_at,
      createdAt: r.created_at,
    }));
  } catch {
    return [];
  }
}

export async function saveSupabaseNews(n: NewsItem): Promise<void> {
  try {
    await supabase.from("news").upsert({
      id: n.id,
      title: n.title,
      summary: n.summary,
      body: n.body,
      source: n.source,
      impact: n.impact,
      pair: n.pair ?? null,
      status: n.status,
      author_id: n.authorId ?? null,
      author_name: n.authorName ?? null,
      image: n.image ?? null,
      published_at: n.publishedAt,
      created_at: n.createdAt,
    }, { onConflict: "id" });
  } catch (err) {
    console.warn("Supabase news save notice:", err);
  }
}

export async function deleteSupabaseNews(id: string): Promise<void> {
  try {
    await supabase.from("news").delete().eq("id", id);
  } catch (err) {
    console.warn("Supabase news delete notice:", err);
  }
}

export async function fetchSupabaseOutlooks(): Promise<OutlookItem[]> {
  try {
    const { data, error } = await supabase.from("outlooks").select("*").order("date", { ascending: false });
    if (error || !data) return [];
    return data.map((r: any) => ({
      id: r.id,
      date: r.date,
      title: r.title,
      bias: r.bias || "neutral",
      pairs: Array.isArray(r.pairs) ? r.pairs : [],
      summary: r.summary,
      body: r.body,
      levels: r.levels || undefined,
      status: r.status || "published",
      authorId: r.author_id || undefined,
      authorName: r.author_name || undefined,
      createdAt: r.created_at,
    }));
  } catch {
    return [];
  }
}

export async function saveSupabaseOutlook(o: OutlookItem): Promise<void> {
  try {
    await supabase.from("outlooks").upsert({
      id: o.id,
      date: o.date,
      title: o.title,
      bias: o.bias,
      pairs: o.pairs ?? [],
      summary: o.summary,
      body: o.body,
      levels: o.levels ?? null,
      status: o.status,
      author_id: o.authorId ?? null,
      author_name: o.authorName ?? null,
      created_at: o.createdAt,
    }, { onConflict: "id" });
  } catch (err) {
    console.warn("Supabase outlook save notice:", err);
  }
}

export async function deleteSupabaseOutlook(id: string): Promise<void> {
  try {
    await supabase.from("outlooks").delete().eq("id", id);
  } catch (err) {
    console.warn("Supabase outlook delete notice:", err);
  }
}

/* ============================================================================
 * 6. SERVICE ENQUIRIES & COUPONS
 * ============================================================================ */

export async function fetchSupabaseEnquiries(): Promise<ServiceEnquiry[]> {
  try {
    const { data, error } = await supabase.from("service_enquiries").select("*").order("created_at", { ascending: false });
    if (error || !data) return [];
    return data.map((r: any) => ({
      id: r.id,
      ref: r.ref,
      serviceSlug: r.service_slug,
      serviceTitle: r.service_title,
      packageName: r.package_name || undefined,
      name: r.name,
      email: r.email,
      phone: r.phone,
      company: r.company || undefined,
      budget: r.budget || undefined,
      message: r.message,
      userId: r.user_id || undefined,
      status: r.status || "new",
      createdAt: r.created_at,
    }));
  } catch {
    return [];
  }
}

export async function saveSupabaseEnquiry(seq: ServiceEnquiry): Promise<void> {
  try {
    await supabase.from("service_enquiries").upsert({
      id: seq.id,
      ref: seq.ref,
      service_slug: seq.serviceSlug,
      service_title: seq.serviceTitle,
      package_name: seq.packageName ?? null,
      name: seq.name,
      email: seq.email,
      phone: seq.phone,
      company: seq.company ?? null,
      budget: seq.budget ?? null,
      message: seq.message,
      user_id: seq.userId ?? null,
      status: seq.status,
      created_at: seq.createdAt,
    }, { onConflict: "id" });
  } catch (err) {
    console.warn("Supabase enquiry save notice:", err);
  }
}

export async function fetchSupabaseCoupons(): Promise<Coupon[]> {
  try {
    const { data, error } = await supabase.from("coupons").select("*");
    if (error || !data) return [];
    return data.map((r: any) => ({
      id: r.id,
      code: r.code,
      discountPercent: Number(r.discount_percent || 10),
      maxUses: Number(r.max_uses || 100),
      usedCount: Number(r.used_count || 0),
      expiryDate: r.expiry_date || undefined,
      applicableTo: r.applicable_to || "all",
      status: r.status || "active",
      createdAt: r.created_at,
    }));
  } catch {
    return [];
  }
}

export async function saveSupabaseCoupon(c: Coupon): Promise<void> {
  try {
    await supabase.from("coupons").upsert({
      id: c.id,
      code: c.code,
      discount_percent: c.discountPercent,
      max_uses: c.maxUses,
      used_count: c.usedCount,
      expiry_date: c.expiryDate ?? null,
      applicable_to: c.applicableTo,
      status: c.status,
      created_at: c.createdAt,
    }, { onConflict: "id" });
  } catch (err) {
    console.warn("Supabase coupon save notice:", err);
  }
}

export async function deleteSupabaseCoupon(id: string): Promise<void> {
  try {
    await supabase.from("coupons").delete().eq("id", id);
  } catch (err) {
    console.warn("Supabase coupon delete notice:", err);
  }
}

/* ============================================================================
 * 7. GIVEAWAYS & STUDENT OF THE WEEK
 * ============================================================================ */

export async function fetchSupabaseGiveaways(): Promise<Giveaway[]> {
  try {
    const { data, error } = await supabase.from("giveaways").select("*");
    if (error || !data) return [];
    return data.map((r: any) => ({
      id: r.id,
      title: r.title,
      summary: r.summary,
      body: r.body,
      reward: r.reward,
      image: r.image || undefined,
      taggedClubId: r.tagged_club_id || undefined,
      taggedClubName: r.tagged_club_name || undefined,
      status: r.status || "published",
      winners: Array.isArray(r.winners) ? r.winners : [],
      announcedAt: r.announced_at || r.created_at,
      createdAt: r.created_at,
      authorId: r.author_id || undefined,
      authorName: r.author_name || undefined,
    }));
  } catch {
    return [];
  }
}

export async function saveSupabaseGiveaway(g: Giveaway): Promise<void> {
  try {
    await supabase.from("giveaways").upsert({
      id: g.id,
      title: g.title,
      summary: g.summary,
      body: g.body,
      reward: g.reward,
      image: g.image ?? null,
      tagged_club_id: g.taggedClubId ?? null,
      tagged_club_name: g.taggedClubName ?? null,
      status: g.status,
      winners: g.winners ?? [],
      announced_at: g.announcedAt,
      created_at: g.createdAt,
      author_id: g.authorId ?? null,
      author_name: g.authorName ?? null,
    }, { onConflict: "id" });
  } catch (err) {
    console.warn("Supabase giveaway save notice:", err);
  }
}

export async function fetchSupabaseSOTW(): Promise<StudentOfTheWeek | null> {
  try {
    const { data, error } = await supabase.from("student_of_the_week").select("*").order("created_at", { ascending: false }).limit(1).single();
    if (error || !data) return null;
    return {
      id: data.id,
      studentId: data.student_id || undefined,
      studentName: data.student_name,
      avatar: data.avatar || undefined,
      track: data.track,
      weekPeriod: data.week_period,
      winRate: data.win_rate,
      quizXP: data.quiz_xp,
      combatRank: data.combat_rank,
      weeklyReturn: data.weekly_return,
      performanceReview: data.performance_review,
      mentorQuote: data.mentor_quote || undefined,
      createdAt: data.created_at,
    };
  } catch {
    return null;
  }
}

export async function saveSupabaseSOTW(s: StudentOfTheWeek): Promise<void> {
  try {
    await supabase.from("student_of_the_week").upsert({
      id: s.id,
      student_id: s.studentId ?? null,
      student_name: s.studentName,
      avatar: s.avatar ?? null,
      track: s.track,
      week_period: s.weekPeriod,
      win_rate: s.winRate,
      quiz_xp: s.quizXP,
      combat_rank: s.combatRank,
      weekly_return: s.weeklyReturn,
      performance_review: s.performanceReview,
      mentor_quote: s.mentorQuote ?? null,
      created_at: s.createdAt,
    }, { onConflict: "id" });
  } catch (err) {
    console.warn("Supabase SOTW save notice:", err);
  }
}

/* ============================================================================
 * 8. REVIEWS & RATINGS PERSISTENCE
 * ============================================================================ */

export async function fetchSupabaseReviews(): Promise<ReviewItem[]> {
  try {
    const { data, error } = await supabase.from("reviews").select("*").order("created_at", { ascending: false });
    if (error || !data) return [];
    return data.map((r: any) => ({
      id: r.id,
      userId: r.user_id,
      userName: r.user_name,
      userAvatar: r.user_avatar || undefined,
      userLocation: r.user_location || "Nigeria",
      targetType: r.target_type as "course" | "mentorship" | "service" | "event",
      targetId: r.target_id,
      targetTitle: r.target_title,
      rating: Number(r.rating || 5),
      comment: r.comment,
      createdAt: r.created_at || new Date().toISOString(),
    }));
  } catch {
    return [];
  }
}

export async function saveSupabaseReview(rev: ReviewItem): Promise<void> {
  try {
    await supabase.from("reviews").upsert({
      id: rev.id,
      user_id: rev.userId,
      user_name: rev.userName,
      user_avatar: rev.userAvatar ?? null,
      user_location: rev.userLocation,
      target_type: rev.targetType,
      target_id: rev.targetId,
      target_title: rev.targetTitle,
      rating: rev.rating,
      comment: rev.comment,
      created_at: rev.createdAt,
    }, { onConflict: "id" });
  } catch (err) {
    console.warn("Supabase review save notice:", err);
  }
}
