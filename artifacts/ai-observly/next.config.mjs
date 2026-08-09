/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  allowedDevOrigins: ["*.replit.dev", "*.sisko.replit.dev", "*.pike.replit.dev"],
};

export default nextConfig;
