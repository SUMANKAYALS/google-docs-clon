import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  transpilePackages: ["react-color", "lodash-es"],
  output: "standalone",
  serverExternalPackages: ["mongoose", "mongodb", "html-to-docx", "ioredis"],
  webpack: (config, { isServer, webpack }) => {
    // Handle "node:" URI scheme imports (e.g. node:diagnostics_channel, node:dns, node:events)
    if (webpack && webpack.NormalModuleReplacementPlugin) {
      config.plugins.push(
        new webpack.NormalModuleReplacementPlugin(/^node:/, (resource: { request: string }) => {
          resource.request = resource.request.replace(/^node:/, "");
        })
      );
    }

    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        encoding: false,
        fs: false,
        net: false,
        tls: false,
        dns: false,
        child_process: false,
        diagnostics_channel: false,
        async_hooks: false,
      };
    }

    return config;
  },
};

export default nextConfig;