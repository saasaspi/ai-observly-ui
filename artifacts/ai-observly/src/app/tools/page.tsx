import { PublicLayout } from "@/components/public-layout";
import Link from "next/link";
import { BarChart3, Crosshair, Calculator, ArrowRight, Sparkles } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Free Tools for AI Product Builders | AI Observly",
  description:
    "Free calculators and diagnostics for founders building AI products — understand your LLM costs, pricing blind spots, and plan margins in minutes.",
};

const tools = [
  {
    title: "LLM Spend Analyzer",
    desc: "Upload your OpenAI, Anthropic, or Gemini billing CSV and get an instant breakdown of where your AI budget is going — by model, by day, and by usage pattern. No account needed.",
    href: "/spend-checkup",
    Icon: BarChart3,
    badge: "Upload your CSV",
    cta: "Analyze my spend",
  },
  {
    title: "AI Blind Spot Quiz",
    desc: "Answer 8 quick questions about how you track AI costs today and get a personalised report of your cost blind spots and what to fix first.",
    href: "/blind-spot-quiz",
    Icon: Crosshair,
    badge: "2 minutes",
    cta: "Take the quiz",
  },
  {
    title: "Plan & Pricing Margin Calculator",
    desc: "Add your pricing plans, enrollment numbers, and AI costs and instantly see net margin per plan — plus what price you'd need to charge to hit a target margin.",
    href: "/tools/plan-pricing-margin-calculator",
    Icon: Calculator,
    badge: "No signup needed",
    cta: "Calculate my margins",
  },
];

export default function ToolsPage() {
  return (
    <PublicLayout>
      {/* Hero */}
      <section className="py-20 px-6 text-center bg-gradient-to-b from-primary/5 to-background border-b border-border">
        <div className="max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary rounded-full px-4 py-1.5 text-sm font-semibold mb-6">
            <Sparkles className="w-3.5 h-3.5" />
            All tools are free — no signup required
          </div>
          <h1 className="text-4xl md:text-5xl font-bold font-outfit mb-5">
            Free tools for AI product builders
          </h1>
          <p className="text-lg text-muted-foreground leading-relaxed">
            Understand your LLM costs, find your pricing blind spots, and model your plan margins —
            in minutes, right in your browser.
          </p>
        </div>
      </section>

      {/* Tools grid */}
      <section className="py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="grid md:grid-cols-3 gap-6">
            {tools.map(({ title, desc, href, Icon, badge, cta }) => (
              <div
                key={href}
                className="group bg-card border border-border rounded-2xl p-7 flex flex-col gap-5 hover:-translate-y-0.5 hover:shadow-lg hover:border-primary/30 transition-all duration-200"
              >
                {/* Icon */}
                <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                  <Icon className="w-5 h-5 text-primary" strokeWidth={1.5} />
                </div>

                {/* Badge */}
                <span className="inline-block self-start text-[11px] font-semibold uppercase tracking-widest text-muted-foreground bg-muted rounded-full px-2.5 py-0.5">
                  {badge}
                </span>

                <div className="flex-1">
                  <h2 className="text-lg font-bold font-outfit mb-2 group-hover:text-primary transition-colors">
                    {title}
                  </h2>
                  <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
                </div>

                <Link
                  href={href}
                  className="flex items-center gap-2 text-sm font-semibold text-primary hover:gap-3 transition-all"
                >
                  {cta} <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="py-16 px-6 bg-muted/40 border-t border-border text-center">
        <div className="max-w-xl mx-auto">
          <h2 className="text-2xl font-bold font-outfit mb-3">
            Want the full picture, not just a snapshot?
          </h2>
          <p className="text-muted-foreground text-sm mb-7">
            Connect AI Observly to your product and get live per-customer, per-feature, and per-plan
            cost attribution — automatically, with no proxy in your request path.
          </p>
          <Link
            href="/pricing"
            className="inline-flex items-center gap-2 bg-primary text-primary-foreground font-semibold px-6 py-3 rounded-xl hover:opacity-90 transition-opacity shadow-sm"
          >
            See pricing <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>
    </PublicLayout>
  );
}
