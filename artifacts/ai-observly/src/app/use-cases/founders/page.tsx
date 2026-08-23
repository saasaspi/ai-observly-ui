import type { Metadata } from "next";
import { UseCaseShell } from "@/components/use-case-shell";

export const metadata: Metadata = {
  title: "AI Cost & Margin Tracking for Founders | AI Observly",
  description:
    "See which customers and features are quietly burning your AI margins — before they burn your runway. Built for non-technical founders, live in minutes.",
};

export default function FoundersPage() {
  return (
    <UseCaseShell
      data={{
        h1: "Know exactly which customers are eating your AI margins",
        subhead:
          "You added AI to your product. Your OpenAI or Anthropic bill went up. AI Observly shows you exactly who's driving it — and whether they're still profitable.",
        problems: [
          {
            label: "One invoice, zero answers.",
            body: "You can see your total LLM spend, but not which customers or plans are actually driving it.",
          },
          {
            label: "Margin-negative customers hide in plain sight.",
            body: "A customer on your $49/month plan can easily cost you $80/month in AI usage — and you won't know until it's a pattern, not an incident.",
          },
          {
            label: "Pricing is a guess.",
            body: "Without per-customer or per-plan cost data, every pricing decision — raising a tier, adding usage limits, sunsetting a plan — is based on a hunch, not a number.",
          },
        ],
        helpItems: [
          {
            label: "Per-customer cost attribution.",
            body: "See exactly what each customer costs you in AI spend, right next to their plan and revenue — no spreadsheet required.",
          },
          {
            label: "Plan & pricing profitability.",
            body: "Instantly see which pricing tiers are actually making you money and which ones are quietly subsidised by your other customers.",
          },
          {
            label: "Built for founders, not engineers.",
            body: "One lightweight integration — no proxy, no stored API keys — gets you live data the same day, no dev sprint needed.",
          },
        ],
        ctaLine:
          "Stop guessing which customers are worth keeping.",
      }}
    />
  );
}
