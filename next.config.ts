import type { NextConfig } from "next";

const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "X-DNS-Prefetch-Control", value: "on" },
];

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: "/embed/:path*",
        headers: [
          ...securityHeaders,
          {
            key: "Content-Security-Policy",
            value:
              "frame-ancestors 'self' https://reawakenusa.org https://*.reawakenusa.org http://localhost:*",
          },
        ],
      },
      {
        source: "/((?!embed).*)",
        headers: [
          ...securityHeaders,
          { key: "X-Frame-Options", value: "DENY" },
        ],
      },
    ];
  },
};

export default nextConfig;
