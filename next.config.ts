import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverComponentsExternalPackages: ["@resvg/resvg-js"],
  },
};

export default nextConfig;
