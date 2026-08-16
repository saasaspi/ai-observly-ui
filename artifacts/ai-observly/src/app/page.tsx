"use client";
import { useState, useEffect, useRef } from "react";
import { PublicLayout } from "@/components/public-layout";
import Link from "next/link";
import {
  ArrowRight, CheckCircle2, AlertCircle, TrendingDown, DollarSign,
  Zap, BarChart2, Users, ChevronDown, ChevronUp,
  ArrowUpRight, GitBranch, CreditCard, MessageSquare,
} from "lucide-react";
import Image from "next/image";
import { urlFor } from "@/lib/sanity/image";

const faqs = [
  {
    q: "Isn't this the same as the usage dashboard my provider already gives me?",
    a: "No. Your provider dashboard shows you total tokens and total spend. It has no idea which customer, feature, or plan generated that spend — that mapping has to happen on your side, which is exactly what AI Observly does automatically.",
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
    q: "Can this actually help with pricing, or just reporting?",
    a: "Both. Once you can see which plans and which customers are margin-negative, you have the numbers to reprice a tier, add a usage cap, or have a direct conversation with a specific account — instead of raising prices across the board and hoping it fixes itself.",
  },
];

function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border border-border rounded-xl overflow-hidden bg-card shadow-sm cursor-pointer hover:-translate-y-0.5 hover:shadow-md transition-all duration-200" onClick={() => setOpen(!open)}>
      <div className="flex items-center justify-between p-6 gap-4">
        <h3 className="font-semibold text-foreground text-base leading-snug">{q}</h3>
        {open ? <ChevronUp className="w-5 h-5 text-muted-foreground shrink-0" /> : <ChevronDown className="w-5 h-5 text-muted-foreground shrink-0" />}
      </div>
      {open && <div className="px-6 pb-6 text-muted-foreground leading-relaxed border-t border-border pt-4">{a}</div>}
    </div>
  );
}

// ── Scroll-reveal: adds .is-revealed when element enters viewport ──────────────
function useScrollReveal() {
  useEffect(() => {
    const els = document.querySelectorAll<HTMLElement>("[data-reveal]");
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("is-revealed");
            observer.unobserve(e.target);
          }
        });
      },
      { threshold: 0.1, rootMargin: "0px 0px -40px 0px" }
    );
    els.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);
}

// ── Count-up animation for dashboard mockup numbers ───────────────────────────
function useCountUp(target: number, active: boolean, duration = 900): number {
  const [value, setValue] = useState(0);
  useEffect(() => {
    if (!active) return;
    const startTime = performance.now();
    const raf = (now: number) => {
      const t = Math.min((now - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - t, 3);
      setValue(Math.round(target * eased));
      if (t < 1) requestAnimationFrame(raf);
    };
    requestAnimationFrame(raf);
  }, [active, target, duration]);
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
    <div ref={ref} className="relative w-full max-w-2xl mx-auto mt-12 rounded-2xl border border-border shadow-2xl shadow-primary/10 bg-card overflow-hidden">
      {/* Browser chrome */}
      <div className="flex items-center gap-1.5 px-4 py-3 border-b border-border bg-muted/30">
        <div className="w-3 h-3 rounded-full bg-red-400/70" />
        <div className="w-3 h-3 rounded-full bg-yellow-400/70" />
        <div className="w-3 h-3 rounded-full bg-green-400/70" />
        <span className="ml-3 text-xs text-muted-foreground font-mono">AI Observly — Dashboard</span>
      </div>

      <div className="p-6 space-y-5">
        {/* Summary cards with count-up */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: "Total AI Cost", value: `$${cost.toLocaleString()}`, sub: "this month", color: "text-foreground" },
            { label: "Total Revenue", value: `$${revenue.toLocaleString()}`, sub: "attributed", color: "text-foreground" },
            { label: "Net Margin", value: `+$${profit.toLocaleString()}`, sub: "from AI features", color: "text-green-600" },
          ].map((s) => (
            <div key={s.label} className="bg-background border border-border rounded-lg p-3">
              <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1">{s.label}</p>
              <p className={`text-xl font-bold font-outfit ${s.color}`}>{s.value}</p>
              <p className="text-[10px] text-muted-foreground">{s.sub}</p>
            </div>
          ))}
        </div>

        {/* Bar chart with grow-up animation */}
        <div className="bg-background border border-border rounded-lg p-4">
          <p className="text-xs font-semibold text-muted-foreground mb-3">Monthly AI Cost vs Revenue</p>
          <div className="flex items-end gap-1.5 h-20">
            {bars.map((h, i) => (
              <div
                key={i}
                className="flex-1 rounded-t-sm bg-primary/20 hover:bg-primary/40"
                style={{
                  height: animated ? `${(h / max) * 100}%` : "0%",
                  transition: `height 0.6s cubic-bezier(0.16, 1, 0.3, 1) ${i * 40}ms`,
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
          <div className="px-4 py-2 border-b border-border flex justify-between text-[10px] font-semibold text-muted-foreground uppercase">
            <span>Customer</span><span>AI Cost</span><span>Margin</span>
          </div>
          {[
            { name: "Acme Corp", cost: "$380", margin: "-$60", status: "bg-red-500", neg: true },
            { name: "Verity Labs", cost: "$315", margin: "+$95", status: "bg-yellow-500", neg: false },
            { name: "Moonshot AI", cost: "$95", margin: "+$315", status: "bg-green-500", neg: false },
          ].map((c) => (
            <div key={c.name} className="flex items-center justify-between px-4 py-2 border-b border-border last:border-0">
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${c.status}`} />
                <span className="text-xs font-medium">{c.name}</span>
              </div>
              <span className="text-xs text-muted-foreground">{c.cost}</span>
              <span className={`text-xs font-bold ${c.neg ? "text-red-600" : "text-green-600"}`}>{c.margin}</span>
            </div>
          ))}
        </div>
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

function LatestFromBlog() {
  const [posts, setPosts] = useState<BlogPost[]>([]);

  useEffect(() => {
    fetch("/napi/recent-posts?limit=3")
      .then((r) => r.json())
      .then((data) => setPosts(Array.isArray(data) ? data.slice(0, 3) : []))
      .catch(() => {});
  }, []);

  if (posts.length === 0) return null;

  return (
    <section id="blog-preview" className="py-24 px-6 bg-background">
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
            className="shrink-0 text-sm font-medium text-primary hover:underline underline-offset-2 flex items-center gap-1"
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
                className="group flex flex-col bg-card border border-border rounded-xl overflow-hidden hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
              >
                {imageUrl ? (
                  <div className="relative w-full aspect-[16/9] overflow-hidden bg-muted">
                    <Image
                      src={imageUrl}
                      alt={post.title}
                      fill
                      className="object-cover group-hover:scale-[1.02] transition-transform duration-300"
                      sizes="(max-width: 768px) 100vw, 33vw"
                    />
                  </div>
                ) : (
                  <div className="w-full aspect-[16/9] bg-primary/5" />
                )}
                <div className="p-5 flex flex-col flex-1">
                  <p className="text-[11px] text-muted-foreground mb-2">
                    {formatBlogDate(post.publishedAt)}
                  </p>
                  <h3 className="font-bold font-outfit text-foreground group-hover:text-primary transition-colors leading-snug mb-2 line-clamp-2">
                    {post.title}
                  </h3>
                  {post.metaDescription && (
                    <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3 flex-1">
                      {post.metaDescription}
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
      {/* ── HERO ── */}
      <section id="hero" className="relative pt-28 pb-10 px-6 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/8 via-background to-background pointer-events-none" />
        <div className="max-w-5xl mx-auto text-center relative z-10">

          {/* Badge — entrance d0 */}
          <div className="animate-hero animate-hero-d0 inline-flex items-center rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary mb-8 shadow-sm">
            <span className="flex h-2 w-2 rounded-full bg-primary mr-2 animate-pulse" />
            AI cost &amp; margin visibility for founders
          </div>

          {/* Headline — entrance d1 */}
          <h1 className="animate-hero animate-hero-d1 text-5xl md:text-7xl font-bold tracking-tight mb-6 font-outfit text-foreground leading-[1.08]">
            Your AI bill keeps climbing.{" "}
            <span className="text-primary">Do you know who&apos;s driving it up?</span>
          </h1>

          {/* Subtext — entrance d2 */}
          <p className="animate-hero animate-hero-d2 text-xl text-muted-foreground mb-10 max-w-2xl mx-auto leading-relaxed">
            AI Observly attributes every OpenAI, Anthropic, and Gemini call to a customer, a feature, and a plan — so you can see margin, not just spend.
          </p>

          {/* CTAs — entrance d3 */}
          <div className="animate-hero animate-hero-d3 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/signup"
              className="inline-flex items-center justify-center h-14 px-8 text-lg font-medium rounded-lg bg-primary text-primary-foreground hover:opacity-90 hover:-translate-y-0.5 hover:shadow-lg transition-all duration-200 w-full sm:w-auto shadow-sm"
              data-testid="hero-cta"
            >
              Start monitoring now <ArrowRight className="ml-2 w-5 h-5" />
            </Link>
            <a
              href="#how-it-works"
              className="inline-flex items-center justify-center h-14 px-8 text-lg font-medium rounded-lg border border-border bg-card hover:bg-muted hover:-translate-y-0.5 hover:shadow-md transition-all duration-200 w-full sm:w-auto"
            >
              See how to integrate
            </a>
          </div>

          {/* Optional note under CTAs */}
          <p className="animate-hero animate-hero-d3 text-sm text-muted-foreground mt-5">
            No data engineer required — one identifier per call is all it takes.
          </p>

          {/* Dashboard mockup — entrance d4 */}
          <div className="animate-hero animate-hero-d4">
            <DashboardMockup />
          </div>
        </div>
      </section>

      {/* ── PROBLEM ── */}
      <section id="problem" className="py-24 px-6 bg-background">
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
                title: "Invoice up, MRR flat — no explanation",
                desc: "Your provider invoice goes up every month, faster than MRR — and the total number alone can't tell you why.",
                delay: "0s",
              },
              {
                icon: AlertCircle,
                color: "text-yellow-600",
                bg: "bg-yellow-50 border-yellow-100",
                title: "One customer costs more than they pay",
                desc: "One customer could be costing you more than they pay you, and you won't find out until months of margin have already leaked away.",
                delay: "0.1s",
              },
              {
                icon: TrendingDown,
                color: "text-blue-500",
                bg: "bg-blue-50 border-blue-100",
                title: "Free-tier users eating your AI budget",
                desc: "Trial and low-tier users might be quietly eating a disproportionate share of your AI spend, with zero revenue to show for it.",
                delay: "0s",
              },
              {
                icon: BarChart2,
                color: "text-purple-500",
                bg: "bg-purple-50 border-purple-100",
                title: "You don't know which plan covers its AI cost",
                desc: "You don't actually know which pricing plan covers its own AI cost — and which one is subsidized by every other customer.",
                delay: "0.1s",
              },
            ].map(({ icon: Icon, color, bg, title, desc, delay }) => (
              <div
                key={title}
                data-reveal
                style={{ transitionDelay: delay }}
                className={`rounded-xl border p-6 hover:-translate-y-0.5 hover:shadow-md transition-all duration-200 ${bg}`}
              >
                <Icon className={`w-8 h-8 ${color} mb-4`} />
                <h3 className="font-bold text-lg mb-2 text-foreground">{title}</h3>
                <p className="text-muted-foreground leading-relaxed text-sm">{desc}</p>
              </div>
            ))}

            {/* 5th card — spans full width */}
            <div
              data-reveal
              style={{ transitionDelay: "0.1s" }}
              className="md:col-span-2 rounded-xl border bg-foreground/5 border-foreground/10 p-6 hover:-translate-y-0.5 hover:shadow-md transition-all duration-200 flex flex-col sm:flex-row items-start sm:items-center gap-4"
            >
              <Zap className="w-8 h-8 text-primary shrink-0" />
              <div>
                <h3 className="font-bold text-lg mb-1 text-foreground">Some features are cash cows. Others lose money on every call.</h3>
                <p className="text-muted-foreground leading-relaxed text-sm">Some of your AI features are probably cash cows. Others are losing money on every call. Right now, you can&apos;t tell which is which.</p>
              </div>
            </div>
          </div>

          {/* Closing line */}
          <p data-reveal style={{ transitionDelay: "0.2s" }} className="text-center text-muted-foreground text-lg mt-12 max-w-2xl mx-auto font-medium">
            Total bill is one number. MRR is another.{" "}
            <span className="text-foreground font-semibold">AI Observly is the bridge between them.</span>
          </p>
        </div>
      </section>

      {/* ── SOLUTION OVERVIEW ── */}
      <section id="solution" className="py-20 px-6 bg-primary/5 border-y border-primary/10">
        <div className="max-w-3xl mx-auto text-center">
          <p data-reveal className="text-sm font-semibold uppercase tracking-widest text-primary mb-3">The fix</p>
          <h2 data-reveal style={{ transitionDelay: "0.08s" }} className="text-3xl md:text-4xl font-bold font-outfit mb-6">
            From &ldquo;here&apos;s the invoice&rdquo; to &ldquo;here&apos;s the margin&rdquo;
          </h2>
          <p data-reveal style={{ transitionDelay: "0.16s" }} className="text-muted-foreground text-lg leading-relaxed">
            AI Observly sits between your LLM provider and your product, tagging every request with a <code className="text-primary bg-primary/10 px-1.5 py-0.5 rounded text-sm font-mono">customer_id</code>, a feature, and a plan. Instead of one flat number at the end of the month, you get a live P&amp;L for your AI spend — who costs you the most, what it costs to run each feature, and whether each pricing tier is actually profitable.
          </p>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section id="how-it-works" className="py-24 px-6 bg-card border-y border-border">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <p data-reveal className="text-sm font-semibold uppercase tracking-widest text-primary mb-3">Setup in minutes</p>
            <h2 data-reveal style={{ transitionDelay: "0.08s" }} className="text-3xl md:text-4xl font-bold font-outfit mb-4">Three steps from raw invoice to real margin</h2>
            <p data-reveal style={{ transitionDelay: "0.16s" }} className="text-muted-foreground text-lg max-w-xl mx-auto">No rebuild required. No data engineering stack. One identifier per call is all it takes.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-12 relative">
            <div className="hidden md:block absolute top-6 left-[calc(16.67%+1rem)] right-[calc(16.67%+1rem)] h-px bg-border" />
            {[
              { num: "1", title: "Connect", desc: "Point AI Observly at your OpenAI, Anthropic, or Gemini usage. Attach a customer_id, feature tag, and plan to your existing calls — no rebuild required.", note: "~2 minutes", delay: "0s" },
              { num: "2", title: "Attribute", desc: "Every request is automatically mapped to the customer, feature, and plan that generated it. No spreadsheets, no manual tagging after the fact.", note: "~5 lines of code", delay: "0.1s" },
              { num: "3", title: "Decide", desc: "Your dashboard surfaces cost, margin, and ROI at the customer, feature, and plan level — so pricing, roadmap, and account decisions are based on data, not a hunch.", note: "Live in seconds", delay: "0.2s" },
            ].map(({ num, title, desc, note, delay }) => (
              <div key={num} data-reveal style={{ transitionDelay: delay }} className="relative flex flex-col items-start">
                <div className="w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xl font-bold font-outfit mb-6 shadow-md z-10">{num}</div>
                <span className="text-xs font-semibold text-primary uppercase tracking-wider mb-2">{note}</span>
                <h3 className="text-xl font-bold mb-3 text-foreground">{title}</h3>
                <p className="text-muted-foreground leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
          <div data-reveal className="mt-12 text-center">
            <Link href="/docs" className="inline-flex items-center gap-2 text-primary font-medium hover:underline text-sm">
              Read the full integration guide <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section id="features" className="py-24 px-6 bg-background">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <p data-reveal className="text-sm font-semibold uppercase tracking-widest text-primary mb-3">Core features</p>
            <h2 data-reveal style={{ transitionDelay: "0.08s" }} className="text-3xl md:text-4xl font-bold font-outfit mb-4">Built for the questions your invoice can&apos;t answer</h2>
            <p data-reveal style={{ transitionDelay: "0.16s" }} className="text-muted-foreground text-lg max-w-xl mx-auto">Every feature is designed around the cost and margin questions your provider dashboard was never built to answer.</p>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            {[
              {
                icon: Users,
                title: "Per-Customer Cost Attribution",
                desc: "Every API call gets mapped to the customer_id that triggered it. Instantly see your top spenders, find the small slice of users eating most of your bill, and catch a margin-negative account before it costs you a full quarter.",
                delay: "0s",
              },
              {
                icon: Zap,
                title: "Per-Feature Margins & ROI",
                desc: "See exactly what each AI feature costs to run against what it earns you. Spot the feature that's a genuine cash cow, and the one that's technically 'used' but quietly losing money on every invocation — so you know what to double down on and what to re-scope or retire.",
                delay: "0.1s",
              },
              {
                icon: CreditCard,
                title: "Plan & Pricing Profitability",
                desc: "Break down AI cost by pricing tier. See which plans generate enough revenue to cover the AI cost they create, and which ones are being subsidized by your other customers — so your next pricing change is based on actual unit economics, not a guess.",
                delay: "0s",
              },
              {
                icon: TrendingDown,
                title: "Trial & Free-Tier Cost Tracking",
                desc: "Isolate how much of your total AI spend is going to trial and free-tier users before they ever convert. Set usage guardrails with real numbers instead of finding out after the invoice lands.",
                delay: "0.1s",
              },
            ].map(({ icon: Icon, title, desc, delay }) => (
              <div
                key={title}
                data-reveal
                style={{ transitionDelay: delay }}
                className="flex gap-5 p-6 rounded-xl border border-border bg-card shadow-sm hover:-translate-y-0.5 hover:shadow-md transition-all duration-200"
              >
                <div className="w-11 h-11 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
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

      {/* ── QUIZ PROMO TILE ── */}
      <section className="py-10 px-6 bg-background">
        <div className="max-w-5xl mx-auto">
          <div
            data-reveal
            className="flex flex-col sm:flex-row items-center gap-6 bg-primary/5 border border-primary/20 rounded-2xl px-8 py-7 hover:-translate-y-0.5 hover:shadow-md transition-all duration-200"
          >
            <div className="flex-1 text-center sm:text-left">
              <h3 className="text-xl font-bold font-outfit text-foreground mb-1">
                Not sure where your AI budget is going?
              </h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Take our free 90-second quiz to find your biggest AI cost blind spot — and see what it might be costing you.
              </p>
            </div>
            <Link
              href="/blind-spot-quiz"
              className="shrink-0 inline-flex items-center gap-2 px-6 py-2.5 rounded-lg bg-primary text-primary-foreground font-semibold text-sm hover:opacity-90 hover:-translate-y-0.5 hover:shadow-md transition-all duration-200 shadow-sm"
            >
              Take the free quiz →
            </Link>
          </div>
        </div>
      </section>

      {/* ── WHO IT'S FOR ── */}
      <section id="who-its-for" className="py-24 px-6 bg-card border-y border-border">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <p data-reveal className="text-sm font-semibold uppercase tracking-widest text-primary mb-3">Built for</p>
            <h2 data-reveal style={{ transitionDelay: "0.08s" }} className="text-3xl md:text-4xl font-bold font-outfit mb-4">
              Built for the people who have to answer<br className="hidden md:block" /> &ldquo;why did the AI bill go up again?&rdquo;
            </h2>
          </div>
          <div className="grid md:grid-cols-2 gap-8 items-start">
            <div data-reveal className="bg-primary/5 border border-primary/20 rounded-2xl p-8 hover:-translate-y-0.5 hover:shadow-md transition-all duration-200">
              <div className="flex items-center gap-3 mb-6">
                <Users className="w-6 h-6 text-primary" />
                <h3 className="text-xl font-bold font-outfit text-primary">Who this is for</h3>
              </div>
              <ul className="space-y-4">
                {[
                  { label: "Founders of B2B SaaS with AI features", detail: "who need to know which customers, features, and plans are margin-negative before it shows up in the burn rate." },
                  { label: "Product managers", detail: "deciding which AI feature to invest in next — and which one to quietly sunset." },
                  { label: "Anyone pricing an AI product", detail: "who wants their tiers to actually cover the AI cost they create, instead of finding out at renewal." },
                ].map(({ label, detail }) => (
                  <li key={label} className="flex items-start gap-3 text-sm text-foreground">
                    <CheckCircle2 className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                    <span><strong>{label}</strong> {detail}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div data-reveal style={{ transitionDelay: "0.1s" }} className="bg-muted/50 border border-border rounded-2xl p-8 hover:-translate-y-0.5 hover:shadow-md transition-all duration-200">
              <h3 className="text-xl font-bold font-outfit mb-2">How we compare</h3>
              <p className="text-muted-foreground text-sm mb-6">Tools like <strong>Langfuse</strong>, <strong>Helicone</strong>, and <strong>Datadog</strong> are powerful — but they&apos;re built for engineering teams. We&apos;re the plain-English margin visibility tool for founders who need to know if their AI is making money.</p>
              <div className="space-y-3 text-sm">
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
        </div>
      </section>

      {/* ── SOCIAL PROOF ── */}
      <section id="social-proof" className="py-24 px-6 bg-background">
        <div className="max-w-5xl mx-auto text-center">
          <div data-reveal className="inline-flex items-center rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary mb-8">
            <GitBranch className="w-4 h-4 mr-2" /> Built in public
          </div>
          <h2 data-reveal style={{ transitionDelay: "0.08s" }} className="text-3xl md:text-4xl font-bold font-outfit mb-4">Trusted by early builders</h2>
          <p data-reveal style={{ transitionDelay: "0.16s" }} className="text-muted-foreground text-lg mb-12 max-w-lg mx-auto">Join 143+ founders already on the waitlist — and growing.</p>
          <div className="grid md:grid-cols-3 gap-6 text-left mb-12">
            {[
              { quote: "Finally. I've been staring at my OpenAI bill every month wondering which customer is eating it. This is exactly what I needed.", name: "Sarah K.", role: "Solo founder, AI writing tool", avatar: "SK", delay: "0s" },
              { quote: "I repriced my Pro plan within a week of seeing the real cost breakdown by tier. Already back in the black on AI.", name: "Marcus T.", role: "Indie hacker, productivity SaaS", avatar: "MT", delay: "0.1s" },
              { quote: "Langfuse was overkill for what I needed. AI Observly took 10 minutes to set up and showed me which features were losing money.", name: "Priya R.", role: "Founder, AI customer support tool", avatar: "PR", delay: "0.2s" },
            ].map(({ quote, name, role, avatar, delay }) => (
              <div
                key={name}
                data-reveal
                style={{ transitionDelay: delay }}
                className="bg-card border border-border rounded-xl p-6 shadow-sm flex flex-col gap-4 hover:-translate-y-0.5 hover:shadow-md transition-all duration-200"
              >
                <MessageSquare className="w-5 h-5 text-primary/50" />
                <p className="text-foreground text-sm leading-relaxed flex-1">&ldquo;{quote}&rdquo;</p>
                <div className="flex items-center gap-3 pt-2 border-t border-border">
                  <div className="w-9 h-9 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center font-outfit">{avatar}</div>
                  <div><p className="text-sm font-semibold text-foreground">{name}</p><p className="text-xs text-muted-foreground">{role}</p></div>
                </div>
              </div>
            ))}
          </div>
          <div className="flex items-center justify-center gap-8 flex-wrap">
            {[{ label: "AI providers supported", value: "3+" },{ label: "Avg setup time", value: "< 10 min" }].map(({ label, value }) => (
              <div key={label} data-reveal className="text-center">
                <p className="text-3xl font-bold font-outfit text-primary">{value}</p>
                <p className="text-sm text-muted-foreground">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── LATEST FROM BLOG ── */}
      <LatestFromBlog />

      {/* ── FAQ ── */}
      <section id="faq" className="py-24 px-6 bg-background">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <p data-reveal className="text-sm font-semibold uppercase tracking-widest text-primary mb-3">FAQs</p>
            <h2 data-reveal style={{ transitionDelay: "0.08s" }} className="text-3xl md:text-4xl font-bold font-outfit">Frequently asked questions</h2>
          </div>
          <div data-reveal className="space-y-3">{faqs.map((faq) => <FaqItem key={faq.q} {...faq} />)}</div>
        </div>
      </section>

      {/* ── FINAL CTA ── */}
      <section id="cta" className="py-28 px-6 bg-gradient-to-br from-primary/5 via-background to-indigo-50/40 border-t border-border">
        <div className="max-w-2xl mx-auto text-center">
          <div data-reveal className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center text-primary mx-auto mb-6 shadow-sm">
            <ArrowUpRight className="w-8 h-8" />
          </div>
          <h2 data-reveal style={{ transitionDelay: "0.08s" }} className="text-3xl md:text-4xl font-bold font-outfit mb-4">Stop finding out about margin-negative customers three months late.</h2>
          <p data-reveal style={{ transitionDelay: "0.16s" }} className="text-muted-foreground text-lg mb-10 max-w-lg mx-auto">See your AI spend broken down by customer, feature, and plan — not just as one line on an invoice.</p>
          <div data-reveal style={{ transitionDelay: "0.24s" }}>
            <Link
              href="/pricing"
              className="inline-flex items-center justify-center h-14 px-8 text-lg font-medium rounded-lg bg-primary text-primary-foreground hover:opacity-90 hover:-translate-y-0.5 hover:shadow-lg transition-all duration-200 shadow-sm"
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
