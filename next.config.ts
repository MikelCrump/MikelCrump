import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
  },
  async redirects() {
    return [
      { source: "/signup", destination: "/start", permanent: true },
      { source: "/events", destination: "/crump360/events", permanent: true },
      {
        source: "/events/:slug",
        destination: "/crump360/events/:slug",
        permanent: true,
      },
      { source: "/learn", destination: "/crump360/learn", permanent: true },
      {
        source: "/learn/:slug",
        destination: "/crump360/learn/:slug",
        permanent: true,
      },
      {
        source: "/learn/:slug/:lessonId",
        destination: "/crump360/learn/:slug/:lessonId",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
