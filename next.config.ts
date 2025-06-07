import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Enable React Strict Mode in dev & prod
  reactStrictMode: true,

  // Don’t fail the production build because of ESLint errors.
  // You can still run `next lint` locally or in a separate CI step.
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
