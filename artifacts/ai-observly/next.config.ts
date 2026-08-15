import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // pdf-parse uses Node.js fs/path at require-time; exclude it from webpack
  // bundling so Next.js runs it natively in the server runtime.
  serverExternalPackages: ["pdf-parse"],
};

export default nextConfig;
