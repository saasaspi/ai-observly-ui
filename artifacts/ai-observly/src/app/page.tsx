"use client";
import { useState, useEffect, useRef } from "react";
import { PublicLayout } from "@/components/public-layout";
import { SetupPaths } from "@/components/setup-paths";
import { PositioningMatrix } from "@/components/positioning-matrix";
import Link from "@/components/public-link";
import {
  ArrowRight, CheckCircle2, AlertCircle, TrendingDown, DollarSign,
  Zap, BarChart2, Users, ChevronDown, ChevronUp,
  ArrowUpRight, GitBranch, CreditCard, MessageSquare,
  PiggyBank, Gauge, ShieldAlert,
} from "lucide-react";
import Image from "next/image";
import { urlFor } from "@/lib/sanity/image";
import { NEW_FEATURES, LAUNCH_POST } from "@/lib/new-features";
import { useHomepagePosts } from "@/components/homepage-content";
import { JsonLd } from "@/components/seo";
import { applicationSchema, faqSchema, SITE_URL } from "@/lib/seo";

const faqs = [
  {
    q: "Isn't this the same as the usage dashboard my provider already gives me?",
    a: "No. Your provider dashboard shows you total tokens and total spend. It has no idea which customer, feature, or plan generated that spend, that mapping has to happen on your side, which is exactly what AI Observly does automatically.",
  },
  {
    q: "Do I need to rebuild anything to set this up?",
    a: "No. If you can pass a customer_id (or similar identifier) alongside your existing API calls, you can get customer- and feature-level breakdowns without a rebuild.",
  },
  {
    q: "What LLM providers do you support?",
    a: "OpenAI, Anthropic, and Gemini today, with more being added.",
  },
  {
    q: "Does it show more than cost?",
    a: "Yes. Alongside cost and margin, AI Savings shows how much repeated work you reuse instead of paying full price for, AI Response Speed shows how long customers wait, and AI Reliability shows what failed requests cost and why they happened.",
  },
  {
    q: "Can this actually help with pricing, or just reporting?",
    a: "Both. Once you can see which plans and which customers are margin-negative, you have the numbers to reprice a tier, add a usage cap, or have a direct conversation with a specific account, instead of raising prices across the board and hoping it fixes itself.",
  },
];

function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="pub-card !p-0 overflow-hidden bg-card cursor-pointer" onClick={() => setOpen(!open)}>
      <div className="flex items-center justify-between p-6 gap-4">
        <h3 className="font-semibold text-foreground text-base leading-snug">{q}</h3>
        {open ? <ChevronUp className="w-5 h-5 text-muted-foreground shrink-0" /> : <ChevronDown className="w-5 h-5 text-muted-foreground shrink-0" />}
      </div>
      <div hidden={!open} className="px-6 pb-6 text-muted-foreground leading-relaxed border-t border-border pt-4">{a}</div>
    </div>
  );
}

// ── Scroll-reveal: adds .is-revealed when element enters viewport ──────────────
function useScrollReveal() {
  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const show = (el: Element) => el.classList.add("is-revealed");
    if (reduce || typeof IntersectionObserver === "undefined") {
      document.querySelectorAll("[data-reveal]").forEach(show);
      return;
    }
    const seen = new WeakSet<Element>();
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            show(e.target);
            observer.unobserve(e.target);
          }
        });
      },
      { threshold: 0.1, rootMargin: "0px 0px -40px 0px" }
    );
    const scan = (root: ParentNode) => {
      root.querySelectorAll<HTMLElement>("[data-reveal]").forEach((el) => {
        if (seen.has(el) || el.classList.contains("is-revealed")) return;
        seen.add(el);
        observer.observe(el);
      });
    };
    scan(document);
    // Pick up async-rendered elements (e.g. blog cards)
    const mo = new MutationObserver((muts) => {
      if (muts.some((m) => m.addedNodes.length)) scan(document);
    });
    mo.observe(document.body, { childList: true, subtree: true });
    // Safety net: never leave content hidden
    const safety = window.setTimeout(() => {
      document.querySelectorAll("[data-reveal]:not(.is-revealed)").forEach((el) => {
        const r = el.getBoundingClientRect();
        if (r.top < window.innerHeight) show(el);
      });
    }, 2500);
    return () => {
      observer.disconnect();
      mo.disconnect();
      window.clearTimeout(safety);
    };
  }, []);
}

// ── Scroll progress bar (RAF-throttled, transform only) ───────────────────────
function ScrollProgress() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let raf = 0;
    const update = () => {
      raf = 0;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const p = max > 0 ? Math.min(window.scrollY / max, 1) : 0;
      if (ref.current) ref.current.style.transform = `scaleX(${p})`;
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);
  return <div ref={ref} aria-hidden className="hp-progress" />;
}

// ── Count-up animation for dashboard mockup numbers ───────────────────────────
function useCountUp(target: number, active: boolean, duration = 900): number {
  // Stable labels avoid repeated React renders and text-layout work during hydration.
  void active;
  void duration;
  const value = target;
  return value;
}

// ── Dashboard mockup with animated bars and count-up numbers ──────────────────
function DashboardMockup() {
  const ref = useRef<HTMLDivElement>(null);
  const [animated, setAnimated] = useState(false);

  const bars = [42, 58, 51, 76, 89, 95, 82, 110, 103, 127, 114, 140];
  const max = Math.max(...bars);

  const cost = useCountUp(1140, animated);
  const revenue = useCountUp(4200, animated);
  const profit = useCountUp(3060, animated);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches ||
        typeof IntersectionObserver === "undefined") {
      setAnimated(true);
      return;
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setAnimated(true);
          observer.disconnect();
        }
      },
      { threshold: 0.3 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref} className={`hp-float ${animated ? "hp-live" : ""} relative w-full max-w-2xl mx-auto mt-12 rounded-2xl border border-border shadow-2xl shadow-primary/10 bg-card overflow-hidden`}>
      <span aria-hidden className="hp-sheen" />
      {/* Browser chrome */}
      <div className="flex flex-wrap items-center gap-x-1.5 gap-y-1 px-4 py-3 border-b border-border bg-muted/30">
        <div className="hidden sm:block w-3 h-3 rounded-full bg-red-400/70" />
        <div className="hidden sm:block w-3 h-3 rounded-full bg-yellow-400/70" />
        <div className="hidden sm:block w-3 h-3 rounded-full bg-green-400/70" />
        <span className="sm:ml-3 text-xs font-semibold sm:font-normal text-foreground sm:text-muted-foreground">Sample dashboard</span>
        <span className="ml-auto rounded-full border border-dashed border-primary/40 bg-primary/5 px-2 py-0.5 text-[10px] sm:text-[11px] font-semibold uppercase tracking-wider text-primary">Illustrative</span>
      </div>

      <div className="p-4 sm:p-6 space-y-4 sm:space-y-5">
        {/* Summary cards with count-up */}
        <div className="grid grid-cols-3 gap-2 sm:gap-4">
          {[
            { label: "Total AI Cost", value: `$${cost.toLocaleString()}`, sub: "this month", color: "text-foreground" },
            { label: "Total Revenue", value: `$${revenue.toLocaleString()}`, sub: "attributed", color: "text-foreground" },
            { label: "Net Margin", value: `+$${profit.toLocaleString()}`, sub: "from AI features", color: "text-green-600" },
          ].map((s, i) => (
            <div key={s.label} className="hp-mock-in bg-background border border-border rounded-lg p-2 sm:p-3 min-w-0" style={{ transitionDelay: `${i * 90}ms` }}>
              <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide sm:tracking-wider mb-1 leading-tight">{s.label}</p>
              <p className={`text-base sm:text-xl font-bold font-outfit leading-tight ${s.color}`}>{s.value}</p>
              <p className="text-[10px] text-muted-foreground leading-snug">{s.sub}</p>
            </div>
          ))}
        </div>

        {/* Bar chart with grow-up animation */}
        <div className="hidden sm:block bg-background border border-border rounded-lg p-4">
          <p className="text-xs font-semibold text-foreground mb-3">Monthly AI cost, sample trend</p>
          <div className="flex items-end gap-1.5 h-20">
            {bars.map((h, i) => (
              <div
                key={i}
                className="flex-1 rounded-t-sm bg-primary/20 hover:bg-primary/40"
                style={{
                  height: `${(h / max) * 100}%`,
                  transformOrigin: "bottom",
                  transition: `transform 0.6s cubic-bezier(0.16, 1, 0.3, 1) ${i * 40}ms`,
                }}
              />
            ))}
          </div>
          <div className="flex justify-between mt-2">
            {["Aug","Sep","Oct","Nov","Dec","Jan","Feb","Mar","Apr","May","Jun","Jul"].map((m) => (
              <span key={m} className="text-[9px] text-muted-foreground font-mono">{m}</span>
            ))}
          </div>
        </div>

        {/* Customer rows */}
        <div className="bg-background border border-border rounded-lg overflow-hidden">
          <div className="px-4 py-2 border-b border-border grid grid-cols-[minmax(0,1fr)_4.5rem_4.5rem] gap-2 text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">
            <span>Customer</span><span className="text-right">AI cost</span><span className="text-right">Margin</span>
          </div>
          {[
            { name: "Acme Corp", cost: "$380", margin: "-$60", status: "bg-red-500", neg: true },
            { name: "Verity Labs", cost: "$315", margin: "+$95", status: "bg-yellow-500", neg: false },
            { name: "Moonshot AI", cost: "$95", margin: "+$315", status: "bg-green-500", neg: false },
          ].map((c, i) => (
            <div key={c.name} style={{ transitionDelay: `${500 + i * 120}ms` }} className="hp-mock-in grid grid-cols-[minmax(0,1fr)_4.5rem_4.5rem] gap-2 items-center px-4 py-2.5 border-b border-border last:border-0">
              <div className="flex items-center gap-2 min-w-0">
                <div className={`w-2 h-2 shrink-0 rounded-full ${c.status} ${c.neg ? "hp-alert-dot" : ""}`} />
                <span className="text-xs font-medium truncate">{c.name}</span>
              </div>
              <span className="text-xs text-muted-foreground text-right tabular-nums">{c.cost}</span>
              <span className={`text-xs font-bold text-right tabular-nums ${c.neg ? "text-red-600" : "text-green-600"}`}>{c.margin}</span>
            </div>
          ))}
        </div>
        <p className="text-[11px] text-muted-foreground text-center">Illustrative example, not live customer data.</p>
      </div>
    </div>
  );
}

// ── Latest from Blog section ─────────────────────────────────────────────────

type BlogPost = {
  _id: string
  title: string
  slug: string
  coverImage?: unknown
  publishedAt: string
  metaDescription?: string
  topic?: string
}

function formatBlogDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

const noDash = (t: string) => t.replace(/\s*[\u2014]\s*/g, ", ");

function LatestFromBlog() {
  const posts = useHomepagePosts();


  if (posts.length === 0) return null;

  return (
    <section id="blog-preview" className="pub-section py-16 md:py-24 px-6 bg-background">
      <div className="max-w-5xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-12">
          <div>
            <p className="text-sm font-semibold uppercase tracking-widest text-primary mb-3">
              From the blog
            </p>
            <h2 className="text-3xl md:text-4xl font-bold font-outfit">
              Latest insights on AI cost &amp; margin
            </h2>
          </div>
          <Link
            href="/blog"
            className="pub-link shrink-0"
          >
            View all posts <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {posts.map((post, i) => {
            let imageUrl: string | null = null;
            try {
              if (post.coverImage) {
                imageUrl = urlFor(post.coverImage as Parameters<typeof urlFor>[0])
                  .width(600)
                  .height(340)
                  .fit("crop")
                  .auto("format")
                  .url();
              }
            } catch {}

            return (
              <Link
                key={post._id}
                href={`/blog/${post.slug}`}
                data-reveal
                style={{ transitionDelay: `${i * 90}ms` }}
                className="group pub-card pub-card-link bg-card !p-0 overflow-hidden"
              >
                {imageUrl ? (
                  <div className="relative w-full aspect-[16/9] overflow-hidden bg-muted">
                    <Image
                      src={imageUrl}
                      alt={noDash(post.title)}
                      fill
                      className="object-cover group-hover:scale-[1.02] transition-transform duration-300"
                      sizes="(max-width: 768px) 100vw, 33vw"
                    />
                  </div>
                ) : (
                  <div className="w-full aspect-[16/9] bg-primary/5" />
                )}
                <div className="p-6 flex flex-col flex-1">
                  <p className="text-[11px] text-muted-foreground mb-2">
                    {formatBlogDate(post.publishedAt)}
                  </p>
                  <h3 className="font-bold font-outfit text-foreground group-hover:text-primary transition-colors leading-snug mb-2 line-clamp-2">
                    {noDash(post.title)}
                  </h3>
                  {post.metaDescription && (
                    <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3 flex-1">
                      {noDash(post.metaDescription)}
                    </p>
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}

// ── Landing page ───────────────────────────────────────────────────────────────
export default function LandingPage() {
  useScrollReveal();

  return (
    <PublicLayout>
      <JsonLd data={{ "@context": "https://schema.org", "@type": "WebSite", name: "AI Observly", url: SITE_URL }} />
      <JsonLd data={applicationSchema("/")} />
      <JsonLd data={faqSchema(faqs.map(({ q, a }) => ({ question: q, answer: a })))} />
      <ScrollProgress />
      {/* ── HERO ── */}
      <section id="hero" className="relative pt-28 pb-10 px-6 overflow-hidden">
        <div aria-hidden className="hp-orb hp-orb-a" />
        <div aria-hidden className="hp-orb hp-orb-b" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/8 via-background to-background pointer-events-none" />
        <div className="max-w-5xl mx-auto text-center relative z-10">

          {/* Badge, entrance d0 */}
          <div className="animate-hero animate-hero-d0 inline-flex items-center rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary mb-8 shadow-sm">
            <span className="hp-ping relative flex h-2 w-2 rounded-full bg-primary mr-2" />
            AI cost &amp; margin visibility for founders
          </div>

          {/* Headline, entrance d1 */}
          <h1 className="animate-hero animate-hero-d1 text-5xl md:text-7xl font-bold tracking-tight mb-6 font-outfit text-foreground leading-[1.08]">
            Your AI bill keeps climbing.{" "}
            <span className="hp-shimmer text-primary">Do you know who&apos;s driving it up?</span>
          </h1>

          {/* Subtext, entrance d2 */}
          <p className="animate-hero animate-hero-d2 text-xl text-muted-foreground mb-12 max-w-xl mx-auto leading-relaxed">
            See which customer, feature, and plan each OpenAI, Anthropic, and Gemini call belongs to. Know your margin, not just your spend.
          </p>

          {/* CTAs, entrance d3 */}
          <div className="animate-hero animate-hero-d3 flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-5">
            <Link
              href="/signup"
              className="pub-btn pub-btn-primary pub-btn-lg w-full sm:w-auto"
              data-testid="hero-cta"
            >
              Start monitoring now <ArrowRight className="hp-arrow ml-2 w-5 h-5" />
            </Link>
            <a
              href="/docs"
              className="pub-btn pub-btn-secondary pub-btn-lg w-full sm:w-auto"
            >
              See how to integrate
            </a>
          </div>

          {/* Optional note under CTAs */}
          <p className="animate-hero animate-hero-d3 text-sm text-muted-foreground mt-6">
            No data engineer needed. One identifier per call.
          </p>

          {/* Dashboard mockup, entrance d4 */}
          <div className="animate-hero animate-hero-d4">
            <DashboardMockup />
          </div>
        </div>
      </section>

      {/* ── PROBLEM ── */}
      <section id="problem" className="pub-section py-16 md:py-24 px-6 bg-background">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <p data-reveal className="text-sm font-semibold uppercase tracking-widest text-primary mb-3">Sound familiar?</p>
            <h2 data-reveal style={{ transitionDelay: "0.08s" }} className="text-3xl md:text-4xl font-bold font-outfit">
              The total bill was never the problem. The blind spot is.
            </h2>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {[
              {
                icon: DollarSign,
                color: "text-red-500",
                bg: "bg-red-50 border-red-100",
                title: "Invoice up, MRR flat, no explanation",
                desc: "Your provider invoice outpaces MRR, and the total can't say why.",
                delay: "0s",
              },
              {
                icon: AlertCircle,
                color: "text-yellow-600",
                bg: "bg-yellow-50 border-yellow-100",
                title: "One customer costs more than they pay",
                desc: "One account may cost more than it pays, and you find out months late.",
                delay: "0.1s",
              },
              {
                icon: TrendingDown,
                color: "text-blue-500",
                bg: "bg-blue-50 border-blue-100",
                title: "Free-tier users eating your AI budget",
                desc: "Trial and low-tier users may use a big share of spend with no revenue.",
                delay: "0s",
              },
              {
                icon: BarChart2,
                color: "text-purple-500",
                bg: "bg-purple-50 border-purple-100",
                title: "You don't know which plan covers its AI cost",
                desc: "Which plan covers its own AI cost, and which is subsidized?",
                delay: "0.1s",
              },
            ].map(({ icon: Icon, color, bg, title, desc, delay }) => (
              <div
                key={title}
                data-reveal
                style={{ transitionDelay: delay }}
                className={`pub-card ${bg}`}
              >
                <Icon className={`hp-icon w-8 h-8 ${color} mb-4`} />
                <h3 className="font-bold text-lg mb-2 text-foreground">{title}</h3>
                <p className="text-muted-foreground leading-relaxed text-sm">{desc}</p>
              </div>
            ))}

            {/* 5th card, spans full width */}
            <div
              data-reveal
              style={{ transitionDelay: "0.1s" }}
              className="md:col-span-2 pub-card bg-foreground/5 border-foreground/10 flex flex-col sm:flex-row items-start sm:items-center gap-4"
            >
              <Zap className="w-8 h-8 text-primary shrink-0" />
              <div>
                <h3 className="font-bold text-lg mb-1 text-foreground">Some features are cash cows. Others lose money on every call.</h3>
                <p className="text-muted-foreground leading-relaxed text-sm">Some AI features earn their keep. Others lose money on every call. Today you can&apos;t tell which.</p>
              </div>
            </div>
          </div>

          {/* Closing line */}
          <p data-reveal style={{ transitionDelay: "0.2s" }} className="text-center text-muted-foreground text-lg mt-10 md:mt-12 max-w-2xl mx-auto font-medium">
            Total bill is one number. MRR is another.{" "}
            <span className="text-foreground font-semibold">AI Observly is the bridge between them.</span>
          </p>
        </div>
      </section>

      <SetupPaths />

      {/* ── FEATURES ── */}
      <section id="features" className="pub-section py-16 md:py-24 px-6 bg-background">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <p data-reveal className="text-sm font-semibold uppercase tracking-widest text-primary mb-3">Core features</p>
            <h2 data-reveal style={{ transitionDelay: "0.08s" }} className="text-3xl md:text-4xl font-bold font-outfit mb-4">Built for the questions your invoice can&apos;t answer</h2>
            <p data-reveal style={{ transitionDelay: "0.16s" }} className="text-muted-foreground text-lg max-w-xl mx-auto">Answers your provider dashboard can't give.</p>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            {[
              {
                icon: Users,
                title: "Per-Customer Cost Attribution",
                desc: "Every call maps to its customer_id. See top spenders and catch a margin-negative account early.",
                delay: "0s",
              },
              {
                icon: Zap,
                title: "Per-Feature Margins & ROI",
                desc: "Compare what each AI feature costs with what it earns. Know what to grow, re-scope, or retire.",
                delay: "0.1s",
              },
              {
                icon: CreditCard,
                title: "Plan & Pricing Profitability",
                desc: "See AI cost by pricing tier. Find plans that cover their cost, and plans others subsidize.",
                delay: "0s",
              },
              {
                icon: TrendingDown,
                title: "Trial & Free-Tier Cost Tracking",
                desc: "See how much spend goes to trial and free users. Set usage guardrails with real numbers.",
                delay: "0.1s",
              },
            ].map(({ icon: Icon, title, desc, delay }) => (
              <div
                key={title}
                data-reveal
                style={{ transitionDelay: delay }}
                className="pub-card pub-card-row bg-card"
              >
                <div className="hp-icon w-11 h-11 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-foreground mb-2">{title}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── NEW: SAVINGS / SPEED / RELIABILITY ── */}
      <section id="new-capabilities" className="pub-section py-16 md:py-24 px-6 bg-primary/5 border-y border-primary/10">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <p data-reveal className="text-sm font-semibold uppercase tracking-widest text-primary mb-3">New</p>
            <h2 data-reveal style={{ transitionDelay: "0.08s" }} className="text-3xl md:text-4xl font-bold font-outfit mb-4">Beyond the bill: savings, speed, and reliability</h2>
            <p data-reveal style={{ transitionDelay: "0.16s" }} className="text-muted-foreground text-lg max-w-xl mx-auto">Three plain-language views of what your AI does for customers and budget.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {NEW_FEATURES.map((f, i) => {
              const Icon = f.key === "savings" ? PiggyBank : f.key === "speed" ? Gauge : ShieldAlert;
              return (
                <Link
                  key={f.href}
                  href={f.href}
                  data-reveal
                  style={{ transitionDelay: `${i * 90}ms` }}
                  className="group pub-card pub-card-link bg-card"
                >
                  <div className="hp-icon w-11 h-11 rounded-lg bg-primary/10 text-primary flex items-center justify-center mb-4">
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="font-bold font-outfit text-foreground group-hover:text-primary transition-colors mb-1">{f.title}</h3>
                  <p className="text-sm font-medium text-foreground/80 mb-2">{f.tagline}</p>
                  <p className="text-sm text-muted-foreground leading-relaxed mb-4">{f.desc}</p>
                  <span className="pub-card-action">
                    Learn more <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </Link>
              );
            })}
          </div>
          <p data-reveal className="text-center mt-10 text-sm">
            <Link href={`/blog/${LAUNCH_POST.slug}`} className="pub-link">
              Read the plain-language guide to all three
            </Link>
          </p>
        </div>
      </section>

      {/* ── QUIZ PROMO SECTION ── */}
      <section className="pub-section py-16 md:py-24 px-6 bg-primary/5 border-y border-primary/10">
        <div className="max-w-3xl mx-auto text-center">
          <p data-reveal className="text-xs font-bold uppercase tracking-widest text-primary mb-4">
            Find Your AI Blind Spot Quiz
          </p>
          <h2
            data-reveal
            style={{ transitionDelay: "0.08s" }}
            className="text-3xl md:text-4xl font-bold font-outfit text-foreground mb-4 leading-snug"
          >
            How well do you actually know your AI economics?
          </h2>
          <p
            data-reveal
            style={{ transitionDelay: "0.14s" }}
            className="text-muted-foreground text-lg leading-relaxed mb-6 max-w-xl mx-auto"
          >
            Eight quick questions on what you spend, who drives it, and whether you would notice a change.
          </p>
          <div
            data-reveal
            style={{ transitionDelay: "0.20s" }}
            className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm text-muted-foreground mb-10"
          >
            {["8 questions", "~90 seconds", "Nothing saved or uploaded"].map((item) => (
              <span key={item} className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
                {item}
              </span>
            ))}
          </div>
          <div data-reveal style={{ transitionDelay: "0.26s" }}>
            <Link
              href="/blind-spot-quiz"
              className="pub-btn pub-btn-primary pub-btn-lg"
            >
              Start the Quiz
            </Link>
          </div>
        </div>
      </section>

      {/* ── WHO IT'S FOR ── */}
      <section id="who-its-for" className="pub-section py-16 md:py-24 px-6 bg-card border-y border-border">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <p data-reveal className="text-sm font-semibold uppercase tracking-widest text-primary mb-3">Built for</p>
            <h2 data-reveal style={{ transitionDelay: "0.08s" }} className="text-3xl md:text-4xl font-bold font-outfit mb-4">
              Built for the people who have to answer<br className="hidden md:block" /> &ldquo;why did the AI bill go up again?&rdquo;
            </h2>
          </div>

          {/* 5 persona cards */}
          <div data-reveal className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-10">
            {[
              { label: "SaaS Founders", detail: "Know which customers and plans are margin-negative before it shows up in your burn rate.", Icon: DollarSign, href: "/use-cases/founders" },
              { label: "Product Managers", detail: "See per-feature AI cost and bring real unit economics into every roadmap call.", Icon: BarChart2, href: "/use-cases/product-managers" },
              { label: "Customer Success", detail: "Catch usage spikes and margin problems before the renewal call, not during it.", Icon: Users, href: "/use-cases/customer-success" },
              { label: "Engineering", detail: "One fire-and-forget call gets you cost attribution, no proxy, no stored API keys.", Icon: Zap, href: "/use-cases/engineering" },
              { label: "Finance & Ops", detail: "Per-customer and per-plan cost data, the missing input for your unit economics model.", Icon: CreditCard, href: "/use-cases/finance" },
            ].map(({ label, detail, Icon, href }) => (
              <Link
                key={href}
                href={href}
                className="group pub-card pub-card-link bg-background gap-4"
              >
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                  <Icon className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-bold font-outfit text-foreground group-hover:text-primary transition-colors mb-1.5">{label}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{detail}</p>
                </div>
                <span className="pub-card-action">
                  Learn more <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </Link>
            ))}
          </div>

          {/* Comparison table */}
          <div data-reveal style={{ transitionDelay: "0.1s" }} className="pub-card bg-muted/50 p-6 sm:p-8">
            <h3 className="text-xl font-bold font-outfit mb-2">How we compare</h3>
            <p className="text-muted-foreground text-sm mb-6"><strong>Langfuse</strong>, <strong>Helicone</strong>, and <strong>Datadog</strong> are built for engineers. We show founders, in plain English, if AI makes money.</p>
            <div className="grid sm:grid-cols-2 gap-4 text-sm">
              {[
                { them: "Complex setup & SDKs", us: "One fire-and-forget call" },
                { them: "Traces, spans, waterfall views", us: "Margin & cost in plain dollars" },
                { them: "Built for DevOps teams", us: "Built for founders & PMs" },
                { them: "Starts at $100+/mo", us: "Free tier, then $29/mo" },
              ].map((row) => (
                <div key={row.them} className="grid grid-cols-2 gap-3">
                  <div className="flex items-center gap-2 text-muted-foreground"><span className="w-1.5 h-1.5 rounded-full bg-muted-foreground/50 shrink-0" />{row.them}</div>
                  <div className="flex items-center gap-2 text-green-700 font-medium"><CheckCircle2 className="w-3.5 h-3.5 text-green-600 shrink-0" />{row.us}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── POSITIONING MATRIX ── */}
      <PositioningMatrix />

      {/* ── LATEST FROM BLOG ── */}
      <LatestFromBlog />

      {/* ── FAQ ── */}
      <section id="faq" className="pub-section py-16 md:py-24 px-6 bg-background">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <p data-reveal className="text-sm font-semibold uppercase tracking-widest text-primary mb-3">FAQs</p>
            <h2 data-reveal style={{ transitionDelay: "0.08s" }} className="text-3xl md:text-4xl font-bold font-outfit">Frequently asked questions</h2>
          </div>
          <div data-reveal className="space-y-3">{faqs.map((faq) => <FaqItem key={faq.q} {...faq} />)}</div>
        </div>
      </section>

      {/* ── FINAL CTA ── */}
      <section id="cta" className="py-20 md:py-28 px-6 bg-gradient-to-br from-primary/5 via-background to-indigo-50/40 border-t border-border">
        <div className="max-w-2xl mx-auto text-center">
          <div data-reveal className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center text-primary mx-auto mb-6 shadow-sm">
            <ArrowUpRight className="w-8 h-8" />
          </div>
          <h2 data-reveal style={{ transitionDelay: "0.08s" }} className="text-3xl md:text-4xl font-bold font-outfit mb-4">Stop finding out about margin-negative customers three months late.</h2>
          <p data-reveal style={{ transitionDelay: "0.16s" }} className="text-muted-foreground text-lg mb-10 max-w-lg mx-auto">See AI spend by customer, feature, and plan, not one invoice line.</p>
          <div data-reveal style={{ transitionDelay: "0.24s" }}>
            <Link
              href="/pricing"
              className="pub-btn pub-btn-primary pub-btn-lg w-full sm:w-auto"
              data-testid="btn-cta-bottom"
            >
              Start monitoring now <ArrowRight className="ml-2 w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}
