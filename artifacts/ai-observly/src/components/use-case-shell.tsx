import { PublicLayout } from "@/components/public-layout";
import Link from "next/link";
import { CheckCircle2, ArrowRight } from "lucide-react";
import type { Metadata } from "next";

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
      <section className="py-20 px-6">
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
                className="bg-card border border-border rounded-2xl p-6 hover:-translate-y-0.5 hover:shadow-md transition-all duration-200"
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
                className="bg-card border border-primary/20 rounded-2xl p-6 hover:-translate-y-0.5 hover:shadow-md transition-all duration-200"
              >
                <CheckCircle2 className="w-5 h-5 text-primary mb-4" />
                <h3 className="text-base font-bold mb-3 text-foreground">{item.label}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{item.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-6 bg-primary text-primary-foreground text-center">
        <div className="max-w-2xl mx-auto">
          <p className="text-lg font-medium mb-7 leading-relaxed opacity-95">{data.ctaLine}</p>
          <Link
            href="/pricing"
            className="inline-flex items-center gap-2 bg-white text-primary font-semibold px-7 py-3.5 rounded-xl hover:opacity-90 transition-opacity shadow-sm"
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
