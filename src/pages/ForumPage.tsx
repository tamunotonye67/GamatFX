import { useMemo, useRef, useState } from "react";
import PageHero from "../components/PageHero";
import { useStore, type ForumThread } from "../lib/store";
import { navigate } from "../lib/router";
import {
  MessagesSquare, HelpCircle, LineChart, Brain, Trophy, BookMarked, HandHeart,
  Heart, MessageCircle, Pin, Trash2, Send, Search, ArrowLeft, ChevronRight,
  AlertCircle, Plus, ShieldCheck, Clock, X, ImagePlus, AtSign,
} from "lucide-react";

/** Parses `@username` or `@Name` mentions in text and renders them with GAMAT Crimson Red mention badges. */
export function renderTaggedText(text: string) {
  if (!text) return null;
  const parts = text.split(/(@[a-zA-Z0-9._-]+)/g);
  return (
    <>
      {parts.map((part, i) => {
        if (part.startsWith("@") && part.length > 1) {
          return (
            <span
              key={i}
              className="inline-flex items-center gap-0.5 rounded-md bg-brand/10 border border-brand/30 px-1.5 py-0.5 text-xs font-extrabold text-brand hover:underline cursor-pointer"
            >
              {part}
            </span>
          );
        }
        return part;
      })}
    </>
  );
}

/** Interactive textarea with auto-completing @profile mention dropdown. */
function MentionTextarea({
  value,
  onChange,
  placeholder,
  rows = 4,
  className,
}: {
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
  rows?: number;
  className?: string;
}) {
  const { admin } = useStore();
  const [showPicker, setShowPicker] = useState(false);
  const [query, setQuery] = useState("");
  const [mentionIndex, setMentionIndex] = useState(-1);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  const accounts = useMemo(() => admin.accounts || [], [admin.accounts]);

  const matches = useMemo(() => {
    if (!showPicker) return [];
    const q = query.toLowerCase();
    return accounts.filter((a) => {
      const full = `${a.firstName} ${a.lastName} ${a.nickname || ""} ${a.email}`.toLowerCase();
      return full.includes(q);
    }).slice(0, 6);
  }, [accounts, query, showPicker]);

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    const pos = e.target.selectionStart;
    onChange(val);

    const textBeforeCursor = val.slice(0, pos);
    const lastAtIndex = textBeforeCursor.lastIndexOf("@");

    if (lastAtIndex !== -1) {
      const textAfterAt = textBeforeCursor.slice(lastAtIndex + 1);
      if (!/\s/.test(textAfterAt) && textAfterAt.length < 25) {
        setShowPicker(true);
        setQuery(textAfterAt);
        setMentionIndex(lastAtIndex);
        return;
      }
    }
    setShowPicker(false);
  };

  const selectUser = (acc: { firstName: string; lastName: string; nickname?: string }) => {
    const handle = acc.nickname ? `@${acc.nickname}` : `@${acc.firstName}${acc.lastName ? acc.lastName : ""}`;
    const beforeAt = value.slice(0, mentionIndex);
    const cursor = textareaRef.current?.selectionStart ?? value.length;
    const afterCursor = value.slice(cursor);
    const nextVal = `${beforeAt}${handle} ${afterCursor}`;

    onChange(nextVal);
    setShowPicker(false);

    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.focus();
        const nextPos = beforeAt.length + handle.length + 1;
        textareaRef.current.setSelectionRange(nextPos, nextPos);
      }
    }, 50);
  };

  return (
    <div className="relative w-full">
      <textarea
        ref={textareaRef}
        rows={rows}
        value={value}
        onChange={handleTextChange}
        placeholder={placeholder}
        className={className}
      />

      {showPicker && matches.length > 0 && (
        <div className="absolute left-0 bottom-full mb-2 z-50 w-72 overflow-hidden rounded-2xl border border-line bg-white shadow-2xl">
          <div className="bg-cream px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-wider text-brand border-b border-line flex items-center gap-1">
            <AtSign className="h-3 w-3" /> Select Member to Tag
          </div>
          <div className="max-h-48 overflow-y-auto divide-y divide-line">
            {matches.map((acc) => {
              const tagHandle = acc.nickname ? `@${acc.nickname}` : `@${acc.firstName}`;
              return (
                <button
                  key={acc.id}
                  type="button"
                  onClick={() => selectUser(acc)}
                  className="flex w-full items-center gap-3 px-3 py-2 text-left text-xs transition hover:bg-cream/80"
                >
                  <Avatar src={acc.avatar} name={`${acc.firstName} ${acc.lastName}`} size={28} />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1 font-bold text-ink">
                      <span className="truncate">{acc.firstName} {acc.lastName}</span>
                      {acc.role === "admin" && (
                        <span className="rounded bg-brand px-1 py-0.2 text-[8px] font-extrabold text-white">MENTOR</span>
                      )}
                    </div>
                    <p className="text-[10px] text-brand font-semibold">{tagHandle}</p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

/** Compress an image file to a JPEG data URL for forum attachments. */
function readForumImage(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith("image/")) {
      reject(new Error("Please choose an image file."));
      return;
    }
    if (file.size > 4 * 1024 * 1024) {
      reject(new Error("Image must be under 4MB."));
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const max = 1280;
        const scale = Math.min(1, max / Math.max(img.width, img.height));
        const cv = document.createElement("canvas");
        cv.width = Math.round(img.width * scale);
        cv.height = Math.round(img.height * scale);
        const ctx = cv.getContext("2d")!;
        ctx.drawImage(img, 0, 0, cv.width, cv.height);
        resolve(cv.toDataURL("image/jpeg", 0.82));
      };
      img.onerror = () => reject(new Error("Could not read that image."));
      img.src = reader.result as string;
    };
    reader.onerror = () => reject(new Error("Could not read that image."));
    reader.readAsDataURL(file);
  });
}

const ICONS = {
  intro: HandHeart, questions: HelpCircle, analysis: LineChart,
  psychology: Brain, wins: Trophy, resources: BookMarked,
};

function timeAgo(iso: string) {
  const s = Math.floor((Date.now() - +new Date(iso)) / 1000);
  if (s < 60) return "just now";
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  if (s < 604800) return `${Math.floor(s / 86400)}d ago`;
  return new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short" });
}

function Avatar({ src, name, size = 40 }: { src?: string; name: string; size?: number }) {
  const initials = name.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase();
  if (src) return <img src={src} alt="" style={{ width: size, height: size }} className="shrink-0 rounded-full object-cover" />;
  return (
    <span style={{ width: size, height: size, fontSize: size * 0.34 }}
      className="flex shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-brand to-brand-dark font-bold text-white">
      {initials}
    </span>
  );
}

/* ============================ Forum index ============================ */

export function ForumPage() {
  const { forum, isAuthed, user } = useStore();
  const [q, setQ] = useState("");
  const [composing, setComposing] = useState(false);

  const recent = useMemo(
    () => [...forum.threads].sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt)).slice(0, 5),
    [forum.threads]
  );

  const results = useMemo(() => {
    if (!q.trim()) return [];
    return forum.threads.filter((t) => `${t.title} ${t.body}`.toLowerCase().includes(q.toLowerCase()));
  }, [q, forum.threads]);

  return (
    <>
      <PageHero
        crumb="Forum"
        eyebrow="Student community"
        image="/images/community.jpg"
        title={<>Meet, ask, and grow <span className="text-brand">together</span></>}
        subtitle="A space for GAMAT students to introduce themselves, ask questions without judgement, share charts and learn from each other's wins and losses."
      />

      {/* Stats */}
      <section className="border-b border-line bg-white py-10">
        <div className="container-x grid grid-cols-2 gap-8 text-center md:grid-cols-4">
          {[
            { icon: MessagesSquare, v: forum.threads.length, l: "Discussions" },
            { icon: MessageCircle, v: forum.replies.length, l: "Replies" },
            { icon: BookMarked, v: forum.channels.length, l: "Channels" },
            { icon: ShieldCheck, v: "24/7", l: "Moderated" },
          ].map((s) => (
            <div key={s.l}>
              <s.icon className="mx-auto h-6 w-6 text-brand" />
              <p className="mt-3 font-display text-2xl font-extrabold text-ink">{s.v}</p>
              <p className="text-sm text-muted">{s.l}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="section bg-cream">
        <div className="container-x">
          {/* Toolbar */}
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="font-display text-2xl font-extrabold text-ink">Channels</h2>
              <p className="mt-1 text-sm text-muted">Pick a room and join the conversation.</p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <div className="relative">
                <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
                <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search discussions…"
                  className="w-full rounded-xl border border-line bg-white py-2.5 pl-10 pr-4 text-sm outline-none focus:border-brand sm:w-64" />
              </div>
              <button onClick={() => (isAuthed ? setComposing(true) : navigate("/login?next=/forum"))} className="btn-primary !py-2.5">
                <Plus className="h-4 w-4" /> New Post
              </button>
            </div>
          </div>

          {/* Search results */}
          {q.trim() && (
            <div className="mt-8 rounded-2xl border border-line bg-white p-5">
              <p className="text-sm font-semibold text-ink">{results.length} result(s) for "{q}"</p>
              <div className="mt-4 space-y-2">
                {results.map((t) => (
                  <button key={t.id} onClick={() => navigate(`/forum/${t.channelId}/${t.id}`)}
                    className="flex w-full items-center gap-3 rounded-xl p-3 text-left transition hover:bg-cream">
                    <Avatar src={t.authorAvatar} name={t.authorName} size={32} />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-semibold text-ink">{t.title}</span>
                      <span className="block text-xs text-muted">{t.authorName} · {timeAgo(t.createdAt)}</span>
                    </span>
                    <ChevronRight className="h-4 w-4 shrink-0 text-muted" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Channel grid */}
          <div className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {forum.channels.map((c) => {
              const Icon = ICONS[c.icon];
              const count = forum.threadsOf(c.id).length;
              const last = forum.threadsOf(c.id)[0];
              return (
                <button key={c.id} onClick={() => navigate(`/forum/${c.id}`)} className="card text-left">
                  <div className="flex items-start justify-between">
                    <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-light text-brand">
                      <Icon className="h-6 w-6" />
                    </span>
                    <span className="rounded-full bg-cream px-3 py-1 text-xs font-bold text-muted">{count} post{count === 1 ? "" : "s"}</span>
                  </div>
                  <h3 className="mt-5 font-display text-lg font-bold text-ink">{c.name}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted">{c.description}</p>
                  {last && (
                    <p className="mt-4 flex items-center gap-2 border-t border-line pt-3 text-xs text-muted">
                      <Clock className="h-3.5 w-3.5 text-brand" /> Last: {timeAgo(last.createdAt)}
                    </p>
                  )}
                </button>
              );
            })}
          </div>

          {/* Recent activity */}
          <div className="mt-12">
            <h2 className="font-display text-xl font-extrabold text-ink">Recent activity</h2>
            <div className="mt-5 divide-y divide-line overflow-hidden rounded-2xl border border-line bg-white">
              {recent.map((t) => <ThreadRow key={t.id} t={t} />)}
            </div>
          </div>

          {!isAuthed && (
            <div className="mt-10 rounded-3xl bg-gradient-to-br from-brand to-brand-dark p-8 text-center text-white">
              <MessagesSquare className="mx-auto h-10 w-10" />
              <h3 className="mt-4 font-display text-2xl font-extrabold">Join the conversation</h3>
              <p className="mx-auto mt-2 max-w-md text-white/85">
                Create a free account to post questions, reply to other traders and get mentor feedback.
              </p>
              <div className="mt-6 flex flex-wrap justify-center gap-3">
                <button onClick={() => navigate("/signup?next=/forum")}
                  className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-bold text-brand transition hover:-translate-y-0.5">
                  Create free account
                </button>
                <button onClick={() => navigate("/login?next=/forum")}
                  className="inline-flex items-center gap-2 rounded-full border border-white/35 px-6 py-3 text-sm font-bold text-white transition hover:bg-white/10">
                  Log in
                </button>
              </div>
            </div>
          )}
        </div>
      </section>

      {composing && user && <Composer onClose={() => setComposing(false)} />}
    </>
  );
}

function ThreadRow({ t }: { t: ForumThread }) {
  const { forum } = useStore();
  const replies = forum.repliesOf(t.id).length;
  return (
    <button onClick={() => navigate(`/forum/${t.channelId}/${t.id}`)}
      className="flex w-full items-start gap-4 p-5 text-left transition hover:bg-cream/60">
      <Avatar src={t.authorAvatar} name={t.authorName} />
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          {t.pinned && <span className="inline-flex items-center gap-1 rounded-full bg-brand-light px-2 py-0.5 text-[10px] font-bold uppercase text-brand"><Pin className="h-3 w-3" /> Pinned</span>}
          <span className="truncate font-display text-base font-bold text-ink">{t.title}</span>
        </div>
        <p className="mt-1 line-clamp-2 text-sm text-muted">{t.body}</p>
        <div className="mt-2 flex flex-wrap items-center gap-4 text-xs text-muted">
          <span className="font-semibold text-ink">{t.authorName}</span>
          {t.authorRole === "admin" && <span className="rounded bg-ink px-1.5 py-0.5 text-[10px] font-bold text-white">MENTOR</span>}
          <span>{timeAgo(t.createdAt)}</span>
          <span className="inline-flex items-center gap-1"><Heart className="h-3.5 w-3.5" /> {t.likes.length}</span>
          <span className="inline-flex items-center gap-1"><MessageCircle className="h-3.5 w-3.5" /> {replies}</span>
        </div>
      </div>
      <ChevronRight className="mt-1 h-4 w-4 shrink-0 text-muted" />
    </button>
  );
}

/* =========================== Channel page =========================== */

export function ForumChannelPage({ channelId }: { channelId: string }) {
  const { forum, isAuthed, user } = useStore();
  const [composing, setComposing] = useState(false);
  const channel = forum.channels.find((c) => c.id === channelId);

  if (!channel) {
    return (
      <section className="flex min-h-screen flex-col items-center justify-center bg-cream px-6 text-center">
        <h1 className="font-display text-3xl font-extrabold text-ink">Channel not found</h1>
        <button onClick={() => navigate("/forum")} className="btn-primary mt-8">Back to Forum</button>
      </section>
    );
  }

  const Icon = ICONS[channel.icon];
  const threads = forum.threadsOf(channel.id);

  return (
    <>
      <section className="relative isolate overflow-hidden bg-ink text-white">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(60%_60%_at_80%_10%,rgba(220,53,69,0.3),transparent_60%)]" />
        <div className="container-x pb-14 pt-36 md:pt-44">
          <nav className="mb-6 flex items-center gap-2 text-sm text-white/55">
            <button onClick={() => navigate("/")} className="hover:text-white">Home</button>
            <ChevronRight className="h-3.5 w-3.5" />
            <button onClick={() => navigate("/forum")} className="hover:text-white">Forum</button>
            <ChevronRight className="h-3.5 w-3.5" />
            <span className="text-brand-light">{channel.name}</span>
          </nav>
          <div className="flex items-center gap-5">
            <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand"><Icon className="h-7 w-7" /></span>
            <div>
              <h1 className="font-display text-3xl font-extrabold md:text-4xl">{channel.name}</h1>
              <p className="mt-1.5 text-white/70">{channel.description}</p>
            </div>
          </div>
        </div>
      </section>

      <section className="section bg-cream">
        <div className="container-x">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <p className="text-sm text-muted">{threads.length} discussion{threads.length === 1 ? "" : "s"}</p>
            <div className="flex gap-3">
              <button onClick={() => navigate("/forum")} className="btn-outline-dark !py-2.5"><ArrowLeft className="h-4 w-4" /> All channels</button>
              <button onClick={() => (isAuthed ? setComposing(true) : navigate(`/login?next=/forum/${channel.id}`))} className="btn-primary !py-2.5">
                <Plus className="h-4 w-4" /> New Post
              </button>
            </div>
          </div>

          {threads.length ? (
            <div className="mt-6 divide-y divide-line overflow-hidden rounded-2xl border border-line bg-white">
              {threads.map((t) => <ThreadRow key={t.id} t={t} />)}
            </div>
          ) : (
            <div className="mt-6 rounded-2xl border border-dashed border-line bg-white p-14 text-center">
              <MessagesSquare className="mx-auto h-12 w-12 text-brand/35" />
              <h3 className="mt-5 font-display text-lg font-bold text-ink">No discussions yet</h3>
              <p className="mt-1.5 text-sm text-muted">Be the first to start a conversation here.</p>
              <button onClick={() => (isAuthed ? setComposing(true) : navigate("/login?next=/forum"))} className="btn-primary mt-6">
                <Plus className="h-4 w-4" /> Start a discussion
              </button>
            </div>
          )}
        </div>
      </section>

      {composing && user && <Composer defaultChannel={channel.id} onClose={() => setComposing(false)} />}
    </>
  );
}

/* =========================== Thread page =========================== */

export function ForumThreadPage({ threadId }: { threadId: string }) {
  const { forum, user, isAuthed, isAdmin } = useStore();
  const [body, setBody] = useState("");
  const [image, setImage] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const replyFileRef = useRef<HTMLInputElement | null>(null);

  const thread = forum.threads.find((t) => t.id === threadId);
  if (!thread) {
    return (
      <section className="flex min-h-screen flex-col items-center justify-center bg-cream px-6 text-center">
        <h1 className="font-display text-3xl font-extrabold text-ink">Discussion not found</h1>
        <button onClick={() => navigate("/forum")} className="btn-primary mt-8">Back to Forum</button>
      </section>
    );
  }

  const channel = forum.channels.find((c) => c.id === thread.channelId);
  const replies = forum.repliesOf(thread.id);
  const liked = user ? thread.likes.includes(user.id) : false;
  const canModerate = isAdmin || user?.id === thread.authorId;

  const attachReplyImage = async (file?: File) => {
    if (!file) return;
    try {
      const data = await readForumImage(file);
      setImage(data);
      setErr(null);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Could not attach image.");
    }
    if (replyFileRef.current) replyFileRef.current.value = "";
  };

  const post = (e: React.FormEvent) => {
    e.preventDefault();
    const res = forum.createReply(thread.id, body, image || undefined);
    if (!res.ok) { setErr(res.error ?? "Could not post reply."); return; }
    setBody(""); setImage(null); setErr(null);
  };

  return (
    <>
      <section className="relative isolate overflow-hidden bg-ink text-white">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(60%_60%_at_80%_10%,rgba(220,53,69,0.28),transparent_60%)]" />
        <div className="container-x pb-12 pt-36 md:pt-44">
          <nav className="mb-5 flex flex-wrap items-center gap-2 text-sm text-white/55">
            <button onClick={() => navigate("/forum")} className="hover:text-white">Forum</button>
            <ChevronRight className="h-3.5 w-3.5" />
            <button onClick={() => navigate(`/forum/${thread.channelId}`)} className="hover:text-white">{channel?.name}</button>
          </nav>
          {thread.pinned && (
            <span className="mb-3 inline-flex items-center gap-1.5 rounded-full bg-brand px-3 py-1 text-xs font-bold">
              <Pin className="h-3.5 w-3.5" /> Pinned
            </span>
          )}
          <h1 className="max-w-4xl font-display text-3xl font-extrabold leading-tight md:text-4xl">{thread.title}</h1>
          <div className="mt-5 flex flex-wrap items-center gap-4 text-sm">
            <Avatar src={thread.authorAvatar} name={thread.authorName} size={40} />
            <div>
              <p className="flex items-center gap-2 font-semibold">
                {thread.authorName}
                {thread.authorRole === "admin" && <span className="rounded bg-brand px-1.5 py-0.5 text-[10px] font-bold">MENTOR</span>}
              </p>
              <p className="text-white/50">{timeAgo(thread.createdAt)}</p>
            </div>
          </div>
        </div>
      </section>

      <section className="section bg-cream">
        <div className="container-x mx-auto max-w-3xl">
          {/* Original post */}
          <article className="rounded-3xl border border-line bg-white p-8 shadow-[0_18px_50px_-32px_rgba(22,24,28,0.3)]">
            {thread.body && (
              <p className="whitespace-pre-wrap text-[15px] leading-[1.85] text-ink/80">{renderTaggedText(thread.body)}</p>
            )}
            {thread.image && (
              <a href={thread.image} target="_blank" rel="noreferrer" className="mt-4 block overflow-hidden rounded-2xl border border-line">
                <img src={thread.image} alt="Attachment" className="max-h-[420px] w-full object-contain bg-cream" />
              </a>
            )}
            <div className="mt-7 flex flex-wrap items-center gap-3 border-t border-line pt-5">
              <button onClick={() => (isAuthed ? forum.toggleThreadLike(thread.id) : navigate("/login?next=/forum"))}
                className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition ${liked ? "bg-brand text-white" : "border border-line text-muted hover:border-brand hover:text-brand"}`}>
                <Heart className={`h-4 w-4 ${liked ? "fill-white" : ""}`} /> {thread.likes.length}
              </button>
              <span className="inline-flex items-center gap-2 rounded-full border border-line px-4 py-2 text-sm text-muted">
                <MessageCircle className="h-4 w-4" /> {replies.length} repl{replies.length === 1 ? "y" : "ies"}
              </span>
              {isAdmin && (
                <button onClick={() => forum.togglePin(thread.id)} className="inline-flex items-center gap-2 rounded-full border border-line px-4 py-2 text-sm text-muted transition hover:border-brand hover:text-brand">
                  <Pin className="h-4 w-4" /> {thread.pinned ? "Unpin" : "Pin"}
                </button>
              )}
              {canModerate && (
                <button onClick={() => { if (confirm("Delete this discussion and all replies?")) { forum.deleteThread(thread.id); navigate(`/forum/${thread.channelId}`); } }}
                  className="ml-auto inline-flex items-center gap-2 rounded-full border border-line px-4 py-2 text-sm text-muted transition hover:border-brand hover:text-brand">
                  <Trash2 className="h-4 w-4" /> Delete
                </button>
              )}
            </div>
          </article>

          {/* Replies */}
          <h2 className="mt-10 font-display text-xl font-extrabold text-ink">
            {replies.length} Repl{replies.length === 1 ? "y" : "ies"}
          </h2>

          <div className="mt-5 space-y-4">
            {replies.map((r) => {
              const rLiked = user ? r.likes.includes(user.id) : false;
              const canDel = isAdmin || user?.id === r.authorId;
              return (
                <div key={r.id} className="rounded-2xl border border-line bg-white p-6">
                  <div className="flex items-start gap-4">
                    <Avatar src={r.authorAvatar} name={r.authorName} size={40} />
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-display text-sm font-bold text-ink">{r.authorName}</span>
                        {r.authorRole === "admin" && <span className="rounded bg-ink px-1.5 py-0.5 text-[10px] font-bold text-white">MENTOR</span>}
                        <span className="text-xs text-muted">{timeAgo(r.createdAt)}</span>
                      </div>
                      {r.body && (
                        <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-ink/80">{renderTaggedText(r.body)}</p>
                      )}
                      {r.image && (
                        <a href={r.image} target="_blank" rel="noreferrer" className="mt-3 block overflow-hidden rounded-xl border border-line">
                          <img src={r.image} alt="Reply attachment" className="max-h-72 w-full object-contain bg-cream" />
                        </a>
                      )}
                      <div className="mt-3 flex items-center gap-3">
                        <button onClick={() => (isAuthed ? forum.toggleReplyLike(r.id) : navigate("/login?next=/forum"))}
                          className={`inline-flex items-center gap-1.5 text-xs font-semibold transition ${rLiked ? "text-brand" : "text-muted hover:text-brand"}`}>
                          <Heart className={`h-3.5 w-3.5 ${rLiked ? "fill-brand" : ""}`} /> {r.likes.length}
                        </button>
                        {canDel && (
                          <button onClick={() => { if (confirm("Delete this reply?")) forum.deleteReply(r.id); }}
                            className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted transition hover:text-brand">
                            <Trash2 className="h-3.5 w-3.5" /> Delete
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Reply box */}
          {isAuthed ? (
            <form onSubmit={post} className="mt-8 rounded-2xl border border-line bg-white p-6">
              <div className="flex gap-4">
                <Avatar src={user?.avatar} name={user?.nickname || `${user?.firstName} ${user?.lastName}`} size={40} />
                <div className="min-w-0 flex-1">
                  <MentionTextarea
                    rows={4}
                    value={body}
                    onChange={(val) => { setBody(val); setErr(null); }}
                    placeholder="Share your thoughts, answer the question, or ask a follow-up… Tag peers using @Name (e.g. @Kelechi, @Tonye)."
                    className="w-full resize-none rounded-xl border border-line bg-cream px-4 py-3 text-sm text-ink placeholder-muted/60 outline-none transition focus:border-brand focus:bg-white"
                  />
                  {image && (
                    <div className="relative mt-3 inline-block">
                      <img src={image} alt="Attachment preview" className="max-h-40 rounded-xl border border-line object-cover" />
                      <button type="button" onClick={() => setImage(null)}
                        className="absolute -right-2 -top-2 flex h-7 w-7 items-center justify-center rounded-full bg-ink text-white shadow">
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  )}
                  {err && <p className="mt-2 flex items-center gap-1.5 text-xs font-semibold text-brand"><AlertCircle className="h-3.5 w-3.5" /> {err}</p>}
                  <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <p className="text-xs text-muted">Posting as <strong className="text-ink">{user?.nickname || user?.firstName}</strong></p>
                      <button type="button" onClick={() => setBody((prev) => `${prev}${prev.endsWith(" ") || !prev ? "" : " "}@`)}
                        className="inline-flex items-center gap-1.5 rounded-full border border-line bg-white px-3 py-1.5 text-xs font-bold text-ink transition hover:border-brand hover:text-brand">
                        <AtSign className="h-3.5 w-3.5 text-brand" /> Tag Member
                      </button>
                      <button type="button" onClick={() => replyFileRef.current?.click()}
                        className="inline-flex items-center gap-1.5 rounded-full border border-line bg-white px-3 py-1.5 text-xs font-bold text-ink transition hover:border-brand hover:text-brand">
                        <ImagePlus className="h-3.5 w-3.5" /> Photo
                      </button>
                      <input ref={replyFileRef} type="file" accept="image/*" className="hidden"
                        onChange={(e) => void attachReplyImage(e.target.files?.[0])} />
                    </div>
                    <button type="submit" className="btn-primary !py-2.5"><Send className="h-4 w-4" /> Post Reply</button>
                  </div>
                </div>
              </div>
            </form>
          ) : (
            <div className="mt-8 rounded-2xl border border-dashed border-line bg-white p-8 text-center">
              <p className="text-muted">Log in to join this discussion.</p>
              <div className="mt-4 flex flex-wrap justify-center gap-3">
                <button onClick={() => navigate("/login?next=/forum")} className="btn-outline-dark">Log in</button>
                <button onClick={() => navigate("/signup?next=/forum")} className="btn-primary">Create account</button>
              </div>
            </div>
          )}
        </div>
      </section>
    </>
  );
}

/* ============================= Composer ============================= */

function Composer({ defaultChannel, onClose }: { defaultChannel?: string; onClose: () => void }) {
  const { forum } = useStore();
  const [channelId, setChannelId] = useState(defaultChannel ?? forum.channels[0].id);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [image, setImage] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement | null>(null);

  const attach = async (file?: File) => {
    if (!file) return;
    try {
      setImage(await readForumImage(file));
      setErr(null);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Could not attach image.");
    }
    if (fileRef.current) fileRef.current.value = "";
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const res = forum.createThread({ channelId, title, body, image: image || undefined });
    if (!res.ok) { setErr(res.error ?? "Could not post."); return; }
    onClose();
    navigate(`/forum/${channelId}/${res.id}`);
  };

  return (
    <div className="fixed inset-0 z-[80] flex items-start justify-center overflow-y-auto bg-ink/60 p-4 backdrop-blur-sm sm:items-center">
      <form onSubmit={submit} className="w-full max-w-2xl rounded-3xl border border-line bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-line px-6 py-4">
          <h3 className="font-display text-lg font-bold text-ink">Start a discussion</h3>
          <button type="button" onClick={onClose} className="rounded-lg p-1.5 text-muted transition hover:bg-cream hover:text-brand"><X className="h-5 w-5" /></button>
        </div>
        <div className="space-y-4 p-6">
          {err && (
            <div className="flex items-start gap-3 rounded-xl border border-brand/30 bg-brand-light p-4">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-brand" />
              <p className="text-sm text-ink/80">{err}</p>
            </div>
          )}
          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-muted">Channel</label>
            <select value={channelId} onChange={(e) => setChannelId(e.target.value)}
              className="w-full rounded-xl border border-line bg-cream px-4 py-3 text-sm outline-none focus:border-brand focus:bg-white">
              {forum.channels.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-muted">Title</label>
            <input value={title} onChange={(e) => { setTitle(e.target.value); setErr(null); }}
              placeholder="What's your question or topic?"
              className="w-full rounded-xl border border-line bg-cream px-4 py-3 text-sm outline-none focus:border-brand focus:bg-white" />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-muted">Message</label>
            <MentionTextarea
              rows={6}
              value={body}
              onChange={(val) => { setBody(val); setErr(null); }}
              placeholder="Give some context — what have you tried, what are you seeing on the chart? Type @ to tag mentors or peers."
              className="w-full resize-none rounded-xl border border-line bg-cream px-4 py-3 text-sm outline-none focus:border-brand focus:bg-white text-ink"
            />
          </div>

          {image && (
            <div className="relative inline-block">
              <img src={image} alt="Attachment preview" className="max-h-44 rounded-xl border border-line object-cover" />
              <button type="button" onClick={() => setImage(null)}
                className="absolute -right-2 -top-2 flex h-7 w-7 items-center justify-center rounded-full bg-ink text-white shadow">
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          )}

          <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
            <button type="button" onClick={() => fileRef.current?.click()}
              className="inline-flex items-center gap-1.5 rounded-full border border-line bg-white px-4 py-2 text-sm font-bold text-ink transition hover:border-brand hover:text-brand">
              <ImagePlus className="h-4 w-4" /> Add photo
            </button>
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={(e) => void attach(e.target.files?.[0])} />
            <div className="flex gap-3">
              <button type="button" onClick={onClose} className="btn-outline-dark !py-2.5">Cancel</button>
              <button type="submit" className="btn-primary !py-2.5"><Send className="h-4 w-4" /> Publish</button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
