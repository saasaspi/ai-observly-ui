"use client";
import { useState, useEffect, useRef } from "react";
import { PublicLayout } from "@/components/public-layout";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useSubmitWaitlist } from "@/hooks/use-api";
import {
  ArrowRight, CheckCircle2, AlertCircle, TrendingDown, DollarSign,
  Zap, Bell, BarChart2, Users, ChevronDown, ChevronUp,
  ArrowUpRight, GitBranch, Clock, MessageSquare,
} from "lucide-react";

const waitlistSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
});

const faqs = [
  { q: "Do I need to change my code or rewrite anything?", a: "No rewrites needed. You add one background fetch() call after each AI response — your existing AI calls, API keys, and logic stay exactly the same. If you use an AI coding tool like Cursor, Replit, or Lovable, we give you a copy-paste prompt that makes the change for you." },
  { q: "Which AI providers do you support?", a: "OpenAI, Anthropic, Google Gemini, Mistral, and any provider that returns token counts in their API response. If you're using OpenRouter or a custom endpoint, you can pass the token counts manually." },
  { q: "Is my data secure? Do you see my prompts?", a: "We never see your prompts or completions. We only receive metadata: model name, token counts, customer ID, and feature label — the same information you'd see on your OpenAI billing page. No message content ever touches our servers." },
  { q: "What if AI Observly goes down — will my app break?", a: "No. AI Observly sits completely outside your request path. Your app calls OpenAI/Anthropic directly with your own key; we only receive a background fire-and-forget report. If we're ever unavailable, the .catch(() => {}) on that fetch means your users never see an error." },
  { q: "Can I cancel or get a refund?", a: "Yes. Cancel any time from your settings — no questions asked. If you're on the Pro plan and unhappy within the first 14 days, we'll refund you in full." },
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
            { label: "Net Profit", value: `+$${profit.toLocaleString()}`, sub: "from AI features", color: "text-green-600" },
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
          <p className="text-xs font-semibold text-muted-foreground mb-3">Monthly AI Cost Trend</p>
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
            <span>Customer</span><span>Cost</span><span>Margin</span>
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

// ── Landing page ───────────────────────────────────────────────────────────────
export default function LandingPage() {
  useScrollReveal();

  const { toast } = useToast();
  const submitWaitlist = useSubmitWaitlist();

  const form = useForm<z.infer<typeof waitlistSchema>>({ resolver: zodResolver(waitlistSchema), defaultValues: { email: "" } });
  const formBottom = useForm<z.infer<typeof waitlistSchema>>({ resolver: zodResolver(waitlistSchema), defaultValues: { email: "" } });

  const handleWaitlist = (formInstance: typeof form) => (data: z.infer<typeof waitlistSchema>) => {
    submitWaitlist.mutate(data.email, {
      onSuccess: () => { toast({ title: "You're on the list!", description: "We'll notify you when early access is ready." }); formInstance.reset(); },
      onError: () => { toast({ title: "Something went wrong", description: "Please try again later.", variant: "destructive" }); },
    });
  };

  return (
    <PublicLayout>
      {/* ── HERO ── */}
      <section id="hero" className="relative pt-28 pb-10 px-6 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/8 via-background to-background pointer-events-none" />
        <div className="max-w-5xl mx-auto text-center relative z-10">

          {/* Badge — entrance d0 */}
          <div className="animate-hero animate-hero-d0 inline-flex items-center rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary mb-8 shadow-sm">
            <span className="flex h-2 w-2 rounded-full bg-primary mr-2 animate-pulse" />
            AI observability for founders, not engineers
          </div>

          {/* Headline — entrance d1 */}
          <h1 className="animate-hero animate-hero-d1 text-5xl md:text-7xl font-bold tracking-tight mb-6 font-outfit text-foreground leading-[1.08]">
            See what your AI is{" "}
            <span className="text-primary">actually costing you</span>
          </h1>

          {/* Subtext — entrance d2 */}
          <p className="animate-hero animate-hero-d2 text-xl text-muted-foreground mb-10 max-w-2xl mx-auto leading-relaxed">
            Track cost, latency, and errors across every AI API call — broken down by customer and feature — in minutes. No SDK rewrites. No DevOps.
          </p>

          {/* CTAs — entrance d3 */}
          <div className="animate-hero animate-hero-d3 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/signup"
              className="inline-flex items-center justify-center h-14 px-8 text-lg font-medium rounded-lg bg-primary text-primary-foreground hover:opacity-90 hover:-translate-y-0.5 hover:shadow-lg transition-all duration-200 w-full sm:w-auto shadow-sm"
              data-testid="hero-cta"
            >
              Start monitoring free <ArrowRight className="ml-2 w-5 h-5" />
            </Link>
            <a
              href="#how-it-works"
              className="inline-flex items-center justify-center h-14 px-8 text-lg font-medium rounded-lg border border-border bg-card hover:bg-muted hover:-translate-y-0.5 hover:shadow-md transition-all duration-200 w-full sm:w-auto"
            >
              See how it works
            </a>
          </div>

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
              You shipped an AI feature. Now you&apos;re flying blind.
            </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { icon: AlertCircle, color: "text-red-500", bg: "bg-red-50 border-red-100", title: "Surprise $800 OpenAI bill", desc: "You check your invoice at the end of the month and one customer has been hammering your chatbot — you had no idea until the charge hit.", delay: "0s" },
              { icon: TrendingDown, color: "text-yellow-600", bg: "bg-yellow-50 border-yellow-100", title: "No idea which feature is burning tokens", desc: "You have four AI features. One of them is unprofitable. You have no way to know which one — so you can't fix it, reprice it, or kill it.", delay: "0.1s" },
              { icon: Clock, color: "text-blue-500", bg: "bg-blue-50 border-blue-100", title: "Users complain about slowness — you can't tell why", desc: "Latency spikes when your app hits OpenAI during peak hours. Users churn. You don't have a latency breakdown by model or endpoint to debug it.", delay: "0.2s" },
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
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section id="how-it-works" className="py-24 px-6 bg-card border-y border-border">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <p data-reveal className="text-sm font-semibold uppercase tracking-widest text-primary mb-3">Setup in minutes</p>
            <h2 data-reveal style={{ transitionDelay: "0.08s" }} className="text-3xl md:text-4xl font-bold font-outfit mb-4">How it works</h2>
            <p data-reveal style={{ transitionDelay: "0.16s" }} className="text-muted-foreground text-lg max-w-xl mx-auto">No SDK rewrite. No DevOps. Three steps to clear AI margins.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-12 relative">
            <div className="hidden md:block absolute top-6 left-[calc(16.67%+1rem)] right-[calc(16.67%+1rem)] h-px bg-border" />
            {[
              { num: "1", title: "Generate your API key", desc: "Sign up, get your obs_live_... key in under two minutes. No credit card required for the free tier.", note: "~2 minutes", delay: "0s" },
              { num: "2", title: "Drop in one background call", desc: "After each AI response, fire a single fetch() to our endpoint — it never blocks your users and never touches your AI traffic.", note: "~5 lines of code", delay: "0.1s" },
              { num: "3", title: "See cost, latency & profit", desc: "Your dashboard shows every customer and feature: what it costs, what it earns, and whether it's actually worth keeping — in plain dollars.", note: "Live in seconds", delay: "0.2s" },
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
            <p data-reveal className="text-sm font-semibold uppercase tracking-widest text-primary mb-3">Everything you need</p>
            <h2 data-reveal style={{ transitionDelay: "0.08s" }} className="text-3xl md:text-4xl font-bold font-outfit mb-4">One dashboard. Every AI metric that matters.</h2>
            <p data-reveal style={{ transitionDelay: "0.16s" }} className="text-muted-foreground text-lg max-w-xl mx-auto">Stop guessing. Start knowing which features and customers are actually profitable.</p>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            {[
              { icon: DollarSign, title: "Cost breakdown by customer, feature & endpoint", desc: "See exactly how much each customer costs you in AI, and which feature is the biggest spend — so you can reprice, optimize, or cut the losers.", delay: "0s" },
              { icon: Zap, title: "Latency & error monitoring", desc: "Track p50/p95 latency per model and endpoint. Get alerted when error rates spike before users start tweeting about it.", delay: "0.1s" },
              { icon: Bell, title: "Alerts for spend spikes & failure rates", desc: "Set monthly cost limits or error thresholds per customer. Get a Slack or email alert the moment a customer starts burning through tokens.", delay: "0s" },
              { icon: BarChart2, title: "Model comparison", desc: "Running GPT-4o alongside Claude? See cost and latency side-by-side so you can pick the right model for each feature — and save money doing it.", delay: "0.1s" },
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

      {/* ── WHO IT'S FOR ── */}
      <section id="who-its-for" className="py-24 px-6 bg-card border-y border-border">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <p data-reveal className="text-sm font-semibold uppercase tracking-widest text-primary mb-3">Built for</p>
            <h2 data-reveal style={{ transitionDelay: "0.08s" }} className="text-3xl md:text-4xl font-bold font-outfit mb-4">The lightweight option for AI builders</h2>
            <p data-reveal style={{ transitionDelay: "0.16s" }} className="text-muted-foreground text-lg max-w-2xl mx-auto">Indie hackers, solo SaaS founders, and small teams shipping AI features without a dedicated data engineering stack.</p>
          </div>
          <div className="grid md:grid-cols-2 gap-8 items-start">
            <div data-reveal className="bg-primary/5 border border-primary/20 rounded-2xl p-8 hover:-translate-y-0.5 hover:shadow-md transition-all duration-200">
              <div className="flex items-center gap-3 mb-6">
                <Users className="w-6 h-6 text-primary" />
                <h3 className="text-xl font-bold font-outfit text-primary">AI Observly is for you if…</h3>
              </div>
              <ul className="space-y-3">
                {["You're a solo founder or small team shipping AI features","You're using OpenAI, Anthropic, or any major LLM provider","You want to know if your AI costs are eating your margins","You're non-technical or just don't want to maintain a metrics stack","You want setup in minutes, not a two-week integration sprint"].map((item) => (
                  <li key={item} className="flex items-start gap-3 text-sm text-foreground">
                    <CheckCircle2 className="w-4 h-4 text-primary mt-0.5 shrink-0" />{item}
                  </li>
                ))}
              </ul>
            </div>
            <div data-reveal style={{ transitionDelay: "0.1s" }} className="bg-muted/50 border border-border rounded-2xl p-8 hover:-translate-y-0.5 hover:shadow-md transition-all duration-200">
              <h3 className="text-xl font-bold font-outfit mb-2">How we compare</h3>
              <p className="text-muted-foreground text-sm mb-6">Tools like <strong>Langfuse</strong>, <strong>Helicone</strong>, and <strong>Datadog</strong> are powerful — but they&apos;re built for engineering teams. We&apos;re the plain-English option for founders who just want to know if their AI is making money.</p>
              <div className="space-y-3 text-sm">
                {[
                  { them: "Complex setup & SDKs", us: "One fire-and-forget call" },
                  { them: "Traces, spans, waterfall views", us: "Profit & cost in plain dollars" },
                  { them: "Built for DevOps teams", us: "Built for solo founders" },
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
              { quote: "Finally. I've been staring at my OpenAI bill every month wondering which feature is eating it. This is exactly what I needed.", name: "Sarah K.", role: "Solo founder, AI writing tool", avatar: "SK", delay: "0s" },
              { quote: "I repriced my Pro plan within a week of seeing the real cost breakdown. Already back in the black on AI.", name: "Marcus T.", role: "Indie hacker, productivity SaaS", avatar: "MT", delay: "0.1s" },
              { quote: "Langfuse was overkill for what I needed. AI Observly took 10 minutes to set up and showed me the numbers I actually care about.", name: "Priya R.", role: "Founder, AI customer support tool", avatar: "PR", delay: "0.2s" },
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
            {[{ label: "Waitlist signups", value: "143+" },{ label: "AI providers supported", value: "6+" },{ label: "Avg setup time", value: "< 10 min" }].map(({ label, value }) => (
              <div key={label} data-reveal className="text-center">
                <p className="text-3xl font-bold font-outfit text-primary">{value}</p>
                <p className="text-sm text-muted-foreground">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PRICING ── */}
      <section id="pricing" className="py-24 px-6 bg-card border-y border-border">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-14">
            <p data-reveal className="text-sm font-semibold uppercase tracking-widest text-primary mb-3">Pricing</p>
            <h2 data-reveal style={{ transitionDelay: "0.08s" }} className="text-3xl md:text-4xl font-bold font-outfit mb-4">Simple, founder-friendly pricing</h2>
            <p data-reveal style={{ transitionDelay: "0.16s" }} className="text-muted-foreground text-lg max-w-xl mx-auto">Generous free tier to prove the value. One paid plan when you&apos;re ready to scale.</p>
          </div>
          <div className="grid md:grid-cols-2 gap-8">
            <div data-reveal className="bg-background border border-border rounded-2xl p-8 flex flex-col hover:-translate-y-0.5 hover:shadow-md transition-all duration-200">
              <div className="mb-6">
                <h3 className="text-xl font-bold font-outfit mb-1">Free</h3>
                <p className="text-muted-foreground text-sm mb-4">Everything you need to get started.</p>
                <div className="flex items-baseline gap-1"><span className="text-4xl font-bold font-outfit">$0</span><span className="text-muted-foreground">/month</span></div>
              </div>
              <ul className="space-y-3 flex-1 mb-8">
                {["10,000 AI events/month","Up to 3 customers","Up to 3 features","7-day data history","Cost tracking","Basic latency stats"].map((f) => (
                  <li key={f} className="flex items-center gap-3 text-sm text-foreground"><CheckCircle2 className="w-4 h-4 text-green-500 shrink-0" />{f}</li>
                ))}
              </ul>
              <Link href="/signup" className="block text-center h-12 leading-[3rem] rounded-lg border border-border bg-muted hover:bg-muted/80 hover:-translate-y-0.5 hover:shadow-sm font-medium text-foreground transition-all duration-200" data-testid="pricing-free-cta">
                Get started free
              </Link>
            </div>
            <div data-reveal style={{ transitionDelay: "0.1s" }} className="bg-primary text-primary-foreground rounded-2xl p-8 flex flex-col relative overflow-hidden shadow-xl hover:-translate-y-0.5 hover:shadow-2xl transition-all duration-200">
              <div className="absolute top-4 right-4 bg-white/20 text-white text-xs font-bold px-3 py-1 rounded-full">Most popular</div>
              <div className="mb-6">
                <h3 className="text-xl font-bold font-outfit mb-1">Pro</h3>
                <p className="text-primary-foreground/70 text-sm mb-4">For founders who&apos;ve validated the product and need the full picture.</p>
                <div className="flex items-baseline gap-1"><span className="text-4xl font-bold font-outfit">$29</span><span className="text-primary-foreground/70">/month</span></div>
              </div>
              <ul className="space-y-3 flex-1 mb-8">
                {["Unlimited AI events","Unlimited customers & features","90-day data history","Cost, latency & error tracking","Slack & email spend alerts","Model comparison charts","Priority email support","14-day money-back guarantee"].map((f) => (
                  <li key={f} className="flex items-center gap-3 text-sm text-primary-foreground"><CheckCircle2 className="w-4 h-4 text-white/80 shrink-0" />{f}</li>
                ))}
              </ul>
              <Link href="/signup" className="block text-center h-12 leading-[3rem] rounded-lg bg-white text-primary font-semibold hover:bg-white/90 hover:-translate-y-0.5 hover:shadow-md transition-all duration-200" data-testid="pricing-pro-cta">
                Start free trial
              </Link>
            </div>
          </div>
        </div>
      </section>

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
          <h2 data-reveal style={{ transitionDelay: "0.08s" }} className="text-3xl md:text-4xl font-bold font-outfit mb-4">Stop guessing your AI margins</h2>
          <p data-reveal style={{ transitionDelay: "0.16s" }} className="text-muted-foreground text-lg mb-10 max-w-lg mx-auto">Join the waitlist and be first to know when early access opens. Free tier available from day one.</p>
          <div data-reveal style={{ transitionDelay: "0.24s" }}>
            <Form {...formBottom}>
              <form onSubmit={formBottom.handleSubmit(handleWaitlist(formBottom))} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto mb-6">
                <FormField control={formBottom.control} name="email" render={({ field }) => (
                  <FormItem className="flex-1 text-left">
                    <FormControl>
                      <Input placeholder="founder@startup.com" {...field} className="h-12 bg-background border-border focus-visible:ring-primary shadow-sm" data-testid="input-waitlist-email-bottom" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <button type="submit" className="h-12 px-6 rounded-md bg-primary text-primary-foreground font-medium hover:opacity-90 hover:-translate-y-0.5 hover:shadow-md transition-all duration-200 whitespace-nowrap shadow-sm" disabled={submitWaitlist.isPending} data-testid="btn-waitlist-submit-bottom">
                  {submitWaitlist.isPending ? "Joining..." : "Start monitoring now"}
                </button>
              </form>
            </Form>
            <p className="text-xs text-muted-foreground">No spam. No credit card required. Unsubscribe any time.</p>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}
