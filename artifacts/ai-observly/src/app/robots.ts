import type { MetadataRoute } from "next";
import { SITE_URL, PUBLIC_PAGES } from "@/lib/seo";

export default function robots(): MetadataRoute.Robots {
  const disallow = ["/dashboard", "/api", "/napi", "/login", "/signup", "/onboarding", "/settings", "/customers", "/features", "/auth", "/internal", "/studio"];
  // Exact /features route is internal; the public /features/* marketing routes remain crawlable.
  const rules = { allow: ["/", ...Object.keys(PUBLIC_PAGES).filter(path => path.startsWith("/features/"))], disallow };
  return {
    rules: [
      { userAgent: "*", ...rules },
      ...["Googlebot", "Bingbot", "GPTBot", "ClaudeBot", "PerplexityBot", "Google-Extended"].map(userAgent => ({ userAgent, ...rules })),
    ],
    sitemap: `${SITE_URL}/sitemap.xml`, host: SITE_URL,
  };
}
