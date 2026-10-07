/** @type {import('next').NextConfig} */
const nextConfig = {
  compress: true,
  poweredByHeader: false,
  trailingSlash: false,
  skipTrailingSlashRedirect: true,
  htmlLimitedBots: /.*/,
  async headers() {
    return [{
      source: "/:path*",
      headers: [
        { key: "Strict-Transport-Security", value: "max-age=31536000; includeSubDomains" },
        { key: "X-Content-Type-Options", value: "nosniff" },
        { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
        // SAMEORIGIN only on deployed canonical hosts; the development preview is embedded by Replit.
      ],
    }, {
      source: "/:path*",
      has: [{ type: "host", value: "(aiobservly\\.com|www\\.aiobservly\\.com|aiobservly\\.replit\\.app)" }],
      headers: [{ key: "X-Frame-Options", value: "SAMEORIGIN" }],
    }, {
      source: "/icons/:path*",
      headers: [{ key: "Cache-Control", value: "public, max-age=86400, stale-while-revalidate=604800" }],
    }];
  },
  async redirects() {
    return [
      { source: "/free-spend-checkup", destination: "/spend-checkup", statusCode: 301 },
      { source: "/free-spend-checkup/:path*", destination: "/spend-checkup", statusCode: 301 },
      { source: "/llm-spend-analyzer", destination: "/spend-checkup", statusCode: 301 },
      { source: "/docs/quick-start", destination: "/docs/getting-started-developer-guide", statusCode: 301 },
      { source: "/landing/features/per-customer-cost-attribution", destination: "/features/per-customer-cost-attribution", statusCode: 301 },
      { source: "/landing/features/per-feature-margins-roi", destination: "/features/per-feature-margins-roi", statusCode: 301 },
      { source: "/landing/features/plan-pricing-profitability", destination: "/features/plan-pricing-profitability", statusCode: 301 },
    ];
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  allowedDevOrigins: ["*.replit.dev", "*.sisko.replit.dev", "*.pike.replit.dev"],
  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "cdn.sanity.io",
      },
    ],
  },
};

export default nextConfig;
