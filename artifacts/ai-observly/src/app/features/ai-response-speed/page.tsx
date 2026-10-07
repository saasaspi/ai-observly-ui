import type { Metadata } from "next";
import { FeaturePageShell } from "@/components/feature-page-shell";
import {
  SpeedHeroVisual, SpeedSlowCostlyVisual, SpeedWritingVisual, SpeedProvidersVisual,
} from "@/components/new-feature-visuals";
import { Gauge, Timer, AlertCircle } from "lucide-react";

export const metadata: Metadata = {
  title: "AI Response Speed: See How Long Your Customers Wait | AI Observly",
  description:
    "See typical and unusually slow AI response times for each feature and model, spot requests that are both slow and costly, and compare OpenAI, Anthropic, Gemini, Groq and Azure.",
};

export default function AiResponseSpeedPage() {
  return (
    <FeaturePageShell
      data={{
        hero: {
          h1: "See how long your customers wait for an AI answer",
          subhead:
            "A slow answer feels broken, even when it is correct. AI Observly shows the usual wait and the unusually slow waits for every feature and model, so you can find where customers are left staring at a spinner.",
          visual: <SpeedHeroVisual />,
        },
        featureCards: [
          {
            icon: <Timer className="w-5 h-5" />,
            title: "Usual wait and worst waits",
            body: "For each feature and model, see how long a typical request takes and how long the unlucky ones take.",
          },
          {
            icon: <Gauge className="w-5 h-5" />,
            title: "How fast answers are written",
            body: "Compare how quickly different models produce their answers, not just when the first word appears.",
          },
          {
            icon: <AlertCircle className="w-5 h-5" />,
            title: "Slow and costly together",
            body: "Spot requests that made customers wait and also cost real money. Those are the first ones worth fixing.",
          },
        ],
        productPreview: {
          caption: "An example of slow and costly requests side by side. The numbers are illustrative, not live data.",
          visual: <SpeedSlowCostlyVisual />,
        },
        benefitSections: [
          {
            title: "Averages hide the bad days",
            body: "If most requests take two seconds but one in twenty takes ten, the average looks fine while some customers are frustrated. AI Observly shows both the typical wait and the unusually slow ones, in seconds.",
            visual: <SpeedHeroVisual />,
          },
          {
            title: "Compare writing speed between models",
            body: "Some models write their answers faster than others. See that difference plainly, so a model switch is a decision backed by what your own customers experience.",
            visual: <SpeedWritingVisual />,
          },
          {
            title: "Compare the services you use",
            body: "If you use more than one AI service, see their typical response times next to each other. AI Observly supports OpenAI, Anthropic, Gemini, Groq and Azure for this comparison.",
            visual: <SpeedProvidersVisual />,
          },
        ],
        personaTabs: [
          { id: "pm", label: "Product managers", headline: "Find the features that feel slow", body: "Back up a hunch about sluggish features with real wait times.", link: "/use-cases/product-managers", linkLabel: "AI Observly for Product Managers" },
          { id: "cs", label: "Customer success", headline: "Understand the complaint before the call", body: "When a customer says it is slow, see whether slow waits are actually happening.", link: "/use-cases/customer-success", linkLabel: "AI Observly for Customer Success" },
          { id: "eng", label: "Engineering", headline: "Know where to look first", body: "Start with the feature and model that is both slow and costly.", link: "/use-cases/engineering", linkLabel: "AI Observly for Engineering" },
        ],
        relatedFeatures: [
          { title: "AI Savings", href: "/features/ai-savings", label: "Feature" },
          { title: "AI Reliability", href: "/features/ai-reliability", label: "Feature" },
          { title: "Per-Feature Margins & ROI", href: "/features/per-feature-margins-roi", label: "Feature" },
        ],
        faqs: [
          { q: "What counts as an unusually slow response?", a: "AI Observly shows the typical wait and the slowest waits, so you can see how bad the unlucky requests get. Technical people call these percentiles. You just see seconds." },
          { q: "What does comparing writing speed mean?", a: "After an AI starts answering, it writes at a certain pace. Technical people measure this in tokens per second. In AI Observly it is shown as how quickly a model writes its answer, so you can compare models." },
          { q: "Which providers can I compare?", a: "OpenAI, Anthropic, Gemini, Groq and Azure response times can be compared." },
          { q: "Does this guarantee response times?", a: "No. AI Observly shows what happened. It is not a contract or a promise of service levels from any provider." },
          { q: "Are the pictures on this page real data?", a: "No. They are examples with made-up numbers, labeled as such." },
          { q: "Which plan includes this?", a: "See the pricing page for current plan details." },
        ],
        footerCta: {
          headline: "Find out where your customers are waiting",
          subhead: "See usual and slow response times for every feature.",
        },
      }}
    />
  );
}
