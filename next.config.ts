import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  experimental: {
    typedRoutes: true,
  },
  // Proxy API requests in development so the browser doesn't deal with CORS
  async rewrites() {
    return process.env.NODE_ENV === "development"
      ? [
          {
            source: "/api/v1/:path*",
            destination: `${process.env.API_URL ?? "http://localhost:8000"}/api/v1/:path*`,
          },
        ]
      : [];
  },
};

export default nextConfig;
