import type { Metadata } from "next";
import { FeaturePageShell } from "@/components/feature-page-shell";
import {
  HeroVisualCustomerAttribution,
  MockCustomerTable,
  BenefitVisualCostToServe,
  BenefitVisualAlert,
  BenefitVisualArchitecture,
  BenefitVisualPlainDashboard,
} from "@/components/feature-page-shell";
import { Users, Bell, Unlock } from "lucide-react";

export const metadata: Metadata = {
  title: "Per-Customer AI Cost Attribution | AI Observly",
  description:
    "See exactly which customers are profitable and which are quietly burning your AI margin. Per-customer LLM cost attribution for non-technical SaaS founders. No proxy, no code changes.",
};

export default function PerCustomerCostAttributionPage() {
  return (
    <FeaturePageShell
      data={{
        hero: {
          h1: "See exactly which customers are burning your AI margin",
          subhead:
            "AI Observly attributes every LLM and API dollar to the customer who spent it — so you know who's profitable and who's quietly eating your margin, before it shows up on your P&L.",
          visual: <HeroVisualCustomerAttribution />,
        },

        featureCards: [
          {
            icon: <Users className="w-5 h-5" />,
            title: "Automatic Cost Ledger, Per Customer",
            body: "Every API call and token is tagged to the customer_id that triggered it — automatically, from day one. No manual tagging, no spreadsheets, no engineering project.",
          },
          {
            icon: <Bell className="w-5 h-5" />,
            title: "Margin-Negative Alerts",
            body: "Get flagged the moment a customer's AI spend crosses what they're paying you — not 30 days later when the provider invoice lands.",
          },
          {
            icon: <Unlock className="w-5 h-5" />,
            title: "Top 5 Free, Unlock the Rest",
            body: "Start free with your top 5 customers' cost, revenue, and margin fully unlocked. Upgrade to unlock the rest of your customer base.",
          },
        ],

        productPreview: {
          caption:
            "Customer names are always visible. Cost, revenue, and margin unlock as you upgrade.",
          visual: <MockCustomerTable />,
        },

        benefitSections: [
          {
            title: "Know your true cost-to-serve, per customer",
            body: "Revenue per customer is easy. Cost-to-serve for AI-powered products isn't — until now. AI Observly pulls usage straight from your LLM and API providers and rolls it up by customer, so \u201ccost to serve\u201d stops being a guess.",
            visual: <BenefitVisualCostToServe />,
          },
          {
            title: "Catch margin-negative customers before renewal",
            body: "A single power user on a flat-rate plan can quietly wipe out the margin of ten normal ones. AI Observly surfaces margin-negative accounts as they happen, so you can fix pricing, add usage limits, or have the conversation before the renewal — not after.",
            visual: <BenefitVisualAlert />,
          },
          {
            title: "No proxy, no stored API keys",
            body: "AI Observly never sits between your app and your LLM provider. A lightweight, fire-and-forget usage-report call sends us the numbers we need — your requests, your data, and your provider API keys stay exactly where they are.",
            visual: <BenefitVisualArchitecture />,
          },
          {
            title: "Built for founders, not for engineers",
            body: "No SQL, no query builder, no dashboard-of-dashboards. If you can read a spreadsheet, you can read your customer margins — in plain English, with the follow-up question already answered.",
            visual: <BenefitVisualPlainDashboard />,
          },
        ],

        personaTabs: [
          {
            id: "founders",
            label: "SaaS Founders & Indie Hackers",
            headline: "Stop finding out about margin problems from your bank balance",
            body: "You're already watching MRR. AI Observly gives you the other half of the picture — what each customer actually costs you to serve — so growth doesn't quietly become a losing bet.",
            link: "/use-cases/founders",
            linkLabel: "AI Observly for Founders",
          },
          {
            id: "pms",
            label: "AI Product Managers",
            headline: "Tie usage data to unit economics, not just engagement",
            body: "You already track feature usage. AI Observly adds the cost layer, so \u201cengaged customer\u201d and \u201cprofitable customer\u201d stop being two different conversations.",
            link: "/use-cases/product-managers",
            linkLabel: "AI Observly for Product Managers",
          },
          {
            id: "cs",
            label: "Customer Success & Ops",
            headline: "Know which accounts need a plan conversation",
            body: "See which customers are trending margin-negative before the renewal call, not during it.",
            link: "/use-cases/customer-success",
            linkLabel: "AI Observly for Customer Success",
          },
        ],

        relatedFeatures: [
          {
            title: "Per-Feature Margins & ROI",
            href: "/features/per-feature-margins-roi",
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
            q: "What is per-customer AI cost attribution?",
            a: "It's the practice of tracking exactly how much LLM/API spend each of your customers generates, instead of only seeing one combined provider bill. AI Observly automates this by rolling up usage per customer_id.",
          },
          {
            q: "How is this different from Helicone or Langfuse?",
            a: "Helicone and Langfuse are developer-facing observability tools built around requests, latency, and errors. AI Observly is built specifically to answer one question for non-technical founders: which customers are profitable, and which ones aren't.",
          },
          {
            q: "Do I need to add a proxy or change my code?",
            a: "No. AI Observly doesn't sit between your app and your LLM provider. You send a lightweight usage report from your existing code — no proxy, no rewritten API calls, no stored provider keys.",
          },
          {
            q: "What do I see on the free plan?",
            a: "Your top 5 customers' cost, revenue, and margin, fully unlocked, on one provider. Every other customer name is still visible — the cost data just stays blurred until you upgrade.",
          },
        ],

        footerCta: {
          headline: "Stop guessing which customers are actually profitable",
          subhead:
            "See your real per-customer margins in minutes, not after next quarter's invoice.",
        },
      }}
    />
  );
}
