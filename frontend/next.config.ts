import type { NextConfig } from "next";

const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:8000";

const nextConfig: NextConfig = {
  output: "standalone",
  allowedDevOrigins: ['127.0.0.1', 'localhost', '*.ngrok-free.app', '*.ngrok.io'],
  turbopack: {
    root: __dirname,
  },
  async rewrites() {
    return [
      { source: "/api/:path*", destination: `${BACKEND_URL}/api/:path*` },
      { source: "/auth/:path*", destination: `${BACKEND_URL}/auth/:path*` },
      { source: "/spotify/:path*", destination: `${BACKEND_URL}/spotify/:path*` },
    ];
  },
};

export default nextConfig;
