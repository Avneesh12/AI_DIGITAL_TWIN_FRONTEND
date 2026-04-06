import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  output: "standalone",  // ← add this
  typedRoutes: true,     // ← moved out of experimental
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