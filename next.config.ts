import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  outputFileTracingIncludes: {
    "/api/**/*": ["./src/life/tesla-command/proto/**/*"],
    "/life/**/*": ["./src/life/tesla-command/proto/**/*"],
  },
};

export default nextConfig;
