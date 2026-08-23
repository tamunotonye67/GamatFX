import { useState, useMemo, useRef } from "react";
import PageHero from "../../components/PageHero";
import PageCta from "../../components/PageCta";
import { useStore, type TradingClub } from "../../lib/store";
import { navigate } from "../../lib/router";
import { useReveal } from "../../lib/useReveal";
import {
  Users, UserPlus, Crown, Shield, Zap,
  Search, CheckCircle2, AlertCircle, Plus, LogOut, Info, X, Award,
  MessageSquare, ThumbsUp, ThumbsDown, Image, Send, Reply, Flame,
} from "lucide-react";

/** Dynamic level calculation based on member count */
export function getClubLevel(count: number) {
  if (count >= 10) return { level: 4, name: "Level 4 — Sovereign Apex", badge: "Diamond", tone: "bg-purple-100 text-purple-800 border-purple-300" };
  if (count >= 7) return { level: 3, name: "Level 3 — Elite Guild", badge: "Gold", tone: "bg-amber-100 text-amber-800 border-amber-300" };
  if (count >= 4) return { level: 2, name: "Level 2 — Active Syndicate", badge: "Silver", tone: "bg-sky-100 text-sky-800 border-sky-300" };
  return { level: 1, name: "Level 1 — Novice Squad", badge: "Bronze", tone: "bg-orange-100 text-orange-800 border-orange-300" };
}

export default function ClubBuilderPage() {
  const { ref, visible } = useReveal<HTMLDivElement>();
  const { isAuthed, clubs, userClub, createClub, joinClub, leaveClub } = useStore();

  const [q, setQ] = useState("");
  const [focusFilter, setFocusFilter] = useState("All");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [activeModalClub, setActiveModalClub] = useState<TradingClub | null>(null);

  // Create form state
  const [form, setForm] = useState({
    name: "",
    tagline: "",
    description: "",
    focus: "Scalping & Price Action",
    emblem: "Zap",
    color: "#dc3545",
  });
  const [msg, setMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const focusOptions = ["All", "Scalping & Price Action", "Crypto & On-Chain", "Fundamental & Swing"];

  const filteredClubs = useMemo(() => {
    return clubs.filter((c) => {
      const matchFocus = focusFilter === "All" || c.focus.toLowerCase().includes(focusFilter.toLowerCase());
      const matchQ =
        !q ||
        c.name.toLowerCase().includes(q.toLowerCase()) ||
        c.tagline.toLowerCase().includes(q.toLowerCase()) ||
        c.leaderName.toLowerCase().includes(q.toLowerCase());
      return matchFocus && matchQ;
    });
  }, [clubs, focusFilter, q]);

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setMsg(null);
    const res = createClub(form);
    if (!res.ok) {
      setMsg({ type: "error", text: res.error || "Failed to create club." });
    } else {
      setShowCreateModal(false);
      setForm({ name: "", tagline: "", description: "", focus: "Scalping & Price Action", emblem: "Zap", color: "#dc3545" });
      setMsg({ type: "success", text: "Congratulations! Your trading club has been created." });
    }
  };

  const handleJoin = (clubId: string) => {
    setMsg(null);
    if (!isAuthed) {
      navigate("/signup?next=/fun/clubs");
      return;
    }
    const res = joinClub(clubId);
    if (!res.ok) {
      setMsg({ type: "error", text: res.error || "Could not join club." });
    } else {
      setMsg({ type: "success", text: "Successfully joined the club!" });
    }
  };

  const handleLeave = (clubId: string) => {
    if (!confirm("Are you sure you want to leave your club?")) return;
    setMsg(null);
    const res = leaveClub(clubId);
    if (res.ok) {
      setMsg({ type: "success", text: "You have left the club." });
    } else {
      setMsg({ type: "error", text: res.error || "Failed to leave club." });
    }
  };

  return (
    <>
      <PageHero
        crumb="Club Builder"
        eyebrow="Student Trading Guilds"
        image="/images/hero.jpg"
        title={<>GAMAT <span className="text-brand">Club Builder</span></>}
        subtitle="Form or join a 10-person trading syndicate led by a Team Lead. Level up your club tier together as your roster grows."
      />

      {/* Notification Toast */}
      {msg && (
        <div className="bg-cream border-b border-line py-3">
          <div className="container-x">
            <div
              className={`flex items-center justify-between rounded-xl px-4 py-3 text-xs font-semibold ${
                msg.type === "success" ? "bg-emerald-50 text-emerald-800 border border-emerald-200" : "bg-brand-light text-brand border border-brand/30"
              }`}
            >
              <div className="flex items-center gap-2">
                {msg.type === "success" ? <CheckCircle2 className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
                <span>{msg.text}</span>
              </div>
              <button onClick={() => setMsg(null)} className="text-muted hover:text-ink">
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Rules Banner */}
      <section className="border-b border-line bg-white py-6">
        <div className="container-x grid gap-4 sm:grid-cols-2 lg:grid-cols-4 text-center">
          <div className="p-3">
            <Crown className="mx-auto h-6 w-6 text-brand" />
            <h4 className="mt-2 font-display text-sm font-bold text-ink">Team Lead Standard</h4>
            <p className="mt-1 text-xs text-muted">Every club is created & guided by an active Team Lead.</p>
          </div>
          <div className="p-3">
            <Users className="mx-auto h-6 w-6 text-amber-500" />
            <h4 className="mt-2 font-display text-sm font-bold text-ink">Strict 10 Member Limit</h4>
            <p className="mt-1 text-xs text-muted">Max 10 students per club to ensure tight focus & accountability.</p>
          </div>
          <div className="p-3">
            <Award className="mx-auto h-6 w-6 text-sky-500" />
            <h4 className="mt-2 font-display text-sm font-bold text-ink">Dynamic Leveling</h4>
            <p className="mt-1 text-xs text-muted">Clubs level up automatically from Novice (Lvl 1) to Apex (Lvl 4).</p>
          </div>
          <div className="p-3">
            <Shield className="mx-auto h-6 w-6 text-emerald-500" />
            <h4 className="mt-2 font-display text-sm font-bold text-ink">1 Club Per Student</h4>
            <p className="mt-1 text-xs text-muted">Students can belong to strictly 1 club at a time.</p>
          </div>
        </div>
      </section>

      {/* MY ACTIVE CLUB STATUS */}
      <section className="section bg-cream pt-10 pb-4">
        <div className="container-x">
          {userClub ? (
            <div className="overflow-hidden rounded-3xl border border-brand/40 bg-white p-6 shadow-lg md:p-8">
              <div className="flex flex-wrap items-center justify-between gap-4 border-b border-line pb-6">
                <div className="flex items-center gap-4">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand text-white shadow-md">
                    <Zap className="h-7 w-7" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="chip !py-0.5">{userClub.focus}</span>
                      <span className={`rounded-full border px-3 py-0.5 text-[10px] font-extrabold uppercase ${getClubLevel(userClub.members.length).tone}`}>
                        {getClubLevel(userClub.members.length).name}
                      </span>
                    </div>
                    <h2 className="mt-1 font-display text-2xl font-extrabold text-ink">{userClub.name}</h2>
                    <p className="text-xs text-muted">"{userClub.tagline}"</p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <button
                    onClick={() => setActiveModalClub(userClub)}
                    className="btn-outline-dark !py-2 !text-xs"
                  >
                    <Info className="h-4 w-4" /> View Full Roster
                  </button>
                  <button
                    onClick={() => handleLeave(userClub.id)}
                    className="rounded-xl border border-brand/30 bg-brand-light px-4 py-2 text-xs font-bold text-brand transition hover:bg-brand hover:text-white"
                  >
                    <LogOut className="h-4 w-4 inline mr-1" /> Leave Club
                  </button>
                </div>
              </div>

              {/* Roster & Capacity bar */}
              <div className="mt-6 grid gap-6 md:grid-cols-[1.5fr_1fr]">
                <div>
                  <div className="flex items-center justify-between text-xs text-muted mb-2">
                    <span className="font-semibold text-ink">Club Capacity ({userClub.members.length} / 10 Members)</span>
                    <span>{10 - userClub.members.length} spot(s) remaining</span>
                  </div>
                  <div className="h-3 w-full overflow-hidden rounded-full bg-line">
                    <div
                      className="h-full bg-gradient-to-r from-brand to-amber-500 transition-all duration-500"
                      style={{ width: `${(userClub.members.length / 10) * 100}%` }}
                    />
                  </div>

                  {/* Member avatars list */}
                  <div className="mt-6">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-muted mb-3">Active Roster</h4>
                    <div className="flex flex-wrap gap-2">
                      {userClub.members.map((m) => (
                        <div
                          key={m.userId}
                          className="flex items-center gap-2 rounded-full border border-line bg-cream px-3 py-1.5 text-xs font-semibold text-ink"
                        >
                          {m.avatar ? (
                            <img src={m.avatar} alt="" className="h-5 w-5 rounded-full object-cover" />
                          ) : (
                            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-brand text-[10px] text-white font-bold">
                              {m.name[0]}
                            </span>
                          )}
                          <span>{m.name}</span>
                          {m.role === "lead" && (
                            <span className="rounded-full bg-amber-500 px-2 py-0.2 text-[9px] font-extrabold uppercase text-white shadow-xs">
                              Lead
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="rounded-2xl border border-line bg-cream p-5 text-xs">
                  <h4 className="font-bold text-ink">Team Lead Message</h4>
                  <p className="mt-2 text-muted leading-relaxed">
                    Led by <strong className="text-ink">{userClub.leaderName}</strong>. Welcome to our trade unit! We collaborate on chart setups and hold weekly review calls.
                  </p>
                  <p className="mt-4 text-[11px] text-muted">Created {new Date(userClub.createdAt).toLocaleDateString()}</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-wrap items-center justify-between gap-6 rounded-3xl border border-line bg-white p-8 shadow-sm">
              <div>
                <span className="chip">No active club</span>
                <h3 className="mt-2 font-display text-xl font-bold text-ink">You haven't joined a Trading Club yet</h3>
                <p className="mt-1 text-xs text-muted max-w-xl">
                  Join an existing club below or start your own 10-person trading syndicate to collaborate with peers.
                </p>
              </div>

              <button
                onClick={() => {
                  if (!isAuthed) navigate("/signup?next=/fun/clubs");
                  else setShowCreateModal(true);
                }}
                className="btn-primary"
              >
                <Plus className="h-4 w-4" /> Create a Club
              </button>
            </div>
          )}
        </div>
      </section>

      {/* CLUB DIRECTORY */}
      <section className="section bg-cream pt-6">
        <div ref={ref} className="container-x">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-line pb-6">
            <div>
              <span className="eyebrow">Explore Syndicates</span>
              <h2 className="section-title mt-2">Active Trading Clubs</h2>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap items-center gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
                <input
                  type="text"
                  placeholder="Search clubs or leads…"
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  className="w-56 rounded-full border border-line bg-white pl-9 pr-4 py-2 text-xs text-ink placeholder-muted outline-none focus:border-brand"
                />
              </div>

              <div className="flex flex-wrap items-center gap-1.5">
                {focusOptions.map((f) => (
                  <button
                    key={f}
                    onClick={() => setFocusFilter(f)}
                    className={`rounded-full px-3 py-1.5 text-xs font-bold transition ${
                      focusFilter === f
                        ? "bg-ink text-white"
                        : "bg-white text-muted border border-line hover:text-ink"
                    }`}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Grid of Clubs */}
          <div className="mt-8 grid gap-7 md:grid-cols-2 xl:grid-cols-3">
            {filteredClubs.map((club, idx) => {
              const isMember = userClub?.id === club.id;
              const isFull = club.members.length >= 10;
              const lvl = getClubLevel(club.members.length);

              return (
                <div
                  key={club.id}
                  className={`group flex flex-col justify-between overflow-hidden rounded-3xl border border-line bg-white text-left shadow-sm transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl reveal ${
                    visible ? "is-visible" : ""
                  }`}
                  style={{ transitionDelay: `${(idx % 3) * 100}ms` }}
                >
                  <div className="p-6">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div
                          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-white font-bold shadow"
                          style={{ backgroundColor: club.color }}
                        >
                          <Zap className="h-6 w-6" />
                        </div>
                        <div>
                          <span className="text-[10px] font-extrabold uppercase tracking-wider text-brand">
                            {club.focus}
                          </span>
                          <h3 className="font-display text-lg font-bold text-ink group-hover:text-brand">
                            {club.name}
                          </h3>
                        </div>
                      </div>

                      <span className={`rounded-full border px-2.5 py-0.5 text-[9px] font-extrabold uppercase ${lvl.tone}`}>
                        Lvl {lvl.level}
                      </span>
                    </div>

                    <p className="mt-3 line-clamp-2 text-xs text-muted">"{club.tagline}"</p>

                    {/* Team Lead */}
                    <div className="mt-4 flex items-center justify-between rounded-xl bg-cream p-3 text-xs">
                      <div className="flex items-center gap-2">
                        {club.leaderAvatar ? (
                          <img src={club.leaderAvatar} alt="" className="h-6 w-6 rounded-full object-cover" />
                        ) : (
                          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-brand text-[10px] text-white font-bold">
                            {club.leaderName[0]}
                          </span>
                        )}
                        <div>
                          <p className="text-[10px] font-semibold text-muted">Team Lead</p>
                          <p className="font-bold text-ink leading-tight">{club.leaderName}</p>
                        </div>
                      </div>

                      <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-800">
                        Lead
                      </span>
                    </div>

                    {/* Member Capacity Progress */}
                    <div className="mt-4">
                      <div className="flex items-center justify-between text-[11px] font-semibold text-muted">
                        <span>Members</span>
                        <span>
                          <strong>{club.members.length}</strong> / 10 Max
                        </span>
                      </div>
                      <div className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-line">
                        <div
                          className="h-full bg-brand transition-all duration-500"
                          style={{ width: `${(club.members.length / 10) * 100}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between border-t border-line bg-cream/50 px-6 py-4">
                    <button
                      onClick={() => setActiveModalClub(club)}
                      className="text-xs font-bold text-muted hover:text-ink"
                    >
                      View Details
                    </button>

                    {isMember ? (
                      <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-200">
                        <CheckCircle2 className="h-3.5 w-3.5" /> Your Club
                      </span>
                    ) : isFull ? (
                      <span className="rounded-full bg-line/80 px-3 py-1.5 text-xs font-bold text-muted">
                        Full (10/10)
                      </span>
                    ) : (
                      <button
                        onClick={() => handleJoin(club.id)}
                        disabled={!!userClub}
                        className="btn-primary !py-1.5 !px-4 !text-xs disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <UserPlus className="h-3.5 w-3.5" /> Join Club
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CREATE CLUB MODAL */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/70 p-4 backdrop-blur-sm">
          <div className="relative w-full max-w-lg overflow-hidden rounded-3xl border border-line bg-white p-7 shadow-2xl">
            <div className="flex items-center justify-between border-b border-line pb-4">
              <div>
                <h3 className="font-display text-xl font-bold text-ink">Create a Trading Club</h3>
                <p className="text-xs text-muted">You will automatically become the Team Lead.</p>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                className="rounded-full p-2 text-muted hover:bg-cream hover:text-ink"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="mt-5 space-y-4">
              <div>
                <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-muted">
                  Club Name
                </label>
                <input
                  required
                  type="text"
                  placeholder="e.g. Apex Scalpers Guild"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full rounded-xl border border-line bg-cream px-4 py-2.5 text-sm text-ink outline-none focus:border-brand focus:bg-white"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-muted">
                  Tagline
                </label>
                <input
                  required
                  type="text"
                  placeholder="e.g. Precision price action on London Open"
                  value={form.tagline}
                  onChange={(e) => setForm({ ...form, tagline: e.target.value })}
                  className="w-full rounded-xl border border-line bg-cream px-4 py-2.5 text-sm text-ink outline-none focus:border-brand focus:bg-white"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-muted">
                  Focus Strategy
                </label>
                <select
                  value={form.focus}
                  onChange={(e) => setForm({ ...form, focus: e.target.value })}
                  className="w-full rounded-xl border border-line bg-cream px-4 py-2.5 text-sm text-ink outline-none focus:border-brand focus:bg-white"
                >
                  <option value="Scalping & Price Action">Scalping & Price Action</option>
                  <option value="Crypto & On-Chain">Crypto & On-Chain</option>
                  <option value="Fundamental & Swing">Fundamental & Swing</option>
                  <option value="General & Mentorship">General & Mentorship</option>
                </select>
              </div>

              <div>
                <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-muted">
                  Description
                </label>
                <textarea
                  rows={3}
                  placeholder="Tell prospective members about your club's trading rules and schedule…"
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="w-full resize-none rounded-xl border border-line bg-cream px-4 py-2.5 text-sm text-ink outline-none focus:border-brand focus:bg-white"
                />
              </div>

              <div className="flex justify-end gap-3 border-t border-line pt-4">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="btn-outline-dark !py-2.5"
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary !py-2.5">
                  Create Club & Become Lead
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CLUB DETAILS & WEEKLY DISCUSSION ROOM MODAL */}
      {activeModalClub && (
        <ClubModalContent
          club={activeModalClub}
          onClose={() => setActiveModalClub(null)}
        />
      )}

      {/* CTA */}
      <PageCta
        tone="light"
        title="Ready to trade with your club?"
        body="Access live market rooms, weekly setup reviews, and community insights."
        primaryLabel="View Community"
        primaryTo="/community"
      />
    </>
  );
}

/* ================== Club Modal with Weekly Discussion Chat ================== */

function ClubModalContent({ club, onClose }: { club: TradingClub; onClose: () => void }) {
  const { user, isAuthed, clubMessages, sendClubMessage, toggleClubMessageVote, toggleClubMessageEmoji } = useStore();
  const [tab, setTab] = useState<"discussion" | "roster">("discussion");
  const [content, setContent] = useState("");
  const [image, setImage] = useState("");
  const [replyTo, setReplyTo] = useState<{ id: string; name: string } | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const chatFileRef = useRef<HTMLInputElement | null>(null);

  const isMember = club.members.some((m) => m.userId === user?.id);

  const messages = useMemo(() => {
    return (clubMessages || [])
      .filter((m) => m.clubId === club.id)
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  }, [clubMessages, club.id]);

  const handleImageFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (reader.result) setImage(String(reader.result));
    };
    reader.readAsDataURL(file);
  };

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    if (!isAuthed) {
      navigate("/signup?next=/fun/clubs");
      return;
    }
    const res = sendClubMessage({
      clubId: club.id,
      content,
      image,
      replyToId: replyTo?.id,
      replyToName: replyTo?.name,
    });

    if (!res.ok) {
      setErrorMsg(res.error || "Failed to send message.");
    } else {
      setContent("");
      setImage("");
      setReplyTo(null);
    }
  };

  const availableEmojis = ["🚀", "📈", "📉", "🎯", "🔥", "💎", "👏"];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/70 p-4 backdrop-blur-sm">
      <div className="relative w-full max-w-2xl max-h-[90vh] flex flex-col rounded-3xl border border-line bg-white shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-line p-5 bg-cream/50">
          <div className="flex items-center gap-3">
            <div
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl text-white font-bold shadow"
              style={{ backgroundColor: club.color }}
            >
              <Zap className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-display text-xl font-bold text-ink">{club.name}</h3>
                <span className={`rounded-full border px-2.5 py-0.5 text-[9px] font-extrabold uppercase ${getClubLevel(club.members.length).tone}`}>
                  Lvl {getClubLevel(club.members.length).level}
                </span>
              </div>
              <p className="text-xs text-muted font-medium">{club.focus} · {club.members.length}/10 Members</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="rounded-full p-2 text-muted hover:bg-cream hover:text-ink transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-line bg-white px-5 pt-2">
          <button
            onClick={() => setTab("discussion")}
            className={`flex items-center gap-2 border-b-2 px-4 py-2.5 text-xs font-bold transition ${
              tab === "discussion"
                ? "border-brand text-brand"
                : "border-transparent text-muted hover:text-ink"
            }`}
          >
            <MessageSquare className="h-4 w-4" /> Weekly Discussion Room ({messages.length})
          </button>
          <button
            onClick={() => setTab("roster")}
            className={`flex items-center gap-2 border-b-2 px-4 py-2.5 text-xs font-bold transition ${
              tab === "roster"
                ? "border-brand text-brand"
                : "border-transparent text-muted hover:text-ink"
            }`}
          >
            <Users className="h-4 w-4" /> Syndicate Roster ({club.members.length})
          </button>
        </div>

        {/* Body Content */}
        <div className="flex-1 overflow-y-auto p-5 text-xs">
          {tab === "discussion" ? (
            <div className="space-y-6">
              {/* Discussion Room Banner */}
              <div className="rounded-2xl border border-brand/30 bg-brand/5 p-4 text-brand">
                <div className="flex items-center justify-between font-bold text-xs">
                  <span className="flex items-center gap-1.5 uppercase tracking-wider">
                    <Flame className="h-4 w-4 text-brand animate-pulse" /> Weekly Strategy & Analysis Room
                  </span>
                  <span className="text-[10px] bg-brand text-white px-2 py-0.5 rounded-md font-bold">
                    Active Session
                  </span>
                </div>
                <p className="mt-1 text-slate-700 text-xs">
                  Share market setups, chart breakdowns, and trade reasoning. Respect fellow syndicate members.
                </p>
              </div>

              {/* Message Feed */}
              <div className="space-y-4">
                {messages.length ? (
                  messages.map((m) => {
                    const isMyMsg = user?.id === m.userId;
                    const hasLiked = user?.id ? m.likes.includes(user.id) : false;
                    const hasDisliked = user?.id ? m.dislikes.includes(user.id) : false;

                    return (
                      <div
                        key={m.id}
                        className={`rounded-2xl border p-4 transition ${
                          isMyMsg ? "border-brand/30 bg-brand/5" : "border-line bg-white shadow-xs"
                        }`}
                      >
                        {/* Author Header */}
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2.5">
                            {m.userAvatar ? (
                              <img src={m.userAvatar} alt="" className="h-7 w-7 rounded-full object-cover border border-line" />
                            ) : (
                              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-brand text-white text-[10px] font-bold">
                                {m.userName[0]}
                              </span>
                            )}
                            <div>
                              <div className="flex items-center gap-1.5">
                                <span className="font-bold text-ink">{m.userName}</span>
                                {m.userRole === "lead" && (
                                  <span className="inline-flex items-center gap-0.5 rounded-full bg-amber-500 px-2 py-0.2 text-[9px] font-extrabold text-white">
                                    <Crown className="h-2.5 w-2.5" /> Lead
                                  </span>
                                )}
                              </div>
                              <span className="text-[10px] text-muted">
                                {new Date(m.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                              </span>
                            </div>
                          </div>

                          <button
                            onClick={() => setReplyTo({ id: m.id, name: m.userName })}
                            className="inline-flex items-center gap-1 text-[11px] font-semibold text-muted hover:text-brand"
                          >
                            <Reply className="h-3 w-3" /> Reply
                          </button>
                        </div>

                        {/* Reply Banner */}
                        {m.replyToName && (
                          <div className="mb-2 rounded-lg bg-cream/70 px-3 py-1.5 text-[11px] text-muted italic border-l-2 border-brand/50">
                            Replying to <strong>@{m.replyToName}</strong>
                          </div>
                        )}

                        {/* Content */}
                        <p className="text-xs text-ink leading-relaxed whitespace-pre-line">{m.content}</p>

                        {/* Image Attachment */}
                        {m.image && (
                          <div className="mt-3 overflow-hidden rounded-xl border border-line max-h-60 bg-slate-950">
                            <img src={m.image} alt="Chart setup" className="w-full h-full object-cover" />
                          </div>
                        )}

                        {/* Interaction Bar */}
                        <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-line/60 pt-2 text-[11px]">
                          {/* Likes & Dislikes */}
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => toggleClubMessageVote(m.id, "like")}
                              className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-1 font-bold transition ${
                                hasLiked
                                  ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                                  : "bg-cream text-muted hover:text-ink hover:bg-line/40"
                              }`}
                            >
                              <ThumbsUp className="h-3 w-3" /> {m.likes.length}
                            </button>

                            <button
                              onClick={() => toggleClubMessageVote(m.id, "dislike")}
                              className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-1 font-bold transition ${
                                hasDisliked
                                  ? "bg-rose-100 text-rose-800 border border-rose-300"
                                  : "bg-cream text-muted hover:text-ink hover:bg-line/40"
                              }`}
                            >
                              <ThumbsDown className="h-3 w-3" /> {m.dislikes.length}
                            </button>
                          </div>

                          {/* Emoji Reactions */}
                          <div className="flex flex-wrap items-center gap-1">
                            {availableEmojis.map((emo) => {
                              const users = m.emojis[emo] ?? [];
                              const hasEmo = user?.id ? users.includes(user.id) : false;
                              return (
                                <button
                                  key={emo}
                                  onClick={() => toggleClubMessageEmoji(m.id, emo)}
                                  className={`rounded-full px-2 py-0.5 text-xs transition ${
                                    hasEmo
                                      ? "bg-brand/20 border border-brand/50 font-bold scale-110"
                                      : "bg-cream hover:bg-line/60 opacity-80 hover:opacity-100"
                                  }`}
                                >
                                  {emo} {users.length > 0 && <span className="text-[10px] font-bold ml-0.5">{users.length}</span>}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="py-8 text-center text-muted">
                    <MessageSquare className="mx-auto h-8 w-8 text-muted/40 mb-2" />
                    <p className="font-semibold text-ink">No market notes yet</p>
                    <p className="text-xs">Be the first to post a chart breakdown for your club!</p>
                  </div>
                )}
              </div>
            </div>
          ) : (
            /* Roster Tab */
            <div className="space-y-4">
              <div className="flex items-center justify-between rounded-2xl bg-cream p-4 border border-line">
                <span className="font-bold text-ink">Current Level Badge</span>
                <span className={`rounded-full border px-3 py-0.5 text-[10px] font-extrabold ${getClubLevel(club.members.length).tone}`}>
                  {getClubLevel(club.members.length).name}
                </span>
              </div>

              <div className="divide-y divide-line rounded-2xl border border-line bg-white overflow-hidden">
                {club.members.map((m) => (
                  <div key={m.userId} className="flex items-center justify-between p-3.5">
                    <div className="flex items-center gap-3">
                      {m.avatar ? (
                        <img src={m.avatar} alt="" className="h-9 w-9 rounded-full object-cover border border-line" />
                      ) : (
                        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-brand text-xs text-white font-bold">
                          {m.name[0]}
                        </span>
                      )}
                      <div>
                        <p className="font-bold text-ink text-sm">{m.name}</p>
                        <p className="text-[10px] text-muted">Joined {new Date(m.joinedAt).toLocaleDateString()}</p>
                      </div>
                    </div>

                    {m.role === "lead" && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-amber-500 px-3 py-0.5 text-[10px] font-extrabold text-white shadow-xs">
                        <Crown className="h-3 w-3" /> Team Lead
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Form Footer for Discussion Tab */}
        {tab === "discussion" && (
          <div className="border-t border-line bg-cream/60 p-4">
            {errorMsg && (
              <div className="mb-2 text-xs font-semibold text-rose-600">{errorMsg}</div>
            )}

            {replyTo && (
              <div className="mb-2 flex items-center justify-between rounded-xl bg-white px-3 py-1.5 text-xs text-brand border border-brand/30">
                <span>Replying to <strong>@{replyTo.name}</strong></span>
                <button onClick={() => setReplyTo(null)} className="text-muted hover:text-ink">
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            )}

            {!isMember ? (
              <div className="rounded-xl border border-amber-300 bg-amber-50 p-3 text-center text-xs font-semibold text-amber-800">
                You must join this club to post analysis and interact with discussions.
              </div>
            ) : (
              <form onSubmit={handleSend} className="space-y-2">
                <textarea
                  rows={2}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Share analysis, chart logic, or market setup..."
                  className="w-full resize-none rounded-2xl border border-line bg-white px-4 py-2.5 text-xs text-ink outline-none focus:border-brand"
                />

                {image && (
                  <div className="relative inline-block rounded-xl overflow-hidden border border-line max-h-24">
                    <img src={image} alt="Upload preview" className="h-20 object-cover" />
                    <button
                      type="button"
                      onClick={() => setImage("")}
                      className="absolute top-1 right-1 rounded-full bg-slate-950/80 p-1 text-white hover:bg-rose-600"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                )}

                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => chatFileRef.current?.click()}
                      className="inline-flex items-center gap-1 rounded-xl border border-line bg-white px-3 py-1.5 text-xs font-semibold text-ink hover:border-brand"
                    >
                      <Image className="h-3.5 w-3.5 text-brand" /> Attach Chart
                    </button>
                    <input ref={chatFileRef} type="file" accept="image/*" onChange={handleImageFile} className="hidden" />
                  </div>

                  <button type="submit" className="btn-primary !py-2 !px-5 !text-xs">
                    <Send className="h-3.5 w-3.5" /> Post Analysis
                  </button>
                </div>
              </form>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
