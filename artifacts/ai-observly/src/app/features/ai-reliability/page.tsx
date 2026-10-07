import type { Metadata } from "next";
import { FeaturePageShell } from "@/components/feature-page-shell";
import {
  ReliabilityHeroVisual, ReliabilityTableVisual, ReliabilityFeedVisual, ReliabilityEndingsVisual,
} from "@/components/new-feature-visuals";
import { ShieldAlert, Search, DollarSign } from "lucide-react";

export const metadata: Metadata = {
  title: "AI Reliability: See What Failed Requests Cost You | AI Observly",
  description:
    "See money spent on failed or interrupted AI requests, why they happened, which responses were cut short, and which customers were affected. Plain language for founders.",
};

export default function AiReliabilityPage() {
  return (
    <FeaturePageShell
      data={{
        hero: {
          h1: "See what failed AI requests are costing you",
          subhead:
            "Sometimes an AI request fails or is cut off, and you can still be charged for it. AI Observly shows how much money that is, why it happened, and which customers ran into it.",
          visual: <ReliabilityHeroVisual />,
        },
        featureCards: [
          {
            icon: <DollarSign className="w-5 h-5" />,
            title: "Money spent on failures",
            body: "One number for what you paid on requests that failed or were interrupted.",
          },
          {
            icon: <ShieldAlert className="w-5 h-5" />,
            title: "Reasons, grouped",
            body: "See failures sorted into plain causes: too many requests at once, instructions that were too long, or a safety filter stepping in.",
          },
          {
            icon: <Search className="w-5 h-5" />,
            title: "A feed you can search",
            body: "Recent failures with the time and the customer affected, searchable when someone writes in.",
          },
        ],
        productPreview: {
          caption: "An example of failures grouped by reason. The numbers are illustrative, not live data.",
          visual: <ReliabilityTableVisual />,
        },
        benefitSections: [
          {
            title: "Know why requests fail",
            body: "Too many requests at once is a different problem from instructions that are too long. Grouping failures by reason shows which kind you actually have, before you spend time on the wrong one.",
            visual: <ReliabilityHeroVisual />,
          },
          {
            title: "Tell cut-off answers from normal endings",
            body: "Not every unusual ending is a problem. AI Observly separates responses that finished normally, responses cut short and left incomplete, and handoffs where the AI asked another tool to do a step, which is expected.",
            visual: <ReliabilityEndingsVisual />,
          },
          {
            title: "Answer the customer who wrote in",
            body: "Search recent failures by customer and see when they happened. Support can say what went wrong instead of guessing.",
            visual: <ReliabilityFeedVisual />,
          },
        ],
        personaTabs: [
          { id: "cs", label: "Customer success", headline: "Find the failure behind the ticket", body: "Look up a customer and see recent failures with times.", link: "/use-cases/customer-success", linkLabel: "AI Observly for Customer Success" },
          { id: "founders", label: "Founders", headline: "See the cost of things going wrong", body: "Failed requests are spend with nothing to show for it. Make it visible.", link: "/use-cases/founders", linkLabel: "AI Observly for Founders" },
          { id: "eng", label: "Engineering", headline: "Start with the biggest cause", body: "Reasons are grouped so you can pick the one costing the most.", link: "/use-cases/engineering", linkLabel: "AI Observly for Engineering" },
        ],
        relatedFeatures: [
          { title: "AI Savings", href: "/features/ai-savings", label: "Feature" },
          { title: "AI Response Speed", href: "/features/ai-response-speed", label: "Feature" },
          { title: "Per-Customer Cost Attribution", href: "/features/per-customer-cost-attribution", label: "Feature" },
        ],
        faqs: [
          { q: "Do I really pay for failed requests?", a: "Sometimes. Depending on how and when a request fails, part of the work may still be billed. AI Observly shows the money spent on requests that failed or were interrupted." },
          { q: "Does AI Observly fix failures automatically?", a: "No. It shows what failed, why, and who was affected. Fixing the cause is up to you and your team." },
          { q: "What is a tool handoff?", a: "Sometimes the AI pauses to ask another system to do a step, like looking something up. That is a normal ending, so it is separated from responses that were cut off." },
          { q: "Does this score my AI quality?", a: "No. It reports failures and incomplete responses. It does not rate how good your answers are." },
          { q: "Are the pictures on this page real data?", a: "No. They are examples with made-up numbers, labeled as such." },
          { q: "Which plan includes this?", a: "See the pricing page for current plan details." },
        ],
        footerCta: {
          headline: "See the cost of failed requests",
          subhead: "Know what failed, why, and who it affected.",
        },
      }}
    />
  );
}
