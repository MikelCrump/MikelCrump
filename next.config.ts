import type { NextConfig } from "next";

const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
];

/** Mounted under Command Center at /apps/communications (same pattern as Tables). */
const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";

const frameAncestors =
  "'self' https://reawakencommandcenter.com https://*.reawakencommandcenter.com https://reawakenusa.org https://*.reawakenusa.org http://localhost:*";

const nextConfig: NextConfig = {
  ...(basePath ? { basePath } : {}),
  async headers() {
    return [
      {
        source: "/:path*",
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
