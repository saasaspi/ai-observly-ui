import type { Metadata } from "next";
import { UseCaseShell } from "@/components/use-case-shell";

export const metadata: Metadata = {
  title: "Spot Account Usage & Margin Signals Before Renewal | AI Observly for CS",
  description:
    "See which accounts are quietly costing you money and which are ready to expand — before the renewal call, not during it.",
};

export default function CustomerSuccessPage() {
  return (
    <UseCaseShell
      data={{
        h1: "Walk into every renewal knowing the real story",
        subhead:
          "Usage dashboards show you activity. AI Observly shows you what that activity actually costs — so you know which accounts need a conversation before the invoice does the talking.",
        problems: [
          {
            label: "Surprises show up on the bill, not the dashboard.",
            body: "A customer's AI usage spikes for weeks before anyone on your side notices — usually when finance asks about it.",
          },
          {
            label: "Heavy usage is ambiguous.",
            body: "A power user could be your best expansion opportunity or a margin problem in the making, and most CS tools can't tell you which.",
          },
          {
            label: "Renewal conversations lack cost context.",
            body: "You know a customer's plan and support history — but not whether they're actually profitable at their current tier.",
          },
        ],
        helpItems: [
          {
            label: "Per-customer usage & cost visibility.",
            body: "See exactly how each account uses AI features and what it costs to serve them, alongside their plan.",
          },
          {
            label: "Early signal on problem accounts.",
            body: "Catch cost spikes while they're still a conversation, not a churn risk or a write-off.",
          },
          {
            label: "Expansion cues built in.",
            body: "An account pushing past its plan's usage is a warmer upsell signal than a check-in email — and you'll see it before the renewal date, not at it.",
          },
        ],
        ctaLine: "Go into your next renewal with the full picture.",
      }}
    />
  );
}
