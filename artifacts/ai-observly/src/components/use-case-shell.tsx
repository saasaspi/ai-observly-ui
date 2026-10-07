import { PublicLayout } from "@/components/public-layout";
import Link from "next/link";
import { CheckCircle2, ArrowRight } from "lucide-react";
import type { Metadata } from "next";
import { NEW_FEATURES, type NewFeatureKey } from "@/lib/new-features";

export interface UseCaseProblem {
  label: string;
  body: string;
}

export interface UseCaseHelp {
  label: string;
  body: string;
}

export interface UseCaseData {
  h1: string;
  subhead: string;
  problems: UseCaseProblem[];
  helpItems: UseCaseHelp[];
  ctaLine: string;
  featureKeys?: NewFeatureKey[];
}

export function UseCaseShell({ data }: { data: UseCaseData }) {
  return (
    <PublicLayout>
      {/* Hero */}
      <section className="py-20 px-6 bg-gradient-to-b from-primary/5 to-background border-b border-border">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold font-outfit mb-6 leading-tight">
            {data.h1}
          </h1>
          <p className="text-lg text-muted-foreground leading-relaxed">{data.subhead}</p>
        </div>
      </section>

      {/* The Problem */}
      <section className="py-16 md:py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <p className="text-sm font-semibold uppercase tracking-widest text-primary text-center mb-3">
            The problem
          </p>
          <h2 className="text-2xl md:text-3xl font-bold font-outfit text-center mb-12">
            What you&apos;re running into
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            {data.problems.map((p) => (
              <div
                key={p.label}
                className="pub-card bg-card"
              >
                <h3 className="text-base font-bold mb-3 text-foreground">{p.label}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{p.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How AI Observly Helps */}
      <section className="py-20 px-6 bg-muted/30 border-y border-border">
        <div className="max-w-5xl mx-auto">
          <p className="text-sm font-semibold uppercase tracking-widest text-primary text-center mb-3">
            How AI Observly helps
          </p>
          <h2 className="text-2xl md:text-3xl font-bold font-outfit text-center mb-12">
            What changes when you have the data
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            {data.helpItems.map((item) => (
              <div
                key={item.label}
                className="pub-card bg-card !border-primary/25"
              >
                <CheckCircle2 className="w-5 h-5 text-primary mb-4" />
                <h3 className="text-base font-bold mb-3 text-foreground">{item.label}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{item.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* New capabilities */}
      <section className="py-16 px-6">
        <div className="max-w-5xl mx-auto">
          <p className="text-sm font-semibold uppercase tracking-widest text-primary text-center mb-3">
            Also worth a look
          </p>
          <h2 className="text-2xl md:text-3xl font-bold font-outfit text-center mb-8">
            More ways to see what your AI is doing
          </h2>
          <div className="grid md:grid-cols-3 gap-5">
            {NEW_FEATURES.filter((f) => !data.featureKeys || data.featureKeys.includes(f.key)).map((f) => (
              <Link
                key={f.href}
                href={f.href}
                className="group pub-card pub-card-link bg-card"
              >
                <p className="text-[10px] font-semibold uppercase tracking-widest text-primary mb-1">New</p>
                <h3 className="font-bold font-outfit text-foreground group-hover:text-primary transition-colors mb-2">{f.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed mb-3">{f.tagline}</p>
                <span className="pub-card-action">
                  Learn more <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 md:py-24 px-6 bg-primary text-primary-foreground text-center">
        <div className="max-w-2xl mx-auto">
          <p className="text-lg font-medium mb-7 leading-relaxed opacity-95">{data.ctaLine}</p>
          <Link
            href="/pricing"
            className="pub-btn pub-btn-inverse pub-btn-lg"
          >
            Start monitoring now <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>
    </PublicLayout>
  );
}

export function buildMetadata(title: string, description: string): Metadata {
  return { title, description };
}
