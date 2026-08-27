import type { NextConfig } from "next";

const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "X-DNS-Prefetch-Control", value: "on" },
];

/** Mounted under Command Center at /apps/tableflow (same auth + URL). */
const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";

const frameAncestors =
  "'self' https://reawakencommandcenter.com https://*.reawakencommandcenter.com https://reawakenusa.org https://*.reawakenusa.org http://localhost:*";

const nextConfig: NextConfig = {
  ...(basePath ? { basePath } : {}),
  async headers() {
    return [
      {
        source: "/embed/:path*",
        headers: [
          ...securityHeaders,
          {
            key: "Content-Security-Policy",
            value: `frame-ancestors ${frameAncestors}`,
          },
        ],
      },
      {
        // Allow Command Center Tools iframe; block other framing of the app shell.
        source: "/((?!embed).*)",
        headers: [
          ...securityHeaders,
          {
            key: "Content-Security-Policy",
            value: `frame-ancestors ${frameAncestors}`,
          },
        ],
      },
    ];
  },
};

export default nextConfig;
