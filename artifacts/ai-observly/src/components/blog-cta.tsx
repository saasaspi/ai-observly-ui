"use client";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { fireEvent } from "@/lib/gtag";

export function BlogCta() {
  return (
    <div className="mt-16 bg-primary/5 border border-primary/20 rounded-2xl p-8 text-center">
      <p className="text-sm font-medium text-primary mb-2">AI Observly</p>
      <h3 className="text-xl font-bold font-outfit text-foreground mb-3">
        Not sure where your AI budget is going?
      </h3>
      <p className="text-muted-foreground text-sm mb-6 max-w-sm mx-auto">
        Take our free 90-second quiz to find your AI cost blind spots — see if
        you know what you&apos;re really spending, and whether it&apos;s profitable.
      </p>
      <Link
        href="/blind-spot-quiz"
        className="inline-flex items-center gap-2 h-11 px-6 rounded-lg bg-primary text-primary-foreground font-medium text-sm hover:opacity-90 hover:-translate-y-0.5 hover:shadow-md transition-all duration-200 shadow-sm"
        onClick={() => fireEvent("pricing_cta_click")}
      >
        Take the free quiz <ArrowRight className="w-4 h-4" />
      </Link>
    </div>
  );
}
