// Shared copy for the three newer public feature pages. Plain language only.
export type NewFeatureKey = "savings" | "speed" | "reliability";

export const NEW_FEATURES: {
  key: NewFeatureKey;
  title: string;
  href: string;
  tagline: string;
  desc: string;
}[] = [
  {
    key: "savings",
    title: "AI Savings",
    href: "/features/ai-savings",
    tagline: "Are you paying full price for the same work twice?",
    desc: "See how much repeated AI work is being reused instead of charged at full price, what that saved you, and where savings are slipping away.",
  },
  {
    key: "speed",
    title: "AI Response Speed",
    href: "/features/ai-response-speed",
    tagline: "How long do your customers wait for an answer?",
    desc: "See typical and unusually slow wait times for each feature and model, and spot the requests that are both slow and expensive.",
  },
  {
    key: "reliability",
    title: "AI Reliability",
    href: "/features/ai-reliability",
    tagline: "How much are you paying for answers that never arrived?",
    desc: "See money spent on failed or cut-short requests, why they happened, and which customers were affected.",
  },
];

export const LAUNCH_POST = {
  slug: "ai-savings-response-speed-reliability-explained",
  title: "Savings, speed and reliability: three new ways to see what your AI is really doing",
  description:
    "A plain-language guide to AI Observly's new AI Savings, AI Response Speed and AI Reliability views, and what each one helps a founder decide.",
};
