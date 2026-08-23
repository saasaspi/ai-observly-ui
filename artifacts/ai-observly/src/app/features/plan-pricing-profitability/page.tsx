import type { Metadata } from "next";
import { FeaturePageShell } from "@/components/feature-page-shell";
import {
  HeroVisualPlanProfitability,
  MockPlanTable,
  BenefitVisualPlanMargin,
  BenefitVisualMarginCalculator,
  BenefitVisualOverhead,
  BenefitVisualCalculatorVsDashboard,
} from "@/components/feature-page-shell";
import { CreditCard, Calculator, Layers } from "lucide-react";

export const metadata: Metadata = {
  title: "Plan & Pricing Profitability for AI Products | AI Observly",
  description:
    "See net margin by pricing plan after AI costs, not just gross revenue. Model overhead, back-calculate the price you need, and reprice with confidence.",
};

export default function PlanPricingProfitabilityPage() {
  return (
    <FeaturePageShell
      data={{
        hero: {
          h1: "Know which pricing plans are actually making you money",
          subhead:
            "Revenue by plan is easy to see. Net margin after AI cost isn't — until now. AI Observly shows you profitability by plan tier, and what price you'd need to hit your margin goal.",
          visual: <HeroVisualPlanProfitability />,
        },

        featureCards: [
          {
            icon: <CreditCard className="w-5 h-5" />,
            title: "Plan-Level Margin Dashboard",
            body: "See AI cost, revenue, and net margin rolled up by plan tier — not just by individual customer — so you know which tiers are healthy and which are quietly underwater.",
          },
          {
            icon: <Calculator className="w-5 h-5" />,
            title: "Ideal Margin Calculator",
            body: "Set a target margin and AI Observly back-calculates the price you'd need to charge to hit it, based on your actual AI cost per customer on that plan.",
          },
          {
            icon: <Layers className="w-5 h-5" />,
            title: "Overhead-Aware Modeling",
            body: "Add infrastructure and overhead costs alongside raw LLM spend, so plan margin reflects what a customer really costs you — not just the provider invoice.",
          },
        ],

        productPreview: {
          caption:
            "Every pricing tier, ranked by what it actually nets you after AI cost.",
          visual: <MockPlanTable />,
        },

        benefitSections: [
          {
            title: "Revenue isn't profit — see margin by plan",
            body: "A plan can look great on the revenue report and still be losing money once you account for AI cost. AI Observly shows net margin per plan so pricing decisions are based on what a tier actually nets you, not just what it bills.",
            visual: <BenefitVisualPlanMargin />,
          },
          {
            title: "Reprice with confidence, not guesswork",
            body: "Thinking about raising prices on your Pro tier? See the actual AI cost driving that decision first, and use the margin calculator to find the price that gets you to your target margin — not a number pulled out of thin air.",
            visual: <BenefitVisualMarginCalculator />,
          },
          {
            title: "Model overhead, not just token cost",
            body: "Token cost is only part of the picture. Add hosting, storage, and other per-customer overhead so your margin numbers reflect the business, not just the LLM invoice.",
            visual: <BenefitVisualOverhead />,
          },
          {
            title: "From free calculator to full plan tracking",
            body: "Start with the free Plan & Pricing Margin Calculator to model a few scenarios by hand. When you're ready to track it live against real usage data, AI Observly keeps the numbers current automatically.",
            visual: <BenefitVisualCalculatorVsDashboard />,
          },
        ],

        personaTabs: [
          {
            id: "founders",
            label: "SaaS Founders & Indie Hackers",
            headline: "Price your plans against reality, not intuition",
            body: "You picked your pricing before you knew what AI usage would look like at scale. AI Observly shows you where that guess was right, and where it wasn't.",
            link: "/use-cases/founders",
            linkLabel: "AI Observly for Founders",
          },
          {
            id: "pms",
            label: "AI Product Managers",
            headline: "Connect pricing strategy to real usage data",
            body: "See how plan-level margin shifts as usage patterns change, so pricing changes are grounded in what customers are actually doing.",
            link: "/use-cases/product-managers",
            linkLabel: "AI Observly for Product Managers",
          },
          {
            id: "finance",
            label: "Finance & Ops",
            headline: "A cleaner number for AI cost of goods sold",
            body: "Get a plan-level view of AI cost that's easier to reconcile against revenue than a single combined provider invoice.",
            link: "/use-cases/finance",
            linkLabel: "AI Observly for Finance & Ops",
          },
        ],

        relatedFeatures: [
          {
            title: "Per-Customer Cost Attribution",
            href: "/features/per-customer-cost-attribution",
            label: "Feature",
          },
          {
            title: "Per-Feature Margins & ROI",
            href: "/features/per-feature-margins-roi",
            label: "Feature",
          },
          {
            title: "Plan & Pricing Margin Calculator",
            href: "/tools/plan-pricing-margin-calculator",
            label: "Free Tool",
          },
        ],

        faqs: [
          {
            q: 'What does "plan profitability" mean for an AI product?',
            a: "It means looking at net margin — revenue minus AI cost and overhead — for each pricing tier, instead of just looking at revenue per plan on its own.",
          },
          {
            q: "How does the Ideal Margin Calculator work?",
            a: "You set a target margin percentage, and it uses your actual average AI cost per customer on that plan to back-calculate the price you'd need to charge to hit that margin.",
          },
          {
            q: "Can I include costs other than LLM/API spend?",
            a: "Yes — you can layer in infrastructure, hosting, or other per-customer overhead alongside raw provider cost, so plan margin reflects your real cost to serve.",
          },
          {
            q: "Is this the same as the free Plan & Pricing Margin Calculator?",
            a: "The free calculator lets you model scenarios manually. The full dashboard tracks plan margin automatically against your real, live usage data.",
          },
        ],

        footerCta: {
          headline: "Know which plans are actually profitable",
          subhead: "Net margin by pricing tier, and the price you need to hit your goal.",
        },
      }}
    />
  );
}
