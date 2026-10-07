import Link from "next/link";
import { ArrowRight, Bot, Code2 } from "lucide-react";

const paths = [
  {
    id: "assistant",
    icon: Bot,
    eyebrow: "Path one",
    title: "Let your AI coding assistant do it",
    blurb: "Building with an AI coding assistant? Give it our instructions, then review the changes together.",
    steps: [
      "Give the guide's instructions to your assistant",
      "Have it add your AI Observly key securely to your project",
      "Your assistant explains every change it makes",
      "Try one real AI action in your product",
    ],
    cta: "Read the AI agent guide",
    href: "/docs/getting-started-ai-agent-guide",
  },
  {
    id: "developer",
    icon: Code2,
    eyebrow: "Path two",
    title: "Set up with your developer",
    blurb: "You or your developer can add tracking alongside your existing AI features, without rebuilding your product.",
    steps: [
      "Add AI Observly to your project",
      "Connect it securely with your AI Observly key",
      "Label the customer and feature behind each AI action",
      "Try one real AI action in your product",
    ],
    note: "Your product keeps talking directly to its AI services. Failed requests can be tracked too.",
    cta: "Read the developer guide",
    href: "/docs/getting-started-developer-guide",
  },
];

export function SetupPaths() {
  return (
    <section id="how-it-works" className="sp-section pub-section relative py-16 md:py-24 px-6 bg-card border-y border-border overflow-hidden">
      <div aria-hidden className="sp-wash" />
      <div className="relative max-w-5xl mx-auto">
        <div className="text-center mb-14">
          <p data-reveal className="text-sm font-semibold uppercase tracking-widest text-primary mb-3">Getting started</p>
          <h2 data-reveal style={{ transitionDelay: "0.08s" }} className="text-3xl md:text-4xl font-bold font-outfit mb-4">
            Two ways in. One moment that matters.
          </h2>
          <p data-reveal style={{ transitionDelay: "0.16s" }} className="text-muted-foreground text-lg max-w-xl mx-auto">
            Pick the route that fits how you build. You finish when your first real usage appears.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {paths.map((p, i) => (
            <div
              key={p.id}
              data-reveal
              style={{ transitionDelay: `${i * 0.12}s` }}
              className="sp-card pub-card pub-card-link bg-background"
            >
              <div className="flex items-center gap-3 mb-5">
                <div className="hp-icon w-11 h-11 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                  <p.icon className="w-5 h-5" />
                </div>
                <span className="text-xs font-semibold uppercase tracking-wider text-primary">{p.eyebrow}</span>
              </div>
              <h3 className="text-xl font-bold text-foreground mb-2">{p.title}</h3>
              <p className="text-muted-foreground text-sm leading-relaxed mb-6">{p.blurb}</p>

              <ol className="sp-steps flex-1 space-y-3 mb-6">
                {p.steps.map((s, n) => (
                  <li key={s} className="sp-step flex gap-3 items-start" style={{ ["--i" as string]: n }}>
                    <span className="sp-num shrink-0 w-7 h-7 rounded-full border border-primary/30 bg-primary/10 text-primary text-xs font-bold font-outfit flex items-center justify-center">
                      {n + 1}
                    </span>
                    <span className="text-sm text-foreground leading-relaxed pt-1">{s}</span>
                  </li>
                ))}
              </ol>

              {p.note && (
                <p className="text-xs text-muted-foreground rounded-lg bg-muted px-3 py-2 mb-5 leading-relaxed">{p.note}</p>
              )}

              <Link
                href={p.href}
                className="pub-btn pub-btn-secondary w-full sm:w-auto mt-auto self-start"
              >
                {p.cta} <ArrowRight className="hp-arrow w-4 h-4" />
              </Link>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
