import type { Metadata } from "next";
import { UseCaseShell } from "@/components/use-case-shell";

export const metadata: Metadata = {
  title: "Feature-Level AI Cost & ROI Data for Product Managers | AI Observly",
  description:
    "Tie every AI feature to its true cost-to-serve. Prioritise your roadmap with real margin data instead of gut feel.",
};

export default function ProductManagersPage() {
  return (
    <UseCaseShell
      data={{
        h1: "Ship AI features you know are worth building",
        subhead:
          "Usage graphs tell you a feature is popular. AI Observly tells you what that popularity actually costs — and whether it's worth doubling down on.",
        problems: [
          {
            label: "Adoption without economics.",
            body: "You can see a feature's usage climbing, but not what each use costs to serve — so you can't tell if growth is a win or a slow leak.",
          },
          {
            label: "Roadmap calls run on opinion.",
            body: "Without per-feature cost data, prioritisation conversations default to whoever argues loudest, not what the numbers say.",
          },
          {
            label: "No line back to the customer.",
            body: "When a feature's costs spike, it's hard to tell whether it's one heavy user, a whole segment, or a genuine usage pattern worth designing around.",
          },
        ],
        helpItems: [
          {
            label: "Per-feature cost & margin.",
            body: "See what each AI feature costs to run — broken down by customer and plan — so usage and cost live in the same view.",
          },
          {
            label: "Cost-aware prioritisation.",
            body: "Bring real cost-to-serve numbers into roadmap discussions, not just usage counts.",
          },
          {
            label: "Customer-level context.",
            body: "Trace a feature's cost back to the specific accounts driving it, so you know if it's a segment worth building for or an outlier to manage.",
          },
        ],
        ctaLine: "Bring cost data to your next roadmap review.",
      }}
    />
  );
}
