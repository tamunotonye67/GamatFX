import { useMemo, useState } from "react";
import PageHero from "../components/PageHero";
import PageCta from "../components/PageCta";
import { POSTS, CATEGORIES, getPost, fmtPostDate, type Post, type Block } from "../lib/blog";
import { useStore, type StaffPost } from "../lib/store";

const FALLBACK_IMG = "https://images.pexels.com/videos/38484636/bitcoin-crypto-forex-hacker-38484636.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=720&w=1280";

/** Converts a staff-written article into the shape the blog renderer expects. */
function staffToPost(s: StaffPost): Post {
  const body: Block[] = s.body.split(/\n{2,}/).map((chunk) => {
    const t = chunk.trim();
    if (t.startsWith("##")) return { t: "h", v: t.replace(/^#+\s*/, "") };
    if (t.startsWith(">")) return { t: "quote", v: t.replace(/^>\s*/, "") };
    if (/^[-*]\s/m.test(t)) {
      return { t: "list", v: t.split("\n").map((l) => l.replace(/^[-*]\s*/, "").trim()).filter(Boolean) };
    }
    return { t: "p", v: t };
  });
  return {
    slug: s.slug,
    title: s.title,
    excerpt: s.excerpt || s.body.slice(0, 160),
    category: (s.category as Post["category"]) ?? "Fundamentals",
    author: s.authorName,
    authorRole: "GAMAT Fx Academy",
    date: s.createdAt,
    readMins: Math.max(2, Math.round(s.body.split(/\s+/).length / 200)),
    image: s.image || FALLBACK_IMG,
    tags: s.tags,
    body,
  };
}
import { navigate } from "../lib/router";
import { useReveal } from "../lib/useReveal";
import {
  Clock, ChevronRight, ArrowUpRight, Search, Tag, ArrowLeft,
  Share2, Send, Link2, CheckCircle2,
} from "lucide-react";

/* ============================== Blog list ============================== */

export function BlogPage() {
  const [cat, setCat] = useState<(typeof CATEGORIES)[number]>("All");
  const [q, setQ] = useState("");
  const { ref, visible } = useReveal<HTMLDivElement>();
  const { publishedPosts } = useStore();

  // Merge editorial posts with anything published by staff writers.
  const ALL = useMemo<Post[]>(() => [
    ...publishedPosts.map(staffToPost),
    ...POSTS,
  ], [publishedPosts]);

  const featured = ALL.find((p) => p.featured) ?? ALL[0];

  const list = useMemo(() => ALL.filter((p) => {
    const mc = cat === "All" || p.category === cat;
    const mq = `${p.title} ${p.excerpt} ${p.tags.join(" ")}`.toLowerCase().includes(q.toLowerCase());
    return mc && mq && p.slug !== featured?.slug;
  }), [cat, q, featured?.slug, ALL]);

  return (
    <>
      <PageHero
        crumb="Blog"
        eyebrow="Insights & education"
        image="/images/hero.jpg"
        title={<>The GAMAT <span className="text-brand">Trading Journal</span></>}
        subtitle="Practical articles on forex fundamentals, technical analysis, risk management and trading psychology — written by the mentors who teach them."
      />

      {/* Featured */}
      <section className="section bg-cream">
        <div className="container-x">
          <button onClick={() => navigate(`/blog/${featured.slug}`)}
            className="group grid w-full gap-8 overflow-hidden rounded-3xl border border-line bg-white text-left shadow-[0_20px_55px_-32px_rgba(22,24,28,0.35)] transition hover:-translate-y-1.5 lg:grid-cols-2">
            <div className="relative min-h-[280px] overflow-hidden">
              <img src={featured.image} alt={featured.title} className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
              <span className="absolute left-5 top-5 rounded-full bg-brand px-3 py-1 text-xs font-bold text-white">Featured</span>
            </div>
            <div className="flex flex-col justify-center p-8 lg:pr-12">
              <span className="chip w-fit">{featured.category}</span>
              <h2 className="mt-4 font-display text-2xl font-extrabold leading-snug text-ink md:text-3xl">{featured.title}</h2>
              <p className="mt-3 text-muted">{featured.excerpt}</p>
              <div className="mt-6 flex flex-wrap items-center gap-4 text-sm text-muted">
                <span className="font-semibold text-ink">{featured.author}</span>
                <span>{fmtPostDate(featured.date)}</span>
                <span className="inline-flex items-center gap-1.5"><Clock className="h-3.5 w-3.5 text-brand" /> {featured.readMins} min read</span>
              </div>
              <span className="mt-6 inline-flex items-center gap-1.5 font-bold text-brand">
                Read article <ArrowUpRight className="h-4 w-4" />
              </span>
            </div>
          </button>
        </div>
      </section>

      {/* Filters + grid */}
      <section className="section bg-white pt-0">
        <div ref={ref} className="container-x">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap gap-2.5">
              {CATEGORIES.map((c) => (
                <button key={c} onClick={() => setCat(c)}
                  className={`rounded-full px-5 py-2 text-sm font-semibold transition ${
                    cat === c ? "bg-brand text-white shadow-sm" : "border border-line bg-white text-ink/70 hover:border-brand hover:text-brand"
                  }`}>{c}</button>
              ))}
            </div>
            <div className="relative w-full sm:max-w-xs">
              <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
              <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search articles…"
                className="w-full rounded-xl border border-line bg-white py-2.5 pl-10 pr-4 text-sm outline-none focus:border-brand" />
            </div>
          </div>

          {list.length ? (
            <div className="mt-10 grid gap-7 md:grid-cols-2 lg:grid-cols-3">
              {list.map((p, i) => <PostCard key={p.slug} p={p} delay={(i % 3) * 100} visible={visible} />)}
            </div>
          ) : (
            <p className="mt-14 rounded-2xl border border-dashed border-line bg-cream p-14 text-center text-muted">
              No articles match your search.
            </p>
          )}
        </div>
      </section>

      <PageCta tone="red" title="Want this taught properly?"
        body="Our courses turn these concepts into a repeatable process with live mentorship and accountability."
        primaryLabel="Browse Courses" primaryTo="/courses" />
    </>
  );
}

function PostCard({ p, delay, visible }: { p: Post; delay: number; visible: boolean }) {
  return (
    <button onClick={() => navigate(`/blog/${p.slug}`)}
      className={`group flex flex-col overflow-hidden rounded-3xl border border-line bg-white text-left shadow-[0_18px_50px_-32px_rgba(22,24,28,0.3)] transition-all duration-300 hover:-translate-y-1.5 hover:shadow-[0_30px_60px_-30px_rgba(22,24,28,0.42)] reveal ${visible ? "is-visible" : ""}`}
      style={{ transitionDelay: `${delay}ms` }}>
      <div className="relative overflow-hidden">
        <img src={p.image} alt={p.title} className="aspect-[16/10] w-full object-cover transition duration-500 group-hover:scale-105" />
        <span className="absolute left-4 top-4 rounded-full bg-white/95 px-3 py-1 text-xs font-bold text-brand">{p.category}</span>
      </div>
      <div className="flex flex-1 flex-col p-6">
        <h3 className="font-display text-lg font-bold leading-snug text-ink group-hover:text-brand">{p.title}</h3>
        <p className="mt-2 line-clamp-3 flex-1 text-sm leading-relaxed text-muted">{p.excerpt}</p>
        <div className="mt-5 flex items-center justify-between border-t border-line pt-4 text-xs text-muted">
          <span className="font-semibold text-ink">{p.author}</span>
          <span className="inline-flex items-center gap-1.5"><Clock className="h-3.5 w-3.5 text-brand" /> {p.readMins} min</span>
        </div>
      </div>
    </button>
  );
}

/* ============================= Article page ============================= */

export function BlogPostPage({ slug }: { slug: string }) {
  const { publishedPosts } = useStore();
  const staff = publishedPosts.find((p) => p.slug === slug);
  const post = getPost(slug) ?? (staff ? staffToPost(staff) : undefined);
  const [copied, setCopied] = useState(false);

  if (!post) {
    return (
      <section className="flex min-h-screen flex-col items-center justify-center bg-cream px-6 text-center">
        <h1 className="font-display text-3xl font-extrabold text-ink">Article not found</h1>
        <button onClick={() => navigate("/blog")} className="btn-primary mt-8">Back to Blog</button>
      </section>
    );
  }

  const related = POSTS.filter((p) => p.slug !== post.slug && p.category === post.category).slice(0, 3);
  const fill = POSTS.filter((p) => p.slug !== post.slug && !related.includes(p)).slice(0, 3 - related.length);
  const suggestions = [...related, ...fill];

  const share = (net: "x" | "in") => {
    const url = encodeURIComponent(window.location.href);
    const text = encodeURIComponent(post.title);
    const link = net === "x"
      ? `https://twitter.com/intent/tweet?text=${text}&url=${url}`
      : `https://www.linkedin.com/sharing/share-offsite/?url=${url}`;
    window.open(link, "_blank", "noopener");
  };

  return (
    <>
      {/* Hero */}
      <section className="relative isolate overflow-hidden bg-ink text-white">
        <div className="absolute inset-0 -z-10">
          <img src={post.image} alt="" aria-hidden className="h-full w-full object-cover opacity-25" />
          <div className="absolute inset-0 bg-gradient-to-br from-ink via-ink/95 to-[#0c0d10]" />
        </div>
        <div className="container-x pb-16 pt-36 md:pt-44">
          <nav className="mb-6 flex flex-wrap items-center gap-2 text-sm text-white/55">
            <button onClick={() => navigate("/")} className="hover:text-white">Home</button>
            <ChevronRight className="h-3.5 w-3.5" />
            <button onClick={() => navigate("/blog")} className="hover:text-white">Blog</button>
            <ChevronRight className="h-3.5 w-3.5" />
            <span className="text-brand-light">{post.category}</span>
          </nav>

          <span className="chip">{post.category}</span>
          <h1 className="mt-4 max-w-4xl font-display text-3xl font-extrabold leading-[1.15] md:text-5xl">{post.title}</h1>

          <div className="mt-7 flex flex-wrap items-center gap-5 border-t border-white/10 pt-6 text-sm">
            <span className="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-brand to-brand-dark font-bold">
              {post.author.split(" ").map((w) => w[0]).slice(0, 2).join("")}
            </span>
            <div>
              <p className="font-semibold">{post.author}</p>
              <p className="text-white/50">{post.authorRole}</p>
            </div>
            <span className="text-white/50">{fmtPostDate(post.date)}</span>
            <span className="inline-flex items-center gap-1.5 text-white/50"><Clock className="h-4 w-4 text-brand" /> {post.readMins} min read</span>
          </div>
        </div>
      </section>

      {/* Body */}
      <section className="section bg-cream">
        <div className="container-x grid gap-10 lg:grid-cols-[1fr_260px]">
          <article className="rounded-3xl border border-line bg-white p-8 shadow-[0_20px_55px_-35px_rgba(22,24,28,0.3)] md:p-12">
            <img src={post.image} alt="" className="mb-10 aspect-[16/8] w-full rounded-2xl object-cover" />
            {post.body.map((b, i) => {
              if (b.t === "h") return <h2 key={i} className="mt-10 font-display text-2xl font-extrabold text-ink">{b.v}</h2>;
              if (b.t === "quote") return (
                <blockquote key={i} className="my-8 rounded-2xl border-l-4 border-brand bg-brand-light p-6">
                  <p className="font-display text-lg font-bold italic leading-snug text-ink">"{b.v}"</p>
                </blockquote>
              );
              if (b.t === "list") return (
                <ul key={i} className="my-6 space-y-3">
                  {b.v.map((li) => (
                    <li key={li} className="flex items-start gap-3 text-[15px] leading-relaxed text-ink/80">
                      <CheckCircle2 className="mt-1 h-4 w-4 shrink-0 text-brand" /> {li}
                    </li>
                  ))}
                </ul>
              );
              return <p key={i} className="mt-5 text-[15px] leading-[1.85] text-ink/80">{b.v}</p>;
            })}

            {/* Tags + share */}
            <div className="mt-12 flex flex-wrap items-center justify-between gap-5 border-t border-line pt-7">
              <div className="flex flex-wrap gap-2">
                {post.tags.map((t) => (
                  <span key={t} className="inline-flex items-center gap-1.5 rounded-full bg-cream px-3 py-1.5 text-xs font-semibold text-muted">
                    <Tag className="h-3 w-3 text-brand" /> {t}
                  </span>
                ))}
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-muted">Share</span>
                <IconLink onClick={() => share("x")}><Share2 className="h-4 w-4" /></IconLink>
                <IconLink onClick={() => share("in")}><Send className="h-4 w-4" /></IconLink>
                <IconLink onClick={() => { void navigator.clipboard?.writeText(window.location.href); setCopied(true); setTimeout(() => setCopied(false), 2000); }}>
                  {copied ? <CheckCircle2 className="h-4 w-4 text-brand" /> : <Link2 className="h-4 w-4" />}
                </IconLink>
              </div>
            </div>

            <button onClick={() => navigate("/blog")} className="btn-outline-dark mt-8">
              <ArrowLeft className="h-4 w-4" /> Back to all articles
            </button>
          </article>

          {/* Sidebar */}
          <aside className="space-y-6">
            <div className="sticky top-24 space-y-6">
              <div className="rounded-2xl border border-line bg-white p-6">
                <p className="text-xs font-bold uppercase tracking-wide text-muted">Written by</p>
                <div className="mt-4 flex items-center gap-3">
                  <span className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-brand to-brand-dark text-sm font-bold text-white">
                    {post.author.split(" ").map((w) => w[0]).slice(0, 2).join("")}
                  </span>
                  <div>
                    <p className="font-display text-sm font-bold text-ink">{post.author}</p>
                    <p className="text-xs text-muted">{post.authorRole}</p>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl bg-gradient-to-br from-brand to-brand-dark p-6 text-white">
                <h3 className="font-display text-lg font-bold">Learn this properly</h3>
                <p className="mt-2 text-sm text-white/85">Turn these ideas into a repeatable process with live mentorship.</p>
                <button onClick={() => navigate("/courses")} className="mt-5 inline-flex items-center gap-2 rounded-full bg-white px-5 py-2.5 text-sm font-bold text-brand transition hover:-translate-y-0.5">
                  View Courses <ArrowUpRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </aside>
        </div>
      </section>

      {/* Related */}
      <section className="section bg-white">
        <div className="container-x">
          <h2 className="section-title text-center">Keep reading</h2>
          <div className="mt-10 grid gap-7 md:grid-cols-3">
            {suggestions.map((p) => <PostCard key={p.slug} p={p} delay={0} visible />)}
          </div>
        </div>
      </section>
    </>
  );
}

function IconLink({ children, onClick }: { children: React.ReactNode; onClick: () => void }) {
  return (
    <button onClick={onClick} className="rounded-lg border border-line p-2 text-muted transition hover:border-brand hover:text-brand">
      {children}
    </button>
  );
}
