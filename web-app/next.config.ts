import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  turbopack: {
    root: process.cwd(),
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "cdn.resfu.com",
      },
      {
        protocol: "https",
        hostname: "www.playmakerstats.com",
      },
      {
        protocol: "https",
        hostname: "www.besoccer.com",
      },
      {
        protocol: "https",
        hostname: "img.besoccer.com",
      },
    ],
  },
  // iOS requires the Apple App Site Association file to be served as JSON.
  async headers() {
    return [
      {
        source: "/.well-known/apple-app-site-association",
        headers: [{ key: "Content-Type", value: "application/json" }],
      },
    ]
  },
}

export default nextConfig
