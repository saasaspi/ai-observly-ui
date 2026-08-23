import type { Metadata } from "next";
import { UseCaseShell } from "@/components/use-case-shell";

export const metadata: Metadata = {
  title: "Lightweight AI Cost Attribution for Engineering Teams | AI Observly",
  description:
    "One fire-and-forget endpoint. No proxy in your request path. No stored API keys. Get per-customer cost attribution without building it yourself.",
};

export default function EngineeringPage() {
  return (
    <UseCaseShell
      data={{
        h1: "Cost attribution without building it yourself",
        subhead:
          "Product and finance keep asking what an AI feature costs per customer. AI Observly answers that without you having to build a logging pipeline to get there.",
        problems: [
          {
            label: "\"What does this cost per customer?\" has no easy answer.",
            body: "Getting there yourself means custom logging, a data pipeline to aggregate it, and someone to maintain both.",
          },
          {
            label: "Most cost-tracking tools want to sit in the request path.",
            body: "Proxying every LLM call adds a moving part and a new failure mode to something that already works.",
          },
          {
            label: "Provider credentials become another thing to secure.",
            body: "Tools that need your API keys to work are one more surface to worry about.",
          },
        ],
        helpItems: [
          {
            label: "Fire-and-forget usage-report endpoint.",
            body: "Report usage from your existing code with a single call — no proxy, nothing sitting between your app and the LLM provider.",
          },
          {
            label: "No API keys stored, ever.",
            body: "AI Observly never touches your provider credentials — it only sees the usage data you choose to send.",
          },
          {
            label: "Ship it once.",
            body: "A lightweight integration you can add in one sitting, not a sprint — and you're done answering the cost question by hand.",
          },
        ],
        ctaLine: "Get cost visibility without the infra project.",
      }}
    />
  );
}
