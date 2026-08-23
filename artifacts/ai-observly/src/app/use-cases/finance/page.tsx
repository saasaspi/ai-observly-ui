import type { Metadata } from "next";
import { UseCaseShell } from "@/components/use-case-shell";

export const metadata: Metadata = {
  title: "AI Cost Data for Unit Economics & Forecasting | AI Observly for Finance & Ops",
  description:
    "Turn unpredictable LLM spend into real per-customer and per-plan cost data — the missing input for unit economics and margin models.",
};

export default function FinancePage() {
  return (
    <UseCaseShell
      data={{
        h1: "Turn your AI bill into real unit economics",
        subhead:
          "Usage-based AI pricing makes the vendor invoice a moving target. AI Observly gives you the per-customer and per-plan cost data to model it properly instead of reacting to it.",
        problems: [
          {
            label: "AI/LLM spend is the hardest line item to forecast.",
            body: "It scales with usage, not headcount or seats, so last month's bill tells you very little about next month's.",
          },
          {
            label: "Contribution margin models are missing a piece.",
            body: "Without per-customer AI cost, any margin or unit economics model built on top of your SaaS revenue is incomplete.",
          },
          {
            label: "Overruns are discovered after the fact.",
            body: "By the time a cost problem shows up on the provider invoice, the quarter it affected is already closed.",
          },
        ],
        helpItems: [
          {
            label: "Per-customer & per-plan cost data.",
            body: "The input your unit economics and contribution margin models are currently missing, without asking engineering to pull it manually.",
          },
          {
            label: "Plan-level profitability.",
            body: "See which pricing tiers are structurally profitable and which are being propped up by your other plans.",
          },
          {
            label: "A shared source of truth.",
            body: "The same cost numbers finance, product, and founders are looking at — no more reconciling spreadsheets before a board meeting.",
          },
        ],
        ctaLine: "Give your margin models the missing input.",
      }}
    />
  );
}
