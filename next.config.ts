import type { NextConfig } from "next";

// Server-only (no NEXT_PUBLIC_ prefix): the browser never needs to know where the API lives.
const SERVER_URL = process.env.SERVER_URL ?? "http://localhost:4000";

const nextConfig: NextConfig = {
  // Proxy /api/* to the Express server. To the browser the API is same-origin,
  // so the httpOnly login cookie is sent automatically and CORS never applies.
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${SERVER_URL}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;
