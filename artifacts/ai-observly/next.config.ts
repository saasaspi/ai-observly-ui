import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // pdfjs-dist and pdf-parse use Node.js fs/path at require-time and reference
  // their own worker files — exclude both from webpack so Next.js loads them
  // natively in the server runtime.
  serverExternalPackages: ["pdf-parse", "pdfjs-dist"],
};

export default nextConfig;
