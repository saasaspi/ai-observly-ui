import type { Metadata } from "next";
import { FeaturePageShell } from "@/components/feature-page-shell";
import {
  HeroVisualFeatureMargins,
  MockFeatureTable,
  BenefitVisualFeatureRanking,
  BenefitVisualRoadmap,
  BenefitVisualTokensAndCost,
  BenefitVisualArchitecture,
} from "@/components/feature-page-shell";
import { BarChart2, TrendingUp, Zap } from "lucide-react";

export const metadata: Metadata = {
  title: "Per-Feature AI Margins & ROI | AI Observly",
  description:
    "Find out which features in your AI product are profitable and which ones are quietly draining your LLM budget. Feature-level cost and ROI tracking for non-technical founders.",
};

export default function PerFeatureMarginsRoiPage() {
  return (
    <FeaturePageShell
      data={{
        hero: {
          h1: "Find out which features are actually worth building",
          subhead:
            "AI Observly breaks LLM spend down by feature, not just by customer — so you can see which parts of your product are profitable, and which ones are quietly draining your AI budget.",
          visual: <HeroVisualFeatureMargins />,
        },

        featureCards: [
          {
            icon: <BarChart2 className="w-5 h-5" />,
            title: "Feature-Level Cost Breakdown",
            body: "See exactly how much every AI feature costs to run — per call, per day, per month — broken out from your total provider bill automatically.",
          },
          {
            icon: <TrendingUp className="w-5 h-5" />,
            title: "ROI Scorecard per Feature",
            body: "Pair cost with usage and revenue impact so you can see, feature by feature, what's paying for itself and what isn't.",
          },
          {
            icon: <Zap className="w-5 h-5" />,
            title: "Usage-vs-Cost Correlation",
            body: "Spot the features where usage is climbing but cost is climbing faster — the earliest warning sign of a feature that needs re-pricing or re-engineering.",
          },
        ],

        productPreview: {
          caption:
            "Every AI-powered feature in your product, ranked by what it actually costs you.",
          visual: <MockFeatureTable />,
        },

        benefitSections: [
          {
            title: "Stop subsidizing features nobody pays for",
            body: "Not every AI feature earns its keep. AI Observly shows you which ones are driving real usage and revenue, and which are burning tokens for a feature customers barely touch.",
            visual: <BenefitVisualFeatureRanking />,
          },
          {
            title: "Prioritize your roadmap with real cost data",
            body: "\u201cShould we build this?\u201d gets a lot easier to answer when you know what your existing AI features actually cost to run at scale. Use real per-feature cost history instead of a guess when scoping the next one.",
            visual: <BenefitVisualRoadmap />,
          },
          {
            title: "See the full picture — tokens, calls, and dollars",
            body: "Token counts and call volume tell you what's happening. Dollars tell you if it matters. AI Observly shows both side by side, per feature, so nothing gets lost in translation between engineering and the P&L.",
            visual: <BenefitVisualTokensAndCost />,
          },
          {
            title: "One lightweight endpoint, no rebuild required",
            body: "Tag usage by feature the same simple way you already tag it by customer — one fire-and-forget usage report, no proxy, no stored provider keys, live in minutes.",
            visual: <BenefitVisualArchitecture />,
          },
        ],

        personaTabs: [
          {
            id: "founders",
            label: "SaaS Founders & Indie Hackers",
            headline: "Know which features are actually growing the business",
            body: "You shipped the AI feature to drive growth. AI Observly tells you whether it's driving growth profitably.",
            link: "/use-cases/founders",
            linkLabel: "AI Observly for Founders",
          },
          {
            id: "pms",
            label: "AI Product Managers",
            headline: "Bring cost into the prioritization conversation",
            body: "Usage analytics tell you what people click. AI Observly tells you what it costs when they do — so cost becomes a real input into what you build next, not an afterthought at invoice time.",
            link: "/use-cases/product-managers",
            linkLabel: "AI Observly for Product Managers",
          },
          {
            id: "eng",
            label: "Engineering Leads",
            headline: "See the cost impact of shipping decisions",
            body: "Model choice, prompt length, and retry logic all show up in the bill. Per-feature cost tracking makes that visible without digging through raw provider logs.",
            link: "/use-cases/engineering",
            linkLabel: "AI Observly for Engineering",
          },
        ],

        relatedFeatures: [
          {
            title: "Per-Customer Cost Attribution",
            href: "/features/per-customer-cost-attribution",
            label: "Feature",
          },
          {
            title: "Plan & Pricing Profitability",
            href: "/features/plan-pricing-profitability",
            label: "Feature",
          },
          {
            title: "LLM Spend Analyzer",
            href: "/spend-checkup",
            label: "Free Tool",
          },
        ],

        faqs: [
          {
            q: 'What does "per-feature margin" mean for an AI product?',
            a: "It means knowing the AI cost of each individual feature (e.g. an AI summary tool, a chat assistant, an auto-tagging feature) rather than just one blended provider bill for your whole product.",
          },
          {
            q: "Do I have to tag every API call manually?",
            a: "You add a feature identifier the same lightweight way you'd tag a customer — a small addition to your existing usage report call, no rebuild required.",
          },
          {
            q: "How is this different from a general LLM observability tool?",
            a: "Tools like Helicone or Langfuse focus on requests, latency, and errors for developers. AI Observly is built to answer a business question — which features make money and which ones cost more than they're worth.",
          },
          {
            q: "Can I see feature cost trends over time?",
            a: "Yes — feature-level cost and usage trends are tracked over time so you can see whether a feature's cost is climbing faster than its usage or revenue.",
          },
        ],

        footerCta: {
          headline: "Know which features are actually paying for themselves",
          subhead: "Feature-level AI cost and ROI, without the spreadsheet.",
        },
      }}
    />
  );
}
