"use client";
import { PublicLayout } from "@/components/public-layout";
import Link from "next/link";
import { Check, Eye, Rocket, Crown, ArrowUpRight } from "lucide-react";

const plans = [
  {
    name: "Free",
    icon: Eye,
    tagline: "See the problem for yourself",
    price: "$0",
    period: "/month",
    features: [
      "1 provider connected",
      "Unlimited customer names visible",
      "Top 5 customers fully unlocked",
    ],
    cta: "Start free",
    ctaHref: "/signup",
    ctaStyle: "outline" as const,
    popular: false,
    testId: "pricing-free-cta",
  },
  {
    name: "Pro",
    icon: Rocket,
    tagline: "Track your growing customer base",
    price: "$29",
    period: "/month",
    features: [
      "Up to 3 providers connected",
      "Unlimited customer names visible",
      "Up to 200 customers fully unlocked",
    ],
    cta: "Upgrade to Pro",
    ctaHref: "/signup",
    ctaStyle: "primary" as const,
    popular: true,
    testId: "pricing-pro-cta",
  },
  {
    name: "Max",
    icon: Crown,
    tagline: "Every customer, every provider",
    price: "$79",
    period: "/month",
    features: [
      "Unlimited providers, blended view",
      "Unlimited customer names visible",
      "Unlimited customers fully unlocked",
      "Priority support",
    ],
    cta: "Go Max",
    ctaHref: "/signup",
    ctaStyle: "outline" as const,
    popular: false,
    testId: "pricing-max-cta",
  },
];

export default function PricingPage() {
  return (
    <PublicLayout>
      {/* ── PRICING ── */}
      <section className="py-24 px-6 bg-background border-b border-border">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-sm font-semibold uppercase tracking-widest text-primary mb-3">Pricing</p>
            <h1 className="text-3xl md:text-4xl font-bold font-outfit mb-4">Simple, founder-friendly pricing</h1>
            <p className="text-muted-foreground text-lg max-w-xl mx-auto">
              Start free. Scale when you need it.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 items-start">
            {plans.map((plan) => {
              const Icon = plan.icon;
              return (
                <div key={plan.name} className="relative flex flex-col">
                  {/* "Most popular" badge above the card */}
                  {plan.popular ? (
                    <div className="flex justify-center mb-0">
                      <span className="bg-primary text-primary-foreground text-xs font-bold px-4 py-1.5 rounded-t-lg tracking-wide">
                        Most popular
                      </span>
                    </div>
                  ) : (
                    <div className="h-[28px]" /> /* spacer to align card tops */
                  )}

                  <div
                    className={`flex-1 flex flex-col rounded-2xl p-8 border transition-all duration-200 hover:-translate-y-0.5 ${
                      plan.popular
                        ? "bg-card border-primary shadow-[0_0_0_2px] shadow-primary hover:shadow-[0_0_0_2px_var(--primary),0_8px_24px_rgba(0,0,0,0.15)]"
                        : "bg-card border-border hover:shadow-md"
                    }`}
                  >
                    {/* Plan header */}
                    <div className="mb-6">
                      <div className="flex items-center gap-2.5 mb-1">
                        <Icon className="w-5 h-5 text-foreground" />
                        <h2 className="text-xl font-bold font-outfit">{plan.name}</h2>
                      </div>
                      <p className="text-muted-foreground text-sm mb-5">{plan.tagline}</p>
                      <div className="flex items-baseline gap-1">
                        <span className="text-4xl font-bold font-outfit">{plan.price}</span>
                        <span className="text-muted-foreground text-sm">{plan.period}</span>
                      </div>
                    </div>

                    {/* Features */}
                    <ul className="space-y-3 flex-1 mb-8">
                      {plan.features.map((f) => (
                        <li key={f} className="flex items-start gap-3 text-sm text-foreground">
                          <Check className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
                          {f}
                        </li>
                      ))}
                    </ul>

                    {/* CTA */}
                    <Link
                      href={plan.ctaHref}
                      data-testid={plan.testId}
                      className={`flex items-center justify-center gap-1.5 h-12 rounded-xl font-semibold text-sm transition-all duration-200 hover:-translate-y-0.5 ${
                        plan.ctaStyle === "primary"
                          ? "bg-primary text-primary-foreground hover:opacity-90 hover:shadow-lg"
                          : "border border-border bg-transparent text-foreground hover:bg-muted hover:shadow-sm"
                      }`}
                    >
                      {plan.cta}
                      <ArrowUpRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              );
            })}
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
