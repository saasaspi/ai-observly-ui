import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";
import { FeaturePageShell } from "@/components/feature-page-shell";
import {
  SavingsHeroVisual, SavingsTableVisual, SavingsRankingVisual, SavingsExplainerVisual,
} from "@/components/new-feature-visuals";
import { PiggyBank, BarChart2, TrendingUp } from "lucide-react";

export const metadata: Metadata = pageMetadata("/features/ai-savings");

export default function AiSavingsPage() {
  return (
    <FeaturePageShell
      data={{
        hero: {
          h1: "Stop paying full price for the same AI work twice",
          subhead:
            "Many AI products send the same long instructions with every request. AI Observly shows how much of that repeated work gets reused at a lower price, how many dollars that saved, and where savings are slipping away.",
          visual: <SavingsHeroVisual />,
        },
        featureCards: [
          {
            icon: <PiggyBank className="w-5 h-5" />,
            title: "Saved versus missed, in dollars",
            body: "One clear pair of numbers: what reuse saved you, and what you could have saved but did not.",
          },
          {
            icon: <BarChart2 className="w-5 h-5" />,
            title: "Features ranked by reuse",
            body: "See which features reuse their repeated work often and which barely do, side by side.",
          },
          {
            icon: <TrendingUp className="w-5 h-5" />,
            title: "Busy but wasteful, flagged",
            body: "Features that are used a lot but reuse very little are highlighted, so you know where a fix is worth a developer's time.",
          },
        ],
        productPreview: {
          caption: "An example of saved and missed dollars for each feature. The numbers are illustrative, not live data.",
          visual: <SavingsTableVisual />,
        },
        benefitSections: [
          {
            title: "Reuse, explained without the jargon",
            body: "Think of it like a photocopy. The first time, you pay for the full job. If the same pages come back, you can reuse the copy at a lower price. AI providers offer a version of this for repeated instructions. This view shows whether your product is actually benefiting from it.",
            visual: <SavingsExplainerVisual />,
          },
          {
            title: "Know which feature to improve first",
            body: "A popular feature that reuses almost nothing is the clearest opening to cut cost. AI Observly ranks features by reuse and highlights those, so the conversation with your developer starts with a specific feature, not a vague hope.",
            visual: <SavingsRankingVisual />,
          },
        ],
        personaTabs: [
          { id: "founders", label: "Founders", headline: "See the money you are leaving behind", body: "Missed savings turn a vague sense that the bill is too high into a number you can act on.", link: "/use-cases/founders", linkLabel: "AI Observly for Founders" },
          { id: "pm", label: "Product managers", headline: "Judge a feature by what it really costs", body: "Reuse changes what a feature costs to run. Factor it into roadmap and pricing calls.", link: "/use-cases/product-managers", linkLabel: "AI Observly for Product Managers" },
          { id: "finance", label: "Finance", headline: "Explain why the bill moved", body: "Separate spend that was avoidable from spend that was not.", link: "/use-cases/finance", linkLabel: "AI Observly for Finance" },
        ],
        relatedFeatures: [
          { title: "AI Response Speed", href: "/features/ai-response-speed", label: "Feature" },
          { title: "AI Reliability", href: "/features/ai-reliability", label: "Feature" },
          { title: "Per-Feature Margins & ROI", href: "/features/per-feature-margins-roi", label: "Feature" },
        ],
        faqs: [
          { q: "What does reuse mean here?", a: "When your product sends the same instructions or background material again and again, some AI providers can reuse their earlier work and charge less for it. AI Observly shows how much of your repeated work is being reused versus charged at full price." },
          { q: "How much will I save?", a: "It depends entirely on your product and how it is built. AI Observly does not promise a savings number. It shows what you are saving today and what you are missing, so you can decide whether it is worth acting on." },
          { q: "Does AI Observly turn reuse on for me?", a: "No. It shows you where reuse is happening and where it is not. Changing how your product sends requests is a decision for you and your developer." },
          { q: "Who is this for?", a: "Founders and teams who want to understand the bill without reading technical logs. The numbers are in dollars and features, not jargon." },
          { q: "Are the pictures on this page real data?", a: "No. They are examples with made-up numbers, labeled as such, to show what the view looks like." },
          { q: "Which plan includes this?", a: "See the pricing page for current plan details." },
        ],
        footerCta: {
          headline: "Find out how much repeated work you are paying full price for",
          subhead: "See saved and missed dollars for every feature.",
        },
      }}
    />
  );
}
