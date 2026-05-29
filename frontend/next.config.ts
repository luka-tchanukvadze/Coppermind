import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  outputFileTracingRoot: path.join(process.cwd()),

  // remote book covers from search providers
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "covers.openlibrary.org" },
      { protocol: "http", hostname: "books.google.com" },
      { protocol: "https", hostname: "books.google.com" },
    ],
  },

  async rewrites() {
    const backend = process.env.BACKEND_URL ?? "http://192.168.100.4:5001";
    return [
      { source: "/api/:path*", destination: `${backend}/api/:path*` },
      // proxy socket.io through the dev server so the browser connects to
      // localhost (where the jwt cookie lives) instead of the backend host
      { source: "/socket.io/:path*", destination: `${backend}/socket.io/:path*` },
    ];
  },
};

export default nextConfig;
