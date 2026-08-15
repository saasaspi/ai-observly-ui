"use client";
import { PublicLayout } from "@/components/public-layout";
import Link from "next/link";
import { CheckCircle2 } from "lucide-react";

export default function PricingPage() {
  return (
    <PublicLayout>
      {/* ── PRICING ── */}
      <section className="py-24 px-6 bg-card border-b border-border">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-sm font-semibold uppercase tracking-widest text-primary mb-3">Pricing</p>
            <h1 className="text-3xl md:text-4xl font-bold font-outfit mb-4">Simple, founder-friendly pricing</h1>
            <p className="text-muted-foreground text-lg max-w-xl mx-auto">Generous free tier to prove the value. One paid plan when you&apos;re ready to scale.</p>
          </div>
          <div className="grid md:grid-cols-2 gap-8">
            {/* Free */}
            <div className="bg-background border border-border rounded-2xl p-8 flex flex-col hover:-translate-y-0.5 hover:shadow-md transition-all duration-200">
              <div className="mb-6">
                <h2 className="text-xl font-bold font-outfit mb-1">Free</h2>
                <p className="text-muted-foreground text-sm mb-4">Everything you need to get started.</p>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-bold font-outfit">$0</span>
                  <span className="text-muted-foreground">/month</span>
                </div>
              </div>
              <ul className="space-y-3 flex-1 mb-8">
                {[
                  "10,000 AI events/month",
                  "Up to 3 customers",
                  "Up to 3 features",
                  "7-day data history",
                  "Per-customer cost breakdown",
                  "Cost & margin tracking",
                ].map((f) => (
                  <li key={f} className="flex items-center gap-3 text-sm text-foreground">
                    <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0" />{f}
                  </li>
                ))}
              </ul>
              <Link
                href="/signup"
                className="block text-center h-12 leading-[3rem] rounded-lg border border-border bg-muted hover:bg-muted/80 hover:-translate-y-0.5 hover:shadow-sm font-medium text-foreground transition-all duration-200"
                data-testid="pricing-free-cta"
              >
                Get started free
              </Link>
            </div>

            {/* Pro */}
            <div className="bg-primary text-primary-foreground rounded-2xl p-8 flex flex-col relative overflow-hidden shadow-xl hover:-translate-y-0.5 hover:shadow-2xl transition-all duration-200">
              <div className="absolute top-4 right-4 bg-white/20 text-white text-xs font-bold px-3 py-1 rounded-full">Most popular</div>
              <div className="mb-6">
                <h2 className="text-xl font-bold font-outfit mb-1">Pro</h2>
                <p className="text-primary-foreground/70 text-sm mb-4">For founders who&apos;ve validated the product and need the full margin picture.</p>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-bold font-outfit">$29</span>
                  <span className="text-primary-foreground/70">/month</span>
                </div>
              </div>
              <ul className="space-y-3 flex-1 mb-8">
                {[
                  "Unlimited AI events",
                  "Unlimited customers & features",
                  "90-day data history",
                  "Full cost & margin breakdown",
                  "Per-plan profitability tracking",
                  "Slack & email spend alerts",
                  "Model comparison charts",
                  "Priority email support",
                  "14-day money-back guarantee",
                ].map((f) => (
                  <li key={f} className="flex items-center gap-3 text-sm text-primary-foreground">
                    <CheckCircle2 className="w-4 h-4 text-white/80 shrink-0" />{f}
                  </li>
                ))}
              </ul>
              <Link
                href="/signup"
                className="block text-center h-12 leading-[3rem] rounded-lg bg-white text-primary font-semibold hover:bg-white/90 hover:-translate-y-0.5 hover:shadow-md transition-all duration-200"
                data-testid="pricing-pro-cta"
              >
                Start free trial
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── FAQ teaser ── */}
      <section className="py-16 px-6 bg-background border-b border-border">
        <div className="max-w-2xl mx-auto text-center">
          <p className="text-muted-foreground text-base mb-6">
            Have questions about which plan is right for you?
          </p>
          <Link
            href="/#faq"
            className="inline-flex items-center justify-center h-11 px-6 rounded-lg border border-border bg-muted hover:bg-muted/80 font-medium text-foreground transition-all duration-200 text-sm"
          >
            See frequently asked questions
          </Link>
        </div>
      </section>
    </PublicLayout>
  );
}
