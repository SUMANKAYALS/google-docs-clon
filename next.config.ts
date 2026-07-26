import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  transpilePackages: ["react-color", "lodash-es"],
  distDir: process.env.BUILD_DIR || ".next",
};

export default nextConfig;
