"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { PublicLayout } from "@/components/public-layout";
import {
  ChevronDown, ChevronUp, ArrowRight,
  Users, BarChart2, CreditCard, Bell,
  ShieldCheck, Zap, TrendingUp, DollarSign,
} from "lucide-react";

// ── Scroll-reveal ──────────────────────────────────────────────────────────────
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
      { threshold: 0.08, rootMargin: "0px 0px -40px 0px" }
    );
    els.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);
}

// ── Types ──────────────────────────────────────────────────────────────────────
export interface FeatureCard {
  icon: React.ReactNode;
  title: string;
  body: string;
}
export interface BenefitSection {
  title: string;
  body: string;
  visual: React.ReactNode;
}
export interface PersonaTab {
  id: string;
  label: string;
  headline: string;
  body: string;
  link: string;
  linkLabel: string;
}
export interface RelatedFeature {
  title: string;
  href: string;
  label: string;
}
export interface FaqEntry {
  q: string;
  a: string;
}
export interface FeaturePageData {
  hero: {
    h1: string;
    subhead: string;
    visual: React.ReactNode;
  };
  featureCards: FeatureCard[];
  productPreview: {
    caption: string;
    visual: React.ReactNode;
  };
  benefitSections: BenefitSection[];
  personaTabs: PersonaTab[];
  relatedFeatures: RelatedFeature[];
  faqs: FaqEntry[];
  footerCta: { headline: string; subhead: string };
}

// ── FAQ accordion item ─────────────────────────────────────────────────────────
function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div
      className="border border-border rounded-xl overflow-hidden bg-card shadow-sm cursor-pointer hover:-translate-y-0.5 hover:shadow-md transition-all duration-200"
      onClick={() => setOpen(!open)}
    >
      <div className="flex items-center justify-between p-6 gap-4">
        <h3 className="font-semibold text-foreground text-base leading-snug">{q}</h3>
        {open ? (
          <ChevronUp className="w-5 h-5 text-muted-foreground shrink-0" />
        ) : (
          <ChevronDown className="w-5 h-5 text-muted-foreground shrink-0" />
        )}
      </div>
      {open && (
        <div className="px-6 pb-6 text-muted-foreground leading-relaxed border-t border-border pt-4">
          {a}
        </div>
      )}
    </div>
  );
}

// ── Main shell ─────────────────────────────────────────────────────────────────
export function FeaturePageShell({ data }: { data: FeaturePageData }) {
  useScrollReveal();
  const [activeTab, setActiveTab] = useState(0);

  return (
    <PublicLayout>
      {/* ── HERO ── */}
      <section className="pt-20 pb-16 px-6 bg-background">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-12 items-center">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary mb-5">
              AI Observly Feature
            </div>
            <h1 className="text-4xl md:text-5xl font-bold font-outfit text-foreground leading-tight mb-4">
              {data.hero.h1}
            </h1>
            <p className="text-lg text-muted-foreground leading-relaxed mb-8">
              {data.hero.subhead}
            </p>
            <div className="flex flex-wrap items-center gap-4">
              <Link
                href="/pricing"
                className="inline-flex items-center gap-2 h-13 px-7 py-3.5 rounded-lg bg-primary text-primary-foreground font-semibold text-base hover:opacity-90 hover:-translate-y-0.5 hover:shadow-lg transition-all duration-200 shadow-sm"
              >
                View Pricing <ArrowRight className="w-4 h-4" />
              </Link>
              <a
                href="#how-it-works"
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                See how it works ↓
              </a>
            </div>
          </div>
          <div data-reveal className="opacity-0 translate-y-4 transition-all duration-500 [&.is-revealed]:opacity-100 [&.is-revealed]:translate-y-0">
            {data.hero.visual}
          </div>
        </div>
      </section>

      {/* ── FEATURE CARDS ── */}
      <section className="py-16 px-6 bg-primary/5 border-y border-primary/10">
        <div className="max-w-5xl mx-auto grid md:grid-cols-3 gap-6">
          {data.featureCards.map((card, i) => (
            <div
              key={i}
              data-reveal
              style={{ transitionDelay: `${i * 80}ms` }}
              className="opacity-0 translate-y-4 transition-all duration-500 [&.is-revealed]:opacity-100 [&.is-revealed]:translate-y-0 bg-card border border-border rounded-2xl p-6 shadow-sm hover:-translate-y-0.5 hover:shadow-md transition-[transform,box-shadow] duration-200"
            >
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary mb-4">
                {card.icon}
              </div>
              <h3 className="font-bold font-outfit text-foreground text-lg mb-2">{card.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{card.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── PRODUCT PREVIEW ── */}
      <section id="how-it-works" className="py-20 px-6 bg-background">
        <div className="max-w-4xl mx-auto">
          <div
            data-reveal
            className="opacity-0 translate-y-4 transition-all duration-500 [&.is-revealed]:opacity-100 [&.is-revealed]:translate-y-0 border border-border rounded-2xl shadow-xl shadow-primary/5 overflow-hidden bg-card"
          >
            <div className="flex items-center gap-1.5 px-4 py-3 border-b border-border bg-muted/30">
              <div className="w-3 h-3 rounded-full bg-red-400/70" />
              <div className="w-3 h-3 rounded-full bg-yellow-400/70" />
              <div className="w-3 h-3 rounded-full bg-green-400/70" />
              <span className="ml-3 text-xs text-muted-foreground font-mono">AI Observly — Dashboard</span>
            </div>
            <div className="p-4 sm:p-6">{data.productPreview.visual}</div>
          </div>
          <p className="mt-4 text-sm text-muted-foreground text-center">{data.productPreview.caption}</p>
          <div className="mt-6 flex justify-center">
            <Link
              href="/pricing"
              className="inline-flex items-center gap-2 h-11 px-6 rounded-lg bg-primary text-primary-foreground font-medium text-sm hover:opacity-90 hover:-translate-y-0.5 hover:shadow-md transition-all duration-200 shadow-sm"
            >
              View Pricing <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ── BENEFIT SECTIONS ── */}
      <section className="py-4 px-6 bg-background">
        <div className="max-w-5xl mx-auto space-y-20 pb-20">
          {data.benefitSections.map((section, i) => (
            <div
              key={i}
              data-reveal
              className={`opacity-0 translate-y-4 transition-all duration-500 [&.is-revealed]:opacity-100 [&.is-revealed]:translate-y-0 grid md:grid-cols-2 gap-12 items-center ${
                i % 2 === 1 ? "md:[direction:rtl] [direction:ltr]" : ""
              }`}
            >
              <div className={i % 2 === 1 ? "md:[direction:ltr]" : ""}>
                <h2 className="text-2xl md:text-3xl font-bold font-outfit text-foreground mb-4 leading-snug">
                  {section.title}
                </h2>
                <p className="text-muted-foreground leading-relaxed mb-6">{section.body}</p>
                <Link
                  href="/pricing"
                  className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline transition-colors"
                >
                  View Pricing <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
              <div className={`rounded-2xl overflow-hidden border border-border shadow-sm ${i % 2 === 1 ? "md:[direction:ltr]" : ""}`}>
                {section.visual}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── PERSONA TABS ── */}
      <section className="py-20 px-6 bg-card border-y border-border">
        <div className="max-w-4xl mx-auto">
          <p className="text-xs font-bold uppercase tracking-widest text-primary mb-2 text-center">Built for</p>
          <h2 className="text-3xl font-bold font-outfit text-foreground mb-8 text-center">Who uses this?</h2>
          <div className="flex gap-2 flex-wrap justify-center mb-8">
            {data.personaTabs.map((tab, i) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(i)}
                className={`px-4 py-2 rounded-full text-sm font-medium border transition-all duration-150 ${
                  activeTab === i
                    ? "bg-primary text-primary-foreground border-primary shadow-sm"
                    : "bg-background text-muted-foreground border-border hover:border-primary/40 hover:text-foreground"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
          {data.personaTabs.map((tab, i) =>
            activeTab === i ? (
              <div key={tab.id} className="bg-background border border-border rounded-2xl p-8 shadow-sm text-center max-w-2xl mx-auto">
                <h3 className="text-xl font-bold font-outfit text-foreground mb-3">{tab.headline}</h3>
                <p className="text-muted-foreground leading-relaxed mb-5">{tab.body}</p>
                <Link
                  href={tab.link}
                  className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline"
                >
                  {tab.linkLabel} <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            ) : null
          )}
        </div>
      </section>

      {/* ── RELATED FEATURES ── */}
      <section className="py-16 px-6 bg-background">
        <div className="max-w-4xl mx-auto">
          <p className="text-xs font-bold uppercase tracking-widest text-primary mb-4 text-center">Explore more</p>
          <div className="grid sm:grid-cols-3 gap-4">
            {data.relatedFeatures.map((f) => (
              <Link
                key={f.href}
                href={f.href}
                className="group bg-card border border-border rounded-xl p-5 hover:-translate-y-0.5 hover:shadow-md hover:border-primary/40 transition-all duration-200"
              >
                <p className="text-[10px] font-semibold uppercase tracking-widest text-primary mb-1">{f.label}</p>
                <p className="font-semibold text-foreground text-sm leading-snug group-hover:text-primary transition-colors">
                  {f.title} <ArrowRight className="inline w-3.5 h-3.5 ml-0.5 -mt-0.5" />
                </p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="py-16 px-6 bg-card border-y border-border">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold font-outfit text-foreground mb-8 text-center">Frequently asked questions</h2>
          <div className="space-y-3">
            {data.faqs.map((faq, i) => (
              <FaqItem key={i} q={faq.q} a={faq.a} />
            ))}
          </div>
        </div>
      </section>

      {/* ── FOOTER CTA ── */}
      <section className="py-24 px-6 bg-primary text-primary-foreground">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold font-outfit mb-3 leading-snug">
            {data.footerCta.headline}
          </h2>
          <p className="text-primary-foreground/80 text-lg mb-8">{data.footerCta.subhead}</p>
          <Link
            href="/pricing"
            className="inline-flex items-center gap-2 h-14 px-8 text-base rounded-lg bg-white text-primary font-bold hover:opacity-90 hover:-translate-y-0.5 hover:shadow-lg transition-all duration-200 shadow-sm"
          >
            View Pricing <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>
    </PublicLayout>
  );
}

// ── Shared visual sub-components ───────────────────────────────────────────────

export function MockCustomerTable() {
  const rows = [
    { name: "Acme Corp", cost: "$380", margin: "-$60", color: "text-red-500", dot: "bg-red-500" },
    { name: "Verity Labs", cost: "$315", margin: "+$95", color: "text-green-600", dot: "bg-yellow-500" },
    { name: "Moonshot AI", cost: "$95", margin: "+$315", color: "text-green-600", dot: "bg-green-500" },
    { name: "Sigma Co", cost: "---", margin: "---", locked: true, dot: "bg-gray-300" },
    { name: "BluePeak Inc", cost: "---", margin: "---", locked: true, dot: "bg-gray-300" },
  ];
  return (
    <div>
      <div className="flex text-[10px] font-semibold text-muted-foreground uppercase tracking-wider px-4 py-2 border-b border-border">
        <span className="flex-1">Customer</span>
        <span className="w-20 text-right">AI Cost</span>
        <span className="w-24 text-right">Margin</span>
      </div>
      {rows.map((r, i) => (
        <div key={i} className={`flex items-center px-4 py-3 border-b border-border last:border-0 ${r.locked ? "opacity-50" : ""}`}>
          <span className={`w-2 h-2 rounded-full ${r.dot} mr-2.5 shrink-0`} />
          <span className="flex-1 text-sm text-foreground font-medium">{r.name}</span>
          <span className={`w-20 text-right text-sm ${r.locked ? "blur-[4px]" : "text-foreground"}`}>{r.cost}</span>
          <span className={`w-24 text-right text-sm font-semibold ${r.locked ? "blur-[4px]" : r.color}`}>{r.margin}</span>
        </div>
      ))}
    </div>
  );
}

export function MockFeatureTable() {
  const rows = [
    { name: "AI Summary", calls: "12,400", cost: "$420", pct: "37%", trend: "↑" },
    { name: "Chat Assistant", calls: "8,200", cost: "$310", pct: "27%", trend: "↑" },
    { name: "Auto-Tagging", calls: "18,900", cost: "$205", pct: "18%", trend: "→" },
    { name: "Smart Search", calls: "6,100", cost: "$115", pct: "10%", trend: "↓" },
    { name: "Report Gen", calls: "900", cost: "$90", pct: "8%", trend: "→" },
  ];
  return (
    <div>
      <div className="flex text-[10px] font-semibold text-muted-foreground uppercase tracking-wider px-4 py-2 border-b border-border">
        <span className="flex-1">Feature</span>
        <span className="w-20 text-right">Calls</span>
        <span className="w-20 text-right">AI Cost</span>
        <span className="w-16 text-right">% Total</span>
      </div>
      {rows.map((r, i) => (
        <div key={i} className="flex items-center px-4 py-3 border-b border-border last:border-0">
          <span className="flex-1 text-sm text-foreground font-medium flex items-center gap-2">
            <span className="text-muted-foreground text-xs">{r.trend}</span>
            {r.name}
          </span>
          <span className="w-20 text-right text-xs text-muted-foreground">{r.calls}</span>
          <span className="w-20 text-right text-sm font-semibold text-foreground">{r.cost}</span>
          <span className="w-16 text-right text-xs text-primary font-medium">{r.pct}</span>
        </div>
      ))}
    </div>
  );
}

export function MockPlanTable() {
  const rows = [
    { plan: "Free", customers: 84, cost: "$2.40", rev: "$0", margin: "-100%", color: "text-red-500" },
    { plan: "Starter", customers: 210, cost: "$8.20", rev: "$19", margin: "+56%", color: "text-yellow-600" },
    { plan: "Pro", customers: 63, cost: "$24.10", rev: "$79", margin: "+69%", color: "text-green-600" },
    { plan: "Scale", customers: 12, cost: "$71.50", rev: "$299", margin: "+76%", color: "text-green-600" },
  ];
  return (
    <div>
      <div className="flex text-[10px] font-semibold text-muted-foreground uppercase tracking-wider px-4 py-2 border-b border-border">
        <span className="flex-1">Plan</span>
        <span className="w-24 text-right">Customers</span>
        <span className="w-24 text-right">Avg AI Cost</span>
        <span className="w-24 text-right">Net Margin</span>
      </div>
      {rows.map((r, i) => (
        <div key={i} className="flex items-center px-4 py-3 border-b border-border last:border-0">
          <span className="flex-1 text-sm text-foreground font-medium">{r.plan}</span>
          <span className="w-24 text-right text-xs text-muted-foreground">{r.customers}</span>
          <span className="w-24 text-right text-sm text-foreground">{r.cost}</span>
          <span className={`w-24 text-right text-sm font-bold ${r.color}`}>{r.margin}</span>
        </div>
      ))}
    </div>
  );
}

// ── Styled benefit section visuals ─────────────────────────────────────────────

export function BenefitVisualCostToServe() {
  const bars = [
    { name: "Acme Corp", cost: 85, rev: 100, label: "$850/$1k" },
    { name: "Verity Labs", cost: 30, rev: 100, label: "$300/$1k" },
    { name: "Sigma Co", cost: 110, rev: 100, label: "$1.1k/$1k", over: true },
  ];
  return (
    <div className="bg-card p-6">
      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4">Cost vs Revenue per Customer</p>
      <div className="space-y-4">
        {bars.map((b) => (
          <div key={b.name}>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-foreground font-medium">{b.name}</span>
              <span className={`text-xs font-semibold ${b.over ? "text-red-500" : "text-green-600"}`}>{b.label}</span>
            </div>
            <div className="h-2 rounded-full bg-muted overflow-hidden">
              <div className={`h-full rounded-full ${b.over ? "bg-red-400" : "bg-primary"}`} style={{ width: `${Math.min(b.cost, 100)}%` }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function BenefitVisualAlert() {
  return (
    <div className="bg-card p-6">
      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4">Margin Alerts</p>
      <div className="space-y-3">
        <div className="flex items-start gap-3 bg-red-50 border border-red-200 rounded-xl p-4">
          <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center shrink-0">
            <Bell className="w-4 h-4 text-red-500" />
          </div>
          <div>
            <p className="text-sm font-semibold text-red-700">Acme Corp is margin-negative</p>
            <p className="text-xs text-red-500 mt-0.5">AI cost exceeded plan revenue by $60 this month</p>
          </div>
        </div>
        <div className="flex items-start gap-3 bg-yellow-50 border border-yellow-200 rounded-xl p-4">
          <div className="w-8 h-8 rounded-full bg-yellow-100 flex items-center justify-center shrink-0">
            <Bell className="w-4 h-4 text-yellow-500" />
          </div>
          <div>
            <p className="text-sm font-semibold text-yellow-700">Sigma Co approaching threshold</p>
            <p className="text-xs text-yellow-600 mt-0.5">82% of plan revenue consumed by AI cost</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export function BenefitVisualArchitecture() {
  return (
    <div className="bg-card p-6">
      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-6 text-center">How it works</p>
      <div className="flex items-center justify-center gap-3 flex-wrap">
        <div className="border border-border rounded-xl px-5 py-3 bg-background text-sm font-semibold text-foreground text-center">
          Your App
        </div>
        <div className="flex flex-col items-center gap-1">
          <ArrowRight className="w-5 h-5 text-primary" />
          <span className="text-[9px] text-muted-foreground uppercase">direct</span>
        </div>
        <div className="border border-border rounded-xl px-5 py-3 bg-background text-sm font-semibold text-foreground text-center">
          LLM Provider
        </div>
      </div>
      <div className="mt-4 flex justify-center">
        <div className="flex flex-col items-center gap-1">
          <div className="border border-dashed border-primary/50 rounded-full px-4 py-1.5 text-xs text-primary font-medium">
            usage report only
          </div>
          <div className="w-px h-5 border-l border-dashed border-primary/40" />
          <div className="border border-primary/30 bg-primary/10 rounded-xl px-5 py-3 text-sm font-semibold text-primary text-center">
            AI Observly
          </div>
        </div>
      </div>
    </div>
  );
}

export function BenefitVisualPlainDashboard() {
  return (
    <div className="bg-card p-6">
      <div className="bg-primary/10 border border-primary/20 rounded-xl px-4 py-3 mb-4">
        <p className="text-sm font-semibold text-primary">3 customers are costing you more than they pay</p>
      </div>
      <div className="space-y-2">
        {["Acme Corp — margin −$60/mo", "Sigma Co — margin −$120/mo", "TechFlow — margin −$18/mo"].map((t) => (
          <div key={t} className="flex items-center gap-2 text-sm text-foreground">
            <div className="w-2 h-2 rounded-full bg-red-400 shrink-0" />
            {t}
          </div>
        ))}
      </div>
    </div>
  );
}

export function BenefitVisualFeatureRanking() {
  const items = [
    { name: "AI Summary", pct: 90, cost: "$420" },
    { name: "Chat Assistant", pct: 70, cost: "$310" },
    { name: "Auto-Tagging", pct: 48, cost: "$205" },
    { name: "Smart Search", pct: 28, cost: "$115" },
  ];
  return (
    <div className="bg-card p-6">
      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4">Feature Cost Ranking</p>
      <div className="space-y-3">
        {items.map((it) => (
          <div key={it.name}>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-foreground font-medium">{it.name}</span>
              <span className="text-primary font-semibold text-xs">{it.cost}</span>
            </div>
            <div className="h-2 rounded-full bg-muted overflow-hidden">
              <div className="h-full rounded-full bg-primary" style={{ width: `${it.pct}%` }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function BenefitVisualRoadmap() {
  const items = [
    { name: "AI Summary v2", status: "planned", cost: "~$180/mo est." },
    { name: "Smart Replies", status: "in progress", cost: "$95/mo current" },
    { name: "Auto-Report", status: "shipped", cost: "$90/mo actual" },
  ];
  return (
    <div className="bg-card p-6">
      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4">Roadmap + Cost</p>
      <div className="space-y-3">
        {items.map((it) => (
          <div key={it.name} className="flex items-center justify-between border border-border rounded-lg px-4 py-3">
            <div>
              <p className="text-sm font-semibold text-foreground">{it.name}</p>
              <p className={`text-[10px] uppercase font-semibold mt-0.5 ${
                it.status === "planned" ? "text-muted-foreground" :
                it.status === "in progress" ? "text-yellow-600" : "text-green-600"
              }`}>{it.status}</p>
            </div>
            <span className="text-xs text-primary font-medium">{it.cost}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function BenefitVisualTokensAndCost() {
  return (
    <div className="bg-card p-6">
      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4">AI Summary — Last 30 days</p>
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Token calls", value: "12.4k", color: "bg-violet-100 text-violet-700" },
          { label: "Total tokens", value: "8.2M", color: "bg-blue-100 text-blue-700" },
          { label: "AI Cost", value: "$420", color: "bg-primary/10 text-primary" },
        ].map((m) => (
          <div key={m.label} className={`rounded-xl p-3 text-center ${m.color}`}>
            <p className="text-lg font-bold">{m.value}</p>
            <p className="text-[10px] font-medium mt-0.5">{m.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export function BenefitVisualPlanMargin() {
  const plans = [
    { name: "Free", margin: -100, color: "bg-red-400", label: "-100%" },
    { name: "Starter", margin: 56, color: "bg-yellow-400", label: "+56%" },
    { name: "Pro", margin: 69, color: "bg-green-500", label: "+69%" },
    { name: "Scale", margin: 76, color: "bg-green-600", label: "+76%" },
  ];
  return (
    <div className="bg-card p-6">
      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4">Net Margin by Plan</p>
      <div className="flex items-end gap-4 h-28">
        {plans.map((p) => (
          <div key={p.name} className="flex-1 flex flex-col items-center gap-1.5">
            <span className="text-[10px] font-bold" style={{ color: p.margin < 0 ? "#ef4444" : "#16a34a" }}>{p.label}</span>
            <div className="w-full rounded-t-md" style={{ height: `${Math.abs(p.margin) * 0.9}px`, background: p.margin < 0 ? "#fca5a5" : "#86efac" }} />
            <span className="text-[10px] text-muted-foreground">{p.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function BenefitVisualMarginCalculator() {
  return (
    <div className="bg-card p-6">
      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4">Ideal Margin Calculator</p>
      <div className="space-y-4">
        <div>
          <label className="text-xs text-muted-foreground font-medium">Target margin</label>
          <div className="mt-1 flex items-center gap-2 border border-border rounded-lg px-3 py-2 bg-background">
            <span className="text-sm font-semibold text-foreground">65%</span>
            <div className="flex-1 h-1.5 rounded-full bg-muted">
              <div className="h-full w-[65%] rounded-full bg-primary" />
            </div>
          </div>
        </div>
        <div className="bg-primary/10 border border-primary/20 rounded-xl px-4 py-3">
          <p className="text-xs text-primary font-medium">Suggested Pro plan price</p>
          <p className="text-2xl font-bold font-outfit text-primary mt-0.5">$89<span className="text-sm font-normal">/mo</span></p>
          <p className="text-[10px] text-primary/70 mt-0.5">Based on avg $24.10 AI cost/customer</p>
        </div>
      </div>
    </div>
  );
}

export function BenefitVisualOverhead() {
  return (
    <div className="bg-card p-6">
      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4">Cost per Customer (Pro Plan)</p>
      <div className="space-y-2">
        {[
          { label: "LLM / API cost", value: "$24.10", color: "bg-primary", width: "70%" },
          { label: "Infrastructure", value: "$5.20", color: "bg-violet-400", width: "15%" },
          { label: "Storage", value: "$2.80", color: "bg-blue-400", width: "8%" },
          { label: "Other overhead", value: "$1.90", color: "bg-slate-300", width: "5%" },
        ].map((it) => (
          <div key={it.label}>
            <div className="flex justify-between text-xs mb-0.5">
              <span className="text-muted-foreground">{it.label}</span>
              <span className="font-semibold text-foreground">{it.value}</span>
            </div>
            <div className="h-1.5 rounded-full bg-muted overflow-hidden">
              <div className={`h-full rounded-full ${it.color}`} style={{ width: it.width }} />
            </div>
          </div>
        ))}
        <div className="border-t border-border pt-2 flex justify-between text-sm font-bold">
          <span className="text-foreground">Total cost/customer</span>
          <span className="text-foreground">$34.00</span>
        </div>
      </div>
    </div>
  );
}

export function BenefitVisualCalculatorVsDashboard() {
  return (
    <div className="bg-card p-6">
      <div className="grid grid-cols-2 gap-3">
        <div className="border border-dashed border-border rounded-xl p-4 text-center">
          <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-2">Free Calculator</p>
          <p className="text-xs text-muted-foreground">Manual inputs<br/>Scenario modeling<br/>Instant results</p>
        </div>
        <div className="border border-primary/30 bg-primary/5 rounded-xl p-4 text-center">
          <p className="text-[10px] font-bold uppercase tracking-widest text-primary mb-2">Live Dashboard</p>
          <p className="text-xs text-primary/80">Real usage data<br/>Auto-updated<br/>Per-customer drill-down</p>
        </div>
      </div>
    </div>
  );
}

// ── Hero illustration components ───────────────────────────────────────────────

export function HeroVisualCustomerAttribution() {
  const rows = [
    { name: "Acme Corp", cost: "$380", margin: "-$60", dot: "bg-red-400", neg: true },
    { name: "Verity Labs", cost: "$315", margin: "+$95", dot: "bg-yellow-400", neg: false },
    { name: "Moonshot AI", cost: "$95", margin: "+$315", dot: "bg-green-400", neg: false },
  ];
  return (
    <div className="bg-card border border-border rounded-2xl shadow-xl shadow-primary/10 overflow-hidden">
      <div className="flex items-center gap-1.5 px-4 py-3 border-b border-border bg-muted/30">
        <div className="w-2.5 h-2.5 rounded-full bg-red-400/70" />
        <div className="w-2.5 h-2.5 rounded-full bg-yellow-400/70" />
        <div className="w-2.5 h-2.5 rounded-full bg-green-400/70" />
        <span className="ml-2 text-xs text-muted-foreground font-mono">Customer Margins</span>
      </div>
      <div>
        <div className="flex text-[10px] font-semibold text-muted-foreground uppercase tracking-wider px-4 py-2 border-b border-border">
          <span className="flex-1">Customer</span>
          <span className="w-20 text-right">AI Cost</span>
          <span className="w-20 text-right">Margin</span>
        </div>
        {rows.map((r) => (
          <div key={r.name} className="flex items-center px-4 py-3 border-b border-border last:border-0">
            <span className={`w-2 h-2 rounded-full ${r.dot} mr-2.5 shrink-0`} />
            <span className="flex-1 text-sm font-medium text-foreground">{r.name}</span>
            <span className="w-20 text-right text-sm text-foreground">{r.cost}</span>
            <span className={`w-20 text-right text-sm font-bold ${r.neg ? "text-red-500" : "text-green-600"}`}>{r.margin}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function HeroVisualFeatureMargins() {
  const features = [
    { name: "AI Summary", cost: "$420", pct: 90, pos: true },
    { name: "Chat Assistant", cost: "$310", pct: 70, pos: true },
    { name: "Auto-Tagging", cost: "$205", pct: 48, pos: false },
    { name: "Smart Search", cost: "$115", pct: 28, pos: false },
  ];
  return (
    <div className="bg-card border border-border rounded-2xl shadow-xl shadow-primary/10 overflow-hidden p-5">
      <div className="flex items-center gap-1.5 mb-4">
        <div className="w-2.5 h-2.5 rounded-full bg-red-400/70" />
        <div className="w-2.5 h-2.5 rounded-full bg-yellow-400/70" />
        <div className="w-2.5 h-2.5 rounded-full bg-green-400/70" />
        <span className="ml-2 text-xs text-muted-foreground font-mono">Feature Cost Breakdown</span>
      </div>
      <div className="space-y-3">
        {features.map((f) => (
          <div key={f.name}>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-foreground font-medium">{f.name}</span>
              <span className="text-primary font-semibold text-xs">{f.cost}</span>
            </div>
            <div className="h-2 rounded-full bg-muted">
              <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${f.pct}%` }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function HeroVisualPlanProfitability() {
  const plans = [
    { name: "Starter", price: "$19", margin: "+56%", color: "border-yellow-300 bg-yellow-50", mColor: "text-yellow-700" },
    { name: "Pro", price: "$79", margin: "+69%", color: "border-primary/40 bg-primary/5", mColor: "text-green-600", highlight: true },
    { name: "Scale", price: "$299", margin: "+76%", color: "border-green-300 bg-green-50", mColor: "text-green-700" },
  ];
  return (
    <div className="bg-card border border-border rounded-2xl shadow-xl shadow-primary/10 p-5">
      <div className="flex items-center gap-1.5 mb-4">
        <div className="w-2.5 h-2.5 rounded-full bg-red-400/70" />
        <div className="w-2.5 h-2.5 rounded-full bg-yellow-400/70" />
        <div className="w-2.5 h-2.5 rounded-full bg-green-400/70" />
        <span className="ml-2 text-xs text-muted-foreground font-mono">Plan Profitability</span>
      </div>
      <div className="grid grid-cols-3 gap-3">
        {plans.map((p) => (
          <div key={p.name} className={`border rounded-xl p-3 text-center ${p.color}`}>
            <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1">{p.name}</p>
            <p className="text-xl font-bold font-outfit text-foreground">{p.price}</p>
            <p className="text-[10px] text-muted-foreground mb-2">per month</p>
            <div className="border-t border-border/50 pt-2">
              <p className="text-[10px] text-muted-foreground">Net margin</p>
              <p className={`text-sm font-bold ${p.mColor}`}>{p.margin}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
