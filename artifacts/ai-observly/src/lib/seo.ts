import type { Metadata } from "next";

export const SITE_URL = "https://aiobservly.com";
export const ORGANIZATION_ID = `${SITE_URL}/#organization`;
export const PUBLIC_PAGES: Record<string, { title: string; description: string; kind?: "SoftwareApplication" | "WebApplication" }> = {
  "/": { title: "AI Cost & Margin Tracking", description: "AI cost tracking by customer, feature, and plan. Understand margins, repeated-work savings, response speed, and failed requests.", kind: "SoftwareApplication" },
  "/pricing": { title: "AI Observly Pricing & Plans", description: "AI Observly pricing for customer-level AI cost tracking. Compare Free, Pro, and Scale plans and choose the right fit for your product." },
  "/blog": { title: "AI Cost & Margin Insights", description: "AI cost and margin insights for founders. Explore practical guides to pricing, customer costs, savings, speed, and reliability." },
  "/docs": { title: "AI Observly Documentation", description: "AI Observly documentation for connecting your product, recording AI usage, and understanding customer and feature costs." },
  "/tools": { title: "Free AI Cost & Pricing Tools", description: "Free AI cost tools for founders. Analyze LLM spending, find cost blind spots, and calculate plan margins without a paid account." },
  "/spend-checkup": { title: "LLM Spend Analyzer", description: "LLM spend analysis from your billing CSV. Compare AI costs by model, date, and usage pattern with AI Observly's free analyzer.", kind: "WebApplication" },
  "/blind-spot-quiz": { title: "AI Cost Blind Spot Quiz", description: "AI cost blind spot quiz for founders. Answer eight questions to understand gaps in your spending and margin visibility.", kind: "WebApplication" },
  "/tools/plan-pricing-margin-calculator": { title: "AI Plan Pricing & Margin Calculator", description: "AI pricing calculator for plan margins. Model customer usage, AI costs, and subscription prices before choosing a pricing tier.", kind: "WebApplication" },
  "/features/per-customer-cost-attribution": { title: "AI Cost Per Customer", description: "AI cost per customer shows which accounts drive spending and which cover their costs. Understand profitable and margin-negative customers.", kind: "SoftwareApplication" },
  "/features/per-feature-margins-roi": { title: "AI Feature Margins & ROI", description: "AI feature margins reveal what each feature costs compared with what it earns. Make roadmap decisions using real cost and revenue data.", kind: "SoftwareApplication" },
  "/features/plan-pricing-profitability": { title: "AI Plan & Pricing Profitability", description: "AI plan profitability shows which pricing tiers cover their AI costs. Understand customer usage and choose sustainable pricing.", kind: "SoftwareApplication" },
  "/features/ai-savings": { title: "AI Savings & Repeated-Work Costs", description: "AI savings tracking shows repeated work reused at lower cost, savings missed, and the features worth reviewing with your developer.", kind: "SoftwareApplication" },
  "/features/ai-response-speed": { title: "AI Response Speed Analytics", description: "AI response speed analytics show how long customers wait, which features are slow, and which requests are both costly and slow.", kind: "SoftwareApplication" },
  "/features/ai-reliability": { title: "AI Reliability & Failed Request Costs", description: "AI reliability tracking shows failed and interrupted requests, what they cost, and which customers were affected.", kind: "SoftwareApplication" },
  "/use-cases/founders": { title: "AI Cost Tracking for SaaS Founders", description: "AI cost tracking for founders connects customer usage to margins. Understand spending before making pricing and roadmap decisions." },
  "/use-cases/product-managers": { title: "AI Cost Insights for Product Managers", description: "AI cost insights for product managers show feature spending and margins, helping you prioritize the work that supports your business." },
  "/use-cases/customer-success": { title: "AI Usage Insights for Customer Success", description: "AI usage insights help customer success teams understand spending spikes and customer costs before renewal conversations." },
  "/use-cases/engineering": { title: "AI Usage Tracking for Engineering", description: "AI usage tracking for engineering connects existing requests to customers and features without replacing your provider calls." },
  "/use-cases/finance": { title: "AI Cost Visibility for Finance Teams", description: "AI cost visibility for finance teams connects spending to customers and plans so you can understand unit economics and margins." },
};

export function canonical(path: string) {
  return `${SITE_URL}${path === "/" ? "/" : "/" + path.split("?")[0].split("#")[0].replace(/^\/+|\/+$/g, "")}`;
}

function short(text: string, limit: number) {
  const value = text.replace(/\s+/g, " ").trim();
  return value.length <= limit ? value : value.slice(0, limit - 1).trimEnd() + "…";
}

export function pageMetadata(path: string, values: { title?: string; description?: string; image?: string; article?: boolean; published?: string; modified?: string } = {}): Metadata {
  const page = PUBLIC_PAGES[path] ?? PUBLIC_PAGES["/"];
  const title = short(values.title || page.title, 45);
  const description = short(values.description || page.description, 159);
  const url = canonical(path);
  const image = values.image || `${SITE_URL}/social/${path === "/" ? "home" : path.replace(/^\//, "")}`;
  return {
    title: { absolute: `${title} | AI Observly` },
    description,
    robots: { index: true, follow: true },
    alternates: { canonical: url },
    openGraph: {
      type: values.article ? "article" : "website", title: `${title} | AI Observly`,
      description, url, siteName: "AI Observly", locale: "en_US",
      images: [{ url: image, width: 1200, height: 630, alt: title }],
      ...(values.article ? { publishedTime: values.published, modifiedTime: values.modified, authors: [SITE_URL] } : {}),
    },
    twitter: { card: "summary_large_image", title: `${title} | AI Observly`, description, images: [image] },
  };
}

export const PRIVATE_METADATA: Metadata = { robots: { index: false, follow: false, googleBot: { index: false, follow: false } } };

export function applicationSchema(path: string) {
  const page = PUBLIC_PAGES[path];
  if (!page?.kind) return null;
  return { "@context": "https://schema.org", "@type": page.kind, name: page.title, description: page.description,
    url: canonical(path), applicationCategory: "BusinessApplication", operatingSystem: "Web",
    publisher: { "@id": ORGANIZATION_ID } };
}

export function breadcrumbSchema(items: { name: string; path: string }[]) {
  return { "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: items.map((item, index) => ({
    "@type": "ListItem", position: index + 1, name: item.name, item: canonical(item.path),
  })) };
}

export function faqSchema(items: { question: string; answer: string }[]) {
  return { "@context": "https://schema.org", "@type": "FAQPage", mainEntity: items.map(item => ({
    "@type": "Question", name: item.question, acceptedAnswer: { "@type": "Answer", text: item.answer },
  })) };
}
